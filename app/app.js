const DIR = __dirname;
const config = require(DIR + '/config').config[process.env.NODE_ENV||'dev'];

const consoller = require(DIR + '/../vendors/consoller').consoller;
const EmailToSheet = require(DIR + '/EmailToSheet');
const fs = require('fs');


const db = require(DIR + '/Db');
const dbConf = {
  serviceKey: require(config.firebase.credentialsPath),
  url: config.firebase.url
}
let dbh, ets;
db.initDb(dbConf,(err, res)=>{
  dbh = res;
})


const optionsImap = {
    username: config.imap.username,
    password: config.imap.password,
    host: config.imap.host,
    port: config.imap.port,
    mailbox: config.imap.mailbox,
    searchFilter: ["UNSEEN"],
    tlsOptions: { rejectUnauthorized: true },
    tls: true,
    markSeen:true,
    fetchUnreadOnStart: true,
    debug:null
};
//console.log(optionsImap);

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
ets.on('mail', (mail)=>{
  consoller.log('Mail received from: ', mail.from);
})
ets.run();
consoller.log('Running on stage: ', config.stage);


setInterval(()=>{
  consoller.log('Going hard restart');
  fs.writeFile('touch.flag', '', (err) => {
    if (err) throw err;
    consoller.log('Flag touched');
  });
},config.hardResetTimeout)
