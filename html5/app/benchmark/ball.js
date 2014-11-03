define(function(){

  var BallMgr = function() {
    this.renderer = null;
    this.stage = null;
    this.container = null;
    this.spriteTex = null;
    this.divCounter = null;
    this.divCounterSuffix = ' balls';
    this.sprites = [];
    this.incremental = 50;
    this.isAdding = false;
    this.canWidth = 0;
    this.canHeight = 0;
    this.ntf = null;
    this.isStarted = false;
  };
  BallMgr.prototype = {
    init: function(ctx) {
      console.log('BallMgr::init()');
      this.renderer = ctx.renderer;
      this.stage = ctx.stage;
      this.ntf = ctx.notifications;

      this.divCounter = document.createElement('div');
      this.divCounter.className = 'counter';
      
      this.container = new PIXI.SpriteBatch();   // new PIXI.DisplayObjectContainer();
      this.spriteTex = new PIXI.Texture.fromImage('ball32.png');
      for (var i = 0; i < 2; i++) {
        var sprite = this.createSprite();
        this.sprites.push(sprite);
        this.container.addChild(sprite);
      }

      if (this.renderer instanceof PIXI.WebGLRenderer)
        this.divCounterSuffix += '(W)';
      else
        this.divCounterSuffix += '(C)';
    },

    start: function() {
      if (this.isStarted)
        return;
      this.isStarted = true;
      document.body.appendChild(this.divCounter);
      this.stage.addChild(this.container);
      this.ntf.mouseDown.add(BallMgr.prototype.onKeyDown, this);
      this.ntf.mouseUp.add(BallMgr.prototype.onKeyUp, this);
      this.ntf.resize.add(BallMgr.prototype.onResize, this);
      this.ntf.update.add(BallMgr.prototype.onUpdate, this);
    },

    stop: function() {
      if (!this.isStarted)
        return;
      this.isStarted = false;
      document.body.removeChild(this.divCounter);
      this.stage.removeChild(this.container);
      if (this.sprites.length > 2) {
        this.container.removeChildren(2);  // from #1 to end
        this.sprites.splice(2, this.sprites.length - 2);
      }
      this.ntf.mouseDown.remove(BallMgr.prototype.onKeyDown, this);
      this.ntf.mouseUp.remove(BallMgr.prototype.onKeyUp, this);
      this.ntf.resize.remove(BallMgr.prototype.onResize, this);
      this.ntf.update.remove(BallMgr.prototype.onUpdate, this);
    },

    onKeyDown: function(e) {
      this.isAdding = true;
    },

    onKeyUp: function(e) {
      this.isAdding = false;
    },

    onResize: function(width, height) {
      this.canWidth = width;
      this.canHeight = height;
      if (this.renderer) {
        var left = this.renderer.view.offsetLeft;
        var top = this.renderer.view.offsetTop;
        //$(this.divCounter).css({left: left, top: top});
        this.divCounter.style.left = left+'px';
        this.divCounter.style.top = top + 50 + 'px';
        this.updateCounter();
      }
    },

    onUpdate: function() {
      
      if (this.isAdding) {
        for (var i = 0; i < this.incremental; i++) {
          var sprite = this.createSprite();
          this.sprites.push(sprite);
          this.container.addChild(sprite);
        }
        this.updateCounter();
      }
      for (var i = 0, len = this.sprites.length; i < len; i++) {
        var sprite = this.sprites[i];
        sprite.position.x += sprite.speedX;
        sprite.position.y += sprite.speedY;
        sprite.speedY += 0.75;
        sprite.rotation += 0.1;
        if (sprite.position.x > this.canWidth) {
          sprite.speedX *= -1;
          sprite.position.x = this.canWidth;
        } else if (sprite.position.x < 0) {
          sprite.speedX *= -1;
          sprite.position.x = 0;
        }
        if (sprite.position.y > this.canHeight) {
          sprite.speedY *= -0.85;
          sprite.position.y = this.canHeight;
          sprite.spin = (Math.random() - 0.5) * 0.2;
          if (Math.random() > 0.5)
            sprite.speedY -= Math.random() * 6;
        } else if (sprite.position.y < 0) {
          sprite.speedY = 0;
          sprite.position.y = 0;
        }
      }
    },

    updateCounter: function() {
      this.divCounter.innerHTML = this.sprites.length + this.divCounterSuffix;
    },

    createSprite: function() {
      var sprite = new PIXI.Sprite(this.spriteTex);
      sprite.speedX = Math.random() * 10;
      sprite.speedY = Math.random() * 10 - 5;
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;
      return sprite;
    }
  };

  return {
    createMgr: function() {
      return new BallMgr();
    }
  };

});
