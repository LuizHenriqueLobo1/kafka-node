<h1 align="center">kafka-node</h1>

### Sobre

> Este é um simples projeto implementada em  [Javascript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript) e [Node.js](https://nodejs.org/en) que tem como objetivo mostrar na prática o funcionamento do [Kafka](https://kafka.apache.org/), a aplicação consome a API do [GitHub](https://github.com/) buscando repositórios de linguagens específicas e servindo para a aplicação consumidora.

![Kafka](https://github.com/LuizHenriqueLobo1/kafka-node/assets/71144276/8fe3cb45-06df-41da-b6a1-c3eaedfb3511)

### Producer

O subprojeto nomeado **git-repos-producer** é a aplicação produtora, a mesma faz requisições para a API do [GitHub](https://github.com/) buscando repositórios de linguagens específicas, após o carregamento dos dados recebidos da API, ela distribui para os tópicos criados usando o [Kafka](https://kafka.apache.org/), assim as aplicações consumidoras, podem usar os dados.

### Consumer

O subprojeto nomeado **git-repos-consumer** é a aplicação consumidora, ela se inscreve nos seus tópicos de interesse e consome os dados fornecidos pela aplicação produtra.

### Monitoramento

O subprojeto nomeado **ms-monitor** fornece uma view para monitorar a produção e consumo dos dados, acesse a `localhost:3000` para acessar a aplicação.

### Requisitos

* Você deve possuir o [Docker](https://www.docker.com/) instalado na sua máquina.
* Garanta que o `docker-compose` esteja configurado e acessível.

### Como fazer funcionar?

1. Faça o clone do repositório `git clone https://github.com/luizhenriquelobo1/kafka-node`
2. Execute `docker-compose up` para subir o projeto
3. Caso queira subir em modo detached utilize a flag `-d`
4. Feito! :D

### Outros

O projeto também disponibiliza o acesso ao **Confluentinc Control Center**, serviço que oferece um centro de controle e monitoramento da sua instância [Kafka](https://kafka.apache.org/), no painel você poderá observar várias métricas geradas pelo tráfego dos dados da aplicação, acesse `localhost:9021` para utilizar o dashboard.

---

<p align="center">
  Made by <a href="https://github.com/luizhenriquelobo1/" target="_blank">Luiz Henrique Lobo</a> and <a href="https://github.com/davirmsousa" target="_blank">Davi Rocha</a>
</p>
