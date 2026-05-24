# THERAPi

**THERAPi** is a full-stack web application that provides AI-assisted mental health support. Users can register, sign in, create therapy chat sessions, and converse with an AI therapist powered by **Azure OpenAI Assistants API**.

The repository contains a **.NET 8 backend API** and an **Angular 19 frontend**, deployed with the API hosted on Azure App Service.

---

## Features

- **User authentication** — Registration and login with JWT bearer tokens
- **Therapy sessions** — Named chat sessions mapped to Azure OpenAI threads
- **AI chat** — Send messages and receive assistant responses with a typing-style UI
- **Session history** — List and reopen past sessions from the sidebar
- **Responsive UI** — Mobile, tablet, and desktop layouts with Angular Material
- **Purchase UI** — Subscription and session purchase screens (front-end placeholder; payment not wired)

---

## Repository structure

```
Main Therapi App/
├── README.md                          # This file
├── SYSTEM_DESIGN.md                   # Architecture, diagrams, and API reference
├── MainTherapi_Backend/
│   └── therapi/
│       ├── AiTherapy.sln
│       └── AiTherapy/                 # ASP.NET Core 8 Web API
│           ├── Controller/
│           ├── Services/
│           ├── Entities/
│           ├── Migrations/
│           └── Dockerfile
└── MainTherapi_Frontend/
    └── Therapi FrontEnd/              # Angular 19 app (project name: AIC)
        ├── src/app/
        └── build/api/                 # OpenAPI-generated TypeScript client
```

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Angular 19, Angular Material, Bootstrap 5, RxJS, SCSS |
| **Backend** | ASP.NET Core 8, Entity Framework Core 8, Swagger |
| **Database** | MySQL 8 (Pomelo.EntityFrameworkCore.MySql) |
| **Auth** | JWT Bearer |
| **AI** | Azure OpenAI Assistants API; optional DeepSeek integration |
| **Tooling** | Docker, OpenAPI Generator |

For diagrams, data models, and sequence flows, see **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)**.

---

## Prerequisites

