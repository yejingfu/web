// the main of require.js
// the "baseUrl" attribute will be set this same folder as requiremain.js.

requirejs.config({
    baseUrl: '.',
    paths: {
        lib: 'lib'
    }
});

requirejs(['ball', 'dragon', 'lib/signals'], function(ballLib, dragonLib, sigLib) {

  var SceneEnum = {
    ball: 'ball',
    dragon: 'dragon'
  };

  var currentScene = SceneEnum.ball;

  var context = {};

  context.notifications = {
    mouseDown: new sigLib.Signal(),
    mouseUp: new sigLib.Signal(),
    mouseMove: new sigLib.Signal(),
    touchStart: new sigLib.Signal(),
    touchEnd: new sigLib.Signal(),
    keyDown: new sigLib.Signal(),
    keyUp: new sigLib.Signal(),
    resize: new sigLib.Signal(),
    update: new sigLib.Signal()
  };
  
  //var canWidth = 800;
  //var canHeight = 600;
  //  var renderer = new PIXI.CanvasRenderer(canWidth, canHeight);
  //var renderer = new PIXI.WebGLRenderer(canWidth, canHeight);
  var w = $(window).width();
  var h = $(window).height();
  var renderer = new PIXI.autoDetectRenderer(w, h);
  if (renderer instanceof PIXI.WebGLRenderer) {
    console.log('PIXI is using WebGL as renderer engine');
  } else {
    console.log('PIXI is using Canvas 2D as Renderer engine');
    renderer.context.mozImageSmoothingEnabled = false;
    renderer.context.webkitImageSmoothingEnabled = false;
  }
  renderer.view.className = 'rendererView';
  context.renderer = renderer;

  var stage = new PIXI.Stage(0xFFFFFF);
  context.stage = stage;
  
  document.body.appendChild(renderer.view);
  //$('body').append(renderer.view);
  renderer.view.style.position = 'absolute';

  var stats = new Stats();
  document.body.appendChild(stats.domElement);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';

  var ballMgr = ballLib.createMgr();
  ballMgr.init(context);
  var dragonInst = dragonLib.createInstance();
  dragonInst.init(context);

  $(renderer.view).mousedown(function(e) {
    context.notifications.mouseDown.dispatch(e);
  });
  $(renderer.view).mouseup(function(e) {
    context.notifications.mouseUp.dispatch(e);
  });
  document.addEventListener('touchstart', function(e) {
    console.log('touchstart');
    context.notifications.touchStart.dispatch(e);
  }, true);
  document.addEventListener('touchend', function(e) {
    console.log('touchend');
    context.notifications.touchEnd.dispatch(e);
  }, true);
  document.addEventListener('keydown', function(e) {
    context.notifications.keyDown.dispatch(e);
  }, true);
  document.addEventListener('keyup', function(e) {
    context.notifications.keyUp.dispatch(e);
  }, true);

  var update = function() {
    stats.begin();
    context.notifications.update.dispatch();
    renderer.render(stage);
    requestAnimFrame(update);
    stats.end();
  };

  var resize = function() {
    canWidth = $(window).width();
    canHeight = $(window).height();
    var l = 10;
    var t = 10;
    var w = canWidth - 20;
    var h = canHeight - 20;
    renderer.view.style.left = l + 'px';
    renderer.view.style.top = t + 'px';
    renderer.view.style.width = w + 'px';
    renderer.view.style.height = h + 'px';
    renderer.resize(w, h);
    stats.domElement.style.left = l + 'px';
    stats.domElement.style.top =  t + 'px';
    context.notifications.resize.dispatch(w, h);
  };
  $(window).resize(resize);  // event binding

  var changeScene = function() {
    ballMgr.stop();
    dragonInst.stop();
    if (currentScene === SceneEnum.ball)
        ballMgr.start();
    else if (currentScene === SceneEnum.dragon)
        dragonInst.start();
  };

  context.notifications.keyDown.add(function(e) {
    if (e.keyCode === 'B'.charCodeAt(0)) {
      currentScene = SceneEnum.ball;
      changeScene();
    } else if (e.keyCode === 'D'.charCodeAt(0)) {
      currentScene = SceneEnum.dragon;
      changeScene();
    }
  });
  changeScene();
  
  resize();
  update();

});
