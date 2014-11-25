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
    this.sliderbar = null;
    this.bigNumber = Math.pow(10, 4);
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
      this.showSlider();
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
      this.hideSlider();
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
      //self.isPrime(self.bigNumber);
      self.factorial(self.bigNumber);
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
    },

    showSlider: function() {
      var self = this;
      if (!this.sliderbar) {
        var html = '<div id="sliderContainer" style="position:absolute; visibility:hidden;">'+
                   '<p><input type="text" id="slideramount" readonly style="border:0; opacity:0.4; width:50px;"></p>'+
                   '<div id="divSliderbar" style="height:100px; width:8px;"></div></div>';
        $('body').append(html);
        this.sliderbar = $('#sliderContainer');
        this.sliderbar.offset({left: 20, top: 60});
        $('#divSliderbar').slider({
          orientation: 'vertical',
          range: 'min',
          min: self.bigNumber,
          max: Math.pow(10, 6),
          value: self.bigNumber,
          slide: function(event, ui) {
            $('#slideramount').val(ui.value);
            self.bigNumber = ui.value;
          }
        });
        $('#slideramount').val($('#divSliderbar').slider('value'));
      }
      this.sliderbar.css('visibility', 'visible');
    },

    hideSlider: function() {
      if (this.sliderbar) {
        this.sliderbar.css('visibility', 'hidden');
      }
    },

    isPrime: function(n, speed) {
      if (speed === 'fast') {
        if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false; 
        if (n%2==0) return (n==2);
        if (n%3==0) return (n==3);
        var m=Math.sqrt(n);
        for (var i=5;i<=m;i+=6) {
          if (n%i==0)     return false;
          if (n%(i+2)==0) return false;
        }
        return true;
      } else if (speed === 'middle') {
        if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false; 
        if (n%2==0) return (n==2);
        var m=Math.sqrt(n);
        for (var i=3;i<=m;i+=2) {
          if (n%i==0) return false;
        }
        return true;
      } else { // 'slow' 
        if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false; 
        var m=Math.sqrt(n);
        for (var i=2;i<=m;i++) if (n%i==0) return false;
        return true;
      }
    },

    factorial: function(n) {
      /*
      if (n < 0 || n == 0 || n == 1) {
        return 1;
      } else {
        return this.factorial(n-1) * n;   // return n * factoriala(n-1)
      }
      */
      var total = 1;
      for (var i = 2; i <= n; i++) {
        if (this.isPrime(i))
          total *= i;
      }
      return total;
    }

  };

  return {
    createInstance: function() {
      return new DragonInstance();
    }
  };

});
