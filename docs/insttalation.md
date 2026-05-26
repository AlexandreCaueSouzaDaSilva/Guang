# Installation

## Pré-requisitos

- Node.js 22.14.0
- npm ou pnpm
- Ionic CLI 7.2.1
- Angular CLI 21.2.2

## Clonando o repositório

```bash
git clone https://github.com/AlexandreCaueSouzaDaSilva/Guang.git
cd guang
```

## Frontend

Entre na pasta do frontend:

```bash
cd Guang-main/Frontend/Guang
```

Instale as dependências:

```bash
npm install
```

Rode o projeto:

```bash
ionic serve
```

ou

```bash
ng serve
```

Acesse em `http://localhost:8100`

## Backend

O backend está hospedado no **Railway** e sobe automaticamente.

## Variáveis de Ambiente

Na pasta `src/environments/`, configure os arquivos conforme o ambiente:

- `environment.ts` — desenvolvimento
- `environment.prod.ts` — produção