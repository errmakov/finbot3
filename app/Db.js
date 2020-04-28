let _db;

let fbAdmin = require("firebase-admin");
let fbStore = '';


function initDb(dbConf, callback) {
  if (_db) {
    console.warn("Trying to init DB again!");
    return callback(null, _db);
  }

  try {
    fbAdmin.initializeApp({
      credential: fbAdmin.credential.cert(dbConf.serviceKey),
      databaseURL: dbConf.url
    });
    fbStore = fbAdmin.firestore();
  }
  catch (err) {
    console.warn('die: ', err.message);
  }

  connected(null, fbStore);

  function connected(err, db) {
      if (err) {
        return callback(err);
      }
      _db = db;
      return callback(null, _db);
  }
}

function getDb() {
    if (_db == undefined) {
      throw (new Error('Call initDb first'));
    } else {
      return _db;
    }

}

module.exports = {
  getDb,
  initDb
};
