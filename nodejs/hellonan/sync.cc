#include "./sync.h"
#include "./piest.h"

using v8::Number;

NAN_METHOD(calculateSync) {
  NanScope();
  int points = args[0]->Uint32Value();
  double est = estimate(points);
  NanReturnValue(NanNew<Number>(est));
}

