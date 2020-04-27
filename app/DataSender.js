const fs = require('fs');
const {google} = require('googleapis');
const consoller = require('../vendors/consoller').consoller;

class DataSender {
  constructor(options) {
    this._options = options;
  }

  put(args) {
    let self = this;
    return new Promise(function(resolve, reject){
      self.apiCall((oAuth)=>{
        var sheets = google.sheets('v4');
        sheets.spreadsheets.values.append({
          auth: oAuth,
          spreadsheetId: args[1],
          range: args[2],
          valueInputOption: "USER_ENTERED",
          resource: {
            values: args[0]
          }
        }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.status);
          }
        })
      })
      .catch((err)=>{
        reject(err)
      })
    })
  }

  apiCall(callback) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.loadCredentials(self._options.credentialsPath)
        .then(function (credentials) {
          return self.createOAuth(credentials, self._options.tokenPath);
        })
        .then((oAuth)=>{
          return callback(oAuth);
        })
        .catch((err)=>{
          consoller.err(err);
          reject(new Error('apiCall error'));
        })
      })
  }

  loadCredentials(path) {
    return new Promise(function (resolve, reject) {
      fs.readFile(path, (err, credentials) => {
        if (err)  {
          reject(new Error('loadCredentials error'));
        } else {
          resolve(JSON.parse(credentials));
        }
      });
    })
  }

  createOAuth(credentials, tokenPath) {

    return new Promise(function (resolve, reject) {
      try {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        fs.readFile(tokenPath, (err, token) => {
          if (err) {
            reject(new Error('Token error'));
          } else {
            oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
          }
        });
      }
      catch(err) {
        reject(new Error('OAuth error'));
      }
    })
  }
}

module.exports =  DataSender
