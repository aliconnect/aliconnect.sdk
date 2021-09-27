console.log('elem 111');
eol = '\n';
(function (){
  function toLink(s){
    return s.replace(/\(|\)|\[|\]|,|\.|\=|\{|\}/g,'').replace(/ /g,'-').toLowerCase();
  }
  const tagnames = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'frameset', 'frame', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr', ];
  const libraries = {
    start() {
            return;
      if ($.user) $().dashboard();
      else $().home();
    },
    sw() {
            if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', e => {
          console.log('MESSAGE', e);
          if (e.data && e.data.url) {
            const url = new URL(e.data.url);
            document.location.href = '#' + url.pathname + url.search;
          }
                            });
        navigator.serviceWorker.register('sw.js', { scope: '/' }).then(function(registration) {
                    $().sw = registration;
          return;
                    registration.pushManager
          .subscribe({ userVisibleOnly: true })
          .then(function(sub) {
                        const channel = new BroadcastChannel('sw-messages');
            channel.addEventListener('message', e => {
              console.log('Received', e.data);
            });
            console.log('SW', sub);
                        $().sw.active.postMessage(
              JSON.stringify({
                hostname: document.location.hostname,
                                                                              }),
            );
                      });
        })
        .catch(function(error) {
                  });
      }
    },
    om() {
    },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    loadclient() {
            $().on({
        load() {
          if ($().script && $().script.src) {
            const el = document.createElement('script');
            el.src = $().script.src;
            document.head.appendChild(el);
          }
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
  function Elem (selector) {
    const args = Array.from(arguments);
        const elem = document.getElementById(selector) || (tagnames.includes(selector) ? document.createElement(selector) : null);
    if (!elem) return selector;
    if (!(this instanceof Elem)) return new Elem(...arguments);
    selector = args.shift();
    this.elem = elem;
    this.elem.selector = this.elem.is = this;
    this.map = new Map();
    if (args.length){
      if (typeof this[elem.id] === 'function'){
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
  Elem.prototype = {
    append(){
			this.elem = this.elem || document.body;
                  Array.from(arguments).forEach(arg => {
        if (typeof arg === 'string') {
          this.elem.insertAdjacentHTML('beforeend', arg);
        } else if (Array.isArray(arg)) {
          arg.forEach(arg => this.append(arg));
        } else if (arg instanceof Elem) {
          this.elem.append(arg.elem);
        } else if (arg) {
          this.elem.append(arg);
        }
      });
						return this;
		},
    acceptScope(scope, socket_id) {
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
    },
  }
  Object.defineProperties(Elem.prototype, {
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
                              } else {
            this.elem.setAttribute(selector, [].concat(context).join(' '))
          }
        }
      }
      return this;
    }},
    assign: { enumerable: true, value: function (selector, context) {
			if (typeof selector === 'string') {
				this.elem[selector] = context;
			} else if (selector instanceof Object) {
				Object.assign(this.elem, context);
			}
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
    children: { get() { return Array.from(this.elem.children).map(el => $(el)); }},
    class: { value: function (className) {
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
            menu = $.extend({}, ...arguments);
      if (!menu.items) console.warn('no items', menu);
            const menuitems = new Map(Object.entries(menu.items));
            this.tabindex(0);
      this.on('keydown', e => {
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
                window.addEventListener('click', this.close, true);
        this.elemPopup = $('div')
        .parent(document.body)
        .class('col popup')
        .css('top', top+'px')
        .css('left', Math.max(0, left)+'px')
        .css('max-height', (window.screen.availHeight - top) + 'px')
                .append(
          [...menuitems.entries()].map(([name, menuitem]) => $('div').class('row abtn icn').extend(menuitem).extend({srcEvent:e})),
        );
        return;
    		if (this.handlers.menuElement) {
    			this.handlers.menuElement.remove();
    		}
    		    		    		    		    		    		    		if (targetElement.popupmenu) {
    			targetElement.right = 0;
    		}
    		    		    		menuElement.innerText = '';
    		for (let [menuname, menuitem] of Object.entries(menuItems)) {
    			    			    			if (menuitem.hidden) continue;
    			var linkElement = menuElement.createElement('A', {
    				name: menuname,
    				value: menuname,
    				elMenu: menuElement,
    				left: 5,
    				menuitem: menuitem,
    				popupmenu: menuitem.menu,
    				    				onclick: menuitem.onclick || (this.menu ? this.menu.onclick : null) || targetElement.onselect || function (e) {
    					    					e.stopPropagation();
    				},
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
              });
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
						      this.paint = new Paint(this.elem, options);
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
                return ['A', 'c ' + row.ID, row.Value || ($.getItem(row.tag) ? $.getItem(row.tag).Title : row.ID), {
					onclick: Web.Element.onclick,
					id: row.ID,
									},[
					['BUTTON', {
						type: 'BUTTON',
						row: row,
						onclick: $.removeUser = (e)=>{
							e.preventDefault();
							e.stopPropagation();
														new $.HttpRequest($.config.$, 'DELETE', `/${this.tag}/Users(${e.target.row.ID})`, e => {
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
                                                                                                                                                                              }),
              $('button').class('abtn close').on( 'click', this.closeCam = e => panelElem.remove() )
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
                  icon: 'https:                  image: 'https:                  data: {
                    url: document.location.href,
                  },
                                                                                                                                                                                                                                                                                                                                                                                                                            }
              }
            }
          });
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
      };
      this.elem.innerHTML = replace.yaml(this.elem.innerText);
      this.elem.markup = true;
      return this;
    }},
    editor: { value: function (lang) {
                                          this.class('code-editor');
      const his = [];
			const elem = this.elem;
      const rectContainer = this.elem.getBoundingClientRect();
      const html = lang ? $.string[lang](elem.innerText) : elem.innerText;
      let rows;
      let selLine;
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
              };
      this.src = url => {
      };
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
			      .on('paste', e => {
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
                    if (el.hasAttribute('hide')) {
            for (var el; el && el.hasAttribute('hide'); el = e.keyCode >= 39 ? el.nextSibling : el.previousSibling);
            if (el) {
              if (e.keyCode === 37) col=el.innerText.length;
              if (e.keyCode === 39) col=0;
              var range = window.getSelection().getRangeAt(0).cloneRange();
              var [node,pos] = getNode(el, Math.min(col, el.innerText.length));
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
                    if (!e.ctrlKey) {
            if (e.keyCode >= 0x30 || e.keyCode == 0x20) {
              const rowsOpen = children.map(el => el.getAttribute('open'));
              $(el).markup();
              console.log(el, col);
              setCaret(el, col);
                                                                                                                                                                                                                                                                                                                                                                                                                                                              }
          }
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
                    item[attributeName] = JSON.stringify(this.files);
                    this.emit('change');
          callback(file);
        })
      });
      this.removeElem = (elem, e) => {
        e.stopPropagation();
        elem.remove();
        this.files = [...this.elem.getElementsByClassName('file')].map(e => e.is.get('ofile'));
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
        console.debug(this, files, item, attributeName);         return;
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
                        return;
                        if (ofile.src) {
              this.src(ofile.src);
            }
            return this;
            const access_token = $.auth.access_token;
            const iss = $.auth.access.iss;
            if (!ofile.src) return imgElement;
            var src = (ofile.srcs || ofile.src) + '?access_token=' + access_token;
            imgElement.src = (src.indexOf('http') === -1 ? ofile.host || "https:            var src = (ofile.src) + '?' + ofile.lastModifiedDate;
            imgElement.srcl = (src.indexOf('http') === -1 ? ofile.host || "https:            imgElement.alt = ofile.name || '';
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
                      $().ws().sendto($().aliconnector_id, {external: {filedownload: ['http:                        console.log(e);
                      });
                    }
                  }),
                                                                                                                                                                                  ),
              ),
            );
            elem.elem.ofile = ofile;
                      }
        })
      })
      .emit('change')
    }},
		filesNext: { value: function () {
			this.filesSlide(1);
			if (this.slideIdx == 0 && get.pv) {
							}
		}},
		filesSlide: { value: function (step) {
																		this.images = this.elem.getElementsByClassName('aimage');
						this.slideIdx += step || 0;
			this.imagesElement.setAttribute('prev', this.slideIdx > 0);
			this.imagesElement.setAttribute('next', this.slideIdx < this.images.length - 1);
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
								elSlide.play();
			}
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
									      									return $('header')
      .class('row header', item.tag)
      .draggable()
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
                          ),
            $('div', 'header subject', item.header1),
            $('div', 'header preview', item.header2),
                        $('div', 'row date')
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
      });
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
										var startSize = parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize);
					for (var i = 7; i >= 1; i--) {
						formatDoc('fontsize', i);
						if (parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize) < startSize) break;
					}
				},
			};
			const keysdown = {
				ctrl_KeyD() {
										formatDoc('strikeThrough');
				},
			};
      this
      .contenteditable('')
      .on('paste', e => {
                console.log(e, e.clipboardData, e.clipboardData.files, e.clipboardData.types.includes('Files'));
      })
      .on('drop', e => {
        e.preventDefault();
        if (e.dataTransfer.files) {
          [...e.dataTransfer.files].forEach(file => {
            property.item.elemFiles.appendFile(file).then(file => {
              console.log(file);
                            if (window.getSelection) {
                var sel, range, html;
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                                    range = sel.getRangeAt(0);
                  range.deleteContents();
                  var elImg = document.createElement('img');
                  elImg.src = file.srcs || file.src;
                  range.insertNode(elImg);
                  range.setStartAfter(elImg);
                                                                                                                              sel.removeAllRanges();
                  sel.addRange(range);
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
								oDoc.currentRange = null;
								document.execCommand('defaultParagraphSeparator', false, 'p');
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
							if (sLnk && sLnk != '' && sLnk != 'http:								formatDoc('createlink', sLnk)
							}
						}),
						stateButtons.unlink = $('button').class('abtn unlink').on('click', e => formatDoc('unlink')),
						$('button').class('abtn clean split').on('click', e => {
							if(validateMode()&&confirm('Are you sure?')){ this.innerHTML = this.value; }
						}),
						$('button').class('abtn print').on('click', e => printDoc()),
											).on('click', e => {
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
															return this;
		}},
    index: { value: function (docelem){
      docelem = $(docelem);
            const all = Array.from(docelem.elem.getElementsByClassName("anchor")).filter(el => el.nextElementSibling);
                  if (all[0]) {
        const topItem = docelem.topItem = all[0].parentElement;
        const elemTop = docelem.elemTop = docelem.elem.getBoundingClientRect().top;
        const findAll = docelem.findAll = all.slice().reverse();
        const allmenu = docelem.allmenu = [];
        let i = 0;
        var li;
        var path = [];
        function addChapters (ul, level) {
          for (let elem = all[i]; elem; elem = all[i]) {
                        const tagLevel = Number(elem.nextElementSibling.tagName[1]);
            path.slice(0, tagLevel-1);
                        const title = elem.getAttribute('title');
            path[tagLevel-1] = title.toLowerCase().replace(/ /g,'_');
            const name = elem.getAttribute('name');                        if (tagLevel === level) {
                                                                      li = $('li').parent(ul).append(
                elem.a = $('a').text(title).href('#' + name).attr('open', '0').attr('target', '_self')
              );
              i++;
              allmenu.push(elem.a);
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
        (document.body.onscroll = e => {
          clearTimeout(to);
                                                  to = setTimeout(() => {
                        console.log(elemTop);
                        const elem = findAll.find(el => el.getBoundingClientRect().top < elemTop) || topItem;
            if (elem && elem.a) {
                                                                                                                                                          allmenu.forEach(a => a.attr('open', '0').attr('select', null));
              const path = [];
              for (var p = elem.a.elem; p.tagName === 'A' && p.parentElement && p.parentElement.parentElement; p=p.parentElement.parentElement.parentElement.firstChild) {
                p.setAttribute('select', '');
                p.setAttribute('open', '1');
                path.push(p);
              }
              $(elem.a.elem).scrollIntoView();
            }
          }, 500);
                  })();
                        return this;
                this.addNextPreviousButtons()
      }
		}},
    item: { value: function (item, name) {
      if (item) {
        if (name) {
                    item.elems = item.elems || new Map();
                    item.elems.set(name, this);
        }
        this.elem.item = item;
        return this;
        this.set('item', item);
      }
            for (var elem = this.elem; elem && !elem.item; elem = elem.parentElement);
            return elem ? elem.item : null;
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
      function rawSrc(src) {
        console.log(777, src, document.location.hostname);
        src = src.replace(/\/(blob|tree)\/main/,'');
        if (document.location.hostname.split('.').pop() === 'localhost') {
                              src = new URL(new URL(src, document.location).pathname, 'http:        } else if (!src.match(/githubusercontent/)) {
                              src = src.replace(/\/\/([\w\.-]+)\.github\.io/, '          src = src.replace(/github.com/, 'raw.githubusercontent.com');
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
                var wikiPath = rawSrc(src).replace(/wiki$/, 'wiki/').replace(/[\w\.-]*$/,'');
                        if (!elem.paths.includes(wikiPath)) {
          console.log(9, 'loadMenu', wikiPath, this.links);
          elem.paths.push(wikiPath);
          await $().url(rawSrc(wikiPath+'_Sidebar.md')).accept('text/markdown').get().catch(console.error)
          .then(e => {
            this.doc.leftElem.md(e.target.responseText);
            Array.from(this.doc.leftElem.elem.getElementsByTagName('A')).forEach(elem => $(elem).href(hrefSrc(elem.getAttribute('href'), e.target.responseURL)));
          });
          Array.from(this.doc.leftElem.elem.getElementsByTagName('LI')).forEach(li => {
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
                      });
          this.links = Array.from(this.doc.leftElem.elem.getElementsByTagName('A'));
        }
              };
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
                  } else {
          elem.loadIndex = true;
        }
				let content = e.target.responseText;
        if (callback) {
          content = callback(content);
        }
        const responseURL = e.target.responseURL;
        var title = responseURL.replace(/\/\        var match = content.match(/^#\s(.*)/);
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
									} catch (err) {
									}
				this.doc.docElem.text('').append(
          this.doc.navElem = $('nav'),
          $('h1').text(title),
          date ? $('div').class('modified').text(__('Last modified'), new Date(date).toLocaleString()) : null,
        )
        .md(content)
        .mdAddCodeButtons();
        this.doc.docElem.renderCode();
                                                                                                                                                                [...this.doc.docElem.elem.getElementsByTagName('A')].forEach(elem => $(elem).href(hrefSrc(elem.getAttribute('href'), responseURL)));
        [...this.doc.docElem.elem.getElementsByTagName('IMG')].forEach(elem => {
                                                                                                                                                                elem.setAttribute('src', new URL(elem.getAttribute('src'), new URL(src, document.location)).href.replace(/^.*?\        });
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
																																																																					let map = new maps.Map(this.elem, { zoom: 8 });
			bounds = new maps.LatLngBounds();
			geocoder = new maps.Geocoder();
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
									}
			});
					}},
    renderCode: { value: function (responseURL) {
      Array.from(this.elem.getElementsByTagName('code')).forEach(elem => {
        if (elem.hasAttribute('source')) {
          $().url(hrefSrc(elem.getAttribute('source'), responseURL)).get().then(e => {
            var content = e.target.responseText.replace(/\r/g, '');
            if (elem.hasAttribute('id')) {
              var id = elem.getAttribute('id');
              var content = content.replace(new RegExp(`.*?<${id}>.*?\n(.*?)\n(\/\/|<\!--) <\/${id}.*`, 's'), '$1').trim();
            }
            if (elem.hasAttribute('function')) {
              var id = elem.getAttribute('function');
              var content = content.replace(/\r/g, '').replace(new RegExp(`.*?((async |)function ${id}.*?\n\})\n.*`, 's'), '$1').trim();
            }
            content = window.markdown().render(content, elem.getAttribute('language'));
                                    $(elem).class('block').append($('pre').html(content.trim()));
                                  });
        }
      });
      return this;
    }},
    md: { value: function (content) {
      if (window.markdown) {
        for (let [key,value] of Object.entries($.his.api_parameters)) {
          content = content.replace(key,value);
        }
        const mdElem = $('div').html(window.markdown().render(content));
        for (let divElement of mdElem.elem.getElementsByTagName('DIV')) {
          if (divElement.hasAttribute('source')) {
            var loadingTask = pdfjsLib.getDocument(divElement.getAttribute('source'));
            loadingTask.promise.then(async pdf => {
                            var numPages = pdf.numPages;
                            for (var pageNumber=1, numPages = pdf.numPages;pageNumber<=numPages;pageNumber++) {
                await pdf.getPage(pageNumber).then(function(page) {
                  var scale = 1;
                  var viewport = page.getViewport({scale: scale});
                                    var a = $('a').parent(divElement).href(divElement.getAttribute('source'));
                  var canvas = $('canvas').parent(a).elem;
                                                      var context = canvas.getContext('2d');
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;
                                    var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                  };
                  var renderTask = page.render(renderContext);
                  renderTask.promise.then(function () {
                                      });
                });
              }
                          }, function (reason) {
                            console.error(reason);
            });
                      }
        }
                this.elem.append(...mdElem.elem.childNodes);
      }
                                                			return this;
		}},
    mdc: { value: function (s) {
      const newlines = [];
      let level = 0;
      $.string.mdHtml(s).split(/\n/).forEach(line => {
        const match = line.match(/^<h(\d)>(>\s)/);
        if (match) {
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
                  /\/*\/.*?\/*\                );
              } else if (type === 'yaml') {
                block.html = block.html.replace(
                  /`yaml`/s, '`'+codeElem.innerText + '`',
                );
              } else if (type === 'css') {
                block.html = block.html.replace(
                  /\/*\/.*?\/*\                );
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
								if (('on'+selector in this.elem) && !this.elem['on'+selector]) {
					this.elem['on'+selector] = context
									} else {
					this.elem.addEventListener(...arguments);
				}
			}
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
						let subtotal = 0;
			function nr(val) {
				return Number(val).toLocaleString(undefined, {minimumFractionDigits: 2});
			}
			this.append(
				$('form')
				.class('col aco payform doc-content')
				.attr('action', '/?order')
				.attr('novalidate', 'true')
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
                            function onchange (e) {
  							const formElement = e.target.form;
                item[e.target.name] = e.target.value;
  							e.target.modified = true;
  							let address = [
                  ['Street', 'Number'].map(name => formElement[prefix + name].value).filter(Boolean).join('+'),
                  ['PostalCode', 'City'].map(name => formElement[prefix + name].value).filter(Boolean).join('+'),
                  ['Country'].map(name => formElement[prefix + name].value).filter(Boolean).join('+'),
  							].join(',');
                  							$().url('https:  								address: address,
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
  									  									  									canvas.remove();
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
                            console.log('CEHCKBOX', this.name);
							$('div')
              .parent(this.selector)
              .class('col input check',this.format || this.type || '',this.property.name)
              .append(
                $('div').class('row check').append(
                  $('input')
                  .on('change', e => this.value = e.target.checked ? 'on' : null)
                  .type('checkbox')
                                                      .checkbox(this, this.property, this.attributes),
                )
							);
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
                                                    )
                .html(this.displayvalue),
  						)
  					},
  					edit(property) {
              							$('div').parent(this.selector).class('col prop input',this.format || this.type || '',this.property.name).append(
								this.input = $('input')
                .class(
                  'inp focus aco',
                  this.className,
                                                    )
                .id(this.name)
                .name(this.property.name)
                .attr(this)
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
  						  						const files = new Files(this, this.elEdit);
  						if (this.item && this.item.editBarElement) {
  							if (!this.item.files) {
  								this.item.files = files;
  								this.item.editBarElement.createElement('button', 'abtn attach', {type: 'button', accept: '', onclick: files.openDialog});
  								this.item.editBarElement.createElement('button', 'abtn image', {type: 'button', accept: 'image/*', onclick: files.openDialog});
  							}
  						}
  						this.elEdit.append(files.elem);
  						  						  						  						  						  						  						  						  					},
  					createView() {
  						const files = new Files(this);
  						this.item.files = this.item.files || files;
  						  						  						return this.elView = files.elem;
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
  										  									}
  								});
  							}, function() {
  								  							});
  						} else {
  							alert('NOT navigator.geolocation');
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
                                                    )
                .displayvalue(this.property.name)
                .item(this.property.item, this.name + 'view')
                  						)
  					},
            createInput() {
              console.log(this.textvalue);
  						this.elInp = this.elEdit.createElement('select', 'inp row aco', { item: this.item, name: this.name });
  						this.elEdit.createElement('LABEL', '', this.title || this.name);
  						let selected = [];
  						let value = this.value || this.defaultvalue || '';
  						  						if (this.type === 'array') {
  							this.elInp.setAttribute('multiple', '');
  							selected = value ? String(value).split(',') : [];
  							  						}
  						if (Object.prototype.toString.call(this.options) === '[object Array]') {
  							for (var i = 0, optionvalue; optionvalue = this.options[i]; i++) {
  								var optionElement = this.elInp.createElement('option', '', optionvalue, { value: optionvalue, selected: selected.includes(optionvalue) });
  							}
  						} else {
  							for (let [optionName, option] of Object.entries(this.options)) {
  								  								var optionElement = this.elInp.createElement('option', '', typeof option === 'object' ? option.title || optionName : option, { value: optionName });
  								if (selected.includes(optionName)) {
  									optionElement.setAttribute('selected', '');
  								}
  							}
  						}
  						  						  						this.elInp.addEventListener('change', e => {
  							this.value = [...e.target.options].filter(option => option.selected).map(option => option.value).join(',');
  							  							  							  							  							  						}, true);
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
  						const data = {};                						$('div').parent(this.selector)
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
                                e.detail.items
                .filter(item => item.header0.toLowerCase().includes(value))
                .forEach(item => $('option').parent(listElement).text(item.subject).value(item.header0 === item.tag ? item.header0 : item.header0 + ' ' + item.tag))
              });
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
                                                                  if (linkitem) {
                        this.property.item.attr(this.name, {
                          AttributeID: this.data ? this.data.AttributeID : null,
                          LinkID: linkitem.ID,
                        }, true).then(item => {
                          console.log('updated');
                                                    item.details(true).then(item => $('view').show(item, true));
                        })
                      }
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
                                    .on('click', e => {
                    console.log(this.property.item.tag);
                    $().send({
                                            path: `/${this.property.item.tag}/${this.name}()`,
                      method: 'post',
                                          })
                  })
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
                                    .on('click', e => {
                    console.log(this.property.item.tag);
                    $().send({
                                            path: `/${this.property.item.tag}/${this.name}()`,
                      method: 'post',
                                          })
                  })
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
                                    .on('click', e => {
                    console.log(this.property.item.tag);
                    $().send({
                                            path: `/${this.property.item.tag}/${this.name}()`,
                      method: 'post',
                                          })
                  })
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
                    function Property () {
            if (!property) return;
            this.property = property;
            this.selector = selector;
            this.name = name;
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
                            this.ownprop = data.some(data => data && data.Value && data.SrcID && data.SrcID == ID );
              this.srcprop = data.some(data => data && data.Value && data.SrcID && data.SrcID != ID);
              this.className = [
                this.ownprop ? 'ownprop' : '',
                this.srcprop ? 'srcprop' : '',
              ].join(' ')
                          }
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
          await importScript(scriptPath + '/js/qrcode.js');
        }
        new QRCode(elem, selector);
        if (elem.tagName === 'IMG') {
          elem.src = elem.firstChild.toDataURL("image/png");
          elem.firstChild.remove();
        }
      })();
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
			<link rel="stylesheet" href="https:			<script src="https:			<style><!-- style --></style>
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
								return content.join('\n').trim();
			}
			      const ref = {};
      sample.template = sample.template || htmlScript;
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
																			}
			}
			if (elem.getAttribute('open') === '0') {
				return setOpen(1);
															}
			elem.setAttribute('selected', '');
			elem.scrollIntoViewIfNeeded(false);
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
								selector.css('left', elem.moveX = 0).css('z-index', ZINDEX).attr('active', null);
			};
			selector
			.attr(pos, '')
						.class('seperator noselect')
			.on('mousedown', start)
			.css('z-index',ZINDEX);
			return this;
		},},
    set: { value: function () {
      return this.map.set(...arguments);
    },},
    show: { value: function (item, doEdit) {
                  item.details().then(e => {
                ItemSelected = item;
        this.item = item;
        document.title = item.header0;
        $().ga('send', 'pageview');
                                                                function logVisit() {
          console.debug('logVisit');return;           if (item.data.ID) {
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
                    fieldsElement.createElement('DIV', 'row users', [
  					__('To') + ': ',
  					['DIV', 'row aco', userElement],
  				]);
          if (Array.isArray(this.Users)) {
  					this.Users.forEach((row)=>{
  						userElement.push(['A', 'c ' + row.ID, row.Value || ($.getItem(row.tag) ? $.getItem(row.tag).Title : row.ID), {
  							  							href: '#'+row.tag,
  							  							  						}], ';\u00A0');
  					});
  				}
        }
        function printmenu() {
          return;
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
                                                        $('li').class('abtn').text('Api key').on('click', e => {
                aimClient.api('/').query('request_type', 'api_key').query('expires_after', 30).post({
                  sub: item.ID,
                  aud: item.ID
                }).get().then(body => {
                  $('dialog').open(true).parent(document.body).text(body);
                  console.log(body);
                })
              }),
                                          $('li').class('abtn doc').text('Breakdown').on('click', e => {
                $().list([]);
                aimClient.api(`/${item.tag}`).query('request_type', 'build_breakdown').get().then(body => {
                  const data = body.value;
                  console.log(data);
                  const topitem = data.find(child => child.ID == item.data.ID);
                  const items = [];
                  (function build(item, tagname) {
                    console.log(item);
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
                                          }
                  });
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
                                                                  const properties = Object.entries(item.schema.properties)
                      .filter(([propertyName, property])=> item[propertyName])
                      .map(([propertyName, property])=> $('li').class('prop').append(
                        $('label').text(propertyName+': '),item[propertyName],
                      ));
                      return [
                        $('h'+level).text(item.header0),
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
                            $('a').class('abtn download').text('config_data').href(`https:              $('a').class('abtn download').text('data_v1').href(`https:            )),
            $('button').class('abtn msg').attr('cnt', item.data.Messages ? item.data.Messages.length : 0).on('click', this.showMessages),
            $('button').class('abtn send').on('click', e => {
              new $.HttpRequest($.config.$, 'GET', `/${this.item.schema}(${this.item.id})?mailing`, e => {
                                alert(this.responseText);
              }).send();
              return false;
            }),
            $('button').class('abtn fav').attr('checked', isFav).on('click', e => e => this.fav ^= 1),
            $('button').class('abtn edit').name('edit').on('click', e => this.edit(item)).append(
              $('ul').append(
                                                                $('li').class('abtn share').text('share').on('click', e => e.stopPropagation()).on('click', e => $().prompt('share_item')),
                $('li').class('abtn read').text('readonly').attr('disabled', '').on('click', e => e.stopPropagation()),
                $('li').class('abtn public').text('public').on('click', e => this.scope = 'private').on('click', e => e.stopPropagation()),
                $('li').class('abtn private').text('private').on('click', e => this.scope = 'public').on('click', e => e.stopPropagation()),
                $('li').class('abtn upload mailimport').text('Importeer mail uit outlook')
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
                                                                $.clipboard.setItem([item], 'selected', '');
        let link;
        if (item.data.link) {
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
								$('div').style('display:block;width:100%;height:400px;background:white;border:solid 1px red;')
				.attr('height',400)
				.width(400)
				.parent(this.main)
												.modelDigraph(body)
			});
		},},
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
                  const width = this.width() || container.offsetWidth;
      const height = this.height() || container.offsetHeight;
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
                                        var loader = new THREE.TDSLoader( );
                                loader.load( options.src, function ( object ) {
                                                                                                    scene.add( object );
        } );
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
                this.append( renderer.domElement );
        controls = new THREE.TrackballControls( camera, renderer.domElement );
                $(window).on('resize', resize, false).emit('resize');
        setTimeout(() => {
          renderer.render( scene, camera );
        },200);
        if (options.hasControls) {
          animate();
        }
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
																	});
								if (menuitem.showbody) menuitem.showbody();
								for (var itemname in menuitem.items) {
									var item = $.$.menu.items[itemname];
									if (item) {
										item.elLink = createElement('DIV', { className: 'row bgd' }).createElement('A', {
											name: itemname, className: 'row aco abtn icn ' + item.className, innerText: item.Title, menuitem: item,
																						par: item.get,
											onclick: Element.onclick,
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
                                              },},
	});
  [
    'parentElement',
    'nextSibling'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: true,
    get() {
      return this.elem[name] ? this.elem[name].is : null;
    },
  }));
  [
    'default',
    'autoplay'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: true,
    value: function attr() {
      return this.attr(name, '');
    }
  }));
  [
    'focus',
    'select'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: true,
    value: function fn() {
            this.elem[name](...arguments);
                        return this;
    }
  }));
  [
    'draggable'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: true,
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
    enumerable: true,
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
            'codebase',
    'color',
    'cols',
    'colspan',
    'content',
    'contenteditable',
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
        'title',
    'translate',
        'usemap',
    'value',
    'width',
    'wrap'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: true,
    value: function attrValue() {
      return this.attr(name, ...arguments);
    }
  }));
  [
    'click',
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: true,
    value: function exec() {
      this.elem[name](...arguments);
      return this;
    }
  }));
  [
    'submit',
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: true,
    value: function emit() {
      this.emit(name, ...arguments);
      return this;
    }
  }));
  function url_string(s) {
    return s.replace(/%2F/g, '/');
  }
  function TreeListview() {}
  Object.defineProperties(TreeListview.prototype, {
    construct:{ value: function construct(selector) {
      this.selector = selector;
      const elem = this.elem = this.selector.elem;
      const self = this;
      this.menu = {
        items: {
          previous: {
            class: 'previous',
            text: 'previous',
            hotkey: 'Up',
            key: 'ArrowUp',
            on: {
              click: e => this.setFocusElement(this.getPreviousElement(e), e),
            },
          },
          next: {
            class: 'next',
            text: 'next',
            hotkey: 'Down',
            key: 'ArrowDown',
            on: {
              click: e => this.setFocusElement(this.getNextElement(e), e),
            },
          },
          selectUp: {
            class: 'previous',
            text: 'Select previous',
            hotkey: 'Shift+Up',
            key: 'shift_ArrowUp',
            on: {
              click: e => this.setFocusElement(this.getPreviousElement(e), e),
            },
          },
          selectDown: {
            class: 'next',
            text: 'Select next',
            hotkey: 'Shift+Down',
            key: 'shift_ArrowDown',
            on: {
              click: e => this.setFocusElement(this.getNextElement(e), e),
            },
          },
          moveUp: {
            class: 'moveup',
            text: 'Move up',
            hotkey: 'Ctrl+Up',
            key: 'ctrl_ArrowUp',
            on: {
              click: e => this.moveUp(e),
            },
          },
          moveDown: {
            class: 'movedown',
            text: 'Move down',
            hotkey: 'Ctrl+Down',
            key: 'ctrl_ArrowDown',
            on: {
              click: e => this.moveDown(e),
            },
          },
        }
      };
      elem.addEventListener('click', e => {
        if (e.itemElement) {
          self.setFocusElement(e.itemElement, e);
        }
      }, true);
      $(elem).extend({
        cancel(e) {},
        onkeydown(e) {
          clearTimeout(self.arrowTimeout);
          if (document.activeElement === document.body) {
            const str = e.keybuffer.join('').trim();
            if (str) {
              const listItems = [...elem.getElementsByClassName('item')];
              const elementFind = listItems.find(elem => elem.is.item() && String(elem.is.item().header0) && String(elem.is.item().header0).toLowerCase().includes(str));
              if (elementFind) {
                self.setFocusElement(elementFind, e);
              }
            }
          }
        },
      });
    }},
    getOffsetElement:{ value: function getOffsetElement(offset, e) {
            const focusElement = e && e.target && e.target.is && e.target.is.srcEvent ? e.target.is.srcEvent.path.find(el => el.item) : this.focusElement;
            const listElements = [...this.elem.getElementsByClassName('item')].filter(el => el.tagName !== 'I');
      for (var index = listElements.indexOf(focusElement) + offset, elem; elem = listElements[index]; index+=offset) {
        if (elem.offsetParent !== null) {
          break;
        }
      };
      return elem;
    }},
    getPreviousElement:{ value: function getPreviousElement(e) {
      return this.getOffsetElement(-1, e);
    }},
    getNextElement:{ value: function getNextElement(e) {
      return this.getOffsetElement(1, e);
    }},
    move:{ value: function move(e, offset) {
            console.log(e.target.parentElement);
      const itemElem = e.path.find(el => el.item);
      this.setFocusElement(itemElem);
      if (this.focusElement) {
        e.preventDefault();
        e.stopPropagation();
        const parent = this.focusElement.parentElement.item;
        const index = [...this.focusElement.parentElement.children].indexOf(this.focusElement) - 1;
                                                $.link({
          name: 'Master',
          item: this.focusElement.item,
          to: parent,
                    index: index + offset,
          action: 'move',
        })
        .then(item => {
          console.log('move done', item, item.elemTreeLi.elem);
          this.setFocusElement(item.elemTreeLi.elem);
        });
              }
    }},
    moveUp:{ value: function moveUp(e) {
      this.move(e, -1);
    }},
    moveDown:{ value: function moveDown(e) {
      this.move(e, 1);
    }},
    setFocusElement:{ value: function setFocusElement(newFocusElement, e) {
            const elem = this.elem;
      const list = [...elem.getElementsByClassName('item')].filter(elem => elem.item);
      if (e) {
        e.preventDefault();
      }
            if (newFocusElement && newFocusElement !== this.focusElement) {
        if (e && e.shiftKey) {
          e.stopPropagation();
          elem.multiSelectStartElement = elem.multiSelectStartElement || newFocusElement;
          const startIndex = list.indexOf(elem.multiSelectStartElement);
          const thisIndex = list.indexOf(newFocusElement);
          const [firstIndex,lastIndex] = thisIndex > startIndex ? [startIndex,thisIndex] : [thisIndex,startIndex];
          const all = list.slice(firstIndex,lastIndex+1);
          $.clipboard.setItem(all.map(elem => $(elem).item()), 'checked', '');
        } else {
          if (e && e.ctrlKey) {
            e.stopPropagation();
          } else {
            elem.multiSelectStartElement = newFocusElement;
                        if (newFocusElement) {
              $(newFocusElement).emit('focusselect');
              if (newFocusElement.item) {
                $.clipboard.setItem([newFocusElement.item], 'checked', '');
              }
            }
                                  }
        }
        if (this.focusElement && this.focusElement.removeAttribute) {
          this.focusElement.removeAttribute('focus');
        }
        if (newFocusElement instanceof aim.Elem) {
          console.log('Elem', newFocusElement);
        }
        this.focusElement = newFocusElement;
      }
      if (this.focusElement instanceof Element) {
        $(this.focusElement).attr('focus', '');
        if (this.focusElement && this.focusElement.firstChild && this.focusElement.firstChild.focus) {
          $(this.focusElement.firstChild).scrollIntoView();
          setTimeout(() => this.focusElement.firstChild.focus(), 100);
        }
      }
      return this.focusElement;
    }},
    setSelectElement:{ value: function setSelectElement(elem) {
      console.log('setSelectElement', elem);
            if (elem && elem.is.item()) {
        const item = elem.is.item();
        $('view').show(item);
                return;
        if (elem && elem.is.item() && elem !== this.selectElement) {
                    this.selectElement = elem;
          $('view').show(elem.is.item());
                  }
        return elem;
      }
          }},
    selectFocusElement:{ value: function selectFocusElement(newFocusElement) {
      if (newFocusElement) {
                const e = window.event;
        this.setFocusElement(newFocusElement, e);
        clearTimeout(this.arrowTimeout);
        this.arrowTimeout = setTimeout(() => this.setSelectElement(this.focusElement), e.type === 'keydown' ? 200 : 0);
                return;
              }
    }},
  });
  function Listview (selector) {
    selector.class('row aco listview');
    this.construct(...arguments);
    const elem = this.elem;
    const self = this;
    this.viewType = document.body.getAttribute('view');
    $(elem).extend({
      keyup: {
        ArrowUp: e => this.selectFocusElement(),
        ArrowDown: e => this.selectFocusElement(),
      },
      keydown: {
                                        shift_alt_ArrowDown: e => this.moveDown(e),
        shift_alt_ArrowUp: e => this.moveUp(e),
        ctrl_ArrowDown: e => this.moveDown(e),
        ctrl_ArrowUp: e => this.moveUp(e),
        ArrowRight: e => {
                  },
        ArrowLeft: e => {
                                                          },
      },
    });
      };
  Object.defineProperties(Listview.prototype = new TreeListview, {
    activeFilterAttributes:{ value: {}},
    calendar:{ value: function () {
      $('div').class('aco').parent(this.div.text(''))
      .calendar(this.itemsVisible)
    }},
    chart:{ value: function () {
      $('div').class('aco').parent(this.div.text('')).chart(this.itemsVisible)
                                                          }},
    clickfilter:{ value: function (e) {
      const target = e.target;
      const activeFilterAttributes = this.activeFilterAttributes;
      activeFilterAttributes[target.name] = activeFilterAttributes[target.name] || [];
      if (activeFilterAttributes[target.name].includes(target.value)) {
        activeFilterAttributes[target.name].splice(activeFilterAttributes[target.name].indexOf(target.value), 1);
      } else {
        activeFilterAttributes[target.name].push(target.value);
      }
      if (!activeFilterAttributes[target.name].length) {
        delete activeFilterAttributes[target.name];
      }
      var searchParams = new URLSearchParams(document.location.search);
      searchParams.set('f',btoa(JSON.stringify(activeFilterAttributes)));      window.history.pushState('page', 'PAGINA', '?' + searchParams.toString() );
      this.refilter();
    }},
    data:{
      get(){
        return this.items;
      },
      set(data) {
        if (Array.isArray(data)) {
        }
        if (typeof data === 'string')
        this.show(data);
      },
    },
    elementSelect:{ value: function (el) {
            if (this.elSelect) this.elSelect.removeAttribute('selected');
      if (!el) return;
      this.setFocusElement(el);
      (this.elSelect = el).setAttribute('selected', '');
    }},
    filtersOpen:{ value:{}, writable: true },
    filterAttributes:{ value:{}, writable: true },
    fill:{ value: function () {
      this.itemsVisible.forEach(row => {
        if (row.elemListLi && row.elemListLi.elem) {
          const h = document.documentElement.clientHeight;
          const rect = row.elemListLi.elem.getBoundingClientRect();
          const visible = rect.bottom > -h && rect.top < h + h;
          if (!visible) {
            row.elemListLi.text('');
          } else if (!row.elemListLi.elem.innerText) {
          this.listnode(row)
        }
        }
      });
    }},
    ganth:{ value: function () {
      $('div').class('aco').parent(this.div.text('')).ganth(this.itemsVisible)
    }},
    go:{ value: function () {
      return $.Go.create({ el: listItemElement, data: this.items });
    }},
    get:{ value:{}},
    getProperties:{ value: function () {
      const schemaNames = this.itemsVisible.map(item => item.schemaName).unique();
      const schemas = [...Object($().schemas()).entries()].filter(([schemaName, schema]) => schemaNames.includes(schemaName));
      const schemaKeys = schemas.map(([schemaName, schema]) => schemaName);
      let properties = [].concat(
        'Tagname',
        'LinkTagname',
        'header0',
        'header1',
        'header2',
                        ...schemas.map(([schemaName, schema]) => schemaName), ...schemas.filter(([key, schema]) => !['hidden'].includes(schema.format)).map(([key, schema]) => Object.keys(schema.properties)),
        'ID',
        'level',
      ).unique();
      properties = properties.filter(name => this.itemsVisible.some(item => item.data[name]));
      return properties;
    }},
    listnode:{ value: function (item) {
      const li = item.elemListLi;
      const [stateOption, stateOptions] = item.options('State');
      const [catOption, catOptions] = item.options('Categories');
      const iconsrc = item.iconsrc;
      let icon;
      if (iconsrc) {
        icon = $('img', {src: iconsrc || ''});
      } else if (item.gui && item.gui.global) {
        icon = $('div', 'gui global').append(
          $('div', 'object').append(
            $('div', item.tag).append(
              $('div', item.tag).append(item.gui.global),
            ),
          ),
        );
                                                                                                                                      }
      if (item.elemListLi) {
        item.elemListLi
        .text('')
        .attr('online', item.online)
        .checked(item.checked)
        .css('border-color', item.modColor)
        .attr('viewstate', item.viewstate)
        .append(
          $('div').class('itemrow row card noselect aco').append(
            $('i', 'modified'),
            $('button').class('abtn stateicon').append(
              $('i').append(
                $('i').css('background-color', item.stateColor),
              ),
              li.elemStateUl = $('ul').class('col').append(
                                                                              )
            )
            .on('mouseenter', function (e) {
              const rect = this.getBoundingClientRect();
                                          li.elemStateUl.css('top', Math.min(rect.top, window.innerHeight-li.elemStateUl.elem.clientHeight-20)+'px').css('left', rect.left+'px');
            }),
                                                                                                $('div')
            .class('icn itemicon', item.className)
            .css('color', item.schemaColor)
            .append(
              icon,
              $('div', 'bt sel').on('click', e => e.stopPropagation(item.checked ^= 1)),
            ),
            $('div', 'col aco').append(
              $('div', 'kop row')
              .attr('hassrc', item.srcID ? 1 : 0)
                            .attr('hasattach', item.hasAttach)
              .attr('type', item.type)               .append(
                $('span', 'aco header title').text(item.header0),
                $('div', 'icn hdn type').on('click', e => document.location.href = '#id=' + item.srcID),
                $('div', 'icn del').on('click', e => item.delete()),
                $('div', 'icn hdn attach'),
                $('div', 'icn fav').attr('checked', item.fav).on('click', e => {
                  item.fav ^= 1;
                  e.stopPropagation();
                }),
                $('div', 'icn flag').on('click', e => {
                  if (!item.FinishDateTime) {
                    item.FinishDateTime = aDate().toISOString();
                  } else {
                    item.FinishDateTime = '';
                    var d = aDate();
                    d.setDate(aDate().getDate() + 6);
                    d.setHours(16, 0, 0, 0);
                    d.toLocal();
                    item.EndDateTime = d.toISOString();
                  }
                }),
              ),
              $('div', 'header subject', item.header1),
              $('div', 'header preview', item.header2).append(
                item.operations ? item.operations.map(o => $('a', '', o.title, o)) : null,
              ),
            ),
          )
        )
      }
                                  }},
    maps:{ value: async function () {
                        this.div.text('').append(
        this.mapElem = $('div').class('googlemap').css('width:100%;height:100%;'),
      );
      const maps = await $.his.maps();
      const mapOptions = {
        zoom: 10,
        center: { lat: 51, lng: 6 },        mapTypeId: maps.MapTypeId.ROADMAP,
                                                                                                                                                                                        styles: $().maps.styles,
      };
      const map = new maps.Map(this.mapElem.elem, mapOptions);
                                                                        var bounds = new maps.LatLngBounds();
            const dataItems = this.itemsVisible.filter(item => item.data.Location && item.data.data);
      if (dataItems.length) {
        dataItems.forEach(item => item.value = Object.values(item.data.data).reduce((a,b) => a+b));
        const maxValue = dataItems.map(item => item.value).reduce((a,b) => Math.max(a,b));
        console.log(maxValue);
        dataItems.forEach(item => item.scale = 1 + 2 / maxValue * item.value);
      }
      this.itemsVisible.filter(item => item.data.colorid && item.schema.colorid).forEach(item => item.color = item.schema.colorid[item.data.colorid] || item.schema.colorid.default);
      this.itemsVisible.filter(item => item.data.Location).forEach(item => {
        const loc = item.data.Location.split(',');
        const marker = new maps.Marker({
          position: {
            lat: Number(loc[0]),
            lng: Number(loc[1]),
          },
          map: map,
          item: item,
          zIndex: Number(1),
          title: [item.header0,item.header1,item.header2].join('\n'),
                    icon: {
                                                                                                path: maps.SymbolPath.CIRCLE,
            fillColor: 'red',
            fillOpacity: .6,
            scale: 10,             strokeColor: 'white',
            strokeWeight: .5
          },
          icon: {
                                                            path: "M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z",
            scale: (item.scale || 1)/2,
            fillColor: item.color || "blue",
            fillOpacity: 0.6,
            strokeWeight: 0,
            strokeColor: 'white',
            rotation: 0,
            anchor: new maps.Point(15, 30),
          },
                  });
                marker.addListener('click', e => $('view').show(item));
        bounds.extend(marker.getPosition());
      });
            map.fitBounds(bounds);
            if (maps.e) {
        maps.e.addListenerOnce(map, 'bounds_changed', function () { this.setZoom(Math.min(15, this.getZoom())); });
      }
          }},
    refilter:{ value: function () {
      for (let [attributeName, attribute] of Object.entries(this.filterAttributes)) {
        attribute.cnt = 0;
        attribute.checked = false;
        for (var fieldvalue in attribute.values) {
          var field = attribute.values[fieldvalue];
          field.cnt = 0;
          field.checked = this.activeFilterAttributes && this.activeFilterAttributes[attributeName] && this.activeFilterAttributes[attributeName].indexOf(fieldvalue) > -1;
          attribute.checked = attribute.checked || field.checked;
        }
      }
      this.items.forEach(row => {
        row.hidden = false;
        for (let [attributeName, attribute] of Object.entries(this.activeFilterAttributes)) {
          if (!(attributeName in row.filterfieldslower) || attribute.indexOf(row.filterfieldslower[attributeName]) === -1) {
            row.hidden = true;
            break;
          }
        }
      });
                                                                                                                                                                              this.itemsVisible = this.items.filter(item => !item.hidden);
      this.selector.text('')
      .attr('hidefilter', $().storage('hidefilter'))
      .append(
        $('div', 'row top abs btnbar np').append(
          $('button').class('abtn select').on('click', e => this.selector.attr('hidefilter', $().storage('hidefilter', this.selector.attr('hidefilter')^1).storage('hidefilter'))),
          $('span').class('aco').text(this.title + ' (' + this.items.length + ')'),
          $('button').class('abtn add').append(
            $('ul').append(
              [...$().schemas().entries()].map(
                ([name,schema]) => $('li')
                .class('abtn')
                .draggable()
                .text(name)
                .item($(schema), 'elemAdd')
                .on('click', e => {
                  e.stopPropagation();
                  const targetItem = this.tag ? $(this.tag) : null;
                  const sourceItem = Item.toData($(schema));
                                    $().copyFrom(sourceItem, targetItem).then(item => {
                    $('view').show(item, true);
                  });
                })
              ),
            ),
          ),
          $('button').class('abtn refresh').on(
            'click', e => aimClient
            .api(document.location.pathname.replace(/\/id\/.*/,''))
            .query(document.location.search).get().then(item => $().list(item))
          ),
          $('button').class('abtn download').append(
            $('ul').append(
              $('li').class('abtn toexcel').text('Excel').on('click', e => {
                const properties = this.getProperties();
                const data = this.itemsVisible.map(item => Object.fromEntries(properties.map(key => [key, item[key]] )));
                let ws = XLSX.utils.json_to_sheet(data);
                let wb = XLSX.utils.book_new();
                                let title = 'export';
                XLSX.utils.book_append_sheet(wb, ws, title);
                XLSX.writeFile(wb, title + '.xlsx');
              }),
            )
          ),
          $('button').class('abtn print').on('click', null),
          $('button').class('abtn filter').attr('title', 'Lijst filteren').on('click', e => $.show({ flt: get.flt ^= 1 }) ),
          $('button').class('abtn sort').attr('title', 'Menu Opties sorteren openen').append(
            $('ul').append(
              $('li').class('abtn').text('Title').on('click', e => this.sortby('Title')),
              $('li').class('abtn').text('Subject').on('click', e => this.sortby('Subject')),
              $('li').class('abtn').text('Summary').on('click', e => this.sortby('Summary')),
              $('li').class('abtn').text('Deadline').on('click', e => this.sortby('EndDateTime')),
            ),
          ),
          $('button').class('abtn view', this.viewType).append(
            $('ul').append(
              $('li').class('abtn rows').text('Lijst').on('click', e => this.rewrite('rows')),
              $('li').class('abtn cols').text('Tegels').on('click', e => this.rewrite('cols')),
              $('li').class('abtn table').text('Tabel').on('click', e => this.rewrite('table')),
              !this.hasMapsData ? null : $('li').class('abtn maps').text('Maps').on('click', e => this.rewrite('maps')),
              !this.hasChartData ? null : $('li').class('abtn chart').text('Graph').on('click', e => this.rewrite('chart')),
              !this.hasDateData ? null : $('li').class('abtn ganth').text('Ganth').on('click', e => this.rewrite('ganth')),
              !this.hasDateData ? null : $('li').class('abtn calendar').text('Calendar').on('click', e => this.rewrite('calendar')),
              $('li').class('abtn flow').text('Flow').on('click', e => this.rewrite('flow')),
              !this.hasModelData ? null : $('li').class('abtn model').text('Model').on('click', e => this.rewrite('go')),
              $('li').class('abtn model2d').text('2D').on('click', e => {
                                                                                colpage.item.model2d();
              }),
              $('li').class('abtn model3d').text('3D').on('click', e => {
                                                                                colpage.item.model3d();
              }),
            ),
          ),
        ),
        this.filter = $('ul', 'col afilter liopen np noselect').id('afilter')
        .css('max-width', $().storage('afilter.width') || '150px').on('click', e => document.body.setAttribute('ca', 'lvfilter')),
        $('div').seperator(),
        this.div = $('div', 'col aco oa').on('scroll', e => {
          clearTimeout($.toBodyScroll);
          $.toBodyScroll = setTimeout(() => this.fill(), 100);
        }),
      );
      this.rewrite();
      this.filterFields.forEach(filterfield => filterfield.avalues.sort((a,b)=>{
        if (a.cnt > 0 && b.cnt === 0) return -1;
        if (a.cnt === 0 && b.cnt > 0) return 1;
        return a.value.localeCompare(b.value, {}, 'numeric');
      }));
      this.filter.append(...this.filterFields.filter(
        filterfield => filterfield.avalues.length > 1 || filterfield.avalues[0].items.length != this.items.length
      ).map(
        filterfield => $('li', 'col')
        .open(filterfield.open = this.filtersOpen[filterfield.name] || filterfield.checked)
        .attr('cnt', filterfield.cnt || 0)
        .checked(filterfield.checked)
        .append(
          $('a').class('row')
                    .on('click', e => this.filtersOpen[filterfield.name] = filterfield.listItemElement.getAttribute('open') = filterfield.open)
          .append(
            $('span').class('aco attrlabel').ttext(filterfield.Title),
          ),
          $('ul')
          .checked(filterfield.checked)
          .attr('meer', filterfield.meer || 0)
          .open(filterfield.avalues.some(field => field.checked))
          .append(
            filterfield.avalues
            .filter(field => field.Title && (filterfield.checked || field.checked || field.cnt))
            .map(
              (field,i) => $('li').class('row')
              .setProperty('btbg', 'red')
              .append(
                $('input')
                .type('checkbox')
                .on('change', e => this.clickfilter(e))
                .checkbox(filterfield, field),
              )),
              $('div')
              .class('meer')
              .on('click', e => $(e.target.parentElement)
              .attr('meer', $(e.target.parentElement).attr('meer')^1)),
                          )
          )
        )
      );
      return this;
      if (filterElement) {
        filterElement.innerText = '';
        this.filterFields.forEach(filterfield => {
          filterfield.avalues.sort((a,b)=>{
            if (a.cnt > 0 && b.cnt === 0) return -1;
            if (a.cnt === 0 && b.cnt > 0) return 1;
            return a.value.localeCompare(b.value, {}, 'numeric');
          });
          filterfield.listItemElement = filterElement.createElement('LI', 'col', {
            cnt: filterfield.cnt || 0,
            checked: filterfield.checked || 0,
            open: filterfield.open = this.filtersOpen[filterfield.name] || filterfield.checked || 1
          }, [
            ['A', 'row', {
              onclick: (e)=> {
                this.filtersOpen[filterfield.name] = filterfield.listItemElement.getAttribute('open') = filterfield.open;
              }
            }, [
              ['SPAN', 'aco', __(filterfield.Title)]
            ]],
          ]);
          filterfield.listItemElement = filterfield.listItemElement.createElement('UL', {
            checked: filterfield.checked || 0,
            meer: filterfield.meer || 0
          });
          var ic = 0;
          for (var i = 0, field; field = filterfield.avalues[i]; i++) {
            if (!field.Title) continue;
            if (filterfield.checked || field.checked || field.cnt) {
              if (field.checked) {
                filterfield.listItemElement.setAttribute('open', filterfield.open = 1);
              }
              filterfield.listItemElement.createElement('LI', 'row', {
                ondragover(e) {
                  e.dataTransfer.dropEffect = 'move';
                  e.stopPropagation();
                  e.preventDefault();
                },
                ondrop(e) {
                                    var par = {};
                  par[this.filterfield.name] = field.Title;
                  if ($.dragdata.item) $.dragdata.item.set(par);
                }
              }, [
                ['INPUT', '', {
                  type: 'checkbox',
                  value: field.value,
                  name: filterfield.name,
                  id: filterfield.name + field.value + i,
                  checked: field.checked,
                  onchange: e => this.clickfilter(e),
                }],
                ['LABEL', 'aco', __(field.Title), { for: filterfield.name + field.value + i }],
                ['SPAN', '', field.cnt],              ]);
              ic++;
            }
          }
          if (ic > 5) {
            filterfield.listItemElement.createElement('LI', 'meer', {
              onclick() {
                filterfield.listItemElement.setAttribute('meer', filterfield.meer ^= 1)
              }
            });
          }
        });
      }
    }},
    rewrite:{ value: function (viewType) {
      localStorage.setItem('viewType', viewType = this.viewType = viewType || localStorage.getItem('viewType'));
      const itemsVisible = this.itemsVisible;
      itemsVisible.forEach(row => {
        for (var attributeName in this.filterAttributes) {
          if (row.filterfieldslower && row.filterfieldslower[attributeName] && this.filterAttributes[attributeName].values) {
            var value = row.filterfieldslower[attributeName];
            if (this.filterAttributes[attributeName].values[value]) {
              this.filterAttributes[attributeName].values[value].cnt++;
              this.filterAttributes[attributeName].cnt++;
            }
          }
        }
      });
      this.div.text('');
      if (this[this.viewType]) {
        return this[this.viewType]();
      }
      $('summary')
      .class('col list')
      .parent(this.div)
      .contextmenu(this.menu)
      .append(...itemsVisible.map(
        item => item.elemListLi = $('li')
        .class('item')
        .draggable()
        .item(item, 'listview')
        .on('click', e => this.select(item))
        .on('focusselect', e => {
          clearTimeout($.arrowTimeout);
          $.arrowTimeout = setTimeout(() => this.select(item), window.event.type === 'keydown' ? 300 : 0);
        })
        .on('change', e => this.listnode(item))
        .emit('change')
                                                                                                                                                                                                                                                              ));
      this.fill();
    }},
    select:{ value: function (item, e) {
                        this.setFocusElement(item.elemListLi.elem, e);
      $().execQuery({
        v: urlToId(item.data['@id']),
      });
                }},
    set:{ value: function (set) {
                                                      for (var name in set) if (this.get[name] != set[name]) break; else name = null;
      if (!name) return;
                        Object.assign(this.get, set);
                        this.schema = this.get.schema || ($.getItem(this.get.folder) ? $.getItem(this.get.folder).schema : null) || this.get.folder;
      this.childClasses = $.config.components.schemas[this.schema] && $.config.components.schemas[this.schema].childClasses ? $.config.components.schemas[this.schema].childClasses : [this.schema];
                  for (var name in this.get) if (!this.get[name]) delete this.get[name];
            if (this.get.folder && Number(this.get.folder) && $.getItem(this.get.folder)) {
        $.getItem(this.get.folder).focus();
        if ($.getItem(this.get.folder).children.length) {
          this.show($.getItem(this.get.folder).children);
          return
        }
      }
      this.show(this.data[this.get.Title] || []);
            if (!this.get.q) return;
            var get = this.get;
      this.loadget = {};
      "folder, filter, child, q, select".split(", ").forEach(function (name) { if (get[name]) this.loadget[name] = get[name]; });
      delete this.loadget.select;
      new $.HttpRequest($.config.$, 'GET', this.loadget, e => {
                this.show(e.body.value);
      }).send();
                            }},
    show:{ value: async function (items, path) {
      if (Array.isArray(this.items = (await items) || [])) {
        this.viewMap = new Map();
        this.title = path || '';
        this.tag = ((this.items.url||'').match(/\w+\(\d+\)/)||[''])[0];
        if (this.items.url) {
                                                                                                                                                                                                                          }
        itemsVisible = [];
        this.elMeer = null;
        this.filterAttributes = {};
        if (document.getElementById('elBanner')) {
          document.getElementById('elBanner').style.display = 'none';
        }
        if (window.aThree && window.aThree.initdone) {
          return;
        }
        if ($.clipboardtree) {
          if ($.clipboardtree.elSelected) $.clipboardtree.elSelected.removeAttribute('selected');
          if ($.his.folder) {
            var item = $.getItem($.his.folder.substr(1).split('?').shift());
            if (item && item.elemTreeLi) ($.clipboardtree.elSelected = item.elemTreeLi).setAttribute('selected', '');
          }
        }
                                                        this.items = this.items.filter(Boolean).map(item => item instanceof Item ? item : Item.get(item));
                this.hasDateData = this.items.some(item => item.data.EndDateTime && item.data.StartDateTime);
                this.hasChartData = this.items.some(item => item.data.data && item.data.key);
        this.hasMapsData = this.items.some(item => item.data.Location);
        this.hasModelData = this.items.some(item => item.data.Title && item.data.linkto);
                this.items.forEach((row, i) => {
                                        row.createListRowElement = row.createListRowElement || Item.createListRowElement;
          if (row['@id'] && Item(row['@id'])) row = this.items[i] = Item(row['@id']);
          const properties = row.schema.properties || {};
          const filternames = Object.entries(properties).filter(([name,prop])=>prop.filter);
          row.filterfields = Object.fromEntries(row.filternames.filter(name => row[name]).map(name => [name,row[name]]));
                                                            row.filterfields.schemaName = row.schemaName;
          row.filterfields.hasAttach = row.hasAttach ? 'ja' : 'nee';
                    row.filterfields.state = row.state;
                                                                                                    $.config.components = $.config.components || {};
          $.config.components.schemas = $.config.components.schemas || {};
          var cfgclass = $.config.components.schemas[row.schema] || {};
          var filterfields = {};
          row.filtervalues = [];
          for (var attributeName in row.filterfields) {
                        var fieldtitle = __(row.properties && row.properties[attributeName] && row.properties[attributeName].title ? row.properties[attributeName].title : attributeName);
            if (cfgclass && cfgclass.fields && cfgclass.fields[attributeName]) var fieldtitle = cfgclass.fields[attributeName].Title || cfgclass.fields[attributeName].placeholder || attributeName;
            row.filtervalues.push(row.filterfields[attributeName]);
            var value = String(row.filterfields[attributeName]).trim().toLowerCase();
            filterfields[attributeName] = value;
            this.filterAttributes[attributeName] = this.filterAttributes[attributeName] || {
              values: [],
              avalues: [],
              Title: fieldtitle
            };
            this.filterAttributes[attributeName].values[value] = this.filterAttributes[attributeName].values[value] || {
              value: value,
              Title: row.filterfields[attributeName],
              items: [],
              checked: false,
            };
            this.filterAttributes[attributeName].values[value].items.push(row);
          };
          row.filterfieldslower = filterfields;
        });
        if (this.viewType === 'chart' && !this.hasChartData) {
          $(document.body).attr('view', '');
        }
        this.filterFields = [];
        for (let [attributeName, attribute] of Object.entries(this.filterAttributes)) {
          attribute.name = attributeName;
          for (let [fieldvalue, value] of Object.entries(attribute.values)) {
            attribute.avalues.push(attribute.values[fieldvalue]);
          }
                    if (attribute.avalues.length > 1 || attribute.avalues[0].cnt != this.items.length) {
            this.filterFields.push(attribute);
          }
        };
        var searchParams = new URLSearchParams(document.location.search);
        if (searchParams.has('f')) {
          this.activeFilterAttributes = JSON.parse(atob(searchParams.get('f')));
          for (var attributeName in this.activeFilterAttributes) {
            if (!(attributeName in this.filterAttributes)) {
              delete this.activeFilterAttributes[attributeName];
            } else {
              for (var i = 0, val; val = this.activeFilterAttributes[attributeName][i]; i++) if (!(val in this.filterAttributes[attributeName].values)) {
                this.activeFilterAttributes[attributeName].splice(this.activeFilterAttributes[attributeName].indexOf(val), 1);
                i--;
              }
              if (!this.activeFilterAttributes[attributeName].length) {
                delete this.activeFilterAttributes[attributeName];
              }
            }
          }
        }
        this.idxstart = 0;
        this.filterFields.sort((a, b)=> {
          return a.name.localeCompare(b.name, {}, 'numeric');
        });
        this.refilter();
      }
      return this;
    }},
    sortby:{ value: function (sortname) {
      this.sortdir = this.sortname == sortname ? -this.sortdir : 1;
      this.sortname = sortname;
      console.debug(sortname);
      this.btns.sort.className = this.sortdir == 1 ? '' : 'asc';
      this.items.sort(function (a, b) {
        return this.sortdir * String(a[this.sortname]).localeCompare(String(b[this.sortname]), {}, 'numeric');
      }.bind(this));
      refilter();
          }},
    sortlist:{ value: function (a, b) {
            if (a.masterID && b.masterID && a.masterID == b.masterID) {
        if (a.index < b.index) return -1;
        if (a.index > b.index) return 1;
        return 0;
      }
      if (a.prio && b.prio && a.prio < b.prio) return -1;
      if (a.prio && b.prio && a.prio > b.prio) return 1;
      if (a.FinishDateTime && !b.FinishDateTime) return 1;
      if (!a.FinishDateTime && b.FinishDateTime) return -1;
      if (a.FinishDateTime && b.FinishDateTime) {
        if (a.FinishDateTime < b.FinishDateTime) return -1;
        if (a.FinishDateTime > b.FinishDateTime) return 1;
      }
      if (a.fav && !b.fav) return -1;
      if (!a.fav && b.fav) return 1;
            if (a.lastvisitDT && !b.lastvisitDT) return -1;
      if (!a.lastvisitDT && b.lastvisitDT) return 1;
      if (a.lastvisitDT && b.lastvisitDT) {
        if (a.lastvisitDT.substr(0, 10) < b.lastvisitDT.substr(0, 10)) return -1;
        if (a.lastvisitDT.substr(0, 10) > b.lastvisitDT.substr(0, 10)) return 1;
      }
      if (a.accountprice && !b.accountprice) return -1;
      if (!a.accountprice && b.accountprice) return 1;
                                          if (a.EndDateTime && b.EndDateTime) {
        if (a.EndDateTime < b.EndDateTime) return -1;
        if (a.EndDateTime > b.EndDateTime) return 1;
      }
                  if (a.StartDateTime && b.StartDateTime) {
        if (a.StartDateTime < b.StartDateTime) return -1;
        if (a.StartDateTime > b.StartDateTime) return 1;
      }
                              if (a.searchname && b.searchname) {
        var awords = a.searchname.match(/\w+/g),
        bwords = b.searchname.match(/\w+/g),
        ia = 999,
        ib = 999,
        l = $.his.search.value.length;
        for (var i = 0, word; word = awords[i]; i++) {
                    if (word.indexOf($.his.search.value) != -1) ia = Math.min(ia, word.indexOf($.his.search.value) + word.length - l);
                            }
        for (var i = 0, word; word = bwords[i]; i++) {
                    if (word.indexOf($.his.search.value) != -1) ib = Math.min(ib, word.indexOf($.his.search.value) + word.length - l);
                                                          }
                                                if (ia < ib) return -1;
        if (ia > ib) return 1;
      }
      return 0;
    }},
    table:{ value: function () {
      const properties = this.getProperties();
      const tableElem = $('table').parent(this.div.text('')).class('list').append(
        $('thead').append(
          $('tr').append(
            $('th'),
            properties.map(propertyName => $('th').class('attrlabel').ttext(propertyName)),
          ),
        ),
        $('tbody').append(
          this.itemsVisible.map(item => $('tr')
          .item(item, 'tableview')
          .on('click', e => $('view').show(item))
          .draggable()
          .append(
            $('td')
            .class('icn', item.schemaName)
            .css('color', item.schemaColor),
            properties.map(propertyName => $('td').text(item.getDisplayValue(propertyName))),
          )),
        ),
      ).resizable();
    }},
    _init1:{ value: function (get) {
      Object.assign(this, get);
      refilter();
    }},
    _focus:{ value: function (item, e) {
                        $.clipboard.setItem([item], 'checked', '');
      clearTimeout(this.arrowTimeout);
      this.arrowTimeout = setTimeout(() => this.select(item), e && e.type === 'keydown' ? 500 : 0);
      $().view(item);
            return;
      if (newFocusElement) {
                const e = window.event;
        this.setFocusElement(newFocusElement, e);
                return;
              }
    }},
  });
  function Treeview(selector) {
    this.construct(...arguments);
    selector.class('col aco atv noselect np')
    .contextmenu(this.menu)
    .append(
      $('nav', 'row top abs btnbar np').append(
        $('button').class('abtn r popout').on('click', e => {
          var url = document.location.origin;
                    const rect = this.elem.getBoundingClientRect();
          console.log(this.win);
          if (this.win) {
            console.log(this.win);
            return this.win.focus();
          }
          const win = this.win = window.open(url, null, `top=${window.screenTop},left=${window.screenLeft+document.body.clientWidth-rect.width},width=${rect.width},height=${rect.height}`);
          window.addEventListener('beforeunload', e => win.close());
          const doc = this.win.document;
          doc.open();
          doc.write(pageHtml);
          doc.close();
          const aim = $;
          win.onload = function (e) {
            const $ = this.$;
            const document = win.document;
            $(document.documentElement).class('app');
            $(document.body).class('col aim om bg').id('body').append(
                              $('section').tree().class('aco').style('max-width:auto;'),
                            $('footer').statusbar(),
            );
            (async function () {
              await $().translate();
              await $().getApi(document.location.origin+'/api/');
              await $().login();
              if (aim().menuChildren) {
                $().tree(...aim().menuChildren);
              }
                                          $().tree(aim.user.data);
            })()
          }
        }),
        $('button').class('abtn pin').on('click', e => {
          $(document.body).attr('tv', $(document.body).attr('tv') ? null : 0);
        }),
              ),
      om.navleft = this.listElem = $('div').id('om-navleft').class('col aco oa list'),
    );
    console.log(om.navleft);
    const elem = this.elem;
    const self = this;
    Object.assign(Item.prototype, {
      edit() {
        const elem = $('input')
        .parent(this.elemTreeTitle.text(''))
        .class('aco')
        .value(this.header0)
        .on('focus', e => e.stopPropagation())
        .on('change', e => this.header0 = e.target.value)
        .on('blur', e => this.elemTreeLi.emit('change'))
        .on('keydown', e => {
          e.stopPropagation();
          if (['Enter','Escape'].includes(e.key)) {
            $(e.target).emit('blur');
            this.elemTreeDiv.focus();
            e.preventDefault();
          }
        })
        .focus().select()
      },
      close(e) {
        var item = this.item || this;
              },
      focus(e) {
        self.setFocusElement(this.elemTreeLi);
        return;
                return;
                                if (self.focusElement && self.focusElement.elemTreeLi) {
          self.focusElement.elemTreeLi.removeAttribute('focus');
                  }
                                                                if (!e || e.type !== 'mousemove') {
          $.scrollIntoView(self.focusElement.elemTreeLi.elemTreeDiv.elem);
        }
        if (self.focusElement.elemTreeLi) {
          self.focusElement.elemTreeLi.setAttribute('focus', '');
                                                                                                                                                                                                                                                                                                                                                  }
              },
      setSelect(e) {
        this.focus();
        if (this.selectedElement) {
          this.selectedElement.removeAttribute('selected');
        }
        if (this.elemTreeLi) {
          (this.selectedElement = this.elemTreeLi).setAttribute('selected', '');
        }
      },
      select(e) {
        $('view').show(this);
        $().list(this.children);
        return;
                this.setSelect();
        $.attr(this, 'treeselect', '');
        document.location.href = `#/${this.tag}/children/id/${btoa(this['@id'])}?$select=${$.config.listAttributes}&$filter=FinishDateTime+IS+NULL`;
                              },
      close(e) {
        if (this.elemTreeLi.elemTreeDiv) {
                    self.openItemsSave();
        }
      },
      async open(e) {
        return self.open(this);
      },
    });
    $(elem).extend({
      close() {
        $(document.body).attr('tv', 0);
      },
                                                                                                                        selitems: function () {
                $.clipboard.items.forEach(function (item) {
          $.clipitems.push(item);
          e.elemTreeLi.setAttribute('checked', e.type);
        });
      },
      keydown: {
                                                                        ArrowUp: e => this.setFocusElement(this.getPreviousElement(), e),        shift_ArrowUp: e => this.setFocusElement(this.getPreviousElement(), e),        ArrowDown: e => this.setFocusElement(this.getNextElement(), e),        shift_ArrowDown: e => this.setFocusElement(this.getNextElement(), e),        shift_alt_ArrowDown: e => this.moveDown(e),
        shift_alt_ArrowUp: e => this.moveUp(e),
        ctrl_ArrowDown: e => this.moveDown(e),
        ctrl_ArrowUp: e => this.moveUp(e),
        ArrowLeft(e) {
          if (self.focusElement) {
            const item = self.focusElement.item;
            if (item.elemTreeLi.elemTreeDiv.attr('open') == 1) {
              item.elemTreeLi.elemTreeDiv.attr('open', 0);
            } else if (item.master) {
              item.master.focus();
            }
          }
        },
        ArrowRight(e) {
          return;
                    if (self.focusElement) {
            const item = self.focusElement.item;
                                    if (elem.open) return elem.open = 1;            elem.keydown.ArrowDown(e);
            item.select();
          }
        },
        shift_alt_ArrowLeft: e => this.outdent(e),
        shift_alt_ArrowRight: e => this.ident(e),
        ctrl_ArrowLeft: e => this.outdent(e),
        ctrl_ArrowRight: e => this.ident(e),
        ctrl_Delete(e) {
          if (self.focusElement) {
            const nextElement = self.focusElement.nextElementSibling || self.focusElement.previousElementSibling || self.focusElement.parentElement.parentElement;
            self.focusElement.item.delete();
            self.setFocusElement(nextElement);
          }
        },
        ctrl_Backspace(e) {
          if (self.focusElement) {
            const nextElement = self.focusElement.nextElementSibling || self.focusElement.previousElementSibling || self.focusElement.parentElement.parentElement;
            self.focusElement.item.delete();
            self.setFocusElement(nextElement);
          }
        },
        async Enter(e) {
                    if (document.activeElement === document.body && self.focusElement) {
            const focusItem = self.focusElement.item;
                        if (!self.focusElement.hasAttribute('treeselect')) {
              return focusItem.select();
            }
            const schemaName = focusItem.schemaName;
            const parentItem = focusItem.master;
            const schemaIndex = parentItem.children.filter(child => child.schemaName === schemaName).length;
            const item = await parentItem.appendItem(focusItem, {
              schemaName: schemaName,
              Title: schemaName + schemaIndex,
            });
            if (focusItem.isClass) {
              param.srcID = param.masterID = master.id;
            }
            item.focus();
            item.edit();
          }
        },
                                                                                                                                                async Insert(e) {
                    if (document.activeElement === document.body && self.focusElement) {
            e.preventDefault();
                        const parentElement = self.focusElement;
            const parentItem = parentElement.item;
            const schemaName = parentItem.schemaName;
            const childItem = {
              schemaName: schemaName,
              Title: schemaName,
            };
            parentItem.appendItem(null, childItem);
          }
        },
        async ctrl_Insert(e) {
                    if (document.activeElement === document.body && self.focusElement) {
            const parentItem = self.focusElement.item;
            const schemaName = parentItem.schemaName;
            const schemaIndex = parentItem.children ? parentItem.children.filter(child => child.schemaName === schemaName).length : 0;
            const item = await parentItem.appendItem(null, {
              schemaName: schemaName,
              Title: schemaName + schemaIndex,
            });
            item.Src = { LinkID: parentItem.ID };
            item.focus();
            item.edit();
          }
        },
      }
    });
      }
  Object.defineProperties(Treeview.prototype = new TreeListview, {
    childnode:{ value: function childnode(child) {
      return (child.elemTreeLi = $('details'))
      .open($.his.openItems.includes(child.tag))
      .item(child, 'treeview')
      .on('toggle', async e => {
                                                if (e.target.open) {          let children = await child.children || [];
                    children.sort((a, b) => a.index > b.index ? 1 : a.index < b.index ? -1 : 0 );
          child.elemTreeLi.append(
            children
            .filter(item => !(item.elemTreeLi || this.childnode(item)).elem.contains(child.elemTreeLi.elem) )
            .map(child => child.elemTreeLi || this.childnode(child))
          );
        }
        this.openItemsSave();
      })
      .on('close', e => this.close(child))
      .on('keyup', e => {
        e.preventDefault();
        e.stopPropagation();
      })
      .on('keydown', e => {
                        const keydown = {
          Space: e => {
            if (this.focusElement) {
              this.focusElement.item.select();
            }
          },
                                                                                          ArrowLeft: e => {
            if (this.focusElement) {
              const item = this.focusElement.item;
              if (this.focusElement.open) {
                this.focusElement.open = false;
              } else if (this.focusElement.parentElement) {
                this.setFocusElement(this.focusElement.parentElement);
              }
            }
          },
                                                                                                                                            ArrowRight: e => {
            e.preventDefault();
            e.stopPropagation();
            if (this.focusElement) {
              this.focusElement.open = true;
            }
                      },
          ctrl_Enter: e => {
                        if (this.focusElement) {
              $()
              .copyFrom(this.focusElement.item.source || this.focusElement.item.class, this.focusElement.parentElement.item, this.focusElement.item.index)
              .then(item => setTimeout(()=>{
                this.setFocusElement(item.elemTreeLi.elem);
                item.edit();
              }));
            }
          },
          shift_alt_ArrowLeft: e => this.outdent(e),
          shift_alt_ArrowRight: e => this.ident(e),
          ctrl_ArrowLeft: e => this.outdent(e),
          ctrl_ArrowRight: e => this.ident(e),
          ctrl_Delete: e => {
            const nextElement = this.focusElement.nextElementSibling || this.focusElement.previousElementSibling || this.focusElement.parentElement;
            console.log('ctrl_Delete', nextElement, this.focusElement, this.focusElement.parentElement);
            this.focusElement.item.delete().then(item => setTimeout(() => this.setFocusElement(nextElement)));
          },
          Delete: e => {
            const nextElement = this.focusElement.nextElementSibling || this.focusElement.previousElementSibling || this.focusElement.parentElement;
            console.log('DELETE', nextElement);
            $.link({
              name: 'Master',
              item: this.focusElement.item,
              to: null,
              current: this.focusElement.parentElement.item,
              action: 'move',
            }).then(item => this.setFocusElement(nextElement))
          },
          ctrl_Backspace(e) {
            if (self.focusElement) {
              const nextElement = self.focusElement.nextElementSibling || self.focusElement.previousElementSibling || self.focusElement.parentElement.parentElement;
              self.focusElement.item.delete();
              self.setFocusElement(nextElement);
            }
          },
          async Enter(e) {
                        if (document.activeElement === document.body && self.focusElement) {
              const focusItem = self.focusElement.item;
                            if (!self.focusElement.hasAttribute('treeselect')) {
                return focusItem.select();
              }
              const schemaName = focusItem.schemaName;
              const parentItem = focusItem.master;
              const schemaIndex = parentItem.children.filter(child => child.schemaName === schemaName).length;
              const item = await parentItem.appendItem(focusItem, {
                schemaName: schemaName,
                Title: schemaName + schemaIndex,
              });
              if (focusItem.isClass) {
                param.srcID = param.masterID = master.id;
              }
              item.focus();
              item.edit();
            }
          },
                                                                                                                                                                                    async Insert(e) {
                        if (document.activeElement === document.body && self.focusElement) {
              e.preventDefault();
                            const parentElement = self.focusElement;
              const parentItem = parentElement.item;
              const schemaName = parentItem.schemaName;
              const childItem = {
                schemaName: schemaName,
                Title: schemaName,
              };
              parentItem.appendItem(null, childItem);
            }
          },
          async ctrl_Insert(e) {
                        if (document.activeElement === document.body && self.focusElement) {
              const parentItem = self.focusElement.item;
              const schemaName = parentItem.schemaName;
              const schemaIndex = parentItem.children ? parentItem.children.filter(child => child.schemaName === schemaName).length : 0;
              const item = await parentItem.appendItem(null, {
                schemaName: schemaName,
                Title: schemaName + schemaIndex,
              });
              item.Src = { LinkID: parentItem.ID };
              item.focus();
              item.edit();
            }
          },
          F2: e => {
            if (this.focusElement) {
              this.focusElement.firstChild.disabled = true;
              this.focusElement.item.edit();
            }
          }
        };
                if (this.focusElement && keydown[e.keyPressed]) {
          e.stopPropagation();
          e.preventDefault();
          keydown[e.keyPressed](e);
        }
      })
      .on('change', e => {
        child.elemTreeLi
        .class('item', child.className)
        .hasChildren(1 || child.hasChildren)
        .name(child.name)
        .attr('inherited', child.isInherited ? 'ja' : 'nee')
        .elemTreeDiv.text('').append(
          $('i', 'open').on('click', function elemTreeDivClick (e) {
                        e.stopPropagation();
            child.elemTreeLi.emit('toggle');
                                  }),
          $('i', 'state').css('background-color', child.stateColor),
          $('i').class('icn folder', child.className)
                    .css('color', child.schemaColor),
          child.elemTreeTitle = $('span').class('title row aco')
                    .attr('schemaPath', ((child.data||{}).schemaPath || '').split(':').slice(0,-1).join(' :'))
          .append(
            $('span').class('aco').ttext(child.header0),
            $('i').class('icn',child.type),
          )
                    .on('dblclick', e => {
            e.stopPropagation();
            elem.setAttribute('sel', child.IsSelected ^= 1);
          }),
                            );
      })
      .append(
        (child.elemTreeDiv = child.elemTreeLi.elemTreeDiv = $('summary'))
        .class('row', child.reltype, child.srcID == child.masterID ? 'derived' : '')
        .attr('isClass', child.isClass)
        .draggable()
        .attr('groupname', child.groupname)
        .on('click', e => this.select(child, e))
        .on('click', e => document.body.hasAttribute('tv') ? document.body.setAttribute('tv', 0) : null)
        .on('dblclick1', child.toggle)
        .on('moveup', e => this.move(e, -1))
        .on('movedown', e => this.move(e, +1))
      )
      .emit('change')
    }},
    close:{ value: function close(item) {
      if (item.elemTreeLi && item.elemTreeLi.elemTreeDiv) {
        item.elemTreeLi.elemTreeDiv.attr('open', '0');
        this.openItemsSave();
      }
    }},
    data:{
      get() {
          },
      set(data) {
          },
    },
    ident:{ value: async function ident(e) {
      e.preventDefault();
      this.focusElement.previousElementSibling.open = true;
      $.link({
        name: 'Master',
        item: this.focusElement.item,
        to: this.focusElement.previousElementSibling.item,
                index: 9999999,
        action: 'move',
      }).then(item => item.elemTreeLi.elemTreeDiv.scrollIntoView());
    }},
    outdent:{ value: function outdent(e) {
      e.preventDefault();
      const index = [...this.focusElement.parentElement.parentElement.children].indexOf(this.focusElement.parentElement) - 1;
      $.link({
        name: 'Master',
        item: this.focusElement.item,
        to: this.focusElement.parentElement.parentElement.item,
                index: index + 1,
        action: 'move',
      }).then(item => item.elemTreeLi.elemTreeDiv.scrollIntoView());
    }},
    openItemsSave:{ value: function openItemsSave() {
      localStorage.setItem(
        'openItems',
        [...this.elem.getElementsByTagName('details')]
        .filter(e => e.item && e.open)
        .map(e => e.item.tag).join()
      )
          }},
    on:{ value: function on(selector, context) {
      this[selector] = context;
    }},
    select:{ value: async function select(item, e) {
      e.preventDefault();
      e.stopPropagation();
      if (item.data.src) {
        $('list').load(item.data.src);
        return;
      }
      if (item.data.onclick) {
        item.data.onclick();
        return;
      }
      if (item.data.href) {
        document.location.href = '#/' + item.data.href;
        return;
      }
      this.setFocusElement(item.elemTreeLi.elem, e);
            $().execQuery({
        l: urlToId(item.data['@id']),
        v: urlToId(item.data['@id']+'/children?$filter=FinishDateTime eq NULL&$select='+aim.config.listAttributes),
      });
      return;
      $('view').show(item);
      $.clipboard.setItem([item], 'treeselect', '');
      const children = await item.children || [];
      console.log('children', item.header0, children);
      $().list(children, item.header0);
    }},
    show:{ value: function show(data) {
      [...arguments].forEach(item => {
        if (typeof item === 'object') {
                    item = item instanceof Item ? item : Item.get(item);
          this.listElem.append(this.childnode(item));
                                                                                                                                                    }
      });
      return this;
    }},
    toggle:{ value: function toggle() {
            $(document.body).attr('tv', $(document.body).attr('tv') ^ 1, true);
    }},
  });
  function ObjectManager() {
    $().on('load', e => this.create());
  }
  Object.defineProperties(ObjectManager.prototype, {
    create: {value: function () {
      console.log('a', this);
      $(document.body).append(
        this.navtop = $.his.elem.navtop = $('header').id('om-nav-top').class('row top bar noselect np')
        .append(
          $.his.elem.menu = $('a').class('abtn icn menu').on('click', e => {
            if ($.his.elem.menuList && $.his.elem.menuList.style()) {
              $.his.elem.menuList.style('');
            } else {
              if ($.his.elem.menuList) $.his.elem.menuList.style('display:none;');
              $(document.body).attr('tv', document.body.hasAttribute('tv') ? $(document.body).attr('tv')^1 : 0)
            }
          }),
          $('a').class('title').id('toptitle').on('click', e => $.start() ),
          $('form').class('search row aco')
          .on('submit', e => {
            const value = $.searchValue = e.target.search.value;
            var result = value
            ? [...$.props.values()]
            .filter(item => item instanceof Item)
            .unique()
            .filter(item => item.header0 && value.split(' ').every(value => [item.header0,item.name].join(' ').match(new RegExp(`\\b${value}\\b`, 'i'))))
            : [];
            $().list(result);
            return false;
          })
          .append(
            $('input').name('search').autocomplete('off').placeholder('zoeken'),
            $('button').class('abtn icn search fr').title('Zoeken'),
          ),
          $('a').class('abtn icn dark').dark(),
        ),
        $('section').id('om-main').append(
          this.tree = $('section').tree().id('tree').css('max-width', $().storage('tree.width') || '200px'),
          $('div').seperator(),
          this.list = $('section').id('list').list(),
          this.doc = $('section').class('row aco doc').id('doc'),
          $('div').seperator('right'),
          this.page = $('section').id('view').class('col aco apv printcol').css('max-width', $().storage('view.width') || '600px'),
          $('section').id('preview'),
          this.prompt = $('section').class('prompt').id('prompt').tabindex(-1).append(
            $('button').class('abtn abs close').attr('open', '').tabindex(-1).on('click', e => $().prompt(''))
          ),
        ),
        $('footer').statusbar(),
      ).messagesPanel();
    }},
    init: {enumerable: true, value: async function () {
      console.log();
      const name = document.currentScript.getAttribute('name') || 'om';
      const om = this[name] = $(name, new ObjectManager);
      const client_id = $.config.client_id;
      const aimConfig = {
        client_id: client_id,
        scope: 'openid profile name email admin.write',
      };
      aimClient = new aim.UserAgentApplication(aimConfig);
      const aimRequest = {
        scopes: aimConfig.scope.split(' '),
      };
      console.log('aimConfig', aimConfig);
            if (aimConfig.access_token) {
        aimClient.setAccessToken(aimConfig.access_token);
      }
      if (aimConfig.id_token) {
        aimClient.setIdToken(aimConfig.id_token);
      }
      let dmsConfig = {
        client_id: client_id,
        servers: [{url: 'https:      };
      const authProvider = {
        getAccessToken: async () => {
          let account = aimClient.storage.getItem('aimAccount');
          if (!account){
            throw new Error(
              'User account missing from session. Please sign out and sign in again.'
            );
          }
          try {
                        const silentRequest = {
              scopes: aimRequest.scopes,
              account: aimClient.getAccountByUsername(account)
            };
            const silentResult = await aimClient.acquireTokenSilent(silentRequest);
            return silentResult.accessToken;
          } catch (silentError) {
                                    if (silentError instanceof aim.InteractionRequiredAuthError) {
              const interactiveResult = await aimClient.acquireTokenPopup(aimRequest);
              return interactiveResult.accessToken;
            } else {
              throw silentError;
            }
          }
        }
      };
      const dmsClient = aim.Client.initWithMiddleware({authProvider}, dmsConfig);
      dmsConfig = await dmsClient.loadConfig();
      $().schemas(dmsConfig.components.schemas);
      console.log(dmsConfig);
      await $().translate();
      async function signIn() {
                try {
                    console.log('OPTIONS', aimRequest);
          const authResult = await aimClient.loginPopup(aimRequest);
          console.log('id_token acquired at: ' + new Date().toString());
                    aimClient.storage.setItem('aimAccount', authResult.account.username);
          document.location.reload();
        } catch (error) {
          console.log(error);
        }
      }
            $(document.body).om();
      if (aimConfig.info) {
        $('toptitle').text(document.title = aimConfig.info.title).title([aimConfig.info.description,aimConfig.info.version,aimConfig.info.lastModifiedDateTime].join(' '));
      }
                        if (!document.location.search && aimConfig.ref && aimConfig.ref.home) {
        if (document.location.hostname.match(/localhost$/)) {
                    aimConfig.ref.home = aimConfig.ref.home.replace(/https:\/\/github.com/, 'http:        }
        window.history.replaceState('page', '', '?l=' + urlToId(aimConfig.ref.home));
      }
      var aimAccount = JSON.parse(aimClient.storage.getItem('aimAccount'));
      if (aimAccount) {
        $.his.elem.navtop.prompts(...$.const.prompt.menu.prompts).append(
          $.his.elem.account = $('a').class('abtn account').caption('Account').href('#?prompt=account').draggable(),
        );
                if (aimConfig.menu) {
          $().tree(...childObject(aimConfig.menu).children);
        }
        async function treeItem(url) {
          const item = await $(url).details();
          $().tree(item);
          return item;
        }
        const sub = aimAccount.sub;
        dmsClient.headers = {
          'OData-Version': '3.0',
          'aim-Version': '1.0',
        };
        const user = $.his.items.sub = await dmsClient.api('/me').get();
        console.log('USER', user);
                                $().tree(user);
                                                                        if ('Notification' in window) {
          var permission = Notification.permission;
          if (Notification.permission === 'default') {
            $.his.elem.navtop.append(
              $('a').class('abtn').text('Notifications').on('click', e => Notification.requestPermission())
            )
          }
        }
      } else {
        $.his.elem.navtop.append(
                                                                                                                                  $('button').class('abtn login').text('Aanmelden').on('click', e => signIn()),
        );
              }
    }},
  })
  function childObject(object, schemaname) {
        if (object) {
      const obj = Object.fromEntries(Object.entries(object).filter(([name, obj]) => typeof obj !== 'object'));
      obj.children = Object
      .entries(object)
      .filter(([name, obj]) => typeof obj === 'object')
      .map(([name, obj]) => Item.get(Object.assign({
        schema: schemaname,
        name: name,
        title: name.replace(/^\d+[-| ]/,'')
      }, childObject(obj, schemaname))));
      return obj;
    }
  }
  function Clipboard() {}
  Object.defineProperties(Clipboard.prototype, {
    undo: { value: function() {
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
            if (!data) return false;
      if (typeof data == 'string') data = JSON.parse(data);
      if (data.Value) {
                if (!data.from) $.his.updateList.unshift(data);         data.Value.forEach(function(row, i, rows) {
          var item = Item.create(row.id);
          row.eventType = row.eventType || eventType;
                    if (!item) return;
          switch (eventType || row.eventType) {
            case 'copy':
            targetItem.appendItem(null, { schema: item.schema, Title: item.Title, userID: 0, srcID: item.id }, null, true);
            break;
            case 'link':
                        new $.HttpRequest($.config.$, 'POST', '/' + targetItem.tag + '/link', { itemID: item.id } ).send();
                        break;
            case 'cut':
                        if (row.masterID != item.masterID) {
                            return;
            }
            if (item.master && item.master.children && item.master.children.length) {
              item.master.children.splice(item.master.children.indexOf(item), 1);
              item.master.children.forEach(function(item, i) { item.index = i });
            }
            if (item.elemTreeLi) item.elemTreeLi.parentElement.removeChild(item.elemTreeLi);
            if (item.elemListLi && item.elemListLi.parentElement) item.elemListLi.parentElement.removeChild(item.elemListLi);
            if (targetItem) {
                            if (targetItem.masterID == targetItem.srcID) {
                                                                var propertyAttributeName = item.getPropertyAttributeName('srcID');
                if (propertyAttributeName) row[propertyAttributeName] = { itemID: row.srcID };
                var propertyAttributeName = item.getPropertyAttributeName('masterID');
                if (propertyAttributeName) row[propertyAttributeName] = { itemID: row.masterID };
              }
              else {
                              }
                                                        if (item.master) {
                item.master.children = item.master.children || [];
                item.master.children.push(item);
                if (item.master.elemTreeLi.elemTreeUl) item.appendTo(item.master.elemTreeLi.elemTreeUl);
              }
            }
            $.Selection.cancel();
            break;
                                                                                                                                                default:
            break;
          }
        });
                                        return true;
      }
    },},
    cancel: { value: function() {
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
            setTimeout(() => {
        if (href) document.location.href = href;
        else document.location.reload();
      },0);
    },},
                                                    items: { value: [], },
    setItem: { value: function(item, attributeName, value) {
      if (!item) throw 'no item';
      e = window.event;
      let items = this[attributeName] || [];
      items.forEach(item => item.setAttribute ? item.setAttribute(attributeName, null) : null);
                        if (item) {
        if (Array.isArray(item)) {
          items = item;
          this.itemFocussed = item[0];
        } else {
          if (!e.altKey) {
            if (e.ctrlKey) {
              if (e.shiftKey) {
                              } else {
                                items.push(item);
              }
            } else if (e.shiftKey) {
                                                                                    items.push(item);             } else {
                            items = [item];
            }
          }
        }
              } else {
        items = [];
      }
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
          e.clipboardData.setData('aim/items', JSON.stringify(data));
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
            $.attr(this.items,'clipboard');
      this.items = [this.itemFocussed];
      document.execCommand('copy');
            return;
    },},
    paste: { value: function(e) {
    },},
    link: { value: function() {
      for (var i = 0, o; o = $.selapi.item[i]; i++) {
              }
    },},
    delete: { value: function() {
      for (var i = 0, o; o = $.selapi.item[i]; i++) {
              }
    },},
    copyToClipboard: { value: function(obj) {
    $.clipboard.data = obj;
                                document.execCommand('copy');
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
                    return property.options[value].title;
        }
        if (property.type === 'datetime') {
          return value ? new Date(value).toLocaleString() : null;
        }
      }
      return value;
    },},
  });
  const prompts = {};
  const promptElems = {};
  aim().on({
        message(e){
      if (e.body && e.body.code){
        $.his.replaceUrl( '#');
        $.auth.loginWindow.close();
        $.auth.get_access_token(e.body);
      }
    },
                              });
	function ScriptLoader() {
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
						document.head.createElement('script', {
				src: src,
				onload: e => arguments.callee(),
			});
		}
	};
	scriptLoader = new ScriptLoader();
	function Popup(e) {
				e = e || window.event;
		let targetElement = e.path.find(targetElement => targetElement.popupmenu || targetElement.contextmenu);
				if (!targetElement) return;
		e.preventDefault();
		e.stopPropagation();
		let targetRect = targetElement.getBoundingClientRect();
		let menuItems = targetElement.popupmenu || targetElement.contextmenu;
								if (this.handlers.menuElement) {
			this.handlers.menuElement.remove();
		}
		let menuElement = this.handlers.menuElement = targetElement.createElement('DIV', 'col popup', { oncontextmenu: e => {
			e.stopPropagation();
		}});
		targetElement.addEventListener('mouseleave', e => {
						if (e.target === targetElement) {
				this.close();
			}
					}, true);
		this.close = e => {
			menuElement.remove();
			window.removeEventListener('click', this.close, true);
		};
														if (targetElement.popupmenu) {
			targetElement.right = 0;
		}
						menuElement.innerText = '';
		for (let [menuname, menuitem] of Object.entries(menuItems)) {
									if (menuitem.hidden) continue;
			var linkElement = menuElement.createElement('A', {
				name: menuname,
				value: menuname,
				elMenu: menuElement,
				left: 5,
				menuitem: menuitem,
				popupmenu: menuitem.menu,
								onclick: menuitem.onclick || (this.menu ? this.menu.onclick : null) || targetElement.onselect || function (e) {
										e.stopPropagation();
				},
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
	};
	Popup.prototype = {
		handlers: {},
		enter(e) {
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
  function start() {
    $.his.openItems = localStorage.getItem('openItems');
    let localAttr = localStorage.getItem('attr');
    $.localAttr = localAttr = localAttr ? JSON.parse(localAttr) : {};
    const apiorigin = $.httpHost === 'localhost' && $().storage === 'api' ? 'http:    aim = $.aim = $('aim');
    require = function () {};
    window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
                                              });
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
            if ($.prompts) {
        $.prompt($.prompts);
      }
      return;
                                                      loadStoredCss();
                  if (document.getElementById('colpage')) {
        Object.assign(document.getElementById('colpage'), {
          cancel(e) {
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
                                              });
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
      $().emit('load').then(function emitLoad(e) {
        $().emit('ready').then(function emitReady(e) {
          $(window).emit('popstate');
          $(window).emit('focus');
        });
      })
    })
  }
  Object.assign(aim, {
    Clipboard,
    ObjectManager,
    Popup,
    ScriptLoader,
    Elem,
    checkPath: (e) => {
      let elem;
      if (elem = e.path.find(elem => elem.item)) {
        e.itemElement = elem;
        e.item = e.itemElement.item;
      }
    },
    checkkey: (e) => {
      const path = $.his.clickEvent ? [...$.his.clickEvent.path] : [];
      path.push($);
      path.forEach(elem => {
                                                const keys = elem[e.type];
        if (keys && keys[e.keyPressed]) {
          keys[e.keyPressed].call(elem, e);
        }
      })
    },
    eventKeyState: (e) => {
      return e ? (e.shiftKey && e.ctrlKey ? 'link' : (e.shiftKey ? 'move' : (e.ctrlKey ? 'copy' : 'default'))) : 'default';
    },
    handleData: (targetItem, e) => {
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
        } else if (data = eventData.getData("aim/items")) {
          data = JSON.parse(data);
          data.type = data.type || (e.ctrlKey ? 'copy' : 'cut');
          data.target = targetItem.tag;
          if (data.value) {
            const targetItem = Item.get(data.target);
            console.log(data, targetItem, data.value);
            if (data.type === 'cut') {
              const parent = targetItem;
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
                                $().tree().setFocusElement(item.elemTreeLi.elem);
                item.edit();
              })();
            }
          }
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
                              var tmpStr = data.match("<!--StartFragment-->(.*)<!--EndFragment-->");
          var fragment = tmpStr[1];
                    if (fragment.substr(0, 3) == '<a>') {
            console.debug('REF', fragment);
          }
          else if (fragment.substr(0, 5) == '<img ') {
            console.debug('IMG', fragment);
          }
                  } else if (data = eventData.getData("text")) {
          if (data.substr(0, 4) == 'http') {
                      }
        }
      }
      $.clipboard.dragItems = [];
    },
    handleEvent: (e) => {
      if (e){
        if (e.body){
          console.error('handleEvent', e.body);                    $.extend(e.body);
                    if ($.config_url){
            let res = new XMLHttpRequest();
            res.open('get', $.config_url);
            res.onload = e => $.url('https:            res.send();
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
    },
    hrefSrc: (href, src = '/') => {
      if (href[0]==='#') return href;
            if (href.match(/^http/)) return href;
      href = new URL(href, new URL(src, document.location)).href.replace(/^.*?\              return href;
          },
    importScript: (src) => {
                  return $.promise('script', (resolve, reject) => {
                function loaded(e) {
          e.target.loading = false;
          for (let [key,value] of Object.entries(e.target)) {
            if (typeof value === 'function') {
              Elem.prototype[key] = value;
            }
          }
          resolve();
        }
        for (let script of [...document.getElementsByTagName('SCRIPT')]) {
          if (script.getAttribute('src') === src) {
                        if (script.loading) {
                            return $(script).on('load', loaded);
            }
                        return resolve();
          }
        }
        var el = $('script').src(src).parent(document.head).on('load', loaded);
        el.elem.loading = true;
              });
    },
    linkify: (inputText) => {
        var replacedText, replacePattern1, replacePattern2, replacePattern3;
                replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
                replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http:
                replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
        return replacedText;
    },
    loadStoredCss: () => {
      const css = JSON.parse(localStorage.getItem('css')) || {};
      for (let [id, param] of Object.entries(css)) {
        let selector = id === '_body' ? document.body : document.getElementById(id);
        if (selector) {
          selector.style.cssText += Object.entries(param).map(entry => entry.join(':')).join(';');
        }
      }
    },
    onkey: (e) => {
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
                              checkPath(e);
      if ($.his.clickEvent) {
        e.itemElement = e.itemElement || $.his.clickEvent.itemElement;
        e.item = e.item || $.his.clickEvent.item;
        e.clickEvent = $.his.clickEvent;
      }
    },
    urlString: (s = '') => {
      return s.replace(/%2F/g, '/');
    },
    attr: new Attr,
  });
    Object.defineProperties(aim, {
    clipboard: { value: new Clipboard() },
    initEvents: { value: function () {
      $(window)
      .on('afterprint', e => {
                              })
      .on('beforeunload', e => {
        if ($.his.handles) for (var name in $.his.handles) { $.his.handles[name].close(); }
      })
      .on('beforeprint', e => {
                        return;
        if (!$.printElement) {
          $.printElement = document.body.createElement('DIV', 'doc-content printablediv' );         }
                with ($.printElement) {
                    innerText = '';
          if (!$.printHeader) return innerHTML = $.printSource.innerHTML;
          with (createElement('TABLE', 'border', {  style: 'width:100%;' })) {
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
                checkPath(e);
        $.his.clickEvent = e;
        const sectionElement = e.path.find(elem => elem.tagName === 'SECTION' && elem.id);
        if (sectionElement) {
          document.body.setAttribute('section', sectionElement.id);
        }
      }, true)
      .on('click', e => {
                $.clickEvent = e;
                $.his.clickElement = e.target;
        $.his.clickPath = e.path = e.path || function(el) {
          var path = [];
          while (el) {
            path.push(el);
            el = el.parentElement;
          };
          return path;
        } (e.target);
                if (document.getElementById('colpanel') && !$.his.clickPath.includes($('colpanel'))) {
                  }
                                        let elem = e.target;
                                                                                                                                                        if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
          for (let elem of e.path.filter(elem => elem instanceof Element)) {
            if (elem.is && elem.is.has('ofile') && elem.is.get('ofile').src.match(/\.(jpg|png|bmp|jpeg|gif|bin|mp4|webm|mov|3ds)/i)) {
              return $(document.body).slider(elem)
            }
                                                if (elem.hasAttribute('href')) {
              if (elem.getAttribute('href').match(/^\/\                console.log('CLICK MAIN href REL');
                e.preventDefault();
                $().execQuery('l', urlToId(elem.getAttribute('href')));
                                return;
              }
              if (window.colpage) {
                if (elem.getAttribute('href')[0] === '#' && elem.getAttribute('href')[1] === '/') {
                  return $().exec(elem.getAttribute('href').substr(1));
                } else if (elem.getAttribute('href').includes('.pdf') && !elem.download) {
                  e.preventDefault();
                  return new $.Frame(elem.href);
                }
                                                                                                                                              }
            }
          }
        }
        if ($.mainPopup) {
          $.mainPopup.close();
          $.subPopup.close();
        }
                                for (var i = 0, el; el = $.his.clickPath[i]; i++) {
          if (el.itemID) {
            console.debug('itemID');
            var item = $.getItem(el.itemID);
            if (item) document.location.href = '#' + item.schema + '/' + item.id + '?select=*';
            return false
                      }
          else if (el.set) {
            $.url.set(el.set);
            return false
                      }
          else if (el.$infoID) {
                        e.stopPropagation();
            $.getItem(el.$infoID, item => {
              item.showinfo();
              el.remove();
            });
            return;
          }
                                                                                          else if (el.colName) {
            document.body.setAttribute('ca', el.colName);
            $.colActive = el;
            $.elColActive = el;
            $.printSource = el;
          }
          else if (el.elClose) el.elClose.parentElement.removeChild(el.elClose);
                    if ($.targetItem = el.item) {
            break;
          }
        }
                                                                                                                                                                                                                                                                                                                                                      })
      .on('copy', e => $.clipboard.copy(e))
      .on('cut', e => $.clipboard.copy(e))
      .on('dragend', e => {
        $().status('source');
        $().status('target');
        const dragItems = $.clipboard.dragItems;
                switch (e.dataTransfer.dropEffect) {
                                                                                                    case 'none': {
            var outside = e.screenX > window.screenX + window.outerWidth || e.screenX < window.screenX || e.screenY > window.screenY + window.outerHeight || e.screenY < window.screenY;
            if (outside) {
              return dragItems.forEach(item => item.popout(e.screenX,e.screenY));
            }
          }
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
                  }
        e.preventDefault();
      })
      .on('dragstart', e => {
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
              })
            .on('drop', e => {
        e.preventDefault();
        handleData($.his.targetItemElement.item, e);
      })
      .on('focus', e => {
                if (!$.his.focussed) {
          $.his.focussed = true;
          document.body.removeAttribute('blur');
          $().state('available');
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
                                                          }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  }
      })
      .on('keydown', e => {
                $().state('available');
                                                                                                                        $.his.keyEvent = e;
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
          e.preventDefault();
          document.execCommand('copy');
        }
                e.previousKey = $.his.previousKey;
        $.his.previousKey = e.keyPressed;
      }, true)
      .on('message', e => {
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
                if (e.body) $.data.update(e.body);
                if (data.Value)
                                if (data.state && data.fraim.app === 'aliconnector' && data.fraim.ip == $.client.ip) {
                    document.body.setAttribute('aliconnector', $.aliconnector.state = data.state);
                                                  if (data.state == 'connected') {
                                    if (!data.ack) ws.send({ to: { client: data.fraim.client }, state: 'connected', ack: 1 });
            if (data.fraim.device != $.client.device.id) {
                            ws.send({ to: { client: data.fraim.client }, device: $.client.device });
                          }
          }
        }
                                                                                                                                                if (data.reload) document.location.href = document.location.href;
        if (data.app === 'aliconnector') {
          if (!msg) return;
          $.aliconnector = msg;
                    if (msg.state == 'connected') {
            ws.send({ to: { deviceUID: $.deviceUID }, msg: { userName: $.accountName || $.client.user.name, userUID: $.userUID } });
                                                                                              }
          if (msg.state) {
                                  }
                                                                                                  }
                                                                                        if (data.editfiledone) {
          var c = document.getElementsByName(data.editfiledone);
          for (var i = 0, e; e = c[i]; i++) e.setAttribute('state', '');
        }
        if (data.editfile) {
          data.editfile = data.editfile.split('/').pop();
          var c = document.getElementsByName(data.editfile);
          for (var i = 0, e; e = c[i]; i++) e.setAttribute('state', 'editing');
        }
                                                                                                                                                        if (data.alert) alert(data.alert);
                return;
                if (data.a == 'submit' && $.getItem(data.id) && $.getItem(data.id).modifiedDT != data.modifiedDT) {
                                        if (get.id == data.id) {
            $.getItem(data.id).reload();
          } else if ($.getItem(data.id)) {
            $.getItem(data.id).loaded = false;
          }
          msg.check();
                  }
      })
      .on('mousemove', e => {
        $.his.clickPath = e.path;
        $().state('available');
                      })
      .on('paste', e => handleData($.clipboard.itemFocussed, e))
      .on('popstate', e => {
        console.log('POPSTATE', document.location.href);
        e.preventDefault();
        $().execUrl(document.location.href, true);
      })
      .on('resize', e => {
        if ($.mainPopup) {
          $.mainPopup.close();
          $.subPopup.close();
        }
                                              })
      .on('scroll', e => {
        if ($('doc') && $('doc').elem && $('doc').elem.lastChild) {
          const lastdoc = $('doc').elem.lastChild;
          if (lastdoc && lastdoc.doc) {
            const docelem = lastdoc.doc.docElem;
                        if (!$.toScroll) {
                                          $.toScroll = setTimeout(() => {
                                $.toScroll = null;
                                lastScrollTop = document.body.scrollTop;
                let elem = docelem.findAll.find(elem => elem.getBoundingClientRect().top < docelem.elemTop) || docelem.topItem;
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
                                                                                              }, 500);
            }
          }
        }
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
                        for (var i = 0, elHFocus, elNext; elNext = hapi.item[i]; i++) {
              if (elNext.offsetTop > st - ot) break;
              elHFocus = elNext;
            }
            elHFocus = elHFocus || elNext;
            var c = Element.iv.getElementsByTagName('LI');
                                    for (var i = 0, e; e = c[i]; i++) {
                                          if (e.hasAttribute('open')) e.setAttribute('open', 0);
              e.removeAttribute('focus');
            }
                        Element.iv.style.paddingTop = Math.max(0, st - ot + 50) + 'px';
            if (elHFocus) {
              elPar = elFocus = elHFocus.elemTreeLi;
                                                        elFocus.setAttribute('focus', 1);
              while (elPar.h) {
                                                if (elPar.hasAttribute('open')) elPar.setAttribute('open', 1);
                elPar = elPar.parentElement.previousElementSibling;
              }
                                                                                                                                                                        if (scrolldir == 'down') Element.iv.style.paddingTop = (st - ot - elFocus.getBoundingClientRect().top + Element.iv.firstChild.getBoundingClientRect().top + 50) + 'px';
                                        }
          }, 300);
        }
                              })
      .on('unload', e => {
              });
    } },
    prompt: {value: function prompt(selector, context) {
      console.warn('PROMPT', selector, context);
      if (selector instanceof Object) {
        return Object.assign(prompts, selector);
      } else if (context) {
        return prompts[selector] = context;
      }
      const is = $.his.map.has('prompt')
      ? $('prompt')
      : $('section').parent(document.body).class('prompt').id('prompt').append(
        $('button').class('abtn abs close').attr('open', '').on('click', e => $().prompt(''))
      );
      const currentSelector = is.attr('open');
      const keys = Object.keys(prompts);
      is.attr('open', selector ? selector : null);
      if (prompts[selector]) {
        const url = new URL(document.location);
        url.searchParams.set('prompt', selector);
        window.history.replaceState('page', '', url.href);
        const prompt = prompts[selector];
        context = prompts[selector];
        const promptElem = promptElems[selector] = promptElems[selector] || $('div').parent(is).class('col', selector).on('open', typeof context === 'function' ? context : function () {
          this.is.text('').append(
            $('h1').ttext(selector),
            $('form').class('col')
            .properties(context.properties)
            .btns(context.btns),
          )
        });
        const index = keys.indexOf(selector);
        Object.values(promptElems).forEach(elem => elem.attr('pos', ''));
        var currentIndex = 0;
        if (currentSelector) {
          var currentIndex = keys.indexOf(currentSelector);
          promptElems[currentSelector].attr('pos', currentIndex < index ? 'l' : 'r');
        }
        if (promptElem && promptElem.attr) {
          promptElem.attr('pos', currentIndex > index ? 'l' : 'r');
          clearTimeout(this.promptTimeout);
          promptElem.emit('open');
          this.promptTimeout = setTimeout(() => promptElem.attr('pos', 'm'),10);
          return promptElem;
        }
      }
      return this;
    }},
    producties: {value: function(elem){
      const producties = {};
            const links = Array.from(elem.getElementsByTagName('A')).filter(a => a.href);
      let ip = 1;
      links.forEach((a,i) => {
        if (a.href.match(/pdf$/)) {
          if (producties[a.href]) return a.text = producties[a.href].toLowerCase();
          const title = producties[a.href] = 'Productie ' + ip++ + ', ' + a.text;
          $(elem).append($('h1').class('productie').text(title));
          a.text = title.toLowerCase();
          const divElem = $('div').parent(elem);
          var loadingTask = pdfjsLib.getDocument(a.href);
          loadingTask.promise.then(async pdf => {
                        var numPages = pdf.numPages;
                        for (var pageNumber=1, numPages = pdf.numPages;pageNumber<=numPages;pageNumber++) {
              await pdf.getPage(pageNumber).then(function(page) {
                var scale = 1;
                var viewport = page.getViewport({scale: scale});
                                                var canvas = $('canvas').parent(divElem).elem;
                                                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                                var renderContext = {
                  canvasContext: context,
                  viewport: viewport
                };
                var renderTask = page.render(renderContext);
                renderTask.promise.then(function () {
                                  });
              });
            }
                      }, function (reason) {
                        console.error(reason);
          });
                  }
        if (a.href.match(/jpg$/)) {
          if (producties[a.href]) return a.text = producties[a.href].toLowerCase();
          const title = producties[a.href] = 'Productie ' + (i+1) + ', ' + a.text;
          $(elem).append($('h1').class('productie').text(title));
          a.text = title.toLowerCase();
          $('img').parent(elem).src(a.href);
        }
      })
    }},
  });
  Object.defineProperties(aim.prototype, {
    prompt: {value: function (selector, context) {
      return aim.prompt(selector, context);
    },},
    promptform: {value: function (url, prompt, title = '', options = {}){
      options.description = options.description || aim.his.translate.get('prompt-'+title+'-description') || '';
      title = aim.his.translate.get('prompt-'+title+'-title') || title;
      console.log([title, options.description]);
      options.properties = options.properties || {};
            aim.sessionPost = aim.sessionPost || {};
            Object.entries(aim.sessionPost).forEach(([selector,value])=>Object.assign(selector = (options.properties[selector] = options.properties[selector] || {type:'hidden'}), {value: selector.value || value, checked: ''}));
      return prompt.form = aim('form').parent(prompt.is.text('')).class('col aco').append(
        aim('h1').ttext(title),
        prompt.div = aim('div').md(options.description),
      )
      .properties(options.properties)
      .append(options.append)
      .btns(options.btns)
      .on('submit', e => url.query(document.location.search).post(e).then(e => {
        console.log(e.body);
        self.sessionStorage.setItem('post', JSON.stringify(aim.sessionPost = e.body));
                        if (aim.sessionPost.id_token) {
          localStorage.setItem('id_token', aim.sessionPost.id_token);
          aim().send({ to: { nonce: aim.sessionPost.nonce }, id_token: aim.sessionPost.id_token });
        }
        if (aim.sessionPost.url) {
          if (aim.messageHandler) {
            aim.messageHandler.source.postMessage({
              url: aim.sessionPost.url,
            }, aim.messageHandler.origin);
            self.close();
            return;
          }
          document.location.href = aim.sessionPost.url;
        }
        if (aim.sessionPost.prompt) prompt = aim().prompt(aim.sessionPost.prompt);
        if (aim.sessionPost.msg && prompt && prompt.div) {
          prompt.div.text('').html(aim.sessionPost.msg);
        }
        if (aim.sessionPost.socket_id) {
          return aim().send({to:{sid:aim.sessionPost.socket_id}, body:aim.sessionPost});
        }
                                                                                                                                                                                                                                                      }).catch(err => {
        console.error(err, prompt, prompt.div);
        if (err.error && prompt && prompt.div) {
          prompt.div.text('').html(err.error.message);
        }
      }))
    },},
  });
})();