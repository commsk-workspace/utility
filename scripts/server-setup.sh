#!/bin/bash
# First-time server setup script for util.commsk.dev
# Run as root or with sudo on the server

set -e

APP_DIR="/var/www/utility"
REPO="git@github.com:commsk-workspace/utility.git"
DOMAIN="util.commsk.dev"
NODE_VERSION="22"

echo "=== DevTools Utility — Server Setup ==="

# 1. System deps
echo "--> Installing system dependencies..."
apt-get update -q
apt-get install -y git curl nginx certbot python3-certbot-nginx

# 2. Node.js via nvm (if not installed)
if ! command -v node &>/dev/null; then
  echo "--> Installing Node.js ${NODE_VERSION}..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  nvm install $NODE_VERSION
  nvm use $NODE_VERSION
  nvm alias default $NODE_VERSION
fi

# 3. PM2
if ! command -v pm2 &>/dev/null; then
  echo "--> Installing PM2..."
  npm install -g pm2
  pm2 startup systemd -u $USER --hp $HOME
fi

# 4. Clone repo
echo "--> Cloning repository..."
mkdir -p /var/www
git clone $REPO $APP_DIR
cd $APP_DIR

# 5. Copy .env (must be created manually first)
if [ ! -f "$APP_DIR/.env" ]; then
  echo "WARNING: .env not found! Copy .env.example and fill in values:"
  echo "  cp $APP_DIR/.env.example $APP_DIR/.env"
  echo "  nano $APP_DIR/.env"
fi

# 6. Install + build
echo "--> Installing dependencies..."
npm ci

echo "--> Generating Prisma client..."
npx prisma generate

echo "--> Running DB migrations..."
npx prisma migrate deploy

echo "--> Building Next.js..."
npm run build

# 7. Logs dir
mkdir -p "$APP_DIR/logs"

# 8. Start PM2
echo "--> Starting PM2..."
pm2 start ecosystem.config.js --env production
pm2 save

# 9. Nginx
echo "--> Configuring Nginx..."
cp "$APP_DIR/nginx/util.commsk.dev.conf" "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
nginx -t
systemctl reload nginx

# 10. SSL via Certbot
echo "--> Getting SSL certificate..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@commsk.dev --redirect

echo "=== Setup complete! Visit https://$DOMAIN ==="
