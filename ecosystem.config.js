module.exports = {
  apps: [
    {
      name: 'utility-tools',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      interpreter: '/root/.nvm/versions/node/v22.21.1/bin/node',
      env: {
        NODE_ENV: 'production',
        PORT: 3014,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3014,
      },
      env_staging: {
        NODE_ENV: 'production',
        PORT: 3014,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3014,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'util.commsk.dev',
      ref: 'origin/main',
      repo: 'git@github.com:commsk-workspace/utility.git',
      path: '/var/www/utility',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
