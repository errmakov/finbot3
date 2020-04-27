const dotenv = require('dotenv');
dotenv.config();

let config = {
  firebase: {
    credentialsPath: process.env.FIREBASE_CREDENTIAL_PATH, //path in app folder
    defaultCollection: 'spentCategories',
    defaultArticle: 'Неопределено',
    defaultArticleId: 'notdefined',

  },
  google: {
    tokenPath: process.env.GOOGLE_TOKEN_PATH || '.credentials/finbot-ce7411ebe156.json',
    credentialsPath: process.env.GOOGLE_CREDENTIAL_PATH || '.credentials/client_secret_finbot.json',
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '1tozAai5H2D2b4YNB3aQLZ3RXhg7gzAeYdIgMwiTIeyQ',
    range: process.env.GOOGLE_RANGE || 'HomeSheet!A2:F'
  },

  debug: process.env.DEBUG || 1,
  testTimeout: process.env.TEST_TIMEOUT || 3000

}


module.exports = {config}
