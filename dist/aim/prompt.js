(function () {
  Aim.prompt({
    menu() {
      $('div').class('menu').parent(this.is.text('')).append(
        $('div').class('col')
        .append(
          $('a').class('abtn icn dark').dark(),
          $('a').text('abtn icn dark'),
        )
        .prompts(...$.const.prompt.menu.prompts)
        .append(
          $.his.elem.account = $('a').class('abtn account').caption('Account').href('#?prompt=account').draggable(),
        ),
      )
    },
    account() {
      if (aimClient.account.idToken.sub) {
        $('div').class('menu').parent(this.is.text('')).append(
          $('h1').text('Account'),
          $('div').class('col')
          .prompts(...[
            'login_consent',
            'logout',
                        'account_beheer',
                      ])        )
      }
                                                          },
    help() {
      console.log(aimClient.config);
      this.searchHelp = async function (search) {
        search = search.toLowerCase();
        $().url($().ref.home + '/_Sidebar.md').get().then(e => {
                    const match = e.target.responseText.match(/\[.*?\]\(.*?\)/g).filter(s => s.toLowerCase().includes(search));
          this.resultList.text('').append(
            e.target.responseText
            .match(/\[.*?\]\(.*?\)/g)
            .filter(s => s.toLowerCase().includes(search))
            .map(s => $('a').text(s.replace(/\[(.*)\].*/,'$1')).href(`#/?l=${s.replace(/.*\((.*)\)/,$().ref.home + '/$1')}`))
          )
                  })
                              };
      $('form')
      .class('col')
      .parent(this.is.text(''))
            .assign('onsubmit', e => {
        e.preventDefault();
        this.searchHelp(e.target.search.value);
        e.target.search.select();
      })
      .append(
        $('h1').text('Help'),
      )
      .properties({
        search: {
          format: 'text',
          autocomplete: 'off',
          required: '1',
          autofocus: true,
        },
      })
      .append(
        $('button').class('abtn icn').text('ok').type('submit').tabindex(-1).default(''),
        this.resultList = $('div')
        .class('col')
                .append(
          aimClient.config.contract.documents.map(doc => $('li').append(
            $('a').text(doc.title).href('#/?l=' + doc.url))
          )
        )
      )
    },
    config() {
      $('div').class('menu').parent(this.is.text(''))
      .append(
        $('h1').text('Settings'),
        this.divElem = $('div').class('col').prompts(...$.const.prompt.config.prompts).prompts('domain'),
      )
    },
    domain() {
      $('prompt').attr('open', null);
      return;
            $('list').text('').append(
        $('div').class('col').append(
          $('h1').text('Settings'),
          $('form').append(
            $('input').value(document.location.hostname.split(/\./)[0]),
            $('input').type('submit').value('Rename'),
          ),
        ),
      );
          },
    account_beheer() {
                                                                                                                                                                                                                                                                                          const blockString = 'width:10px;height:10px;border-radius:10px;display:inline-block;margin:0 5px;';
      console.error(1111, aimClient.account);
      $().document(
        $('main').append(
          $('details').append(
            $('summary').append($('h1').text('Config')),
            $('div'),
          ).on('toggle', e => e.target.lastChild.innerText ? null : $(e.target.lastChild).append(
            ...Array.from(Object.entries(config)).map(([key, field]) => [
              $('details')
              .append(
                $('summary').text(key),
                $('div'),
              )
              .on('toggle', e => e.target.lastChild.innerText ? null : $(e.target.lastChild).append(
                $('div').class('code-header row').attr('ln', 'yaml').append(
                  $('span').class('aco').text('YAML'),
                  $('button').class('abtn edit').on('click', e => $(e.target.parentElement.nextElementSibling).editor('yaml')),
                  $('button').class('abtn view').on('click', e => {
                    aimClient.api('/').post({
                      config:e.target.parentElement.nextElementSibling.innerText,
                      extend:1,
                    }).then(body => {
                      console.log(body);
                      document.location.reload();
                    })
                  }),
                ),
                $('div').class('code treecode').html($.string.yaml(YAML.stringify(field.config))),
              )),
            ]),
          )),
                              this.elCode = $('div').on('keydown', e => {
                        if (e.keyPressed === 'ctrl_KeyS') {
              const content = Array.from(e.target.children).map(el => el.innerText.replace(/\n/, '')).join('\n').trim();
              console.log(content);
              e.preventDefault();
              aimClient.api('/').post({
                config: content,
              }).then(body => {
                console.log(body);
                              })
            }
          }).editor('yaml'),
                              $('h1').text('Account'),
          $('div').text(`account_id = ${aimClient.account.accountIdentifier}`),
          $('div').text(`account_secret = click to show`).on('click', function (e) {
            $().url('https:            .query('request_type', 'account_secret')
            .headers('Authorization', 'Bearer ' + aimClient.account.id_token)
            .get().then(e => this.innerText = e.body.secret);
          }),
          $('h1').text('Domein'),
          $('div').text(`client_id = ${$.config.auth.client_id.replace(/\w+-(\w+-\w+-\w+-\w+-\w+)/, '$1')}`),
          $('div').text(`client_secret = click to show`).on('click', function (e) {
            $().url('https:            .query('request_type', 'client_secret')
            .query('client_id', $.config.auth.client_id)
            .headers('Authorization', 'Bearer ' + aimClient.account.id_token)
            .get()
            .then(e => this.innerText = e.body.secret)
                      }),
          $('details')
          .append(
            $('summary').append($('h2').text('Verbruik')),
            $('div').text('Gegevens worden verzameld'),
          )
          .on('toggle', detailsEvent => {
            if (detailsEvent.target.open) {
              aimClient.api('/?request_type=account_verbruik').get().then(data => {
                console.log(data);
                var max_request_count;
                function calc_max_request_count(max_request_count, value) {
                  return Math.max(max_request_count, Math.ceil(value/max_request_count)*max_request_count);
                }
                function bar(entries) {
                  var start = 0;
                  var s='background-image: linear-gradient(90deg, ';
                  entries.forEach(([color,size], i) => {
                    s+=`${color} ${start += size}%, `;
                    s+=entries[i+1] ? `${entries[i+1][0]} ${start}%, ` : `var(--trans3) ${start}%, var(--trans3) 100%);`;
                  });
                  return s;
                }
                function meter(data) {
                  const decimals = 0;
                  const max=data.max_count;
                  const value = data.dir_size + data.item_count + data.request_count;
                  const tot = (data.dir_size + data.item_count + data.attribute_count + data.request_count).toFixed(decimals);
                  return $('div').append(
                    $('div').class('row').append(
                      $('span').text(data.periode),
                      $('small').style('margin-left:auto;').text(`${tot} MB van ${data.max_count} MB gebruikt`),
                    ),
                    $('div').style(`height:20px;border-radius:5px;`+bar([
                      ['var(--red)', data.dir_size/data.max_count*100],
                      ['var(--blue)', data.item_count/data.max_count*100],
                      ['var(--green)', data.attribute_count/data.max_count*100],
                      ['var(--yellow)', data.request_count/data.max_count*100],
                    ])),
                  );
                }
                $(detailsEvent.target.lastChild).text('').append(
                  ...data.periode.map(
                    periode => [
                      meter({
                        periode: periode.periode,
                        dir_size: Number(periode.dir_size/1024/1024),
                        item_count: Number(periode.item_count/1000),
                        attribute_count: Number(periode.attribute_count/1000),
                        request_count: Number(periode.request_count/1000),
                        max_count: data.max_count,
                      }),
                    ]
                  ),
                  $('div').append(
                    $('span').style(blockString+'background:var(--red);'),$('small').text(`Opslag`),
                    $('span').style(blockString+'background:var(--blue);'),$('small').text(`Items`),
                    $('span').style(blockString+'background:var(--green);'),$('small').text(`Attributes`),
                    $('span').style(blockString+'background:var(--yellow);'),$('small').text(`Traffic`),
                  ),
                )
              })
            }
          }),
          $('details')
          .append(
            $('summary').append($('h1').text('Domain accounts')),
            $('div').text('Gegevens worden verzameld'),
          )
          .on('toggle', detailsEvent => {
            if (detailsEvent.target.open) {
              aimClient.api('/?request_type=account_beheer').get().then(body => {
                console.log(body);
                $(detailsEvent.target.lastChild).text('').append(
                                    ...body.domain_accounts.map(row => $('li').text(row.host_keyname))
                )
              });
            }
                      }),
          aimClient.config.contract && aimClient.config.contract.verantwoordelijke ? [
            $('h1').text('Verantwoordelijke'),
            $('h1').text('Verwerkingsregister'),
            $('a').text('Verwerkingsregister').href('#').on('click', e => {
              $().url('https:                var content = e.target.responseText;
                const gdpr = {};
                const list = ['gdpr_type', 'category', 'involved', 'basis', 'target', 'processor', 'processor_location', 'term_days', 'encrypt'];
                for (let [schemaName,schema] of $().schemas()) {
                  for (let [propertyName,property] of Object.entries(schema.properties)) {
                    if (property.gdpr_type) {
                      var obj = gdpr;
                      list.forEach(name => {
                                                obj = obj[property[name]] = obj[property[name]] || {};
                      })
                    }
                  }
                }
                function listitem ([name,obj], level) {
                                    content += '  '.repeat(level) + `- ${list[level]}: ${name}\n`;
                  if (obj) Object.entries(obj).forEach(entry => listitem(entry, level+1))
                }
                for (let [name,obj] of Object.entries(gdpr)) {
                  content += `# Verwerkingsactiviteiten van ${name}\n`;
                  Object.entries(obj).forEach(entry => listitem(entry, 0))
                }
                                const elem = $('div').parent(promptElem).class('col abs').append(
                  $('div').class('row top abs btnbar').append(
                    $('span').class('aco'),
                    $('button').class('abtn close').on('click', e => elem.remove()),
                  ),
                  $('main').class('aco oa doc-content counter').md(content),
                );
              })
            }),
          ] : null,
          aimClient.config.contract && aimClient.config.contract.verwerker ? [
            $('h1').text('Verwerkers'),
            aimClient.config.contract.verwerker.map((verwerker, i) => [
              $('h2').text(verwerker.bedrijfsnaam),
              $('a').text('Verwerkers contract').href('#').on('click', e => {
                $().url('https:                  const content = e.target.responseText.replace(/-0-/, `-${i}-`);
                  $().document(
                    $('main').md(content)
                  );
                })
              }),
            ]),
          ] : null,
        )
      )
                            },
    account_profile() {},
    contact_profile() {},
    account_page() {},
    share_item() {
      const item = ItemSelected;
      if (!item) return $().prompt('');
      this.is.text('').append(
        $('h1').ttext('prompt-share_item-title'),
        $('div').ttext('prompt-share_item-description'),
        $('form').class('col').properties({
          accountname: { },
          accountname: { value: 'test.alicon@alicon.nl'},
          readonly: { format: 'checkbox', title: 'Alleen lezen', checked: true },
                    scope_requested: { type: 'hidden', value: ($().scope||[]).join(' ') },
          tag: { type: 'hidden', value: item.tag },
        }).btns({
          next: { type:'submit', default: true, tabindex: 2 },
        }).on('submit', e => aimClient.api('/' + item.tag).query('prompt', 'share_item').post(e).then(body => {
                    this.is.text('').append(
            $('h1').ttext('prompt-share_item-done-title'),
            $('ol').append(
              body.msg.map(msg => $('li').ttext(msg)),
            ),
            $('form').class('col').btns({
              close: { type:'submit', default: true, tabindex: 2 },
            }).on('submit', e => {
              $().prompt('');
              return false;
            }),
          )
        }))
      );
    },
    account_delete() {
      this.is.text('').append(
        $('h1').ttext('prompt-account_delete-title'),
        $('div').ttext('prompt-account_delete-description'),
        $('form').class('col').properties({
          password: {
            autocomplete: 'new-password',
            type: 'password',
            required: true,
            title: 'Current password'
          },
        }).btns({
          next: { type:'submit', default:1 },
        }).on('submit', e => aimClient.api('/').query('prompt', 'account_delete').post(e).then(body => {
          console.log(e);
          if (body === 'code_send') {
            this.is.text('').append(
              $('h1').ttext('prompt-sms_verification_code-title'),
              $('div').ttext('prompt-sms_verification_code-description'),
              $('form').class('col').properties({
                code: {
                  required: true,
                  title: 'code'
                },
              }).btns({
                next: { type:'submit', default: true, tabindex: 2 },
              }).on('submit', e => aimClient.api('/').query('prompt', 'account_delete').post(e).then(e => {
                $().logout();
                document.location.href = '/';
                return;
                this.is.text('').append(
                  $('h1').ttext('prompt-account_delete-done-title'),
                  $('div').ttext('prompt-account_delete-done-description'),
                  body.msg.map(msg => $('li').ttext(msg)),
                  $('form').class('col').btns({
                    next: { type:'submit', default: true, tabindex: 2 },
                  }).on('submit', e => {
                    $().prompt('');
                    return false;
                  }),
                )
              }))
            )
          }
        }))
      )
    },
    account_delete_domain() {
      this.is.text('').append(
        $('h1').ttext('prompt-account_delete_domain-title'),
        $('div').ttext('prompt-account_delete_domain-description'),
        $('form').class('col').properties({
          password: {
            autocomplete: 'new-password',
            type: 'password',
            required: true,
            title: 'Current password'
          },
        }).btns({
          next: { type:'submit', default:1 },
        }).on('submit', e => aimClient.api('/').query('prompt', 'account_delete_domain').post(e).then(body => {
          console.log(e);
          if (body === 'code_send') {
            this.is.text('').append(
              $('h1').ttext('prompt-sms_verification_code-title'),
              $('div').ttext('prompt-sms_verification_code-description'),
              $('form').class('col').properties({
                code: {
                  required: true,
                  title: 'code'
                },
              }).btns({
                next: { type:'submit', default: true, tabindex: 2 },
              }).on('submit', e => aimClient.api('/' + item.tag).query('prompt', 'account_delete_domain').post(e).then(body => {
                this.is.text('').append(
                  $('h1').ttext('prompt-account_delete_domain-done-title'),
                  $('div').ttext('prompt-account_delete_domain-done-description'),
                  body.msg.map(msg => $('li').ttext(msg)),
                  $('form').class('col').btns({
                    next: { type:'submit', default: true, tabindex: 2 },
                  }).on('submit', e => {
                    $().prompt('');
                    return false;
                  }),
                )
              }))
            )
          }
        }))
      )
    },
    account_domain() {
      const searchParams = new URLSearchParams(document.location.search);
      this.is.text('').append(
        $('h1').ttext('Account domain'),
        $('p').ttext(`The domain ${searchParams.get('domain')||''} is not registered.`),
      );
      if (aimClient.account.idToken.sub) {
        this.is.text('').append(
          $('p').ttext(`If you want to register this domain select next?`),
          $('p').ttext(`You agree our ...?`),
          this.elemMessage = $('div').class('msg'),
          $('form').class('col').properties({
            domain_name: { value: (searchParams.get('domain')||'').split(/\./)[0]},
          }).btns({
            next: { type:'submit', default:1 },
          }).on('submit', e => aimClient.api('/account/account_domain').post(e).then(data => {
            this.elemMessage.html(data.msg || '');
            if (data.url) {
                            const url = $()
              .url('https:              .query({
                prompt: 'login',
                response_type: 'code',
                client_id: data.client_id,
                redirect_uri: data.url,
                                scope: $().scope,                              });
              return document.location.href = url.toString();
                          }
            console.log('DONE', data);
                                              }))
        )
      }
    },
    account_domain_delete() {
      const searchParams = new URLSearchParams(document.location.search);
      this.is.text('').append(
        $('h1').ttext('Account domain delete'),
        $('p').ttext(`Delete the domain ${searchParams.get('domain')||''}.`),
      );
      if (aimClient.account.idToken.sub) {
        this.is.text('').append(
          $('p').ttext(`If you want to delete this domain select next?`),
          this.elemMessage = $('div').class('msg'),
          $('form').class('col').properties({
                      })
          .btns({
            next: { type:'submit', default:1 },
          })
          .on('submit', e => aimClient.api('/account/account_domain_delete').post(e).then(data => {
            if (data.url) {
              return document.location.href = data.url;
            }
            return console.error(data);
          }))
        )
      }
    },
    account_overview() {
      $().prompt('');
      const panel = $('div').panel();
      console.log('account_overview', panel);
      aimClient.api('/').query('prompt', 'account_overview').get().then(account => {
        console.log('ACCOUNT OVERVIEW', account);
        panel.elemMain.append(
          $('h1').text([].concat(account.Name).shift().Value),
        );
      })
    },
    account_config() {
      $()
      .prompt('')
      .api('/')
      .query('account','')
      .accept('yaml')
      .get().then(body => $().account_config(body))
    },
    set_customer(e) {
      $('a').ttext('set_customer').on('click', $().shop.setCustomer());
    },
    account_password() {
      this.is.text('').append(
        $('h1').ttext('Change password'),
                $('form').class('col').properties({
          accountname: {
            type: 'text',
            autocomplete: 'username',
            pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
                        autofocus: true,
            title: 'Username'
          },
          password: {
            autocomplete: 'current-password',
            autocomplete: 'new-password',
            type: 'password',
                        title: 'Current password'
          },
          password1: {
            autocomplete: 'new-password',
            type: 'password',
                        title: 'New password'
          },
          password2: {
            autocomplete: 'new-password',
            type: 'password',
                        title: 'New password repeat'
          },
        }).btns({
          next: { type:'submit', default:1 },
        }).on('submit', e => $().url('/api/account/password').post(e).then(e => this.is.text('').append(
          $('h1').ttext('Password changed')
        )))
      )
    },
    account_mobile() {
      this.is.text('').append(
        $('h1').ttext('Account mobile'),
        $('form').class('col').properties({
          mobilenumber: {
            title: 'Mobile_number',
            required: true,
            type: 'tel',
            min:1000000000,
            max:9999999999,
          },
        }).btns({
          next: { type:'submit', default:1 },
        }).on('submit', e => $().url('/api/account/phone').post(e).then(e => this.is.text('').append(
          $('h1').ttext('SMS verification code'),
          $('form').class('col').properties({
            code: {
              type: 'number',
            },
          }).btns({
            next: { type:'submit', default:1 },
          }).on('submit', e => $().url('/api/account/phone').post(e).then(e => this.is.text('').append(
            $('h1').ttext('Email changed')
          )))
        )))
      )
    },
    account_email() {
      this.is.text('').append(
        $('h1').ttext('Account email'),
        $('form').class('col').properties({
          email: {
            required: true,
            type: 'email',
          },
        }).btns({
          next: { type:'submit', default:1 },
        }).on('submit', e => $().url('/api/account/email').post(e).then(e => this.is.text('').append(
          $('h1').ttext('Email verification code'),
          $('form').class('col').properties({
            code: {
              type: 'number',
            },
          }).btns({
            next: { type:'submit', default:1 },
          }).on('submit', e => $().url('/api/account/email').post(e).then(e => this.is.text('').append(
            $('h1').ttext('Password changed')
          )))
        )))
      )
    },
    login_consent() {
      aimClient.login({
        scope: 'name email phone_number',
        prompt: 'consent',
      });
          },
    login() {
      this.aimClient.login({});
      return;
      document.location.href = $().loginUrl().toString();
      console.log('PROMPT LOGIN', $());
      aimClient.login({
        scope: $.config.scope || "",        redirect_uri: document.location.origin+document.location.pathname,
      });
          },
    logout() {
      aimClient.logout();
      return;
      e = e || window.event;
      if ($.his.cookie.id_token) {
        if (e.type !== 'message') {
          new $.WebsocketRequest({
            to: {
              nonce: $.auth.id.nonce,
            },
            path: '/?prompt=logout',
          });
        }
              }
            $.his.cookie = {
        id_token: $.auth.id_token = null,
        access_token: $.auth.access_token = null,
        refresh_token: $.auth.refresh_token = null,
      };
      if (document.location.protocol === 'file:') {
        $.his.replaceUrl( '#');
        return $.reload();
      }
                                  },
    login_msa() {
      $().msa().signIn(msaRequest)
    },
    terms_of_use() {
          },
    privacy_policy() {
          },
    cookie_policy() {
          },
    upload_datafile() {
          },
    import_outlook_mail() {
          },
    import_outlook_contact() {
          },
    sitemap() {
    },
    get_api_key() {
    },
    get_aliconnector_key() {
      $.clipboard.copyToClipboard({
        sid: $().ws().socket_id,
      });
      $().prompt('');
    },
    shop() {
      $('form').parent(this.is.text('')).append(
        $('h1').text('Shop'),
      )
    },
    task() {
      $('form').parent(this.is.text('')).append(
        $('h1').text('Tasks'),
      )
    },
    msg() {
      $('form').parent(this.is.text('')).append(
        $('h1').text('Messages'),
      )
    },
    chat() {
      $('form').parent(this.is.text('')).append(
        $('h1').text('Chat'),
      )
    },
    lang() {
      $('form').parent(this.is.text('')).append(
        $('h1').text('Language'),
      )
    },
    scope_accept() {
            $('form')
      .class('col')
      .parent(this.is.text(''))
      .append(
        $('h1').text('JA', document.location.search),
      );
                                              },
        verwerkingsregister() {
      $().prompt();
      $('list').load('https:        const gdpr = {};
        const list = ['gdpr_type', 'category', 'involved', 'basis', 'target', 'processor', 'processor_location', 'term_days', 'encrypt'];
        for (let [schemaName,schema] of $().schemas()) {
          for (let [propertyName,property] of Object.entries(schema.properties)) {
            if (property.gdpr_type) {
              var obj = gdpr;
              list.forEach(name => {
                                obj = obj[property[name]] = obj[property[name]] || {};
              })
            }
          }
        }
        function listitem ([name,obj], level) {
          console.log(level);
          content += '  '.repeat(level) + `- ${list[level]}: ${name}\n`;
          if (obj) Object.entries(obj).forEach(entry => listitem(entry, level+1))
        }
        for (let [name,obj] of Object.entries(gdpr)) {
          content += `# Verwerkingsactiviteiten van ${name}\n`;
          Object.entries(obj).forEach(entry => listitem(entry, 0))
        }
        console.log(gdpr);
        return content;
      });
    },
    async schema_design() {
      $().prompt();
            $('list').docElem.text('').append(
        ...Array.from($().schemas()).map(([schemaName,schema]) => [].concat(
          $('h1').text(schemaName),
          $('h2').text('Properties'),
          ...Object.entries(schema.properties).map(([propertyName,property]) => [
            $('div').text(propertyName),
            $('ul').append(
              ...Object.entries(property).map(([metaName,meta]) => $('li').append(
                $('code').text(metaName),
                $('span').text(`: ${meta}`),
              )),
            )
          ]),
        ))
      )
    },
                                                                                    ws_socket_id() {
                  if (!$.WebsocketClient.responseBody || !$.WebsocketClient.responseBody.from_id) {
                $.request('?prompt=init');
        return;
      }
      if ($.auth.request) {
        new $.WebsocketRequest({
          to: { sid: $.WebsocketClient.responseBody.from_id },
          path: '/?prompt=accept&client_id=' + $().client_id,
          body: {
            scope: $.auth.request,
            url: document.location.href,
          },
        });
      } else {
        new $.WebsocketRequest({
          to: { sid: $.WebsocketClient.responseBody.from_id },
          path: '/?prompt=ws_get_id_token&client_id=' + $().client_id,
        });
      }
    },
    ws_set_id_token() {
      if (!$.WebsocketClient.responseBody || !$.WebsocketClient.responseBody.from_id) {
        return $.request('?prompt=init');
      }
      $.auth.login({scope: $.auth.scope, id_token: $.WebsocketClient.responseBody.body.id_token  });
    },
    ws_login_code() {
                  $.WebsocketClient.responseBody.body.client_id = $().client_id;
      $.WebsocketClient.responseBody.body.redirect_uri = document.location.origin + document.location.pathname;
            document.location.href = 'https:    },
    ws_auth_code() {
            $.auth.get_access_token($.WebsocketClient.responseBody.body, $.auth.login.callback);
    },
    app_response_access_token() {
      if (!$.WebsocketClient.responseBody || !$.WebsocketClient.responseBody.from_id) {
                $.request('?prompt=init');
        return;
      }
            $().emit('access_token', $.WebsocketClient.responseBody.body.access_token);
    },
    qrscan() {
      const video = $('video').elem;
      const state = $('div');
      this.is.text('').append(
        state,
        video.is,
      ).btns({
        back: { href: '#?prompt=login'}
      });
      (async function () {
                        await importScript('qrscan.js');
                        video.is.attr('playsinline', '');
        const canvasElement = $('canvas').style('display:none').elem;
        const canvas = canvasElement.getContext("2d");
        function drawLine(begin, end, color) {
          canvas.beginPath();
          canvas.moveTo(begin.x, begin.y);
          canvas.lineTo(end.x, end.y);
          canvas.lineWidth = 4;
          canvas.strokeStyle = color;
          canvas.stroke();
        }
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            frameRate: {
              ideal: 5,
              max: 10
            }
          }
        }).then(function (stream) {
                    videostream = video.srcObject = stream;
          video.is.attr("playsinline", true);           video.play();
          requestAnimationFrame(tick);
        });
        function tick() {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvasElement.hidden = false;
            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            var code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert", });
            if (code && code.data) {
              if (code.data.includes('aliconnect.nl')) {
                videostream.getTracks().forEach(track => track.stop());
                canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);
                canvasElement.hidden = true;
                canvasElement.style.display = 'none';
                $().ws().sendto(code.data.split('s=').pop(), {
                  path: '/?prompt=mobile',
                }).then(body => {
                  if (body === 'request_id_token') {
                    $().ws().reply({
                      id_token: localStorage.getItem('id_token'),
                    }).then(body => {
                      if (body.prompt) {
                        panel = $().prompt(body.prompt);                        panel.append(
                          $('div').text('JA NU LUKT HET, VRAAG OM ACCEPT'),
                        )
                      } else {
                        $().prompt('');
                      }
                    });
                  }
                });
              }
            }
          }
          requestAnimationFrame(tick);
        }
      }())
    },
  });
})()