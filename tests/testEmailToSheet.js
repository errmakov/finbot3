/*
  TODO:
  Удалить лишнее в смс http://joxi.ru/V2VaoPQSdDb1pm

*/
const DIR = __dirname;
const mocha = require('mocha');
const chai = require('chai');
const sinon = require('sinon');
//chai.use(require("chai-events"));
chai.use(require("chai-as-promised"));
const config = require(DIR + '/../app/config').config[process.env.NODE_ENV||'dev'];
const assert = chai.assert;
const consoller = require('../vendors/consoller').consoller;
const EmailToSheet = require('../app/EmailToSheet');

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


const db = require('../app/Db');
const dbConf = {serviceKey:require(config.firebase.credentialsPath)}
let dbh;
db.initDb(dbConf,(err, res)=>{
  dbh = res;
})


/* TODO: Вынести подготовку этого массива в отдельный модуль */
const emailSet = Array (
  '{"attachments":[],"headers":{},"headerLines":[{"key":"received","line":"Received: from mxback23g.mail.yandex.net (localhost [127.0.0.1])by mxback23g.mail.yandex.net with LMTP id jer8b2WP51-ZlG2JrEFfor <definbot@yandex.ru>; Mon, 13 Apr 2020 06:51:20 +0300"},{"key":"received","line":"Received: from mxback23g.mail.yandex.net (localhost.localdomain [127.0.0.1])by mxback23g.mail.yandex.net (Yandex) with ESMTP id 860EB24C1966for <definbot@yandex.ru>; Mon, 13 Apr 2020 06:51:20 +0300 (MSK)"},{"key":"x-yandex-internal","line":"X-Yandex-Internal: 1"},{"key":"received","line":"Received: from iva3-dd2bb2ff2b5f.qloud-c.yandex.net (iva3-dd2bb2ff2b5f.qloud-c.yandex.net [2a02:6b8:c0c:7611:0:640:dd2b:b2ff])by mxback23g.mail.yandex.net (mxback/Yandex) with ESMTP id 3YklqjGSan-pK3aVnGP;Mon, 13 Apr 2020 06:51:20 +0300"},{"key":"x-yandex-front","line":"X-Yandex-Front: mxback23g.mail.yandex.net"},{"key":"x-yandex-timemark","line":"X-Yandex-TimeMark: 1586749880.505"},{"key":"dkim-signature","line":"DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=yandex.ru; s=mail; t=1586749880;bh=QpVOw9lRkSxNY8LpMnbhRurkrK0og4lNofDhjH0g1kE=;h=Subject:To:From:Message-ID:Date;b=aDW1xO2DXNSZuadTakR2wO0ry5mSIsR5/PH21/mfHZbjBX0zrB2quywHQjuqHr4M8 ps/PWVdVfXirZHQRZKstErFVk+Gs55o70w2BO52Qw7/o9KUQb3iXaez4/WZ1GLsKuR XtdIuMtfHn25zTFaOo7a+x1Gcraw74BuOsTxxIOs="},{"key":"authentication-results","line":"Authentication-Results: mxback23g.mail.yandex.net; dkim=pass header.i=@yandex.ru"},{"key":"received","line":"Received: by iva3-dd2bb2ff2b5f.qloud-c.yandex.net (smtp/Yandex) with ESMTPSA id 5vzFlSOu0a-pKWuUFG8;Mon, 13 Apr 2020 06:51:20 +0300(using TLSv1.2 with cipher ECDHE-RSA-AES128-GCM-SHA256 (128/128 bits))(Client certificate not present)"},{"key":"x-yandex-timemark","line":"X-Yandex-TimeMark: 1586749880.071"},{"key":"x-yandex-suid-status","line":"X-Yandex-Suid-Status: 1 1238967317"},{"key":"x-yandex-spam","line":"X-Yandex-Spam: 1"},{"key":"content-type","line":"Content-Type: text/plain; charset=utf-8"},{"key":"from","line":"From: definbot@yandex.ru"},{"key":"to","line":"To: fin bot <definbot@yandex.ru>"},{"key":"subject","line":"Subject: finbot2 test"},{"key":"message-id","line":"Message-ID: <4da5bdd0-2053-fdb9-6eab-d35601e3da34@yandex.ru>"},{"key":"content-transfer-encoding","line":"Content-Transfer-Encoding: quoted-printable"},{"key":"date","line":"Date: Mon, 13 Apr 2020 03:51:19 +0000"},{"key":"mime-version","line":"MIME-Version: 1.0"},{"key":"return-path","line":"Return-Path: definbot@yandex.ru"}],"text":"Sber 900 <900>: ECMC1730 18:15 Покупка 124р VKUSVILL Баланс: 14696.68р","textAsHtml":"<p>Sber 900 &lt;900&gt;: ECMC1730 18:15 &Pcy;&ocy;&kcy;&ucy;&pcy;&kcy;&acy; 124&rcy; VKUSVILL &Bcy;&acy;&lcy;&acy;&ncy;&scy;: 14696.68&rcy;</p>","subject":"finbot2 test","date":"2020-04-13T03:51:19.000Z","to":{"value":[{"address":"definbot@yandex.ru","name":"fin bot"}],"html":"<span class=\\"mp_address_group\\"><span class=\\"mp_address_name\\">fin bot</span> &lt;<a href=\\"mailto:definbot@yandex.ru\\" class=\\"mp_address_email\\">definbot@yandex.ru</a>&gt;</span>","text":"fin bot <definbot@yandex.ru>"},"from":{"value":[{"address":"definbot@yandex.ru","name":""}],"html":"<span class=\\"mp_address_group\\"><a href=\\"mailto:definbot@yandex.ru\\" class=\\"mp_address_email\\">definbot@yandex.ru</a></span>","text":"definbot@yandex.ru"},"messageId":"<4da5bdd0-2053-fdb9-6eab-d35601e3da34@yandex.ru>","html":false}',
  '{"attachments":[],"headers":{},"headerLines":[{"key":"received","line":"Received: from mxback2q.mail.yandex.net (localhost [127.0.0.1])by mxback2q.mail.yandex.net with LMTP id msAIb2HO0X-0VIJs5Pnfor <definbot@yandex.ru>; Mon, 13 Apr 2020 06:52:47 +0300"},{"key":"received","line":"Received: from mxback2q.mail.yandex.net (localhost [127.0.0.1])by mxback2q.mail.yandex.net (Yandex) with ESMTP id 7F9D2A2A0175for <definbot@yandex.ru>; Mon, 13 Apr 2020 06:52:47 +0300 (MSK)"},{"key":"x-yandex-internal","line":"X-Yandex-Internal: 1"},{"key":"received","line":"Received: from vla3-5ed9a7202853.qloud-c.yandex.net (vla3-5ed9a7202853.qloud-c.yandex.net [2a02:6b8:c15:341d:0:640:5ed9:a720])by mxback2q.mail.yandex.net (mxback/Yandex) with ESMTP id Opsmpnbj99-qlgqO69M;Mon, 13 Apr 2020 06:52:47 +0300"},{"key":"x-yandex-front","line":"X-Yandex-Front: mxback2q.mail.yandex.net"},{"key":"x-yandex-timemark","line":"X-Yandex-TimeMark: 1586749967.457"},{"key":"dkim-signature","line":"DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=yandex.ru; s=mail; t=1586749967;bh=R4KdVgGq9FaD+PAVSwEMwu+fdN6OuxjoRrx0MS1adlg=;h=Subject:To:From:Message-ID:Date;b=os7HIJZnldis9BSrBjr00SwLnyglohiYSP5beDrf1Dezx8okFdVsIQJSkzqaYzSL0 wJ/7t9HoWcAfXcbc4ShnmENWhPnuOQpox/lM8kyuj+WGUKCyAtrk3wu4HGYoYeDe8q yjXVvzko/d2qZ5aUEZN47g61dsEjCe3LQ1+/d6mo="},{"key":"authentication-results","line":"Authentication-Results: mxback2q.mail.yandex.net; dkim=pass header.i=@yandex.ru"},{"key":"received","line":"Received: by vla3-5ed9a7202853.qloud-c.yandex.net (smtp/Yandex) with ESMTPSA id ZVMoXJ5fHB-ql3OGFCM;Mon, 13 Apr 2020 06:52:47 +0300(using TLSv1.2 with cipher ECDHE-RSA-AES128-GCM-SHA256 (128/128 bits))(Client certificate not present)"},{"key":"x-yandex-timemark","line":"X-Yandex-TimeMark: 1586749967.101"},{"key":"x-yandex-suid-status","line":"X-Yandex-Suid-Status: 1 1238967317"},{"key":"x-yandex-spam","line":"X-Yandex-Spam: 1"},{"key":"content-type","line":"Content-Type: text/plain; charset=utf-8"},{"key":"from","line":"From: definbot@yandex.ru"},{"key":"to","line":"To: fin bot <definbot@yandex.ru>"},{"key":"subject","line":"Subject: finbot2 test"},{"key":"message-id","line":"Message-ID: <78e639b4-5719-7f48-12be-d169e381b392@yandex.ru>"},{"key":"content-transfer-encoding","line":"Content-Transfer-Encoding: base64"},{"key":"date","line":"Date: Mon, 13 Apr 2020 03:52:46 +0000"},{"key":"mime-version","line":"MIME-Version: 1.0"},{"key":"return-path","line":"Return-Path: definbot@yandex.ru"}],"text":"Покупка: 599 RUB в GOOGLE*GOOG. Карта *5015. Остаток 144 424.52 RUB","textAsHtml":"<p>&Pcy;&ocy;&kcy;&ucy;&pcy;&kcy;&acy;: 599 RUB &vcy; GOOGLE*GOOG. &Kcy;&acy;&rcy;&tcy;&acy; *5015. &Ocy;&scy;&tcy;&acy;&tcy;&ocy;&kcy; 144 424.52 RUB</p>","subject":"finbot2 test","date":"2020-04-13T03:52:46.000Z","to":{"value":[{"address":"definbot@yandex.ru","name":"fin bot"}],"html":"<span class=\\"mp_address_group\\"><span class=\\"mp_address_name\\">fin bot</span> &lt;<a href=\\"mailto:definbot@yandex.ru\\" class=\\"mp_address_email\\">definbot@yandex.ru</a>&gt;</span>","text":"fin bot <definbot@yandex.ru>"},"from":{"value":[{"address":"definbot@yandex.ru","name":""}],"html":"<span class=\\"mp_address_group\\"><a href=\\"mailto:definbot@yandex.ru\\" class=\\"mp_address_email\\">definbot@yandex.ru</a></span>","text":"definbot@yandex.ru"},"messageId":"<78e639b4-5719-7f48-12be-d169e381b392@yandex.ru>","html":false}',
  '{"attachments":[],"headers":{},"headerLines":[{"key":"received","line":"Received: from mxback4o.mail.yandex.net (localhost [127.0.0.1])by mxback4o.mail.yandex.net with LMTP id ciTsMUGRZA-OXgrQX76for <definbot@yandex.ru>; Mon, 13 Apr 2020 06:52:47 +0300"},{"key":"received","line":"Received: from mxback4o.mail.yandex.net (localhost.localdomain [127.0.0.1])by mxback4o.mail.yandex.net (Yandex) with ESMTP id 87FB34D63316for <definbot@yandex.ru>; Mon, 13 Apr 2020 06:52:47 +0300 (MSK)"},{"key":"x-yandex-internal","line":"X-Yandex-Internal: 1"},{"key":"received","line":"Received: from myt4-07bed427b9db.qloud-c.yandex.net (myt4-07bed427b9db.qloud-c.yandex.net [2a02:6b8:c00:887:0:640:7be:d427])by mxback4o.mail.yandex.net (mxback/Yandex) with ESMTP id zeVJedosaE-qldK8Bf8;Mon, 13 Apr 2020 06:52:47 +0300"},{"key":"x-yandex-front","line":"X-Yandex-Front: mxback4o.mail.yandex.net"},{"key":"x-yandex-timemark","line":"X-Yandex-TimeMark: 1586749967.497"},{"key":"dkim-signature","line":"DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=yandex.ru; s=mail; t=1586749967;bh=Z+UxLId5AAg3fd0zAbHqhxNjj3PLvcHDOZ5WqMmqREU=;h=Subject:To:From:Message-ID:Date;b=ezj1DmLMwHX8LGIrsovZWi71zhDI77nnpyaoTwvsyMFosR9+dpaXRb2q8vlUy5kuI dgU8symMIjVW6m49nnKjDQoCZ4c5lkvA4Z2OYcbYSwogmmNVSpGAlBHMPk02QPZ0zX FCMjBNsc7UxTtQh3ud/37VIDFxM9EcAEfMEviOmg="},{"key":"authentication-results","line":"Authentication-Results: mxback4o.mail.yandex.net; dkim=pass header.i=@yandex.ru"},{"key":"received","line":"Received: by myt4-07bed427b9db.qloud-c.yandex.net (smtp/Yandex) with ESMTPSA id wNepzc1rja-ql20VNXc;Mon, 13 Apr 2020 06:52:47 +0300(using TLSv1.2 with cipher ECDHE-RSA-AES128-GCM-SHA256 (128/128 bits))(Client certificate not present)"},{"key":"x-yandex-timemark","line":"X-Yandex-TimeMark: 1586749967.098"},{"key":"x-yandex-suid-status","line":"X-Yandex-Suid-Status: 1 1238967317"},{"key":"x-yandex-spam","line":"X-Yandex-Spam: 1"},{"key":"content-type","line":"Content-Type: text/plain; charset=utf-8"},{"key":"from","line":"From: definbot@yandex.ru"},{"key":"to","line":"To: fin bot <definbot@yandex.ru>"},{"key":"subject","line":"Subject: finbot2 test"},{"key":"message-id","line":"Message-ID: <e5cf73af-5bbf-4ba1-0c66-3b4acdb1893e@yandex.ru>"},{"key":"content-transfer-encoding","line":"Content-Transfer-Encoding: base64"},{"key":"date","line":"Date: Mon, 13 Apr 2020 03:52:46 +0000"},{"key":"mime-version","line":"MIME-Version: 1.0"},{"key":"return-path","line":"Return-Path: definbot@yandex.ru"}],"text":"Sber 900 <900>: ECMC1730 18:15 Покупка 7 283.54р Magnit Баланс: 13654.28р","textAsHtml":"<p>Sber 900 &lt;900&gt;: ECMC1730 18:15 &Pcy;&ocy;&kcy;&ucy;&pcy;&kcy;&acy; 7 283.54&rcy; Magnit &Bcy;&acy;&lcy;&acy;&ncy;&scy;: 13654.28&rcy;</p>","subject":"finbot2 test","date":"2020-04-13T03:52:46.000Z","to":{"value":[{"address":"definbot@yandex.ru","name":"fin bot"}],"html":"<span class=\\"mp_address_group\\"><span class=\\"mp_address_name\\">fin bot</span> &lt;<a href=\\"mailto:definbot@yandex.ru\\" class=\\"mp_address_email\\">definbot@yandex.ru</a>&gt;</span>","text":"fin bot <definbot@yandex.ru>"},"from":{"value":[{"address":"definbot@yandex.ru","name":""}],"html":"<span class=\\"mp_address_group\\"><a href=\\"mailto:definbot@yandex.ru\\" class=\\"mp_address_email\\">definbot@yandex.ru</a></span>","text":"definbot@yandex.ru"},"messageId":"<e5cf73af-5bbf-4ba1-0c66-3b4acdb1893e@yandex.ru>","html":false}',
  '{"attachments":[],"headers":{},"headerLines":[{"key":"received","line":"Received: from mxback10j.mail.yandex.net (localhost [127.0.0.1])by mxback10j.mail.yandex.net with LMTP id LILCWqVdfM-6deWOpQAfor <definbot@yandex.ru>; Mon, 13 Apr 2020 06:52:47 +0300"},{"key":"received","line":"Received: from mxback10j.mail.yandex.net (localhost.localdomain [127.0.0.1])by mxback10j.mail.yandex.net (Yandex) with ESMTP id 8CD6A4C417D1for <definbot@yandex.ru>; Mon, 13 Apr 2020 06:52:47 +0300 (MSK)"},{"key":"x-yandex-internal","line":"X-Yandex-Internal: 1"},{"key":"received","line":"Received: from sas1-e20a8b944cac.qloud-c.yandex.net (sas1-e20a8b944cac.qloud-c.yandex.net [2a02:6b8:c14:6696:0:640:e20a:8b94])by mxback10j.mail.yandex.net (mxback/Yandex) with ESMTP id Ds765tWNw2-qlL8TKUP;Mon, 13 Apr 2020 06:52:47 +0300"},{"key":"x-yandex-front","line":"X-Yandex-Front: mxback10j.mail.yandex.net"},{"key":"x-yandex-timemark","line":"X-Yandex-TimeMark: 1586749967.518"},{"key":"dkim-signature","line":"DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=yandex.ru; s=mail; t=1586749967;bh=fu01yEogStbMqLllcYjEaWATh8v8Uzq5ta/slH2/mvU=;h=Subject:To:From:Message-ID:Date;b=DeJBsHdJ512GnGtDGNxHJIueUfi7MOvKXlUJBrbZ3OOd3rEqC6/2I9HqodvoLfzEM r4mDzmiNrkNTt5ozcBZSTRTt9dhbVUP+THF7sn17OVAxiPvAyo95yZjHtZxOmvwAu2 Q8har3CHywA+64lsFANyjgM9xqMXDtrvLcCUm9Fc="},{"key":"authentication-results","line":"Authentication-Results: mxback10j.mail.yandex.net; dkim=pass header.i=@yandex.ru"},{"key":"received","line":"Received: by sas1-e20a8b944cac.qloud-c.yandex.net (smtp/Yandex) with ESMTPSA id SEMTr9xRnV-qlWufFlR;Mon, 13 Apr 2020 06:52:47 +0300(using TLSv1.2 with cipher ECDHE-RSA-AES128-GCM-SHA256 (128/128 bits))(Client certificate not present)"},{"key":"x-yandex-timemark","line":"X-Yandex-TimeMark: 1586749967.124"},{"key":"x-yandex-suid-status","line":"X-Yandex-Suid-Status: 1 1238967317"},{"key":"x-yandex-spam","line":"X-Yandex-Spam: 1"},{"key":"content-type","line":"Content-Type: text/plain; charset=utf-8"},{"key":"from","line":"From: definbot@yandex.ru"},{"key":"to","line":"To: fin bot <definbot@yandex.ru>"},{"key":"subject","line":"Subject: finbot2 test"},{"key":"message-id","line":"Message-ID: <d8db587c-9165-9c27-6d28-97b67010a0d1@yandex.ru>"},{"key":"content-transfer-encoding","line":"Content-Transfer-Encoding: base64"},{"key":"date","line":"Date: Mon, 13 Apr 2020 03:52:46 +0000"},{"key":"mime-version","line":"MIME-Version: 1.0"},{"key":"return-path","line":"Return-Path: definbot@yandex.ru"}],"text":"Покупка: 1 000 RUB в BEELINE MOB. Карта *5015. Остаток 29 913.34 RUB","textAsHtml":"<p>&Pcy;&ocy;&kcy;&ucy;&pcy;&kcy;&acy;: 1 000 RUB &vcy; BEELINE MOB. &Kcy;&acy;&rcy;&tcy;&acy; *5015. &Ocy;&scy;&tcy;&acy;&tcy;&ocy;&kcy; 29 913.34 RUB</p>","subject":"finbot2 test","date":"2020-04-13T03:52:46.000Z","to":{"value":[{"address":"definbot@yandex.ru","name":"fin bot"}],"html":"<span class=\\"mp_address_group\\"><span class=\\"mp_address_name\\">fin bot</span> &lt;<a href=\\"mailto:definbot@yandex.ru\\" class=\\"mp_address_email\\">definbot@yandex.ru</a>&gt;</span>","text":"fin bot <definbot@yandex.ru>"},"from":{"value":[{"address":"definbot@yandex.ru","name":""}],"html":"<span class=\\"mp_address_group\\"><a href=\\"mailto:definbot@yandex.ru\\" class=\\"mp_address_email\\">definbot@yandex.ru</a></span>","text":"definbot@yandex.ru"},"messageId":"<d8db587c-9165-9c27-6d28-97b67010a0d1@yandex.ru>","html":false}'
 );
 for (let i = 0; i < emailSet.length; i++) {
   emailSet[i] = JSON.parse(emailSet[i], (k,v)=>{
     if (k == 'date') return new Date(v);
     return v;
   });
 }


