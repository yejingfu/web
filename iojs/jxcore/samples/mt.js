/**
* run:
* $ jx mt.js
*/

var globalVal = 'global';  // cannot be accessed from sub thread

var method = function(_input) {
  console.log('In sub thread: ' + process.threadId);
  //console.log('global value: ' + globalVal);  // ReferenceError: globalVal is not defined
  console.log('input: ' + JSON.stringify(_input));
  var out = {result: 'greeting from sub thread!'};
  return out;
};

var input = {msg: 'Hello World'};
jxcore.tasks.addTask(method, input, function(res) {
  console.log('Main ' + process.threadId + ': back from child: ' + JSON.stringify(res));
});

console.log('In main thread:' + process.threadId);

