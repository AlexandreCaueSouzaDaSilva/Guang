# Guang Project

## Visão Geral

O **Guang** é um aplicativo mobile de bloco de notas com sistema OCR (reconhecimento óptico de caracteres), permitindo ao usuário capturar texto a partir de imagens. O app também conta com tradução de conteúdo para mais de 10 idiomas, organização por notebooks e personalização da interface.


## Funcionalidades

### Notebooks & Notas
- Criação de notebooks para organizar as notas
- Dentro de cada notebook, criação de cards (blocos de notas)
- Edição e visualização do conteúdo das notas

### OCR — Captura de Texto em Imagens
- Também conhecido como *Convert Image to Text* ou *Escaneador de Texto*
- Extrai texto automaticamente a partir de imagens capturadas pelo usuário
- Integrado com a **Gemini API** do Google para processamento de OCR

### Tradução de Texto
- Tradução do conteúdo das notas para mais de 10 idiomas
- Requer conexão com a internet

### Autenticação
- Cadastro e login com **e-mail e senha**
- Verificação por **PIN de 6 dígitos**

### Configurações do Perfil
- Upload de **foto de perfil**
- **Deslogar** da conta
- **Deletar** conta
- Alternância de **tema escuro (black)**



## Tecnologias Utilizadas

### Frontend
Tecnologia / Versão

- Ionic CLI 7.2.1
- Angular CLI 21.2.2
- TypeScript 6.0.3
- Node.js 22.14.0

### Backend
Tecnologia / Versão

- PHP 8.4.13
- MySQL : abaixo.

> O backend e o banco de dados estão hospedados na plataforma **Railway**.

### API Externa
API : Uso.
- Gemini API (Google AI Studio) | OCR e processamento de imagem


## Arquitetura

```
Guang/
├── Guang-main/                  # Frontend (Ionic + Angular)
│   └── Frontend/Guang/
│       └── src/
│           ├── app/
│           │   ├── home/        # Página inicial
│           │   └── pages/
│           │       └── login/   # Página de login
│           ├── assets/          # Ícones e imagens
│           ├── environments/    # Configurações de ambiente
│           └── theme/           # Variáveis de estilo global
│
└── guang-source/                # Backend + API
└── artifacts/
├── api-server/          # Servidor da API (TypeScript)
│   └── src/
│       ├── routes/      # Rotas da API
│       │   ├── auth.ts
│       │   ├── notebooks.ts
│       │   ├── notes.ts
│       │   ├── ocr.ts
│       │   ├── translate.ts
│       │   └── user.ts
│       └── middlewares/
│           └── auth.ts  # Autenticação JWT
└── guang-app/           # App principal (React + Capacitor)
└── src/
└── pages/
├── login.tsx
├── register.tsx
├── home.tsx
├── notebooks.tsx
├── notebook.tsx
├── config.tsx
├── recovery.tsx
└── resultado.tsx
```

---

## Requisitos

- Dispositivo mobile (Android ou iOS)
- Conexão com a internet (para OCR e tradução)
- Conta cadastrada no app

---

## Observações

- O tema escuro (**black**) pode ser ativado nas configurações do perfil
- A tradução e o OCR dependem de conexão ativa com a internet
- O PIN de 6 dígitos é exigido como segunda camada de autenticação no login


Extra:
- As outras documentações mais detalhadas se encontram em /GUANG/docs