# API Documentation

## Base URL

```
Nao foi colcoada porque aguardamos um link mais correto.
```

## Autenticação

As rotas protegidas requerem um token JWT no header da requisição:

```
Authorization: Bearer {token}
```

---

## Rotas

### Auth

#### POST /auth/register
Cadastro de novo usuário.

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "pin": "123456"
}
```

#### POST /auth/login
Login do usuário.

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "pin": "123456"
}
```

**Retorno:**
```json
{
  "token": "jwt_token_aqui"
}
```

#### POST /auth/recovery
Recuperação de senha.

**Body:**
```json
{
  "email": "usuario@email.com"
}
```

---

### Notebooks

#### GET /notebooks
Lista todos os notebooks do usuário autenticado.

#### POST /notebooks
Cria um novo notebook.

**Body:**
```json
{
  "name": "Meu Notebook"
}
```

#### DELETE /notebooks/:id
Remove um notebook pelo ID.

---

### Notes

#### GET /notes
Lista todas as notas. Pode filtrar por notebook.

**Query params:**
```
?notebookId=1
```

#### POST /notes
Cria uma nova nota.

**Body:**
```json
{
  "title": "Minha Nota",
  "content": "Conteúdo da nota",
  "notebookId": 1
}
```

#### PUT /notes/:id
Atualiza uma nota existente.

**Body:**
```json
{
  "title": "Título atualizado",
  "content": "Conteúdo atualizado"
}
```

#### DELETE /notes/:id
Remove uma nota pelo ID.

---

### OCR

#### POST /ocr
Envia uma imagem e retorna o texto extraído via Gemini API.

**Body:**
```json
{
  "image": "base64_da_imagem"
}
```

**Retorno:**
```json
{
  "text": "Texto extraído da imagem"
}
```

---

### Translate

#### POST /translate
Traduz um texto para o idioma especificado.

**Body:**
```json
{
  "text": "Texto a ser traduzido",
  "language": "en"
}
```

**Retorno:**
```json
{
  "translatedText": "Translated text here"
}
```

---

### User

#### GET /user
Retorna os dados do usuário autenticado.

#### PUT /user
Atualiza os dados do usuário.

**Body:**
```json
{
  "photo": "base64_da_foto"
}
```

#### DELETE /user
Deleta a conta do usuário autenticado.

---

### Health

#### GET /health
Verifica se a API está online.

**Retorno:**
```json
{
  "status": "ok"
}
```