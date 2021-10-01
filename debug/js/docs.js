function Docs() {}
Docs.prototype = {
  async _init() {
    if (!this.index) {
      await $().url('/api/').query({request_type:'docbuild'})
      .get().then(e => {
        this.index = Object.assign($.doc, e.body.docs.index);
        const items = this.items = [];
        (function recursive(selector, context){
          if (selector) {
            if (typeof selector === 'string') {
              if (context && typeof context === 'object') {
                if (context.src) {
                  items.push([selector.replace(/_|-/g,' '),context.src]);
                }
                Object.entries(context).forEach(entry => {
                  if (typeof entry[1] === 'object') {
                    recursive(...entry)
                  }
                });
              }
            } else {
              if (Array.isArray(selector)) {
                selector.forEach(item => recursive(item))
              } else if (selector instanceof Object) {
                Object.entries(selector).forEach(entry => recursive(...entry));
              }
            }
          }
        })(this.index);
      });
    }
    return this;
  },
  _write(selector){
    selector = $(selector);
    if (!selector.text()) {
      selector.class('row').append(
        $('button').class('abtn abs close').attr('open', '').on('click', e => $('doc').text('')),
        this.indexLeft = $('ul').class('aco mc-menu left np oa').append(
          $('div').class('ac-header').text('Document overview'),
        ),
        this.contentElement = $('div').class('aco doc-content page counter oa'),
        $('div').class('aco mc-menu right np oa').append(
          $('div').class('ac-header').text('Table of contents'),
          this.indexElement = $('ul')
        ),
      );
      this.indexLeft.navlist(this.index);
    }
    return this;
  },
  find(search){
    const exp = search.split(' ').map(val => `(?=.*\\b${val}\\b)`).join('');
    //console.log(exp);
    const regExp = new RegExp(exp, 'i');
    return this.items.filter(item => item[0].match(regExp))
  },
  _reindex(){
    const all = [...this.contentElement.elem.querySelectorAll("h1, h2, h3")];
    const allmenu = [];
    let i = 0;
    function addChapters (ul, level) {
      for (let elem = all[i]; elem; elem = all[i]) {
        const tagLevel = Number(elem.tagName[1]);
        const title = elem.innerText;
        if (tagLevel === level) {
          $(elem).append(
            $('a').attr('name', 'chapter' + i)
          );
          var li = $('li').parent(ul).append(
            elem.a = $('a').text(elem.innerText).attr('href', '#chapter' + i).attr('open', '0').attr('target', '_self')
          );
          i++;
          allmenu.push(elem.a);
          // all.shift();
        } else if (tagLevel > level) {
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
    this.contentElement.elem.onscroll = e => {
      clearTimeout(to);
      to = setTimeout(() => {
        // //console.log(all, this.elem);
        let elem = all.find(elem => elem.getBoundingClientRect().top > 50);
        elem = all[all.indexOf(elem)-1];
        allmenu.forEach(a => a.attr('open', '0').attr('select', null));
        for (var p = elem.a.elem; p.tagName === 'A'; p=p.parentElement.parentElement.parentElement.firstChild) {
          p.setAttribute('select', '');
          p.setAttribute('open', '1');
        }
        // elem.li.select();
        // $()
        // let elem = all.forEach(elem => //console.log(elem.getBoundingClientRect().top));
        // //console.log(elem, elem.li);
      }, 100);
    };
    addChapters(this.indexElement.text(''), 1);
    return this;
    // return $('ul').append(...[...this.elem.querySelectorAll("h1, h2, h3")].map(elem => $('li').text(elem.innerText)))
    this.addNextPreviousButtons()
  },
  addNextPreviousButtons() {
    return;
    // Nav object
  },
  createWord(html) {
    // //console.log(html);
    var xhr = new XMLHttpRequest();
    //xhr.open('GET', this.menuitem.template, true);//'/moba/utildoc/sjabloon.mht', true);
    xhr.open('GET', '/' + $.host + '/app/mht/template.mht', true);
    xhr.responseType = 'blob';
    //xhr.menuitem = this.menuitem;
    xhr.onload = function () {
      var blob = new Blob([this.response], { type: 'text/html' });
      var reader = new FileReader();
      //reader.menuitem = this.menuitem;
      reader.onload = function () {
        var item = items[get.id], aFilename = [], s = reader.result, today = aDate().toLocaleDateString();
        s = s.split(', ')[1];
        var content = atob(s);
        content = content.replace(/=\r\n/g, '').replace(/=3D/g, '=');
        //aFilename.push(this.menuitem.Title);
        for (var fieldname in item.fields) {
          var re = new RegExp('#' + fieldname + '#', "g");
          content = content.replace(re, item.fields[fieldname].Value || '');
          if (item.fields[fieldname].kop === 0 && item.fields[fieldname].Value) aFilename.push(item.fields[fieldname].Value);
        }
        if (item.elFilesView) {
          content = content.replace('#files#', item.elFilesView.innerHTML);
        }
        var c = Document.elBody.getElementsByTagName('p');
        for (var i = 0, e; e = c[i]; i++) e.className = 'MsoNormal';
        var c = Document.elBody.getElementsByTagName('DIV');
        for (var i = 0, e; e = c[i]; i++) e.className = 'MsoNormal';
        var c = Document.elBody.getElementsByTagName('table');
        for (var i = 0, e; e = c[i]; i++) e.className = 'MsoNormalTable';
        var sIn = html || '';
        sIn = sIn.replace(/[\u00A0-\u2666]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; });
        content = content.replace('##', sIn);
        //content = content.replace(/#Title#/g, this.menuitem.innerText);
        content = content.replace(/#today#/g, today);
        content = content.replace(/#author#/g, $.accountName);
        content = content.replace(/=/g, '=3D');
        aFilename.push($.accountName);
        aFilename.push(today);
        var s = btoa(content);
        function b64toBlob(b64Data, contentType, sliceSize) {
          contentType = contentType || '';
          sliceSize = sliceSize || 512;
          var byteCharacters = atob(b64Data);
          var byteArrays = [];
          for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          var blob = new Blob(byteArrays, { type: contentType });
          return blob;
        }
        var blob = b64toBlob(s, 'text/html');
        url = window.URL.createObjectURL(blob);
        var link = document.createElement('A');
        link.href = url;
        link.setAttribute('download', aFilename.join(' ') + '.mht');
        link.click();
        window.URL.revokeObjectURL(url);
      };
      reader.readAsDataURL(blob);
    };
    xhr.send();
  },
  editor(e) {
    $(e.target.parentElement.previousElementSibling).editor();
  },
  request(e) {
    const url = e.target.parentElement.previousElementSibling.innerText;
    $().url(url).get().then(this.showResponse);
  },
  showResponse(e){
    const http = e.target;
    const request = e.target.request;
    let responseString = `HTTP/1.1 <b>${http.status} ${http.statusText}</b> ${http.response.length} bytes ${new Date().valueOf() - http.startTime.valueOf()}ms\r\n` + http.getAllResponseHeaders() + (http.responseText[0] === "{" ? JSON.stringify(JSON.parse(http.responseText), null, 2) : http.responseText);
    let requestString = `${request.method.toUpperCase()} ${request.URL.toString()}<br>${Object.entries(request.headers || {}).map(arr => arr[0] + ': ' + arr[1]).join('<br>')}`;
    const div = $('div').class('responsepanel').append(
      $('div').class('col').append(
        $('pre').class('code').css('white-space: pre-wrap; word-break: break-all; margin-bottom: 10px;').html(requestString),
        $('pre').class('code oa aco').html(responseString),
        $('div').append(
          $('button').class('abtn close').on('click', e => div.elem.remove())
        )
      )
    )
  },
  config(e) {
    // eval(e.target.parentElement.previousElementSibling.innerText)
    window.open(document.location.origin+document.location.pathname, 'sample');
  },
  allSamples() {
    let all = [...this.contentElement.elem.getElementsByClassName('code')];
    all.forEach(elem => {
      eval(elem.innerText);
      // //console.log('HHHHHHH');
      const formString = `$('form').properties(properties)`;
      this.contentElement.elem.insertBefore(
        $('div').class('apv').css('border:solid 1px #ccc;padding:20px;margin:10px 0;').append(
          $('form').properties(properties)
        ).elem,
        elem.nextElementSibling
      );
      this.contentElement.elem.insertBefore(
        $('pre').class('code').text(`$('form').properties(properties)`).elem,
        elem.nextElementSibling
      );
      this.contentElement.elem.insertBefore(
        $('div').class('apv').css('border:solid 1px #ccc;padding:20px;margin:10px 0;').append(
          $('div').properties(properties)
        ).elem,
        elem.nextElementSibling
      );
      this.contentElement.elem.insertBefore(
        $('pre').class('code').text(`$('div').properties(properties)`).elem,
        elem.nextElementSibling
      );
      // this.contentElement.elem.insertBefore(
      // 	$('pre').class('code').text(JSON.stringify(properties,null,2)).elem,
      // 	elem.nextElementSibling
      // );
    })
  }
};
