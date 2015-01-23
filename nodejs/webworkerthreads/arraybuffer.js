// conversion between ArrayBuffer and String

function buf2str(buf) {
  var view = new Uint16Array(buf);
  var str = String.fromCharCode.apply(null, view);
  return str;
}

function str2buf(str) {
  var len = str.length * 2;  // 2 bytes per charactor
  var buf = new ArrayBuffer(len);
  var view = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    view[i] = str.charCodeAt(i);
  }
  return buf;
}

function test() {
  var str = "Hello World";
  var buf = str2buf(str);
  var view = new Uint16Array(buf);
  //console.log('buf keys:' + view.keys().toString());

  var str2 = buf2str(buf);
  console.log('str2: ' + str2);
  if (str === str2) {
    console.log('str === str2');
  }

  //var view2 = new Uint8Array([0, 1, 2, 3]);
  //var total = view2.reduce(function(a, b) { return a + b; } );
  //console.log('total: ' + total);
}


test();

