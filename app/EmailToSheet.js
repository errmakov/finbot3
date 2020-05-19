const DIR = __dirname;
const consoller = require(DIR + '/../vendors/consoller').consoller;
const dataParser = require(DIR + '/dataParser').dataParser;
const DataSender = require(DIR + '/DataSender');
const config = require(DIR + '/../app/config').config[process.env.NODE_ENV||'dev'];

MailListener = require("mail-listener5");

class EmailToSheet extends MailListener.MailListener {
  constructor(optionsImap, optionsGoogle, dbh) {
    super(optionsImap);
    this._optionsGoogle = optionsGoogle;
    this.parser = dataParser;
    this._dbh = dbh;
  }

  run() {
    let self = this;
    this.listen();
    this.imap.connect();

    return new Promise((resolve, reject)=>{
      resolve('Connected');
    })
  }

  listen() {
    this.on('mail',(mail)=>{
      //consoller.log(mail);
      this.parse(mail)
        .then((parsed)=>{
          if (parsed) {
            return this.put(parsed);
          } else {
            throw(new Error('Some errors while parsing'))
          }

        })
        .then((putResult)=>{
          if (putResult) {
            this.emit('stored', putResult)
          } else {
            throw(new Error('Some errors while put'));
          }
        })
        .catch((err)=>{
          consoller.err(err);
        })
    })
  }

  parse(mail){
    let parsed;
    let article;
    return new Promise((resolve,reject)=>{
      if (typeof(mail.date)!='object') {  // Некоторые признаки, по которым можно понять, что это письмо не очень валидное
        reject(new Error('Invalid email'))
      }
      let eb = this.parser.getEmailBody(mail);
      this.parser.getArticle(eb, this._dbh)
        .then((article)=>{
          return new Promise((resolve,reject)=>{resolve(article)});
        })
        .catch((err)=>{
          consoller.warn(err);
          article = config.firebase.defaultArticle;
          return new Promise((resolve,reject)=>{resolve(article)});
        })
        .then((article)=>{
          parsed = [[
            this.parser.getMonth(mail.date),
            this.parser.convertDate(mail.date),
            this.parser.getAmountFromEmailBody(eb),
            eb,
            article,
            this.parser.getAccount(mail),
            this.parser.convertDate(new Date, true),
            mail.from.text
          ]];
          resolve(parsed);
        })
      });
  }

  put(data){
    let self = this;
    return new Promise((resolve,reject)=>{
      if (data) {
        let sender = new DataSender(self._optionsGoogle);
        let args = [data, self._optionsGoogle.spreadsheetId, self._optionsGoogle.range];
        sender.put(args)
          .then((putResult)=>{
            consoller.log('Put is ok: ', putResult);
            resolve(putResult);
          })
          .catch((err)=>{
            reject(err);
          })
      } else {
        reject('data to put is wrong');
      }
    });
  }

  stop() {
    this.imap.end();
  }
}
module.exports =  EmailToSheet;