describe('testEmailToSheet()', () => {

  beforeEach(()=>{
    ets = new EmailToSheet(optionsImap, optionsGoogle, dbh);
  })

  afterEach(()=>{
    ets.stop();
  })

  it("Test run", function() {
        let p = ets.run();
        return assert.isFulfilled(p);
  });

  it("Test catch on mail", function(done) {
        spyOnMail = sinon.spy();
        let p = ets.run();
        ets.on('mail', spyOnMail);
        ets.emit('mail', emailSet[0]);
        setTimeout(()=>{
            assert.deepEqual(1,spyOnMail.callCount);
            done();
        }, config.testTimeout)

  });

  it("Test catch on connected", function(done) {
        spyOnConnected = sinon.spy();
        let p = ets.run();
        ets.on('server:connected', spyOnConnected);
        setTimeout(()=>{
            assert.deepEqual(1,spyOnConnected.callCount);
            done();
        }, config.testTimeout)

  });

  it("Test catch on put data", function(done) {
        spyOnPut = sinon.spy();
        ets.on('parsed', spyOnPut);
        ets.run()
          .catch((err)=>{
            done(err);
          })
        ets.emit('mail', emailSet[0]);
        setTimeout(()=>{
            if (spyOnPut.callCount == 1 ) {
              assert.deepEqual('Put is ok', spyOnPut.args[0][0]);
            }
            done();
        }, config.testTimeout)
  });

  it("Test EmailToSheet.parse() returns obj with correct length", function(done) {

        ets.parse(emailSet[0])
          .then((parsed)=>{
            setTimeout(()=>{
                assert.deepEqual(8, parsed[0].length);
                console.log('Parsed: ', parsed);
                done();
            }, config.testTimeout)
          })
          .catch((err)=>{
            done(err);
          })


  });



})
