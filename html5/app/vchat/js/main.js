
$(document).ready(function(){
  $(window).resize(function(w, h) {
    onWinResize();
  });
  onWinResize();

  $('#btnCaptureLocal').click(function() {captureLocalVideo();});
  $('#btnRoomCreate').click(function() {createRoom();});
  $('#btnRoomJoin').click(function() {joinRoom();});
  $('#btnRoomLeave').click(function() {leaveRoom();});

});

var onWinResize = function() {
  $('#video-container').height($(window).height() - $('body').offset().top - 60);

  // set position & size of the main video
  var vWidth = mainVideo.videoWidth;
  var vHeight = mainVideo.videoHeight;
  var cWidth = $('#video-container').width();
  var cHeight = $('#video-container').height();
  var cOffset = $('#video-container').offset();
  var listItemWidth = smallVideoWidth + smallVideoMargin * 2;
  var listItemHeight = smallVideoHeight + smallVideoMargin * 2;
  if (vWidth > 0 && vHeight > 0) {
    var vRatio = vWidth / vHeight;
    var cRatio = cWidth / cHeight;
    var vTop = 0;
    var vLeft = 0;
    if (cRatio > vRatio) {
      vHeight = cHeight;
      vWidth = Math.floor(vHeight * vRatio);
      vLeft = Math.floor((cWidth - vWidth - listItemWidth) / 2);
      if (vLeft < 0) vLeft = 0;
    } else {
      vWidth = cWidth;
      vHeight = Math.floor(vWidth / vRatio);
      vTop = Math.floor((cHeight - vHeight - listItemHeight) / 2);
      if (vTop < 0) vTop = 0;
    }
    //mainVideo.clientTop = vTop;
    //mainVideo.clientLeft = vLeft;
    mainVideo.width = vWidth;
    mainVideo.height = vHeight;
    $(mainVideo).css({left: vLeft, top: vTop, position:'relative'});
  }

  // set the position & size of video list
  var listTop = cOffset.top;
  var listLeft = cOffset.left || 20;
  var listWidth = listItemWidth;
  var listHeight = listItemHeight;
  if (cRatio > vRatio) {
    // place at right side
    listLeft += cWidth - listItemWidth;
    listHeight = cHeight;
  } else {
    // place at bottom side
    listTop += cHeight - listItemHeight;
    listWidth = cWidth;
  }
  listWidth -= 2;
  listHeight -= 2;
  $('#divVideoList').width(listWidth).height(listHeight).css({top: listTop, left:listLeft});

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
};

var appendVideoToList = function(stream) {
  var idx = $('#divVideoList').children().length;
  var html = '<div id="videoListItem_'+idx+'" class="videoListItem">'+
    '<video id="video_'+idx+'" autoplay="autoplay"></video></div>';
  $('#divVideoList').append(html);
  var videoObj = $('#video_'+idx)[0];
  videoObj.src = window.URL.createObjectURL(stream);
  videoObj.width = smallVideoWidth;
  videoObj.height = smallVideoHeight;

  $('#video_'+idx).click(function() {
    var count = $('#divVideoList').children().length;
    for (var i = 0; i < count; i++) {
      $('#video_'+i).removeClass('selected');
    }
    $('#video_'+idx).addClass('selected');
  });
};

var captureLocalVideo = function() {
  print('capture video', 'local', true);
  navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
};

var createRoom = function() {
  console.log('createRoom');
  print('begin create room...', 'create', true);
  showDialog('dlgCreateRoom', 'Create Room', 
    '<div>Please input room number:<input type="text" id="txtRoomCreateCode" value="" /></div>', 
    {caption: 'Cancel'},
    {id: 'btnCreatRoom', caption: 'Okay', onclick: function() {
      var room = $('#txtRoomCreateCode').val();
      if (room) {
        print('now create room ' + room, 'create');
        joinRoom(room);
      }
    }},
    function() {
      $('#txtRoomCreateCode').val('');
    }
  );
};

var joinRoom = function(roomId) {
  console.log('joinRoom');
  var doJoinRoom = function(room) {
    if (room) {
      print('join room now:' + room, 'join', true);
    }
  };
  if (!roomId) {
    showDialog('dlgJoinRoom', 'Join Room', 
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
};

var leaveRoom = function() {
  console.log('leaveRoom');
};


var smallVideoWidth = 160;
var smallVideoHeight = 120;
var smallVideoMargin = 4;

var feedback_d = document.getElementById("feedback_div");
var isChannelReady;
var isInitiator = false;
var isStarted = false;
var mainStream;
var pc;
var remoteStream;
var turnReady;
var socket = '';
var room = '';
var constraints;
var pc_config = {
    'iceServers': [{
        'url': 'stun:stun.l.google.com:19302'
    }]
};
var pc_constraints = {
    'optional': [{
        'DtlsSrtpKeyAgreement': true
    }]
};
// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
    'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
    }
};
        
