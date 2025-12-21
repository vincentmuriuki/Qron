<p align="center">
  <h1 align="center">Qron ⏳</h1>
  <p align="center">
    <b>Time-travel for your API requests.</b>
    <br />
    The enterprise-ready scheduler for serverless architectures (Vercel, Netlify, Cloudflare Workers).
  </p>
</p>

<p align="center">
  <a href="#-key-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-dashboard">Dashboard</a> •
  <a href="#-security--authentication">Security</a> •
  <a href="#-api-reference">API Reference</a>
</p>

---

## ⚡ The Problem
Serverless functions are stateless and ephemeral. They sleep when not in use. This makes it impossible to say: *"Send this user a reminder email in 2 days"* or *"Retry this webhook in 5 minutes"* without setting up complex infrastructure like AWS Step Functions or reliable cron jobs.

## 🛠 The Solution: Qron
**Qron** is a robust, self-hostable microservice that handles time. You give it a URL and a delay; it hits that URL when the time comes. 

It is designed for high-performance and security, featuring a hybrid **Redis + Postgres** architecture for ultra-fast validation and persistent storage.

### ✨ Key Features
- **🎯 Precise Scheduling:** Delay requests by milliseconds, minutes, or days.
- **🔌 Method Agnostic:** Supports `POST`, `GET`, `PUT`, `DELETE`, and `PATCH`.
- **📊 Admin Dashboard:** Built-in UI to visualize queues, active jobs, and failures in real-time.
- **🛡️ Enterprise Security:** Hashed API Keys stored in Postgres, cached in Redis for <5ms validation.
- **👀 Observability:** Query the status of any job (`waiting`, `active`, `completed`, `failed`) via API.
- **💪 Bulletproof Retries:** Automatic exponential backoff for failed target endpoints.

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose

### Installation
Qron ships with everything you need (App, Redis, Postgres) in a single compose file.

1.  **Clone the repo**
    ```bash
    git clone https://github.com/vincentmuriuki/Qron.git
    ```

2.  **Enter directory**
    ```bash
    cd qron
    ```

3.  **Start the engine**
    ```bash
    docker-compose up -d
    ```

The system is now live:
- **API:** `http://localhost:3000`
- **Dashboard:** `http://localhost:3000/admin/queues`

---

## 🖥 Dashboard
Qron comes with a powerful UI to manage your background jobs. Access it at `/admin/queues`.

**Tip:** You can manually "Promote" delayed jobs in the dashboard to test them immediately without waiting.

---

## 🔐 Security & Authentication
Qron uses a Hashed Key architecture.
- Keys are generated and shown **once**.
- They are SHA-256 hashed and stored in Postgres (for durability).
- They are synced to Redis (for performance).

All requests to the scheduler must include the `x-api-key` header.

### Generating Keys (Admin Only)
To create keys for your clients, use your Master Key (defined in `.env` as `API_KEY`).

```bash
curl -X POST http://localhost:3000/auth/keys \
  -H "x-api-key: YOUR_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "client": "My Startup" }'
```
> Returns a new API Key (e.g., `sk_live_...`). Save this! It is never shown again.

---

## 📡 API Reference

### 1. Schedule a Job
`POST /schedule`

**Headers**
- `x-api-key`: `<your_client_key>`

**Body**
```json
{
  "targetUrl": "https://api.myapp.com/webhooks/payment-retry",
  "method": "POST",
  "delay": 600000, 
  "headers": {
    "Authorization": "Bearer my-target-token"
  },
  "payload": {
    "userId": "user_123",
    "action": "retry_payment"
  }
}
```

| Field       | Type    | Description                                                 |
|-------------|---------|-------------------------------------------------------------|
| `targetUrl` | String  | The URL Qron will hit when the timer expires.               |
| `delay`     | Integer | Time to wait in milliseconds (e.g. `60000` = 1 min).      |
| `method`    | String  | `GET`, `POST`, `PUT`, `DELETE`, etc.                        |
| `headers`   | Object  | Optional headers to send to the target (e.g. Auth tokens).  |
| `payload`   | Object  | The body (for POST) or query params (for GET).              |

### 2. Check Job Status
`GET /schedule/:id`

**Headers**
- `x-api-key`: `<your_client_key>`

**Returns** the realtime status of a job.
```json
{
  "id": "12",
  "state": "completed",
  "result": { "status": 200, "data": "OK" },
  "finishedAt": "2023-10-25T10:00:00Z"
}
```

### 3. Revoke an API Key
`DELETE /auth/keys/:id`

**Headers**
- `x-api-key`: `<your_master_key>`

> Instantly invalidates the key in both Postgres and Redis.

---

## 🏗 Architecture
Qron is built on a high-availability architecture:
- **Framework:** NestJS (Node.js)
- **Queue Engine:** Bull
- **Database:** PostgreSQL (via Prisma)
- **Cache:** Redis (via IORedis)

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
[MIT](https://choosealicense.com/licenses/mit/)