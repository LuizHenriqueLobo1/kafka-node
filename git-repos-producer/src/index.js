import { Kafka, CompressionTypes } from "kafkajs";
import { Octokit } from '@octokit/rest';
import { config } from 'dotenv';
import { io } from 'socket.io-client';

// realiza a leitura das variaveis de ambiente
config();

// inicializa a api do github
const octokit = new Octokit({ auth: process.env.GITHUB_ACCESSTOKEN });

// inicializa as configurações gerais do kafka
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_HOST],
});

// cria uma instância de um produtor
const producer = kafka.producer();
producer.connect();

async function run () {
  let kafkaTopic = process.argv[2] || process.env.KAFKA_TOPIC;
  let serviceId = `producer-${kafkaTopic}`;
  let currentPage = 1;

  const socket = io("http://localhost:3000", {
    extraHeaders: {
      conntype: "producer",
      clientId: serviceId
    }
  });
  
  let intervalId = setInterval(async () => {
    // docs:  https://docs.github.com/pt/rest/search?apiVersion=2022-11-28#search-repositories
    //        https://docs.github.com/pt/rest/search?apiVersion=2022-11-28
    
    octokit.search.repos({ q: `language:${kafkaTopic}`, per_page: 10, page: currentPage })
      .then(({ data }) => {
        data.items.forEach(async item => {
          await producer.send({
            topic: kafkaTopic,
            compression: CompressionTypes.GZIP,
            messages: [ { value: item.name }],
          });
        });

        let msg = `${serviceId} ${data.items.length} itens enviados para ${kafkaTopic}`;
        socket.emit('message', msg);
        console.log(msg);
      })
      .catch(async error => {
        socket.emit('message', `${serviceId} apresentou um erro`);
        console.error(error);

        await producer.disconnect();
        clearInterval(intervalId);
      });

      if (currentPage == 100) {
        let msg = `${serviceId} limite de requisições atingido. Reiniciando.`;
        socket.emit('message', msg);
        console.log(msg);
        currentPage = 1;
        return;
      }

      currentPage++;
  }, 7000);
};

run().catch(console.error);