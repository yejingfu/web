#!/bin/bash

uglifyjs -c -m -o main.min.js lib/jquery-2.0.3.min.js lib/bootstrap.min.js lib/webrtc.io.min.js js/main.js

uglifycss css/main.css > main.min.css

