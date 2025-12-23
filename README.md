# Painel de Envio 1:1

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

Um painel para envio de mensagens em massa (1:1), permitindo a importação de dados de arquivos CSV e Excel, utilizando a API da Comtele.

## Tabela de Conteúdos

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Iniciando o Projeto](#iniciando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)

## Visão Geral

Este projeto é uma aplicação web que consiste em um frontend construído com React e Vite, e um backend com Node.js/Express. Ele permite que os usuários enviem mensagens SMS para uma lista de destinatários, com cada destinatário recebendo uma mensagem correspondente.

A aplicação foi desenhada para ser simples e eficiente, com uma interface clara para colar ou importar dados e enviar as mensagens em lotes.

## Funcionalidades

-   [x] Envio de mensagens individuais para múltiplos destinatários via Comtele.
-   [x] Importação de dados (destinatários e mensagens) a partir de arquivos `.csv` e `.xlsx`.
-   [x] Processamento de arquivos no frontend para feedback imediato.
-   [x] Validação de dados (garante que cada destinatário tenha uma mensagem).
-   [x] Pré-visualização dos 5 primeiros pares de dados antes do envio.
-   [x] Feedback em tempo real sobre o status do envio para cada item.

## Tecnologias Utilizadas

-   **Frontend:**
    -   React 19
    -   Vite
    -   PapaParse (para parsing de CSV)
    -   SheetJS/xlsx (para parsing de Excel)
-   **Backend:**
    -   Node.js
    -   Express.js
-   **Ferramentas de Desenvolvimento:**
    -   ESLint
    -   Concurrently (para rodar frontend e backend simultaneamente)

## Iniciando o Projeto

Siga os passos abaixo para configurar e rodar o projeto em seu ambiente local.

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18.x ou superior recomendada)
-   npm (geralmente vem com o Node.js)

### Instalação

<details>
<summary>Clique para ver os comandos de instalação</summary>

1.  Clone o repositório (se ainda não o fez):
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd painel-envio
    ```

2.  Instale as dependências do projeto principal (frontend):
    ```bash
    npm install
    ```

3.  Instale as dependências do servidor:
    ```bash
    cd server
    npm install
    cd ..
    ```

</details>

### Configuração do Ambiente

<details>
<summary>Clique para ver as instruções de configuração</summary>

1.  Navegue até o diretório `server`.
2.  Crie um novo arquivo chamado `.env`.
3.  Adicione as variáveis de ambiente necessárias. A principal é a chave da API da Comtele.

    ```dotenv
    # server/.env
    COMTELE_AUTH_KEY="SUA_CHAVE_API_AQUI"
    ```
    > **Nota:** O nome da variável de ambiente no código é `COMTELE_AUTH_KEY`.

</details>

### Rodando a Aplicação

1.  Na raiz do projeto, execute o comando:
    ```bash
    npm run dev
    ```
2.  Isso iniciará o servidor de desenvolvimento do Vite (frontend) e o servidor da API (backend) simultaneamente.
3.  Abra seu navegador e acesse `http://localhost:5173` (ou a porta indicada no terminal).

## Estrutura do Projeto

```
.
├── server/         # Código do backend (Node.js API)
│   ├── .env        # Arquivo de variáveis de ambiente (local)
│   ├── index.js    # Ponto de entrada do servidor
│   └── package.json
├── src/            # Código do frontend (React)
│   ├── App.jsx     # Componente principal da aplicação
│   └── main.jsx    # Ponto de entrada do React
├── README.md       # Este arquivo
└── package.json    # Dependências e scripts do frontend
```
