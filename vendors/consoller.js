let config = require('../app/config').config
require('console-stamp')( console, { pattern : "yyyy-mm-dd HH:MM:ss.l" } );

let consoller = {
  log(){
    console.log.apply(this, arguments);
  },
  warn(){
    if (config.debug == 1) {
      console.warn.apply(this, arguments);
    }
  },
  err(){
    if (config.debug == 1) {
      console.error.apply(this, arguments);
    }
  }
}

module.exports = {consoller}
