
$(document).ready(function() {

  window.app = new Application();

  $(window).resize(function(w, h) {
    app.onWinResize();
  });

  $(window).unload(function(e) {
    app.exit();
  });

  app.init();

});

/*** WebRTC.io
**  https://www.npmjs.org/package/webrtc.io-client
*/


var Application = function() {

  this.PeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
  this.URL = (window.URL || window.webkitURL || window.msURL || window.oURL);
  navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  this.nativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);
  // order is very important: "RTCSessionDescription" defined in Nighly but useless
  this.nativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);

  this.rtcServer = 'ws://10.239.37.128:3001';

  this.mainVideo = null;
  this.smallVideoWidth = 160;
  this.smallVideoHeight = 120;
  this.smallVideoMargin = 4;

  this.orientation = '';
  this.isChannelReady;
  this.isInitiator = false;
  this.isStarted = false;

  this.localStream = null;
  this.remoteStreams = {};  // idx - [sockid, stream]
  this.mainStream = null;

  this.pc;
  this.turnReady;
  this.socket = undefined;
  this.room = undefined;
  this.constraints = {
    video: true,
    audio: true
  };
  this.pc_config = {
    'iceServers': [{
        'url': 'stun:stun.l.google.com:19302'
    }]
  };
  this.pc_constraints = {
    'optional': [{
        'DtlsSrtpKeyAgreement': true
    }]
  };
  // Set up audio and video regardless of what devices are present.
  this.sdpConstraints = {
    'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
    }
  };

};