//Store desired media attributes then access device camera and microphone
constraints = {
    video: true,
    audio: true
};

var mainVideo = $('#video_main')[0];
var remoteVideo = $('#remoteVideo')[0];
mainVideo.onresize = function() {onWinResize();};

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

////////////////////////////////////////////////

//Emit 'message' event to server with information(message) 
function sendMessage(message) {
    console.log('Client sending message: ', message);
    // if (typeof message === 'object') {
    //   message = JSON.stringify(message);
    // }
    if (socket)
      socket.emit('message', message);
}
/////////////////////////////////////////////

//Connect to websocket server, listen for server emitted 'events'
function connect(room) {
    if (room === undefined || room != '') {
        if(socket == ''){
            console.log('Fresh Connection');
            print('<em>Connecting.......</em>', undefined, true);
            socket = io.connect('http://ec2-50-17-69-205.compute-1.amazonaws.com:5238');
        }
        else if(socket.socket.connected == false){
            socket.socket.reconnect();
            print('<em>Reconnecting.......</em>', undefined, true);
        }
        console.log('Before timeout, socket is connected: '+socket.socket.connected);
        
        setTimeout(function(){        
            console.log('Attempt to create room, socket is connected: '+socket.socket.connected);
            console.log('Create or join room', room);
            socket.emit('create or join', room);

            socket.on('created', function(room) {
                console.log('Created room ' + room);
                print('<em>Created room </em>' + room);
                isInitiator = true;
            });

            socket.on('full', function(room) {
                console.log('Room ' + room + ' is full');
                print('<em>Room </em>' + room + '<em> is full</em>');
            });

            socket.on('join', function(room) {
                console.log('This peer is the initiator of room ' + room + '!');
                print('<em>This peer is the initiator of room ' + room + '!</em>');
                console.log('Another peer made a request to join room ' + room);
                print('<em>Another peer made a request to join room ' + room+'!</em>');
                isChannelReady = true;
            });

            socket.on('joined', function(room) {
                console.log('This peer has joined room ' + room);
                print('<em>This peer has joined room ' + room+'</em>', undefined, true);
                isChannelReady = true;
            });

            socket.on('log', function(array) {
                console.log.apply(console, array);
            });

            socket.on('leave', function(room) {
                console.log('Client(s) session has been completely disconnected from server & room '+room+"!");
                print('<em>Client(s) session has been completely disconnected from server & room '+room+'!</em>', undefined, true);
                stop('true');
            });

            socket.on('message', function(message) {
                console.log('Client received message:', message);
                if (message === 'got user media') {
                    maybeStart();
                } else if (message.type === 'offer') {
                    if (!isInitiator && !isStarted) {
                        console.log("isInitiator? "+isInitiator+" and isStarted?"+isStarted);
                        maybeStart();
                    }
                    pc.setRemoteDescription(new RTCSessionDescription(message));
                    doAnswer();
                } else if (message.type === 'answer' && isStarted) {
                    pc.setRemoteDescription(new RTCSessionDescription(message));
                } else if (message.type === 'candidate' && isStarted) {
                    var candidate = new RTCIceCandidate({
                        sdpMLineIndex: message.label,
                        candidate: message.candidate
                    });
                    pc.addIceCandidate(candidate);
                } else if (message === 'bye' && isStarted) {
                    handleRemoteHangup();
                }
            });

            
            navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
        }, 2000);
    } 
    
    else {
        alert("No room specified!! Please specify a room name.");
    }
}
////////////////////////////////////////////////////

function handleUserMedia(stream) {
    console.log('Adding local stream.');
    mainVideo.src = window.URL.createObjectURL(stream);
    mainStream = stream;
    sendMessage('got user media');
    if (isInitiator) {
        maybeStart();
    }
    appendVideoToList(stream);
}

function handleUserMediaError(error) {
    console.log('navigator.getUserMedia error: ', error);
}
//
function maybeStart() {
    if (!isStarted && typeof mainStream != 'undefined' && isChannelReady) {
        createPeerConnection();
        pc.addStream(mainStream);
        isStarted = true;
        console.log('isInitiator', isInitiator);
        if (isInitiator) {
            doCall();
        }
    }
}

