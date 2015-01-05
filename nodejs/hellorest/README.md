restify samples
========================

#### Install restify
```bash
$ npm install restify
```

#### Rest Client tools: `curl` or `postman`.

#### Create a simple restify server: 

* Source code: [helloworld.js](helloworld.js)
* Client tests:
  ``` bash
  $ curl -is http://localhost:8080/hello/mark -H 'accept: text/plain'
  $ curl -is http://localhost:8080/hello/mark
  ## HEAD method, the 'conneciton:close' make the server return right away.
  $ curl -is http://localhost:8080/hello/mark -X HEAD -H 'connection: close'
  ```



