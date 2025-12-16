# Docker Deployment Guide

Run Lemberg Fuel Corp. entirely outside of Replit using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Stripe account with API keys
- Twilio account for SMS verification (optional)

## Quick Start

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables in `.env`:**
   - `POSTGRES_PASSWORD` - Set a secure database password
   - `SESSION_SECRET` - Generate a random string (e.g., `openssl rand -hex 32`)
   - `STRIPE_SECRET_KEY` - From Stripe Dashboard > Developers > API Keys
   - `STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard > Developers > API Keys
   - `STRIPE_WEBHOOK_SECRET` - Create a webhook endpoint in Stripe Dashboard pointing to `https://your-domain/api/stripe/webhook`
   - `TWILIO_*` - Optional, for phone SMS verification

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   docker-compose run --rm migrate
   ```

5. **Access the application:**
   Open `http://localhost:5000` in your browser.

## Services

| Service    | Port | Description              |
|------------|------|--------------------------|
| backend    | 5000 | Express API + Frontend   |
| postgres   | 5432 | PostgreSQL database      |

## Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (deletes database)
docker-compose down -v

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d
```

## Stripe Webhook Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain/api/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET` in your `.env`

## Production Notes

- Use a reverse proxy (nginx/traefik) for HTTPS
- Set strong passwords in `.env`
- Consider using Docker secrets for sensitive values
- Enable PostgreSQL backups for the `postgres_data` volume
