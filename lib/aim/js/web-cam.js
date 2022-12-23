Webcam = function (sender, parent, socketClient) {
  const {cam,facingMode,group,wall,recorder} = sender;
  const {webSocket} = socketClient;
  // let from = null;
  let connections = new Map;
  let webcam = this;
  let cams = new Map;
  let streams = [];
  let channelFocus;
  let channels;
  let selectElement;
  const dt = '2020-10-19T23:03:30Z';
  // const parent = parent;
  const btnbar = $('nav').style('z-index:1;').parent(parent);
  function send (message_type, content, to) {
    console.warn('message-send', message_type);
    webSocket.send(JSON.stringify({message_type,content,to}));
  };
  const showCam = (options) => {
    // console.warn('showCam');
    if (selectElement) {
    // console.debug(selectElement);
      selectElement.value = options.target || selectElement.value;
      let channel = channels.find(config => config.id === selectElement.value);
      channel.cam = options.cam;
      const {id,cam} = channelFocus = channel;
      $('#playCam').value(cam);
      if (cams.has(options.cam)) {
        let {stream,from} = cams.get(options.cam);
        if (stream) {
          if (channel.video) {
            channel.barElement.innerText = `${options.cam}`;
            channel.video.srcObject = stream;
          }
        } else {
          send ('GETOFFER', {}, from);
        }
      }
    }
  };

  function Connection (senderoptions) {
    const {connection_id,from,cam,wall} = this.senderoptions = senderoptions;
    console.debug('new.connection', senderoptions);
    // console.debug('CREATE Connection', from, senderoptions);
    let connectionElement = null;
    const close = this.close = () => {
      // console.debug('CLOSE', aim(from), cams[senderoptions.cam]);
      // console.debug('CLOSE', cams[senderoptions.cam]);
      console.debug('connection.close', cam);
      // if (aim(from) && aim(from).parentElement) {
      //   // console.debug('CLOSE', AIM(from), cams[senderoptions.cam]);
      // 	aim(from).remove();
      //   // options.startElement
      // }
      if (cams.has(cam) && cams.get(cam).buttonElem) {
        cams.get(cam).buttonElem.remove();
      }
      peerConnection.close();
      connections.delete(connection_id);
    };
    const createPeerConnection = () => {
      console.warn('createPeerConnection');
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun4.l.google.com:19302' }],
      });
      peerConnection.addEventListener('connectionstatechange', (event) => {
        switch(event.target.connectionState) {
          case 'disconnected': return close();
          case 'connected': return showCam(senderoptions);
        }
      })
      peerConnection.addEventListener('negotiationneeded', (event) => {
        createAndSendOffer(webSocket, peerConnection);
      })
      peerConnection.addEventListener('icecandidate', (event) => {
        if (event && event.candidate) {
          send( 'CANDIDATE', event.candidate, from );
        }
      })
      peerConnection.addEventListener('track', (event) => {
        console.debug(event.streams.length);

        let stream = this.stream = cams.get(cam).stream = event.streams[0];
        this.record = (event) => {
          console.debug('START recording', senderoptions);
          let recordElement = $('div').parent(parent).text('Recording camera ' + senderoptions.cam);
          var recordedChunks = [];
          var stream = this.stream;//window.recordStream;
          // console.debug(stream);
          var options = { mimeType: "video/webm; codecs=vp9" };
          let mediaRecorder = new MediaRecorder(stream, options);
          mediaRecorder.ondataavailable = handleDataAvailable;
          mediaRecorder.start();
          mediaRecorder.startDateTime = new Date();
          startTimeValue = mediaRecorder.startDateTime.valueOf()
          // let filename = [senderoptions.cam,new Date().toISOString().replace(/\.|-|:/g,'')].join('_');
          let i=1;
          function handleDataAvailable(event) {
            // console.debug("data-available");
            if (event.data.size > 0) {
              recordedChunks.push(event.data);
              // console.debug(recordedChunks);
              download();
            } else {
              // ...
            }
          }
          const RESET_TIME = 10000;
          function setTimer() {
            mediaRecorder.resetTimeout = setTimeout(() => {
              mediaRecorder.stop();
              recordedChunks=[];
              mediaRecorder.lastStartDateTime = mediaRecorder.startDateTime;
              mediaRecorder.startDateTime = new Date();
              mediaRecorder.duration = mediaRecorder.startDateTime.valueOf() - mediaRecorder.lastStartDateTime.valueOf();
              mediaRecorder.start();
            }, RESET_TIME);
          };
          setTimer();
          function download() {
            clearTimeout(mediaRecorder.resetTimeout);
            var blob = new Blob(recordedChunks, { type: "video/webm" });
            reader = new FileReader();
            var timeOfDate = function (date) {
              console.debug([date.valueOf(), date.getMilliseconds()]);
              return date.valueOf() * 1000 + date.getMilliseconds();
            };
            // var now = new Date();
            // now = now.valueOf() * 1000 + now.getMilliseconds();
            // console.debug(now.valueOf(), now.getMilliseconds());
            // var duration = timeOfDate(new Date()) - timeOfDate(mediaRecorder.startDateTime);
            // var duration = new Date().valueOf() - mediaRecorder.startDateTime.valueOf();
            // mediaRecorder.startDateTime = new Date();
            console.debug('duration', mediaRecorder.duration);
            reader.onload = event => {
              const options = {
                // videorecorder: 'add',
                cam_id: senderoptions.cam,
                startTimeValue,
                nrStartTimeValue: mediaRecorder.lastStartDateTime.valueOf(),
                duration: mediaRecorder.duration,
                // filename,
                // name: filename + '_'+(i) + '.webm',
                nr: i++,
              };
              console.debug(options);

              Aim.fetch('https://aliconnect.nl/v1/recorder').query(options).body(event.target.result).post().then(body => {
                console.debug(11111, body)
                if (mediaRecorder.state === 'recording') {
                  setTimer();
                }
              });
            };
            reader.readAsDataURL(blob);
            recordElement.text(`Recording camera ${senderoptions.cam}, ${i} ${mediaRecorder.lastStartDateTime.toLocaleString()} ${mediaRecorder.duration}ms`);
            return;

            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            parent.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = "test.webm";
            a.click();
            window.URL.revokeObjectURL(url);
          };
        };
        if (recorder) {
          this.record();
          // if (webcam.recorder) {
          // }
          return;
        }
        parent.style = '';
        let config = channels.find(channel => channel.id === selectElement.value);
        // parent.createElement('video', {
        //   srcObject : event.streams[0],
        //   width:100,
        //   height:100,
        //   autoplay: true,
        //   playsinline: true,
        // });
        senderoptions.streamId = senderoptions.streamId || senderoptions.cam;
        streams[senderoptions.streamId] = stream;
        const setchannels = channels.filter (channel => channel.camId == senderoptions.streamId);
        // console.error(senderoptions.streamId, channels, setchannels);
        setchannels.forEach(channel => {
          channel.video.srcObject = stream;
          channel.barElement.innerText = `${senderoptions.streamId}`;
        });
        senderoptions.streamId++;
        // if (config.video) {
        //   config.barElement.innerText = `CAM ${senderoptions.cam}`;
        //   config.video.srcObject = this.stream = event.streams[0];
        // }
      })
      return peerConnection;
    };
    async function createAndSendOffer () {
      console.debug('createAndSendOffer');
      const offer = await peerConnection.createOffer();
      Object.assign(offer, sender);
      await peerConnection.setLocalDescription(offer);
      send( 'SDP', offer, from );
    };
    // console.debug(this);
    this.onmessage = async function (message_type, content) {
      const {type} = content;
      switch (message_type) {
        case 'GETOFFER': {
          // if (!window.localStream) return;
          const streams = window.streams || [window.localStream];
          streams.forEach(stream => stream.getTracks().filter(Boolean).forEach(track => peerConnection.addTrack(track, stream)));
          // var canvas = document.querySelector('canvas');
          // window.localStream.getTracks().forEach(track => {
            // 	peerConnection.addTrack(track, canvas.captureStream(125))
            // } );
          return;
        }
        case 'CANDIDATE': {
          // if (content) {
            return peerConnection.addIceCandidate(content);
          // }
          return;
        }
        case 'SDP': {
          if (type === 'offer') {
            await peerConnection.setRemoteDescription(content);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            send( 'SDP', answer, from );
          } else if (type === 'answer') {
            await peerConnection.setRemoteDescription(content);
            // console.debug('ANSWER', from, connections[from].stream, connections[from]);
            return;
            // DEBUG: Code uitvoeren zodat alle clients zich aanmelden
            if (!connections.get(connection_id).stream) {
              send ('GETOFFER', {}, from);
            }
          } else {
            console.error('Unsupported SDP type.');
          }
        }
      }
    };
    const peerConnection = createPeerConnection();
  }
  async function play (event) {
    const dateString = playStartDate.value+' '+playStartTime.value;
    var startDateTime = new Date(dateString);
    var nrStartTimeValue = startDateTime.valueOf();
    const camId = playCam.value;
    const row = await Aim.fetch('https://aliconnect.nl/v1/recorder').query({camId,nrStartTimeValue}).get();
    var {startTimeValue,nrStartTimeValue,duration,nr} = row;
    var fileStartDate = new Date(parseInt(nrStartTimeValue));
    let startTime = startDateTime.valueOf() - parseInt(nrStartTimeValue);
    const currentTime = Math.round(startTime/1000);
    let {barElement,video} = channelFocus;
    const {parentElement} = video;
    var mimeCodec = "video/webm; codecs=vp9,opus";
    var mimeCodec = "video/webm; codecs=vp9";
    if (!('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec))) return console.error('Unsupported MIME type or codec: ', mimeCodec);
    const videoElement = video;//$('video').attr('autostart','').attr('playsinline','').style('position:absolute;').parent(parentElement).el;
    videoElement.setAttribute('controls', '');
    let mediaSource = new MediaSource();
    videoElement.srcObject = null;
    videoElement.src = URL.createObjectURL(mediaSource);
    mediaSource.addEventListener('sourceopen', async event => {
      mediaSource.duration = 0;
      const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
      sourceBuffer.mode = 'sequence';
      const loading = {
        busy: false,
        start() {
          this.busy = true;
          barElement.style = 'background:red;';
        },
        end() {
          this.busy = false;
          barElement.style = '';
        }
      }
      sourceBuffer.onupdateend = () => {
        loading.end();
        if (startTime) {
          videoElement.currentTime = currentTime;
          startTime = 0;
          videoElement.play();
        }
      };
      async function get(){
        loading.start();
        const remoteVidUrl = `https://share.aliconnect.nl/recorder/${camId}/${startTimeValue}/${nr++}.webm`;
        console.debug(remoteVidUrl);
        const vidBlob = await (await fetch(remoteVidUrl)).blob();
        const vidBuff = await vidBlob.arrayBuffer();
        sourceBuffer.appendBuffer(vidBuff);
      }
      videoElement.ontimeupdate = event => {
        // console.debug(mediaSource.duration,videoElement.currentTime,parseInt(videoElement.currentTime));
        $(barElement).text(`${new Date(fileStartDate.getTime() + video.currentTime * 1000).toLocaleString()}`);
        if (!loading.busy && mediaSource.duration - videoElement.currentTime < 30) {
          get();
        }
      };
      // videoElement.parentElement.onkeydown = event => {
      //   return;
      //   const step = event.ctrlKey ? 0.5 : 5;
      //   console.debug(event.keyCode);
      //   switch (event.keyCode) {
      //     case 32: {
      //       event.preventDefault();
      //       videoElement.paused ? videoElement.play() : videoElement.pause();
      //       break;
      //     }
      //     case 36: {
      //       event.preventDefault();
      //       videoElement.currentTime = currentTime;
      //       break;
      //     }
      //     case 37: {
      //       event.preventDefault();
      //       videoElement.currentTime -= step;
      //       break;
      //     }
      //     case 39: {
      //       event.preventDefault();
      //       videoElement.currentTime += step;
      //       break;
      //     }
      //   }
      // };
      get();
    });
  };
  async function startChat (sender) {
    console.debug('startChat', sender);
    document.title = document.location.search;
    if (sender.cam) {
      try {
        options = {
          audio: false,
          video: {facingMode},
          // video: {
          //   facingMode: sender.facingMode || 'environment',//'user',//shouldFaceUser ? 'user' : 'environment'
          // },
        };
        if (!window.streams) {
          cams.set('local',{
            // stream: window.recordStream = window.localStream = window.localStream || await navigator.mediaDevices.getUserMedia(options),
            stream: window.recordStream = window.localStream = await navigator.mediaDevices.getUserMedia(options),
          });
          if (sender.showCam) showCam({cam:'local'});
        }
        // cams.local1 = {
        //   stream: window.recordStream = window.localStream = window.localStream || await navigator.mediaDevices.getUserMedia(options),
        // };
        send('CAMERA_EVAIL', sender);
        // DEBUG: SHOW LOCAL CAM
        // showCam({cam: 'local1'});
        // var stream = window.recordStream = window.localStream = await navigator.mediaDevices.getUserMedia(options);
        // console.debug('createLocalVideo');
        // video.srcObject = stream;
        // video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        // video.play();
        //
        // parent.style = '';
        // caminfo.innerText = 'Your local camera';
      } catch (err) {
        console.error(err);
      }
      // document.title = 'CAM ' + sender.cam;
      // caminfo = parent.createElement('DIV', 'caminfo' );
      // video = parent.createElement('VIDEO', '', {
      //   style: 'width:100%;',
      //   style: 'width:100%;max-width:400px;',
      //   autoplay: true,
      //   playsinline: true,
      //   onclick() {
      //     console.debug('SNAP', this.paused);
      //     if (this.paused) {
      //       this.play();
      //     } else {
      //       this.pause();
      //     }
      //   }
      // });
    }
  }
  socketClient.on('message', async (event) => {
    const {data} = event;
    let {message_type, content, to, from, options} = data;
    if (message_type) {
      console.warn('message', message_type, content, options);
      // console.debug('message', message_type, {content,options});
      options = options || {};
      options.from = from;
      const connection_id = options.connection_id = from + (options.cam || '');
      if (message_type === 'OPTIONS' && sender.cam) {
        send( 'CAMERA_EVAIL', sender, from);
      } else if (message_type === 'GETOFFER') {
         // if (connections.has(from)) connections.get(from).close();

      } else if (message_type === 'SETWALL' && !sender.cam && !('control' in sender)) {
        selectElement.value = content.target;
        cams.get(content.cam).startElement.click();
      } else if (message_type === 'CAMERA_EVAIL') {
        if (cams.has(options.cam)) {
          if (connections.has(options.connection_id)) {
            connections.get(options.connection_id).close();
          }
          cams.get(options.cam).buttonElem.remove();
        }
        cams.set(options.cam, options);
        const cam = cams.get(options.cam);
        if (recorder) {
          send ('GETOFFER', {}, options.from);
          return;
        }
        if (sender.wall) {
          cam.buttonElem = $('button').text(options.cam).parent(btnbar).on('click', e => {
            if (!('control' in sender)) {
              console.debug('showCam', content);
              showCam(content);
              // if (cams[content.cam].stream) {
              //   let config = channels.find(config => config.id === selectElement.value);
              //   if (config.video) {
              //     config.barElement.innerText = `CAM ${content.cam}`;
              //     config.video.srcObject = cams[content.cam].stream;
              //   }
              // } else {
              //   send ('GETOFFER', {}, options.from);
              // }
            } else {
              send('SETWALL', {target: selectElement.value, cam:options.cam } );
            }
          }).el;
        }
        return;
      }
      if (!connections.has(connection_id)) {
        connections.set(connection_id, new Connection(options));
      }
      if (connections.has(connection_id)) {
        connections.get(connection_id).onmessage(message_type, content);
      }
      // console.debug(connection_id, connections.has(connection_id));
    }
  });
  if (wall) {
    console.debug(new Date().toLocaleTimeString(), new Date().toLocaleString());
    btnbar.append(
      $('input').id('playStartDate').type('date').value(new Date().toLocaleString('sv-SE', {year: 'numeric',month: '2-digit',day: '2-digit'})),
      $('input').id('playStartTime').type('time').step(2).value(new Date().toLocaleTimeString()),
      $('input').id('playCam'),
      // .type('number')
      // .append(
      //   [1,2,3,4,5,6,7].map(nr => $('option').text(nr)),
      // ).value('fsdfasd'),
      $('button').text('Play').on('click', play),
    );

    selectElement = $('select').parent(btnbar).el;
    // const wallElement = 'control' in sender ? null : $('div').class('wall aco').parent(parent).el;
    // console.debug(wallElement);
    channels = Array.from(document.querySelectorAll('.channel')).map((el,i) => Object({el, id:el.getAttribute('id')||i}));
    channels.forEach(channel => {
      const {id,el} = channel;
      $(el).on('click', e => {
        channelFocus = channel;
        const {id,cam} = channel;
        selectElement.value = id;
        console.debug({id,cam});
        $('#playCam').value(cam);
      });
      channel.option = $('option').text(id).value(id).parent(selectElement);
      channel.video = $('video').style('width:100%;').parent(el).autoplay(true).attr('playsinline',true).el;
      channel.barElement = $('div').class('bar').text(channel.id).parent(el).el;
    })
    // channels.forEach((channel,i) => {
    //   channel.id = channel.id || i;
    //   $(selectElement).append($('option').text(channel.id).value(channel.id));
    //   if (!('control' in sender)) {
    //     channel.element = $('div').class('frame').parent(wallElement).el;
    //     channel.video = $('video').parent(channel.element).autoplay(true).attr('playsinline',true).on('click', e => selectElement.value = channel.id).el;
    //   }
    // });
  }
  socketClient.send('OPTIONS', {cam,group,wall});
  Object.setPrototypeOf(this,{startChat,cams,streams});
};
