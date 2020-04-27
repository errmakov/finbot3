require('console-stamp')( console, { pattern : "yyyy-mm-dd HH:MM:ss.l" } );
const {google} = require('googleapis');
const readline = require('readline');
const dotenv = require('dotenv');
dotenv.config()
const fs = require('fs');

let optionsGoogle = {
  rows:'',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  tokenPath: process.env.GOOGLE_TOKEN_PATH,
  credentialsPath: process.env.GOOGLE_CREDENTIAL_PATH,
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
  range: process.env.GOOGLE_RANGE
};



function getOAuth2Client(options) {
  let path = options.credentialsPath;
  return new Promise(function (resolve, reject) {
    fs.readFile(path, (err, credentials) => {
      if (err) {
        reject(new Error(err));
      } else {
        credentials = JSON.parse(credentials);
        resolve(credentials);
      }
    })})
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  var authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: optionsGoogle.scopes
  });

  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oAuth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return (new Error(err.message));
      } else {
        oAuth2Client.credentials = token;
        storeToken(token)
        .then((result)=>{
          return(result);
        })
        .catch((err)=>{
          return (new Error(err.message));
        });

      }

    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  return new Promise(function(resolve, reject) {
    let tokenDir = optionsGoogle.tokenPath.match(/(.*)[\/\\]/)[1]||'';
    fs.writeFile(optionsGoogle.tokenPath, JSON.stringify(token), (err)=>{
      if (err) {
        console.error(err);
        reject(err);
      } else {
          console.log('Token stored to', optionsGoogle.tokenPath)
          resolve(optionsGoogle.tokenPath);
      }

    });
  })
}


getOAuth2Client(optionsGoogle)
  .then((oAuth2Client)=>{
    getNewToken(oAuth2Client);
  })
  .catch((err)=>{
    console.log(err);
  })
