Example of creating simple Node.jS addon with nan
=====================================================

#### preparation

- [offical doc](http://nodejs.org/api/addons.html)

- [example](http://code.tutsplus.com/tutorials/writing-nodejs-addons--cms-21771)

- Install `node-gyp`

``` bash
$ npm install -g node-gyp
$ sudo apt-get intall build-essentials    ## maybe required on ubuntu
```

Note if failed to install node-gyp because of proxy setting, please manually set proxy like:
``` bash
$ sudo npm config set proxy http://proxy-shz.intel.com:911
$ sudo npm config set https-proxy https://proxy-shz.intel.com:911
```

#### How to

- Create a "package.json"

``` bash
  "dependencies": {
    "nan": "*"
  }
```

- Create binding.gyp

``` yaml
  "include_dirs" : [
      "<!(node -e \"require('nan')\")"
  ]
```

The `<!(node -e \"require('nan')\")` can get the path of module `nan'. This works like a `-I<path-to-NAN>` when compiling your addon.

- Code cpp entry: main.cc

- Code js demonstration (sample): main-demo.js which invoke exposed API from man.cc

- Code cpp sources: piest.h|.cc, sync.h|.cc, async.h|.cc

- install nan

``` bash
$ npm install --save nan
```

- Build

```bash
$ node-gyp configure
$ node-gyp build  ## or
$ node-gyp build --debug
## or a single line
$ node-gyp configure build
```

  The `hello.node ` would be created at `build/Release/`.

- Run demo
``` bash
$ node main-demo.js
```

For more example, see [node-addon-examples](https://github.com/yejingfu/node-addon-examples)



