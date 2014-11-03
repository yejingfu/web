define(function(){
  var DragonInstance = function() {
    this.renderer = null;
    this.stage = null;
    this.canWidth = 0;
    this.canHeight = 0;
    this.imgWidth = 1286;
    this.imgHeight = 640;
    this.assetLoader = null;
    this.background = null;
    this.background2 = null;
    this.background3 = null;
    this.foreground = null;
    this.foreground2 = null;
    this.foreground3 = null;
    this.dragon = null;
    this.ntf = null;
    this.started = false;
  };
  DragonInstance.prototype.constructor = DragonInstance;
  DragonInstance.prototype = {
    init: function(ctx) {
      this.renderer = ctx.renderer;
      this.stage = ctx.stage;
      this.ntf = ctx.notifications;
      this.canWidth = this.renderer.view.width;
      this.canHeight = this.renderer.view.height;
      this.assetLoader = new PIXI.AssetLoader(['data/bgtile.jpg', 'data/ground.png', 
        'data/dragonbones.json', 'data/dragonbones.anim']);
      var self = this;
      //this.assetLoader.onComplete = function() {
      this.assetLoader.on('onComplete', function() {
        self.background = PIXI.Sprite.fromImage('data/bgtile.jpg');
        self.background2 = PIXI.Sprite.fromImage('data/bgtile.jpg');
        self.background3 = PIXI.Sprite.fromImage('data/bgtile.jpg');
        self.foreground = PIXI.Sprite.fromImage('data/ground.png');
        self.foreground2 = PIXI.Sprite.fromImage('data/ground.png');
        self.foreground3 = PIXI.Sprite.fromImage('data/ground.png');

        // dragon
        self.dragon = new PIXI.Spine('data/dragonbones.anim');
        self.dragon.position.x = self.imgWidth / 3;
        self.dragon.position.y = self.imgHeight - self.dragon.height / 2;   //self.imgHeight / 2 + 80;
        //var rc = self.dragon.getBounds();
        self.dragon.scale.x = self.dragon.scale.y = 0.5;
        self.dragon.anchor = new PIXI.Point(0.5, 0.5);
        self.dragon.state.setAnimationByName('flying', true);
      });
      this.assetLoader.load();
    },

    start: function() {
      var self = this;
      if (this.started)
        return true;
      this.started = true;
      var _onStart = function() {
        self.stage.addChild(self.background);
        self.stage.addChild(self.background2);
        self.stage.addChild(self.background3);
        self.stage.addChild(self.foreground);
        self.stage.addChild(self.foreground2);
        self.stage.addChild(self.foreground3);
        self.foreground.position.y = 
        self.foreground2.position.y = 
        self.foreground3.position.y = 640 - self.foreground2.height;

        self.stage.addChild(self.dragon);

        self.ntf.update.add(DragonInstance.prototype.onUpdate, self);
        self.ntf.resize.add(DragonInstance.prototype.onResize, self);
        self.ntf.keyDown.add(DragonInstance.prototype.onKeyDown, self);
        self.ntf.keyUp.add(DragonInstance.prototype.onKeyUp, self);
      };

      if (self.assetLoader.loadCount > 0) {
        self.assetLoader.on('onComplete', function() {
          _onStart();
        });
      } else {
        _onStart();
      }
    },

    stop: function() {
      if (!this.started)
        return;
      this.started = false;
      this.stage.removeChild(this.background);
      this.stage.removeChild(this.background2);
      this.stage.removeChild(this.background3);
      this.stage.removeChild(this.foreground);
      this.stage.removeChild(this.foreground2);
      this.stage.removeChild(this.foreground3);
      this.stage.removeChild(this.dragon);
      this.ntf.update.remove(DragonInstance.prototype.onUpdate, this);
      this.ntf.resize.remove(DragonInstance.prototype.onResize, this);
      this.ntf.keyDown.remove(DragonInstance.prototype.onKeyDown, this);
      this.ntf.keyUp.remove(DragonInstance.prototype.onKeyUp, this);
    },

    onKeyDown: function(e) {
      if (e.keyCode === 38) { // arrow up
        this.dragon.position.y -= 5;
        if (this.dragon.position.y < this.dragon.height)
          this.dragon.position.y = this.dragon.height;
      } else if (e.keyCode === 40) { // arrow down
        this.dragon.position.y += 5;
        if (this.dragon.position.y > this.imgHeight)
          this.dragon.position.y = this.imgHeight;
      }
    },

    onKeyUp: function(e) {

    },

    onResize: function(width, height) {
      this.canWidth = width;
      this.canHeight = height;
      if (this.imgWidth > this.canWidth) {
        if (this.stage.children.indexOf(this.background3) >= 0) {
          this.stage.removeChild(this.background3);  //this.background3.visible = false;
          this.background.position.x = 0;
        }
        if (this.stage.children.indexOf(this.foreground3) >= 0) {
          this.stage.removeChild(this.foreground3);
          this.foreground.position.x = 0;
        }
      } else {
        if (this.stage.children.indexOf(this.background3) === -1) {
          this.stage.addChildAt(this.background3, this.stage.getChildIndex(this.foreground));//this.background3.visible = true;
          this.background.position.x = 0;
        }
        if (this.stage.children.indexOf(this.foreground3) === -1) {
          this.stage.addChildAt(this.foreground3, this.stage.getChildIndex(this.foreground2));
          this.foreground3.position.y = 640 - this.foreground3.height;
          this.foreground.position.x = 0;
        }
      }
    },

    onUpdate: function() {
      var self = this;
      var setPosition = function(p1, p2, p3, delta) {
        p1.position.x -= delta;
        if (self.imgWidth < this.canWidth) {
          if (p1.position.x + self.imgWidth * 3 < self.canWidth)
            p1.position.x += self.imgWidth * 3;

          if (p1.position.x > 0) {
            p3.position.x = p1.position.x - self.imgWidth;
            if (p1.position.x + self.imgWidth > self.canWidth) {
              p2.position.x = p1.position.x - self.imgWidth * 2;
            } else {
              p2.position.x = p1.position.x + self.imgWidth;
            }
          } else {
            p2.position.x = p1.position.x + self.imgWidth;
            p3.position.x = p1.position.x + self.imgWidth * 2;
          }
        } else {
          if (p1.position.x + self.imgWidth* 2 < self.canWidth)
            p1.position.x += self.imgWidth * 2;
          if (p1.position.x > 0)
            p2.position.x = p1.position.x - self.imgWidth;
          else
            p2.position.x = p1.position.x + self.imgWidth;
        }
      }

      setPosition(this.background, this.background2, this.background3, 6);
      setPosition(this.foreground, this.foreground2, this.foreground3, 10);




    }

  };

  return {
    createInstance: function() {
      return new DragonInstance();
    }
  };

});
