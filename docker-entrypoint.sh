#!/bin/sh

# Work directory
dir="/apps/finbot3/app"

cd ${dir} && npm install pm2 -g

# Install app dependencies
cd ${dir} && npm install
echo "Hello from entrypoint"
echo $NODE_ENV
# Run application
cd .. && NODE_ENV=$NODE_ENV HARD_RESET_TIMEOUT=$HARD_RESET_TIMEOUT pm2 start app/app.js --name finbot3 --watch --no-daemon -o ~/.pm2/logs/finbot3.out.log -e ~/.pm2/logs/finbot3.err.log
