# This is the GO sample codes written by yejingfu
## fifo
The sample codes for named pipe, including client side and server side.
The server side create a named pipe file by "mkfifo" and listen on it.
The Client side open the named pipe file and write strings into it.

## socket
This is demostrating how socket is working.
The server side create a socket file and listen on it. It also register server functions via RPC..
The client side open the socket file and write strings to it.

## thread
Sample codes about how multi-threads are co-working.
The GO channel is the language level technique used to communiate between threads.
The other techinques are included under the "sync" package which are low level functions:
* Mutex
* RWMutex
* Cond
* WaitGroup
* Once
* atomic

==========
# Further reading
* [Go Web编程](https://github.com/astaxie/build-web-application-with-golang)
