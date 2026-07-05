#!/bin/bash
set -euo pipefail

APP_DIR="/var/www/predictive-maintenance-2"
REPO_URL="https://github.com/mostafayman14/predictive-maintenance-2.git"
SERVICE_NAME="predictive-api"
APACHE_SITE="predictive-maintenance.conf"

echo "==> Pull latest code"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> Backend setup"
cd "$APP_DIR/backend"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

echo "==> Frontend build"
cd "$APP_DIR"
cat > .env.production << 'ENVEOF'
VITE_API_BASE_URL=/api/v1
VITE_LIVE_POLLING_ENABLED=true
VITE_LIVE_POLL_INTERVAL=1000
ENVEOF
npm install
npm run build

echo "==> Systemd service"
cat > /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=Predictive Maintenance API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=${APP_DIR}/backend
Environment="PATH=${APP_DIR}/backend/.venv/bin"
ExecStart=${APP_DIR}/backend/.venv/bin/gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8010
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ${SERVICE_NAME}
systemctl restart ${SERVICE_NAME}

echo "==> Apache site"
cat > /etc/apache2/sites-available/${APACHE_SITE} << 'EOF'
<VirtualHost *:80>
    ServerName 217.65.144.196
    DocumentRoot /var/www/predictive-maintenance-2/dist

    <Directory /var/www/predictive-maintenance-2/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>

    ProxyPreserveHost On
    ProxyPass /api/ http://127.0.0.1:8010/api/
    ProxyPassReverse /api/ http://127.0.0.1:8010/api/

    ErrorLog ${APACHE_LOG_DIR}/predictive-maintenance-error.log
    CustomLog ${APACHE_LOG_DIR}/predictive-maintenance-access.log combined
</VirtualHost>
EOF

a2enmod proxy proxy_http rewrite 2>/dev/null || true
a2ensite ${APACHE_SITE}
apache2ctl configtest
systemctl reload apache2

chown -R www-data:www-data "$APP_DIR"

echo "==> Done"
curl -s http://127.0.0.1:8010/api/v1/system-info | head -c 200
echo
