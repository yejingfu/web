Overview
========
By building up this web site, I am aiming to showcase a simple demonstration about providing the 3D modeling capabilities by hosting ASM compontent at the server side.

## 1. Basic architecture
See the following figure which describes the basic architecture at both server side and client side.

![](/static/img/asm_demo.png)

The server is built on `Node.js` and the `express` framework is adopted.

Overall there are two kinds of resources: 1). static resources such as js, css, images, and 2). dynamic resources mainly referring to the computation logics. The html files are dynamic as well since they are renderred by `ejs`.

I use `nginx` as the front-end server which acts in two roles: Firstly it would serve the static resource. The `nginx` is well known around the world because of its high performance, robustness and flexibility.  Secondly it can also used as the `load balancer` based on its reverse proxy functionality. In my case, it simply re-direct the dynamic requests to the back-end server.

The back-end is running Node.js server. The Node.js handles requests from clients in asynchroneous way. The high concurrency is obtained by using Node.js.

Behind the Node.js, the ASM addon is loaded and running as the solid modeling engine. In order to export the 3D modeling functionalities, a series of RESTful APIs are designed to wrap the real ASM addon. One example of the RESTful APIs is like below:

    GET '/asmpapi/primitives/block'   # return graphics data of block in JSON format.

The ASM addon is developped by C++ and loaded in `V8` environment so that the Javascript code can access the C++ functions. Some legacy codes from `Hickory` are reused here. The basic diagram is like below:

![](/static/img/asm_addon.png)

Probably the storage is needed at server side. I am planing to setup some popular database like `postgress` or `mongodb` for persistence. The ASM stream history and solid handle need to be stored. But not sure what others need storage as well.

The client side is almost responsible to retrieve 3D model and render in browser. The classic design pattern `MVC` is referenced here: The single 'Application' object is the entry point. The 'Document' object stores mesh data and modifications. The mesh data are firstly retrieved from server and the modified data can update to server (by calling PUT APIs).

The 'View' object is responsible to render the mesh. Currently the `Three.js` is used to do the work. Some camera operations and user interactive operations are supported as well within `Thee.js`.

## 2. Creative Platform version
The foundation of `Creative Platform(CP)` is composed of a series of basic `Library`. The libraries help users to build their own 3D application.

We have the plan to build the ASM into CP as one libray. I think that would give great benefit for the real customers to enhance their capability of solie modeling.

So far I have designed the framework of the ASM library but leave its implementation unfinished. I think Brandon will give more guidelines about that.

As my understanding, the ASM library can just run at server side, but not at client side. If we have ASM library in CP, we prefer to using it like below diagram:

![](/static/img/asm_cp_demo.png)

Like this figure shows, the ASM library deponds on the `Core` library which make it easy and consistent to use the CP. The client side can also use the Core library in need.

## 3. Collaberation
The `collaberation` is the cooler feature to allow multiple users to operate the same document & model concurrently.
The modification made by one user can broatcast to all others so they can get the latest status at the same time.

The [`ShareJS`](http://sharejs.org) is used to implement the collaberation. In ShareJS each model operation is described by `Operational Transformation(OT)` (in JSON format) and then the OT data is sent to ShareJS server. The ShareJS server is responsible to broatcase the OT among all clients. The ShareJS server also support persistance and we just need to add database setting into its configuration during initialization stage.