// npm install webworker-threads

var Worker = require('webworker-threads').Worker;

var company = 'Intel';

// |03|00|00|00|20|......|
var len = 20;
var buffer = new ArrayBuffer(len, 0);   // 0 -- initial value
var view = new DataView(buffer);
var int8view = new Int8Array(buffer);
view.setInt8(0, 0x03);
//view[0] = 0x03;
view.setInt32(1, 0x20);

var w = new Worker(function() {
  // in child thread
  console.log('[Worker]: begin...');
  //console.log('compnay in worker:' + company);   // failed
  // company = 'Intel Ltd';   // failed as well
  this.onmessage = function(e) {
    if (typeof e.data === 'string') {
      console.log('[Worker]: received: ' + e.data);
      postMessage('Echo: ' + e.data);
    } else {
      console.log('[Worker]:'); // + e.data.getInt8(0));  // failed to access typed buffer
    }
    self.close();  // exit thread, does not affect actually ?
  };
});

// in main thread
var view1 = new DataView(buffer);
console.log('view1[0]: '+ view1.getInt8(0));
console.log('view1[1]: ' + view1.getInt32(0));
console.log('int8view[4]:' + int8view[4]);

w.onmessage = function(e) {
  console.log('[Main]:'+e.data);
};
w.postMessage('Jingfu');
w.postMessage('Jingfu 2');
//w.postMessage(view1);  // DO NOT do that



