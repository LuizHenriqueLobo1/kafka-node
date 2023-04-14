import { Kafka, CompressionTypes } from "kafkajs";
import { Octokit } from '@octokit/rest';
import { config } from 'dotenv';

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
  setInterval(async () => {
    // docs: https://docs.github.com/pt/rest/search?apiVersion=2022-11-28#search-repositories
    octokit.search.repos({ q: `language:${process.env.KAFKA_TOPIC}` })
      .then(({ data }) => {
        console.log('encontrados ', data.items.length, 'repositorios');
  
        data.items.forEach(async item => {
          await producer.send({
            topic: process.env.KAFKA_TOPIC,
            compression: CompressionTypes.GZIP,
            messages: [ { value: item.name }],
          });
  
          console.log('repositorio', item.name, 'enviado pelo kafka');
        });
      })
      .catch(async error => {
        console.error(error);
        await producer.disconnect();
      });
  }, 1000);
}

run().catch(console.error);