// Version 0.0.6
eol = '\n';
function url_string(s) {
  return s.replace(/%2F/g, '/');
}
function checkPath(e) {
  let elem;
  if (elem = e.path.find(elem => elem.item)) {
    e.itemElement = elem;
    e.item = e.itemElement.item;
  }
}
function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

(function web (){

  function handleData(targetItem, e) {
    if(document.activeElement.isContentEditable || ['INPUT'].includes(document.activeElement.tagName)) {
      return;
    }
    console.log('web.js.handleData', e, e.view === window);

    if (targetItem) {
      console.log(targetItem);
      const eventData = e.dataTransfer || e.clipboardData;
      const type = $.his.keyEvent && $.his.keyEvent.shiftKey ? 'link' : e.type;
      let data;
      if (eventData.types.includes('Files')) {
        e.preventDefault();
        e.stopPropagation();
        const files = [...eventData.files];
        const xls = files.find(file => file.name.includes('.xls'));
        if (xls) {
          return importXlsFile(xls);
        }
        files.forEach(targetItem.elemFiles.appendFile)
      } else if (data = eventData.getData("Aim/items")) {
        data = JSON.parse(data);
        data.type = data.type || (e.ctrlKey ? 'copy' : 'cut');
        data.target = targetItem.tag;
        if (data.value) {
          const targetItem = Item.get(data.target);
          console.log(data, targetItem, data.value);
          if (data.type === 'cut') {
            const parent = targetItem;
            // return;
            // data.value.forEach(item => targetItem.append($(item.tag)));
            data.value.forEach(item => $.link({
              name: 'Master',
              item: item,
              to: targetItem,
              current: item.Master,
              index: 99999,
              action: 'move',
            }));
          } else if (data.type === 'copy') {
            const items = [];
            (async function copy (item) {
              if (item) items.push(item);
              const source = data.value.shift();
              if (source) return await $().copyFrom(source, targetItem).then(copy);
              item = items.shift();
              //console.log(item, $().tree());
              $().tree().setFocusElement(item.elemTreeLi.elem);
              item.edit();
            })();
          }
        }
        // TODO: files cut copy uitwerken
        if (data.files) {
          if (type === 'cut') {
            data.files.forEach(ofile => {console.warn('cut', ofile);} );
          } else if (type === 'copy') {
            data.files.forEach(ofile => {console.warn('copy', ofile);} );
          }
        }
        e.preventDefault();
        e.stopPropagation();
      } else if (data = eventData.getData("text/html")) {
        // //console.debug('HTML', html);
        // importeer html img if pasted
        var tmpStr = data.match("<!--StartFragment-->(.*)<!--EndFragment-->");
        var fragment = tmpStr[1];
        // //console.debug('FRAGMENT', fragment);
        if (fragment.substr(0, 3) == '<a>') {
          console.debug('REF', fragment);
        }
        else if (fragment.substr(0, 5) == '<img ') {
          console.debug('IMG', fragment);
        }
        //return;
      } else if (data = eventData.getData("text")) {
        if (data.substr(0, 4) == 'http') {
          //console.debug('URL', data);
        }
      }
    }
    $.clipboard.dragItems = [];
  }
  function eventKeyState (e) {
    return e ? (e.shiftKey && e.ctrlKey ? 'link' : (e.shiftKey ? 'move' : (e.ctrlKey ? 'copy' : 'default'))) : 'default';
  }

  function handleEvent(e){
    if (e){
      if (e.body){
        console.error('handleEvent', e.body);//JSON.parse(e.target.responseText));
        // console.error('CONNECT API', connectState, e.body);
        $.extend(e.body);
        // Ophalen localhost web applicatie config file
        if ($.config_url){
          let res = new XMLHttpRequest();
          res.open('get', $.config_url);
          res.onload = e => $.url('https://aliconnect.nl/v1beta1/api?request_type=yamlToJson', e.target.response).post().then(handleEvent);
          res.send();
          $.config_url = null;
          return;
        }
        $().emit('config');
        new $.WebsocketRequest();
      }
      if (e.type === 'connect' && e.socket_id && $.his.cookie.id_token){
        uploadState({ type: 'focus' });
      }
    }
    connectState++;
    if (connectState === 2){
      if (window.addEventListener){
        window.addEventListener('focus', uploadState);
        window.addEventListener('blur', uploadState);
      }
      $.auth.init();
      if ($.webinit){
        $.webinit();
      }
    }
  };
  function checkkey(e) {
    const path = $.his.clickEvent ? [...$.his.clickEvent.path] : [];
    path.push($);
    path.forEach(elem => {
      // const onkey = elem['on' + e.type];
      // // //console.log(e, elem, onkey);
      // if (onkey) {
      // 	onkey.call(elem, e);
      // }
      const keys = elem[e.type];
      if (keys && keys[e.keyPressed]) {
        keys[e.keyPressed].call(elem, e);
      }
    })
  }
  function onkey(e) {
    window.event = e;
    e.keyPressed = [
      e.ctrlKey ? 'ctrl_' : '',
      e.shiftKey ? 'shift_' : '',
      e.altKey ? 'alt_' : '',
      e.code,
    ].join('');
    $.his.keyEvent = null;
    clearTimeout($.his.keydownTimeout);
    clearTimeout($.his.keyupTimeout);
    clearTimeout($.his.keybufferTimeout);
    $.his.keybufferTimeout = setTimeout(() => $.his.keybuffer = [], 300);
    $.his.keybuffer = $.his.keybuffer || [];
    $.his.keybuffer.push(e.key);
    e.keybuffer = $.his.keybuffer;
    // if (document.activeElement !== document.body) {
    // 	e.keyPressed += '_edit';
    // }
    // 	key = key.replace('Arrow', '').replace('Escape', 'Esc');
    checkPath(e);
    if ($.his.clickEvent) {
      e.itemElement = e.itemElement || $.his.clickEvent.itemElement;
      e.item = e.item || $.his.clickEvent.item;
      e.clickEvent = $.his.clickEvent;
    }
  }
  function loadStoredCss() {
    const css = JSON.parse(localStorage.getItem('css')) || {};
    for (let [id, param] of Object.entries(css)) {
      let selector = id === '_body' ? document.body : document.getElementById(id);
      if (selector) {
        selector.style.cssText += Object.entries(param).map(entry => entry.join(':')).join(';');
      }
    }
  }
  function importScript(src) {
    // console.log('importScript', src);
    // src = new URL(src, document.location).href;
    return $.promise('script', callback => {
      // console.log(2, 'SCRIPT', src);
      function loaded(e) {
        e.target.loading = false;
        for (let [key,value] of Object.entries(e.target)) {
          if (typeof value === 'function') {
            Elem.prototype[key] = value;
          }
        }
        callback();
      }
      for (let script of [...document.getElementsByTagName('SCRIPT')]) {
        if (script.getAttribute('src') === src) {
          // console.log(3, 'SCRIPT', src);
          if (script.loading) {
            // console.log(4, 'SCRIPT', src);
            return $(script).on('load', loaded);
          }
          // console.log(4, 'SCRIPT', src);
          return callback();
        }
      }
      var el = $('script').src(src).parent(document.head).on('load', loaded);
      el.elem.loading = true;
      // console.log('SCRIPT', el);
    });
  }

  const libraries = Aim.libraries = {
    start() {
      // console.log('START');
      return;
      if ($.user) $().dashboard();
      else $().home();
    },
    sw() {
      // return;
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', e => {
          console.log('MESSAGE', e);
          if (e.data && e.data.url) {
            const url = new URL(e.data.url);
            document.location.href = '#' + url.pathname + url.search;
          }
          // alert('sadfasdfa');
          // window.focus();
        });
        navigator.serviceWorker.register('sw.js', { scope: '/' }).then(function(registration) {
          // console.log('Registration successful, scope is:', registration.scope, navigator.serviceWorker);
          $().sw = registration;
          return;
          // registration.showNotification('sfasdfa');
          registration.pushManager
          .subscribe({ userVisibleOnly: true })
          .then(function(sub) {
            // From your client pages:
            const channel = new BroadcastChannel('sw-messages');
            channel.addEventListener('message', e => {
              console.log('Received', e.data);
            });
            console.log('SW', sub);
            // $().sw = registration.active;
            $().sw.active.postMessage(
              JSON.stringify({
                hostname: document.location.hostname,
                // device_id: $.his.cookie.device_id,
                // access_token: $.his.cookie.access_token,
                // id_token: $.his.cookie.id_token,
                // refresh_token:$.his.cookie.refresh_token,
              }),
            );
            // //console.log("Posted message");
          });
        })
        .catch(function(error) {
          // //console.log('Service worker registration failed, error:', error);
        });
      }
    },
    om() {
    },
    // omd() {
    //   function childObject(object, schemaname) {
    //     // console.log(schemaname);
    //     if (object) {
    //       const obj = Object.fromEntries(Object.entries(object).filter(([name, obj]) => typeof obj !== 'object'));
    //       obj.children = Object
    //       .entries(object)
    //       .filter(([name, obj]) => typeof obj === 'object')
    //       .map(([name, obj]) => Item.get(Object.assign({
    //         schema: schemaname,
    //         name: name,
    //         title: name.replace(/^\d+[-| ]/,'')
    //       }, childObject(obj, schemaname))));
    //       return obj;
    //     }
    //   }
    //   $().on({
    //     async load() {
    //       ($().server = $().server || {}).url = $().server.url || ('//' + document.location.hostname.split('.')[0] + '.aliconnect.nl/api');
    //       if (!$().client_id) {
    //         console.warn($().server.url);
    //         await $().url($().server.url+'/').get().then(e => $().extend(e.body)).catch(console.error);
    //         console.warn(1, aimClient.api('/').toString());
    //         // await $().url($().server.url+'/').get().then(e => console.log(JSON.stringify(JSON.parse(e.target.responseText),null,2).replace(/"(\w+)"(?=: )/gs,'$1'))).catch(console.error);
    //       }
    //       $(document.documentElement).class('app');
    //       $(document.body).class('row aim om bg').id('body').append(
    //         $.his.elem.navtop = $('header').id('navtop').class('row top bar noselect np').append(
    //           $.his.elem.menu = $('a').class('abtn icn menu').on('click', e => {
    //             if ($.his.elem.menuList && $.his.elem.menuList.style()) {
    //               $.his.elem.menuList.style('');
    //             } else {
    //               if ($.his.elem.menuList) $.his.elem.menuList.style('display:none;');
    //               $(document.body).attr('tv', document.body.hasAttribute('tv') ? $(document.body).attr('tv')^1 : 0)
    //             }
    //           }),
    //           $('a').class('title').id('toptitle').on('click', e => $().start() ),
    //           $('form').class('search row aco')
    //           .on('submit', e => {
    //             const value = $.searchValue = e.target.search.value;
    //             var result = value
    //             ? [...$.props.values()]
    //             .filter(item => item instanceof Item)
    //             .unique()
    //             .filter(item => item.header0 && value.split(' ').every(value => [item.header0,item.name].join(' ').match(new RegExp(`\\b${value}\\b`, 'i'))))
    //             : [];
    //             $().list(result);
    //             return false;
    //           })
    //           .append(
    //             $('input').name('search').autocomplete('off').placeholder('zoeken'),
    //             $('button').class('abtn icn search fr').title('Zoeken'),
    //           ),
    //           $('a').class('abtn icn dark').dark(),
    //         ),
    //         $('section').tree().id('tree').css('max-width', $().storage('tree.width') || '200px'),
    //         // $('div').seperator(),
    //         $('section').id('list').list(),
    //         // $('div').seperator('right'),
    //         $('section').id('view').class('col aco apv printcol').css('max-width', $().storage('view.width') || '600px'),
    //         $('section').id('preview').class('col aco apv info'),
    //         $('section').class('row aco doc').id('doc'),
    //         $('section').class('prompt').id('prompt').tabindex(-1).append(
    //           $('button').class('abtn abs close').attr('open', '').tabindex(-1).on('click', e => $().prompt(''))
    //         ),
    //         // $('section').id('section_main').class('row aco main section_main').append(
    //         // ),
    //         $('footer').statusbar(),
    //       );
    //       $(document.body).messagesPanel();
    //       // console.log(document.location.hostname.split('.')[0]);
    //       // console.warn($().server.url, $());
    //       await $().translate();
    //       // await $().getApi(document.location.origin+'/api/');
    //       await $().login();
    //       if (aimClient.sub) {
    //         // await aimClient.api('/').get().then(e => $($()).extend(e.body));
    //         // await $().url($().server.url+`/config/${aimClient.sub}/api.json`).get().then(e => $().extend(e.body));
    //         if ('Notification' in window) {
    //           var permission = Notification.permission;
    //           // const notificationPermission = Notification.permission.toString();
    //           // console.log('Notification', permission);
    //           if (Notification.permission === 'default') {
    //             $.his.elem.navtop.append(
    //               $('a').class('abtn').text('Notifications').on('click', e => Notification.requestPermission())
    //             )
    //           }
    //           // if (!['denied','granted'].includes(Notification.permission)) {
    //           //   this.elemNavtop.append(
    //           //     // $('a').class('abtn').test('Notifications').on('click', e => Notification.requestPermission())
    //           //   )
    //           // }
    //         }
    //         $.his.elem.navtop
    //         .prompts(...$.const.prompt.menu.prompts)
    //         .append(
    //           $.his.elem.account = $('a').class('abtn account').caption('Account').href('#?prompt=account').draggable(),
    //         );
    //         if ($().menu) {
    //           $().menuChildren = childObject($().menu).children;
    //           $().tree(...$().menuChildren);
    //         }
    //         if ($.aud = await $(`/Company(${aimClient.aud})`).details()) {
    //           $().tree($.aud)
    //         }
    //         if ($.user = await $(`/Contact(${aimClient.sub})`).details()) {
    //           $().tree($.user);
    //           await aimClient.api(`/`).query('request_type','visit').get().then(body => $.his.items = body);
    //           $.his.elem.account.item($.user, 'accountElem');
    //           $.user.emit('change');
    //           if ($.user.data.mse_access_token) {
    //             $()
    //             .schemas('msaEvent', {
    //               properties: {
    //                 title: {
    //                   get() {
    //                     // console.log(this);
    //                     return this.data.start ? `${this.data.start.dateTime} ${this.data.start.endTime}` : '';
    //                   },
    //                 },
    //                 subject: {},
    //                 summary: {
    //                   get(){
    //                     // console.log(this);
    //                     return `${this.data.organizer.emailAddress.name} (${this.data.organizer.emailAddress.address})`;
    //                   },
    //                 },
    //                 // "@odata.etag": {},
    //                 // id: {},
    //                 start: {},
    //                 end: {},
    //                 organizer: {}
    //               }
    //             })
    //             .schemas('msaContact', {
    //               // title() {
    //               //   return this.combine('displayName');
    //               // },
    //               // subject() {
    //               //   return this.combine('givenName,firstName,middleName,lastName,companyName');
    //               // },
    //               header: [
    //                 ['DisplayName'],
    //                 ['GivenName','FirstName','MiddleName','LastName','CompanyName'],
    //                 [],
    //               ],
    //               // filterfieldnames: 'Surname,CompanyName',
    //               properties: {
    //                 // "@odata.etag": {},
    //                 // id: {},
    //                 // createdDateTime: {},
    //                 // lastModifiedDateTime: {},
    //                 // changeKey: {},
    //                 // parentFolderId: {},
    //                 // fileAs: {},
    //                 // categories: {},
    //                 DisplayName: {
    //                   legend: 'Personalia',
    //                 },
    //                 Initials: {
    //                 },
    //                 GivenName: {
    //                 },
    //                 MiddleName: {
    //                 },
    //                 Surname: {
    //                 },
    //                 Title: {
    //                 },
    //                 nickName: {
    //                 },
    //                 // yomiGivenName: {},
    //                 // yomiSurname: {},
    //                 // yomiCompanyName: {},
    //                 // imAddresses: {},
    //                 companyName: {
    //                   legend: 'Business',
    //                 },
    //                 department: {
    //                 },
    //                 officeLocation: {
    //                 },
    //                 profession: {
    //                 },
    //                 jobTitle: {
    //                 },
    //                 assistantName: {
    //                 },
    //                 manager: {
    //                 },
    //                 businessHomePage: {
    //                 },
    //                 emailAddresses: {
    //                   legend: 'Contact',
    //                 },
    //                 mobilePhone: {
    //                 },
    //                 businessPhones: {
    //                 },
    //                 businessAddress: {
    //                 },
    //                 otherAddress: {
    //                 },
    //                 homePhones: {
    //                   legend: 'Personal',
    //                 },
    //                 homeAddress: {
    //                 },
    //                 birthday: {
    //                 },
    //                 spouseName: {
    //                 },
    //                 children: {
    //                 },
    //                 generation: {
    //                 },
    //                 personalNotes: {
    //                 },
    //               }
    //             })
    //             .schemas('msaMessage', {
    //               title() {
    //                 return this.data.from ? (this.data.from.emailAddress.name ? this.data.from.emailAddress.name : this.data.from.emailAddress.address) : '';
    //               },
    //               subject() {
    //                 return this.data.subject;
    //               },
    //               bodyPreview() {
    //                 return this.data.bodyPreview;
    //               },
    //               properties: {
    //                 // "@odata.etag": {},
    //                 // createdDateTime: {},
    //                 // lastModifiedDateTime: {},
    //                 // id: {},
    //                 // changeKey: {},
    //                 // hasAttachments: {},
    //                 // isDeliveryReceiptRequested: {},
    //                 // isReadReceiptRequested: {},
    //                 // isRead: {},
    //                 // isDraft: {},
    //                 // flag: {},
    //                 // bodyPreview: {},
    //                 // parentFolderId: {},
    //                 // conversationId: {},
    //                 // conversationIndex: {},
    //                 // internetMessageId: {},
    //                 // receivedDateTime: {},
    //                 // sentDateTime: {},
    //                 // importance: {},
    //                 // inferenceClassification: {},
    //                 // from: {},
    //                 // sender: {},
    //                 // toRecipients: {},
    //                 // ccRecipients: {},
    //                 // bccRecipients: {},
    //                 // replyTo: {},
    //                 // webLink: {},
    //                 // categories: {},
    //                 subject: {},
    //                 body: {},
    //               }
    //             })
    //             .schemas('msaNotebook', {
    //               properties: {
    //                 title: {
    //                   get: 'displayName',
    //                 },
    //                 summary: {
    //                   get() {
    //                     return `${this.data.lastModifiedDateTime} ${this.data.lastModifiedBy.user.displayName}`
    //                   },
    //                 },
    //                 // createdDateTime: {},
    //                 // createdBy: {},
    //                 // lastModifiedDateTime: {},
    //                 // lastModifiedBy: {},
    //                 // id: {},
    //                 isDefault: {},
    //                 isShared: {},
    //                 self: {},
    //                 displayName: {},
    //                 userRole: {},
    //                 sectionsUrl: {},
    //                 sectionGroupsUrl: {},
    //                 links: {}
    //               }
    //             });
    //             $().tree(...childObject({
    //               Outlook: {
    //                 Contacts: {
    //                   onclick: e => $().msa().getContacts(),
    //                 },
    //                 Events: {
    //                   onclick: e => $().msa().getEvents(),
    //                 },
    //                 Messages: {
    //                   onclick: e => $().msa().getMessages(),
    //                 },
    //                 Notes: {
    //                   onclick: e => $().msa().getNotes(),
    //                 },
    //               }
    //             }).children);
    //           }
    //         }
    //         // $().url('https://aliconnect.nl/api/').query('request_type', 'build_doc').get().then(e => {
    //         //   console.log('DOCBUILD', e.body);
    //         //   $($).extend(e.body);
    //         //   $().tree(...childObject($.docs, 'Chapter').children);
    //         // });
    //       } else {
    //         $.his.elem.navtop
    //         .append(
    //           $('a').class('abtn login').text('Aanmelden').href($().loginUrl().query('prompt', 'login').toString()),
    //         );
    //         // $(document.documentElement).class('site');
    //         //
    //         // $('navtop').append(
    //         //   $.his.elem.menu = $('a').class('abtn icn menu').on('click', e => {
    //         //     if ($.his.elem.menuList && $.his.elem.menuList.style()) {
    //         //       $.his.elem.menuList.style('');
    //         //     } else {
    //         //       if ($.his.elem.menuList) $.his.elem.menuList.style('display:none;');
    //         //     }
    //         //   }),
    //         //   $('a').class('title').href('/').id('toptitle'),
    //         //   $('form').class('search row aco'),
    //         //   $('a').class('abtn icn dark').dark(),
    //         //   $.his.elem.account = $('a').class('abtn account').caption('Account').href('#?prompt=account').draggable(),
    //         // );
    //         //
    //         // $('section_main').append(
    //         //   $('section').id('list').list(),
    //         //   $('div').seperator('right'),
    //         //   $('section').id('view').class('col aco apv printcol').css('max-width', $().storage('view.width') || '600px'),
    //         //   $('section').id('preview').class('col aco apv info'),
    //         //   $('section').class('row aco doc').id('doc'),
    //         //   $('section').class('prompt').id('prompt').append(
    //         //     $('button').class('abtn abs close').attr('open', '').on('click', e => $().prompt(''))
    //         //   ),
    //         // );
    //         //
    //       }
    //       // if ($().schemas()) {
    //       //   const itemItem = $().schemas().get('Item');
    //       //   if (itemItem) {
    //       //     itemItem.HasChildren = true;
    //       //     [...$().schemas().values()].forEach(item => {
    //       //       if (item !== itemItem) {
    //       //         if (!item.Master || !item.Master.LinkID) {
    //       //           $(item).Master = { LinkID: itemItem.ID };
    //       //         }
    //       //         // console.log(item.name, item.SrcID, item.MasterID);
    //       //         if (!item.SrcID || item.SrcID !== item.MasterID) {
    //       //           $(item).Src = { LinkID: item.MasterID };
    //       //         }
    //       //       }
    //       //     });
    //       //     $().tree($().schemas().get('Item'));
    //       //   }
    //       //   if ($().schemas().has('Equipment')) {
    //       //     aimClient.api(`/Equipment`).select($.config.listAttributes).top(10000).filter('keyID IS NOT NULL').get()
    //       //   }
    //       // }
    //       if ($().aud) {
    //         // console.log($().aud, $({tag: `Company(${$().aud})`}));
    //         $.his.elem.menu.showMenuTop($({tag: `Company(${$().aud})`}));
    //       }
    //       if ($().info) {
    //         $('toptitle').text(document.title = $().info.title).title([$().info.description,$().info.version,$().info.lastModifiedDateTime].join(' '));
    //       }
    //       // console.log(document.location.application_path);
    //       $().application_path = $().application_path || '/';
    //       // var url = new URL(document.location);
    //       // $().pageHome = $().pageHome || '//' + document.location.hostname.replace(/([\w\.-]+)\.github\.io/, 'github.com/$1/$1.github.io') + '/wiki/Home';
    //       $().ref = $().ref || {};
    //       $().ref.home = $().ref.home || '//aliconnect.nl/sdk/wiki/Home';
    //       console.log($().ref.home);
    //
    //       if (!document.location.search) {
    //
    //         $().execQuery('l', $().ref.home, true );
    //         // $().execQuery('l', document.location.origin);
    //       }
    //       // if (document.location.pathname === $().application_path && !document.location.search) {
    //       //   window.history.replaceState('page', 'PAGINA', '?p='+($().ref && $().ref.home ? $().ref.home : document.location.origin));
    //       //   // $(window).emit('popstate');
    //       // }
    //       // $(document.body).cookieWarning();
    //       function response(e) {
    //         console.log(e.target.responseText);
    //       }
    //     },
    //   });
    // },
    loadclient() {
      // console.log('AA');
      $().on({
        load() {
          if ($().script && $().script.src) {
            const el = document.createElement('script');
            el.src = $().script.src;
            document.head.appendChild(el);
          }
          // $('list').append(
          //   $('iframe').style('border:none;width:100%;height:100%;').src('/index'),
          // )
          // $('list').load('/index');
        }
      });
    },
    getstarted() {
      $().on({
        async ready() {
          libraries.start();
        }
      });
    },
  };

  function Elem (elem) {
    const args = [...arguments];
    elem = this.elem = args.shift();
    this.elem.selector = this.elem.is = this;
    this.map = new Map();
    if (args.length){
      if (typeof this[elem.id] === 'function'){
        // console.debug(elem.id);
        this[elem.id](...args);
      } else {
        args.forEach(arg => {
          if (arg instanceof Object){
            Object.assign(elem, arg);
          } else if (typeof arg === 'string'){
            if ('className' in this){
              this.innerHTML = elem.innerHTML = arg;
            } else if (this.className = arg){
              elem.className = arg;
            }
          }
        })
      }
    }
  };
  Object.defineProperties(Elem, {
    tagnames: { value: [
      'a',
      'abbr',
      'address',
      'area',
      'article',
      'aside',
      'audio',
      'b',
      'base',
      'bdi',
      'bdo',
      'blockquote',
      'body',
      'br',
      'button',
      'canvas',
      'caption',
      'cite',
      'code',
      'col',
      'colgroup',
      'data',
      'datalist',
      'dd',
      'del',
      'details',
      'dfn',
      'dialog',
      'div',
      'dl',
      'dt',
      'em',
      'embed',
      'fieldset',
      'figcaption',
      'figure',
      'footer',
      'form',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'head',
      'header',
      'hgroup',
      'hr',
      'html',
      'i',
      'iframe',
      'img',
      'input',
      'ins',
      'kbd',
      'label',
      'legend',
      'li',
      'link',
      'main',
      'map',
      'mark',
      'menu',
      'meta',
      'meter',
      'nav',
      'noscript',
      'object',
      'ol',
      'optgroup',
      'option',
      'output',
      'p',
      'param',
      'picture',
      'pre',
      'progress',
      'q',
      'rp',
      'rt',
      'ruby',
      's',
      'samp',
      'script',
      'section',
      'select',
      'slot',
      'small',
      'source',
      'span',
      'strong',
      'style',
      'sub',
      'summary',
      'sup',
      'table',
      'tbody',
      'td',
      'template',
      'textarea',
      'tfoot',
      'th',
      'thead',
      'time',
      'title',
      'tr',
      'track',
      'u',
      'ul',
      'var',
      'video',
      'wbr',
    ] },
  });
  Object.defineProperties(Elem.prototype, {
    // action() {
    //   return this.attr('action', ...arguments)
    // },
    append: { value: function () {
			this.elem = this.elem || document.body;
      // const args = [].concat(...arguments);
      // console.log(arguments, args);
      Array.from(arguments).forEach(arg => {
        if (typeof arg === 'string') {
          this.elem.append(document.createTextNode(arg));
        } else if (Array.isArray(arg)) {
          arg.forEach(arg => this.append(arg));
        } else if (arg instanceof Elem) {
          this.elem.append(arg.elem);
        } else if (arg) {
          this.elem.append(arg);
        }
      });
			// args.forEach(a => a ? this.elem.append(typeof a === 'string' ? document.createTextNode(a) : a.elem || a) : null);
			return this;
		}},
    accept_scope: { value: function (scope, socket_id) {
      const properties = Object.fromEntries(scope.map(val => [val, {
        name: val,
        format: 'checkbox',
        checked: 1,
      }]));
      properties.expire_time = {format: 'number', value: 3600};
      const form = $().promptform($().url(AUTHORIZATION_URL).query('socket_id', socket_id), this.elem, arguments.callee.name, {
        properties: properties,
        btns: {
          deny: { name: 'accept', value:'deny', type:'button' },
          allow: { name: 'accept', value:'allow', type:'submit', default: true },
        }
      })
    }},
    attr: { value: function (selector, context, save) {
      if (save && this.elem.id) {
        $.localAttr.set(this.elem.id, selector, context);
      }
      if (selector) {
        if (typeof selector === 'object') {
          Object.entries(selector).forEach(entry => this.attr(...entry));
        } else {
          if (arguments.length === 1) {
            return this.elem.getAttribute(selector)
          } else if (context === null || context === undefined) {
            this.elem.removeAttribute(selector)
          } else if (typeof context === 'function') {
            this.on(selector, context)
          } else if (typeof context === 'object') {
            this.elem[selector] = context;
          // } else if (selector in this.elem) {
          //   this.elem[selector] = context;
          } else {
            this.elem.setAttribute(selector, [].concat(context).join(' '))
          }
        }
      }
      return this;
    }},
    assign: { value: function (selector, context) {
			if (typeof selector === 'string') {
				this.elem[selector] = context;
			} else if (selector instanceof Object) {
				Object.assign(this.elem, context);
			}
			// //console.log(this.elem);
			return this;
		}},
    btns: { value: function (selector, context) {
      const elem = $('div').parent(this).class('row btns');
      function btn(selector, context) {
        if (typeof selector === 'object') {
          return Object.entries(selector).forEach(entry => btn(...entry));
        }
        $(context.href ? 'a' : 'button').parent(elem).class('abtn').name(selector).caption(selector).attr(context)
      }
      [].concat(...arguments).forEach(
        selector => typeof selector !== 'object' ? null : (
          selector.name
          ? btn(selector.name, selector)
          : Object.entries(selector).forEach(entry => btn(...entry))
        )
      );
      return this;
    }},
    cam: { value: function () {
      const video = this.video = $('video').parent(this).autoplay().on('click', e => {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }).elem;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          try {
            video.srcObject = stream;
          } catch (error) {
            video.src = window.URL.createObjectURL(stream);
          }
          video.play();
        });
      }
      return this;
    }},
    cancel: { value: function () {
      this.elem.innerText;
			// if (this.elem.innerText) {
			// 	if (this.selector.contains(this.form)) {
			// 		this.form.remove();
			// 	} else {
			// 		this.selector.innerText = '';
			// 	}
			// 	return this;
			// } else {
			// 	return false;
			// }
			// el.innerText = '';
			// targetElement.item = null;
			// if ($.show) $.show({ id: 0 });
			// if (window.onWindowResize) window.onWindowResize();
		}},
    caption: { value: function () {
      return this.attr('caption', __(...arguments))
    }},
    calendar: { value: function (data) {
			new Calendar(data, this);
			return this;
		}},
    chat: { value: function (selector, context){
			const $chat = this.sections.get('chat', selector => {
				$().main().append(
					selector = $('section').id('chat-room').append(
						$('div').id('videos').append(
							$('video').id('self-view').attr('autoplay', ''),
							$('video').id('remote-view').attr('autoplay', ''),
						)
					),
				);
				return selector;
			});
			return this;
		}},
    checkbox: { value: function () {
      const property = Object.assign({}, ...arguments);
      // console.log(property);
      const id = 'checkbox' + ($.his.checkboxInt = $.his.checkboxInt ? ++$.his.checkboxInt : 1);
      return [
        this
        .class('check')
        .attr('id', id)
        .value(property.value)
        .name(property.name)
        .disabled(property.disabled)
        .checked(property.checked),
        $('label')
        .class('aco')
        .for(id)
        .append(
          $('span')
          .ttext(property.Title || property.title || property.name)
        ),
        $('span')
        .text(property.cnt),
      ];
    }},
    
    class: { value: function (className) {
      // this.elem.className = [].concat(this.elem.className.split(' '), [...arguments]).unique().join(' ').trim();
      this.elem.className = [...arguments].join(' ').trim();
			return this;
		}},
    code: { value: function (content, format) {
      this.class('code');
      if (typeof content === 'function') {
        format = 'js';
        content = String(content).replace(/^(.*?)\{|\}$/g,'');
      }
      content = format && $.string[format] ? $.string[format](content) : content;
      this.elem.innerHTML = content;
      return this;
    }},
    contextmenu: { value: function (menu){
      // console.warn(menu);
      menu = $.extend({}, ...arguments);
      if (!menu.items) console.warn('no items', menu);
      // console.log(menu);
      const menuitems = new Map(Object.entries(menu.items));
      // console.log(menuitems);
      this.tabindex(0);
      this.on('keydown', e => {
        // console.warn('keydown', e.keyPressed);
        [...menuitems.entries()]
        .filter(([name, menuitem]) => menuitem.key === e.keyPressed && menuitem.on && menuitem.on.click)
        .forEach(([name, menuitem]) => menuitem.on.click(e));
      });
      return this;
      this.on('contextmenu', e => {
        e.preventDefault(e.stopPropagation());
        console.log(menu);
    		const targetElement = this.elem;
    		const targetRect = targetElement.getBoundingClientRect();
        var top = targetRect.bottom;
        if ('left' in menu) {
          var left = menu.left;
        } else if ('right' in menu) {
          var left = menu.right - menuElement.clientWidth;
        } else {
          var left = e.clientX;
          var top = e.clientY;
        }
        this.close = e => {
          window.removeEventListener('contextmenu', this.close, true);
          window.removeEventListener('click', this.close, true);
          window.removeEventListener('keydown', this.onKeydown, true);
          this.elemPopup.remove();
        };
        window.addEventListener('keydown', this.onKeydown = e => e.key === 'Escape' ? this.close(e) : null, true);
        // window.addEventListener('contextmenu', this.close, true);
        window.addEventListener('click', this.close, true);
        this.elemPopup = $('div')
        .parent(document.body)
        .class('col popup')
        .css('top', top+'px')
        .css('left', Math.max(0, left)+'px')
        .css('max-height', (window.screen.availHeight - top) + 'px')
        // .on('contextmenu', e => e.preventDefault(e.stopPropagation()))
        .append(
          [...menuitems.entries()].map(([name, menuitem]) => $('div').class('row abtn icn').extend(menuitem).extend({srcEvent:e})),
        );
        return;
    		if (this.handlers.menuElement) {
    			this.handlers.menuElement.remove();
    		}
    		// window.addEventListener('mousedown', e => {
    		// 	if (e.path.find(elem => elem === menuElement)) {
    		// 		return;
    		// 	}
    		// }, true);
    		// var menu = $.mainPopup;
    		if (targetElement.popupmenu) {
    			targetElement.right = 0;
    		}
    		// //console.debug('POS', targetElement, targetRect, targetElement.left, targetElement.right);
    		// //console.debug('PUMENU', this, this.menu, menu, pos);
    		menuElement.innerText = '';
    		for (let [menuname, menuitem] of Object.entries(menuItems)) {
    			// let title = __(menuitem.header0 || menuname);
    			// //console.debug('MENUITEM', menuitem, title);
    			if (menuitem.hidden) continue;
    			var linkElement = menuElement.createElement('A', {
    				name: menuname,
    				value: menuname,
    				elMenu: menuElement,
    				left: 5,
    				menuitem: menuitem,
    				popupmenu: menuitem.menu,
    				// item: this.item,
    				onclick: menuitem.onclick || (this.menu ? this.menu.onclick : null) || targetElement.onselect || function (e) {
    					//console.log ('MENU CLICK');
    					e.stopPropagation();
    				},
    				// onselect: this.onselect,
    				onmouseenter: this.enter
    			}, menuitem, {
    				className: 'row abtn icn ' + (menuitem.className || menuname),
    			});
    			if (menuitem.color) {
    				linkElement.createElement('icon', {}).style = 'background-color:' + menuitem.color;
    			}
    			linkElement.createElement('SPAN', 'aco', __(menuitem.header0 || menuname));
    			if (menuitem.key) {
    				linkElement.createElement('SPAN', '', menuitem.key);
    			}
    		};
    		var top = targetRect.bottom;
    		if ('left' in targetElement) {
    			// var left = pos.right;
    			var left = pos.left;
    		} else if ('right' in targetElement) {
    			var left = targetRect.right - menuElement.clientWidth, top = targetRect.bottom;
    		} else {
    			var left = e.clientX, top = e.clientY;
    		}
    		left = Math.max(0, left);
    		menuElement.style.left = left + 'px';
    		menuElement.style.top = top + 'px';
    		menuElement.style.maxHeight = (window.screen.availHeight - top) + 'px';
        // new Popup(e, context);
      });
			// this.elem.contextmenu = context;
			return this;
		}},
    messagesPanel: { value: function () {
      this.append(
        $('div')
        .class('col err')
        .append(
          $('div').class('row err hdr').append(
            $('span').class('').text(''),
            $('span').class('').text('System'),
            $('span').class('aco').text('Message'),
            $('span').class('time').text('Start'),
            $('span').class('time').text('Accept'),
            $('span').class('time').text('End'),
          ),
          $().elemMessages = $('div').class('col aco'),
        ),
      );
      return this;
    }},
    css: { value: function (selector, value) {
			const args = [...arguments];
			const elem = this.elem || this.selector;
			if (selector instanceof Object) {
				Object.entries(selector).forEach(entry => arguments.callee.call(this, ...entry))
			} else {
				const css = elem.style.cssText.split(';').filter(s => s.trim()).filter(s => s.split(':')[0].trim() !== selector);
        if (value === '') {
					css.push(selector);
        } else if (value === null) {
				} else {
					css.push(`${selector}:${value}`);
					// let id = elem === document.body ? '_body' : elem.id;
					// if (id) {
					// 	let css = localStorage.getItem('css');
					// 	css = css ? JSON.parse(css) : {};
					// 	(css[id] = css[id] || {})[selector] = value;
					// 	localStorage.setItem('css', JSON.stringify(css));
					// }
				}
        elem.style.cssText = css.join(';');
			}
			return this;
		}},
    dark: { value: function () {
      if ($().storage('dark') === null) {
        setTimeout(() => {
          const h = new Date().getHours();
          $(document.documentElement).attr('dark', h >= 20 || h <= 7 ? 1 : 0)
        }, 5000);
      } else {
        $(document.documentElement).attr('dark', $().storage('dark'));
      }
      if (this.elem.tagName === 'A') {
        this.on('click', e => $(document.documentElement).attr('dark', $().storage('dark', $().storage('dark')^1).storage('dark')));
      }
      return this;
    }},
    displayvalue: { value: function (selector) {
      if (this.elem.item) {
        this.text(this.elem.item.displayvalue(selector));
      }
      return this;
    }},
    draw: { value: function (options) {
			// this.elem = elem('CANVAS', 'aco');
			// setTimeout(() => this.paint = new Paint(this.elem, options));
      this.paint = new Paint(this.elem, options);
			// if (this.selector) {
			// 	this.selector.append(this.elem);
			// }
			// //console.log(this.elem);
			return this;
		}},
    insertBefore: { value: function (newNode, referenceNode) {
      console.log(newNode, referenceNode);
      this.elem.insertBefore(newNode.elem || newNode, referenceNode ? referenceNode.elem || referenceNode : null)
    }},
    extend: { value: function () {
      $.extend(this, ...arguments);
      return this;
    }},
    edit: { value: function (item) {
      console.log('EDIT', item);
      item.editing = true;
      item.onloadEdit = false;
      function stopVideo() {
        var c = document.getElementsByTagName('video');
  			for (var i = 0, e; e = c[i]; i++) {
          e.pause();
        }
      }
      function users() {
        return;
        // TODO: Item Users
        return ['A', 'c ' + row.ID, row.Value || ($.getItem(row.tag) ? $.getItem(row.tag).Title : row.ID), {
					onclick: Web.Element.onclick,
					id: row.ID,
					// innerText: row.Value || ($.getItem(row.tag] ? $.getItem(row.tag].Title : row.ID),
				},[
					['BUTTON', {
						type: 'BUTTON',
						row: row,
						onclick: $.removeUser = (e)=>{
							e.preventDefault();
							e.stopPropagation();
							// //console.log();
							new $.HttpRequest($.config.$, 'DELETE', `/${this.tag}/Users(${e.target.row.ID})`, e => {
								//console.log(e.target.responseText);
							}).send();
							e.target.parentElement.remove();
							inputElement.focus();
							return false;
						}
					}]
				]];
      }
      item.elemFiles = $('div').files(item, 'Files');
      function openDialog (accept) {
        $('input').type('file').multiple(true).accept(accept).on('change', e => {
          if (e.target.files) {
            [...e.target.files].forEach(item.elemFiles.appendFile)
          }
        }).click().remove()
      }
      const buttons = {
        attach: () => openDialog(''),
        image: () => openDialog('image/*'),
        camera: () => {
          const panelElem = $('div').parent(document.querySelector('#section_main')).class('col aco abs panel').append(
            $('nav').class('row top abs btnbar np').append(
              $('span').class('aco'),
              $('button').class('abtn freedraw').on('click', this.openFreedraw = e => {
                window.event.stopPropagation();
                buttons.freedraw().canvas.context.drawImage(this.cam.video, 0, 0, this.canvas.width, this.canvas.height);
                return this;
              }),
              $('button').class('abtn save').on('click', e => {
                window.event.stopPropagation();
                this.openFreedraw().save().closeFreedraw();
                //
                // const video = this.cam.video;
                // const canvasElem = $('canvas').parent(panelElem).width(video.videoWidth).height(video.videoHeight).draw();
                // const canvas = canvasElem.paint._canvas;
                // const context = canvasElem.paint._ctx;
                // context.drawImage(video, 0, 0, canvas.width, canvas.height);
                // canvas.toBlob(blob => {
                //   item.elemFiles.appendFile(new File([blob], `image_${new Date().toISOString().replace(/\.|:|Z|-/g,'')}.png`));
                //   // canvas.remove();
                // });
              }),
              $('button').class('abtn close').on( 'click', this.closeCam = e => panelElem.remove() )
              // this.panelElem
            ),
            this.cam = $('div').class('aco').cam()
          )
        },
        freedraw: () => {
          const panelElem = $('div').parent(document.querySelector('#section_main')).class('col aco abs panel').append(
            $('nav').class('row top abs btnbar np').append(
              $('span').class('aco'),
              $('button').class('abtn clean').on('click', e => {
                this.canvas.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
              }),
              $('button').class('abtn save').on('click', this.save = e => {
                window.event.stopPropagation();
                this.canvas.toBlob(blob => {
                  item.elemFiles.appendFile(new File([blob], `image.png`));
                });
                return this;
              }),
              $('button').class('abtn close').on( 'click', this.closeFreedraw = e => panelElem.remove() )
              // this.panelElem
            ),
            this.canvasElem = $('canvas').width(640).height(480).draw()
          );
          this.canvas = this.canvasElem.elem;
          return this;
        },
        close() {
          $().send({
            body: {
              notify: {
                title: `${item.header0} modified`,
                options:  {
                  body: `Bla Bla`,
                  icon: 'https://aliconnect.nl/favicon.ico',
                  image: 'https://aliconnect.nl/shared/265090/2020/07/09/5f0719fb8fa69.png',
                  data: {
                    url: document.location.href,
                  },
                  // actions: [
                  //   {
                  //     action: 'new',
                  //     title: 'New',
                  //     // icon: 'https://aliconnect.nl/favicon.ico',
                  //   },
                  //   {
                  //     action: 'open',
                  //     title: 'Open',
                  //     // icon: 'https://aliconnect.nl/favicon.ico',
                  //   },
                  //   // {
                  //   //   action: 'gramophone-action',
                  //   //   title: 'gramophone',
                  //   //   icon: '/images/demos/action-3-128x128.png'
                  //   // },
                  //   // {
                  //   //   action: 'atom-action',
                  //   //   title: 'Atom',
                  //   //   icon: '/images/demos/action-4-128x128.png'
                  //   // }
                  // ]
                }
              }
            }
          });
          // return;
          // var notification = new Notification('sadfasd');
          // notification.onclick = function(e) {
          //   console.log('CLICKED');
          //   window.focus();
          //   // window.open("http://www.stackoverflow.com");
          //   // window.location.href = 'https://aliconnect.nl';
          // }
          // notification.onclick = e => {
          //   console.log('CLICKED');
          //   window.focus();
          // }
          // return;
          //
          // $().notify(`${item.header0} modified`, {
          //   body: `Bla Bla`,
          //   url: 'https://moba.aliconnect.nl',
          //   icon: 'https://aliconnect.nl/favicon.ico',
          //   image: 'https://aliconnect.nl/shared/265090/2020/07/09/5f0719fb8fa69.png',
          //   data: {
          //     href: document.location.href,
          //     url: 'test',
          //   },
          // });
          return $('view').show(item)
        },
      };
      const edit = $('div').parent(this).class('col aco abs').append(
        $('nav').class('row top abs btnbar np').append(
          $('span').class('aco'),
          Object.entries(buttons).map(([name, fn])=>$('button').class('abtn',name).on('click', fn))
        ),
        this.header(item),
        $('form').class('oa aco').append(
          item.elemFiles,
        ).properties(item.properties),
      );
      return this;
    }},
    markup: { value: function (el) {
      const replace = {
        yaml(str) {
          return str
          .replace(/\n/g, '')
          .replace(/^(.*?)(#.*?|)$/, (s,codeString,cmt) => {
            return codeString
            .replace(/^(\s*)(.+?):/, '$1<span class="hl-fn">$2</span>:')
            .replace(/: (.*?)$/, ': <span class="hl-string">$1</span>')
            + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
          });
        }
      }
      this.elem.innerHTML = replace.yaml(this.elem.innerText);
      this.elem.markup = true;
      return this;
    }},
    editor: { value: function (lang) {
      // const statusBar =
      // setTimeout(() => {
      //   console.log('EDITOR', this.parentElement);
      //   this.parentElement.insertBefore($('div').text('ja'), this.nextSibling)
      // })
      // this.parentElement.insertBefore($('div').text('pos'), this.nextSibling);
      this.class('code-editor');
      const his = [];
			const elem = this.elem;
      const rectContainer = this.elem.getBoundingClientRect();
      const html = lang ? $.string[lang](elem.innerText) : elem.innerText;
      let rows;
      let selLine;
      // console.log(html);
      function toggleOpen (el, open) {
        if (open === -1) {
          return s.removeAttribute('open');
        }
        if (el.hasAttribute('open')) {
          open = open === undefined ? el.getAttribute('open') ^1 : open;
          el.setAttribute('open', open);
          for (var s = el.nextSibling;s;s = s.nextSibling) {
            if (s.level <= el.level) break;
            if (open) {
              if (s.level<=el.level+2) {
                s.removeAttribute('hide');
              }
            } else {
              s.setAttribute('hide', '');
              if (s.hasAttribute('open')) {
                s.setAttribute('open', 0);
              }
            }
          }
        }
      }
      this.on('click', e => {
        if (e.offsetX<0) {
          toggleOpen(e.target);
        }
      });
      function checkOpen(el, open = 1) {
        if (!el) return;
        el.level = el.innerText.search(/\S/);
        if (el.nextSibling) {
          el.nextSibling.level = el.nextSibling.innerText.search(/\S/);
          if (el.nextSibling.level > el.level) {
            if (!el.hasAttribute('open')) {
              el.setAttribute('open', open);
            }
          } else if (el.hasAttribute('open')) {
            el.removeAttribute('open');
          }
        } else if (el.hasAttribute('open')) {
          el.removeAttribute('open');
        }
      }
      this.text = content => {
        this.elem.innerText = '';
        this.append(content.split(/\n/).map(l => $('div').text(l).markup()));
        this.append($('div').html('<br>'));
        var children = Array.from(this.elem.children);
        children.forEach(el => {
          checkOpen(el, 0);
          if (el.level > 0) el.setAttribute('hide', '');
        });
        // this.createRows();
      }
      this.src = url => {

      }
      function caret (el) {
        const range = window.getSelection().getRangeAt(0);
        const prefix = range.cloneRange();
        prefix.selectNodeContents(el);
        prefix.setEnd(range.endContainer, range.endOffset);
        return prefix.toString().length;
      }
      function getNode (parent, pos) {
        if (parent.childNodes) {
          for (var node of parent.childNodes) {
            if (node.nodeType == Node.TEXT_NODE) {
              if (pos <= node.length) {
                return [node, pos, true];
              } else {
                pos = pos - node.length;
              }
            } else {
              var [node, pos, done] = getNode(node, pos);
              if (done) {
                return [node, pos, done];
              }
            }
          }
        }
        return [parent, pos];
      };
      function setCaret (parent, pos) {
        var [node, nodepos] = getNode(parent, pos);
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(node, nodepos);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      };

			return this
			.attr('contenteditable','')
			.attr('spellcheck',false)
			// .css("display:inline-block;width:100%;")
      .on('paste', e => {
        // console.log(e);
        e.preventDefault();
        var text = e.clipboardData.getData("text");
        document.execCommand('insertText', false, text.replace(/\r/gs,''));
        var el = e.path.find(el => el.tagName === 'DIV');
        for (var el; el; el = el.nextSibling) {
          checkOpen(el);
          $(el).markup();
          if (el.nextSibling && el.nextSibling.markup) {
            break;
          }
        }
      })
			.on('keydown', e => {
        var range = window.getSelection().getRangeAt(0);
        for (var el = range.startContainer.parentElement; el.tagName !== 'DIV'; el = el.parentElement);
        if (e.keyPressed === 'ctrl_alt_BracketLeft') {
          e.preventDefault();
          toggleOpen(el, 0)
        }
        if (e.keyPressed === 'ctrl_alt_BracketRight') {
          e.preventDefault();
          toggleOpen(el, 1)
        }
				if(e.keyCode==9 && !e.shiftKey){
					e.preventDefault();
					// document.execCommand('insertHTML', false, '&#009');
					document.execCommand('insertHTML', false, '  ');
				}
        setTimeout(() => {
          var sel = window.getSelection();
          var an = sel.focusNode;
          var range = sel.getRangeAt(0);
          for (var el = an.nodeType === 3 ? an.parentNode : an; el.tagName !== 'DIV'; el = el.parentElement);
          var children = Array.from(this.elem.children);
          const row = children.indexOf(el);
          const prefix = range.cloneRange();
          prefix.selectNodeContents(el);
          prefix.setEnd(range.endContainer, range.endOffset);
          var col = prefix.toString().length;
          $.his.elem.statusbar['pos'].text(`${row+1}:${col+1}`);
          var el = children[row];
          // console.log(el, sel, e.keyCode);
          if (el.hasAttribute('hide')) {
            for (var el; el && el.hasAttribute('hide'); el = e.keyCode >= 39 ? el.nextSibling : el.previousSibling);
            if (el) {
              if (e.keyCode === 37) col=el.innerText.length;
              if (e.keyCode === 39) col=0;
              var range = window.getSelection().getRangeAt(0).cloneRange();
              var [node,pos] = getNode(el, Math.min(col, el.innerText.length));
              // console.log(node,pos);
              range.setEnd(node,pos);
              if (!e.shiftKey) {
                range.setStart(node,pos);
                range.collapse(true);
              }
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
          rows = Array.from(this.elem.children);
          rows.filter(el => el.hasAttribute('selected')).forEach(el => el.removeAttribute('selected'));
          el.setAttribute('selected', '');
          checkOpen(el);
          checkOpen(el.previousElementSibling);

          // console.log('pos', row, col);
          if (!e.ctrlKey) {
            if (e.keyCode >= 0x30 || e.keyCode == 0x20) {
              const rowsOpen = children.map(el => el.getAttribute('open'));
              $(el).markup();
              console.log(el, col);
              setCaret(el, col);

              //
              //
              // // rowsOpen.forEach(i => children[i].setAttribute('open', ''));
              //
              // return;
              //
              // var content = children.map(el => el.innerText.replace(/\n$/, '')).join('\n');
              // his.push(content);
              // // console.log(content);
              // this.elem.innerText = '';
              // this.append(content.split(/\n/).map(l => $('div').html(replace.yaml(l) || '<br>')));
              // var children = Array.from(this.elem.children);
              // var el = children[row];
              //
              // setCaret(col, el);
              // // this.refresh();
              // // console.log('up');
              // // const pos = caret(elem);
              // //
              // // const range = window.getSelection().getRangeAt(0);
              // // const el = range.startContainer.parentElement;
              // // el.innerHTML = replace.yaml(el.innerText);
              // // // console.log(el, el.innerText, el.innerHTML)
              // // // Array.from(this.elem.children).forEach(el => el.innerText = el.innerText);
              // // // js(el);
              // // // this.attr('showall', 1);
              // // // this.text(elem.innerText.replace(/\n\n/gs, '\n'));
              // // // this.attr('showall', null);
              // // // elem.innerHTML = lang ? $.string[lang](elem.innerText) : elem.innerHTML;
              // // // elem.innerText = elem.innerText.replace(/\n\n/gs, '\n');
              // // setCaret(pos, elem);
            }
          }
          // this.elem.getElementsByTagName('SPAN')

        })
			})
		}},
    editorCollapse: { value: function (){

    }},
    emit: { value: function (selector, detail){
			this.elem.dispatchEvent(new CustomEvent(selector, {detail: detail}));
			return this;
		}},
    exists: { value: function (parent) {
			return (parent || document.documentElement).contains(this.elem)
		}},
    files: { value: function files (item, attributeName){
      this.item = item;
      console.log('FILES', item, attributeName);
      this.files = item[attributeName];
      // this.files = [];
      if (this.files === 'string' && this.files[0] === '[') this.files = JSON.parse(this.files);
      if (this.files === 'string' && this.files[0] === '{') this.files = [JSON.parse(this.files)];
      if (!Array.isArray(this.files)) this.files = [];
      this.appendFile = file => $.promise( 'appendFile', callback => {
        console.log(file, file.type, file.name);
        aimClient.api(`/${this.item.tag}/file`)
        .query({
          uid: this.item.data.UID,
          name: file.name,
          lastModified: file.lastModified,
          // lastModifiedDate: file.lastModifiedDate,
          size: file.size,
          type: file.type,
        })
        .post(file)
        .then(file => {
          this.files.push(file);
          if (file.type === 'application/pdf') {
            $().pdfpages(e.body.src).then(pages => {
              const textpages = pages.map(lines => lines.map(line => line.str).join("\n"));
              let words = [].concat(textpages.map(page => page.match(/\b\w+\b/gs))).map(words => words.map(word => word.toLowerCase()).unique().sort());
              console.log('PDF PAGES', words);
              aimClient.api(`/${this.item.tag}/?request_type=words`).patch(words).then(body => {
                console.log('WORDS', body);
              })
            })
          }
          console.log(e.target.responseText, attributeName, this.files);
          // item[attributeName] = { max:999, Value: JSON.stringify(e.body) };
          item[attributeName] = JSON.stringify(this.files);
          // console.log(item[attributeName]);
          this.emit('change');
          callback(file);
        })
      });
      this.removeElem = (elem, e) => {
        e.stopPropagation();
        elem.remove();
        this.files = [...this.elem.getElementsByClassName('file')].map(e => e.is.get('ofile'));
        // console.log(this.files);
        item[attributeName] = JSON.stringify(this.files);
        return false;
      };
      return this.class('col files')
      .on('drop', e => {
        e.preventDefault();
        if (e.dataTransfer.files) {
          [...e.dataTransfer.files].forEach(this.appendFile)
        }
      })
      .on('dragover', e => {
        e.dataTransfer.dropEffect = 'link';
        e.preventDefault();
      })
      .on('change', e => {
        this.text('').append(
          this.imagesElem = $('div').class('row images'),
          this.attachElem = $('div').class('row attach'),
        );
        console.debug(this, files, item, attributeName); // DEBUG:
        return;
        this.files.filter(Boolean).forEach(ofile => {
          let filename = ofile.src.split('/').pop();
          let ext = ofile.ext || ofile.src.split('.').pop();
          filename = filename.split('_');
          if (filename[0].length == 32) filename.shift();
          filename = filename.join('_');
          let href = ofile.src;
          if (ofile.src.match(/jpg|png|bmp|jpeg|gif|bin/i)) {
            const elem = $('span')
            .parent(this.imagesElem)
            .class('row file elplay')
            .set('ofile', ofile)
            .append(
              $('i').class('bt sel'),
              $('img').class('aimage').src(ofile.src).set('ofile', ofile),
              $('div').class('row title').append(
                $('span').class('aco').text(ofile.alt || ofile.name).title(ofile.title),
                $('i').class('abtn del').on('click', e => this.removeElem(elem, e)),
              ),
            );
            // elem.elem.ofile = ofile;
            return;
            // return elem;
            if (ofile.src) {
              this.src(ofile.src);
            }
            return this;
            const access_token = $.auth.access_token;
            const iss = $.auth.access.iss;
            if (!ofile.src) return imgElement;
            var src = (ofile.srcs || ofile.src) + '?access_token=' + access_token;
            imgElement.src = (src.indexOf('http') === -1 ? ofile.host || "https://" + iss : '') + src;
            var src = (ofile.src) + '?' + ofile.lastModifiedDate;
            imgElement.srcl = (src.indexOf('http') === -1 ? ofile.host || "https://" + iss : '') + src;
            imgElement.alt = ofile.name || '';
            // return imgElement;
            return this;
          } else if (ofile.src.match(/3ds/i)) {
            const elem = $('span')
            .parent(this.imagesElem)
            .class('row file elplay')
            .set('ofile', ofile)
            .append(
              $('i').class('bt sel'),
              $('div').class('aimage').set('ofile', ofile).width(120).height(120).tds({src: ofile.src}),
              $('div').class('row title').append(
                $('span').class('aco').text(ofile.alt || ofile.name).title(ofile.title),
                $('i').class('abtn del').on('click', e => this.removeElem(elem, e)),
              ),
            );
          } else if (ofile.src.match(/mp4|webm|mov/i)) {
            const elem = $('span')
            .parent(this.imagesElem)
            .class('row file elplay')
            .set('ofile', ofile)
            .append(
              $('i').class('bt sel'),
              $('video').class('aimage').src(ofile.src).set('ofile', ofile),
              $('div').class('row title').append(
                $('span').class('aco').text(ofile.alt || ofile.name).title(ofile.title),
                $('i').class('abtn del').on('click', e => {
                  e.stopPropagation();
                  elem.remove();
                  item[attributeName] = JSON.stringify([...this.elem.getElementsByClassName('file')].map(e => e.ofile));
                  return false;
                })
              ),
            );
          } else {
            const elem = $('a')
            .parent(this.attachElem)
            .class('row file icn file_'+ext)
            .set('ofile', ofile)
            .href(href)
            .download(ofile.name)
            .draggable()
            .on('click', e => {
              if (ext === 'pdf') {
                const href = ofile.host + ofile.src;
                const iframeElem = $('view').append(
                  $('div').class('col aco iframe').append(
                    $('iframe').class('aco').src(href),
                    $('button').class('abtn close abs').on('click', e => iframeElem.remove()),
                  )
                );
                return false;
              }
            })
            .append(
              $('div').class('col aco').target('file').draggable().append(
                $('div').class('row title').append(
                  $('span').class('aco').text(ofile.alt || ofile.name).title(ofile.title),
                  $('i').class('abtn del').on('click', e => this.removeElem(elem, e)),
                ),
                $('div').class('row dt').append(
                  $('span').class('aco').text(ofile.size ? Math.round(ofile.size / 1000) + 'kB' : ''),
                  $('i').class('abtn download').href(href).download(ofile.name).on('click', e => {
                    e.stopPropagation();
                    if ($().aliconnector_id && href.match(/(.doc|.docx|.xls|.xlsx)$/)) {
                      e.preventDefault();
                      console.log(href);
                      $().ws().sendto($().aliconnector_id, {external: {filedownload: ['http://alicon.nl'+href]}}).then(e => {
                        console.log(e);
                      });
                    }
                  }),
                  // el.elModDate = createElement('SPAN', { className: 'aco', innerText: (ofile.lastModifiedDate ? new Date(ofile.lastModifiedDate).toLocaleString() + ' ' : '') + ((ofile.size) ? Math.round(ofile.size / 1000) + 'kB' : '') });
                  // if (hasEdit) {
                  // 	createElement('A', 'abtn pulldown', { popupmenu: {
                  // 		bewerken: {
                  // 			Title: 'Bewerken',
                  // 			onclick: editFile,
                  // 		},
                  // 	} });
                  // }
                ),
              ),
            );
            elem.elem.ofile = ofile;
            // return elem;
          }
        })
      })
      .emit('change')
    }},
		filesNext: { value: function () {
			this.filesSlide(1);
			if (this.slideIdx == 0 && get.pv) {
				//// //console.debug('NEXT PAGE');
			}
		}},
		filesSlide: { value: function (step) {
			//var elSlide = this.images[this.slideIdx];
			//if (elSlide) {
			//    if (elSlide.pause) this.elSlide.pause();
			//    elSlide.parentElement.removeAttribute('show');
			//}
			this.images = this.elem.getElementsByClassName('aimage');
			//// //console.debug('IMAGES', this.images);
			this.slideIdx += step || 0;
			this.imagesElement.setAttribute('prev', this.slideIdx > 0);
			this.imagesElement.setAttribute('next', this.slideIdx < this.images.length - 1);
			//if (this.slideIdx == 0) this.setAttribute('dir', 'r');
			//if (this.slideIdx < 0) this.slideIdx = this.images.length - 1;
			//// //console.debug(this, step, elSlide, this.slideIdx);
			var elSlide = this.images[this.slideIdx];
			if (!elSlide) {
				this.slideIdx = 0;
				var elSlide = this.images[this.slideIdx];
			}
			if (!elSlide) return;
			elSlide.show();
			if (elSlide.play && checkVisible(elSlide)) {
				if ($.player.elPlaying) items.player.elPlaying.pause();
				elSlide.currentTime = 0;
				//items.player.elPlaying = elSlide;
				elSlide.play();
			}
			//else
			//    items.player.play();
		}},
		forEach: { value: function (fn, selector, context) {
			if (selector) {
				if (typeof selector !== 'object') {
					return fn.apply(this, [...arguments].slice(1))
				} else {
					Object.entries(selector).forEach(entry => fn.call(this, ...entry))
				}
			}
			return this;
		}},
    ganth: { value: function (data) {
			setTimeout(() => new Ganth(data, this));
			return this;
		}},
    get: { value: function () {
      return this.map.get(...arguments);
    }},
    has: { value: function () {
      return this.map.has(...arguments);
    }},
    header: { value: function (item) {
			// let startDate = new Date(this.StartDateTime.replace('000Z','Z'));
			// let endDate = new Date(this.EndDateTime.replace('000Z','Z'));
			// let createdDate = new Date(this.CreatedDateTime.replace('000Z','Z'));
      // if (item.IsPublic) {
			// 	item.publicElement = ['DIV', 'icn IsPublic ' + (item.hostID === 1 ? 'public' : '')];
			// }
			return $('header')
      .class('row header', item.tag)
      .draggable()
      // .item(item, 'view')
      .on('change', function (e) {
        function linkMaster(item, name, elem) {
          if (item && item.data && item.data[name]) {
            const master = $(data = [].concat(item.data[name]).shift());
            elem.insert($('span').itemLink(master), '/');
            if (master && master.details) {
              master.details().then(item => linkMaster(item, name, elem));
            }
          }
          return elem;
        }
        function linkSource(item, name, elem) {
          if (item && item.data && item.data[name]) {
            const master = $(data = [].concat(item.data[name]).shift());
            elem.append(':', $('span').itemLink(master));
            if (master && master.details) {
              master.details().then(item => linkSource(item, name, elem));
            }
          }
          return elem;
        }
        this.is.text('').append(
          // $('div').class('modified'),
					// .contextmenu(this.properties.State.options)
					// .on('contextmenu', e => //console.log(e))
					$('button').class('abtn stateicon')
					.append(
						$('i').append(
							$('i').css('background-color', item.stateColor),
						),
						item.elemStateUl = $('ul').class('col').append(
							$('li').class('abtn').text('JAdsfg sdfg sd'),
							$('li').class('abtn').text('JAdsfg sdfg sd'),
							$('li').class('abtn').text('JAdsfg sdfg sd'),
							$('li').class('abtn').text('JAdsfg sdfg sd'),
						)
					)
					.on('mouseenter', function (e) {
						const rect = this.getBoundingClientRect();
						//console.log(window.innerHeight);
						item.elemStateUl.css('top', (rect.top)+'px').css('left', rect.left+'px');
					}),
          item.IsPublic ? $('div', 'icn IsPublic').class(item.hostID === 1 ? 'public' : '') : null,
          $('div')
          .class('icn itemicon', item.className)
          .css('border-color', item.modColor)
          .css('color', item.schemaColor)
          .append(
            item.gui && item.gui.global
            ? $('div', 'gui').append(
              $('div', 'detail').append(
                $('div', 'object').append(
                  $('div', item.tag, item.gui.detail),
                ),
              ),
            )
            : (item.iconsrc ? $('img').src(item.iconsrc) : null),
          ),
          $('div').class('aco col headername inline').append(
            $('div', 'header title', item.header0).append(
              // linkSource(item, 'Src', $('span').class('path source')),
            ),
            $('div', 'header subject', item.header1),
            $('div', 'header preview', item.header2),
            // linkMaster(item, 'Master', $('div').class('row path master')),
            $('div', 'row date')
            // .contextmenu(item.flagMenu)
            ,
          ),
        );
      }).emit('change')
		}},
    html: { value: function (content, format) {
			const elem = this.elem;
      [].concat(content).forEach(content => {
        if (typeof content === 'function') {
          format = 'js';
          content = String(content).replace(/^(.*?)\{|\}$/g,'');
        }
        content = format && $.string[format] ? $.string[format](content) : content;
        this.elem.innerHTML += content;
      })
			return this;
		}},
    write: { value: function (content) {
      return this.elem.innerHTML += content;
    }},
    htmledit: { value: function (property) {
			const oDoc = this.elem;
			const stateButtons = {};
			function formatDoc(sCmd, sValue) {
				if (oDoc.currentRange) {
					var sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(oDoc.currentRange);
				}
				if (validateMode()) {
					document.execCommand(this.cmd || sCmd, false, this.value || this.name || this.Title || sValue || this.cmd || sCmd);
					oDoc.focus();
				}
			}
			function validateMode() {
				if (!oDoc.codeview || !oDoc.codeview.checked) { return true; }
				alert("Uncheck \"Show HTML\".");
				oDoc.focus();
				return false;
			}
			function setDocMode() {
				var oContent;
				if (oDoc.contentEditable !== 'false') {
					oContent = document.createTextNode(oDoc.innerHTML);
					oDoc.innerHTML = '';
					var oPre = document.createElement('PRE');
					oPre.onfocus = function(e) { this.parentElement.onfocus() };
					oDoc.contentEditable = false;
					oPre.id = 'sourceText';
					oPre.contentEditable = true;
					oPre.appendChild(oContent);
					oDoc.appendChild(oPre);
					document.execCommand('defaultParagraphSeparator', false, 'p');
				}
				else {
					if (document.all) {
						oDoc.innerHTML = oDoc.innerText;
					} else {
						oContent = document.createRange();
						oContent.selectNodeContents(oDoc.firstChild);
						oDoc.innerHTML = oContent.toString();
					}
					oDoc.contentEditable = true;
				}
				oDoc.focus();
			}
			function printDoc() {
				if (!validateMode()) { return; }
				var oPrntWin = window.open('', '_blank', 'width=450, height=470, left=400, top=100, menubar=yes, toolbar=no, location=no, scrollbars=yes');
				oPrntWin.document.open();
				oPrntWin.document.write("<!doctype html><html><head><title>Print<\/title><\/head><body onload=\"print();\">" + oDoc.innerHTML + "<\/body><\/html>");
				oPrntWin.document.close();
			}
			const contentEditableCheck = (e) => {
				var sel = window.getSelection();
				stateButtons.hyperlink.attr('checked', sel.focusNode.parentElement.tagName === 'A');
				stateButtons.unlink.attr('disabled', !(
					(sel.anchorNode.nextSibling && sel.anchorNode.nextSibling.tagName === 'A' && sel.extentNode.previousSibling && sel.extentNode.previousSibling.tagName === 'A') ||
					(sel.extentNode.nextSibling && sel.extentNode.nextSibling.tagName === 'A' && sel.anchorNode.previousSibling && sel.anchorNode.previousSibling.tagName === 'A') ||
					(sel.anchorNode.parentElement.tagName === 'A' && sel.extentNode.parentElement.tagName !== 'A') ||
					(sel.anchorNode.parentElement.tagName !== 'A' && sel.extentNode.parentElement.tagName === 'A')
				));
				stateButtons.blockquote.attr('checked', sel.anchorNode.parentElement === sel.extentNode.parentElement && sel.extentNode.parentElement.tagName === 'BLOCKQUOTE');
				[
					'bold',
					'italic',
					'underline',
					'strikeThrough',
					'superscript',
					'subscript',
					'insertunorderedlist',
					'insertorderedlist',
					'justifyleft',
					'justifycenter',
					'justifyright',
					'justifyfull'
				].forEach(name => stateButtons[name].attr('checked', document.queryCommandState(name)))
			};
			let keyupTimeout;
			const keysup = {
				shift_alt_ArrowRight() {
					formatDoc('indent');
				},
				shift_alt_ArrowLeft() {
					formatDoc('outdent');
				},
				ctrl_Space() {
					formatDoc('removeFormat');
					oDoc.innerHTML = oDoc.innerHTML.replace(/\r/g,'').replace(/<p><\/p>/g,'');
				},
				ctrl_alt_Digit1() {
					formatDoc('formatblock', 'H1');
				},
				ctrl_alt_Digit2() {
					formatDoc('formatblock', 'H2');
				},
				ctrl_alt_Digit3() {
					formatDoc('formatblock', 'H3');
				},
				ctrl_shift_Period() {
					var startSize = parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize);
					for (var i = 1; i <= 7; i++) {
						formatDoc('fontsize', i);
						if (parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize) > startSize) break;
					}
				},
				ctrl_shift_Comma() {
					//console.log('<');
					var startSize = parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize);
					for (var i = 7; i >= 1; i--) {
						formatDoc('fontsize', i);
						if (parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize) < startSize) break;
					}
				},
			};
			const keysdown = {
				ctrl_KeyD() {
					//console.log('D');
					formatDoc('strikeThrough');
				},
			};
      this
      .contenteditable('')
      .on('paste', e => {
        // e.preventDefault();
        console.log(e, e.clipboardData, e.clipboardData.files, e.clipboardData.types.includes('Files'));
      })
      .on('drop', e => {
        e.preventDefault();
        if (e.dataTransfer.files) {
          [...e.dataTransfer.files].forEach(file => {
            property.item.elemFiles.appendFile(file).then(file => {
              console.log(file);
              // return;
              if (window.getSelection) {
                var sel, range, html;
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                  //let offset = sel.focusOffset;
                  range = sel.getRangeAt(0);
                  range.deleteContents();
                  var elImg = document.createElement('img');
                  elImg.src = file.srcs || file.src;
                  range.insertNode(elImg);
                  range.setStartAfter(elImg);
                  //range.setEnd(elImg, 0);
                  //range.setStart()
                  //range.set
                  //window.getSelection().addRange()
                  //range.setStart(el.childNodes[2], 5);
                  //range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                  //document.activeElement.setSelectionRange(5,5);
                }
              }
              else if (document.selection && document.selection.createRange) {
                document.selection.createRange().text = text;
              }
            });
          })
        }
      })
			.on('focus', e => {
				//console.log('FOCUS')
				oDoc.currentRange = null;
				// setDocMode();
				document.execCommand('defaultParagraphSeparator', false, 'p');
				// if ($.editBtnRowElement) $.editBtnRowElement.remove();
				// switchBox = $.editBtnRowElement.createElement('INPUT', {type:"checkbox", onchange:function(e){setDocMode(this.checked);} });
				// for (var name in btns) $.editBtnRowElement.createElement('span', { className: 'abtn icn ' + name }).createElement('img', Object.assign({
				// 	// onclick: Element.onclick,
				// 	src:'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
				// 	title: __(name),
				// }, btns[name]));
				for (var menuParentElement = oDoc; menuParentElement.tagName !== 'FORM'; menuParentElement = menuParentElement.parentElement);
				if (!$.editBtnRowElement || !$.editBtnRowElement.parentElement) {
					function formatButton(name, classname) {
						return stateButtons[name] = $('button').class('abtn', name, classname).attr('title', name).on('click', e => formatDoc(name))
					}
					$.editBtnRowElement = $('div').parent(document.body).class('row top abs textedit np shdw').append(
						formatButton('undo r'),
						formatButton('redo'),
						formatButton('cut', 'split'),
						formatButton('copy'),
						formatButton('paste'),
						$('button').class('abtn fontname split').append($('ul').append([
							'Arial','Arial Black','Courier New','Times New Roman'
						].map(fontname => $('li').class('abtn').text(fontname).on('click', e => formatDoc('fontname', fontname))))),
						$('button').class('abtn fontsize').append($('ul').append([
							[1, 'Very small'],
							[2, 'A bit small'],
							[3, 'Normal'],
							[4, 'Medium-large'],
							[5, 'Big'],
							[6, 'Very big'],
							[7, 'Maximum'],
						].map(([size, text]) => $('li').class('abtn').text(text).on('click', e => formatDoc('fontsize', size))))),
						$('button').class('abtn switchMode').append($('ul').append([
							['h1', __('Header 1') + ' <h1>'],
							['h2', __('Header 2') + ' <h2>'],
							['h3', __('Header 3') + ' <h3>'],
							['p', __('Paragraph') + ' <p>'],
							['pre', __('Preformated') + ' <pre>'],
						].map(([tag, text]) => $('li').class('abtn').text(text).on('click', e => formatDoc('formatblock', tag))))),
						formatButton('removeFormat', 'split'),
						formatButton('bold', 'split'),
						formatButton('italic'),
						formatButton('underline'),
						formatButton('strikeThrough'),
						formatButton('subscript'),
						formatButton('superscript'),
						$('button').class('abtn backcolor split').append($('ul').append([
							'black','red','orange','yellow','green','blue','white'
						].map(color => $('li').class('abtn', color).text(color).on('click', e => formatDoc('backcolor', color))))),
						$('button').class('abtn forecolor').append($('ul').append([
							'black','red','orange','yellow','green','blue','white'
						].map(color => $('li').class('abtn', color).text(color).on('click', e => formatDoc('forecolor', color))))),
						formatButton('insertunorderedlist', 'split'),
						formatButton('insertorderedlist'),
						formatButton('outdent', 'split'),
						formatButton('indent'),
						formatButton('justifyleft', 'split'),
						formatButton('justifycenter'),
						formatButton('justifyright'),
						formatButton('justifyfull'),
						stateButtons.blockquote = $('button').class('abtn blockquote split').on('click', e => formatDoc('formatblock', 'blockquote')),
						stateButtons.hyperlink = $('button').class('abtn hyperlink split').on('click', e => {
							var sLnk = prompt('Write the URL here', 'http:\/\/');
							if (sLnk && sLnk != '' && sLnk != 'http://') {
								formatDoc('createlink', sLnk)
							}
						}),
						stateButtons.unlink = $('button').class('abtn unlink').on('click', e => formatDoc('unlink')),
						$('button').class('abtn clean split').on('click', e => {
							if(validateMode()&&confirm('Are you sure?')){ this.innerHTML = this.value; }
						}),
						$('button').class('abtn print').on('click', e => printDoc()),
						// $('button').class('abtn paste').attr('cmd', 'paste').on('click', setDocMode),
					).on('click', e => {
						//console.log('CLICK');
						clearTimeout(oDoc.blurTimeout);
					}, true);
				}
			})
			.on('keyup', e => {
				let key = e.keyPressed;
				if (oDoc.innerHTML && oDoc.innerHTML[0] !== '<') {
					oDoc.innerHTML='<p>'+oDoc.innerHTML+'</p>';
					const node = oDoc.childNodes[0];
					const range = document.createRange();
					const sel = window.getSelection();
					range.setStart(node, 1);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
					e.preventDefault();
				}
				if (keysup[key]) {
					keysup[key]();
					e.preventDefault();
				}
				clearTimeout(keyupTimeout);
				keyupTimeout = setTimeout (contentEditableCheck, 200, e);
			})
			.on('keydown', e => {
				let key = e.keyPressed;
				if (keysdown[key]) {
					keysdown[key]();
					e.preventDefault();
				}
			})
			.on('blur', e => {
				oDoc.blurTimeout = setTimeout(e => $.editBtnRowElement.elem.remove(), 300);
				oDoc.currentRange = window.getSelection().getRangeAt(0);
				for (var i = 0, p; p = e.path[i]; i++) {
					if (p.item) break;
				}
				// let html = oDoc.innerHTML;
				// //console.log(html);
				// html = html.trim()
				// .replace(/<p><\/p>/gis, '')
				// .replace(/<p><br><\/p>/gis, '')
				// .replace(/<div><\/div>/gis, '')
				// .replace(/<div><br><\/div>/gis, '')
				// .replace(/^<p>/is, '')
				// .replace(/<\/p>$/is, '')
				// .replace(/^/is, '<p>')
				// .replace(/$/is, '</p>')
				// ;
				// oDoc.innerHTML = html;
				if (p && p.item && oDoc.name) {
					p.item[oDoc.name] = oDoc.innerHTML;
				}
				if (property) {
						property.value = oDoc.innerHTML;
					}
			})
			.on('mouseup', e => contentEditableCheck);
			return this;
		}},
    insert: { value: function (){
			this.elem = this.elem || document.body;
			const args = [].concat(...arguments);
			args.forEach(a => !a ? null : this.elem.insertBefore(typeof a === 'string' ? document.createTextNode(a) : a.elem || a, this.elem.firstChild));
			return this;
		}},
    id: { value: function (selector) {
			this.elem.setAttribute('id', selector);
      $.his.map.set(selector, this);
			// this.attr('id', ...arguments);
			// if ($.localAttr[selector]) {
			// 	Object.entries($.localAttr[selector]).forEach(entry => this.elem.setAttribute(...entry));
			// }
			return this;
		}},
    index: { value: function (docelem){
			const all = [...docelem.elem.querySelectorAll("h1, h2, h3")];
      // console.log(1111, all);
      const topItem = docelem.topItem = all[0];
      const elemTop = docelem.elemTop = docelem.elem.getBoundingClientRect().top;
      const findAll = docelem.findAll = all.slice().reverse();
			const allmenu = docelem.allmenu = [];
			let i = 0;
      var li;
      var path = [];
			function addChapters (ul, level) {
				for (let elem = all[i]; elem; elem = all[i]) {
					const tagLevel = Number(elem.tagName[1]);
          path.slice(0, tagLevel-1);
          // console.log(path);
					const title = elem.innerText;
          path[tagLevel-1] = title.toLowerCase().replace(/ /g,'_');
          const name = path.join('-');
					if (tagLevel === level) {
						$(elem).append(
              // $('a').attr('name', 'chapter' + i)
              $('a').attr('name', name)
						);
						li = $('li').parent(ul).append(
							elem.a = $('a').text(elem.innerText).attr('href', '#' + name).attr('open', '0').attr('target', '_self')
						);
						i++;
						allmenu.push(elem.a);
						// all.shift();
					} else if (li && tagLevel > level) {
						li.append(
							addChapters($('ul'), level+1)
						)
					} else {
						return ul;
					}
				}
				return ul;
			}
			let to;
      var lastScrollTop = 0;
			addChapters(this.text(''), 1);
      // console.error($('navDoc'));
      // (docelem.onscroll = e => {
      //   if (!to) {
      //     // const div = Math.abs(lastScrollTop - docelem.elem.scrollTop);
      //     // clearTimeout(to);
      //     to = setTimeout(() => {
      //       // console.log('re');
      //       to = null;
      //       // if (div > 50) {
      //       lastScrollTop = document.body.scrollTop;
      //       let elem = findAll.find(elem => elem.getBoundingClientRect().top < elemTop) || topItem;
      //       console.log(findAll, elem);
      //       // let elem = all.find(elem => elem.offsetParent );
      //       // console.log(elem.innerText, elemTop, elem.getBoundingClientRect().top, elem.getBoundingClientRect().height, all.indexOf(elem));
      //       // return;
      //       // elem = all[all.indexOf(elem)-1];
      //       allmenu.forEach(a => a.attr('open', '0').attr('select', null));
      //       const path = [];
      //       for (var p = elem.a.elem; p.tagName === 'A' && p.parentElement && p.parentElement.parentElement; p=p.parentElement.parentElement.parentElement.firstChild) {
      //         p.setAttribute('select', '');
      //         p.setAttribute('open', '1');
      //         path.push(p);
      //       }
      //       $(elem.a.elem).scrollIntoView();
      //       if ($('navDoc')) {
      //         $('navDoc').text('').append(...path.reverse().map(elem => ['/', $('a').text(elem.innerText)]))
      //       }
      //       // elem.li.select();
      //       // $()
      //       // let elem = all.forEach(elem => //console.log(elem.getBoundingClientRect().top));
      //       // //console.log(elem, elem.li);
      //       // }
      //     }, 500);
      //   }
      // })();
      // document.body.removeEventListener('scroll', docelem.onscroll);
      // document.body.addEventListener('scroll', docelem.onscroll);
      return this;
			// return $('ul').append(...[...this.elem.querySelectorAll("h1, h2, h3")].map(elem => $('li').text(elem.innerText)))
			this.addNextPreviousButtons()
		}},
    item: { value: function (item, name) {
      if (item) {
        if (name) {
          // console.log(item.elems);
          item.elems = item.elems || new Map();
          // console.log(item.elems, Map, new Map());
          item.elems.set(name, this);
        }
        this.elem.item = item;
        return this;
        this.set('item', item);
      }
      // console.log(elem, elem.item)
      for (var elem = this.elem; elem && !elem.item; elem = elem.parentElement);
      // console.log(elem, elem.item)
      return elem ? elem.item : null;
      // return this;
    }},
    itemAttr: { value: function (items, attributeName, value) {
			items = Array.isArray(items) ? items : [items];
			const a = $.his.attributeItems = $.his.attributeItems || {};
			if (a[attributeName]) {
				a[attributeName].forEach(item => {
					delete item[attributeName];
					Object.values(item)
					.filter(value => value instanceof Element)
					.forEach(elem => elem.removeAttribute(attributeName));
				})
			}
			// set attributen van nieuwe lijst
			items.forEach(item => {
				const elements = Object.values(item).filter(value => value instanceof Element);
				if (value === undefined) {
					delete item[attributeName];
					elements.forEach(elem => elem.removeAttribute(attributeName));
				} else {
					item[attributeName] = value;
					elements.forEach(elem => elem.setAttribute(attributeName, value));
				}
			});
			return a[attributeName] = items || [];
		}},
    itemLink: { value: function (link){
      if (link) {
        item = link instanceof Item ? link : $(link);
        return this.append(
          (this.linkElem = $('a'))
          .text(item.header0)
          .item(item)
          .href('#/id/' + item.Id)
          .on('mouseenter', e => {
            console.log('a mouseenter');
            const targetElement = this.linkElem.elem;
            const rect = targetElement.getBoundingClientRect();
            const popupElem = $.popupcardElem = $.popupcardElem || $('div').parent(document.body).class('pucard');
            popupElem
            .style(`top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height+10}px;`)
            .on('close', e => {
              console.log('div close', this);
              $.popupcardElem = null;
              popupElem.remove();
            })
            .on('mouseleave', e => {
              console.log('div mouseleave', this);
              popupElem.to = clearTimeout(popupElem.to);
              popupElem.emit('close');
            })
            .on('mouseenter', e => {
              console.log('div mouseenter');
              clearTimeout(this.to);
              const divElem = $('div').parent(popupElem.text(''));
              console.log(item);
              this.to = setTimeout(() => item.details().then(item => {
                popupElem.css(`opacity:1;`);
                const infoID = item.tag;
                divElem.append(
                  $('div').class(' shdw col').append(
                    $('div').class('aco point').append(
                      $('div').class('kop0').text(item.header0),
                      $('div').class('kop1').text(item.header1),
                      $('div').class('kop2').text(item.header2),
                    ),
                    $('div').class('row top btnbar').append(
                      Array.isArray(item.Email) ? item.Email.map(email => $('a').class('abtn icn email').text(email.Value).href(`mailto:${property.Value}`)) : null,
                    )
                  ).on('click', e => {
                    popupElem.emit('close');
                    $().preview(item);
                  })
                );
              }),500);
            });
          })
        );
      }
    }},
    langtext: { value: function (value){
      return this.ttext(...arguments);
    }},
    list: { value: function (){
      $().list(this);
      return this;
    }},
    load: { value: async function (src, callback){
      console.warn(src);
      if (src.match(/\w+\(\d+\)/)) {
        return;
      }
      if (src.match(/wiki$/)) {
        src += '/';
      }
      if (src.match(/wiki\/$/)) {
        src += 'Home';
      }
      function hrefSrc (href, src = '/') {
        if (href[0]==='#') return href;
        // console.log(href, src, new URL(src, document.location).href);
        if (href.match(/^http/)) return href;
        href = new URL(href, new URL(src, document.location)).href.replace(/^.*?\//,'/');
          // console.log(href);
        return href;
        // return href.toLowerCase();
      }
      function rawSrc(src) {
        console.log(777, src, document.location.hostname);
        src = src.replace(/\/(blob|tree)\/main/,'');
        if (document.location.hostname.split('.').pop() === 'localhost') {
          // src = src.replace(/github.com/, 'github.localhost');
          // console.error(333, new URL(new URL(src, document.location).pathname, document.location).href);
          src = new URL(new URL(src, document.location).pathname, 'http://github.aliconnect.nl').href;
        } else if (!src.match(/githubusercontent/)) {
          // src = src.replace(/\/\/([\w\.-]+)\.github\.io/, '//github.com/$1/$1.github.io');
          // src = src.replace(/\/\/([\w\.-]+)\.github\.io$/, '//github.com/$1/$1.github.io');
          src = src.replace(/\/\/([\w\.-]+)\.github\.io/, '//github.com/$1');
          src = src.replace(/github.com/, 'raw.githubusercontent.com');
        }
        if (src.match(/githubusercontent/)) {
          if (src.match(/\/wiki/)) {
            src = src.replace(/wiki$/,'wiki/Home');
            src = src.replace(/raw.githubusercontent.com\/(.*?)\/wiki/, 'raw.githubusercontent.com/wiki/$1');
          } else if (!src.match(/\/main/)) {
            src = src.replace(/raw.githubusercontent.com\/([\w\.-]+)\/([\w\.-]+)/, 'raw.githubusercontent.com/$1/$2/main');
          }
        } else {
          src = src.replace(/\/main/g, '');
          // src = src.replace(/\/main|\/aliconnect/g, '');
        }
        src = src.replace(/\/tree|\/glob|\/README.md/g, '');
        src = new URL(src, document.location).href;
        console.log(1, src);
        return src;
      }
      const elem = this;
      elem.paths = elem.paths || [];
      const homePath = document.location.origin;
      const origin = new URL(src, document.location).origin;
      const linksrc = hrefSrc(src).toLowerCase();
      this.links = this.links || [];
      src = rawSrc(src);
      this.loadMenu = async function (src) {
        // console.warn(4, src, rawSrc(src).replace(/wiki$/, 'wiki/'));
        var wikiPath = rawSrc(src).replace(/wiki$/, 'wiki/').replace(/[\w\.-]*$/,'');
        // wikiPath = wikiPath.match(/wiki/) ? wikiPath : new URL(wikiPath).origin + '/wiki/';
        // wikiPath = wikiPath.match(/wiki/) ? wikiPath : new URL(wikiPath).origin + '/wiki/';
        if (!elem.paths.includes(wikiPath)) {
          console.log(9, 'loadMenu', wikiPath, this.links);
          elem.paths.push(wikiPath);
          await $().url(rawSrc(wikiPath+'_Sidebar.md')).accept('text/markdown').get().catch(console.error)
          .then(e => {
            this.doc.leftElem.md(e.target.responseText);
            [...this.doc.leftElem.elem.getElementsByTagName('A')].forEach(elem => $(elem).href(hrefSrc(elem.getAttribute('href'), e.target.responseURL)));
          });
          [...this.doc.leftElem.elem.getElementsByTagName('LI')].forEach(li => {
            if (li.childNodes.length) {
              if (li.childNodes[0].nodeValue) {
                li.replaceChild($('span').text(li.childNodes[0].nodeValue.trim()).elem, li.childNodes[0]);
              }
              const nodeElem = li.firstChild;
              if (!nodeElem.hasAttribute('open') && nodeElem.nextElementSibling) {
                nodeElem.setAttribute('open', '0');
                $(nodeElem).attr('open', '0').on('click', e => {
                  nodeElem.setAttribute('open', nodeElem.getAttribute('open') ^ 1);
                });
              }
            }
            // console.log(li.childNodes);
          })
          this.links = [...this.doc.leftElem.elem.getElementsByTagName('A')];
        }
        // console.log('loadMenu2', src, wikiPath, this.links);
      }
      if (!this.doc) {
        this.doc = $().document(
          $('div'),
        );
        await this.loadMenu($.config.ref.home);
      }
      (this.findlink = () => {
        this.link = this.links.find(link => link.getAttribute('href') && link.getAttribute('href').toLowerCase() === linksrc);
      })();
      if (!this.link) {
        await this.loadMenu(src);
        this.findlink();
      }
      if (src.match(/wiki/)) {
      } else if (!src.match(/\.md$/)) {
        src += '/README';
      }
      if (!src.match(/\.md$/)) {
        src += '.md';
      }
      this.src = src;
      this.scrollTop = this.scrollTop || new Map();
      (this.url = $().url(src).accept('text/markdown').get()).then(async e => {
        if (elem.pageElem && elem.pageElem.elem.parentElement) {
          elem.loadIndex = false;
          // console.log('elem.docElem', elem, elem.docElem && elem.docElem.elem.parentElement);
        } else {
          elem.loadIndex = true;
        }
				let content = e.target.responseText;
        if (callback) {
          content = callback(content);
        }
        const responseURL = e.target.responseURL;
        var title = responseURL.replace(/\/\//g,'/');
        var match = content.match(/^#\s(.*)/);
        if (match) {
          content = content.replace(/^#.*/,'').trim();
          title = match[1];
        } else {
          title = title.match(/README.md$/)
          ? title.replace(/\/README.md$/,'').split('/').pop().split('.').shift().capitalize()
          : title.split('/').pop().split('.').shift().replace(/-/g,' ');
          title = title.replace(/-/,' ');
        }
        const date = e.target.getResponseHeader('last-modified');
				content = content.replace(/<\!-- sample button -->/gs,`<button onclick="$().demo(e)">Show sample</button>`);

				try {
					// eval('content=`'+content.replace(/\`/gs,'\\`')+'`;');
				} catch (err) {
					//console.error(err);
				}

				this.doc.docElem.text('').append(
          this.doc.navElem = $('nav'),
          $('h1').text(title),
          date ? $('div').class('modified').text(__('Last modified'), new Date(date).toLocaleString()) : null,
        )
        .md(content)
        .mdAddCodeButtons();
        [...this.doc.docElem.elem.getElementsByTagName('code')].forEach(elem => {
          if (elem.hasAttribute('source')) {
            $().url(hrefSrc(elem.getAttribute('source'), responseURL)).get()
            .then(e => {
              var content = e.target.responseText.replace(/\r/g, '');
              if (elem.hasAttribute('id')) {
                var id = elem.getAttribute('id');
                var content = content.replace(new RegExp(`.*?<${id}>.*?\n(.*?)\n(\/\/|<\!--) <\/${id}.*`, 's'), '$1').trim();
              }
              if (elem.hasAttribute('function')) {
                var id = elem.getAttribute('function');
                var content = content.replace(/\r/g, '').replace(new RegExp(`.*?((async |)function ${id}.*?\n\})\n.*`, 's'), '$1').trim();
              }
              elem.innerHTML = elem.hasAttribute('language') ? $.string[elem.getAttribute('language')](content) : content;
              // console.log(content);
              // $(elem).html(content, elem.getAttribute('language'));
            });
          }
        });
        [...this.doc.docElem.elem.getElementsByTagName('A')].forEach(elem => $(elem).href(hrefSrc(elem.getAttribute('href'), responseURL)));
        [...this.doc.docElem.elem.getElementsByTagName('IMG')].forEach(elem => {
          // let imgsrc = elem.getAttribute('src')||'';
          // if (imgsrc.match(/\/\//)) {
          //   const url = new URL(imgsrc);
          //   src = url.origin + url.pathname;
          // } else if (src.match(/^\//)) {
          //   const url = new URL(filename);
          //   src = url.origin + src;
          // } else {
          //   const url = new URL(src, filename.replace(/[^\/]+$/,''));
          //   src = url.origin + url.pathname;
          // }
          // src = src.replace(/\/wiki$/, '/wiki/Home');
          // src = src.replace(/github.com/, 'raw.githubusercontent.com');
          // src = src.replace(/raw.githubusercontent.com\/(.*?)\/wiki/, 'raw.githubusercontent.com/wiki/$1');
          // src = src.replace(/\/tree|\/blob/, '');
          elem.setAttribute('src', new URL(elem.getAttribute('src'), new URL(src, document.location)).href.replace(/^.*?\//,'/'));
        });
        setTimeout(() => this.doc.indexElem.index(this.doc.docElem));

        this.links.forEach(link => link.removeAttribute('selected'));
        if (this.link) {
          $(this.link).attr('selected', '');
          for (var link = this.link; link; link = link.parentElement.parentElement ? link.parentElement.parentElement.previousElementSibling : null) {
            if (link.hasAttribute('open')) {
              link.setAttribute('open', '1');
            }
          }
          const children = Array.from(this.link.parentElement.parentElement.children);
          const total = children.length;
          const index = children.indexOf(this.link.parentElement) + 1;
          var elemPrevious;
          var elemNext;
          this.doc.docNavTop.text('');
          if (this.link.parentElement.previousElementSibling) {
            elemPrevious=$('a').class('row prev').href(this.link.parentElement.previousElementSibling.firstChild.getAttribute('href')).append(
              $('span').text('←'),
              $('small').class('aco').text('Previous'),
            );
            this.doc.docNavTop.append(
              $('a').class('row prev').href(this.link.parentElement.previousElementSibling.firstChild.getAttribute('href')).append(
                $('span').text('←'),
                $('small').text(this.link.parentElement.previousElementSibling.firstChild.innerText),
              )
            )
          }
          if (this.link.parentElement.nextElementSibling) {
            elemNext=$('a').class('row next').href(this.link.parentElement.nextElementSibling.firstChild.getAttribute('href')).append(
              $('small').class('aco').text('Next'),
              $('span').text('→'),
            );
            this.doc.docNavTop.append(
              $('a').class('row next').href(this.link.parentElement.nextElementSibling.firstChild.getAttribute('href')).append(
                $('small').class('aco').text(this.link.parentElement.nextElementSibling.firstChild.innerText),
                $('span').text('→'),
              )
            )
          }
          $('div').parent(this.doc.docElem).class('row').append(
            $('span').append(elemPrevious),
            $('span').class('aco').align('center').text(`${index} van ${total}`),
            $('span').append(elemNext),
          );
        }

        this.doc.docElem.elem.scrollTop = this.scrollTop.get(src);

        return this;

			});
      return this.url;
    }},
    maps: { value: async function (selector, referenceNode) {
			const maps = await $.his.maps();
			// if (!$.his.maps.script) {
			// 	return $.his.maps.script = $('script')
			// 	.attr('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAKNir6jia2uSgmEoLFvrbcMztx-ao_Oys&libraries=places')
			// 	.parent(document.head)
			// 	.on('load', e => arguments.callee.apply(this, arguments))
			// }
			// $.his.maps.showonmap (par.maps, el);
			// referenceNode = referenceNode || $.listview.listItemElement;
			// referenceNode.innerText = '';
			// //console.log('============================');
			// const myLatLng = { lat: -25.363, lng: 131.044 };
			// const map = new google.maps.Map(document.getElementById("map"), {
			// 	zoom: 4,
			// 	center: myLatLng,
			// });
			// new google.maps.Marker({
			// 	position: myLatLng,
			// 	map,
			// 	title: "Hello World!",
			// });
			// referenceNode.style = 'width:100%;height:500px;';
			// this.mapel = referenceNode;//referenceNode.createElement('DIV', { className: 'googlemap', style: 'width:100%;height:100%;' });
			let map = new maps.Map(this.elem, { zoom: 8 });
			bounds = new maps.LatLngBounds();
			geocoder = new maps.Geocoder();
			// var address = selector;//decodeURI(params).split('/').pop();
			// //console.debug(address);
			geocoder.geocode({
				'address': selector
			}, function(results, status) {
				if (status == maps.GeocoderStatus.OK) {
					$.marker = new maps.Marker({
						map: map,
						position: results[0].geometry.location
					});
					bounds.extend($.marker.getPosition());
					map.fitBounds(bounds);
					maps.e.addListenerOnce(map, 'bounds_changed', e => this.setZoom(Math.min(10, this.getZoom())));
				} else {
					// //console.debug('Geocode was not successful for the following reason: ' + status);
				}
			});
			// new $.his.maps(el, par.maps);
		}},
    md: { value: function (content) {
      importScript(currentScript.src.replace(/elem/g, 'markdown')).then(e => {
        // console.log($.his.api_parameters);
        for (let [key,value] of Object.entries($.his.api_parameters)) {
          content = content.replace(key,value);
        }
        const mdElem = $('div').html(window.markdownit().render(content));

        for (let divElement of mdElem.elem.getElementsByTagName('DIV')) {
          if (divElement.hasAttribute('source')) {
            var loadingTask = pdfjsLib.getDocument(divElement.getAttribute('source'));
            loadingTask.promise.then(async pdf => {
              // console.log('PDF loaded');
              var numPages = pdf.numPages;
              // console.log(pdf);
              for (var pageNumber=1, numPages = pdf.numPages;pageNumber<=numPages;pageNumber++) {
                await pdf.getPage(pageNumber).then(function(page) {
                  // console.log('Page loaded');

                  var scale = 1;
                  var viewport = page.getViewport({scale: scale});

                  // Prepare canvas using PDF page dimensions
                  var a = $('a').parent(divElement).href(divElement.getAttribute('source'));
                  var canvas = $('canvas').parent(a).elem;
                  // document.body.appendChild(canvas);
                  // var canvas = document.getElementById('the-canvas');
                  var context = canvas.getContext('2d');
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;

                  // Render PDF page into canvas context
                  var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                  };
                  var renderTask = page.render(renderContext);
                  renderTask.promise.then(function () {
                    // console.log('Page rendered');
                  });
                });
              }

              // Fetch the first page
            }, function (reason) {
              // PDF loading error
              console.error(reason);
            });
            // console.log(source);
          }
        }
        // this.elem.innerHTML += $.string.mdHtml(s);
        this.elem.append(...mdElem.elem.childNodes);
      })
			return this;
		}},
    mdc: { value: function (s) {
      const newlines = [];
      let level = 0;
      $.string.mdHtml(s).split(/\n/).forEach(line => {
        const match = line.match(/^<h(\d)>(>\s)/);
        if (match) {
          // line = line.replace(/h\d>/g,'summary>')
          // if (match[1]==level) {
          //   newlines.push('</details><details>'+line);
          // } else if (match[1]>level) {
          //   newlines.push('<details>'+line);
          // } else if (match[1]<level) {
          //   newlines.push('</details></details><details>'+line);
          // }
          line = '<summary>'+line.replace(/>\s/,'')+'</summary>';
          if (match[1]==level) {
            newlines.push('</details><details>'+line);
          } else if (match[1]>level) {
            newlines.push('<details>'+line);
          } else if (match[1]<level) {
            newlines.push('</details></details><details>'+line);
          }
          level = match[1];
          return;
        }
        return newlines.push(line);
      });
      this.elem.innerHTML += newlines.join('\n');
      [...this.elem.getElementsByTagName('DETAILS')].forEach(
        el => el.addEventListener('toggle', e => el.open ? ga('send', 'pageview', el.firstChild.innerText) : null)
      );
      //   if (el.open) {
      //     console.log(el.firstChild.innerText);
      //     ga('send', 'pageview', el.firstChild.innerText);
      //   }
      // }))
      // this.on('click', e => {
      //   const el = e.path.filter(el => el.tagName === 'SUMMARY').shift();
      //   if (el && el.firstChild) {
      //     // ga('send', 'e', 'click', el.firstChild.innerText);
      //     ga('send', 'pageview', el.firstChild.innerText);
      //     // ga('send', 'e', {
      //     //   'hitType': 'pageview',
      //     //   'page': 'Testpage'
      //     // });
      //     // ga('send', 'e', 'Videos', 'play', 'Fall Campaign');
      //     // ga('send', 'e', {
      //     //   'eventCategory': 'Category',
      //     //   'eventAction': 'Action'
      //     // });
      //     // ga('set', 'title', el.firstChild.innerText);
      //     console.log(el.firstChild.innerText);
      //   }
      // })
      return this;
    }},
    mdAddCodeButtons: { value: function (){
      [...this.elem.getElementsByClassName('code-header')].forEach(elem => {
        const elemHeader = $(elem);
        const elemCode = $(elem.nextElementSibling);
        elemHeader.append(
          $('button').class('abtn copy').css('margin-left: auto'),
          $('button').class('abtn edit').on('click', e => elemCode.editor(elemHeader.attr('ln'))),
          $('button').class('abtn view').on('click', e => {
            const block = {
              html: '',
              css: '',
              js: '',
            };
            for (let codeElem of this.docElem.elem.getElementsByClassName('code')) {
              const type = codeElem.previousElementSibling.innerText.toLowerCase();
              if (type === 'html') {
                block[type] = block[type].includes('<!-- html -->') ? block[type].replace('<!-- html -->', codeElem.innerText) : codeElem.innerText;
              } else if (type === 'js') {
                block.html = block.html.replace(
                  /\/\*\* js start \*\*\/.*?\/\*\* js end \*\*\//s, codeElem.innerText
                );
              } else if (type === 'yaml') {
                block.html = block.html.replace(
                  /`yaml`/s, '`'+codeElem.innerText + '`',
                );
              } else if (type === 'css') {
                block.html = block.html.replace(
                  /\/\*\* css start \*\*\/.*?\/\*\* css end \*\*\//s, codeElem.innerText
                );
              }
              if (codeElem === elem) break;
            }
            var html = block.html
            .replace('/** css **/', block.css)
            .replace('/** js **/', block.js);
            console.log(html);
            return;
            const win = window.open('about:blank', 'sample');
            const doc = win.document;
            doc.open();
            doc.write(html);
            doc.close();
          }),
        )
      });
      return this;
    }},
    // media: new Media(),

    // menuitems: {
		// 	copy: { Title: 'Kopieren', key: 'Ctrl+C', onclick: function() { aimClient.selection.copy(); } },
		// 	cut: { Title: 'Knippen', key: 'Ctrl+X', onclick: function() { aimClient.selection.cut(); } },
		// 	paste: { Title: 'Plakken', key: 'Ctrl+V', onclick: function() { aimClient.selection.paste(); } },
		// 	hyperlink: { Title: 'Hyperlink plakken', key: 'Ctrl+K', onclick: function() { aimClient.selection.link(); } },
		// 	del: { Title: 'Verwijderen', key: 'Ctrl+Del', onclick: function() { aimClient.selection.delete(); } },
		// 	//add: {
		// 	//    Title: 'Nieuw',
		// 	//    click: function() { // //console.debug(this); },
		// 	//    menu: {
		// 	//        map: { Title: 'Map', key: 'Ctrl+N', },
		// 	//        contact: { Title: 'Contact', },
		// 	//    }
		// 	//},
		// 	move: {
		// 		Title: 'Verplaatsen',
		// 		popupmenu: {
		// 			moveup: { Title: 'Omhoog', key: 'Alt+Shift+Up', },
		// 			movedown: { Title: 'Omlaag', key: 'Alt+Shift+Dwon', },
		// 			ident: { Title: 'Inspringen', key: 'Alt+Shift+Right', },
		// 			outdent: { Title: 'Terughalen', key: 'Alt+Shift+Left', },
		// 		}
		// 	},
		// 	//cat: {
		// 	//    Title: 'Categoriseren',
		// 	//    menu: {
		// 	//        Ja: { Title: 'Ja', color: 'black', },
		// 	//        Nee: { Title: 'Nee', color: 'red', },
		// 	//        Groen: { Title: 'Groen', color: 'green', },
		// 	//        Blauw: { Title: 'Blauw', color: 'blue', },
		// 	//    }
		// 	//},
		// 	state: {
		// 		Title: 'Status',
		// 		//menu: this.item.class.fields.state.options
		// 	},
		// },
    // mse: {
		// 	Contacts: {
		// 		/** @function $.mse.Contacts.find
		// 		*/
		// 		find: function() {
		// 			if (!$.mse.loggedin === undefined) setTimeout(arguments.callee.bind(this), 500);
		// 			var url = "/api/v2.0/me/contacts?$select=DisplayName&$top=1000&$order=LastModifiedDateTime+DESC";
		// 			$.https.request ({ hostname: "outlook.office.com", path: url, headers: $.mse.headers }, function(e) {
		// 				//console.log("OUTLOOK contacts", e.body);
		// 				if (!e.body || !e.body.Value) return;
		// 				e.body.Value.forEach(function(row){
		// 					row.req = {headers: $.mse.headers, path: row['@odata.id'] };
		// 					row.Title = row.DisplayName
		// 				});
		// 				Listview.show(e.body.Value);
		// 			});
		// 		},
		// 	},
		// 	Messages: {
		// 		/** @function $.mse.Messages.find
		// 		*/
		// 		find: function(){
		// 			//console.log(this);
		// 			var url = "/api/v2.0/me/messages?$select=*&$top=10&order=LastModifiedDateTime DESC";
		// 			$.https.request ({ hostname: "outlook.office.com", path: url, headers: $.mse.headers }, function(e) {
		// 				//console.log("OUTLOOK messsages", e.body);
		// 				if (!e.body || !e.body.Value) return;
		// 				e.body.Value.forEach(function(row){
		// 					row.req = {headers: $.mse.headers, path: row['@odata.id'] };
		// 					row.Title = row.From.EmailAddress.Name;
		// 					row.Subject = row.Subject;
		// 				});
		// 				Listview.show(e.body.Value);
		// 			});
		// 		},
		// 	},
		// 	Events: {
		// 		/** @function $.mse.Events.find
		// 		*/
		// 		find: function(){
		// 			var url = "/api/v2.0/me/es?$select=*&$top=10";
		// 			$.https.request ({ hostname: "outlook.office.com", path: url, headers: $.mse.headers }, function(e) {
		// 				e.body.Value.forEach(function(row){
		// 					row.Title = row.Subject;
		// 					row.Subject = row.Start.DateTime + row.End.DateTime;
		// 					row.Summary = row.BodyPreview;
		// 					row.req = {headers: $.mse.headers, path: row['@odata.id'] };
		// 				});
		// 				Listview.show(e.body.Value);
		// 				//console.log("OUTLOOK DATA", this.getHeader("OData-Version"), e.body);
		// 			});
		// 		},
		// 	},
		// 	Calendarview: {
		// 		/** @function $.mse.Calendarview.find
		// 		*/
		// 		find: function() {
		// 			var url = "/api/v2.0/me/calendarview?startDateTime=2017-01-01T01:00:00&endDateTime=2017-03-31T23:00:00&$select=Id, Subject, BodyPreview, HasAttachments&$top=100";
		// 			$.https.request ({ hostname: "outlook.office.com", path: url, headers: $.mse.headers }, function(e) {
		// 				e.body.Value.forEach(function(row){
		// 					row.Title = row.Subject;
		// 					row.req = {headers: $.mse.headers, path: row['@odata.id'] };
		// 				});
		// 				Listview.show(e.body.Value);
		// 				//console.log("OUTLOOK DATA", this.getHeader("OData-Version"), e.body);
		// 			});
		// 		},
		// 	},
		// 	userdata: {},
		// 	login: function() {
		// 		return;
		// 		if (!$.paths || !$.paths['/mse/login']) return $.mse.loggedin = null;
		// 		aimClient.api.request ({ path: '/mse/login' }, function(e) {
		// 			if (!e.body || !e.body.access_token) return $.mse.loggedin = false;
		// 			$.mse.loggedin = true;
		// 			this.userdata = e.body;
		// 			var mse_access_token = e.body.access_token.split('-');
		// 			var access = mse_access_token[0].split('.');
		// 			var header = JSON.parse(atob(access[0]));
		// 			this.payload = JSON.parse(atob(access[1]));
		// 			// //console.log("RT", e.body.refresh_token);
		// 			// //console.log("RT", e.body.refresh_token.split('.'));
		// 			// for (var i=0, c=e.body.refresh_token.split('-'), code;i<c.length;i++) {
		// 			// 	//console.log("C1", i, c[i]);
		// 			// 	try { //console.log("E1", i, atob(c[i])); } catch(err) {}
		// 			// 	for (var i2=0, c2=c[i].split('_'), code2;i2<c2.length;i2++) {
		// 			// 		//console.log("C1", i, "C2", i2, c2[i2]);
		// 			// 		try { //console.log("C1", i, "E2", i2, atob(c2[i2])); } catch(err) {}
		// 			// 	}
		// 			// }
		// 			// //console.log("MSE", e.body.refresh_token.split('-'));
		// 			var timeleft = Math.round(this.payload.exp * 1000 - new Date().getTime());
		// 			// //console.log("MSE USER DATA", this.responseText, header, this.payload);
		// 			this.headers = {
		// 				"Authorization": "Bearer " + this.userdata.access_token,
		// 				"Accept": "application/json",
		// 				"client-request-id": $().client_id,
		// 				"return-client-request-id": "true",
		// 				"X-AnchorMailbox": this.userdata.preferred_username,
		// 			};
		// 			setTimeout(this.login, timeleft<0 ? 5000 : timeleft-10);
		// 			rowinfo.createElement('SPAN', 'mse', this.payload.unique_name);
		// 			this.userdata.login_url = this.userdata.login_url + "&state=" + btoa(document.location.href);
		// 			// , href: "https://login.microsoftonline.com/common/oauth/v2.0/authorize?response_type=code&client_id=24622611-2311-4791-947c-5c1d1b086d6c&redirect_uri=https://aliconnect.nl/$/v1/api/mse.php&state=" + [$.config.$.domain].join("+") + "&prompt=login&scope=openid offline_access profile email https://outlook.office.com/mail.readwrite https://outlook.office.com/calendars.readwrite https://outlook.office.com/contacts.readwrite https://outlook.office.com/people.read"
		// 			// rowinfo.createElement('SPAN').createElement('A', {innerText: 'login', href: $.mse.btnLogin.href = this.userdata.login_url = this.userdata.login_url + "&state=" + btoa(document.location.href) });
		// 		}.bind(this));
		// 	},
		// },

    navlist: { value: function (selector, context) {
			(function init(parent, selector, context) {
				if (selector) {
					if (typeof selector === 'string') {
						const li = $('li').parent(parent);
						const a = $('a').parent(li).attr('id', 'nav'+selector).text(selector.replace(/^\d+-/,''));
						if (context && typeof context === 'object') {
							Object.entries(context).forEach(entry => {
								if (typeof entry[1] === 'object') {
									a.attr('open', a.attr('open') || '0');
									const ul = li.ul = li.ul || $('ul').parent(li);
									init(ul, ...entry);
								} else if (typeof entry[1] === 'function') {
									a.elem[entry[0]] = entry[1];
								} else {
									a.attr(...entry);
								}
							});
							a.class('abtn')
						}
					} else {
						if (Array.isArray(selector)) {
							selector.forEach(item => init(parent, item))
						} else if (selector instanceof Object) {
							Object.entries(selector).forEach(entry => init(parent, ...entry));
						}
					}
				}
			})(this, ...arguments);
			return this;
		}},
    on: { value: function (selector, context) {
			if (typeof selector === 'object') {
				Object.entries(selector).forEach(entry => this.on(...entry))
			} else {
				// //console.log(selector, 'on'+selector in this.elem, this.elem['on'+selector])
				if (('on'+selector in this.elem) && !this.elem['on'+selector]) {
					this.elem['on'+selector] = context
					// //console.log('JA', this.elem['on'+selector])
				} else {
					this.elem.addEventListener(...arguments);
				}
			}
			// //console.log(this.elem, ...arguments);
			return this;
		},},
    open: { value: function elemOpen (state) {
      if (!arguments.length) {
        return this.elem.hasAttribute('open')
      }
			if ('open' in this.elem) {
        this.elem.open = state;
      } else {
        this.attr('open', state ? '' : null);
      }
      return this;
    },},
    operations: { value: function (selector){
			this.append(Object.entries(selector).map(entry =>
				$('button').class('abtn', entry[0]).attr(name, entry[0]).assign(entry[1])
			))
		},},
    payform: { value: function (params){
			// if (!$.shop.customer || !$.shop.customer.Product) return;
			let subtotal = 0;
			function nr(val) {
				return Number(val).toLocaleString(undefined, {minimumFractionDigits: 2});
			}
			this.append(
				$('form')
				.class('col aco payform doc-content')
				.attr('action', '/?order')
				.attr('novalidate', 'true')
				// .on('submit', e => {
				// 	//console.log('submit', order);
				// 	e.preventDefault();
				// 	for (var i=0, el;el=this.elements[i];i++) {
				// 		if (el.required && el.offsetParent && !el.value) {
				// 			el.focus();
				// 			// return false;
				// 		}
				// 	}
				// 	this.order.value = JSON.stringify(order);
				// 	new $.HttpRequest($.config.$, 'POST', '/?order', this);
				// 	return false;
				// })
				.append(
					$('fieldset').append(
						$('legend').text('Vul je gegevens in'),
						$('div').text('Heb je al een account? Dan kun je inloggen.'),
						$('div').properties({
							Type: { format:'radio', required:true, options: {
								particulier: { },
								zakelijk: {},
							}},
							CompanyName: {required1: true, autofocus: true, value: params.customer.Title},
							FirstName: { required1: true },
							LastName: { required1: true },
							BusinessPhone0: { type: 'tel', required1: true },
							EmailAddress0: { type: 'email', required1: true, autocomplete: false },
							gender: { format:'radio', options: {
								male: { color: 'red' },
								female: { color: 'green' },
							} },
							OtherAddress: { format: 'address' },
							hasBusinessAddress: { format: 'checkbox' },
							BusinessAddress: { format: 'address' },
							NewsLetter: { format: 'checkbox', title: 'Ja, ik wil nieuwsbrieven ontvangen.' },
							SendDeals: { format: 'checkbox', title: 'Ja, stuur mij relevante deals afgestemd op mijn interesses' },
							CreateAccount: { format: 'checkbox', title: 'Ik wil een account aanmaken' },
							Password: { type: 'password', autocomplete:'new-password' },
							day: { type:'number', min: 1, max: 31, value:'1' },
							month: { type:'number', min: 1, max: 12, value:'1' },
							year: { type:'number', min: 1900, max: 2020, value:'2000' },
						}),
					),
					$('fieldset').append(
						$('legend').text('Kies een verzendmethode'),
						$('div').text('Maak een keuze: (zie Verzendkosten)'),
						$('div').properties({
							verzending: { format:'radio', required:true, className:'col', options: {
								afleveradres: {
									title: 'Bezorgen op het afleveradres',
									checked:1,
								},
								westerfoort: {
									title: 'Afhalen in Westerfoort',
									info: 'Openingstijden: di/wo/vr: 9:00-18:00\Ado: 9:00-20:00, za: 09:00-17:00\AAdres: Hopjesweg 12A, 1234AB, Westerfoort',
								},
								dhl: {
									title: 'Afhalen bij een DHL ServicePoint'
								},
							}}
						}),
					),
					$('fieldset').append(
						$('legend').text('Kies een betaalmethode'),
						$('div').text('Kies de betaalmethode die je makkelijk vindt.'),
						$('div').properties({
							paymethod: { format:'radio', required:true, options: {
								oprekening: {
									title: 'Achteraf betalen',
									unit: '+2%',
									checked: 1,
								},
								contant: {
									title: 'Contant bij afhalen',
								},
								ideal: {
									title: 'iDEAL',
								},
								paypal: {
									title: 'PayPAL',
									unit: '+2%',
									disabled: true,
								},
								mastercard: {
									disabled: true,
								},
								visa: {
									disabled: true,
								},
								meastro: {
									disabled: true,
								},
							}},
							issuer_id: {
								title: 'Kies bank.',
								id: 'issuerID',
								options: {
									0031: 'ABN Amro bank',
									0761: 'ASN Bank',
									0802: 'bunq',
									0721: 'ING',
									0801: 'Knab',
									0021: 'Rabobank',
									0771: 'RegioBank',
									0751: 'SNS Bank',
									0511: 'Triodos Bank',
									0161: 'Van Lanschot Bankiers',
								}
							}
						}),
					),
					$('fieldset').append(
						$('legend').text('Waardebon- of actiecode invoeren'),
					).properties({
						discountcode: { title: 'Waardebon- of actiecode invoeren' },
						// }).operations({
						// 	activate: { type: 'button' },
					}),
					$('fieldset').class('col').append(
						$('legend').text('Overzicht van je bestelling'),
						$('table').append(
							$('thead').append(
								$('tr').append(
									'Omschrijving,Aantal,Prijs,Totaal'.split(',').map(val => $('th').text(val)),
								),
							),
							$('tbody').append(
								params.rows.map(
									row => $('tr').append(
										Object.values(row).map(
											val => $('td').text(
												isNaN(val)
												? val
												: nr(val, subtotal += row.tot = Math.round(row.amount * row.price * 100) / 100)
											)
										)
									)
								),
								$('tr').append(
									$('td').text('Verzendkosten').attr('colspan', 3),
									$('td').text(nr(params.verzendkosten, subtotal += params.verzendkosten)),
								),
								$('tr').append(
									$('td').text('Transactiekosten').attr('colspan', 3),
									$('td').text(nr(params.transactiekosten, subtotal += params.transactiekosten)),
								),
								$('tr').append(
									$('td').text(`BTW ${params.btw}% over ${nr(subtotal)}`).attr('colspan', 3),
									$('td').text(nr(params.btw = Math.round(subtotal * params.btw) / 100, subtotal += params.btw)),
								),
								$('tr').append(
									$('td').text('TE BETALEN').attr('colspan', 3),
									$('td').text(nr(subtotal)),
								),
							),
						),
						$('input').attr('hidden', '').attr('name', 'order'),
						$('div').text('Als je op de bestelknop klikt ga je akkoord met onze algemene leveringsvoorwaarden.'),
						// $('div').class('row btns').operations({
						// 	activate: { label: 'Bestellen en betalen', default:true },
						// }),
						$('div').text('Door op de bestelknop te klikken rond je de bestelling af.'),
						$('div').text('Als je nu bestelt, gaan we direct aan de slag!'),
					),
				),
			)
		},},
    prompts: { value: function () {
      this.append([...arguments].map(name=>$('a').class('abtn', name).caption(name).href('#?prompt='+name)));
      return this;
    },},
    parent: { value: function (selector){
			$(selector).append(this.elem);
			return this;
		},},
    path: { value: function (){
			const path = [];
			for (let p = this.elem; p ;p = p.parentElement) {
				// //console.log(p);
				path.push(p);
			}
			return path;
		},},
    properties: { value: function (properties) {
      [...arguments].filter(Boolean).forEach(properties => {
        let elem = this.elem;
  			let parent = this;
  			let selector = parent;
  			const format = {
          address: {
  					edit() {
  						const addressField = this.property;
              const item = this.property.item;
              const prefix = this.property.name;
              // console.log(prefix);
              function onchange (e) {
  							const formElement = e.target.form;
                item[e.target.name] = e.target.value;
  							e.target.modified = true;
  							let address = [
                  ['Street', 'Number'].map(name => formElement[prefix + name].value).filter(Boolean).join('+'),
                  ['PostalCode', 'City'].map(name => formElement[prefix + name].value).filter(Boolean).join('+'),
                  ['Country'].map(name => formElement[prefix + name].value).filter(Boolean).join('+'),
  							].join(',');
                // console.log(address, formElement);
  							$().url('https://maps.googleapis.com/maps/api/geocode/json').query({
  								address: address,
  								key: 'AIzaSyAKNir6jia2uSgmEoLFvrbcMztx-ao_Oys',
  							}).get().then(e => {
  								let compnames = {
  									route: prefix + 'Street',
  									sublocality_level_2: prefix + 'Street',
  									sublocality: prefix + 'Street',
  									street_number: prefix + 'Number',
  									postal_code: prefix + 'PostalCode',
  									locality: prefix + 'City',
  									administrative_area_level_2: prefix + 'Town',
  									administrative_area_level_1: prefix + 'State',
  									country: prefix + 'Country',
  								};
  								e.body.results.forEach(result => {
  									if (result.address_components) {
  										result.address_components.forEach(comp => {
  											comp.types.forEach(type => {
  												fieldname = compnames[type];
                          // console.log(type);
  												if (formElement[fieldname] && !formElement[fieldname].modified) {
  													item[fieldname] = formElement[fieldname].value = comp.long_name;
  												}
  											})
  										});
  									}
  								});
  							});
  						};
              function prop (selector, options) {
                return $('span').class('col aco prop input').append(
                  $('input').id(prefix + selector).name(prefix + selector).value(item[prefix + selector]).class('inp')
                  .placeholder(' ').on('change', onchange),
                  $('label').for(prefix + selector).ttext('Address' + selector),
                  $('i'),
                )
              }
              this.selector.append(
                $('div').class('row wrap').append(prop('Street'), prop('Number')),
                $('div').class('row wrap').append(prop('PostalCode'), prop('City')),
                $('div').class('row wrap').append(prop('Town'), prop('State'), prop('Country')),
              );
  					},
  				},
          cam: {
  					className: 'doc-content',
  					createInput: function() {
  						let snap = 0;
  						let camElement = this.elEdit.createElement('div', 'cam col', [
  							['div', 'row top w', [
  								['button', 'abtn icn r save', 'save', {onclick() {
  									$('video').pause();
  									let canvas = camElement.createElement('canvas', {
  										width: 640,
  										height: 480,
  									});
  									let context = canvas.getContext("2d");
  									context.drawImage(video, 0, 0, 640, 480);
  									data = canvas.toDataURL("image/png");
  									//console.log(data);
  									// UPLOAD DATA
  									canvas.remove();
  									// App.files.fileUpload(this.item, { name: 'photo.png' }, $('canvas').toDataURL("image/png"));
  								}}],
  							]],
  							['video', 'aco', { id:'video', autoplay: true, width: 640, height: 480, onclick() {
  								let video = $('video');
  								if (video.paused) {
  									$('video').play();
  								} else {
  									$('video').pause();
  								}
  							}}],
  						]);
  						if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  							navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  								try {
  									$('video').srcObject = stream;
  								} catch (error) {
  									$('video').src = window.URL.createObjectURL(stream);
  								}
  								if ($('video')) {
  									$('video').play();
  								}
  							});
  						}
  					},
  				},
          // check: {
  				// 	createInput: function() {
  				// 		this.elEdit.className += ' fw';
  				// 		var values = this.value.split(', ');
  				// 		this.elInp = this.elEdit.createElement('DIV', { className: 'inp row wrap' });
  				// 		this.options = this.options || this.enum;
  				// 		for (var optionname in this.options) {
  				// 			var option = this.options[optionname];
  				// 			var elInpOption = this.elInp.createElement('span', { className: 'radiobtn check' });
  				// 			elInpOption.createElement('INPUT', {
  				// 				el: this.elInp, type: 'checkbox', id: this.name + optionname, value: optionname, checked: (values.indexOf(optionname) != -1) ? 1 : 0, onclick: function(e) {
  				// 					var c = this.elEdit.getElementsByTagName('INPUT');
  				// 					var a = [];
  				// 					for (var i = 0, e; e = c[i]; i++) if (e.checked) a.push(e.value);
  				// 					this.elEdit.newvalue = a.join(', ');
  				// 				}
  				// 			});
  				// 			elInpLabel = elInpSpan.createElement('LABEL', { for: this.name + optionname  });
  				// 			elInpLabel.createElement('icon').style.backgroundColor = option.color;
  				// 			elInpLabel.createElement('span', { innerText: option.Title });
  				// 		}
  				// 		//this.elEdit.createElement('LABEL', { innerText: this.placeholder });
  				// 	}
  				// },
          checkbox: {
  					view() {
              $('div')
  						.parent(this.selector)
  						.class('row prop check',this.property.format,this.property.name)
  						.append(
                $('label').class('check').text(this.property.title || this.property.name),
  							$('label').ttext(this.displayvalue)
  						);
  						return this;
  					},
  					edit() {
              const property = this.property;
              let value = this.value || this.defaultValue;
              // var forId = ['property',this.name].join('_');
              console.log('CEHCKBOX', this.name);
							$('div')
              .parent(this.selector)
              .class('col input check',this.format || this.type || '',this.property.name)
              .append(
                $('div').class('row check').append(
                  $('input')
                  .on('change', e => this.value = e.target.checked ? 'on' : null)
                  .type('checkbox')
                  // .name(this.name)
                  // .attr(this)
                  .checkbox(this, this.property, this.attributes),
                )
							);
              // return;
              // const elements = [];
  						// const inputElement = this.selector;
              //
              //
  						// let el = inputElement.createElement('DIV', ['col input check',property.format,property.name].join(' '));
              //
              // let value = this.value || this.defaultValue || '';
  						// if (property.options) {
  						// 	value = value.split(',');
  						// 	var options = property.options || {   };
  						// 	el.createElement('LABEL', '', __(property.title || property.name));
  						// 	el = el.createElement('DIV', 'row');
  						// 	function createElem(tag, option) {
  						// 		var forId = ['property',property.name,tag].join('_');
  						// 		el.createElement('DIV', 'row check', [
  						// 			['INPUT', {
  						// 				type: 'checkbox',
  						// 				// name: tag,
  						// 				id: forId,
  						// 				checked: value.includes(tag),
  						// 			}],
  						// 			['LABEL', 'caption', { for: forId }, [
  						// 				['I', option.color ? {style : `background-color:${option.color};`} : null],
  						// 				['SPAN', '', __(option.title || tag)],
  						// 			]],
  						// 		]);
  						// 	}
  						// 	Object.entries(options).forEach(entry => createElem(...entry));
  						// } else {
  						// 	var forId = ['property',property.name].join('_');
  						// 	el.createElement('DIV', 'row check', [
  						// 		['INPUT', {
  						// 			type: 'checkbox',
  						// 			name: property.name,
  						// 			id: forId,
  						// 			checked: value ? 1 : 0,
  						// 		}],
  						// 		['LABEL', 'caption', { for: forId }, [
  						// 			['I'],
  						// 			['SPAN', '', __(property.title || property.name)],
  						// 		]],
  						// 	]);
  						// }
  					},
  				},
          checklist: {
  					createInput: function() {
  						this.elInp = this.elEdit.createElement('select', {});
  						for (var optionname in this.options) this.elInp.createElement('option', { value: optionname, innerText: this.options[optionname].Title || optionname });
  					},
  				},
  				default: {
            showDetails() {
  						if (lastLegend !== legend) {
  							const currentLegend = lastLegend = legend;
  							$('div').parent(parent).append(
  								this.selector = selector = $('details').class('col')
                  .parent(parent)
  								.open($().storage(currentLegend))
  								.on('toggle', e => $().storage(currentLegend, e.target.open))
  								.append(
  									$('summary').class('focus').text(currentLegend)
  								)
  							)
  						}
              return this;
  					},
  					view(property) {
  						$('div')
              .parent(this.selector)
              .class(
                'row prop', this.format || this.type || '',
                this.property.name,
              )
              .append(
  							$('label').ttext(this.title),
								$('span')
                .class(
                  'aco pre wrap',
                  this.className,
                  // data.some(data => data.SrcID == ID) ? 'ownprop' : '',
                  // data.some(data => data.SrcID != ID) ? 'srcprop' : '',
                )
                .html(this.displayvalue),
  						)
  					},
  					edit(property) {
              // console.log(property);
							$('div').parent(this.selector).class('col prop input',this.format || this.type || '',this.property.name).append(
								this.input = $('input')
                .class(
                  'inp focus aco',
                  this.className,
                  // data.some(data => data.SrcID == ID) ? 'ownprop' : '',
                  // data.some(data => data.SrcID != ID) ? 'srcprop' : '',
                )
                .id(this.name)
                .name(this.property.name)
                .attr(this)
                // .attr(this.attributes)
                .value(this.ownprop || !this.srcprop ? this.value : '')
                .placeholder(this.srcprop ? this.value : ' ')
								.on('change', e => this.value = e.target.value),
								$('label').class('row aco').ttext(this.title || this.name).for(this.name),
								$('i').pattern(this.pattern),
							)
  					},
  				},
          draw: {
  					view(property) {
  					},
  					edit(property) {
  						$(this.selector).append(
                $('div').append(
                  $('canvas').width(640).height(480).style('border:solid 1px gray;').draw()
                )
              );
  					},
  				},
          email: {
						type: 'email',
						pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
  				},
          files: {
  					createInput() {
  						//console.log('FILESSSSS', attributeName, attribute, this.elEdit, this.item);
  						const files = new Files(this, this.elEdit);
  						if (this.item && this.item.editBarElement) {
  							if (!this.item.files) {
  								this.item.files = files;
  								this.item.editBarElement.createElement('button', 'abtn attach', {type: 'button', accept: '', onclick: files.openDialog});
  								this.item.editBarElement.createElement('button', 'abtn image', {type: 'button', accept: 'image/*', onclick: files.openDialog});
  							}
  						}
  						this.elEdit.append(files.elem);
  						// apr.item.editBarElement = $.pageEditElement.createElement('DIV', 'row top abs btnbar np', { id: 'pageEditTopBar', operations: {
  						// 	close: {Title: 'Sluit formulier' },
  						// 	attach: {type: 'button', accept: '', onclick: files.openDialog},
  						// 	image: {type: 'button', accept: 'image/*', onclick: files.openDialog},
  						// 	camera: {type: 'button', item: this, onclick: $.prompt.camera},
  						// 	freedraw: {type: 'button', item: this, onclick: $.prompt.freedraw},
  						// }});
  						// this.elEdit.append(new Files(this).elem);
  					},
  					createView() {
  						const files = new Files(this);
  						this.item.files = this.item.files || files;
  						// elForm.filesAttribute = elForm.filesAttribute || files;
  						// this.elSpan = this.elView.append(files.elem);
  						return this.elView = files.elem;
  						// new Files(this, this.elSpan);
  					},
  				},
          hidden: {
  					edit() {
  						const is = $('input')
              .attr(this.property)
              .parent(this.selector)
              .name(this.name)
              .attr('tabindex', -1);
  						if (this.property.format === 'hidden') {
  							is.class('hide_input');
  						}
  					}
  				},
          html: {
						view(property) {
  						$('div').parent(this.selector).class('col prop', this.format || this.type || '', this.property.name).append(
  							$('label').ttext(this.title),
  							$('span').class('aco pre wrap doc-content',this.className).html(this.displayvalue),
  						)
  					},
  					edit() {
							// let html = (this.value||'').trim()
							// 				.replace(/<p><\/p>/gis, '')
							// 				.replace(/<p><br><\/p>/gis, '')
							// 				.replace(/<div><\/div>/gis, '')
							// 				.replace(/<div><br><\/div>/gis, '')
							// 				.replace(/^<p>/is, '')
							// 				.replace(/<\/p>$/is, '')
							// 				.replace(/^/is, '<p>')
							// 				.replace(/$/is, '</p>')
							// 				;
							// 				html='';
							// //console.log(html);
							let html = this.value || '';
              $('div').class('prop col').parent(this.selector).append(
                $('div')
                .class('inp doc-content')
                .placeholder('')
                .html(html)
                .htmledit(this.property),
								$('label').text(this.property.title || this.property.name),
              );
  					},
  				},
          json: {
  					createInput: function() {
  						this.elEdit.className = 'field col fw';
  						this.elInp = this.elEdit.createElement('CODE').createElement('TEXTAREA', { className: 'inp oa', style: 'white-space:nowrap;', value: editor.json(this.value) });
  						this.elInp.addEventListener('change', function() { try { JSON.parse(this.value, true) } catch (err) { alert('JSON format niet in orde;'); } });
  						this.elEdit.createElement('LABEL', { innerText: this.placeholder });
  						this.elInp.onkeyup = function(e) {
  							if (this.style.height < 300) {
  								this.style.height = 'auto';
  								this.style.height = Math.min(this.scrollHeight + 20, 300) + 'px';
  							}
  						};
  						setTimeout(function(el) { this.elEdit.onkeyup(); }, 100, this.elInp);
  					},
  				},
          linkedin: {
  				},
          location: {
  					className: 'doc-content',
  					createInput: function() {
  						let mapsElement = this.elEdit.createElement('DIV', {
  							id:'map',
  							style: 'width:100%;height:400px;',
  						});
  						let map = new google.maps.Map(mapsElement, {
  							zoom: 8,
  							// zoomControl: true,
  							// scaleControl: false,
  							// scrollwheel: false,
  							// disableDoubleClickZoom: true,
  							// gestureHandling: 'greedy',
  							// gestureHandling: 'none',
  							// gestureHandling: 'auto',
  							gestureHandling: 'cooperative',
  						});
  						bounds = new google.maps.LatLngBounds();
  						geocoder = new google.maps.Geocoder();
  						if (navigator.geolocation) {
  							navigator.geolocation.getCurrentPosition(function(position) {
  								var pos = {
  									lat: position.coords.latitude,
  									lng: position.coords.longitude
  								};
  								//console.log('CURRENT POS', position);
  								var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  								$.currgeocoder = $.currgeocoder || new google.maps.Geocoder();
  								$.currgeocoder.geocode({
  									'location': myLatlng
  								}, function (results, status) {
  									if (status == google.maps.GeocoderStatus.OK) {
  										let marker = new google.maps.Marker({
  											map: map,
  											position: results[0].geometry.location
  										});
  										bounds.extend(marker.getPosition());
  										map.fitBounds(bounds);
  										google.maps.e.addListenerOnce(map, 'bounds_changed', function() {
  											this.setZoom(Math.min(10, this.getZoom()));
  										});
  									} else {
  										//console.error('Geocode was not successful for the following reason: ' + status);
  									}
  								});
  							}, function() {
  								// handleLocationError(true, infoWindow, map.getCenter());
  							});
  						} else {
  							alert('NOT navigator.geolocation');
  							// Browser doesn't support Geolocation
  							handleLocationError(false, infoWindow, map.getCenter());
  						}
  					},
  				},
          meter: {
  					view() {
  						this.selector.createElement('DIV', ['row prop',this.property.format,this.property.name].join(' '), [
  							['LABEL', '', this.property.title || this.property.name, {for: this.property.name } ],
  							['METER', 'aco', '2 outof 10', this.property, {id: this.property.name } ],
  						]);
  					},
  					edit() {
  						this.selector.createElement('DIV', ['row input',this.property.format,this.property.name].join(' '), [
  							['LABEL', '', {for: this.property.name } ],
  							['METER', 'aco', '2 outof 10', this.property, {id: this.property.name } ],
  						]);
  					},
  				},
          number: {
						type: 'number',
  				},
          password: {
						type: 'password',
  				},
          radio: {
  					view() {
  						$('div')
  						.parent(this.selector)
  						.class('row prop',this.property.format,this.property.name)
              .setProperty('btbg', ((this.property.options||{})[this.value]||{}).color)
  						.append(
  							$('label').class('check').text(this.property.title || this.property.name),
  							$('label').ttext(this.displayvalue)
  						);
  						return this;
  					},
            edit() {
  						const property = this.property;
  						let value = this.value || this.defaultValue;
  						function option(tag, option){
                option.value = tag;
                option.checked = tag === value;
  							const forId = ['property',property.name, tag].join('_');
  							if (property.required && !value) {
  								value = this.value = tag;
  							}
  							return $('div')
                .class('row')
                .setProperty('btbg', option.color)
                .append(
                  $('input')
                  .type('radio')
                  .on('change', e => {
                    property.value = tag;
                    this.changed = e.target;
                  })
                  .on('keydown', e => {
                    if (this.changed === e.target && e.code === 'Space' && !property.required) {
                      e.target.checked ^= 1;
                      property.value = e.target.form[e.target.name].value = e.target.checked ? e.target.value : null;
                      this.changed = null;
                      e.preventDefault();
                    }
                  })
                  .on('click', e => {
                    if (this.changed === e.target && !property.required) {
                      e.target.checked ^= 1;
                      property.value = e.target.form[e.target.name].value = e.target.checked ? e.target.value : null;
                      this.changed = null;
                    }
                  })
                  .checkbox(property, option)
  							)
  						}
  						this.selector.append(
  							$('div').class('col prop input',property.format,property.name).append(
  								$('label').text(property.title || property.name),
  								$('div').class('row wrap').append(
  									Object.entries(property.options||{}).map(entry => option(...entry))
  								)
  							)
  						);
  						return this;
  					},
  				},
          select: {
            get textvalue() {
              return 'ja';
            },
            view(property) {
              // console.log(this.textvalue, this.property.options, this.property.value);
  						$('div')
              .parent(this.selector)
              .class(
                'row prop', this.format || this.type || '',
                this.property.name,
              )
              .append(
  							$('label').ttext(this.title),
								$('span')
                .class(
                  'aco pre wrap',
                  this.className,
                  // data.some(data => data.SrcID == ID) ? 'ownprop' : '',
                  // data.some(data => data.SrcID != ID) ? 'srcprop' : '',
                )
                .displayvalue(this.property.name)
                .item(this.property.item, this.name + 'view')
                // .html(this.displayvalue),
  						)
  					},
            createInput() {
              console.log(this.textvalue);
  						this.elInp = this.elEdit.createElement('select', 'inp row aco', { item: this.item, name: this.name });
  						this.elEdit.createElement('LABEL', '', this.title || this.name);
  						let selected = [];
  						let value = this.value || this.defaultvalue || '';
  						// //console.log(value);
  						if (this.type === 'array') {
  							this.elInp.setAttribute('multiple', '');
  							selected = value ? String(value).split(',') : [];
  							// //console.log(selected);
  						}
  						if (Object.prototype.toString.call(this.options) === '[object Array]') {
  							for (var i = 0, optionvalue; optionvalue = this.options[i]; i++) {
  								var optionElement = this.elInp.createElement('option', '', optionvalue, { value: optionvalue, selected: selected.includes(optionvalue) });
  							}
  						} else {
  							for (let [optionName, option] of Object.entries(this.options)) {
  								// //console.log(selected, option.value);
  								var optionElement = this.elInp.createElement('option', '', typeof option === 'object' ? option.title || optionName : option, { value: optionName });
  								if (selected.includes(optionName)) {
  									optionElement.setAttribute('selected', '');
  								}
  							}
  						}
  						//this.elInp.value = 'pe';
  						// //console.debug(this.value, this);
  						this.elInp.addEventListener('change', e => {
  							this.value = [...e.target.options].filter(option => option.selected).map(option => option.value).join(',');
  							//console.log(this.value);
  							// //console.log(e, [...e.target.options].filter(option => option.selected).map(option => option.value).join(','), e.target.value);
  							// this.elInp.value = [...e.target.options].filter(option => option.selected).map(option => option.value).join(',');
  							// // e.target.value = e.target.
  							// //console.log(this.elInp.value);
  						}, true);
  						// this.elInp.value = '1,2';
  						this.elInp.value = this.value;
  					},
            edit() {
              console.log(this.value, this.property);
              this.selector.append(
  							$('div').class('row prop input',this.format || this.type || '',this.property.name).append(
  								this.input = $('select')
                  .class(
                    'inp focus aco',
                    this.className,
                  )
                  .id(this.name)
                  .name(this.name)
                  .placeholder(' ')
                  .attr(this.property)
  								.attr(this.attributes)
                  .append(
                    Object.entries(this.property.options||{}).map(([optionName,option])=>$('option').value(optionName).text(option.title).selected(optionName === this.value ? 'JA': null))
                  )
                  // .value(this.value)
  								.on('change', e => {
                    console.log(e.target, e.target.value);
                    this.property.value = e.target.value;
                  }),
  								$('label').class('row aco').ttext(this.title || this.name).attr('for', this.name),
  								$('i').attr('pattern', this.attributes ? this.attributes.pattern : null),
  							)
  						)
  					},
  				},
          selectitem: {
            view() {
  						const property = this.property;
  						const data = {};//[].concat(this.property.item.data[property.name]).shift();
              // console.log(this.name, this.property.item.data, this.property.item.Master);
  						$('div').parent(this.selector)
  						.class('row prop', this.format || this.type || '', this.property.name)
  						.append(
  							$('label').ttext(property.title),
                $('span').itemLink(data)
  						)
  					},
  					edit() {
  						const property = this.property;
              const items = [...$.props.values()]
              .unique()
              .filter(item => item instanceof Item)
              .filter(item => this.schema && (this.schema === '*' || this.schema.includes(item.schemaName)));
  						const listElement = $.his.listElement = $.his.listElement || $('datalist')
              .parent(document.body)
              .id('listitems')
              .on('updateList', e => {
                listElement.text('');
                const value = e.detail.value.toLowerCase();
                // console.log('updateList', e.detail, schemaName, finditems);
                e.detail.items
                .filter(item => item.header0.toLowerCase().includes(value))
                .forEach(item => $('option').parent(listElement).text(item.subject).value(item.header0 === item.tag ? item.header0 : item.header0 + ' ' + item.tag))
              });
              // console.log(this.selector, selector);
              selector.append(
  							$('div').class('col prop', property.format, property.name).append(
  								this.inputElem = $('input').class('inp')
                  .value(this.oldValue = this.value)
                  .name(this.name)
                  .autocomplete('none')
                  .placeholder(' ')
                  .attr('list', 'listitems')
                  .attr(property)
                  .on('drop', e => {
                    let data = (e.dataTransfer || e.clipboardData).getData("aim/items");
                    if (data) {
                      e.stopPropagation();
                      e.preventDefault();
                      data = JSON.parse(data);
                      const linkitem = data.value[0];
                      // console.log(item, this.property.item);
                      // return;
                      if (linkitem) {
                        this.property.item.attr(this.name, {
                          AttributeID: this.data ? this.data.AttributeID : null,
                          LinkID: linkitem.ID,
                        }, true).then(item => {
                          console.log('updated');
                          // this.inputElem.value($(linkitem).header0);
                          item.details(true).then(item => $('view').show(item, true));
                        })
                      }
                      // console.log(item, $(item));
                    }
                  })
                  .on('change', e => {
                    this.oldValue = e.target.value;
                    const [tag] = e.target.value.match(/\b[\w_]+\(\d+\)/);
                    if (tag) {
                      const item = items.find(item => item.tag === tag);
                      if (item) {
                        this.value = {
                          LinkID: item.ID,
                        }
                      }
                    }
                  })
                  .on('keyup', e => {
                    //console.log(e.type);
                    if (this.oldValue === e.target.value) return;
                    const value = this.oldValue = e.target.value;
                    listElement.emit('updateList', {value: e.target.value, items: items});
                    if (this.request) return;
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                      return;
                      this.request = $().api(`/${attribute.schema}`)
                      .select('Title')
                      .search(inputElement.value)
                      .top(20)
                      .get()
                      .then(result => {
                        $.his.listElement.updateList(property.schema, value, this.request = null);
                      });
                    },500);
                  }),
  								$('label').text(property.title || property.name),
  							),
  						);
  					},
  				},
          sharecam: {
  					createInput: function() {
  						//console.log('SHARE CAM', this);
  						this.wall = this.item.tag;
  						this.client = $.access.sub;
  						new Chat(this, this.elEdit);
  					},
  				},
          skype: {
  				},
          tel: {
						type: 'tel',
						pattern: '[0-9]{10,11}',
  				},
          text: {
						type: 'text',
  				},
          textarea: {
  					view() {
  						return;
  						this.selector.createElement('DIV', ['row prop check',this.property.format,this.property.name].join(' '), [
  							['LABEL', '', this.property.title || this.property.name],
  							['SPAN', '', this.value],
  						]);
  					},
  					edit() {
  						function resize (e) {
  							e.target.style.height = '0px';
  							e.target.style.height = (e.target.scrollHeight + 24) + 'px';
  						}
  						return;
  						let el = this.selector.createElement('DIV', ['col input',this.property.format,this.property.name].join(' '), [
  							['LABEL', '', this.property.title || this.property.name],
  							['TEXTAREA', 'inp', {value: this.value, onkeyup: resize }],
  						]);
  					},
  				},
          url: {
  				},
          yaml: {
  					view() {
  						this.selector.createElement('DIV', ['row prop check',this.property.format,this.property.name].join(' '), [
  							['LABEL', '', this.property.title || this.property.name],
  							['SPAN', '', this.value],
  						]);
  					},
  					edit() {
  						function resize (e) {
  							e.target.style.height = '0px';
  							e.target.style.height = (e.target.scrollHeight + 24) + 'px';
  						}
  						let el = this.selector.createElement('DIV', ['col input',this.property.format,this.property.name].join(' '), [
  							['LABEL', '', this.property.title || this.property.name],
  							['TEXTAREA', 'inp', {value: this.value, onkeyup: resize }],
  						]);
  					},
  				},
          bedieningen: {
            view() {
              return this.selector.append(
                $('div').class('col').append(
                  $('button').class('abtn')
                  .ttext(this.property.title || this.property.name)
                  // .click(this.property.item[this.name].bind(this.property.item))
                  .on('click', e => {
                    console.log(this.property.item.tag);
                    $().send({
                      // to: { aud: aimClient.access.aud },
                      path: `/${this.property.item.tag}/${this.name}()`,
                      method: 'post',
                      // forward: $.forward || $.WebsocketClient.socket_id,
                    })
                  })
                  // e => {
                  //   console.log(this.property.item, this.name, this.property.item[this.name]);
                  //   // property.item.handVerkeerslichtenGedoofd.call(property.item);
                  // })
                )
              );
            },
            edit() {
              return this.view();
            },
          },
          besturingen: {
            view() {
              return this.selector.append(
                $('div').class('col').append(
                  $('button').class('abtn')
                  .ttext(this.property.title || this.property.name)
                  // .click(this.property.item[this.name].bind(this.property.item))
                  .on('click', e => {
                    console.log(this.property.item.tag);
                    $().send({
                      // to: { aud: aimClient.access.aud },
                      path: `/${this.property.item.tag}/${this.name}()`,
                      method: 'post',
                      // forward: $.forward || $.WebsocketClient.socket_id,
                    })
                  })
                  // e => {
                  //   console.log(this.property.item, this.name, this.property.item[this.name]);
                  //   // property.item.handVerkeerslichtenGedoofd.call(property.item);
                  // })
                )
              );
            },
            edit() {
              return this.view();
            },
          },
          autonoom_processen: {
            view() {
              return this.selector.append(
                $('div').class('col').append(
                  $('button').class('abtn')
                  .ttext(this.property.title || this.property.name)
                  // .click(this.property.item[this.name].bind(this.property.item))
                  .on('click', e => {
                    console.log(this.property.item.tag);
                    $().send({
                      // to: { aud: aimClient.access.aud },
                      path: `/${this.property.item.tag}/${this.name}()`,
                      method: 'post',
                      // forward: $.forward || $.WebsocketClient.socket_id,
                    })
                  })
                  // e => {
                  //   console.log(this.property.item, this.name, this.property.item[this.name]);
                  //   // property.item.handVerkeerslichtenGedoofd.call(property.item);
                  // })
                )
              );
            },
            edit() {
              return this.view();
            },
          },
  			};
  			const path = parent.path();
  			const isForm = path.some(elem => elem.tagName === 'FORM');
  			let legend = '';
  			let lastLegend = '';
        for (let [name, property] of Object.entries(properties)) {
          // console.log('properties', name, property);
          function Property () {
            if (!property) return;
            this.property = property;
            this.selector = selector;
            this.name = name;
            // if (this.enum && !this.options) {
            // 	if (Array.isArray(this.enum)) {
            // 		this.options = this.enum;
            // 	} else if (typeof this.enum === 'object') {
            // 		this.options = this.enum;
            // 		this.enum = Object.keys(this.options);
            // 		if (this.enum.length === 2 && Object.values(this.options).filter(Boolean).length === 1) {
            // 			this.format = 'checkbox';
            // 		}
            // 	}
            // }
            // if (this.options && !this.enum) {
            // 	this.enum = Object.keys(this.options);
            // 	// property.format = property.format || 'radio';
            // }
            if (this.schema) {
              this.format = 'selectitem';
            }
            if (!this.format) {
              if (this.enum && this.type !== 'array') {
                this.format = this.enum.length > 4 ? 'select' : 'radio';
              }
            }
            if (!this.type) {
              if (this.enum) {
                this.type = this.enum.some(v => typeof v === 'string') ? 'string' : 'number';
              }
            }
            if (property.stereotype) {
              property.format = property.format || property.stereotype;
              property.legend = property.legend || __(property.stereotype);
            }
            Object.assign(this, property, format.default, format[this.type], format[this.format]);
            this.placeholder = this.placeholder || ' ';
            this.data = this.item ? this.item.data[name] : {};
            this.title = this.title || this.name;
            legend = this.legend = property.legend || legend;
            if (this.property.item) {
              const ID = this.property.item.ID;
              const data = [].concat(this.data, this.item);
              // console.log('CLASSNAME', data);
              this.ownprop = data.some(data => data && data.Value && data.SrcID && data.SrcID == ID );
              this.srcprop = data.some(data => data && data.Value && data.SrcID && data.SrcID != ID);
              this.className = [
                this.ownprop ? 'ownprop' : '',
                this.srcprop ? 'srcprop' : '',
              ].join(' ')
              // console.log('CLASSNAME', this.name, this.className, data, this);
            }
            // console.log(333, name, this.property);
            if (isForm) {
              if (elem.elements[this.property.name]) return;
              this.showDetails().edit();
              if (this.autofocus && this.input) {
                setTimeout(() => this.input.focus(),500);
              }
            } else if (this.displayvalue !== null || ['bediening','besturing','autonoom_proces'].includes(property.stereotype)) {
              if (property.type === 'hidden') return;
              this.showDetails().view();
            }
          }
          Property.prototype = Object.create(property, {
            displayvalue: {
              get() {
                return $.attr.displayvalue(this.value, property);
              },
            },
          });
          new Property();
        }
      });
			return this;
		},},
    qr: { value: function (selector, context) {
      const elem = this.elem;
      (async function(){
        if (!window.QRCode) {
          await importScript(scriptPath + 'js/qrcode.js');
        }
        new QRCode(elem, selector);
        if (elem.tagName === 'IMG') {
          elem.src = elem.firstChild.toDataURL("image/png");
          elem.firstChild.remove();
        }
      })()
      return this;
		},},
    remove: { value: function (selector) {
      if (selector) {
        if (this.elem.hasAttribute(selector)) {
          this.elem.removeAttribute(selector)
        } else {
          (this.elem || this.selector).removeEventListener(...arguments);
        }
      } else {
        this.elem.remove()
      }
      return this;
    },},
    resizable: { value: function () {
      this.class('resizable');
      const table = this.elem;
      const row = table.getElementsByTagName('tr')[0];
      if (!row) return;
      const cols = [...row.children];
      cols.forEach(elem => {
        $('i').parent(elem).class('resizer').on('mousedown', function (e) {
          let pageX,curCol,nxtCol,curColWidth,nxtColWidth;
          table.style.cursor = 'col-resize';
          curCol = e.target.parentElement;
          nxtCol = curCol.nextElementSibling;
          pageX = e.pageX;
          let padding = paddingDiff(curCol);
          curColWidth = curCol.offsetWidth - padding;
          if (nxtCol) {
            nxtColWidth = nxtCol.offsetWidth - padding;
          }
          function mousemove (e) {
            if (curCol) {
              let diffX = e.pageX - pageX;
              if (nxtCol)
              clearTimeout(to);
              to = setTimeout(() => {
                // nxtCol.style.width = (nxtColWidth - (diffX))+'px';
                curCol.style.width = (curColWidth + diffX)+'px';
              }, 100);
            }
          }
          function mouseup (e) {
            table.style.cursor = '';
            curCol = nxtCol = pageX = nxtColWidth = curColWidth = undefined;
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
          }
          document.addEventListener('mousemove', mousemove);
          document.addEventListener('mouseup', mouseup);
        });
        elem.style.width = elem.offsetWidth + 'px';
      });
      table.style.tableLayout = 'fixed';
      let to;
      function paddingDiff(col){
        if (getStyleVal(col,'box-sizing') == 'border-box') {
          return 0;
        }
        var padLeft = getStyleVal(col,'padding-left');
        var padRight = getStyleVal(col,'padding-right');
        return (parseInt(padLeft) + parseInt(padRight));
      }
      function getStyleVal(elm,css){
        return (window.getComputedStyle(elm, null).getPropertyValue(css))
      }
    },},
    sample: { value: function (selector, sample) {
			const htmlScript = `
			<html>
			<head>
			<link rel="stylesheet" href="https://aliconnect.nl/v1/api/css/web.css" />
			<script src="https://aliconnect.nl/v1/api/js/aim.js"></script>
			<style><!-- style --></style>
			<script><!-- script --></script>
			</head>
			<body>
			</body>
			`;
			const head = `<script src="/v1/api/js/aim.js"></script><script src="/v1/api/js/web.js"></script>`;
			function codeJs (f) {
				let content = String(f);
				content = String(content).replace(/^(.*?)\{|\}$/g,'').split(/\n/);
				let ident = content.filter(line => line.trim());
				if (ident.length) {
					ident = ident[0].search(/\S/);
					content = content.map(line => line.substr(ident));
				}
				// //console.log(content);
				return content.join('\n').trim();
			}
			//console.log(selector);
      const ref = {};
      sample.template = sample.template || htmlScript;
      // const elemHtml = $('td', 'code');
      if (sample.type === 'iframe') {
				this.elem.append(
 					$('table').append(
	          $('tr').append(
	            $('th', '', 'script'),
	            $('th', '', 'iframe'),
	          ),
	          $('tr').append(
	            $('td', 'code', $().toHtml(codeJs(sample.script), 'js')),
	            $('td').append(sampleBody = $('iframe')),
	          ),
					),
        );
        const doc = sampleBody.elem.contentWindow.document;
        const html = sample.template.replace(/<\!-- script -->/, script);
        doc.open();
        doc.write(html);
        doc.close();
      } else {
        ref.table = $('table').append(
          $('tr').append(
            $('th', '', 'script'),
            $('th', '', 'div'),
          ),
          $('tr').append(
            $('td', 'code', $().toHtml(codeJs(sample.script), 'js')),
            $('td').append(sampleBody = $('div')),
          ),
        );
        document._body = sampleBody.elem;
        //console.log(document._body);
        sample.script();
        document._body = null;
      }
			this.elem.append(
				$('h1', '', selector),
			);
			return this;
		},},
		scrollIntoView: { value: function (options = { block: "nearest", inline: "nearest" }) {
			this.elem.scrollIntoView(options);
			return this;
		},},
    script: { value: function (src) {
			return $.promise('script', resolve => $('script').src(src).parent(this).on('load', resolve))
		},},
    _select: { value: function (e) {
			const elem = this.elem;
			const setOpen = open => {
				//console.log('setOpen', open, elem);
				open = Number(open);
				$(elem).attr('open', open);
				if (elem.label) {
					var foldersOpen = $.his.cookie.foldersOpen
					? $.his.cookie.foldersOpen.split(', ').filter(x => x !== elem.label)
					: [];
					if (open) {
						foldersOpen.push(elem.label);
					}
					$.his.cookie = {
						foldersOpen: foldersOpen.join(', ')
					};
				}
				if (open) {
					if (elem.onopen && !elem.loaded) {
						elem.loaded = elem.onopen();
					}
				} else {
					if (elem.onclose) {
						elem.onclose();
					}
				}
			};
			if (!elem.label) {
				// //console.log('elementSelect', elem);
				for (var par = elem.parentElement; par; par = par.parentElement) {
					if (!['UL', 'LI'].includes(par.tagName)) {
						break;
					}
				}
				[...par.getElementsByTagName('A')].forEach(el => {
					if (el.hasAttribute('open') && el !== elem) {
						if (el.hasAttribute('selected')) {
							el.removeAttribute('selected');
						}
						if (el.getAttribute('open') === '1') {
							el.setAttribute('open', 0);
						}
					}
				});
				for (var el = elem.parentElement; el; el = el.parentElement) {
					[el, el.firstChild].forEach(el => {
						if (['A','DIV'].includes(el.tagName) && el.getAttribute && el.getAttribute('open') === '0' && el !== elem) {
							el.setAttribute('open', 1);
						}
					});
				}
			}
			if (e && e.type === 'click' && elem.tagName === 'A') {
				if (elem.href && elem.href.match(/#(\w)/)) {
					return;
				}
				if (elem.hasAttribute('selected')) {
					if (elem.getAttribute('open') === '1') {
						return setOpen(0);
					}
				}
			} else {
				if (elem.getAttribute('open') === '1') {
					return setOpen(0);
					// for (var el = elem.nextElementSibling; el && el.tagName != elem.tagName; el = el.nextElementSibling) {
					// 	el.style.display = 'none';
					// }
				}
			}
			if (elem.getAttribute('open') === '0') {
				return setOpen(1);
				// for (var el = elem.nextElementSibling; el && el.tagName != elem.tagName; el = el.nextElementSibling) {
				// 	el.style.display = '';
				// }
			}
			elem.setAttribute('selected', '');
			elem.scrollIntoViewIfNeeded(false);
			// //console.log('OPEN', elem.label);
			return this;
		},},
    seperator: { value: function (pos) {
			const ZINDEX = 6;
			const selector = this;
			const elem = selector.elem;
			let targetElement;
			function start(e) {
				if (e.which === 1) {
					if (!e) e = window.event;
					e.stopPropagation();
					e.preventDefault();
					window.getSelection().removeAllRanges();
					targetElement = elem.hasAttribute('right') ? elem.nextElementSibling : elem.previousElementSibling;
					elem.clientX = e.clientX;
					selector.css('left', elem.moveX = 0).css('z-index', 300).attr('active', '');
					document.addEventListener("mouseup", checkmouseup, true);
					document.addEventListener("mousemove", doresizeelement, true);
				}
			};
			function doresizeelement(e) {
				selector.css('left', (elem.moveX = e.clientX - elem.clientX) + 'px');
			};
			function checkmouseup (e) {
				document.removeEventListener('mousemove', doresizeelement, true);
				document.removeEventListener('mouseup', checkmouseup, true);
				$(targetElement).css('max-width', (targetElement.offsetWidth + (elem.hasAttribute('right') ? -elem.moveX : elem.moveX)) + 'px');
				$().storage(targetElement.id + '.width', targetElement.style.maxWidth);
				// //console.log(targetElement.id + 'Width', targetElement.style.maxWidth);
				selector.css('left', elem.moveX = 0).css('z-index', ZINDEX).attr('active', null);
			};
			selector
			.attr(pos, '')
			// .class('seperator')
			.class('seperator noselect')
			.on('mousedown', start)
			.css('z-index',ZINDEX);
			return this;
		},},
    set: { value: function () {
      return this.map.set(...arguments);
    },},
    show: { value: function (item, doEdit) {
      // TODO: wijzig rechten
      // var edit = !Number(this.userID) || this.userID == $.auth.sub;
      item.details().then(e => {
        // console.log(item);
        ItemSelected = item;
        this.item = item;
        document.title = item.header0;
        $().ga('send', 'pageview');
        // if (item.data.Id) {
        //   const url = new URL(document.location);
        //   url.searchParams.set('id', item.data.Id);
        //   $.his.replaceUrl(url.toString());
        //
        //   // $.his.replaceUrl(document.location.origin+document.location.pathname.replace(/\/id\/.*/,'')+'/id/'+item.data.Id+document.location.search)
        // }
        function logVisit() {
          return console.debug('logVisit'); // DEBUG:
          if (item.data.ID) {
            clearTimeout($.his.viewTimeout);
            $.his.viewTimeout = setTimeout(() => {
              aimClient.api('/').query('request_type','visit').query('id',item.data.ID).get().then(result => {
                $.his.items[item.data.ID] = new Date().toISOString();
              })
            },1000);
          }
        }
        item.data.fav = [
          {
            '@id': '/Contact(265090)',
            LinkID: 265090,
            Value: 'Max van Kampen',
            AttributeID: 1,
          },
          {
            '@id': '/Contact(265091)',
            LinkID: 265091,
            Value: 'Text Alicon',
            AttributeID: 1,
          },
        ];
        const fav = [].concat(item.data.fav).map(item => $(item));
        const isFav = fav.some(item => item === $.user);
        function users() {
          return;
          // TODO: Item Users
          fieldsElement.createElement('DIV', 'row users', [
  					__('To') + ': ',
  					['DIV', 'row aco', userElement],
  				]);
          if (Array.isArray(this.Users)) {
  					this.Users.forEach((row)=>{
  						userElement.push(['A', 'c ' + row.ID, row.Value || ($.getItem(row.tag) ? $.getItem(row.tag).Title : row.ID), {
  							// onclick: Web.Element.onclick,
  							href: '#'+row.tag,
  							// id: row.ID,
  							// innerText: row.Value || ($.getItem(row.tag] ? $.getItem(row.tag].Title : row.ID),
  						}], ';\u00A0');
  					});
  				}
        }
        function printmenu() {
          return;
          // TODO:
          //if (this.printmenu) for (var menuname in this.printmenu) {
          //	menuitem = this.printmenu[menuname];
          //	menuitem.name = menuname;
          //	menuitem.id = this.id;
          //	//menuitem.href = this.href;
          //	menuitem.item = this;
          //	//// //console.debug('MENU ITEM ', menuname);
          //	break;
          //	//// //console.debug('menuitem href', menuitem.href);
          //	//if (this.ref) this.printmenu[menuname].href = this.href+'/'+
          //	if (!menuitem.href) this.printmenu[menuname].onclick = menuitem.ref ? $.url.objbyref(menuitem.ref).e : function(e) {
          //		if (this.menuitem.object) {
          //			if (window[this.menuitem.object]) window[this.menuitem.object].onload(this.menuitem.id);
          //			else window[this.menuitem.script] = document.body.createElement('script', { src: this.menuitem.script, menuitem: this.menuitem, onload: function() { window[this.menuitem.object].onload(this.menuitem.id) } });
          //			return false;
          //		}
          //		if (this.menuitem.href) return true;// document.location.href = this.menuitem.href;
          //		this.menuitem.post = this.menuitem.post || {};
          //		this.menuitem.get = this.menuitem.get || {};
          //		this.menuitem.get.name = this.menuitem.name;
          //		this.menuitem.get.Title = this.menuitem.Title;
          //		this.menuitem.get.id = this.menuitem.id;
          //		//// //console.debug('MENUITEM PRINT', this.menuitem.post, this.menuitem.src);
          //		//if ($.url.byref())
          //		new $.HttpRequest({
          //			menuitem: this.menuitem,
          //			item: this.menuitem.item,
          //			api: this.menuitem.api ? this.menuitem.api : rpt ? this.menuitem.item.class.name + '/' + this.menuitem.id + '/' + this.menuitem.rpt + '.html' : null,
          //			src: this.menuitem.src,
          //			post: this.menuitem.post,
          //			get: this.menuitem.get,
          //			onload: $.Docs.onload
          //		});
          //	};
          //}
        }
        this.showMessages = e => {
          let date;
          let time;
          let author;
          aimClient.api(`/${item.tag}/Messages`)
          .top(100)
          .select('schemaPath,BodyHTML,CreatedDateTime,CreatedByID,CreatedByTitle,files')
          .get()
          .then(body => {
            console.log(body, aimClient.access.sub);
            let el;
            this.messagesElem.text('').append(
              $('summary').text('Messages'),
              $('div').class('oa').append(
                body.value.map(message => {
                  const dt = new Date(message.data.CreatedDateTime);
                  const messageDate = dt.toLocaleDateString();
                  const messageTime = dt.toLocaleTimeString().substr(0,5);
                  const messageAuthor = message.data.CreatedByID;
                  return el = $('div').class('msgbox row', aimClient.access.sub == message.data.CreatedByID ? 'me' : '').append(
                    $('div').append(
                      $('div').class('small').append(
                        author === messageAuthor ? null : $('span').class('author').text(author = messageAuthor),
                        date === messageDate ? null : $('span').text(date = messageDate),
                        time === messageTime ? null : $('span').text(time = messageTime),
                        $('i').class('icn del').on('click', e => {
                          e.target.parentElement.parentElement.remove();
                          message.delete();
                        }),
                      ),
                      $('div').class('body').html(message.BodyHTML || 'Empty'),
                    ),
                  )
                })
              )
            );
            el.scrollIntoView();
          })
        };
        logVisit();
        const itemdata = {};
        let properties;
        function breakdown_data() {
          return aimClient.api(`/${item.tag}`).query('request_type', 'build_breakdown').get().then(body => {
            const data = body.value;
            let items = [];
            (function row(item, level) {
              item.level = level;
              item[item.schemaPath] = item.header0;
              items.push(item);
              data.filter(child => child.data.MasterID === item.ID).forEach(item => row(item, level+1))
            })(data.find(child => child.ID == item.data.ID), 1);
            const schemaNames = items.map(item => item.schemaPath).unique();
            const schemas = [...Object($().schemas()).entries()].filter(([schemaName, schema]) => schemaNames.includes(schemaName));
            const schemaKeys = schemas.map(([schemaName, schema]) => schemaName);
            // properties = ['ID', 'level','schemaPath','schemaName','header0','header1','header2'].concat(...schemas.map(([schemaName, schema]) => schemaName), ...schemas.map(([key, schema]) => Object.keys(schema.properties))).unique();
            const schema_values = {};
            items.forEach(item => {
              let value = '';
              schemaKeys.forEach(schemaName => {
                if (value) {
                  item[schemaName] = schema_values[schemaName] = null;
                } else if (item.schemaPath === schemaName) {
                  value = item[schemaName] = schema_values[schemaName] = item.header0;
                } else {
                  item[schemaName] = schema_values[schemaName];
                }
              })
            });
            return items;
          });
        }
        function build_map(fn) {
          if (itemdata.build_map) {
            $('list').text('').append($('div').text('Generate document'));
            setTimeout(() => fn(itemdata.build_map));
          } else {
            $('list').text('').append($('div').text('Loading data'));
            aimClient.api(`/${item.tag}`).query('request_type', 'build_breakdown').get().then(body => {
              const data = body.value;
              let items = [];
              (function row(item, level) {
                item.level = level;
                item[item.schemaPath] = item.header0;
                items.push(item);
                data.filter(child => child.data.MasterID === item.ID).forEach(item => row(item, level+1))
              })(data.find(child => child.ID == item.data.ID), 1);
              const schemaNames = items.map(item => item.schemaPath).unique();
              const schemas = [...Object($().schemas()).entries()].filter(([schemaName, schema]) => schemaNames.includes(schemaName));
              const schemaKeys = schemas.map(([schemaName, schema]) => schemaName);
              // properties = ['ID', 'level','schemaPath','schemaName','header0','header1','header2'].concat(...schemas.map(([schemaName, schema]) => schemaName), ...schemas.map(([key, schema]) => Object.keys(schema.properties))).unique();
              const schema_values = {};
              items.forEach(item => {
                let value = '';
                schemaKeys.forEach(schemaName => {
                  if (value) {
                    item[schemaName] = schema_values[schemaName] = null;
                  } else if (item.schemaPath === schemaName) {
                    value = item[schemaName] = schema_values[schemaName] = item.header0;
                  } else {
                    item[schemaName] = schema_values[schemaName];
                  }
                })
              });
              fn(itemdata.build_map = items);
            });
          }
        }
        function linkElem(link) {
          const elem = $('span').itemLink(link).append(
            $('button')
            .type('button')
            .on('click', e => {
              e.preventDefault();
              e.stopPropagation();
              elem.remove();
              item.elemTo.emit('change');
            })
          );
          return elem;
        }
        const to = [].concat(item.data.to||[]);

        // console.debug('item.properties', item, item.properties); // DEBUG:

        this.text('').append(
          $('nav').class('row top abs btnbar np').append(
            this.schema === 'Company' ? $('button').class('abtn shop').on('click', e => $.shop.setCustomer.bind(this)) : null,
            $('button').class('abtn refresh r').on('click', e => item.details(true).then(item => $('view').show(item))),
            $('button').class('abtn view').append($('ul').append(
              $('li').class('abtn dashboard').text('Dashbord').on('click', e => this.showDashboard()),
              $('li').class('abtn slide').text('Slideshow').on('click', e => {
                var el = document.documentElement, rfs = el.requestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                rfs.call(el);
                $.show({ sv: this.item.id });
              }),
              $('li').class('abtn model3d').text('Build 3D Model').on('click', e => {
                const elem = $('div').parent($('list')).class('col abs').append(
                  $('div').class('row top abs btnbar').append(
                    $('button').class('abtn icn r refresh').on('click', e => this.rebuild() ),
                    $('button').class('abtn icn close').on('click', e => elem.remove()),
                  ),
                  this.three = $('div').class('col aco').three(
                    this.init = three => (this.rebuild = e => aimClient.api('/'+item.tag).query('three', '').get().then(three.build))()
                  ),
                );
              }),
              $('li').class('abtn network').text('Netwerk').on('click', e => {
                (function init() {
                  const elem = $('div').parent($('list')).class('col abs').append(
                    $('div').class('row top abs btnbar').append(
                      $('button').class('abtn icn r refresh').on('click', e => {
                        elem.remove();
                        init();
                      }),
                      $('button').class('abtn icn close').on('click', e => elem.remove()),
                    ),
                  );
                  aimClient.api(`/${item.tag}`).query('request_type','build_link_data').get().then(
                    body => $('div').class('col aco').parent(elem).style('background:white;').modelDigraph(body)
                  );
                })();
              }),
              !this.srcID ? null : $('li').class('abtn showInherited').attr('title', 'Toon master-class').on('click', e => {
                items.show({ id: this.item.srcID })
              }),
              !this.srcID ? null : $('li').class('abtn clone').attr('title', 'Overnemen class eigenschappen').on('click', e => {
                this.setAttribute('clone', 1, { post: 1 })
              }),
              //revert: { disabled: !this.srcID, Title: 'Revert to inherited', item: this, onclick: function() { this.item.revertToInherited(); } },
              // $('li').class('abtn sbs').text('SBS').on('click', e => {}),
              // $('li').class('abtn').text('Api key').href(`api/?request_type=api_key&sub=${item.ID}`),
              $('li').class('abtn').text('Api key').on('click', e => {
                aimClient.api('/').query('request_type', 'api_key').query('expires_after', 30).post({
                  sub: item.ID,
                  aud: item.ID
                }).get().then(body => {
                  $('dialog').open(true).parent(document.body).text(body);
                  console.log(body);
                })
              }),
              // $('li').class('abtn').text('Secret JSON Unlimited').attr('href', `api/?request_type=secret_json&release&sub=${this.ID}&aud=${$.auth.access.aud}`),
              // $('li').class('abtn doc').text('Breakdown').click(e => build_map(items => $().list(items))),
              $('li').class('abtn doc').text('Breakdown').on('click', e => {
                $().list([]);
                aimClient.api(`/${item.tag}`).query('request_type', 'build_breakdown').get().then(body => {
                  const data = body.value;
                  console.log(data);
                  const topitem = data.find(child => child.ID == item.data.ID);
                  const items = [];
                  (function build(item, tagname) {
                    console.log(item);
                    // if (!item) return;
                    items.push(item);
                    item.data.Tagname = tagname = (tagname ? tagname + '.' : '') + (item.data.Prefix || '') + (item.data.Tag || item.data.Name || '');
                    item.data.children = data
                    .filter(child => child.data.MasterID == item.data.ID)
                    .sort((a,b) => String(a.data.idx||'').localeCompare(b.data.idx||'', undefined, {numeric: true}))
                    .map(child => build(child, tagname));
                    return item;
                  })(topitem);
                  items.forEach(item => {
                    if (item.data && item.data.link) {
                      const link = item.data.link.shift();
                      const linkItem = $(link.LinkID);
                      item.data.LinkTagname = linkItem.data.Tagname;
                      linkItem.data.LinkTagname = item.data.Tagname;
                      // item.data.Linktagname = $(item.data.link.shift().LinkID).data.Tagname;
                    }
                  });
                  // items.sort((a,b) => (a.data.Tagname || '').localeCompare(b.data.Tagname || ''));
                  return $().list(items);
                });
              }),
              $('li').class('abtn doc').text('Doc').on('click', e => {
                (async function init() {
                  const elem = $('div').parent($('list')).class('col abs').append(
                    $('div').class('row top abs btnbar').append(
                      $('button').class('abtn icn r refresh').on('click', e => {
                        elem.remove();
                        init();
                      }),
                      $('button').class('abtn icn close').on('click', e => elem.remove()),
                    ),
                  );
                  breakdown_data().then(e => {
                    const items = e.body.value;
                    console.log(items);
                    const topitem = items.find(child => child.ID == item.data.ID);
                    function chapter(item, level) {
                      // console.log(item.schema, item.schemaPath);
                      // const schemaName = item.schemaPath.split(':').pop();
                      const properties = Object.entries(item.schema.properties)
                      .filter(([propertyName, property])=> item[propertyName])
                      .map(([propertyName, property])=> $('li').class('prop').append(
                        $('label').text(propertyName+': '),item[propertyName],
                      ));
                      return [
                        $('h'+level).text(item.header0),
                        // $('div').text('inleiding'),
                        $('ul').append(properties),
                      ].concat(...items.filter(child => child.data.MasterID === item.ID).map(item => chapter(item, level+1)));
                    }
                    $('div').parent(elem).class('row doc aco').append(
                      (this.docElem = $('div')).class('aco doc-content counter oa').append(
                        chapter(topitem, 1)
                      ),
                      $('div').class('mc-menu right np oa').append(
                        $('div').class('ac-header').text('Table of contents'),
                        $('ul').index(this.docElem)
                      ),
                    )
                  });
                })();
              }),
              // $('li').class('abtn download').text('Data JSON').attr('href', `api/?request_type=data_json&id=${this.ID}`),
              $('a').class('abtn download').text('config_data').href(`https://dms.aliconnect.nl/system/build?response_type=config_data&id=${item.data.ID}&download`),
              $('a').class('abtn download').text('data_v1').href(`https://dms.aliconnect.nl/system/build?response_type=data_v1&id=${item.data.ID}&download`),
            )),
            $('button').class('abtn msg').attr('cnt', item.data.Messages ? item.data.Messages.length : 0).on('click', this.showMessages),
            $('button').class('abtn send').on('click', e => {
              new $.HttpRequest($.config.$, 'GET', `/${this.item.schema}(${this.item.id})?mailing`, e => {
                // //console.debug(this.responseText);
                alert(this.responseText);
              }).send();
              return false;
            }),
            $('button').class('abtn fav').attr('checked', isFav).on('click', e => e => this.fav ^= 1),
            $('button').class('abtn edit').name('edit').on('click', e => this.edit(item)).append(
              $('ul').append(
                // $('li').class('row').append(
                //   $('a').class('aco abtn share').text('share').href('#?prompt=share'),
                // ),
                $('li').class('abtn share').text('share').on('click', e => e.stopPropagation()).on('click', e => $().prompt('share_item')),
                $('li').class('abtn read').text('readonly').attr('disabled', '').on('click', e => e.stopPropagation()),
                $('li').class('abtn public').text('public').on('click', e => this.scope = 'private').on('click', e => e.stopPropagation()),
                $('li').class('abtn private').text('private').on('click', e => this.scope = 'public').on('click', e => e.stopPropagation()),
                $('li').class('abtn upload mailimport').text('Importeer mail uit outlook')
                // .attr('hidden', !$.Aliconnector.connected)
                .on('click', e => external.Mailimport())
                .on('click', e => e.stopPropagation()),
                $('li').class('abtn clone').text('clone').on('click', e => item.clone()),
                $('li').class('abtn del').text('delete').on('click', e => item.delete()),
              ),
            ),
            $('button').class('abtn popout').on('click', e => {
              const rect = this.elem.getBoundingClientRect();
              item.popout(window.screenX+rect.x, window.screenY+rect.y+window.outerHeight-window.innerHeight, rect.width, rect.height)
            }),
            $('button').class('abtn close').name('close').on('click', e => {
              this.text('');
              delete ItemSelected;
              $.his.replaceUrl(document.location.pathname.replace(/\/id\/.*/,'')+'?'+document.location.search);
            }),
          ),
          this.header(item),
          this.main = $('main')
          .class('aco oa')
          .on('dragover', e => {
            e.preventDefault();
          })
          .on('drop', e => {
            e.stopPropagation();
            const eventData = e.dataTransfer || e.clipboardData;
            const type = $.his.keyEvent && $.his.keyEvent.shiftKey ? 'link' : e.type;
            if (data = eventData.getData("aim/items")) {
              data = JSON.parse(data);
              data.type = data.type || (e.ctrlKey ? 'copy' : 'cut');
              //console.log('ja1', data.value, data.value.length);
              data.value.forEach(link => {
                link = Item.get(link.tag);
                console.log(([].concat(item.data.link).shift()||{}).AttributeID);
                item.attr('link', {
                  AttributeID: e.ctrlKey ? null : ([].concat(item.data.link).shift()||{}).AttributeID,
                  LinkID: link.data.ID,
                  max: 999,
                  type: e.ctrlKey ? 'append' : '',
                }, true)
                .then(item => item.details(true).then(item => $('view').show(item)));
              });
              //console.log('DROP', data.value);
            } else if (eventData.files) {
              e.preventDefault();
              [...eventData.files].forEach(item.elemFiles.appendFile)
            }
          })
          .append(
            item.elemTo = $('div')
            .class('row editlinks to')
            .text('to:')
            .on('change', e => {
              const items = [...e.target.getElementsByTagName('A')].map(e=>e.item);
              items.filter(item => !to.find(to => to.LinkID == item.ID)).forEach(to => item.to = { LinkID: to.ID });
              to.filter(to => !items.find(item => to.LinkID == item.ID)).forEach(to => item.to = { AttributeID: to.AttributeID, LinkID: null, Value: null });
            })
            .on('drop', e => {
              e.preventDefault();
              e.stopPropagation();
              const eventData = e.dataTransfer || e.clipboardData;
              const type = $.his.keyEvent && $.his.keyEvent.shiftKey ? 'link' : e.type;
              if (data = eventData.getData("aim/items")) {
                data = JSON.parse(data);
                data.type = data.type || (e.ctrlKey ? 'copy' : 'cut');
                data.value.forEach(item => e.target.is.append(linkElem(item)));
                e.target.is.emit('change')
              }
            })
            .append(to.map(linkElem)),
            item.elemFiles = $('div').files(item, 'Files'),
          )
          .properties(item.properties),
          this.messagesElem = $('details').class('message-list').attr('open', 1),
          $('form').class('message-new col msgbox')
          .on('keydown', e => {
            if (e.keyPressed === 'Enter') {
              e.preventDefault();
              e.target.dispatchEvent(new Event('submit'));
            }
          })
          .on('submit', e => {
            e.preventDefault();
            let html = this.msgElem.elem.innerHTML.replace(/<p><br><\/p>/g,'');
            if (!html) return;
            e.target.BodyHTML.value = html;
            this.msgElem.elem.innerHTML = '<p><br></p>';
            aimClient.api(`/${item.tag}/Messages`).post(e.target).then(body => this.showMessages());
            return false;
          })
          .append(
            // $().files(),
            $('input').type('hidden').name('BodyHTML'),
            $('input').type('hidden').name('masterId').value(this.id),
            $('div').class('row aco msgbox').append(
              this.msgElem = $('div').class('aco').html('<p><br></p>').placeholder('Write message or add attachements').htmledit(),
              $('div').class('row np').append(
                $('button').class('abtn send').type('submit'),
                $('button').class('abtn image').type('button').attr('accept', 'image/*').on('click', e => {}),
                $('button').class('abtn image').type('button').attr('accept', '').on('click', e => {}),
              )
            )
          )
        );
        // console.log('FILES',item, item.data.files);
        //
        //
        // if (item.data.files) {
        //   JSON.parse(item.data.files).forEach(item.elemFiles.appendFile)
        // }
        // return console.log('SHOW', item);
        $.clipboard.setItem([item], 'selected', '');
        let link;
        if (item.data.link) {
          // console.log(item.data.link);
          link = [].concat(item.data.link).map(link => Object.assign(link, {item: $(link)}));
          this.main.append(link.map(link => link.item.schemaName).unique().map(
            schemaName => $('details')
            .class('col')
            .open(localStorage.getItem('detailsLink'))
            .on('toggle', e => localStorage.setItem('detailsLink', e.target.open))
            .append(
              $('summary').text(schemaName),
              $('div')
              .class('row editlinks')
              .append(
                link.filter(link => link.item.schemaName === schemaName).map(
                  link => $('span').itemLink(link).append(
                    $('button')
                    .type('button')
                    .on('click', e => {
                      e.preventDefault();
                      e.stopPropagation();
                      item.attr('link', {
                        AttributeID: link.AttributeID,
                        LinkID: null,
                        Value: null,
                      }, true)
                      .then(item => item.details(true).then(item => $('view').show(item)));
                    })
                  )),
                )
              )
          ));
        }
        if (item.onloadEdit = item.onloadEdit || doEdit) {
  				return this.edit(item);
  			}
      });
      return this;
    },},
    showpage: { value: function (item) {
      item.details().then(item => {
        $('list').text('').append(
          this.elemDiv = $('div').class('aco col').append(
            $('h1').text(item.header0),
            $('div').text(item.header1),
            $('div').html(item.BodyHTML||''),
          )
        );
        aimClient.api(`/${item.tag}/children`).select('*').get().then(async body => {
          console.log(body);
          this.elemDiv.append(
            (await item.children).map(item => $('div').append(
              $('h2').text(item.header0),
              $('div').text(item.header1),
              $('div').html(item.BodyHTML||''),
            ))
          );
        });
      })
    },},
    showMenuTop: { value: async function (item) {
      const children = await item.children;
      if (this.webpage = children.find(item => item instanceof Webpage)) {
        aimClient.api(`/${this.webpage.tag}/children`).query('level', 3).get().then(async body => {
          $.his.elem.menuList = $('ul').parent(this.elem);
          function addChildren(elem, item, level) {
            if (Array.isArray(item.data.Children)) {
              item.data.Children.forEach(data => {
                const item = $(data);
                const elemLi = $('li').parent(elem);
                $('a').parent(elemLi).text(item.header0).on('click', e => {
                  e.stopPropagation();
                  $.his.elem.menuList.style('display:none;');
                  $('view').showpage(item);
                });
                if (level < 3) {
                  addChildren($('ul').parent(elemLi), item, level + 1);
                }
              });
            }
          }
          addChildren($.his.elem.menuList, this.webpage, 1);
          this.on('mouseenter', e => $.his.elem.menuList.style(''))
        });
      }
    },},
    showLinks: { value: function (item) {
			aimClient.api(`/${item.tag}`).query('request_type','build_link_data').get().then(body => {
				//console.log(e.body);
				$('div').style('display:block;width:100%;height:400px;background:white;border:solid 1px red;')
				.attr('height',400)
				.width(400)
				.parent(this.main)
				// .modelLinks(e.body)
				// .modelTraverse(e.body)
				.modelDigraph(body)
			});
		},},

    // sort: {
    //   Title: function(a, b) { return String(a.Title.toLowerCase()).localeCompare(String(b.Title.toLowerCase())) },
    //   index: function(a, b) {
    //     if (a.index != undefined && b.index == undefined) return -1;
    //     if (a.index != undefined && b.index == undefined) return 1;
    //     if (a.index > b.index) return 1;
    //     if (a.index < b.index) return -1;
    //     return 0;
    //   },
    //   id: function(a, b) {
    //     if (a.id < b.id)
    //     return -1;
    //     if (a.id > b.id)
    //     return 1;
    //     return 0;
    //   },
    //   filter: function(a, b) {
    //     if (a.cnt > 0 && b.cnt == 0) return -1;
    //     if (a.cnt == 0 && b.cnt > 0) return 1;
    //     return a.value.localeCompare(b.value, {}, 'numeric');
    //   },
    //   value: function(a, b) {
    //     var va = (isNaN(a.value)) ? a.value.toLowerCase() : a.value;
    //     var vb = (isNaN(b.value)) ? b.value.toLowerCase() : b.value;
    //     if (va < vb) return -1;
    //     if (va > vb) return 1;
    //     return 0;
    //   },
    //   prijs: function(a, b) {
    //     if (Number(isnull(a.Prijs, 0)) < Number(isnull(b.Prijs, 0)))
    //     return -1;
    //     if (Number(isnull(a.Prijs, 0)) > Number(isnull(b.Prijs, 0)))
    //     return 1;
    //     return 0;
    //   },
    //   prijsLaagHoog: function(a, b) {
    //     if (Number(isnull(a.field.Prijs.Value, 0)) < Number(isnull(b.field.Prijs.Value, 0)))
    //     return -1;
    //     if (Number(isnull(a.field.Prijs.Value, 0)) > Number(isnull(b.field.Prijs.Value, 0)))
    //     return 1;
    //     return 0;
    //   },
    //   prijsHoogLaag: function(a, b) {
    //     if (Number(isnull(a.field.Prijs.Value, 0)) < Number(isnull(b.field.Prijs.Value, 0)))
    //     return 1;
    //     if (Number(isnull(a.field.Prijs.Value, 0)) > Number(isnull(b.field.Prijs.Value, 0)))
    //     return -1;
    //     return 0;
    //   },
    //   nameAz: function(a, b) {
    //     if ((a.field.Name.Value || '').toLowerCase() < (b.field.Name.Value || '').toLowerCase())
    //     return -1;
    //     if ((a.field.Name.Value || '').toLowerCase() > (b.field.Name.Value || '').toLowerCase())
    //     return 1;
    //     return 0;
    //   },
    //   nameZa: function(a, b) {
    //     if ((a.field.Name.Value || '').toLowerCase() < (b.field.Name.Value || '').toLowerCase())
    //     return 1;
    //     if ((a.field.Name.Value || '').toLowerCase() > (b.field.Name.Value || '').toLowerCase())
    //     return -1;
    //     return 0;
    //   },
    //   prijsdesc: function(a, b) {
    //     if (Number(isnull(a.Prijs, 0)) < Number(isnull(b.Prijs, 0)))
    //     return 1;
    //     if (Number(isnull(a.Prijs, 0)) > Number(isnull(b.Prijs, 0)))
    //     return -1;
    //     return 0;
    //   },
    //   idx1: function(a, b) {
    //     if (a.index < b.index)
    //     return -1;
    //     if (a.index > b.index)
    //     return 1;
    //     return 0;
    //   },
    //   az: function(a, b) {
    //     if (isnull(a.Name, '') < isnull(b.Name, ''))
    //     return 1;
    //     if (isnull(a.Name, '') > isnull(b.Name, ''))
    //     return -1;
    //     return 0;
    //   },
    //   za: function(a, b) {
    //     if (isnull(a.Name, '') < isnull(b.Name, ''))
    //     return -1;
    //     if (isnull(a.Name, '') > isnull(b.Name, ''))
    //     return 1;
    //     return 0;
    //   },
    //   cntdn: function(a, b) {
    //     if (a.cnt < b.cnt)
    //     return 1;
    //     if (a.cnt > b.cnt)
    //     return -1;
    //     return 0;
    //   },
    // },

    statusbar: { value: function () {
      $.his.elem.statusbar = this.class('row statusbar np').append(
        ['ws','aliconnector','http','is_checked','clipboard','pos','source','target','main'].map(name => this[name] = $('span').class(name)),
      );
      this.progress = $('progress').parent(this.main.class('aco'));
      return this;
    },},
    setProperty: { value: function (selector, context) {
      this.elem.style.setProperty('--'+selector, context);
      return this;
    },},
    slider: { value: function (element){
      console.error('SLIDER');
  		const elements = [...document.getElementsByClassName('aimage')].filter(elem => elem.is.has('ofile'));
      let imageNr = elements.indexOf(element);
  		elements.forEach(element => { if (element.pause) element.pause() });
  		// let imageNr = 0;
      this.show = element => {
        const elem = element.is;
        const ofile = elem.get('ofile') || {};
        const src = ofile.src;
        console.log(imageNr, elements.length, src);
        this.titleElem.text(
          element.alt,
          ofile.lastmodifieddate ? new Date(ofile.lastmodifieddate).toLocaleString(): null,
  				ofile.size ? ofile.size + 'kB': null,
  			);
  			if (this.srcElem) {
  				this.srcElem.remove();
  			}
        this.scrollPlay = () => {
          this.srcElem.elem.currentTime = frameNumber;
          //window.requestAnimationFrame(scrollPlay);
        };
        if (ofile.src.match(/jpg|png|bmp|jpeg|gif|bin/i)) {
          this.srcElem = $('img')
          .parent(this.containerElem)
          .class(element.className)
          .src(ofile.src)
        } else if (ofile.src.match(/3ds/i)) {
          this.srcElem = $('div')
          .parent(this.containerElem)
          .class(element.className)
          .tds({src:ofile.src, hasControls: true})
        } else if (ofile.src.match(/mp4|webm|mov/i)) {
          frameNumber = 0;
          this.srcElem = $('video')
          .parent(this.containerElem)
          .class(element.className)
          .src(ofile.src)
          .controls('')
          .autobuffer('')
          .preload('')
          .autoplay('')
          .on('click', e => {
            if (!this.srcElem.elem.paused) {
              this.srcElem.elem.pause();
              frameNumber = this.srcElem.elem.currentTime;
            } else {
              this.srcElem.elem.play();
            }
          })
          .on('wheel', e => {
            if (!this.srcElem.elem.paused) {
              this.srcElem.elem.pause();
              frameNumber = this.srcElem.elem.currentTime;
            }
            frameNumber += e.deltaY / 1000;
            window.requestAnimationFrame(this.scrollPlay);
          });
          window.requestAnimationFrame(this.scrollPlay);
          // this.srcElement.onended = e => {
          // 	this.next();
          // };
        }
      };
      this.prior = e => {
        console.warn(imageNr, elements.length);
        this.show(elements[imageNr = imageNr ? imageNr - 1 : elements.length - 1]);
  		};
  		this.next = e => {
        console.warn(imageNr, elements.length);
  			this.show(elements[imageNr = imageNr < elements.length - 1 ? imageNr + 1 : 0]);
  		};
  		const onkeydown = e => {
  			if (e.code === "ArrowLeft") {
          e.stopPropagation(e.preventDefault(this.prior(e)))
        } else if (e.code === "ArrowRight") {
          e.stopPropagation(e.preventDefault(this.next(e)))
        } else if (e.code === "Escape") {
          e.stopPropagation(e.preventDefault(this.closeSlider(e)))
        }
  		};
  		document.addEventListener('keydown', onkeydown, true);
  		this.closeSlider = e => {
  			document.removeEventListener('keydown', onkeydown, true);
  			this.sliderElem.remove();
  			// this.elem = null;
  		};
      this.sliderElem = $('div')
      .class('imageSlider')
      .parent(this.elem)
      .on('click', e => e.stopPropagation())
      .append(
        $('div').class('row top').append(
          $('button').class('abtn icn close abs').on('click', this.closeSlider),
          this.titleElem = $('div').class('aco'),
        ),
        this.containerElem = $('div').class('Image').append(
          $('div').class('sliderButton prior').on('click', this.prior).append(
            $('span'),
          ),
          $('div').class('sliderButton next').on('click', this.next).append(
            $('span'),
          ),
        ),
      );
  		// swipedetect(divElement, swipedir => {
  		// 	if (swipedir === 'left') next();
  		// 	else if (swipedir === 'right') prior();
  		// });
      this.show(element);
    },},
    text: { value: function (value) {
			if (arguments.length) {
        this.elem.innerText = [].concat(...arguments).join(' ');
        return this;
			}
      return this.elem.innerText;
		},},
    tds: { value: function (options = {}) {
      var container, controls;
      var camera, scene, renderer;
      container = this.elem;
      // console.log(this.elem, this.width(), this.height());
      // container.style = 'width:120px;';
      const width = this.width() || container.offsetWidth;
      const height = this.height() || container.offsetHeight;
      // console.log([...document.getElementsByTagName('SCRIPT')].find(s => s.src === '/lib/three/examples/js/controls/TrackballControls.js'));
      (async () => {
        await importScript('three/build/three.js');
        await importScript('three/examples/js/controls/TrackballControls.js');
        await importScript('three/examples/js/loaders/TDSLoader.js');
        console.log(container.offsetWidth, container.offsetHeight);
        camera = new THREE.PerspectiveCamera( 60, width / height, 0.1, 10 );
        camera.position.z = 2;
        scene = new THREE.Scene();
        scene.add( new THREE.HemisphereLight() );
        var directionalLight = new THREE.DirectionalLight( 0xffeedd );
        directionalLight.position.set( 0, 0, 2 );
        scene.add( directionalLight );
        //3ds files dont store normal maps
        // var loader = new THREE.TextureLoader();
        // // var normal = loader.load( '/lib/three/examples/models/3ds/portalgun/textures/normal.jpg' );
        // var normal = loader.load( '/shared/upload/normal.jpg' );
        var loader = new THREE.TDSLoader( );
        // loader.setResourcePath( '/lib/three/examples/models/3ds/portalgun/textures/' );
        // loader.setResourcePath( '/shared/upload/' );
        // loader.load( '/lib/three/examples/models/3ds/portalgun/portalgun.3ds', function ( object ) {
        loader.load( options.src, function ( object ) {
          // object.traverse( function ( child ) {
          //
          // 	if ( child.isMesh ) {
          //
          // 		child.material.normalMap = normal;
          //
          // 	}
          //
          // } );
          scene.add( object );
        } );
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        // renderer.setSize( width, height );
        this.append( renderer.domElement );
        controls = new THREE.TrackballControls( camera, renderer.domElement );
        // console.log(window);
        $(window).on('resize', resize, false).emit('resize');
        setTimeout(() => {
          renderer.render( scene, camera );
        },200);
        if (options.hasControls) {
          animate();
        }
        // requestAnimationFrame( animate );
        // animate();
      })();
			function resize() {
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.setSize( width, height );
			}
			function animate() {
				controls.update();
				renderer.render( scene, camera );
				requestAnimationFrame( animate );
			}
      return this;
    },},
    treelist: { value: function (){
			if (!Array.isArray(par.treelist)) return;
			var treelist = treelist || {};
			par.treelist.sort($.sort.index);
			par.treelist.forEach(row => {
				var elLI = el.createElement('LI', 'col', treelist.li || {
					onmouseenter: e => elLI.hasAttribute('open') ? elLI.setAttribute('open', 1) : null,
					onmouseleave: e => elLI.hasAttribute('open') ? elLI.setAttribute('open', 0) : null,
					onclick: e => elLI.hasAttribute('open') ? elLI.setAttribute('open', 0) : null,
					draggable: 1
				});
				var elA = elLI.createElement('A', { href: `#${row.tag}`, href: '#/id/' + btoa(row['@id']), innerText: row.Title, });
				row.Children = row.Children || row.items;
				if (row.Children && row.Children.length) {
					elLI.setAttribute('open', treelist.opendefault || 0);
					elLI.createElement('UL', 'bg', {open: 1, treelist: row.Children});
				}
			});
		},},
    ttext: { value: function (value){
      this.elem.innerText = [].concat(...arguments).map(s => __(s)).join(' ');
			return this;
		},},
    toggle: { value: function () {
			this.open(!this.open());
      return this;
    },},
    toHtml: { value: function () {
			return web.html(...arguments);
		},},
    tree: { value: function (){
      $().tree(this);
      return this;
    },},
    type: { value: function (){
			return this.attr('type', ...arguments);
		},},
    openLinkInIframe: { value: function (src) {
      return this.append(
        this.iframePanelElem = $('div').class('col aco iframe').append(
          $('div').class('row top').append(
            $('button').class('abtn download').href(src).download().target("_blank"),
            $('button').class('abtn print').on('click', e => this.iframeElem.elem.contentWindow.print()),
            $('button').class('abtn close').on('click', e => this.iframePanelElem.remove()),
          ),
          this.iframeElem = $('iframe').class('aco').src(src),
        )
      );
    },},
    openHtmlInIframe: { value: function (html) {
      this.append(
        this.iframePanelElem = $('div').class('col aco iframe').append(
          $('div').class('row top').append(
            $('button').class('abtn download').href(src).download().target("_blank"),
            $('button').class('abtn print').on('click', e => this.iframeElem.elem.contentWindow.print()),
            $('button').class('abtn close').on('click', e => this.iframePanelElem.remove()),
          ),
          this.iframeElem = $('iframe').class('aco'),
        )
      );
      const doc = this.iframeElem.elem.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
      return this;
    },},
    window: { value: function (e) {
			this.url = apiorigin + "/" + $.config.$.domain + "/" + $.version + "/app/form/?select*&schema=" + this.schema + "&id=" + (this.detailID || this.id) + (this.uid ? "&uid=" + this.uid : "");
			if ($.his.handles[this.url]) {
				$.his.handles[this.url].focus();
			}
			else {
				$.his.handles[this.url] = window.open(this.url, this.url, 'width=600, height=800, left=' + (e.screenX || 0) + ', top=' + (e.screenY || 0));
				$.his.handles[this.url].name = this.url;
				$.his.handles[this.url].onbeforeunload = function() { $.his.handles[this.name] = null };
			}
		},},
		sampleWindow: { value: function (url) {
			const height = 600;
			const width = 1200;
			let rect = document.body.getBoundingClientRect();
			let top = window.screenTop + window.innerHeight - height + 50 - 20;
			let left = window.screenLeft + window.innerWidth - width - 20;
			return window.open(url, 'sample', `top=${top},left=${left},width=${width},height=${height},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`);
		},},
		tileboard: { value: function (menuname) {
			if (menuname) return ($.$.menu.items[menuname]) ? $.tileboard.call($.$.menu.items[menuname]) : null;
			if (this.el) return $.elBrd.appendChild(this.el);
			with (this.el = $.elBrd.createElement('DIV', 'col aco start aimitems')) {
				with (createElement('DIV', 'row')) {
					for (var menuname in this.items) {
						var menuitem = this.items[menuname];
						if (menuitem) {
							with (menuitem.elTegel = createElement('DIV', { className: 'col card' })) {
								menuitem.get = menuitem.get || { bv: menuname };
								createElement('DIV', { className: 'row bgd' }).createElement('A', {
									name: menuname, className: 'row aco abtn icn ' + menuitem.className, innerText: menuitem.Title, menuitem: menuitem,
									par: menuitem.get,
									onclick: Element.onclick,
									//href: '#' + $.url.stringify(menuitem.get || { bv: menuname })
								});
								if (menuitem.showbody) menuitem.showbody();
								for (var itemname in menuitem.items) {
									var item = $.$.menu.items[itemname];
									if (item) {
										item.elLink = createElement('DIV', { className: 'row bgd' }).createElement('A', {
											name: itemname, className: 'row aco abtn icn ' + item.className, innerText: item.Title, menuitem: item,
											//par: { mn: this.name },
											par: item.get,
											onclick: Element.onclick,
											//href: '#' + $.url.stringify({ mn: itemname })
										});
										if (item.showtitle) item.showtitle();
									}
								}
							}
						}
					}
					for (var i = 0; i < 4; i++) createElement('DIV', { className: 'card ghost' });
				}
			}
		},},
    panel: { value: function (parent) {
      return this.parent(parent || $('list')).class('col abs').append(
        this.elemBar = $('div').class('row top abs btnbar').append(
          $('span').class('aco'),
          $('button').class('abtn close').on('click', e => this.elem.remove()),
        ),
        this.elemMain = $('main').class('aco oa'),
      );
      // return this.parent($('list')).class('col abs').append(
      //   this.elemBar = $('div').class('row top abs btnbar').append(
      //     $('span').class('aco'),
      //     $('button').class('abtn close').on('click', e => this.elem.remove()),
      //   ),
      //   this.elemMain = $('main').class('aco oa'),
      // );
    },},
	});
  [
    'parentElement',
    'nextSibling'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    get() {
      return this.elem[name] ? this.elem[name].is : null;
    },
    enumerable: true,
    configurable: true,
  }));
  [
    'default',
    'autoplay'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function attr() {
      return this.attr(name, '');
    }
  }));
  [
    'focus',
    'select'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function fn() {
      // console.log(name, typeof this.elem[name]);
      this.elem[name](...arguments);
      // if (typeof this.elem[name] === 'function'){
      //   this.elem[name](...arguments);
      // }
      return this;
    }
  }));
  [
    'draggable'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function attrTrue() {
      return this.attr(name, true);
    }
  }));
  [
    'checked',
    'disabled',
    'hasChildren',
    'selected'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function attrIfTrue(value) {
      return this.attr(name, value ? '' : null)
    }
  }));
  [
    'accept',
    'accesskey',
    'action',
    'align',
    'allow',
    'alt',
    'async',
    'autocapitalize',
    'autocomplete',
    'autofocus',
    'background',
    'bgcolor',
    'border',
    'buffered',
    'capture',
    'challenge',
    'charset',
    'cite',
    // 'class',
    // 'code',
    'codebase',
    'color',
    'cols',
    'colspan',
    'content',
    'contenteditable',
    // 'contextmenu',
    'controls',
    'coords',
    'crossorigin',
    'csp',
    'data',
    'datetime',
    'decoding',
    'defer',
    'dir',
    'dirname',
    // 'displayvalue',
    'download',
    'enctype',
    'enterkeyhint',
    'for',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'headers',
    'height',
    'hidden',
    'high',
    'href',
    'hreflang',
    'hotkey',
    'icon',
    // 'id',
    'importance',
    'integrity',
    'intrinsicsize',
    'inputmode',
    'ismap',
    'itemprop',
    'keytype',
    'kind',
    'label',
    'lang',
    'language',
    'loading',
    // 'list',
    'loop',
    'low',
    'manifest',
    'max',
    'maxlength',
    'minlength',
    'media',
    'method',
    'min',
    'multiple',
    'muted',
    'name',
    'novalidate',
    // 'open',
    'optimum',
    'pattern',
    'ping',
    'placeholder',
    'poster',
    'preload',
    'radiogroup',
    'readonly',
    'referrerpolicy',
    'rel',
    'required',
    'reversed',
    'rows',
    'rowspan',
    'sandbox',
    'scope',
    'scoped',
    'shape',
    'size',
    'sizes',
    'slot',
    'span',
    'spellcheck',
    'src',
    'srcdoc',
    'srclang',
    'srcset',
    'start',
    'step',
    'style',
    'summary',
    'tabindex',
    'target',
    // 'tag',
    'title',
    'translate',
    // 'type',
    'usemap',
    'value',
    'width',
    'wrap'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function attrValue() {
      return this.attr(name, ...arguments);
    }
  }));
  [
    'click',
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function exec() {
      this.elem[name](...arguments);
      return this;
    }
  }));
  [
    'submit',
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function emit() {
      this.emit(name, ...arguments);
      return this;
    }
  }));

  function Clipboard() {}
  Object.defineProperties(Clipboard.prototype, {
    undo: { value: function() {
      //console.debug('UNDO', $.his.updateList);
      if (this.undoData = $.his.updateList.shift()) {
        this.undoData.Value.reverse().forEach(function(row) {
          if (row.eventType == 'paste') row.eventType = 'cut';
          else if (row.eventType == 'cut') row.eventType = 'paste';
        });
        this.undoData.from = true;
        $.data.update(this.undoData, true);
      }
    },},
    update: { value: function(data, targetItem, eventType) {
      //if (!data || !targetItem) return false;
      if (!data) return false;
      if (typeof data == 'string') data = JSON.parse(data);
      if (data.Value) {
        //var updateAction = '';
        if (!data.from) $.his.updateList.unshift(data); // Add data to update history list
        data.Value.forEach(function(row, i, rows) {
          var item = Item.create(row.id);
          row.eventType = row.eventType || eventType;
          ////console.debug("UPDATE", eventType, row.eventType, row, targetItem, item);
          if (!item) return;
          switch (eventType || row.eventType) {
            case 'copy':
            targetItem.appendItem(null, { schema: item.schema, Title: item.Title, userID: 0, srcID: item.id }, null, true);
            break;
            case 'link':
            //console.debug('LINK', item);
            new $.HttpRequest($.config.$, 'POST', '/' + targetItem.tag + '/link', { itemID: item.id } ).send();
            // targetItem.appendChild(null, { schema: item.schema, Title: item.Title, detailID: item.id }, null, true);
            break;
            case 'cut':
            ////console.debug('CUT', row.masterID, item.masterID);
            if (row.masterID != item.masterID) {
              //console.debug('NO CUT', row.masterID, item.masterID);
              return;
            }
            if (item.master && item.master.children && item.master.children.length) {
              item.master.children.splice(item.master.children.indexOf(item), 1);
              item.master.children.forEach(function(item, i) { item.index = i });
            }
            if (item.elemTreeLi) item.elemTreeLi.parentElement.removeChild(item.elemTreeLi);
            if (item.elemListLi && item.elemListLi.parentElement) item.elemListLi.parentElement.removeChild(item.elemListLi);
            if (targetItem) {
              ////console.debug('MOVE TO');
              if (targetItem.masterID == targetItem.srcID) {
                //target isClass en verplaatsen: ITEM wordt afgeleid van nieuwe CLASS
                //item.masterID = item.srcID = row.srcID = row.masterID = targetItem.id;
                //console.debug('MOVE TO CLASS', targetItem, item.srcID = row.srcID = item.masterID = row.masterID = row[item.getPropertyAttributeName('masterID')] = targetItem.id, item.master);
                var propertyAttributeName = item.getPropertyAttributeName('srcID');
                if (propertyAttributeName) row[propertyAttributeName] = { itemID: row.srcID };
                var propertyAttributeName = item.getPropertyAttributeName('masterID');
                if (propertyAttributeName) row[propertyAttributeName] = { itemID: row.masterID };
              }
              else {
                //console.debug('MOVE TO', targetItem.elLI, item.masterID = row.masterID = row[item.getPropertyAttributeName('masterID')] = targetItem.id, item.master);
              }
              ////Item isClass en target !isClass, dus verplaatsen en ITEM wordt afgeleid van nieuwe CLASS
              //if (row.masterID == row.srcID && targetItem.masterID != targetItem.srcID && eventType=="paste") item.masterID = item.srcID = row.srcID = row.masterID = targetItem.id;
              //item.masterID = targetItem.id;
              if (item.master) {
                item.master.children = item.master.children || [];
                item.master.children.push(item);
                if (item.master.elemTreeLi.elemTreeUl) item.appendTo(item.master.elemTreeLi.elemTreeUl);
              }
            }
            $.Selection.cancel();
            break;
            //case 'paste':
            //	if (row.masterID) {
            //		item.masterID = row.masterID;
            //		if (item.master) {
            //			if (row.masterID == row.srcID && item.master.masterID == item.master.srcID);
            //			if (row.masterID == row.srcID && item.master.masterID == item.master.srcID);
            //			item.master.children.push(item);
            //			if (item.master.elemTreeLi.elemTreeUl) item.appendTo(item.master.elemTreeLi.elemTreeUl);
            //		}
            //	}
            //	break;
            default:
            break;
          }
        });
        ////console.debug('UPDATE', data);
        //return true;
        // @todo: mkan, versturen via ws
        // if (!data.from) $.ws.send(Object.assign({ post: 1, to: { host: $.config.$.auth.accessToken.aud } }, data));
        return true;
      }
    },},
    cancel: { value: function() {
      //console.debug($.his.items.oncancel);
      return $.his.items.oncancel && $.his.items.oncancel.length ? $.his.items.oncancel.pop()() : null;
    },},
    oncancel: { value: function(fn) {
      const oncancel = $.his.items.oncancel = $.his.items.oncancel || [];
      if (oncancel.includes(fn)) {
        oncancel.splice(oncancel.indexOf(fn), 1);
      }
      oncancel.push(fn);
    },},
    reload: { value: function(href) {
      //console.error('$.reload', href);
      setTimeout(() => {
        if (href) document.location.href = href;
        else document.location.reload();
      },0);
    },},
    // attr(items, attributeName, value) {
    // 	//console.debug(items, attributeName, value, this[attributeName]);
    // 	if (this[attributeName]) {
    // 		this[attributeName].forEach(item => {
    // 			Object.values(item).filter(value => value instanceof Elem).forEach(selector => selector.attr(attributeName, null))
    // 		})
    // 	}
    // 	items.forEach(item => {
    // 		Object.values(item).filter(value => value instanceof Elem).forEach(selector => selector.attr(attributeName, value))
    // 	})
    // 	this[attributeName] = items;
    // },
    items: { value: [], },
    setItem: { value: function(item, attributeName, value) {
      if (!item) throw 'no item';
      e = window.event;
      let items = this[attributeName] || [];
      items.forEach(item => item.setAttribute ? item.setAttribute(attributeName, null) : null);
      // this.items.forEach(item => item.setAttribute(attributeName));
      // $.attr(this.items,'checked');
      // $.attr(this.items,'clipboard');
      if (item) {
        if (Array.isArray(item)) {
          items = item;
          this.itemFocussed = item[0];
        } else {
          if (!e.altKey) {
            if (e.ctrlKey) {
              if (e.shiftKey) {
                // !ALT+CTRL+SHIFT
              } else {
                // !ALT+CTRL+!SHIFT
                items.push(item);
              }
            } else if (e.shiftKey) {
              // !ALT+!CTRL+SHIFT
              // if (this.items.length) {
              // 	//console.error ('find first elem', e.path);
              //
              // }
              items.push(item); // lijst
            } else {
              // !ALT+!CTRL+!SHIFT
              items = [item];
            }
          }
        }
        // items.forEach(item => item.setAttribute(attributeName, this.items.length));
      } else {
        items = [];
      }
      // //console.debug(item);
      value = items.length;
      $().status('is_checked', value);
      items.forEach(item => {
        Object.values(item)
        .filter(value => value instanceof Elem)
        .forEach(selector => selector.attr(attributeName, value))
      });
      this[attributeName] = items;
      return this;
    },},
    length: { get() {
      return this.items.length;
    },},
    push: { value: function(item) {
      if (!this.items.includes(item)) {
        this.items.push(item);
      }
    },},
    copy: { value: function(e) {
      const selection = window.getSelection();
      if (selection.focusNode.nodeType === 3) {
        return;
      }
      // console.log('CLIPBOARD', e.type, selection, selection.focusNode.nodeType, selection.focusNode, selection.ancherNode, selection.extendNode, selection.baseNode);
      if(document.activeElement.isContentEditable || ['INPUT'].includes(document.activeElement.tagName)) {
        return;
      }
      let type = '';
      if (this.clipboardItems) {
        this.clipboardItems.forEach(item => item.setAttribute('clipboard'));
        this.clipboardItems = [];
      }
      if (e) {
        e.preventDefault();
        if (this.data) {
          e.clipboardData.setData('application/json', JSON.stringify(this.data));
          e.clipboardData.setData('Text', JSON.stringify(this.data));
          this.data = null;
        } else {
          type = e.type;
          const items = this.clipboardItems = this.checked;
          items.forEach(item => item.setAttribute('clipboard', type));
          const data = {type: type, value: items.map(item => {return { tag: item.tag, title: item.title }})};
          e.clipboardData.setData('Aim/items', JSON.stringify(data));
          e.clipboardData.setData('text', items.map(Item.toText).join('\n'));
          e.clipboardData.setData('text/html', items.map(Item.toHtml).join(''));
          $().status('clipboard', `${type}: ${this.clipboardItems.length}`);
        }
      }
    },},
    remove: { value: function(item) {
      console.debug('REMOVE');
      if (this.items.includes(item)) {
        this.items.splice(this.items.indexOf(item), 1);
      }
    },},
    cancel: { value: function(e){
      this.setItem([]);
    },},
    clear: { value: function(e){
      //console.debug('clear');
      $.attr(this.items,'clipboard');
      this.items = [this.itemFocussed];
      document.execCommand('copy');
      // this.setItem([]);
      return;
    },},
    paste: { value: function(e) {
    },},
    link: { value: function() {
      for (var i = 0, o; o = $.selapi.item[i]; i++) {
        //console.debug(o);
      }
    },},
    delete: { value: function() {
      for (var i = 0, o; o = $.selapi.item[i]; i++) {
        //console.debug(o);
      }
    },},
    copyToClipboard: { value: function(obj) {
    $.clipboard.data = obj;
    // // $('input').value(JSON.stringify(obj)).focus().select();
    // const el = e => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //   console.log(obj);
    // };
    // window.addEventListener('copy', el);
    document.execCommand('copy');
    // window.removeEventListener('copy', el);
    // const el = $('input')
    // .parent(document.body)
    // // .value(JSON.stringify(obj))
    // .focus()
    // .select()
    // .on('copy', e => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //   console.log('COPY', obj);
    // });
    // // window.addEventListener('copy', el, true);
    // document.execCommand('copy');
    // el.remove();
    // // window.removeEventListener('copy', el, true);
  },},
  });

  function Attr() {}
  Object.defineProperties(Attr.prototype, {
    displayvalue: { value: function(value, property) {
      if (value === undefined) {
        return null;
      }
      if (property) {
        if (property.options && property.options[value]) {
          // console.log(property.name, value, property.options[value].title);
          return property.options[value].title;
        }
        if (property.type === 'datetime') {
          return value ? new Date(value).toLocaleString() : null;
        }
      }
      return value;
    },},
  });

  Object.defineProperties(Aim, {
    Elem: { value: Elem },
    attr: { value: new Attr() },
    clipboard: { value: new Clipboard() },
    initEvents: { value: function () {
      $(window)
      .on('afterprint', e => {
        //var e = Listview.elOa;
        ////console.debug('BEFORE PRINT'); //items.printiframe(Listview.elOa);
        //if ($.elPrintDiv) $.elPrintDiv.innerText = '';
      })
      .on('beforeunload', e => {
        if ($.his.handles) for (var name in $.his.handles) { $.his.handles[name].close(); }
      })
      .on('beforeprint', e => {
        //var e = Listview.elOa;
        //console.debug('BEFORE PRINT'); //items.printiframe(Listview.elOa);
        return;
        if (!$.printElement) {
          $.printElement = document.body.createElement('DIV', 'doc-content printablediv' ); //document.body.createElement('table', { className: 'printablediv', style: 'width:100%;' });
        }
        //$.elPrintDiv.innerHTML = $.printdiv.innerHTML;
        with ($.printElement) {
          //console.debug($.printSource, $.printHeader);
          innerText = '';
          if (!$.printHeader) return innerHTML = $.printSource.innerHTML;
          with (createElement('TABLE', 'border', {  style: 'width:100%;' })) {
            //with (createElement('thead').createElement('TR').createElement('th').createElement('DIV', { style: 'display:table;table-layout:fixed;width:100%;' }).createElement('DIV', { style: 'display:table-row;' })) {
            //    createElement('DIV', { style: 'display:table-cell;width:35mm;padding:10px;border-bottom:solid 1px #ccc;vertical-align:middle;' }).createElement('img', { src: Files && Files[1] ? Files[1].src : '' });
            //    with (createElement('DIV', { style: 'display:table-cell;padding:10px;border-bottom:solid 1px #ccc;vertical-align:top;' })) {
            //        if ($.printheader) {
            //            createElement('DIV', { className: 'kop0', innerText: $.printheader.kop0 || '' });
            //            createElement('DIV', { className: 'kop1', innerText: $.printheader.kop1 || '' });
            //            createElement('DIV', { className: 'kop2', innerText: $.printdiv ? $.printdiv.Title : $.printheader.kop2 || '' });
            //        }
            //    }
            //}
            createElement('thead').createElement('TR').createElement('TH', '', $.printHeader.innerHTML );
            createElement('tbody').createElement('TR').createElement('TD', 'doc', $.printSource.innerHTML );
            with (createElement('tfoot').createElement('TR').createElement('TH').createElement('DIV')) {
              createElement('SPAN', '', 'Printed: ' + new Date().toLocaleString() + ' by ' + $.accountName, { style: 'float:right;'});
            }
          }
        }
      })
      .on('blur', e => {
        $.his.focussed = false;
        document.body.setAttribute('blur', '');
        clearTimeout($.his.stateTimeout);
        $.his.stateTimeout = setTimeout(() => $().state('inactive'), 500);
      })
      .on('click', e => {
        return; // DEBUG:
        checkPath(e);
        $.his.clickEvent = e;
        const sectionElement = e.path.find(elem => elem.tagName === 'SECTION' && elem.id);
        if (sectionElement) {
          document.body.setAttribute('section', sectionElement.id);
        }
      }, true)
      .on('click', e => {
        return; // DEBUG:
        $.clickEvent = e;
        // return;
        $.his.clickElement = e.target;
        $.his.clickPath = e.path = e.path || function(el) {
          var path = [];
          while (el) {
            path.push(el);
            el = el.parentElement;
          };
          return path;
        } (e.target);
        // //console.log($('colpanel'));
        if (document.getElementById('colpanel') && !$.his.clickPath.includes($('colpanel'))) {
          // $.request('?prompt=');
        }
        // const itemElement = e.path.find(itemElement => itemElement.item);
        // if (itemElement) {
        // 	$.clipboard.setItem(itemElement.item);
        // }
        let elem = e.target;
        // //console.debug('CLICK', el, el.$infoID);
        //if (this.printable) $.printdiv = this;
        // //console.log(this);
        //// //console.debug('CLICK', this.get);
        // if (el.hasAttribute('accept') && el.tagName !== 'INPUT') {
        // 	//console.log('ACCEPT', itemElement.item);
        // 	if (itemElement.files) {
        // 		itemElement.files.openDialog();
        // 		return;
        // 	}
        // }
        // DEBUG: MAX
        // if (elem.hasAttribute('open')) {
        //   $(elem).select();
        // }
        // if (elem = e.path.find(elem => elem instanceof Element && elem.hasAttribute('open'))) {
        // 	$.el.select.call(elem);
        // }
        if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
          for (let elem of e.path.filter(elem => elem instanceof Element)) {
            if (elem.is && elem.is.has('ofile') && elem.is.get('ofile').src.match(/\.(jpg|png|bmp|jpeg|gif|bin|mp4|webm|mov|3ds)/i)) {
              return $(document.body).slider(elem)
            }
            // if (elem.hasAttribute('src')) {
            //   return document.location.href = '#?src='+elem.getAttribute('src');
            // }
            if (elem.hasAttribute('href')) {
              if (elem.getAttribute('href').match(/^\/\//)) {
                console.log('CLICK MAIN href REL');

                e.preventDefault();
                $().execQuery('l', urlToId(elem.getAttribute('href')));
                // $('list').load(elem.getAttribute('href'))
                return;
              }
              if (window.colpage) {
                if (elem.getAttribute('href')[0] === '#' && elem.getAttribute('href')[1] === '/') {
                  return $().exec(elem.getAttribute('href').substr(1));
                } else if (elem.getAttribute('href').includes('.pdf') && !elem.download) {
                  e.preventDefault();
                  return new $.Frame(elem.href);
                }
                // } else if (elem.getAttribute('href')[0] !== '#' && elem.href.includes(document.location.origin)) {
                //   e.preventDefault();
                //   window.history.pushState('page', 'test1', elem.href);
                //   $(window).emit('popstate');
                //   // $('list').load(elem.getAttribute('href')+'.md');
                //
                //   // console.log();
                //   return;// e.preventDefault();
              }
            }
          }
        }
        if ($.mainPopup) {
          $.mainPopup.close();
          $.subPopup.close();
        }
        //if (window.colpanel && ref.clickPath.indexOf(colpanel) == -1) $.prompt.open();
        //alert(ref.clickPath);
        // //console.log(1, e.target);
        for (var i = 0, el; el = $.his.clickPath[i]; i++) {
          if (el.itemID) {
            console.debug('itemID');
            var item = $.getItem(el.itemID);
            if (item) document.location.href = '#' + item.schema + '/' + item.id + '?select=*';
            return false
            //$.show({ id: this.itemID });
          }
          else if (el.set) {
            $.url.set(el.set);
            return false
            //$.show({ id: this.itemID });
          }
          else if (el.$infoID) {
            //console.debug('infoID');
            e.stopPropagation();
            $.getItem(el.$infoID, item => {
              item.showinfo();
              el.remove();
            });
            return;
          }
          //if (this.pnl)
          //if (this.par) {
          //	$.show(this.par);
          //	e.stopPropagation();
          //	e.preventDefault();
          //	return false;
          //}
          //else if (this.colName) $.setfocus(this);
          else if (el.colName) {
            document.body.setAttribute('ca', el.colName);
            $.colActive = el;
            $.elColActive = el;
            $.printSource = el;
          }
          else if (el.elClose) el.elClose.parentElement.removeChild(el.elClose);
          // else if (el.get) $().exec(el.get);//$.url.set(typeof this.get == 'function' ? this.get() : this.get);
          if ($.targetItem = el.item) {
            break;
          }
        }
        // //console.log('ONCLICK MAIN', e.target);
        // //if ($.targetItem && $.targetItem.focus) $.targetItem.focus(e);
        //
        // // if ($.prompt.panelName) {
        // // 	$.prompt('');
        // // }
        //
        //
        //
        //  // MKA is denk ik vervallen omdat er een algemeen window on click e is die het path bepaald
        // return;
        //
        // ////console.debug('OM CLICK', e);
        //
        // //if ($.mainPopup) {
        // //	$.mainPopup.close();
        // //	$.subPopup.close();
        // //}
        // //$.clickElement = e.target;
        // //$.clickPath = e.path;
        // //for (var i = 0, el; el = $.clickPath[i]; i++) if ($.targetItem = el.item) break;
        // //if ($.targetItem && $.targetItem.focus) $.targetItem.focus(e);
        // return;
        //
        //
        // var el = $.clickElement = e.target;
        // while (el && !el.item) el = el.parentElement;
        // if (!el) return;
        // $.targetItem = el.item;
        // //console.debug('itemClicked', $.clickElement, $.targetItem.id, $.targetItem.Title, $.targetItem, e);
        //
        // if (msg.newItem) msg.write();
        //
        // //$.play('/wav/Windows Notify Email.wav').then(function() { //console.debug('PLAYING'); }, function() { //console.debug('NOT PLAYING'); });
        //
        //
        //
        //
        //
        // $.activeElement = e.path ? e.path.shift() : e.target;
        // if ($.activeElement.item && $.activeElement.item.focus) $.activeElement.item.focus(e);//aimClient.selection.cancel();
        // //Element.Pulldown.el.innerText = '';
      })
      .on('copy', e => $.clipboard.copy(e))
      .on('cut', e => $.clipboard.copy(e))
      .on('dragend', e => {
        $().status('source');
        $().status('target');
        const dragItems = $.clipboard.dragItems;
        //console.log('dragend', e.dataTransfer.dropEffect, dragItems, e, e.view === window);
        switch (e.dataTransfer.dropEffect) {
          // case 'move': {
          // 	if (dragItems) {
          // 		if (e.view === window) return;
          // 		//console.log('dragend', e);
          // 		dragItems.forEach(item => item.remove());
          // 	}
          // 	return;
          // }
          // // if drop outside window then open window
          case 'none': {
            var outside = e.screenX > window.screenX + window.outerWidth || e.screenX < window.screenX || e.screenY > window.screenY + window.outerHeight || e.screenY < window.screenY;
            if (outside) {
              return dragItems.forEach(item => item.popout(e.screenX,e.screenY));
            }
          }
          // case 'move' : {
          // 	dragItems.forEach(item => item.parent.removeChild(item));
          // }
        }
      })
      .on('dragenter', e => {
        if (
          e.dataTransfer.types.includes('aim/items') ||
          e.dataTransfer.types.includes('Files')
        ){
          const targetItemElement = e.path.filter(elem => elem.item).shift();
          if (targetItemElement instanceof Element) {
            e.stopPropagation();
            setTimeout(() => ($.his.targetItemElement = targetItemElement).setAttribute('target', ''));
          }
        }
      })
      .on('dragleave', e => {
        if ($.his.targetItemElement) {
          $.his.targetItemElement.removeAttribute('target');
        }
      })
      .on('dragover', e => {
        if ($.his.targetItemElement) {
          $().status('target', $.his.targetType = eventKeyState(e));
          e.dataTransfer.dropEffect = e.ctrlKey ? (e.shiftKey ? 'link' : 'copy') : 'move';
          // e.dataTransfer.dropEffect = e.ctrlKey ? (e.shiftKey ? 'link' : 'copy') : 'move';
        }
        e.preventDefault();
      })
      .on('dragstart', e => {
        // letop ook files selecteren in AIm.Selection gebaseerd op ofile in path
        // console.log(e.type);
        $().status('source', $.his.sourceType = eventKeyState($.his.keyEvent));
        var elem = e.path.find(elem => elem.ofile);
        if (elem) {
          var dragItems = $.clipboard.items.includes(elem.ofile) ? $.clipboard.items : [elem];
          e.dataTransfer.setData('aim/items', JSON.stringify({files: dragItems.map(elem => elem.ofile)}));
        } else {
          var item = e.path.filter(elem => elem.item).map(elem => elem.item).shift();
          var dragItems = $.clipboard.items.includes(item) ? $.clipboard.items : [item];
          e.dataTransfer.setData('aim/items', JSON.stringify({
            value: dragItems.map(Item.toData),
            sid: $().ws().socket_id,
          }));
          e.dataTransfer.setData('text', dragItems.map(Item.toText).join('\n'));
          e.dataTransfer.setData('text/html', dragItems.map(Item.toHtml).join(''));
        }
        $.clipboard.dragItems = dragItems;
        //console.log(dragItems);
      })
      // .on('drop', e => $.his.targetItemElement ? handleData($.his.targetItemElement.item, e) : null)
      .on('drop', e => {
        e.preventDefault();
        handleData($.his.targetItemElement.item, e);
      })
      .on('focus', e => {
        // console.log('FOCUS');
        if (!$.his.focussed) {
          $.his.focussed = true;
          document.body.removeAttribute('blur');
          $().state('available');
          // $.send();
          // setTimeout(function() { $.auth.setstate('focus'); }, 100);
          // if ($.user.sub) $.auth.check_state();
          ////if (!aimClient.user) return;
          //var data = { activestate: 'focus', accountID: $.client.account.id, userID: $.auth.sub, to: [$.key] };
          //ItemSetAttribute(data.userID, 'activestate', data.activestate);
          //ItemSetAttribute(data.accountID, 'activestate', data.activestate);
          //ws.send(data);
          ////// //console.debug('onfocus start');
          ////msg.check(true); HOEFT NIET GEBEURD VIA EVENT RT SERVER
          //new $.HttpRequest({
          //    api: 'window/focus/' + aliconnect.deviceUID,
          //    //post: { exec: 'onfocus', deviceUID: aimClient.user ? aliconnect.deviceUID : '', },
          //    onload: function() {
          //        //// //console.debug('onfocus done', this.post, this.responseText);
          //        //if (aimClient.user && $.auth.sub && this.data.UserID != $.auth.sub) $.show({ wv: 1, apnl: 'login' });//document.location.href = '?wv=1&apnl=login';
          //    }
          //});
        }
      })
      .on('keyup', onkey, true)
      .on('keyup', checkkey)
      .on('keydown', onkey, true)
      .on('keydown', checkkey)
      .on('keydown', e => {
        switch (e.keyPressed) {
          case 'F1': {
            $().prompt('help');
            e.preventDefault();
            return;
          }
          case 'Escape': {
            if (window.activeElement) return;
            if ($.clipboard.copyItems && $.clipboard.copyItems.length) {
              return $.clipboard.copy();
            }
            // if ($('view').show() && $('view').show().elem && $('view').show().elem.innerText) {
            //   return $('view').show().elem.innerText = '';
            // }
            if (document.activeElement && document.activeElement.cancel && document.activeElement.cancel()) {
              return;
            }
            if ($.his.iframeElement) {
              $.his.iframeElement.remove();
            }
            if ($.imageSlider && $.imageSlider.elem) {
              $.imageSlider.close();
            }
            if (new URLSearchParams(document.location.search).has('prompt')) {
              $().prompt('');
            }
            if (document.activeElement === $.elMsgTextarea) {
              contentEditableEnd($.elMsgTextarea.blur());
            }
            if ($().tree().editing) {
              $().tree().editcancel(Treeview.elINP.Value = Treeview.elINP.initValue)
            }
            if ($('colpage').elFrame) {
              $('colpage').elFrame.close(e);
            }
            // $().tree().cancel();
            // $.tree().edit.cancel() ||
            // $.popup().cancel() ||
            // $.edit().cancel() ||
          }
          // EscapeEdit: keyEscape,
          // F2(e) {
          // 	if ($.path.includes($('self'))) {
          // 		if (self.focusElement) {
          // 			return self.focusElement.edit();
          // 		}
          // 	}
          // 	if ($.pageItem) {
          // 		return $.pageItem.PageEditElement();
          // 	}
          // },
          // pv: {
          // 	EscEdit: function(e) {
          // 		if ($.pageItem && $.pageItem.editing) {
          // 			e.preventDefault();
          // 			$.pageItem.editclose();
          // 		}
          // 	},
          // 	UpShiftAlt: function(e) {
          // 		var field = document.activeElement.field;
          // 		if (field.aid) {
          // 			var el = field.el;
          // 			if (el.previousElementSibling) {
          // 				el.parentElement.insertBefore(el, el.previousElementSibling);
          // 				field.elINP.focus();
          // 			}
          // 		}
          // 		e.preventDefault();
          // 	},
          // 	Up: function(e) {
          // 		if (document.activeElement.tagName != 'DIV' && document.activeElement.field && document.activeElement.field.el.previousElementSibling) {
          // 			document.activeElement.field.el.previousElementSibling.field.elINP.focus();
          // 			e.preventDefault();
          // 		}
          // 		e.preventDefault();
          // 	},
          // 	Down: function(e) {
          // 		if (document.activeElement.tagName != 'DIV' && document.activeElement.field && document.activeElement.field.el.nextElementSibling) {
          // 			document.activeElement.field.el.nextElementSibling.field.elINP.focus();
          // 			e.preventDefault();
          // 		}
          // 	},
          // 	DownShiftAlt: function(e) {
          // 		var field = document.activeElement.field;
          // 		if (field.aid) {
          // 			var el = field.el;
          // 			if (el.nextElementSibling) {
          // 				el.parentElement.insertBefore(el, el.nextElementSibling.nextElementSibling);
          // 				field.elINP.focus();
          // 			}
          // 		}
          // 	},
          // },
          // //tv: {		},
          // //lv: {		},
          // //CtrlKeyP: function() {
          // //	//if (!) document.body.createElement('DIV', { className: 'divprint' , innerHTML:colpage.innerHTML});
          // //	//e.preventDefault();
          //
          // //},
          //
          //
          // // ShiftShift wordt gegenereerd door scanner voor barcode. Bij scannen code tree select resetten
          // ShiftShift: function() {
          // 	Treeview.selstart = null;
          // },
          // CtrlKeySEdit: function(e) {
          // 	if ($.pageItem && $.pageItem.editing) {
          // 		e.preventDefault();
          // 		//if (document.activeElement && document.activeElement.onblur) document.activeElement.onblur();
          // 		//if (document.activeElement && document.activeElement.onchange) document.activeElement.onchange();
          // 		//$.pageItem.btnSave.focus();
          // 		$.pageItem.btnSave.click();
          // 	}
          // },
          // CtrlKeyZ: function(e) {
          // 	$.undo();
          // },
          // //KeyCCtrl: function(e) {
          // //    return $.clipboard.copy();
          // //},
        }
      })
      .on('keydown', e => {
        // //console.log(e, window.event);
        $().state('available');
        // 	if (key == 'Enter') {
        // 		if ($.setting.keybuf.length == 10 && !isNaN($.setting.keybuf)) return auth.keyloggin($.setting.keybuf);
        // 		$.setting.keybuf = $.setting.keybuf.split('CapsLockCapsLock');
        // 		if ($.setting.keybuf[1]) {
        // 			bc = $.setting.keybuf.pop();
        // 			//console.debug(bc);
        // 			private.search.Value = bc;
        // 			$.formfind.onsubmit();
        // 		};
        // 		$.setting.keybuf = '';
        // 	} else {
        // 		$.setting.keybuf += e.key;
        // 	}
        // onkey(e);
        $.his.keyEvent = e;
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
          e.preventDefault();
          document.execCommand('copy');
        }
        // //console.log('keydown', e, e.keyPressed);
        e.previousKey = $.his.previousKey;
        $.his.previousKey = e.keyPressed;
      }, true)
      .on('message', e => {
        // if (e && e.body && e.body.code) {
        // 	$.auth.get_access_token(e.body);
        // 	// return $.auth.login({
        // 	// 	code: e.body.code,
        // 	// 	client_id: $.config.$.client_id,
        // 	// });
        //
        // 	// $.his.cookie = {
        // 	// 	id_token: e.body.id_token,
        // 	// }
        // 	// //console.error('document.cookie', document.cookie);
        // 	//
        // 	//
        // 	// //console.debug('id_token', e.body.id_token);
        // 	// $.extendLocal({auth:{id_token: e.body.id_token}});
        // 	// document.cookie = 'id_token=' + e.body.id_token;
        // 	// $.auth.id_token = e.body.id_token;
        // 	// new $.WebsocketRequest({
        // 	// 	to: {
        // 	// 		sid: e.from_id,
        // 	// 	},
        // 	// 	message_id: e.id,
        // 	// 	body: {
        // 	// 		state: 'ack',
        // 	// 	},
        // 	// }, e => {
        // 	// 	//console.log('RESPONSE ACK ACK', e.body);
        // 	// });
        // 	//
        // }
        // var data = e.body;
        // if (!data) return;
        // //console.debug('ON MESSAGE WEB DATA', e);
        const data = e;
        if (e.body && e.body.Master && e.body.Master.LinkID) {
          const parent = $.ref[Number(e.body.Master.LinkID)];
          const item = $.ref[Number(data.ID)];
          if (parent && item) {
            $.noPost(() => {
              item.movetoidx(parent, Number(e.body.Master.Data));
            })
          }
        }
        // if (data.changeData) {
        // 	return changeData(data.changeData);
        // }
        if (data.state && data.description && document.getElementById('aimStatusMsg'))
        document.getElementById('aimStatusMsg').innerText = data.description;
        switch (data.state) {
          case 'datatransfered':
          for (var name in data.values) {
            for (var c = document.getElementsByName(name), el, i = 0; el = c[i]; i++) el.Value = data.values[name];
          }
          break;
        }
        if (data.systemalert) {
          // //console.debug('ONMESSAGE ALERT', data);
          if (!document.getElementById('alertpanel')) return;
          if (!$.elAlertrow) {
            with (document.getElementById('alertpanel')) {
              $.elAlertsum = document.getElementById('alertsum') || createElement('DIV', { className: 'col', id: 'alertsum' });
              $.elAlertrow = document.getElementById('alertrow') || createElement('DIV', { className: 'col aco', id: 'alertrow' });
            }
          }
          if (!$.alerts[data.systemalert.id]) $.alerts[data.systemalert.id] = $.elAlertrow.createElement('DIV', {
            className: data.systemalert.categorie, innerText: [data.systemalert.Title, data.systemalert.created].join(' '),
            onchange: function(e) {
              // //console.debug('CHANGE', this);
              if ('condition' in this) this.setAttribute('condition', this.condition);
              if ('ack' in this) this.setAttribute('ack', this.ack);
              if (this.ack && !this.condition) { $.alerts[this.id] = null; $.elAlertrow.removeChild(this); }
            },
            onclick: function() {
              ws.send({ systemalert: { id: this.id, ack: this.ack = 1 } });
              this.onchange();
            }
          });
          Object.assign($.alerts[data.systemalert.id], data.systemalert).onchange();
        }
        return;
        if (data.itemID && data.attributeName && ('value' in data)) {
          c = document.getElementsByName([data.itemID, data.attributeName].join('.'));
          for (var i = 0, e; e = c[i]; i++) e.setAttribute('value', data.Value);
          var c = document.getElementsByClassName(data.itemID);
          for (var i = 0, e; e = c[i]; i++) e.setAttribute(data.attributeName, data.Value);
          if (window.meshitems && window.meshapi.item[data.itemID] && data.attributeName == 'MeshColor') {
            window.meshapi.item[data.itemID].src.basiccolor = data.Value;
            window.meshapi.item[data.itemID].colorSet(data.Value);
          }
          if (window.meshitems && window.meshapi.item[data.itemID] && data.attributeName == 'err') {
            for (var i = 0, c = $.his.err.children, elErrRow; elErrRow = c[i]; i++) if (elErrRow.meshitem.src.itemID == data.itemID) break;
            if (elErrRow) {
              elErrRow.elEnd.innerText = (elErrRow.end = new Date()).toISOString().substr(11, 8);
              elErrRow.refresh();
            }
            else with ($.his.err.insertBefore(elErrRow = $.his.err.createElement('DIV', { className: 'row err start', itemID: data.itemID, meshitem: window.meshapi.item[data.itemID], start: new Date() }), $.his.err.firstChild)) {
              createElement('SPAN', { className: 'icon' });
              createElement('SPAN', { className: '', innerText: window.meshapi.item[data.itemID].src.name });
              createElement('SPAN', { className: '', innerText: data.Value });
              createElement('SPAN', { className: '', innerText: elErrRow.start.toISOString().substr(11, 8) });
              elErrRow.elAccept = createElement('SPAN', { className: '', innerText: '' });
              elErrRow.elEnd = createElement('SPAN', { className: '', innerText: '' });
              elErrRow.refresh = function() {
                if (this.end && this.accept) {
                  this.meshitem.colorSet();
                  $.his.err.removeChild(this);
                }
                $.his.errCont.style = $.his.err.children.length ? '' : 'display:none;';
                window.onWindowResize();
              };
              elErrRow.refresh();
            }
          }
        }
        return;
        //console.debug('message', e.body);
        if (e.body) $.data.update(e.body);
        // var data = e.body;
        if (data.Value)
        ////console.debug('ONMESSAGE OM', this, e);
        ////console.debug('onreceive', this.data);
        //if (data.Notification) $.Notification.create(data.Notification);
        if (data.state && data.fraim.app === 'aliconnector' && data.fraim.ip == $.client.ip) {
          ////console.debug('CONNECT');
          document.body.setAttribute('aliconnector', $.aliconnector.state = data.state);
          // if (data.state=='disconnected') {
          // 	$.hasConnector=false;
          // 	//document.body.style.color='red';
          // }
          if (data.state == 'connected') {
            //$.hasConnector=true;
            //document.body.style.color='green';
            if (!data.ack) ws.send({ to: { client: data.fraim.client }, state: 'connected', ack: 1 });
            if (data.fraim.device != $.client.device.id) {
              //alert('SYNC ALICONNECT DEVICE_ID');
              ws.send({ to: { client: data.fraim.client }, device: $.client.device });
              ////console.debug('CONNECT ALICONNECTOR', senddata);
            }
          }
        }
        //{
        //	//console.debug('Notification', data.Notification);
        //	$.Notification.Notify(data.Notification.Title, data.Notification.options);
        //	//{
        //	//	body: "Bericht geplaatst door " + data.get.from,
        //	//	url: "https://aliconnect.nl/tms/app/om/#id=" + data.get.id,
        //	//	//url: "https://aliconnect.nl/moba/app?lid=;2101;;FinishDateTime+IS+NULL&q=*&n=EWR&id=2776611&pv=1",
        //	//	//icon: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
        //	//	//image: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
        //	//	data: data,
        //	//});
        //}
        //if (data.Value) data.Value.forEach(function(item) {
        //});
        ////console.debug('OnReceive', data);
        ////console.debug(data);
        //if (data.supportmessage) $.Notification.create(data.supportmessage);
        if (data.reload) document.location.href = document.location.href;
        if (data.app === 'aliconnector') {
          if (!msg) return;
          $.aliconnector = msg;
          //console.debug('aliconnector', msg);
          if (msg.state == 'connected') {
            ws.send({ to: { deviceUID: $.deviceUID }, msg: { userName: $.accountName || $.client.user.name, userUID: $.userUID } });
            //Notify("EWR 4292 Updated", {
            //    body: "TL20 on packing lanes before CP12",
            //    url: "https://aliconnect.nl/moba/app?lid=;2101;;FinishDateTime+IS+NULL&q=*&n=EWR&id=2776611&pv=1",
            //    icon: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
            //    //image: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
            //});
            //Notify('fdsgsdfgsdfgs');
          }
          if (msg.state) {
            //ws.send({ broadcast: true, msg: { id: $.Account.sub, uid: $.userUID, state: msg.state } });
            //document.body.setAttribute('aliconnector', msg.state);
          }
          //{
          //    document.body.setAttribute('aliconnector', 'online');
          //}
          //return;
          //if ($.aliconnector.state == 'init') ws.send({ to: { deviceUID: $.deviceUID }, msg: { userName: $.accountName } });
          //clearTimeout($.toaliconnector);
          //$.toaliconnector = setTimeout(function() { document.body.setAttribute('aliconnector', $.aliconnector.state = 'offline'); }, 40000);
          ////console.debug('ONLINE SERVICE', data);
          //document.body.setAttribute('aliconnector', 'online');
        }
        //if (msg.post && msg.post.item && $.ref[msg.post.item.id]) {
        //    var item = $.ref[msg.post.item.id];
        //    //console.debug(document.location.href);
        //    //Notify(item.Title, {
        //    //    body: "Modified by user",
        //    //    icon: item.files && item.files[0] ? "https://aliconnect.nl" + item.files[0].src : null, //"https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
        //    //    //image: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
        //    //    data: { id: item.id, url: document.location.href },
        //    //});
        //}
        if (data.editfiledone) {
          var c = document.getElementsByName(data.editfiledone);
          for (var i = 0, e; e = c[i]; i++) e.setAttribute('state', '');
        }
        if (data.editfile) {
          data.editfile = data.editfile.split('/').pop();
          var c = document.getElementsByName(data.editfile);
          for (var i = 0, e; e = c[i]; i++) e.setAttribute('state', 'editing');
        }
        //if ($.ref[data.id]) ItemSetAttribute(data.id, data.name, data.Value);
        //if (msg.items) itemset(msg.items);//for (var id in msg.items) if ($.ref[id]) { msg.items[id].id = id; itemset(msg.items[id]); }
        //if (data.activestate) {
        //    ItemSetAttribute(data.userID, 'activestate', data.activestate);
        //    ItemSetAttribute(data.accountID, 'activestate', data.activestate);
        //    //if ($.ref[data.userID]) {
        //    //    $.ref[data.userID].guistate = data.guistate;
        //    //    var c = document.getElementsByName('state' + data.accountID);
        //    //}
        //    //if ($.ref[data.accountID]) $.ref[data.accountID].guistate = data.guistate;
        //    //for (var i = 0, e; e = c[i]; i++) e.setAttribute('state', 'online');
        //    //if ($.ref[data.accountID]) $.ref[data.accountID].onlinestate = 'online';
        //}
        //if (data.a == 'blur') {
        //    var c = document.getElementsByName('state' + data.accountID);
        //    for (var i = 0, e; e = c[i]; i++) e.setAttribute('state', 'offline');
        //    if ($.ref[data.accountID]) $.ref[data.accountID].onlinestate = 'offline';
        //}
        if (data.alert) alert(data.alert);
        //if (data.deviceUID == $.deviceUID) {
        return;
        //}
        if (data.a == 'submit' && $.getItem(data.id) && $.getItem(data.id).modifiedDT != data.modifiedDT) {
          ////console.debug('SUBMIT', data.id);
          //if (data.hostID == $.config.$.auth.accessToken.aud) {
          ////console.debug('SUBMIT', data, $.config.$.auth.accessToken.aud, get.id, data.id);
          if (get.id == data.id) {
            $.getItem(data.id).reload();
          } else if ($.getItem(data.id)) {
            $.getItem(data.id).loaded = false;
          }
          msg.check();
          //}
        }
      })
      .on('mousemove', e => {
        $.his.clickPath = e.path;
        $().state('available');
        // if (e.target.item) // //console.log(e.target.tagName, e.target.item);
        // if (!$.his.clickPath.includes($)) $.his.clickPath.push($);
      })
      .on('paste', e => handleData($.clipboard.itemFocussed, e))
      .on('popstate', e => {
        e.preventDefault();
        // console.log('POPSTATE', document.location.href);
        $().execUrl(document.location.href, true);
      })
      .on('resize', e => {
        if ($.mainPopup) {
          $.mainPopup.close();
          $.subPopup.close();
        }
        // if (document.body.clientWidth < 400 && document.body.clientWidth < document.body.clientHeight) document.body.setAttribute('device', device = 'phone');
        // else if (document.body.clientHeight < 400 && document.body.clientWidth > document.body.clientHeight) document.body.setAttribute('device', device = 'phonewide');
        // else if (document.body.clientWidth < 800 && document.body.clientWidth < document.body.clientHeight) document.body.setAttribute('device', device = 'tablet');
        // else if (document.body.clientHeight < 800 && document.body.clientWidth > document.body.clientHeight) document.body.setAttribute('device', device = 'tabletwide');
        // else document.body.setAttribute('device', device = 'pc');
      })
      .on('scroll', e => {

        if ($('doc') && $('doc').elem && $('doc').elem.lastChild) {
          const lastdoc = $('doc').elem.lastChild;
          if (lastdoc && lastdoc.doc) {
            const docelem = lastdoc.doc.docElem;
            // console.log(docelem, docelem.findAll);
            if (!$.toScroll) {
              // const div = Math.abs(lastScrollTop - docelem.elem.scrollTop);
              // clearTimeout(to);
              $.toScroll = setTimeout(() => {
                // console.log('re');
                $.toScroll = null;
                // if (div > 50) {
                lastScrollTop = document.body.scrollTop;
                let elem = docelem.findAll.find(elem => elem.getBoundingClientRect().top < docelem.elemTop) || docelem.topItem;
                // console.log(docelem.findAll);
                // let elem = all.find(elem => elem.offsetParent );
                // console.log(elem.innerText, elemTop, elem.getBoundingClientRect().top, elem.getBoundingClientRect().height, all.indexOf(elem));
                // return;
                // elem = all[all.indexOf(elem)-1];
                docelem.allmenu.forEach(a => a.attr('open', '0').attr('select', null));
                const path = [];
                for (var p = elem.a.elem; p.tagName === 'A' && p.parentElement && p.parentElement.parentElement; p=p.parentElement.parentElement.parentElement.firstChild) {
                  p.setAttribute('select', '');
                  p.setAttribute('open', '1');
                  path.push(p);
                }
                $(elem.a.elem).scrollIntoView();
                if ($('navDoc')) {
                  $('navDoc').text('').append(...path.reverse().map(elem => ['/', $('a').text(elem.innerText)]))
                }
                // elem.li.select();
                // $()
                // let elem = all.forEach(elem => //console.log(elem.getBoundingClientRect().top));
                // //console.log(elem, elem.li);
                // }
              }, 500);
            }
          }
        }
        // console.error(docelem, docelem.doc);



        if ($.mainPopup) {
          $.mainPopup.close();
          $.subPopup.close();
        }
        var st = window.pageYOffset || document.documentElement.scrollTop;
        var scrolldir = st > 50 && st > $.lastScrollTop ? 'down' : 'up';
        if ($.his.body) $.his.body.setAttribute('scroll', scrolldir);
        $.lastScrollTop = st;
        if (Element && Element.iv) {
          if (window.toscroll) clearTimeout(window.toscroll);
          toscroll = setTimeout(function() {
            var e = Element.iv, ot = 0;
            while (e = e.parentElement) ot += e.offsetTop;
            ////console.debug(ot);
            for (var i = 0, elHFocus, elNext; elNext = hapi.item[i]; i++) {
              if (elNext.offsetTop > st - ot) break;
              elHFocus = elNext;
            }
            elHFocus = elHFocus || elNext;
            var c = Element.iv.getElementsByTagName('LI');
            ////console.debug(c);
            //var elFocus = null, elPrev = null;
            for (var i = 0, e; e = c[i]; i++) {
              //if (e.h.offsetTop - 25 >= st) elFocus = elFocus || elPrev || e;
              //elPrev = e;
              if (e.hasAttribute('open')) e.setAttribute('open', 0);
              e.removeAttribute('focus');
            }
            ////console.debug(elHFocus.innerText, elHFocus.elemTreeLi);
            Element.iv.style.paddingTop = Math.max(0, st - ot + 50) + 'px';
            if (elHFocus) {
              elPar = elFocus = elHFocus.elemTreeLi;
              ////console.debug('FOCUS', elHFocus.innerText, elHFocus.elemTreeLi, elPar.innerText);
              //var otf = elFocus.offsetTop;
              //elFocus = elFocus || elPrev || e;
              elFocus.setAttribute('focus', 1);
              while (elPar.h) {
                ////console.debug('FOCUS', elPar.innerText, elPar.offsetTop, elPar.tagName);
                //otf += elPar.offsetTop + 30;
                if (elPar.hasAttribute('open')) elPar.setAttribute('open', 1);
                elPar = elPar.parentElement.previousElementSibling;
              }
              ////console.debug('go');
              //while ((elFocus = elFocus.parentElement) && elFocus != Element.iv.firstChild) {
              //    //console.debug(elFocus.offsetTop);
              //    otf += elFocus.offsetTop;
              //}
              //console.debug('TOTAL', Element.iv.firstChild.getBoundingClientRect().top, elFocus.getBoundingClientRect().top);
              ////console.debug(elPar.innerText, elPar.offsetTop);
              //otf += elPar.offsetTop;
              //elFocus.scrollIntoView({ block: "nearest", inline: "nearest" });
              //var br = Element.iv.getBoundingClientRect();
              //var bre = elFocus.getBoundingClientRect();
              if (scrolldir == 'down') Element.iv.style.paddingTop = (st - ot - elFocus.getBoundingClientRect().top + Element.iv.firstChild.getBoundingClientRect().top + 50) + 'px';
              //else Element.iv.style.paddingTop = (st - ot + 50) + 'px';
              ////console.debug(st, bre.top, elHFocus.offsetTop);
            }
          }, 300);
        }
        // $.player.onscroll();
        ////console.debug(document.documentElement.clientHeight, Element.iv.clientHeight, Element.iv.firstChild.clientHeight, document.documentElement.clientHeight);
        //Element.iv.style.paddingTop = Math.min(Element.iv.clientHeight - Element.iv.firstChild.clientHeight - 300, Math.max(0, document.documentElement.scrollTop - 300)) + 'px';
      })
      .on('unload', e => {
        // aimClient.api.setactivestate('offline');
      });
    } },
  });


  $().on({
    connect: handleEvent,
    message(e){
      if (e.body && e.body.code){
        $.his.replaceUrl( '#');
        $.auth.loginWindow.close();
        $.auth.get_access_token(e.body);
      }
    },
    // logout(e){
    //   $.clipboard.reload('https://login.aliconnect.nl/api/oauth?' + new URLSearchParams({
    //     prompt: 'logout',
    //     client_id: config.auth.client_id || config.auth.clientId,
    //     redirect_uri: document.location.origin,
    //   }).toString());
    // },
  });

	ScriptLoader = function() {
		let loaded = [];
		let loading = [];
		let args = [];
		let callback;
		this.load = function(files) {
			if (files) {
				let difference = files.filter(x => !loaded.includes(x));
				if (!difference.length) return true;
				loading = files;
				callback = arguments.callee.caller;
				args = arguments.callee.caller.arguments;
			}
			if (!loading.length) return callback(...args);
			let src = loading.shift();
			if (loaded.includes(src)) {
				return arguments.callee();
			}
			loaded.push(src);
			//console.log('SCRIPT', src);
			document.head.createElement('script', {
				src: src,
				onload: e => arguments.callee(),
			});
		}
	};
	scriptLoader = new ScriptLoader();

	Popup = function(e) {
		// //console.log('POPUP');
		e = e || window.event;
		let targetElement = e.path.find(targetElement => targetElement.popupmenu || targetElement.contextmenu);
		//console.error('POPUP', targetElement);
		if (!targetElement) return;
		e.preventDefault();
		e.stopPropagation();
		let targetRect = targetElement.getBoundingClientRect();
		let menuItems = targetElement.popupmenu || targetElement.contextmenu;
		// let popupPageElement = targetElement.createElement('DIV', 'popupPage', { oncontextmenu: e => {
		// 	e.stopPropagation();
		// }});
		if (this.handlers.menuElement) {
			this.handlers.menuElement.remove();
		}
		let menuElement = this.handlers.menuElement = targetElement.createElement('DIV', 'col popup', { oncontextmenu: e => {
			e.stopPropagation();
		}});
		targetElement.addEventListener('mouseleave', e => {
			//console.log('mouseleave', e.target === targetElement);
			if (e.target === targetElement) {
				this.close();
			}
			// //console.log('OUT', e.target === menuElement);
		}, true);
		this.close = e => {
			menuElement.remove();
			window.removeEventListener('click', this.close, true);
		};
		// window.addEventListener('mousedown', e => {
		// 	if (e.path.find(elem => elem === menuElement)) {
		// 		return;
		// 	}
		// }, true);
		// var menu = $.mainPopup;
		if (targetElement.popupmenu) {
			targetElement.right = 0;
		}
		// //console.debug('POS', targetElement, targetRect, targetElement.left, targetElement.right);
		// //console.debug('PUMENU', this, this.menu, menu, pos);
		menuElement.innerText = '';
		for (let [menuname, menuitem] of Object.entries(menuItems)) {
			// let title = __(menuitem.header0 || menuname);
			// //console.debug('MENUITEM', menuitem, title);
			if (menuitem.hidden) continue;
			var linkElement = menuElement.createElement('A', {
				name: menuname,
				value: menuname,
				elMenu: menuElement,
				left: 5,
				menuitem: menuitem,
				popupmenu: menuitem.menu,
				// item: this.item,
				onclick: menuitem.onclick || (this.menu ? this.menu.onclick : null) || targetElement.onselect || function (e) {
					//console.log ('MENU CLICK');
					e.stopPropagation();
				},
				// onselect: this.onselect,
				onmouseenter: this.enter
			}, menuitem, {
				className: 'row abtn icn ' + (menuitem.className || menuname),
			});
			if (menuitem.color) {
				linkElement.createElement('icon', {}).style = 'background-color:' + menuitem.color;
			}
			linkElement.createElement('SPAN', 'aco', __(menuitem.header0 || menuname));
			if (menuitem.key) {
				linkElement.createElement('SPAN', '', menuitem.key);
			}
		};
		var top = targetRect.bottom;
		if ('left' in targetElement) {
			// var left = pos.right;
			var left = pos.left;
		} else if ('right' in targetElement) {
			var left = targetRect.right - menuElement.clientWidth, top = targetRect.bottom;
		} else {
			var left = e.clientX, top = e.clientY;
		}
		// //console.log(top, window.screen.availHeight, clientHeight);
		// var innerWidth = window.innerWidth;
		// window.addEventListener('resize', e => {
		// 	//console.log(e, e.currentTarget.innerWidth, e.target.innerWidth);
		// 	resizeLeft = (window.innerWidth - innerWidth) / 2;
		// 	innerWidth = window.innerWidth;
		// 	menu.left += resizeLeft;
		// 	menu.style.left = menu.left + 'px';
		// })
		left = Math.max(0, left);
		// var top = Math.max(48, Math.min(top, window.screen.availHeight - clientHeight - 10));
		menuElement.style.left = left + 'px';
		menuElement.style.top = top + 'px';
		menuElement.style.maxHeight = (window.screen.availHeight - top) + 'px';
	};
	Popup.prototype = {
		handlers: {},
		enter(e) {
			// //console.debug('ENTER', this.elMenu == $.mainPopup);
			e.stopPropagation();
			if (this.elMenu.menuitemFocused) {
				this.elMenu.menuitemFocused.removeAttribute('focus');
			}
			this.elMenu.menuitemFocused = this;
			this.elMenu.menuitemFocused.setAttribute('focus', '');
			if (this === $.mainPopup) {
				$.subPopup.elem.innerText = '';
			}
			if (this.menu) {
				$.subPopup.show.call(this);
			}
		},
	};

  const Aliconnector = {
		/** @function Aliconnector.outlookImportMail
		*/
		outlookImportMail: function(){
			ws.send({ to: { deviceUID: $.deviceUID }, msg: { external: 'mailimport' } });
		},
		/** @function Aliconnector.outlookImportContacts
		*/
		outlookImportContacts: function(){
			ws.send({ to: { deviceUID: $.deviceUID }, msg: { external: 'mailimport' } });
		},
	};

  // (function () {
  //   const config = {
  //     apiPath: document.currentScript.src.split('/js')[0],
  //   };
  //   if (document.currentScript.attributes)
  //   (new URL(document.currentScript.src)).searchParams.forEach((value, key)=>$.extend(config, minimist([key,value])));
  //   [...document.currentScript.attributes].forEach(attribute => $.extend(config, minimist(['--'+attribute.name.replace(/^--/, ''), attribute.value])));
  //   (new URLSearchParams(document.location.search)).forEach((value,key)=>$.extend(config, minimist([key,value])));
  //   $.extend({config:config});
  // })()

  $.his.openItems = localStorage.getItem('openItems');
  let localAttr = localStorage.getItem('attr');
  $.localAttr = localAttr = localAttr ? JSON.parse(localAttr) : {};

	const apiorigin = $.httpHost === 'localhost' && $().storage === 'api' ? 'http://localhost' : $.origin;
  aim = $.aim = $('aim');
  require = function () {};

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the e so it can be triggered later.
    // deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    // showInstallPromotion();
    // Optionally, send analytics e that PWA install promo was shown.
    // console.error(`LETOP 'beforeinstallprompt' e was fired.`);
    // alert('install');
  });
  // console.log(1, document.currentScript.attributes.libraries.value);


  // console.log('WEB');
  // const el = document.createElement('link');
  // el.rel = 'stylesheet';
  // el.href = 'https://aliconnect.nl/v1/api/css/web.css';
  // document.head.appendChild(el);
  // function require(){};
  $.his.openItems = $.his.openItems ? $.his.openItems.split(',') : [];
  window.console = window.console || { log: function() { } };
  window.Object = window.Object || {
    assign: function(dest) {
      for (var i = 1, source; source = arguments[i]; i++) for (var name in source) dest[name] = source[name];
      return dest;
    },
    values: function(obj) {
      var arr = [];
      for (var name in obj) arr.push(obj[name]);
      return arr;
    }
  };
  (function(arr) {
    arr.forEach(function(item) {
      if (item.hasOwnProperty('append')) {
        return;
      }
      Object.defineProperty(item, 'append', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function append() {
          const argArr = Array.prototype.slice.call(arguments);
          const docFrag = document.createDocumentFragment();
          argArr.forEach(function(argItem) {
            const isNode = argItem instanceof Node;
            docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
          });
          this.appendChild(docFrag);
        }
      });
    });
  })([Element.prototype, Document.prototype, DocumentFragment.prototype]);
  let match = document.location.pathname.match(/(.*)(api|docs|omd|om)(?=\/)/);
  if (match) {
    $.basePath = match[0];
  }
  localAttr.set = function(id, selector, context) {
    localAttr[id] = localAttr[id] || {};
    if (context === null) {
      delete localAttr[id][selector];
    } else {
      localAttr[id][selector] = context;
    }
    localStorage.setItem('attr', JSON.stringify(localAttr));
  };
  $(document.documentElement).attr('lang', navigator.language);
  $().on('ready', async e => {
    // console.log('web ready', $.prompts);
    if ($.prompt) {
      $.prompt($.prompts);
    }
    return;
    // await $().emit('ready');
    // //console.log('web ready2',$(), $().ws());
    // $.prompt('TEST', e => {
    // 	alert(1);
    // });
    // $.prompt('TEST');
    // return;
    // initConfigCss();
    loadStoredCss();
    // loadStoredAttr();
    // initAllSeperators()
    if (document.getElementById('colpage')) {
      Object.assign(document.getElementById('colpage'), {
        cancel(e) {
          //console.log('PAGE CANCEL', this);
        },
        keydown: {
          F2(e) {
            if (this.item) {
              this.item.PageEditElement()
            }
          }
        },
      });
    }
    // //console.log('AFTER READY', document.location.hostname);
    // setTimeout(() => {
    //   //console.log('web after ready')
    //   $(window).emit('popstate');
    //   $(window).emit('focus');
    // })
    //console.log('web ready done')
  });
  // this.sw();

  // console.log('web');



  const currentScript = document.currentScript;
  const scriptPath = currentScript.src.replace(/\/js\/.*/, '');
  [...currentScript.attributes].forEach(attribute => $.extend({config: minimist(['--'+attribute.name.replace(/^--/, ''), attribute.value])}));
  (new URLSearchParams(document.location.search)).forEach((value,key)=>$.extend({config: minimist([key,value])}));

  if (currentScript.attributes.libraries) {
    currentScript.attributes.libraries.value.split(',')
    .forEach(selector => importScript(
      currentScript.attributes.src.value.replace(/web/g, selector)
    ));
  }

  window.addEventListener('load', async function webLoad(e) {
    // console.log('LOAD');
    // if (currentScript.attributes.url) {
    //   await $().url('config.json', currentScript.attributes.url.value).get().catch(console.error).then(e => $.extend({config: e.body}));
    // }
    // (new URL(document.currentScript.src)).searchParams.forEach((value, key)=>$.extend(config, minimist([key,value])));
    // [...currentScript.attributes].forEach(attribute => $.extend({config: minimist(['--'+attribute.name.replace(/^--/, ''), attribute.value])}));
    // (new URLSearchParams(document.location.search)).forEach((value,key)=>$.extend({config: minimist([key,value])}));

    $().emit('load').then(function emitLoad(e) {
      $().emit('ready').then(function emitReady(e) {
        $(window).emit('popstate');
        $(window).emit('focus');
      });
    })
  })


}).call();
