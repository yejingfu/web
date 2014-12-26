#include "./async.h"
#include "./piest.h"

using v8::Function;
using v8::Local;
using v8::Null;
using v8::Number;
using v8::Value;

class PiWorker : public NanAsyncWorker {
public:
  PiWorker(NanCallback *callback, int points)
    : NanAsyncWorker(callback)
    , points(points)
    , result(0) {
  }

  ~PiWorker() {}

  void Execute() {
    result = estimate(points);
  }

  void HandleOKCallback() {
    NanScope();
    Local<Value> argv[] = {
      NanNull(),
      NanNew<Number>(this->result)
    };
    callback->Call(2, argv);
  }

private:
  int points;
  double result;

};

NAN_METHOD(calculateAsync) {
  NanScope();
  int points = args[0]->Uint32Value();
  NanCallback *callback = new NanCallback(args[1].As<Function>());
  NanAsyncQueueWorker(new PiWorker(callback, points));
  NanReturnUndefined();
}

