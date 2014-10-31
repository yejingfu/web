// the main of require.js
// the "baseUrl" attribute will be set this same folder as requiremain.js.

requirejs.config({
    baseUrl: '.',
    paths: {
        lib: 'lib'
    }
});

requirejs(['ball'], function(ballLib) {

  var canWidth = 800;
  var canHeight = 600;
  //  var renderer = new PIXI.CanvasRenderer(canWidth, canHeight);
  //var renderer = new PIXI.WebGLRenderer(canWidth, canHeight);
  var renderer = new PIXI.autoDetectRenderer(canWidth, canHeight);
  if (renderer instanceof PIXI.WebGLRenderer) {
    console.log('PIXI is using WebGL as renderer engine');
  } else {
    console.log('PIXI is using Canvas 2D as Renderer engine');
    renderer.context.mozImageSmoothingEnabled = false;
    renderer.context.webkitImageSmoothingEnabled = false;
  }
  //renderer.view.className = 'rendererView';

  var stage = new PIXI.Stage(0xFFFFFF);
  
  document.body.appendChild(renderer.view);
  //$('body').append(renderer.view);
  renderer.view.style.position = 'absolute';

  var stats = new Stats();
  document.body.appendChild(stats.domElement);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';

  var ballMgr = ballLib.createMgr();
  ballMgr.init(renderer, stage);

  $(renderer.view).mousedown(function(e) {
    ballMgr.onMouseDown(e);
  });
  $(renderer.view).mouseup(function(e) {
    ballMgr.onMouseUp(e);
  });
  document.addEventListener('touchstart', function(e) {
    console.log('touchstart');
  }, true);
  document.addEventListener('touchend', function(e) {
    console.log('touchend');
  }, true);

  var update = function() {
    stats.begin();
    ballMgr.onUpdate();
    renderer.render(stage);
    requestAnimFrame(update);
    stats.end();
  };

  var resize = function() {
    var w = $(window).width();
    var h = $(window).height();
    if (w > 800) w = 800;
    if (h > 600) h = 600;
    var l = ($(window).width() - w) / 2;
    var t = ($(window).height() - h) / 2;
    renderer.view.style.left = l + 'px';
    renderer.view.style.top = t + 'px';
    renderer.view.style.width = w + 'px';
    renderer.view.style.height = h + 'px';
    renderer.resize(w, h);
    stats.domElement.style.left = l + 'px';
    stats.domElement.style.top =  t + 'px';
    ballMgr.onResize(w, h);
  };

  $(window).resize(resize);

  resize();
  update();

});
