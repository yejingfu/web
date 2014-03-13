Overview
========
By building up this web site, I am aiming to showcase a simple demonstration about providing the 3D modeling capabilities by hosting ASM compontent at the server side.

## 1. Basic architecture
See the following figure which describes the basic architecture at both server side and client side.

![asm without creative platform](/static/img/asm_demo.png)

The server is built on `Node.js` and the `express` framework is adopted.

Overall there are two kinds of resources: 1). static resources such as js, css, images, and 2). dynamic resources mainly referring to the computation logics. The html files are dynamic as well since they are renderred by `ejs`.

I use `nginx` as the front-end server which acts in two roles: Firstly it would serve the static resource. The `nginx` is well known around the world because of its high performance, robustness and flexibility.  Secondly it can also used as the `load balancer` based on its reverse proxy functionality. In my case, it simply re-direct the dynamic requests to the back-end server.

The back-end is running Node.js server. The Node.js handles requests from clients in asynchroneous way. The high concurrency is obtained by using Node.js.

Behind the Node.js, the ASM addon is loaded and running as the solid modeling engine. In order to export the 3D modeling functionalities, a series of RESTful APIs are designed to wrap the real ASM addon. One example of the RESTful APIs is like below:

    GET '/asmpapi/primitives/block'   # return graphics data of block in JSON format.

The ASM addon is developped by C++ and loaded in `V8` environment so that the Javascript code can access the C++ functions. Some legacy codes from `Hickory` are reused here. The basic diagram is like below:

![asm addon](/static/img/asm_addon.png)

Probably the storage is needed at server side. I am planing to setup some popular database like `postgress` or `mongodb` for persistence. The ASM stream history and solid handle need to be stored. But not sure what others need storage as well.

The client side is almost responsible to retrieve 3D model and render in browser. The classic design pattern `MVC` is referenced here: The single 'Application' object is the entry point. The 'Document' object stores mesh data and modifications. The mesh data are firstly retrieved from server and the modified data can update to server (by calling PUT APIs).

The 'View' object is responsible to render the mesh. Currently the `Three.js` is used to do the work. Some camera operations and user interactive operations are supported as well within `Thee.js`.

## 2. Creative Platform version
The foundation of `Creative Platform(CP)` is composed of a series of basic `Library`. The libraries help users to build their own 3D application.

We have the plan to build the ASM into CP as one libray. I think that would give great benefit for the real customers to enhance their capability of solie modeling.

So far I have designed the framework of the ASM library but leave its implementation unfinished. I think Brandon will give more guidelines about that.

As my understanding, the ASM library can just run at server side, but not at client side. If we have ASM library in CP, we prefer to using it like below diagram:

![asm on creative platform](/static/img/asm_cp_demo.png)

Like this figure shows, the ASM library deponds on the `Core` library which make it easy and consistent to use the CP. The client side can also use the Core library in need.

## 3. Collaberation
The `collaberation` is the cooler feature to allow multiple users to operate the same document & model concurrently.
The modification made by one user can broatcast to all others so they can get the latest status at the same time.

The [`ShareJS`](http://sharejs.org) is used to implement the collaberation. In ShareJS each model operation is described by [`Operational Transformation(OT)`](http://en.wikipedia.org/wiki/Operational_transformation) (in JSON format) and then the OT data is sent to ShareJS server. The ShareJS server is responsible to broatcase the OT among all clients. The ShareJS server also support persistance and we just need to add database setting into its configuration during initialization stage.

    The solution is Operational Transformation (OT). If you haven’t heard of it, OT is a class of algorithms that do multi-site realtime concurrency. OT is like realtime git. It works with any amount of lag (from zero to an extended holiday). It lets users make live, concurrent edits with low bandwidth. OT gives you eventual consistency between multiple users without retries, without errors and without any data being overwritten.

The ShareJS server can be attached into the NodeJS server as a basic service component. The following chart illustrates the basic framework and how ShareJS clients interoperate with ShareJS server.

![ShareJS framework](/static/img/sharejs_frame.png)

* **ShareJS server**

The ShareJS server is embedded in the Node.js server, the following codes demonstrate how to setup the ShareJS server:

    var express = require('express');
    var sharejs = require('share').server;

    var app = express();
    var options = {db: {type: 'pg', uri: 'tcp://localhost/sharejsdb', create_tables_automatically: true}};
    sharejs.attach(app, options); // setup ShareJS server with connecting Postgress DB.
                                        // The DB is optional and don't use DB when set options to {db:{type:'none'}}
    http.createServer(app).listen('8080', function(){});

After the ShareJS server is running, it's resposible to store all OT data from clients and broatcast the OT data around all the client.

* **ShareJS client**

The ShareJS clients firstly need to connect to the server and listen on the connection or `channel` in realtime. The following sample codes demonstrate how to setup the connection. The connection is based on the socket communication.

    <script type="text/javascript" src="/static/js/libs/sharejs/bcsocket.js"></script>
    <script type="text/javascript" src="/static/js/libs/sharejs/share.js"></script>
    <script type="text/javascript" src="/static/js/libs/sharejs/json.js"></script>

    <script type="text/javascript">
        $(document).ready(function(){
            var sharejsChannel = 'http://10.148.218.224:8080/channel';
            var id = '46a910fc-d481-41e1-b06c-26cb9a9e62c4';
            sharejs.open(id, 'json', sharejsChannel, function(err, doc) {
                if (doc.created) {
                    console.log('This ShareJS document does not exist at the first client accessing, so ShareJS server would create the document and set its created flag to true');
                } else {
                    console.log('The ShareJS document already exists, so its created flag is false.');
                }
                doc.on('change', function(op) {...});
            });
        });
    </script>

The ShareJS keeps the very high flexibility of defining the ShareJS document. For example, since we need to store the ASM primitives, we can define the ShareJS document like below.

    {'primitives': [
        {'asmhandle': '2f457a', 'xform': [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},
        {'asmhandle': '4c681b', 'xform': [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},
        {'asmhandle': '9c873e', 'xform': [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}
    ]}

Then all the ASM operations can be encapsulated in the atomic OT and sent to ShareJS server. Each OT is aiming to add, remove, or modify the ShareJS document.

For example, when one ASM model is transformed, its BODY handle and the new transform matrix are wrapped in JSON and sent to the ShareJS server. Other clients would immediately receive the same updated OT.

The codes of sending out ASM transformation are as below.

    // modify the 1st element within the document. E.g. change its xform
    var newXform = [1,0,0,0,0,1,0,0,0,0,1,0,2.3,3.9,0.8,1];
    // "p" - "path";    "o" - "object";     "d" - "delete";     "i" - "insert";    "l" - "list";
    var op = {p:['primitives', 1, 'xform'], od: null, oi:newXform};
    doc.submitOp([op]);

And the following codes add a new ASM body at the end.

    var newPrimitive = {asmhandle:'8b391f', xform:[1,0,0,0,0,1,0,0,0,0,1,0,2.3,3.9,0.8,1]};
    var op = {p:['primitives', 3], li:newPrimitive};
    doc.submitOp([op]);
