import express from "express";
import { Kafka } from "kafkajs";

const app = express();

const kafka = new Kafka({
  clientId: 'kafka-node',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'test-group-2' });

async function consumeHelloWorld() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'animals', fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Topic: ${topic}; Partition: ${partition}; Message: ${message.value};`);
    }
  });
}

consumeHelloWorld();

app.listen(3001, () => {
  console.log("Servidor aberto na porta 3001! (Animals)");
});
