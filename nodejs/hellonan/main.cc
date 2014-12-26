#include <node.h>
#include <nan.h>

#include "./sync.h"
#include "./async.h"

using v8::FunctionTemplate;
using v8::Handle;
using v8::Object;
using v8::String;

void initialize(Handle<Object> exports) {
  exports->Set(NanNew<String>("calculateSync"),
	       NanNew<FunctionTemplate>(calculateSync)->GetFunction());

  exports->Set(NanNew<String>("calculateAsync"),
	       NanNew<FunctionTemplate>(calculateAsync)->GetFunction());
}

// The 'hellonan' is the module name which is defined in the 'binding.gyp'.
NODE_MODULE(hellonan, initialize)


