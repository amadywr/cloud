# Self-Hosting Checklist

Progress tracker for [PLAN.md](PLAN.md). Ticked = done and confirmed working.

**Current:** Step 1a, Check 1a. Reboot test + redeploy drill.

---

## Step 1a: Static site live on EC2

### Part A: Static website (`website-vanilla/public/`)
- [x] `index.html`: header, about, projects, links, footer
- [x] `styles.css`: responsive layout, light/dark themes with CSS variables
- [x] `app.js`: theme toggle saved in localStorage
- [x] Placeholders filled (name: Ahmad)
- [x] Checked in browser: renders, toggle works, theme kept after refresh, OK on narrow window
- [x] Real links in place
- [x] `deploy/nginx.conf` (static only) and `.gitignore`

### Part B: Code on GitHub
- [x] `git init` + first commit
- [x] Public repo `cloud` created on GitHub
- [x] Pushed to `main`

### Part C: Launch EC2 (AWS console)
- [x] AWS Budget alert set
- [x] Ubuntu 26.04 LTS instance launched (Free Tier size)
- [x] Key pair saved in `~/.ssh/`, `chmod 400` done
- [x] Security group: 22 from my IP, 80 from anywhere
- [x] Elastic IP attached

### Part D: Server setup + Nginx
- [x] SSH login works
- [x] Packages updated
- [x] Nginx + git installed, welcome page visible
- [x] Repo cloned to `/var/www/cloud`
- [x] Site config enabled, default removed, `nginx -t` passes, reloaded

### Check 1a
- [x] Homepage loads at `http://<elastic-ip>/`
- [x] Survives `sudo reboot`
- [ ] Redeploy drill done (push, `git pull`, refresh)

---

## Step 1b: Add the Express backend

### Part E: Express API (local)
- [ ] `server/` with `/api/health`, `/api/visits`
- [ ] `app.js` fetches visitor count
- [ ] `README.md` runbook
- [ ] Runs locally, count increments
- [ ] Committed and pushed

### Part F: Node + pm2 on server
- [ ] Node.js LTS installed
- [ ] pm2 installed, API running as `homepage-api`
- [ ] `pm2 save` + `pm2 startup` done
- [ ] `curl 127.0.0.1:3000/api/health` OK on server

### Part G: Nginx reverse proxy
- [ ] `location /api/` block added and reloaded

### Check 1b
- [ ] `/api/health` returns ok through Nginx
- [ ] Visitor counter increments
- [ ] API survives `sudo reboot`
- [ ] Port 3000 not reachable from outside

---

## Later steps
- [ ] Step 2: Domain + HTTPS (Certbot)
- [ ] Step 3: Security hardening
- [ ] Step 4: Docker + Docker Compose
- [ ] Step 5: CI/CD with GitHub Actions
- [ ] Step 6: Postgres + automated backups
- [ ] Step 7: Logs and monitoring
- [ ] Optional: Terraform
