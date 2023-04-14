import { Kafka } from "kafkajs";
import { config } from 'dotenv';

// realiza a leitura das variaveis de ambiente
config();

// inicializa as configurações gerais do kafka
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_HOST],
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });

async function run() {
  await consumer.connect();

  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC,
    fromBeginning: true
  });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Topic: ${topic}; Partition: ${partition}; Message: ${message.value};`);
    }
  });
}

run().catch(console.error);