import { Kafka, CompressionTypes } from "kafkajs";
import { ANIMALS, COUNTRIES } from "./data.js";

const kafka = new Kafka({
  clientId: 'kafka-node',
  brokers: ['localhost:9092'],
});

setInterval(async () => {
  const topics = [ 'animals', 'countries' ];
  const selectedTopic = topics[Math.floor(Math.random() * 2)];
  const randomNumber = Math.floor(Math.random() * 30);
  const selectedObject = selectedTopic === "animals" ? ANIMALS[randomNumber] : COUNTRIES[randomNumber];
  console.log(selectedObject)
  const producer = kafka.producer();
  await producer.connect();
  const response = await producer.send({
    topic: selectedTopic,
    compression: CompressionTypes.GZIP,
    messages: [ { value: selectedObject }],
  });
  console.log(response);
  await producer.disconnect();
}, 1000);
