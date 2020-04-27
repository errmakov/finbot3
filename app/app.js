const DIR = __dirname
const config = require(DIR + '/config').config;
const consoller = require(DIR + '/../vendors/consoller').consoller;
const EmailToSheet = require(DIR + '/EmailToSheet');
const fs = require('fs');


const db = require(DIR + '/Db');
const dbConf = {serviceKey: require(config.firebase.credentialsPath)}
let dbh, ets;
db.initDb(dbConf,(err, res)=>{
  dbh = res;
})


const optionsImap = {
    username: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST,
    port: process.env.IMAP_PORT,
    mailbox: process.env.IMAP_MAILBOX,
    searchFilter: ["UNSEEN"],
    tlsOptions: { rejectUnauthorized: true },
    tls: true,
    markSeen:true,
    fetchUnreadOnStart: true,
    debug:null
};

const optionsGoogle = {
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  tokenPath: config.google.tokenPath,
  credentialsPath: config.google.credentialsPath,
  spreadsheetId: config.google.spreadsheetId,
  range: config.google.range
};

ets = new EmailToSheet(optionsImap, optionsGoogle, dbh);
ets.on('stored', (res)=>{
  consoller.log('One more mail stored: ', res);
})
ets.run();


setInterval(()=>{
  consoller.log('Going hard restart');
  fs.writeFile('touch.flag', '', (err) => {
    if (err) throw err;
    consoller.log('Flag touched');
  });
},config.hardResetTimeout)