Application.prototype = {
  init: function() {
    var self = this;
    $('#btnCaptureLocal').click(function() { self.captureLocalVideo(); });
    $('#btnRoomCreate').click(function() { self.createRoom(); });
    $('#btnRoomJoin').click(function() { self.joinRoom(); });
    $('#btnRoomLeave').click(function() { self.leaveRoom(); });

    self.onWinResize();
  },

  exit: function() {
    this.sendMessage('bye');
    alert('bye');
  },

  appendVideoToList: function(stream) {
    var self = this;
    var idx = $('#divVideoList').children().length;
    var html = '<div id="videoListItem_'+idx+'" class="videoListItem">'+
      '<video id="video_'+idx+'" autoplay="autoplay"></video></div>';
    $('#divVideoList').append(html);
    var videoObj = $('#video_'+idx)[0];
    videoObj.src = window.URL.createObjectURL(stream);
    videoObj.width = self.smallVideoWidth;
    videoObj.height = self.smallVideoHeight;

    $('#video_'+idx).click(function() {
      self.selectVideo(idx);
    });
    self.onChildVideoItemUpdate();
    return idx;
  },

  removeVideoFromList: function(idx) {
    if (idx >= 0 && idx < $('#divVideoList').children().length) {
      $('#videoListItem_'+idx).remove();
    }
  },

  selectVideo: function(idx) {
    if (idx === undefined)
      idx = $('#divVideoList').children().length - 1;
    if (idx >= 0 && idx < $('#divVideoList').children().length) {
      var count = $('#divVideoList').children().length;
      for (var i = 0; i < count; i++) {
        $('#video_'+i).removeClass('selected');
      }
      $('#video_'+idx).addClass('selected');
      this.attachMainStream(this.remoteStreams[idx][1]);
    }
  },

  captureLocalVideo: function(cb) {
    if (!this.checkWebRTCSupport()) return;
    var self = this;
    Util.print('capture video', 'local', true);
/*
    navigator.getUserMedia(self.constraints, 
      function(stream) {
        self.localStream = stream;
        var idx = self.appendVideoToList(self.localStream);
        self.attachMainStream(idx, stream);
      },
      function(err) {
        Util.print('Failed to capture video from local camera');
      }
    );
*/
    rtc.createStream(self.constraints,
      function(stream) {
        self.localStream = stream;
        var idx = self.appendVideoToList(self.localStream);
        self.remoteStreams[idx] = [undefined, self.localStream];
        self.selectVideo(idx);
        if (cb && typeof cb === 'function') {
          cb(stream);
        }
      },
      function(err) {
        Util.print('Failed to capture video from local camera');
        if (cb && typeof cb === 'function') {
          cb(undefined);
        }
    });
  },

  createRoom: function() {
    if (!this.checkWebRTCSupport()) return;
    var self = this;
    console.log('createRoom');
    Util.print('begin create room...', 'create', true);
    Util.showDialog('dlgCreateRoom', 'Create Room', 
      '<div>Please input room number:<input type="text" id="txtRoomCreateCode" value="" /></div>', 
      {caption: 'Cancel'},
      {id: 'btnCreatRoom', caption: 'Okay', onclick: function() {
        var room = $('#txtRoomCreateCode').val();
        if (room) {
          Util.print('now create room ' + room, 'create');
          self.joinRoom(room);
        }
      }},
      function() {
        $('#txtRoomCreateCode').val('');
      }
    );
  },

  joinRoom: function(roomId) {
    if (!this.checkWebRTCSupport()) return;
    var self = this;
    console.log('joinRoom');
    var doJoinRoom = function(room) {
      if (self.room === room)
        return;
      if (self.room)
        self.leaveRoom();
      if (room) {
        Util.print('join room now:' + room, 'join', true);
        self.connect(room);
      }
    };
    if (!roomId) {
      Util.showDialog('dlgJoinRoom', 'Join Room', 
        '<div> please select a room number: <input type="text" id="txtRoomJoinCode" value="" /></div>',
        {caption:'Cancel'},
        {caption:'Okay', id: 'btnJoinRoom', onclick: function(){
          doJoinRoom($('#txtRoomJoinCode').val());
        }}, 
        function() {
          $('#txtRoomJoinCode').val('');
        }
      );
    } else {
      doJoinRoom(roomId);
    }
  },

  leaveRoom: function() {
    console.log('leaveRoom');
    //location.reload();

    this.room = undefined;
    var stop = function(stream) {
      if (typeof stream.stop === 'function') {
        stream.stop();
      }
      else if (typeof stream.getAudioTracks === 'function') {
        stream.getAudioTracks()[0].stop();
        stream.getVideoTracks()[0].stop();
      }
    }
    for (var k in this.remoteStreams) {
      stop(this.remoteStreams[k][1]);
    }
    this.remoteStream = {};
    this.localStream = null;
    this.mainVideo = null;
    $('#video-container').empty();
    $('#divVideoList').empty();

    if (rtc._socket) {
      rtc._socket.close();
      rtc.peerConnections = {};
      rtc.connections = [];
      rtc.streams = [];
      rtc.numStreams = 0;
      rtc.initializedStreams = 0;
      rtc.dataChannels = {};
    }
  },

  checkWebRTCSupport: function() {
    if (!navigator.getUserMedia || !rtc.dataChannelSupport) {
      Util.showDialog('dlgNotSupport', 'Not Support', '<div>The browser does not support video chatting.</div>' +
        '<div>Please make sure the Camera is installed and use Chrome or FireFox!</div>',
        undefined, {caption:'Okay'});
      return false;
    }
    return true;
  },

  attachMainStream: function(stream) {
    var self = this;
    if (!self.mainVideo) {
      var html = '<video id="video_main" autoplay="autoplay"></video>';
      $('#video-container').append(html);
      self.mainVideo = $('#video_main')[0];
      self.mainVideo.onresize = function() {self.onWinResize();};
    }
    self.attachStream(stream, self.mainVideo);
    //self.selectVideo(idx);
    self.mainStream = stream;
  },

  attachStream: function(stream, element) {
    if (typeof(element) === "string")
      element = $('#' + element)[0];
    if (navigator.mozGetUserMedia) {
      element.mozSrcObject = stream;
      element.play();
    } else {
      element.src = webkitURL.createObjectURL(stream);
    }
  },

  connect: function(room) {
    var self = this;
    if (!room) {
      console.log('TODO: how to handle if room is empty?');
      return;
    }
    
    var doConnect = function() {
      self.room = room;  // '46a910fc-d481-41e1-b06c-26cb9a9e62c4';
      rtc.connect(self.rtcServer, self.room);

      rtc.on('add remote stream', function(stream, socId) {
        self.onRemoteConnected(stream, socId);
      });

      rtc.on('disconnect stream', function(socId) {
        self.onRemoteDisconnected(socId);
      });
    };

    if (!self.localStream) {
      self.captureLocalVideo(function(stream) {
        if (stream) 
          doConnect();
      });
    } else {
      doConnect();
    }
  },

  onRemoteConnected: function(stream, sockid) {
    var self = this;
    var exists = false;
    for (var k in self.remtoeStreams) {
      if (self.remoteStreams[k][0] === sockid) {
        exists = true;
        break;
      }
    }
    if (exists) {
      cosole.error('todo: duplicated stream!');
      return;
    }
    var msg = 'Remote guest is joined: ' + sockid;
    console.log(msg);
    Util.print(msg);
    var idx = self.appendVideoToList(stream);
    self.remoteStreams[idx] = [sockid, stream];
    if (self.mainStream === self.localStream) {
      self.selectVideo(idx);
    }
    self.onChildVideoItemUpdate();
  },

  onRemoteDisconnected: function(sockid) {
    var self = this;
    var msg = 'Remote guest is leaving: ' + sockid;
    console.log(msg);
    Util.print(msg);
    var idx = -1;
    for (var k in self.remoteStreams) {
      if (self.remoteStreams[k][0] === sockid) {
        idx = k;
        break;
      }
    }
    if (idx >= 0) {
      var remoteStream  = self.remoteStreams[idx];
      self.removeVideoFromList(idx);
      delete self.remoteStreams[idx];
      if (self.mainStream === remoteStream[1]) {
        self.selectVideo();  // select last one
      }
    }
  },

  onWinResize: function() {
    $('#video-container').height($(window).height() - $('body').offset().top - 60);

    // set position & size of the main video
    var vWidth = this.mainVideo ? this.mainVideo.videoWidth : 0;
    var vHeight = this.mainVideo ? this.mainVideo.videoHeight : 0;
    var cWidth = $('#video-container').width();
    var cHeight = $('#video-container').height();
    var cOffset = $('#video-container').offset();
    var listItemWidth = this.smallVideoWidth + this.smallVideoMargin * 2;
    var listItemHeight = this.smallVideoHeight + this.smallVideoMargin * 2;
    if (vWidth > 0 && vHeight > 0) {
      var vRatio = vWidth / vHeight;
      var cRatio = cWidth / cHeight;
      var vTop = 0;
      var vLeft = 0;
      this.orientation = (cRatio > vRatio) ? 'landscape' : 'portrait';
      if (this.orientation === 'landscape') {
        vHeight = cHeight;
        vWidth = Math.floor(vHeight * vRatio);
        vLeft = Math.floor((cWidth - vWidth - listItemWidth) / 2);
        if (vLeft < 0) vLeft = 0;
      } else if (this.orientation === 'portrait') {
        vWidth = cWidth;
        vHeight = Math.floor(vWidth / vRatio);
        vTop = Math.floor((cHeight - vHeight - listItemHeight) / 2);
        if (vTop < 0) vTop = 0;
      }
      this.mainVideo.width = vWidth;
      this.mainVideo.height = vHeight;
      $(this.mainVideo).css({left: vLeft, top: vTop, position:'relative'});


      // set the position & size of video list
      var listTop = cOffset.top;
      var listLeft = cOffset.left || 20;
      var listWidth = listItemWidth;
      var listHeight = listItemHeight;
      if (this.orientation === 'landscape') {
        // place at right side
        listLeft += cWidth - listItemWidth;
        listHeight = cHeight;
      } else if (this.orientation === 'portrait') {
        // place at bottom side
        listTop += cHeight - listItemHeight;
        listWidth = cWidth;
      }
      listWidth -= 2;
      listHeight -= 2;
      $('#divVideoList').width(listWidth).height(listHeight).css({top: listTop, left:listLeft});

      this.onChildVideoItemUpdate();
    }
/*
    // list items position
    var children = $('#divVideoList').children();
    if (cRatio > vRatio) {
      for (var i = 0, len = children.length; i < len; i++) {
        var child = children[i];
        $(child).css({top: listItemHeight * i, left: 0});
      }
    } else {
      for (var i = 0, len = children.length; i < len; i++) {
        var child = children[i];
        $(child).css({top: 0, left: listItemWidth * i});
      }
    }
*/
  },

  onChildVideoItemUpdate: function () {
    // list items position
    var listItemWidth = this.smallVideoWidth + this.smallVideoMargin * 2;
    var listItemHeight = this.smallVideoHeight + this.smallVideoMargin * 2;
    var children = $('#divVideoList').children();
    if (this.orientation === 'landscape') {
      for (var i = 0, len = children.length; i < len; i++) {
        var child = children[i];
        $(child).css({top: listItemHeight * i, left: 0});
      }
    } else if (this.orientation === 'portrait') {
      for (var i = 0, len = children.length; i < len; i++) {
        var child = children[i];
        $(child).css({top: 0, left: listItemWidth * i});
      }
    }
  },

  //////////////////////////////////bad bad bad///////////////////////////////////////////////////
  io_connect: function(room) {
    var self = this;
    if (room === undefined || room !== '') {
      if(self.socket === ''){
        console.log('Fresh Connection');
        Util.print('<em>Connecting.......</em>', undefined, true);
        self.socket = io.connect('http://ec2-50-17-69-205.compute-1.amazonaws.com:5238');
      } else if(self.socket.socket.connected === false) {
        self.socket.socket.reconnect();
        Util.print('<em>Reconnecting.......</em>', undefined, true);
      }
      console.log('Before timeout, socket is connected: '+socket.socket.connected);
        
      setTimeout(function() {   
        console.log('Attempt to create room, socket is connected: ' + self.socket.socket.connected);
        console.log('Create or join room', room);
        self.socket.emit('create or join', room);

        self.socket.on('created', function(room) {
          console.log('Created room ' + room);
          Util.print('<em>Created room </em>' + room);
          self.isInitiator = true;
        });

        self.socket.on('full', function(room) {
          console.log('Room ' + room + ' is full');
          Util.print('<em>Room </em>' + room + '<em> is full</em>');
        });

        self.socket.on('join', function(room) {
          console.log('This peer is the initiator of room ' + room + '!');
          Util.print('<em>This peer is the initiator of room ' + room + '!</em>');
          console.log('Another peer made a request to join room ' + room);
          Util.print('<em>Another peer made a request to join room ' + room+'!</em>');
          self.isChannelReady = true;
        });

        self.socket.on('joined', function(room) {
          console.log('This peer has joined room ' + room);
          Util.print('<em>This peer has joined room ' + room+'</em>', undefined, true);
          self.isChannelReady = true;
        });

        self.socket.on('log', function(array) {
          console.log.apply(console, array);
        });

        self.socket.on('leave', function(room) {
          console.log('Client(s) session has been completely disconnected from server & room '+room+"!");
          Util.print('<em>Client(s) session has been completely disconnected from server & room '+room+'!</em>', undefined, true);
          self.stop('true');
        });

        self.socket.on('message', function(message) {
          console.log('Client received message:', message);
          if (message === 'got user media') {
            self.maybeStart();
          } else if (message.type === 'offer') {
            if (!self.isInitiator && !self.isStarted) {
              console.log("isInitiator? "+self.isInitiator+" and isStarted?"+self.isStarted);
              self.maybeStart();
            }
            self.pc.setRemoteDescription(new RTCSessionDescription(message));
            self.doAnswer();
          } else if (message.type === 'answer' && self.isStarted) {
            self.pc.setRemoteDescription(new RTCSessionDescription(message));
          } else if (message.type === 'candidate' && self.isStarted) {
            var candidate = new RTCIceCandidate({
              sdpMLineIndex: message.label,
              candidate: message.candidate
            });
            self.pc.addIceCandidate(candidate);
          } else if (message === 'bye' && isStarted) {
            self.handleRemoteHangup();
          }
        });
        navigator.getUserMedia(constraints,
          function(stream) {
            self.onGetUserMedia(stream);
          },
          function(err) {
            self.onGetUserMedia(err);
          }
        );
      }, 2000);
    } else {
      alert("No room specified!! Please specify a room name.");
    }
  },

  onGetUserMedia: function(stream) {
    console.log('Adding local stream.');
    if (!this.localStream) {
      this.localStream = stream;
      var idx = this.appendVideoToList(this.localStream);
      this.attachMainStream(idx, this.localStream);
    }
    this.sendMessage('got user media');
    if (this.isInitiator) {
      this.maybeStart();
    }
  },

  onFailedGetUserMedia: function(error) {
    var msg = 'getUserMedia error: ' + error;
    console.error(msg);
    Util.print(msg);
  }

};   // End of Application


