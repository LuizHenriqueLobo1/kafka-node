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

const kafka = new Kafka({
  brokers: [process.env.KAFKA_HOST],
  clientId: clientId,
});

const consumer = kafka.consumer({ groupId: consumerGroupId });
await consumer.connect();

async function run() {

  const socket = io("http://localhost:3000", {
    extraHeaders: {
      conntype: "consumer",
      clientId: serviceId
    }
  });

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

function log(socket, msg) {
  msg = `${serviceId} ${(new Date()).toLocaleString()} ${msg}`;
  socket && socket.emit('message', msg);
  console.log(msg);
};

run().catch(console.error);