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

const kafka = new Kafka({
  brokers: [process.env.KAFKA_HOST],
  clientId: clientId,
});

const consumer = kafka.consumer({ groupId: consumerGroupId });

async function run() {
  let serviceId = `consumer-${kafkaTopic}`;

  const socket = io("http://localhost:3000", {
    extraHeaders: {
      conntype: "consumer",
      clientId: serviceId
    }
  });

  await consumer.connect();

  await consumer.subscribe({
    topic: kafkaTopic,
    fromBeginning: true
  });
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      let msgLog = `${serviceId} mensagem recebida: ${message.value};`
      socket.emit('message', msgLog);
      console.log(msgLog);
    }
  });
}

run().catch(console.error);