# spa-base-quasar-frontend

SPA base em Quasar (Vue 3 + Vite + TypeScript), rodando **somente em Docker** no desenvolvimento.

Backend API (repositório separado): Laravel em `http://localhost:8097`.

## Pré-requisitos

- Docker + Docker Compose
- Git
- Backend Laravel rodando em `:8097`

Não é necessário Node/npm no host para o fluxo diário.

## Portas (dev)

| Serviço           | Host                  |
| ----------------- | --------------------- |
| Quasar (Vite/HMR) | http://localhost:9020 |
| API (outro repo)  | http://localhost:8097 |

## Instalação passo a passo

### 1. Clonar

```bash
git clone git@github.com:brayanmonteiroo/spa-base-quasar-frontend.git
cd spa-base-quasar-frontend
```

### 2. Ambiente

```bash
cp .env.example .env
```

`VITE_API_URL=http://localhost:8097` (URL do browser, não o nome do container).

### 3. Subir o container

```bash
docker compose -f compose.dev.yaml up --build -d
```

### 4. Verificar

Abra http://localhost:9020 — a rota `/` é o login.

Login admin (após `db:seed` no backend):

- E-mail: `admin@spa-base.test`
- Senha: `password`

Com Compose Watch (sync de arquivos):

```bash
docker compose -f compose.dev.yaml watch
```

## Rotas da SPA

| Rota                    | Acesso           |
| ----------------------- | ---------------- |
| `/`                     | Login (guest)    |
| `/forgot-password`      | Recuperar senha  |
| `/reset-password`       | Redefinir senha  |
| `/admin/dashboard`      | Autenticado      |
| `/admin/users`          | CRUD de usuários |
| `/admin/users/create`   | Criar usuário    |
| `/admin/users/:id/edit` | Editar usuário   |

Guards: guest autenticado → `/admin/dashboard`; `/admin/*` sem sessão → `/`.

## Auth (Axios + Sanctum + Pinia)

- Boots: `pinia`, `axios`, `auth` em `quasar.config.ts`
- Axios com `withCredentials` e `withXSRFToken`
- Store `src/stores/auth.ts`: CSRF, login, logout, `fetchUser`
- Interceptor: `401`/`419` limpa sessão e redireciona para login

## Comandos úteis

```bash
# Logs
docker compose -f compose.dev.yaml logs -f

# Shell no container
docker compose -f compose.dev.yaml exec quasar sh

# Lint / typecheck (dentro do container)
docker compose -f compose.dev.yaml exec quasar npm run lint
docker compose -f compose.dev.yaml exec quasar npm run typecheck

# Parar
docker compose -f compose.dev.yaml down
```

## Estrutura Docker

```text
compose.dev.yaml          # na raiz
.dockerignore
docker/
└── development/
    └── Dockerfile
```

`devServer` em `quasar.config.ts`: host `0.0.0.0`, porta `9020`, polling (HMR estável com volume Docker).

## Stack

- Quasar 2 + `@quasar/app-vite` v3
- Vue 3 Composition API (`<script setup>`)
- TypeScript
- Axios + Pinia (auth SPA)
- oxlint + oxfmt

## Observações

- Não versionar `.env` (já no `.gitignore`).
- `VITE_API_URL` é lido no browser — use a URL do host (`localhost:8097`).
