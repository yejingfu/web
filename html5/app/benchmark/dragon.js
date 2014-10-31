define(function(){
  var DragonInstance = function() {
    this.renderer = null;
    this.stage = null;
    this.assetLoader = null;
    this.background = null;
    this.background2 = null;
    this.foreground = null;
    this.foreground2 = null;
    this.scenePos = 0;
    this.ntf = null;
  };
  DragonInstance.prototype = {
    init: function(ctx) {
      this.renderer = ctx.renderer;
      this.stage = ctx.stage;
      this.ntf = ctx.notifications;
      this.assetLoader = new PIXI.AssetLoader(['data/bgtile.jpg', 'data/ground.png']);
      var self = this;
      this.assetLoader.onComplete = function() {
        self.background = PIXI.Sprite.fromImage('data/bgtile.jpg');
        self.background2 = PIXI.Sprite.fromImage('data/bgtile.jpg');
        self.foreground = PIXI.Sprite.fromImage('data/ground.png');
        self.foreground2 = PIXI.Sprite.fromImage('data/ground.png');
      };
      this.assetLoader.load();
    },

    start: function() {
      var self = this;
      self.stage.addChild(self.background);
      self.stage.addChild(self.background2);
      self.stage.addChild(self.foreground);
      self.stage.addChild(self.foreground2);
      self.foreground.position.y = self.foreground2.position.y = 640 - self.foreground2.height;

      this.ntf.update.add(function() {
        self.onUpdate();
      });
    },

    stop: function() {

    },

    onResize: function(width, height) {

    },

    onUpdate: function() {
      this.scenePos += 10;
      this.background.position.x = -(this.scenePos * 0.6);
      this.background.position.x %= 1286 * 2;
      if (this.background.position.x < 0)
        this.background.position.x += 1286 * 2;
      this.background.position.x -= 1286;

      this.background2.position.x = -(this.scenePos * 0.6) + 1286;
      this.background2.position.x %= 1286 * 2;
      if (this.background2.position.x < 0)
        this.background2.position.x += 1286 * 2;
      this.background2.position.x -= 1286;

      this.foreground.position.x = -this.scenePos;
      this.foreground.position.x %= 1286 * 2;
      if (this.foreground.position.x < 0)
        this.foreground.position.x += 1286 * 2;
      this.foreground.position.x -= 1286;

      this.foreground2.position.x = -this.scenePos + 1286;
      this.foreground2.position.x %= 1286 * 2;
      if (this.foreground2.position.x < 0)
        this.foreground2.position.x += 1286 * 2;
      this.foreground2.position.x -= 1286;
    }

  };

  return {
    createInstance: function() {
      return new DragonInstance();
    }
  };

});
