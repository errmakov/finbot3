#!/bin/sh

# Work directory
dir="/apps/finbot2/app"
#cd ${dir} && npm install pm2 -g

# Install app dependencies
cd ${dir} && npm install

cd ${dir} && npm $STAND

# Run application
#cd ${dir} && pm2 start index.js --name finbot2 --watch --no-daemon
#test cd ${dir} && npm start
