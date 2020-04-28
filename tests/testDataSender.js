const DIR = __dirname;
const fs = require('fs');
const mocha = require('mocha');
const chai = require('chai');
const sinon = require('sinon');
chai.use(require("chai-as-promised"));
const config = require(DIR + '/../app/config').config[process.env.NODE_ENV||'dev'];
const consoller = require('../vendors/consoller').consoller;

const assert = chai.assert;
const should = chai.should();
const DataSender = require('../app/DataSender');

let optionsGoogle;

describe('testGooglePost()', () => {

  beforeEach(()=>{
    optionsGoogle = {
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      tokenPath: config.google.tokenPath,
      credentialsPath: config.google.credentialsPath,
      spreadsheetId: config.google.spreadsheetId,
      range: config.google.range
    };

  })


  it("Test DataSender.put with valid creds returns 200 OK", function() {
    let rows = [['foo foo','bar']];
    let sender = new DataSender(optionsGoogle);
    args = [rows, optionsGoogle.spreadsheetId, optionsGoogle.range];
    return assert.becomes(sender.put(args),200)
  })

  it("Test DataSender.createOAuth reject: invalid creds, valid token", function() {
    let sender = new DataSender(optionsGoogle);
    return assert.isRejected(sender.createOAuth('foo', optionsGoogle), 'OAuth error')
  })

  it("Test DataSender.createOAuth reject: valid creds, invalid token", function() {
    let sender = new DataSender(optionsGoogle);
    let creds = fs.readFileSync(optionsGoogle.credentialsPath);
    creds = JSON.parse(creds);
    return assert.isRejected(sender.createOAuth(creds, 'foo'), 'Token error')
  })

  it("Test DataSender.createOAuth resolved with valid args", function() {
    let sender = new DataSender(optionsGoogle);
    let creds = fs.readFileSync(optionsGoogle.credentialsPath);
    creds = JSON.parse(creds);
    return assert.isFulfilled(sender.createOAuth(creds, optionsGoogle.tokenPath), 'Token error')
  })

  it("Test DataPoster.loadCredentials: invalid arg", function() {
    let sender = new DataSender(optionsGoogle);
    return assert.isRejected(sender.loadCredentials('foo'), 'loadCredentials error');
  })

  it("Test DataPoster.loadCredentials: valid arg", function() {
    let sender = new DataSender(optionsGoogle);
    return assert.isFulfilled(sender.loadCredentials(optionsGoogle.credentialsPath));
  })

  it("Test DataSender.apiCall: invalid callback", function() {
    let sender = new DataSender(optionsGoogle);
    return assert.isRejected(sender.apiCall('foo','bar'),'apiCall error');
  })

  it("Test DataSender.apiCall: valid arg", function(done) {
    let sender = new DataSender(optionsGoogle);
    let spy = sinon.spy();
    sender.apiCall(spy);
    setTimeout(()=>{
      assert.deepEqual(spy.callCount,1);
      done();
    }, config.testTimeout)
  })

})
