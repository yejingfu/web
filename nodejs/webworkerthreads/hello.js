// npm install webworker-threads

var Worker = require('webworker-threads').Worker;

var company = 'Intel';
var buffer = new ArrayBuffer(12, 0);
var view = new DataView(buffer);
view.setInt8(0, 0x03);
//view[0] = 123;
view.setFloat32(1, 11.2);

var w = new Worker(function() {
  // in child thread
  console.log('Worker is trying to access global variable:');
  //console.log('compnay in worker:' + company);   // failed
  company = 'Intel Ltd';   // failed as well
  postMessage('Greeting from worker before postMessage');
  this.onmessage = function(e) {
    if (typeof e.data === 'string') {
      console.log('hi');
      postMessage('Hi ' + e.data);
    } else {
      console.log('Hi 2:');// + e.data.getFloat32(1));
    }
    self.close();
  };
});

// in main thread
var view1 = new DataView(buffer);
console.log('view1[0]: '+ view1.getInt8(0));
console.log('view1[1]: ' + view1.getFloat32(1));

w.onmessage = function(e) {
  console.log('Msg received from worker:'+e.data);
  console.log('company in main 2: ' + company);
};
//w.postMessage('Jingfu');
w.postMessage(view1);

console.log('company in main: ' + company);

console.log('===========ArrayBuffer Example 2 ==========');
var buff2 

