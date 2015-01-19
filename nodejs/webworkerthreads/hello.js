// npm install webworker-threads

var Worker = require('webworker-threads').Worker;

var company = 'Intel';

var w = new Worker(function() {
  // in child thread
  console.log('Worker is trying to access global variable:');
  //console.log('compnay in worker:' + company);   // failed
  company = 'Intel Ltd';   // failed as well
  postMessage('Greeting from worker before postMessage');
  this.onmessage = function(e) {
    postMessage('Hi ' + e.data);
    self.close();
  };
});

// in main thread
w.onmessage = function(e) {
  console.log('Msg received from worker:'+e.data);
  console.log('company in main 2: ' + company);
};
w.postMessage('Jingfu');

console.log('company in main: ' + company);

