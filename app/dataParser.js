const DIR = __dirname;
const config = require(DIR + '/../app/config').config[process.env.NODE_ENV||'dev'];

/**
 * Модуль парсинга данных
 */
let dataParser = {


  convertDate(date, isTime) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();

    day = day.toString().padStart(2,'0');
    month = month.toString().padStart(2,'0');
    hours = hours.toString().padStart(2,'0');
    mins = mins.toString().padStart(2,'0');
    secs = secs.toString().padStart(2,'0');

    let result = day + '.' + month + '.' + year;

    if (isTime) {
      result += ' ' + hours + ':' + mins + ':' + secs;
    }

    return result;
  },

  /**
   * Возвращаем номер месяца для переданной даты в диапазоне 1..12
   * @param {object} date - Объект Date
   * @return {number} - Номер месяца в диапазоне 1..12.
   */
  getMonth(date) {
    if (typeof(date) != 'object') return false;
    return date.getMonth() + 1;
  },

  /**
   * Извлекаем тело письма из объекта Mail
   * @param {object} mail - Объект Письмо
   * @return {string} - Тело письма
   */
  getEmailBody(mail) {
    // let m = mail.html.replace(/"/g,'\\\\"');
    // m = m.replace(/\r/g,'');
    // m = m.replace(/\n/g,'');

    let body, regResult;
    if ((mail.html === undefined) || (mail.html === false)) {
      body = mail.text;
    } else {
      body = mail.html;
    }

    body = body.replace(/\r?\n|\r/g, ' ');
    regResult = body.match(/(Покупка|перевод) (.*)р/gi); // Sber

    if (regResult) {
      return regResult[0];
    } else {
      regResult = new RegExp(/Покупка: (.*?)[RUB|EUR|USD]{3}(.*?) Остаток(.*?)[RUB|EUR|USD]{3}/gm).exec(body); //Tochka rub
      if (regResult) {
        return regResult[0];
      } else {
        regResult = new RegExp(/(Pokupka|Pokupka Uspeshno) Summa: (.*?)[RUR|EUR|USD]{3}(.*?) Ostatok(.*?)[RUB|EUR|USD]{3}(.*)\s\d{2}.\d{2}.\d{4}/gm).exec(body); //Alfabank
        if (regResult) {
          return regResult[0]
        } else {
          return 'foobar';
        }
      }
    }
  },


  /**
   * Извлекаем округленную до целого  сумму (покупки) из тела письма
   * @param {string} mailBody - Тело письма
   * @return {number} - Сумма. Например: 145
   */
   getAmountFromEmailBody(mailBody){
       let regResult = mailBody.match(/Покупка ([^р]+)р/); // Sber rub
       if (!regResult) regResult =  mailBody.match(/перевод ([^р]+)р/); //Sber transfer
       if (!regResult) regResult =  mailBody.match(/Покупка: ([^R]+)R/); //Tochka rub
       if (!regResult) regResult =  mailBody.match(/Pokupka Summa: ([^R]+)R/); //Alfa rub
       if (!regResult) regResult =  mailBody.match(/Pokupka Uspeshno Summa: ([^R]+)R/); //Alfa rub
       if (!regResult) {
         console.log('Something wrong: ', mailBody);
         return 0;
       }
       let amount = regResult[1].replace(' ', '');
       amount = Math.round(parseFloat(amount));
       return amount;
  },

  /**
   * Возвращает счет, к которому относится трата.
   * По ряду признаков функция определяет к какому счету относится трата.
   * @param {string} mail - Объект mail
   * @return {string} - Название счета. Например: 'Точка', 'Сбер'
   */
  getAccount(mail) {
    let txt;
    //console.log(txt);
    if ((mail.html === undefined) || (mail.html === false)) {
      txt = mail.text;
    } else {
      txt = mail.html;
    }
    if (txt.match(/Карта \*5015/g)) return 'Точка'
    if (txt.match(/Sber 900/g)) return 'Сбер'
    if (txt.match(/Alfa-Bank/g)) return 'Альфа'
  },

  /**
   * Выделяем из строки с телом письма название торговой точки
   * @param {string} txt - Тело письма
   * @return {string} - Название точки продаж или null
   */
  getPOS(txt) {
    let result = '';
    let pos = txt.match(/\dр\s(.*)\sБаланс/); //сбер
    result = (pos) ? pos[1] : false;

    if (!result) {
      pos = txt.match(/в\s(.*)\.\sКарта/); //точка
      result = (pos) ? pos[1] : false;
    }
    if (!result) {
      pos = txt.match(/Ostatok(.*)RUR\s(.*)\s\d{2}.\d{2}.\d{4}/); //точка
      //console.log(pos);
      result = (pos) ? pos[2] : false;
      if (result) {
        pos = result.match(/(.*)\/(.*)/);
        result = (pos) ? pos[2] : false;
      }
    }
    return result;
  },

  /**
   * Возвращаем статью расхода по анализу тела письма.
   * Выделяем из тела письма идентификатор точки продажи, затем идем в Firebase, и смотрим к какой из существующих статей расходов относится наша точка продажи.
   * @param {string} txt - Тело письма
   * @param {object} db - коннекш к БД
   * @return {string} - Статья расходов
   */
  getArticle(txt, db) {
    let pos,
        sign,
        found;
    const collection = config.firebase.defaultCollection; // название коллекции в Firebase

    return new Promise(function(resolve, reject) {
      if ((db == undefined)||(txt == undefined)) {
        resolve(config.firebase.defaultArticle);
      }
      db.collection(collection).get()
        .then((categoriesSS)=>{
          if (categoriesSS.size == 0) throw(new Error('Wrong collection'));
          let i = 0;
          found = false;
          categoriesSS.forEach((category)=>{
            i++;

            pos = dataParser.getPOS(txt);

            if (pos == null) throw(new Error('POS is null'));
            sign = category.data().signs;
            let matcher = new RegExp(pos.replace('*','\\*'),'gmi');
            if (sign.match(matcher)) {
              found = true;
              resolve(category.data().title);
            }
            if ((i == categoriesSS.size)&&(found == false)) {
              if (pos != null) {
                let spentObj = {
                  title: config.firebase.defaultArticle,
                  signs: category.data().signs + '[' + pos + ']'
                }


                db.collection(collection).doc(config.firebase.defaultArticleId).get()
                  .then((docSS)=>{
                    let spentObj = {
                      title: docSS.data().title,
                      signs: docSS.data().signs + '[' + pos + ']'
                    }
                    db.collection(collection).doc(config.firebase.defaultArticleId).set(spentObj)
                      .then((res)=>{
                        resolve(docSS.data().title);
                      })
                      .catch((err)=>{
                        throw(err);
                      })
                  })
                  .catch((err)=>{
                    console.error(err);
                    throw(err);
                  })
              }
              resolve(config.firebase.defaultArticle);
            }
          })
        })
        .catch((err) => {
          console.warn('Error in collection: ', err.message);
          resolve(config.firebase.defaultArticle);
        })
    });
  },

}

module.exports =  {dataParser};
