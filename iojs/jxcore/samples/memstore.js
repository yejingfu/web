console.log('=========== test memory storage===========');

jxcore.store.set('simplekey', 'Jeff Ye');

var obj = {val1: "one", val2 : 2, arr : [ 3, 4, 5]};
jxcore.store.set('complexkey', JSON.stringify(obj));
obj = null;   // don't affect stored value

var strSimple = jxcore.store.read('simplekey');          // read() don't remove from store
var strSimple2 = jxcore.store.read('simplekey');
var strObj = jxcore.store.get('complexkey');          // get() would remove from store
var strObj2 = jxcore.store.get('complexkey');          // undefined !!

console.log('simplekey:' + strSimple);
console.log('simplekey(2):' + strSimple2);
console.log('complexkey:' + strObj);
console.log('complexkey(2):' + strObj2);


