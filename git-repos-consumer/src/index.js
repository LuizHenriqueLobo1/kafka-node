import { Kafka } from "kafkajs";
import { config } from 'dotenv';
import { io } from 'socket.io-client';

// realiza a leitura das variaveis de ambiente
config();

// inicializa as configurações gerais do kafka
const kafkaTopic = process.argv[2] || process.env.KAFKA_TOPIC;

const clientId = process.env.KAFKA_CLIENT_ID
  .replace('topic', kafkaTopic)
  .replace('timestamp', (new Date()).getTime());

const consumerGroupId = process.env.KAFKA_GROUP_ID
  .replace('topic', kafkaTopic);

const serviceId = `consumer-${kafkaTopic}`;

console.log(`${serviceId} iniciando cliente kafka`);
const kafka = new Kafka({
  brokers: [process.env.KAFKA_HOST],
  clientId: clientId,
  retry: { retries: 10 }
});

console.log(`${serviceId} criando instancia de consumer`);
const consumer = kafka.consumer({ groupId: consumerGroupId });

async function run() {

  const socket = io("http://localhost:3000", {
    extraHeaders: {
      conntype: "consumer",
      clientId: serviceId
    }
  });

  console.log(`${serviceId} criando o topico`);
  await createTopic();

  console.log(`${serviceId} conectando o consumer`);
  await consumer.connect();

  console.log(`${serviceId} inscrevendo no topico`);
  await consumer.subscribe({
    topic: kafkaTopic,
    fromBeginning: true
  });
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      log(socket, `INFO mensagem recebida: ${message.value}`);
    }
  });
};

async function createTopic() {
  console.log(`${serviceId} criando instancia de admin`);
  const admin = kafka.admin();

  console.log(`${serviceId} conectando admin`);
  await admin.connect();

  console.log(`${serviceId} criando topico`);
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

  console.log(`${serviceId} desconectando admin`);
  await admin.disconnect();
}

function log(socket, msg) {
  msg = `${serviceId} ${(new Date()).toLocaleString()} ${msg}`;
  socket && socket.emit('message', msg);
  console.log(msg);
};

run().catch(console.error);