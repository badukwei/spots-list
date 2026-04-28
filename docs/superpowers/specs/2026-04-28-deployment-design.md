# Deployment Design

**Goal:** Deploy spots-list (地點找找看) to production using EC2 (backend) + Cloudflare Pages (frontend) with GitHub Actions CI/CD.

**Architecture:** Frontend on Cloudflare Pages, backend on EC2 behind Cloudflare proxy, Docker image managed via GHCR, automated deploy on push to main.

**Tech Stack:** Amazon Linux 2023, Docker, Nginx, GitHub Actions, GHCR, Cloudflare Pages, Cloudflare DNS

---

## Overall Architecture

```
GitHub (push to main)
    │
    ├── Cloudflare Pages ──→ auto build frontend → findingaspot.org
    │
    └── GitHub Actions
            │ build Docker image
            │ push to GHCR
            │ SSH into EC2
            └─→ EC2 (Amazon Linux 2023, t2.micro, ap-southeast-1)
                    ├── Nginx (port 80) ← Cloudflare proxy
                    └── Docker container (127.0.0.1:3001)
                              └─→ Supabase PostgreSQL
```

**DNS:**
- `findingaspot.org` → Cloudflare Pages
- `api.findingaspot.org` → EC2 Elastic IP (Cloudflare proxied)

**SSL:** Cloudflare Flexible — Cloudflare terminates HTTPS, proxies to EC2 over HTTP port 80. No Certbot needed on EC2.

---

## EC2 Setup

**Software to install:**
- Docker
- Nginx

**Nginx config** (`/etc/nginx/conf.d/api.conf`):
```nginx
server {
    listen 80;
    server_name api.findingaspot.org;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Security Group Inbound rules:**
| Port | Source | Purpose |
|------|--------|---------|
| 22 | 0.0.0.0/0 | SSH (key-only, password auth disabled) |
| 80 | Cloudflare IP ranges | Nginx (via Cloudflare proxy) |

Port 3001 is not exposed — NestJS container binds to `127.0.0.1:3001` only.

**Elastic IP:** Allocate one and bind to this EC2 instance before setting DNS records.

---

## CI/CD Pipeline

### Frontend — Cloudflare Pages
Connect GitHub repo to Cloudflare Pages (one-time setup):
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`
- Environment variable: `VITE_API_URL=https://api.findingaspot.org`

Auto-deploys on every push to main.

### Backend — GitHub Actions

File: `.github/workflows/deploy.yml`

Trigger: push to main (paths: `backend/**`)

Steps:
1. Checkout code
2. Log in to GHCR with `GHCR_TOKEN`
3. Build Docker image from `backend/`
4. Push `ghcr.io/badukwei/spots-list-backend:latest`
5. SSH into EC2 and run:
   ```bash
   docker pull ghcr.io/badukwei/spots-list-backend:latest
   docker stop spots-backend || true
   docker rm spots-backend || true
   docker run -d --restart unless-stopped \
     --name spots-backend \
     --env-file /home/ec2-user/spots/.env \
     -p 127.0.0.1:3001:3001 \
     ghcr.io/badukwei/spots-list-backend:latest
   ```

---

## Environment Variables & Secrets

### GitHub Secrets (set in repo settings)
| Secret | Value |
|--------|-------|
| `GHCR_TOKEN` | GitHub PAT with `write:packages` scope |
| `EC2_HOST` | EC2 Elastic IP |
| `EC2_SSH_KEY` | SSH private key (PEM contents) |
| `DATABASE_URL` | Supabase Session Pooler URL |
| `ALLOWED_ORIGIN` | `https://findingaspot.org` |

### EC2 `.env` file (`/home/ec2-user/spots/.env`)
Written by GitHub Actions on each deploy:
```
DATABASE_URL=<from secret>
ALLOWED_ORIGIN=https://findingaspot.org
```

---

## NestJS CORS Update

`backend/src/main.ts` — restrict CORS to frontend domain in production:
```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGIN ?? '*',
})
```

`ALLOWED_ORIGIN` defaults to `*` in local dev (no `.env` entry needed locally).

---

## Deployment Checklist (one-time setup)

1. Allocate Elastic IP → bind to EC2
2. Add Cloudflare DNS records:
   - `A api.findingaspot.org` → EC2 Elastic IP (proxied, orange cloud on)
3. Connect GitHub repo to Cloudflare Pages, set custom domain `findingaspot.org`
4. SSH into EC2 → install Docker + Nginx → configure Nginx
5. Update EC2 Security Group inbound rules (add Cloudflare IP ranges for port 80)
6. Add all GitHub Secrets to repo
7. Push to main → verify GitHub Actions deploys backend + Cloudflare Pages deploys frontend