Util = {

showDialog: function(id, title, body, btnCancel, btnOK, onInit) {
    /**
    * button: [{id: 'xxx', caption: 'xxx', onclick: callback}]
    */
    if (!id) return;
    var dlg = $('#'+id);
    if (dlg.length === 0) {
      var html = '<div id="'+id+'" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="'+id+'" aria-hidden="true">'+
  '<div class="modal-dialog">'+
    '<div class="modal-content">'+
      '<div class="modal-header">'+
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
        '<h4 class="modal-title">'+title+'</h4>'+
      '</div>'+
      '<div class="modal-body">'+body+'</div>'+
      '<div class="modal-footer">';
      if (btnCancel) {
        html = html + '<button type="button" class="btn btn-default" data-dismiss="modal"';
        if (btnCancel.id) html = html +' id="'+btnCancel.id+'"';
        html = html + '>' + btnCancel.caption + '</button>';
      }
      if (btnOK) {
        html = html + '<button type="button" class="btn btn-primary"';
        if (btnOK.id) html = html + ' id="' + btnOK.id+'"';
        //if (btnOK.onclick === undefined) html = html + ' data-dismiss="modal"';
        html = html + ' data-dismiss="modal">' + btnOK.caption+'</button>';
      }
      html = html +
      '</div>'+
    '</div>'+
  '</div>'+
'</div>';
      $('body').append(html);
      dlg = $('#'+id);
      if (btnCancel && btnCancel.id && btnCancel.onclick && typeof btnCancel.onclick === 'function') {
        $('#' + btnCancel.id).click(function(e){btn.onclick(e);});
      }
      if (btnOK && btnOK.id && btnOK.onclick && typeof btnOK.onclick === 'function') {
        $('#' + btnOK.id).click(function(e){
          //dlg.removeBackdrop();
          //$('#'+id).hide();
          btnOK.onclick(e);
        });
      }
    }
    if (onInit && typeof onInit === 'function') {
      onInit();
    }
    //dlg.modal({backdrop:false});
    dlg.modal('show');
},

print: function(content, tag, flush) {
  if (tag) tag = '[' + tag + '] ';
  else tag = '';
  if (flush) {
    $('#divLogger').html(tag + content + '<br>');
  } else {
    $('#divLogger').html($('#divLogger').html() + tag + content + '<br>');
  }
}

};


