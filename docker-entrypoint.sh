#!/bin/sh

# Work directory
dir="/apps/finbot3/app"

cd ${dir} && npm install pm2 -g

# Install app dependencies
cd ${dir} && npm install

# Run application
cd .. && pm2 start app/app.js --name finbot3 --watch --no-daemon -o ~/.pm2/logs/finbot3.out.log -e ~/.pm2/logs/finbot3.err.log
