// demonstration of async & closure
// closure let function access variables outside it.

var greetingAsync = function() {
  var msg = 'Hello World';
  console.log('Begin!');
  for (var i = 0; i < 10; i++) {
    (function(index){
      setTimeout(function(){
        console.log('Greeting ' + index + ':'  + msg);
      }, 1000 * index);
    })(i);
  }
  console.log('End!');
};

greetingAsync();

