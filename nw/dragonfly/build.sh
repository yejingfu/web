#!/bin/bash

curDir="$(cd "$(dirname "$0")" && pwd)"
#echo $curDir
cd $curDir

echo "test"
nwPath=$NodeWebkit

if [ $nwPath == ""]; then
  echo "Please set nw bin path to environment variable: NodeWebkit like:"
  echo "\"export NodeWebkit=/path/to/nw\""
  exit
fi

# 1, clean
if [ -f "main.min.js" ]
then
  rm "main.min.js"
fi

if [ -d "out" ]
then
  rm -r out
fi

mkdir out

# 2, uglify
r.js -o optimize=uglify2 baseUrl=. name=main out=main.min.js

# 3, create wgt
zip -r out/dragonfly.zip package.json index.html *.png main.min.js style.css lib/* data/*

cat $nwPath/nw out/dragonfly.zip > out/dragonfly
cp $nwPath/* out/
rm out/nw
rm out/dragonfly.zip
chmod +x out/dragonfly

