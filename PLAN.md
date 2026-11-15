# Self-Hosting Plan

`~/Desktop/cloud` (on my MacBook) holds every app I self-host. The first is **website-vanilla**,
a personal homepage in plain HTML/CSS/JS. A tiny Express API is added after it's live.

Progress is tracked in [CHECKLIST.md](CHECKLIST.md).

## Context
I'm moving from managed hosts (Render/Vercel/Netlify) to my own infrastructure, learning
AWS, Linux, Nginx, Docker and CI/CD. The static site goes live on EC2 first (step 1a). Then
a tiny Express API (`/api/visits`) is added to practise the Nginx reverse proxy and pm2
(step 1b). The counter moves to Postgres in step 6. I have an AWS account but no domain yet
(needed in step 2).

## How we work: one step at a time
- One part at a time. We don't move on until the current part works.
- **Code parts**: Claude writes the files and explains each one. I read them and run them locally.
- **Server parts**: I do the steps in the AWS console and on the server. Claude gives a few
  commands at a time and explains what each does. I paste the output back, and we fix any
  problems before going on.

## Roadmap
1. Manual deploy on EC2
   - 1a: Static site live (Parts A to D)
   - 1b: Add the Express backend (Parts E to G)
2. Domain + HTTPS with Certbot
3. Security hardening
4. Docker + Docker Compose
5. CI/CD with GitHub Actions
6. Postgres + automated backups
7. Logs and monitoring

Optional later: Terraform. Skipping Kubernetes for now.

---

## Step 1a: Static site live on EC2

### Part A: The static website (done)
```
website-vanilla/
  public/
    index.html       header, about, projects, links, visitor-count placeholder, theme button
    styles.css       responsive layout, light/dark themes via CSS variables
    app.js           theme toggle (remembers choice in localStorage)
  deploy/
    nginx.conf       server block: serves public/ on port 80 (no /api yet)
  .gitignore
```

### Part B: Put the code on GitHub
The server downloads the code with `git clone`, so it has to be on GitHub first. This repo
is also what GitHub Actions uses in step 5.
1. `git init`, first commit (repo root is `cloud/`; each app lives in its own subfolder).
2. Create a **public** repo `cloud` on github.com. Public means the server can
   clone it without a login. Private repos and deploy keys come in step 3/5.
3. Add the remote and `git push -u origin main`.

### Part C: Launch the EC2 server (AWS console)
1. **Billing safety first**: an AWS Budget alert (e.g. $5).
2. Launch instance: **Ubuntu Server 24.04 LTS**, Free Tier eligible size (`t3.micro`/`t2.micro`).
3. **Key pair**: create `.pem`, move it to `~/.ssh/`, lock its permissions with
   `chmod 400 ~/.ssh/<key>.pem` (ssh refuses keys other users can read).
4. **Security group** (AWS's firewall): SSH 22 from *My IP* only; HTTP 80 from anywhere
   (443 added in step 2).
5. Allocate an **Elastic IP** and attach it, so the address survives restarts.

### Part D: Server setup + Nginx serves the site
From the Mac Terminal: `ssh -i ~/.ssh/<key>.pem ubuntu@<elastic-ip>`
1. `sudo apt update && sudo apt upgrade -y`
2. Install **Nginx** and **git**. Visit `http://<ip>` and you should see the Nginx welcome page.
3. Clone the repo into `/var/www/cloud` (owned by `ubuntu`, not root).
4. Copy `website-vanilla/deploy/nginx.conf` to `/etc/nginx/sites-available/website-vanilla`, symlink into
   `sites-enabled`, remove `default`.
5. `sudo nginx -t` (syntax check), then `sudo systemctl reload nginx`.

### Check 1a
- `http://<elastic-ip>/` shows the homepage, and the theme toggle works.
- After `sudo reboot`, the site comes back by itself.
- Redeploy drill: change a line locally, push, `git pull` on the server, refresh. (Static
  files need no restart.)

---

## Step 1b: Add the Express backend

### Part E: Express API (local)
```
website-vanilla/
  server/
    package.json     express only; "start": "node server.js"
    server.js        GET /api/health -> {status:"ok"}; GET/POST /api/visits -> in-memory count
                     listens on 127.0.0.1:3000 (only reachable via Nginx); PORT from env
    .env.example     PORT=3000
  README.md          run-locally + deploy runbook
```
`public/app.js` gets `fetch('/api/visits')`. Local test: `cd server; npm install; npm start`
(in dev mode Express also serves `public/`, so `/api` works without Nginx). Commit and push.

### Part F: Node + pm2 on the server
1. Install **Node.js LTS** via NodeSource, verify `node -v`.
2. Install **pm2** (`sudo npm i -g pm2`), which restarts Express on crash/reboot.
3. `git pull`, `cd server && npm ci --omit=dev && pm2 start server.js --name homepage-api`.
4. `pm2 save` + `pm2 startup` so it survives reboots.
5. Check: `curl http://127.0.0.1:3000/api/health` on the server.

### Part G: Nginx reverse proxy for /api
1. Add the `location /api/` block (`proxy_pass`, `proxy_set_header`) to `deploy/nginx.conf`.
2. Copy to the server, `sudo nginx -t`, reload.

### Check 1b
- `http://<elastic-ip>/api/health` returns `{"status":"ok"}`.
- Visitor counter increments on refresh.
- After `sudo reboot`, the API still works (pm2 startup).
- `http://<ip>:3000` is NOT reachable from outside.

---

## Later steps (outline; each gets its own detailed plan)
2. **Domain + HTTPS**: buy a cheap domain (Cloudflare Registrar / Namecheap / Route 53 ~$10/yr),
   A record → Elastic IP, open 443, `certbot --nginx`, auto-renew check.
3. **Security**: new non-default sudo user, disable password + root SSH, `ufw` (22/80/443),
   `unattended-upgrades`, `.env` with tight permissions.
4. **Docker**: Dockerfile for Express, Nginx image with `public/` + config, `docker-compose.yml`.
5. **CI/CD**: GitHub Actions → test → build images → push to GHCR → SSH deploy (`compose pull && up -d`).
6. **Postgres**: counter moves to Postgres container (volume) or RDS; nightly `pg_dump` to S3.
7. **Monitoring**: `journalctl`, `pm2 logs`/`docker logs`, UptimeRobot on `/api/health`.
