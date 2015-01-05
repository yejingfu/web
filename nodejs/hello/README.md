How to setup server
=======================

Probably you need to install some dependencies:
```bash
$ npm install formidable
```
[formidable](https://github.com/felixge/node-formidable) is a popular module for parsing form data, especially file uploads.

Start server from console:
```bash
$ node index.js
```

Test from client by browser: open URL "http://localhost:3010" in browser.

Router:
- GET "/" : index page
- POST "/upload" : upload file
- GET "/show" : show content of a file

This is my first node application running at server side, listing port 3010.
access the applicaiton: http://localhost:3010


