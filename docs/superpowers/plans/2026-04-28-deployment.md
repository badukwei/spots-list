# Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy spots-list to production — frontend on Cloudflare Pages, backend on EC2 with Docker + Nginx, automated via GitHub Actions CI/CD.

**Architecture:** Cloudflare Pages serves the React SPA; GitHub Actions builds the NestJS Docker image, pushes to GHCR, and SSH-deploys to EC2; Nginx on EC2 reverse-proxies to the container; Cloudflare proxies HTTPS for the API subdomain.

**Tech Stack:** Amazon Linux 2023, Docker, Nginx, GitHub Actions, GHCR, Cloudflare Pages, Cloudflare DNS, Supabase

---

## Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/lib/api.ts` | Modify | Use `VITE_API_URL` env var for production API URL |
| `.github/workflows/deploy.yml` | Create | GitHub Actions: build image → push GHCR → SSH deploy |

EC2 config files (created on server, not committed):
- `/etc/nginx/conf.d/api.conf` — Nginx reverse proxy config
- `/home/ec2-user/spots/.env` — backend env vars (written by CI/CD)

---

## Task 1: Frontend — wire up production API URL

**Files:**
- Modify: `frontend/src/lib/api.ts`

Currently `baseURL: '/api'` uses the Vite dev proxy and does not work in a Cloudflare Pages build.
Set it to `import.meta.env.VITE_API_URL` with `/api` fallback so local dev still works unchanged.

- [ ] **Step 1: Update `frontend/src/lib/api.ts`**

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

export default api
```

- [ ] **Step 2: Verify local dev still works**

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` — categories and spots should load normally (Vite proxy still handles `/api`).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat: use VITE_API_URL env var for production API base URL"
```

---

## Task 2: EC2 — Allocate Elastic IP

This is done in the AWS Console. The EC2 currently has an auto-assigned public IP that changes on stop/start — Elastic IP makes it permanent.

- [ ] **Step 1: Allocate Elastic IP**

  1. Go to AWS Console → EC2 → **Elastic IPs** (left sidebar, under Network & Security)
  2. Click **Allocate Elastic IP address**
  3. Keep defaults → click **Allocate**

- [ ] **Step 2: Associate with EC2 instance**

  1. Select the newly allocated IP → **Actions → Associate Elastic IP address**
  2. Resource type: Instance
  3. Instance: select `i-0229f2f711847e337` (AI_Develop_Side_Projects)
  4. Click **Associate**

- [ ] **Step 3: Note the Elastic IP**

  Write it down — you will need it for DNS and GitHub Secrets.
  It looks like `x.x.x.x`.

---

## Task 3: EC2 — Install Docker

SSH into EC2 (use the Elastic IP from Task 2, key: `Mac_AI_Side_Project`):

```bash
ssh -i ~/path/to/Mac_AI_Side_Project.pem ec2-user@<ELASTIC_IP>
```

- [ ] **Step 1: Install Docker**

```bash
sudo dnf install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user
```

- [ ] **Step 2: Re-login so group change takes effect**

Exit the SSH session and reconnect:

```bash
exit
ssh -i ~/path/to/Mac_AI_Side_Project.pem ec2-user@<ELASTIC_IP>
```

- [ ] **Step 3: Verify Docker works**

```bash
docker ps
```

Expected: empty table (no error).

---

## Task 4: EC2 — Install and configure Nginx

Continue in the SSH session.

- [ ] **Step 1: Install Nginx**

```bash
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

- [ ] **Step 2: Create Nginx config for API**

```bash
sudo tee /etc/nginx/conf.d/api.conf > /dev/null << 'EOF'
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
EOF
```

- [ ] **Step 3: Test config and reload**

```bash
sudo nginx -t
```

Expected output: `syntax is ok` and `test is successful`

```bash
sudo systemctl reload nginx
```

- [ ] **Step 4: Create spots directory for .env**

```bash
mkdir -p /home/ec2-user/spots
```

---

## Task 5: EC2 — Update Security Group

Done in AWS Console.

- [ ] **Step 1: Open Cloudflare IP list**

  In a browser, open: `https://www.cloudflare.com/ips-v4/`

  You will see a list of CIDR ranges like `103.21.244.0/22`, one per line.

