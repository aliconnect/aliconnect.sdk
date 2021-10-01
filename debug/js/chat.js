function Chatroom(params, pageElement) {
  const MESSAGE_TYPE = {
    SDP: 'SDP',
    CANDIDATE: 'CANDIDATE',
  };
  // chatRemoteView = elem.createElement('VIDEO', '', {id: 'chatRemoteView', style: 'width:200px;height:200px;', autoplay: true, playsinline: true });
  // //console.log(params);
  const sender = {
    wall: params.wall,
    client: params.client,
  };
  let from_id = null;
  let connections = {};
  const signaling = $.WebsocketClient.conn;//new WebSocket('wss://aliconnect.nl:444');
  // pageElement.createElement('DIV', '', $.WebsocketClient.socket_id);
  const send = (message_type, content, to) => {
    //console.log('SEND_TO', message_type, to, content);
    signaling.send(JSON.stringify({
      message_type: message_type,
      content: content,
      to: to || ''
    }));
  };
  function Connection (from_id) {
    // //console.log('CREATE Connection', from_id);
    let connectionElement = null;
    this.close = () => {
      if ($(from_id) && $(from_id).parentElement) {
        $(from_id).remove();
      }
      peerConnection.close();
      connections[from_id] = null;
    };
    const createPeerConnection = (signaling) => {
      // //console.log('createPeerConnection');
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun4.l.google.com:19302' }],
      });
      peerConnection.onconnectionstatechange  = async (e) => {
        // //console.log('onconnectionstatechange', e.target.connectionState);
        if (e.target.connectionState === 'disconnected') {
          this.close();
        }
      };
      peerConnection.onnegotiationneeded = async (e) => {
        // //console.log('onnegotiationneeded', e);
        await createAndSendOffer(signaling, peerConnection);
      };
      peerConnection.onicecandidate = (iceEvent) => {
        // //console.log('onicecandidate', e);
        if (iceEvent && iceEvent.candidate) {
          send( MESSAGE_TYPE.CANDIDATE, iceEvent.candidate, from_id );
        }
      };
      peerConnection.ontrack = (e) => {
        // DEBUG: Return zodat remove video op video object wordt getoont
        caminfo.innerText = 'Remote camera';
        pageElement.style = '';
        video.srcObject = this.stream = window.recordStream = e.streams[0];
        return;
        let connectionElement = pageElement.createElement('DIV', 'col', {id: from_id}, [['DIV', '', from_id]]);
        let remotevideo = connectionElement.createElement('VIDEO', '', {
          style: 'width:200px;height:200px;',
          autoplay: true,
          playsinline: true,
        });
        // //console.log('ontrack', e, from_id);
        if (!remotevideo.srcObject) {
          remotevideo.srcObject = this.stream = e.streams[0];
          // video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
          // video.play();
        }
        //console.log('ontrack', from_id, connections[from_id].getOffer, connections[from_id]);
        // if (!connections[from_id].getOffer) {
        // 	send ('GETOFFER', {}, from_id);
        // }
      };
      return peerConnection;
    };
    const createAndSendOffer = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      send( MESSAGE_TYPE.SDP, offer, from_id );
    };
    this.onmessage = async function (message_type, content) {
      // //console.log('onmessage', message_type, content);
      if (message_type === 'GETOFFER') {
        if (!window.localStream) return;
        window.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, window.localStream)
        } );
      } else if (message_type === MESSAGE_TYPE.CANDIDATE && content) {
        await peerConnection.addIceCandidate(content);
      } else if (message_type === MESSAGE_TYPE.SDP) {
        if (content.type === 'offer') {
          await peerConnection.setRemoteDescription(content);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          send( MESSAGE_TYPE.SDP, answer, from_id );
        } else if (content.type === 'answer') {
          await peerConnection.setRemoteDescription(content);
          //console.log('ANSWER', from_id, connections[from_id].stream, connections[from_id]);
          return;
          // DEBUG: Code uitvoeren zodat alle clients zich aanmelden
          if (!connections[from_id].stream) {
            send ('GETOFFER', {}, from_id);
          }
        } else {
          //console.error('Unsupported SDP type.');
        }
      }
    };
    const peerConnection = createPeerConnection(signaling);
  }
  signaling.addEventListener('message', async (message) => {
    const data = JSON.parse(message.data);
    if (!data) return;
    if (data.message_type) {
      try {
        const { message_type, content, to, from } = data;
        //console.debug('MESSAGE_FROM', from, to, message_type, content);
        if (message_type === 'GETOFFER') {
          if (connections[from]) {
            connections[from].close();
          }
        }
        connections[from] = connections[from] || new Connection(from);
        connections[from].onmessage(message_type, content);
      } catch (err) {
        //console.error(err);
      }
    }
  });
  async function startChat (sender) {
    try {
      options = {
        audio: false,
        video: {
          facingMode: 'user',//shouldFaceUser ? 'user' : 'environment'
        },
      };
      var stream = window.recordStream = window.localStream = await navigator.mediaDevices.getUserMedia(options);
      //console.log('createLocalVideo');
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      video.play();
      pageElement.style = '';
      caminfo.innerText = 'Your local camera';
      send( 'CAMERA_EVAIL', sender);
    } catch (err) {
      //console.error(err);
    }
  }
  pageElement = pageElement.createElement('DIV', 'col aco', {style: 'height:50px;'} );
  const caminfo = pageElement.createElement('DIV', 'caminfo' );
  const video = pageElement.createElement('VIDEO', '', {
    style: 'width:100%;',
    autoplay: true,
    playsinline: true,
    onclick() {
      //console.log('SNAP', this.paused);
      if (this.paused) {
        this.play();
      } else {
        this.pause();
      }
    }
  });
  btnbarElement = pageElement.createElement('DIV', 'btnbar');
  btnbarElement.createElement('BUTTON', 'abtn camera', {type:'button', onclick: e => startChat(sender)});
  btnbarElement.createElement('BUTTON', 'abtn snap', {type:'button', onclick: e => video.paused ? video.play() : video.pause() });
  btnbarElement.createElement('BUTTON', 'abtn record', 'start', {type:'button', onclick: e => {
    var recordedChunks = [];
    var stream = window.recordStream;
    //console.log(stream);
    var options = { mimeType: "video/webm; codecs=vp9" };
    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    let filename = new Date().toISOString().replace(/\.|-|:/g,'');
    let i=1;
    function handleDataAvailable(e) {
      // //console.log("data-available");
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
        // //console.log(recordedChunks);
        download();
      } else {
        // ...
      }
    }
    const RESET_TIME = 5000;
    let resetTimeout = setTimeout(() => {
      mediaRecorder.stop();
      recordedChunks=[];
      mediaRecorder.start();
    }, RESET_TIME);
    function download() {
      // //console.log('download', mediaRecorder.state, mediaRecorder.paused)
      clearTimeout(resetTimeout);
      var blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      reader = new FileReader(),
      reader.onload = e => {
        new $.HttpRequest(
          // $.config.$,
          'post',
          '/api',
          `/?videorecorder&name=${filename+'_'+(i++)}.webm`,
          e.target.result,
          e => {
            // //console.log(e.target.responseText);
            if (mediaRecorder.state === 'recording') {
              resetTimeout = setTimeout(() => {
                mediaRecorder.stop();
                recordedChunks=[];
                mediaRecorder.start();
              }, RESET_TIME);
            }
          }
        ).send();
      };
      reader.readAsDataURL(blob);
      return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      pageElement.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "test.webm";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }});
  btnbarElement.createElement('BUTTON', 'abtn stop', 'stop', {type:'button', onclick: e => {
    mediaRecorder.stop();
  }});
  // pageElement.createElement('BUTTON', 'abtn record', 'stop', {type:'button', onclick: e => {
  // 	var options = { mimeType: "video/webm; codecs=vp9" };
  // 	mediaRecorder = new MediaRecorder(window.localStream, options);
  // }});
  send( 'OPTIONS', sender );
};
