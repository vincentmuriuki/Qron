<p align="center">
  <h1 align="center">Qron ⏳</h1>
  <p align="center">
    <b>Time-travel for your API requests.</b>
    <br />
    The missing scheduler for serverless architectures (Vercel, Netlify, Cloudflare Workers).
  </p>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## ⚡ The Problem
Serverless functions are stateless and ephemeral. They sleep when not in use. This makes it impossible to say: *"Send this user a reminder email in 2 days"* or *"Retry this webhook in 5 minutes"* without setting up complex infrastructure like AWS Step Functions or reliable cron jobs.

## 🛠 The Solution: Qron
**Qron** is a lightweight, self-hostable microservice that handles time. You give it a URL and a delay; it hits that URL when the time comes.

### Key Features
- **🎯 Precise Scheduling:** Delay requests by milliseconds, minutes, or days.
- **🔌 Method Agnostic:** Supports `POST`, `GET`, `PUT`, `DELETE`, and `PATCH`.
- **🛡️ Bulletproof Retries:** If your target endpoint is down, Qron retries automatically with exponential backoff.
- **🧠 Smart Payloads:** Automatically handles JSON bodies (for POST) and Query Params (for GET).
- **🐳 Docker Ready:** Spin it up in seconds with Docker Compose.

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- (Or) Node.js v22+ and a running Redis instance

### Installation
```bash
# 1. Clone the repo
git clone https://github.com/vincentmuriuki/Qron.git

# 2. Enter directory
cd qron

# 3. Start the engine (App + Redis)
docker-compose up -d