- [ ] **Step 2: Open Security Group in AWS Console**

  AWS Console → EC2 → select instance `i-0229f2f711847e337` → **Security** tab → click the Security Group link

- [ ] **Step 3: Edit Inbound rules**

  Click **Edit inbound rules**. Verify or add the following:

  | Type | Protocol | Port | Source | Description |
  |------|----------|------|--------|-------------|
  | SSH | TCP | 22 | 0.0.0.0/0 | SSH access |
  | HTTP | TCP | 80 | 103.21.244.0/22 | Cloudflare |
  | HTTP | TCP | 80 | 103.22.200.0/22 | Cloudflare |
  | HTTP | TCP | 80 | 103.31.4.0/22 | Cloudflare |
  | HTTP | TCP | 80 | 104.16.0.0/13 | Cloudflare |
  | HTTP | TCP | 80 | 104.24.0.0/14 | Cloudflare |
  | HTTP | TCP | 80 | 108.162.192.0/18 | Cloudflare |
  | HTTP | TCP | 80 | 131.0.72.0/22 | Cloudflare |
  | HTTP | TCP | 80 | 141.101.64.0/18 | Cloudflare |
  | HTTP | TCP | 80 | 162.158.0.0/15 | Cloudflare |
  | HTTP | TCP | 80 | 172.64.0.0/13 | Cloudflare |
  | HTTP | TCP | 80 | 173.245.48.0/20 | Cloudflare |
  | HTTP | TCP | 80 | 188.114.96.0/20 | Cloudflare |
  | HTTP | TCP | 80 | 190.93.240.0/20 | Cloudflare |
  | HTTP | TCP | 80 | 197.234.240.0/22 | Cloudflare |
  | HTTP | TCP | 80 | 198.41.128.0/17 | Cloudflare |

  Click **Save rules**.

---

## Task 6: Create GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/` directory if it doesn't exist**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy Backend

on:
  push:
    branches: [master]
    paths:
      - 'backend/**'
      - '.github/workflows/deploy.yml'

permissions:
  contents: read
  packages: write

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/badukwei/spots-list-backend:latest

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          FRONTEND_URL: ${{ secrets.FRONTEND_URL }}
          GHCR_TOKEN: ${{ secrets.GHCR_TOKEN }}
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          envs: DATABASE_URL,FRONTEND_URL,GHCR_TOKEN
          script: |
            mkdir -p /home/ec2-user/spots
            printf "DATABASE_URL=%s\nFRONTEND_URL=%s\n" "$DATABASE_URL" "$FRONTEND_URL" > /home/ec2-user/spots/.env
            echo "$GHCR_TOKEN" | docker login ghcr.io -u badukwei --password-stdin
            docker pull ghcr.io/badukwei/spots-list-backend:latest
            docker stop spots-backend || true
            docker rm spots-backend || true
            docker run -d \
              --restart unless-stopped \
              --name spots-backend \
              --env-file /home/ec2-user/spots/.env \
              -p 127.0.0.1:3001:3001 \
              ghcr.io/badukwei/spots-list-backend:latest
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions deploy workflow for backend"
```

---

## Task 7: Configure GitHub Secrets

Done in GitHub repo settings. Go to: `https://github.com/badukwei/spots-list/settings/secrets/actions`

- [ ] **Step 1: Add `EC2_HOST`**

  Click **New repository secret**
  - Name: `EC2_HOST`
  - Value: `<ELASTIC_IP>` (the Elastic IP from Task 2)