window.onbeforeunload = function(e) {
    sendMessage('bye');
}
/////////////////////////////////////////////////////////
//
function createPeerConnection() {
    try {
        pc = new webkitRTCPeerConnection(null);
        pc.onicecandidate = handleIceCandidate;
        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
        console.log('Created RTCPeerConnnection');
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
}

//
function handleIceCandidate(event) {
    console.log('handleIceCandidate event: ', event);
    if (event.candidate) {
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        });
    } else {
        console.log('End of candidates.');
    }
}

//
function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    remoteVideo.src = window.URL.createObjectURL(event.stream);
    remoteStream = event.stream;
}

//
function handleCreateOfferError(event) {
    console.log('createOffer() error: ', e);
}

//
function doCall() {
    console.log('Sending offer to peer');
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

//
function doAnswer() {
    console.log('Sending answer to peer.');
    pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
}

//
function setLocalAndSendMessage(sessionDescription) {
    // Set Opus as the preferred codec in SDP if Opus is present.
    sessionDescription.sdp = preferOpus(sessionDescription.sdp);
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message', sessionDescription);
    sendMessage(sessionDescription);
}

//
function requestTurn(turn_url) {
    var turnExists = false;
    for (var i in pc_config.iceServers) {
        if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
            turnExists = true;
            turnReady = true;
            break;
        }
    }
    if (!turnExists) {
        console.log('Getting TURN server from ', turn_url);
        // No TURN server. Get one from computeengineondemand.appspot.com:
        $.ajax({
          url: turn_url,
          type: 'GET',
          dataType: 'json',
          success: function(data, st) {
            debugger;
            if (data) {
              pc_config.iceServers.push({
                  'url': 'turn:' + data.username + '@' + data.turn,
                  'credential': data.password
              });
              turnReady = true;
            }
          },
          error: function(req, st, err) {
            print('Failed to request (' + err + '): '+ turn_url, 'Error', true);
          }
        });
    }
}


//Display event for onremoveStream
function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}

//
function hangup() {
    //console.log('Hanging up.');
    //stop();
    //sendMessage('bye');
}

//Stop session is remote client leaves
function handleRemoteHangup() {
    //  console.log('Session terminated.');
    // stop();
    // isInitiator = false;
}

//Send server leave message, reset videos, set peer connection to null
function stop(fromserver) {
    //Hide 'End session' button; Show 'Join Room' button
    if(fromserver == 'false'){
        console.log("room name: "+room);
        socket.emit('leave', room);
        print('<em>Client(s) session has been terminated!</em>', undefined, true);
    }
    isStarted = false;
    mainStream.stop();
    mainVideo.src = "";
    remoteVideo.src = "";
    //pc.close();
    pc = null;
    socket.removeAllListeners(); //Prevents replication of eventlisteners
}
///////////////////////////////////////////

//Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
    var sdpLines = sdp.split('\r\n');
    var mLineIndex;
    // Search for m line.
    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('m=audio') !== -1) {
            mLineIndex = i;
            break;
        }
    }
    if (mLineIndex === null) {
        return sdp;
    }
    // If Opus is available, set it as the default in m line.
    for (i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('opus/48000') !== -1) {
            var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
            if (opusPayload) {
                sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
            }
            break;
        }
    }
    // Remove CN in m line and sdp.
    sdpLines = removeCN(sdpLines, mLineIndex);
    sdp = sdpLines.join('\r\n');
    return sdp;
}

// Extract session description protocol (sdp)
function extractSdp(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
}

//Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
    var elements = mLine.split(' ');
    var newLine = [];
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
        if (index === 3) { // Format of media starts from the fourth.
            newLine[index++] = payload; // Put target payload to the first.
        }
        if (elements[i] !== payload) {
            newLine[index++] = elements[i];
        }
    }
    return newLine.join(' ');
}

//Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
    var mLineElements = sdpLines[mLineIndex].split(' ');
    // Scan from end for the convenience of removing an item.
    for (var i = sdpLines.length - 1; i >= 0; i--) {
        var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
        if (payload) {
            var cnPos = mLineElements.indexOf(payload);
            if (cnPos !== -1) {
                // Remove CN payload from m line.
                mLineElements.splice(cnPos, 1);
            }
            // Remove CN line in sdp
            sdpLines.splice(i, 1);
        }
    }
    sdpLines[mLineIndex] = mLineElements.join(' ');
    return sdpLines;
}


function showDialog(id, title, body, btnCancel, btnOK, onInit) {
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
}

function print(content, tag, flush) {
  if (tag) tag = '[' + tag + '] ';
  else tag = '';
  if (flush) {
    $('#divLogger').html(tag + content + '<br>');
  } else {
    $('#divLogger').html($('#divLogger').html() + tag + content + '<br>');
  }
}


