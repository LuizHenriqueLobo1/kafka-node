import { Kafka, CompressionTypes } from "kafkajs";
import { Octokit } from '@octokit/rest';
import { config } from 'dotenv';
import { io } from 'socket.io-client';

// realiza a leitura das variaveis de ambiente
config();

// inicializa a api do github
const octokit = new Octokit({ auth: process.env.GITHUB_ACCESSTOKEN });

// inicializa as configurações gerais do kafka
const kafkaTopic = process.argv[2] || process.env.KAFKA_TOPIC;

const clientId = process.env.KAFKA_CLIENT_ID
  .replace('topic', kafkaTopic);

const serviceId = `producer-${kafkaTopic}`;

const kafka = new Kafka({
  brokers: [process.env.KAFKA_HOST],
  clientId: clientId,
});

// cria uma instância de um produtor
const producer = kafka.producer();
await producer.connect();

async function run () {
  // producers running * good timeout for 1 producer 
  const intervalTimeOut = 2 * 7000;

  const requestPerPage = 10;
  const requestMaxItemsToFetch = 1000;
  const requestMaxPages = Math.floor(requestMaxItemsToFetch / requestPerPage);
  let currentPage = 1;

  const socket = io("http://localhost:3000", {
    extraHeaders: {
      conntype: "producer",
      clientId: serviceId
    }
  });

  await createTopic();
  
  let intervalId = setInterval(async () => {
    // docs:  https://docs.github.com/pt/rest/search?apiVersion=2022-11-28#search-repositories
    //        https://docs.github.com/pt/rest/search?apiVersion=2022-11-28
    
    octokit.search.repos({ q: `language:${kafkaTopic}`, per_page: requestPerPage, page: currentPage })
      .then(({ data }) => {
        data.items.forEach(async item => {
          await producer.send({
            topic: kafkaTopic,
            compression: CompressionTypes.GZIP,
            messages: [ { value: item.name }],
          });
        });

        log(socket, `INFO ${data.items.length} itens enviados para ${kafkaTopic}`);
      })
      .catch(async error => {
        log(socket, `ERROR apresentou um erro`);
        await producer.disconnect();
        clearInterval(intervalId);
      });

      if (currentPage == requestMaxPages) {
        log(socket, `WARN limite de requisições atingido. Reiniciando`);
        currentPage = 1;
        return;
      }

      currentPage++;
  }, intervalTimeOut);
};

async function createTopic() {
  const admin = kafka.admin();
  await admin.connect();

  await admin.createTopics({
    timeout: 10000,
    validateOnly: false,
    waitForLeaders: true,
    topics: [
      {
        topic: kafkaTopic,
        replicationFactor: 1,
        numPartitions: 1
      }
    ],
  });

  await admin.disconnect();
}

function log(socket, msg) {
  msg = `${serviceId} ${(new Date()).toLocaleString()} ${msg}`;
  socket && socket.emit('message', msg);
  console.log(msg);
};

run().catch(console.error);