- [ ] **Step 2: Add `EC2_SSH_KEY`**

  On your local Mac, copy the PEM key contents:
  ```bash
  cat ~/path/to/Mac_AI_Side_Project.pem
  ```

  - Name: `EC2_SSH_KEY`
  - Value: paste the full PEM content (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

- [ ] **Step 3: Add `DATABASE_URL`**

  Get the Session Pooler URL from Supabase dashboard (Project Settings → Database → Connection string → Session pooler):

  - Name: `DATABASE_URL`
  - Value: `postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`

- [ ] **Step 4: Add `FRONTEND_URL`**

  - Name: `FRONTEND_URL`
  - Value: `https://findingaspot.org`

- [ ] **Step 5: Add `GHCR_TOKEN`**

  Create a GitHub Personal Access Token (classic) with `read:packages` scope:
  1. Go to `https://github.com/settings/tokens` → **Generate new token (classic)**
  2. Note: `GHCR pull for EC2`
  3. Expiration: No expiration (or 1 year)
  4. Scope: check `read:packages` only
  5. Click **Generate token** → copy the token

  Add as secret:
  - Name: `GHCR_TOKEN`
  - Value: paste the token

---

## Task 8: First push — trigger CI/CD

- [ ] **Step 1: Push to main**

```bash
git push origin master
```

- [ ] **Step 2: Watch GitHub Actions**

  Go to `https://github.com/badukwei/spots-list/actions` and watch the workflow run.
  Expected: all steps green — image built, pushed to GHCR, deployed to EC2.

- [ ] **Step 3: Verify container is running on EC2**

  SSH into EC2:
  ```bash
  ssh -i ~/path/to/Mac_AI_Side_Project.pem ec2-user@<ELASTIC_IP>
  docker ps
  ```

  Expected: `spots-backend` container listed with status `Up`.

---

## Task 9: Cloudflare DNS — Add api subdomain

Done in Cloudflare dashboard: `https://dash.cloudflare.com` → findingaspot.org → **DNS → Records**

- [ ] **Step 1: Add A record for api subdomain**

  Click **Add record**:
  - Type: `A`
  - Name: `api`
  - IPv4 address: `<ELASTIC_IP>`
  - Proxy status: **Proxied** (orange cloud ON)
  - TTL: Auto

  Click **Save**.

- [ ] **Step 2: Verify DNS propagates**

  After a minute, run:
  ```bash
  curl https://api.findingaspot.org/categories
  ```

  Expected: JSON response `{"data":[],"total":0,"page":1,"limit":10,"totalPages":0}` (or actual data if you have categories).

---

## Task 10: Cloudflare Pages — Connect frontend

Done in Cloudflare dashboard: `https://dash.cloudflare.com` → **Workers & Pages → Create → Pages → Connect to Git**

- [ ] **Step 1: Connect GitHub repo**

  1. Click **Connect to Git** → authorize Cloudflare to access GitHub
  2. Select repository: `badukwei/spots-list`
  3. Click **Begin setup**

- [ ] **Step 2: Configure build settings**

  - Project name: `spots-list` (or `findingaspot`)
  - Production branch: `master`
  - Build command: `cd frontend && npm run build`
  - Build output directory: `frontend/dist`

- [ ] **Step 3: Add environment variable**

  Under **Environment variables (advanced)** → Add:
  - Variable name: `VITE_API_URL`
  - Value: `https://api.findingaspot.org`

  Click **Save and Deploy**.

- [ ] **Step 4: Wait for build to complete**

  Cloudflare Pages will build and deploy. When done, a preview URL like `https://spots-list-xxx.pages.dev` will appear.

- [ ] **Step 5: Add custom domain**

  In the Cloudflare Pages project → **Custom domains** → **Set up a custom domain**
  - Enter: `findingaspot.org`
  - Click **Continue** → Cloudflare will auto-configure DNS
  - Also add `www.findingaspot.org` if desired (redirect to apex)

---

## Task 11: End-to-end verification

- [ ] **Step 1: Open frontend**

  Go to `https://findingaspot.org` in browser.
  Expected: 地點找找看 loads, categories list shows.

- [ ] **Step 2: Test create category**

  Click **新增分類**, enter a name, submit.
  Expected: category appears in the list.

- [ ] **Step 3: Test create spot**

  Navigate into the category, click **新增地點**, fill in the form, submit.
  Expected: spot appears.

- [ ] **Step 4: Verify backend logs**

  SSH into EC2:
  ```bash
  ssh -i ~/path/to/Mac_AI_Side_Project.pem ec2-user@<ELASTIC_IP>
  docker logs spots-backend --tail 50
  ```

  Expected: no errors, request logs visible.

- [ ] **Step 5: Test CI/CD — make a small backend change**

  In `backend/src/app.module.ts`, make a trivial whitespace change, commit and push to master.
  Expected: GitHub Actions triggers, builds image, deploys to EC2, new container running.

  Verify with:
  ```bash
  docker ps  # check container restart time
  ```