Before running locally, install:

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | 18+ (LTS recommended) |
| [npm](https://www.npmjs.com/) | Comes with Node.js |
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0 |
| [MySQL](https://www.mysql.com/) | 8.x (local or remote instance) |

Optional:

- [Docker](https://www.docker.com/) — for containerized API deployment
- [Angular CLI](https://angular.dev/tools/cli) — `npm install -g @angular/cli@19`

You also need:

- An **Azure OpenAI** resource with Assistants API access
- A configured **assistant** in Azure (the backend uses a fixed assistant ID in `AzureAiServices`)

---

## Getting started

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Main Therapi App"
```

### 2. Backend setup

```bash
cd MainTherapi_Backend/therapi/AiTherapy
```

Create or update `appsettings.Development.json` (or use [User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)) with your values:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;port=3306;user=YOUR_USER;password=YOUR_PASSWORD;database=aitherapi;"
  },
  "AzureOpenAI": {
    "Endpoint": "https://YOUR-RESOURCE.openai.azure.com/",
    "Key": "YOUR_AZURE_OPENAI_KEY",
    "Model": "your-deployment-name"
  },
  "JwtOptions": {
    "SecurityKey": "YOUR_LONG_RANDOM_SECRET_KEY",
    "Issuer": "AiTherapi",
    "Audience": "AiTherapi"
  }
}
```

Apply database migrations:

```bash
dotnet ef database update
```

Run the API:

```bash
dotnet run
```

| Profile | URL |
|---------|-----|
| HTTP | http://localhost:5048 |
| HTTPS | https://localhost:7064 |
| Swagger UI | `/swagger` (e.g. https://localhost:7064/swagger) |

### 3. Frontend setup

```bash
cd "MainTherapi_Frontend/Therapi FrontEnd"
npm install
```

Point the app at your local API by editing `src/app/app.config.ts`:

```typescript
export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: 'https://localhost:7064',  // or http://localhost:5048
    apiKeys: { bearer: '' },
  };
  return new Configuration(params);
}
```

Start the dev server:

```bash
npm start
# or: ng serve
```

Open **http://localhost:4200** in your browser.

### 4. Regenerate the API client (optional)

When the backend Swagger contract changes, regenerate the TypeScript client:

```bash
cd "MainTherapi_Frontend/Therapi FrontEnd"
npm run generate:api:dev
```

Update the `-i` URL in `package.json` to match your API Swagger endpoint, for example:

```text
http://localhost:5048/swagger/v1/swagger.json
```

---

## Docker (backend)

From `MainTherapi_Backend/therapi/AiTherapy`:

```bash
docker build -t aitherapy-api .
docker run -p 8080:8080 -e ASPNETCORE_URLS=http://+:8080 aitherapy-api
```

Pass connection strings and API keys via environment variables or mounted config in production—do not bake secrets into the image.

---

## Application routes

| Path | Description | Auth required |
|------|-------------|---------------|
| `/` | Landing page | No |
| `/login` | Sign in | No |
| `/sign-up` | Register | No |
| `/chat` | AI therapy chat | Yes |
| `/purchase` | Subscriptions & redeem UI | Yes |
| `/profile` | User profile | Yes |

---

## API overview

Base path: `/api`

### Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/Accounts/RegisterUser` | Create account |
| POST | `/api/Accounts/Login` | Login; returns JWT |

### Azure AI (JWT required except where noted)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/AzureAi/CreateThreadAsync?name={name}` | Create therapy session |
| GET | `/api/AzureAi/GetThreads` | List user sessions |
| POST | `/api/AzureAi/CreateMessageAsync?threadId={id}&messageContent={text}` | Send message & get AI reply |
| GET | `/api/AzureAi/GetMessages?threadId={id}` | Load thread messages |
| POST | `/api/AzureAi/CreateAssistant` | Create Azure assistant |
| GET | `/api/AzureAi/GetDeepSeekMessage?userMessage={text}` | DeepSeek chat (anonymous) |

Full API and architecture details: **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)**.

---

## Configuration reference

| Key | Purpose |
|-----|---------|
| `ConnectionStrings:DefaultConnection` | MySQL connection string |
| `AzureOpenAI:Endpoint` | Azure OpenAI base URL |
| `AzureOpenAI:Key` | Azure API key |
| `AzureOpenAI:Model` | Deployment / model name |
| `JwtOptions:SecurityKey` | JWT signing key |
| `JwtOptions:Issuer` | Token issuer |
| `JwtOptions:Audience` | Token audience |

**Security:** Do not commit real secrets to Git. Use `appsettings.Development.json` locally (gitignored), Azure App Service configuration, or environment variables in production. Rotate any keys that were ever committed to source control.

---

## Development notes

- **JWT in frontend:** Tokens are stored in `sessionStorage` under `userData`. The HTTP interceptor attaches `Authorization: Bearer <token>` to API requests.
- **Session ↔ thread:** Each therapy session in MySQL stores an Azure `thread_id`. Message content lives in Azure; the app stores session metadata only.
- **Assistant ID:** Configured in `AzureAiServices` (hardcoded). Create your assistant in Azure and update the ID for your environment.
- **CORS:** The API currently allows all origins (`AllowAll`). Restrict this before production.
- **Purchase flow:** UI exists; backend payment and session quotas are not implemented yet.

---

## Building for production

### Frontend

```bash
cd "MainTherapi_Frontend/Therapi FrontEnd"
npm run build
```

Output: `dist/aic/`

SSR (if enabled):

```bash
npm run serve:ssr:AIC
```

### Backend

```bash
cd MainTherapi_Backend/therapi/AiTherapy
dotnet publish -c Release -o ./publish
```

---

## Troubleshooting

| Issue | Things to check |
|-------|-----------------|
| 401 on chat API | Token expired or missing; log in again; confirm interceptor reads `sessionStorage.userData` |
| CORS errors | API `AllowAll` policy; frontend `basePath` matches API URL and scheme (http vs https) |
| Empty AI replies | Azure assistant ID, API key, and endpoint; check API logs for Azure errors |
| Database errors | MySQL running; connection string; run `dotnet ef database update` |
| Swagger / client mismatch | Regenerate `build/api` after API changes |

---

## Documentation

- **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)** — System architecture, Mermaid diagrams, ER model, sequence flows, security notes, and roadmap

---

## License

No license file is included in this repository. Add a `LICENSE` file and update this section if you open-source or distribute the project.

---

## Disclaimer

THERAPi is an AI-powered support tool and **is not a substitute for professional medical advice, diagnosis, or treatment**. If you are in crisis or need immediate help, contact a qualified mental health professional or emergency services in your region.
