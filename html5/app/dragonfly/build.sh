#!/bin/bash

curDir="$(cd "$(dirname "$0")" && pwd)"
#echo $curDir
cd $curDir

# 1, clean
if [ -f "main.min.js" ]
then
  rm "main.min.js"
fi

if [ -f "sprites.wgt" ]
then
  rm "sprites.wgt"
fi

# 2, uglify
r.js -o optimize=uglify2 baseUrl=. name=main out=main.min.js

# 3, create wgt
zip -r dragonfly.wgt config.xml index.html *.png main.min.js style.css lib/* data/*

