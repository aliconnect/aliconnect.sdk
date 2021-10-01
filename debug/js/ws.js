function WebSocket(){
  $(this).extend(...arguments);
  this.clients = new Map();
  // return this.connect(...arguments)
}
WebSocket.prototype = {
  connect(){
    return $.promise( 'connect', resolve => {
      this.setState('CONNECTING', `Connecting ${this.url}`);
      if (this.WebSocket) return resolve(this);
      this.resolve = resolve;
      // console.debug('connect', this.url);
      Object.assign(this.WebSocket = new window.WebSocket(this.url), {
        messages: [],
        requests: {},
        message: message => {
          // alert('SEND'+JSON.stringify(message));
          // console.debug('MESSAGE', ws.readyState, webSocket, this.ws, this);
          webSocket.send(message);
          if ($.wsServer && $.wsServer){
            $.wsServer.forEach(ws => ws.send(message))
          }
        },
        // onconnect: e => {
        // 	console.debug('onconnect', ws, e.target);
        // },
        onmessage: e => this.onmessage(e),
        onopen: e => {
          this.setState('OPEN');
          this.WebSocket.send(JSON.stringify({
            hostname: this.hostname || 'aliconnect',
            nonce: this.nonce,
            PHPSESSID: this.PHPSESSID,
            headers: aimClient.getAccessToken()
            ? {
              Authorization:'Bearer ' + aimClient.getAccessToken()
            }
            : null
          }));
          // console.debug('ONOPEN', e.target, webSocket, this.ws);
          // resolve(webSocket);
        },
        onclose: e => {
          this.setState('DISCONNECTED');
          this.WebSocket = null;
          setTimeout(() => this.connect(), 5000);
          // clearTimeout(this.pingTimeout);
          //this.pingTimeout=setTimeout(function, 1000);
          // $().emit('wscClose');
        },
        onerror: e => {
          this.setState('ERROR');
          // $().emit('wscClose');
        },
      });
      return this;
    })
  },
  login(access_token){
    return $.promise( 'Socket login', resolve => {
      // console.debug('WS LOGIN', access_token);
      this.resolve = resolve;
      if (!access_token || !this.WebSocket) return resolve(this);
      this.WebSocket.send(JSON.stringify({
        headers: {
          authorization: 'Bearer '+access_token,
        }
      }));
    })
  },
  message(par){
    console.error('$.WebsocketRequest', par);
    let message='';
    if (par){
      // let req=par;
      // const request = new $().url(...arguments);
      // const res = request.req.res;
      // message = request.message;
      console.error('WebsocketRequest', par);
      // return;
      // if (req.message_id){
      // 	message.message_id = req.message_id;
      // }
      // if (res){
      // 	message.id = req.id = req.id || new Date().valueOf();
      // 	$.WebsocketClient.requests[message.id] = res;
      // }
      message = JSON.stringify(par);
      $.WebsocketClient.messages.push(message);
      // req.device_id = $.his.cookie ? $.his.cookie.device_id : 'test_max';
    }
    if (!$.WebsocketClient.conn){
      // console.debug('STARTCONNECT',$.WebsocketClient);
      return $.WebsocketClient.connect();
    }
    // console.debug('SERVER REQUEST', message);
    if ($.WebsocketServer){
      // console.debug('SERVER REQUEST', message);
      $.WebsocketServer.clients.forEach(wsChild => wsChild.send(message));
    }
    if ($.WebsocketClient.conn.readyState !== 1){
      return;
    }
    while (message = $.WebsocketClient.messages.shift()){
      $.WebsocketClient.send(message);
    }
  },
  onmessage(e){
    // console.debug('ws.onmessage', e.data);
    const ws = e.target;
    // return;
    const config = this.config;
    let data = e.data;
    try {
      this.data = data = JSON.parse(data);
      // $().status('ws', `${new Date().toLocaleString()} ${data.from_id || ''}`);
    } catch (err){
      return $().status('wsm', 'error');
      // return console.error('ws.onmessage error', data.substr(0,1000));
    }
    if (data.body) {
      if (data.body.notify) {
        console.log('NOTIFY', window.document.hasFocus());
        if (!window.document.hasFocus()) {
          if ("Notification" in window) {
            if (Notification.permission === "granted") {
              // var notification = new Notification(...Object.values(data.body.notify));
              // notification.onclick = function(e) {
              //   window.focus();
              //   console.log('CLICKED', data.body.notify);
              // }
              new $().sw.showNotification(...Object.values(data.body.notify));
              // `test modified SW`, {
              //   body: `Bla Bla`,
              //   icon: 'https://aliconnect.nl/favicon.ico',
              //   image: 'https://aliconnect.nl/shared/265090/2020/07/09/5f0719fb8fa69.png',
              //   data: {
              //     url: document.location.href,
              //   },
              //   actions: [
              //     {
              //       action: 'new',
              //       title: 'New',
              //       // icon: 'https://aliconnect.nl/favicon.ico',
              //     },
              //     {
              //       action: 'open',
              //       title: 'Open',
              //       // icon: 'https://aliconnect.nl/favicon.ico',
              //     },
              //     // {
              //     //   action: 'gramophone-action',
              //     //   title: 'gramophone',
              //     //   icon: '/images/demos/action-3-128x128.png'
              //     // },
              //     // {
              //     //   action: 'atom-action',
              //     //   title: 'Atom',
              //     //   icon: '/images/demos/action-4-128x128.png'
              //     // }
              //   ]
              // });
            }
          }
        }
      }
      if (data.body.accept) {
        $().prompt('accept').accept_scope(data.body.accept.scopes, data.from_id);
        // console.log($().prompt('accept_scope'), $.his.map.get('accept_scope'));
      }
    }
    if (data.state === 'disconnect') {
      console.log('disconnect', $().aliconnector_id, data.from_id);
      // return;
      if ($().aliconnector_id === data.from_id) {
        $().status('aliconnector', 'offline');
        $().aliconnector_id = null;
      }
    }
    console.error(data);
    if (data.id_token) {
      const id = JSON.parse(atob(data.id_token.split('.')[1]));
      console.log(id, getId(id.sub), getUid(id.sub), aimClient.sub);
      if (getId(id.sub) !== getId(aimClient.sub)) {
        return $().logout();
      }
    }
    // console.debug('ws.onmessage', data);
    if (this.clients.has(data.from_id)){
      console.log('REPLY FROM', data.from_id);
      this.clients.get(data.from_id)(data.body);
      this.clients.delete(data.from_id);
      return
    }
    if (data.from_id === $().aliconnector_id) {
      if (data.param) {
        if (data.param.filedownload) {
          console.log('filedownload', data.param.filedownload);
        }
        if (data.param.fileupload) {
          console.log('fileupload', data.param.fileupload);
        }
      }
    }
    if ('userstate' in data){
      console.debug('userstate', data);
      console.debug(Item.items, Item.items.filter(item => item.ID == data.sub));
      Item.items
      .filter(item => item.ID == data.sub)
      .forEach(item => item.elements.forEach(element => element.hasAttribute('userstate') ? element.setAttribute('userstate', data.userstate) : null))
    }
    if ('socket_id' in data){
      // console.warn(this, 'socket_id', data);
      this.socket_id = data.socket_id;
      let currentState = ws.state;
      if (data.socket_id === 1){
        this.setState('UNAUTHORIZED');
      } else if (data.payload){
        this.setState('AUTHORIZED');
        setState = (state) => {
          this.setState(state);
          // broadcast message with state
          // op ws server bijhouden alle connecties van gebruiker,
          // alleen als alle connecties offline zijn dan bericht sturen.
          // timeout opnemen in geval van omschakelen naar andere app
        }
        // window.addEventListener('focus', e => setTimeout(() => setState('focussed')))
        // window.addEventListener('blur', e => setTimeout(() => setState('online')))
      } else {
        this.setState('CONNECTED');
        // ws.login();
      }
      this.resolve(this);
      data.type = 'connect';
      if (currentState === 'CONNECTING'){
        $().emit('connect', data);
      }
      while (message = ws.messages.shift()){
        console.debug('MESSAGE', message);
        ws.send(message);
      }
    } else {
      $.handleData(data);
    }
    return;
    if (data.aliconnector) {
      console.log(data);
      if (data.aliconnector === 'online') {
        $().status('aliconnector', 'online');
        this.sendto($().aliconnector_id = data.from_id, { path: 'sign_in' });
      }
      // console.debug('aliconnector', data, data.from_id);
      // $.Aliconnector.state = 'online';
      // if (ws.infoElement){
      //   ws.infoElement.innerText = ws.state + '+';
      // }
    }
    // if ('reply' in data){
    //   $.Aliconnector.reply(data.reply);
    // }
    // if ('signin' in data){
    //   console.debug('SIGNIN', data);
    //   const sub = config.id ? config.id.sub : (config.access ? config.access.sub : null);
    //   if (data.access.sub != sub){
    //     $.clipboard.reload();
    //   }
    // }
    return;
    if (((data.ref && data.ref.itemsModified) || data.forward) && data.from_id && this.wsServer){
      this.wsServer.forward(data, e.data, ws);
    }
    // return;
  },
  reply(message){
    console.debug('repl', message);
    return this.sendto(this.data.from_id, {body: message});
  },
  send(message){
    // console.debug('send', message);
    if (!this.WebSocket) return;
    $().status('ws', 'ACTIVE');
    setTimeout(() => {
      $().status('ws', this.state);
    },100);
    message = JSON.stringifyReplacer(message);
    this.WebSocket.send(message);
    if ($.server) {
      $.server.clients.forEach(ws => ws.send(message));
    }
  },
  sendto(sid, message = {}){
    console.debug('send to', this.state);
    $().status('ws', 'ACTIVE');
    message.to = { sid: sid };
    return $.promise( 'send to', resolve => {
      $().status('ws', this.state);
      this.clients.set(sid, resolve);
      this.send(message);
    });
  },
  setState(state, message){
    $().status('ws', this.state = state);
    // if (window.document){
    //   this.procstate = this.procstate || $().procstate();
    //   this.procstate.text(message || '');
    // }
  },
};
