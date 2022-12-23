Web.on('loaded', (event) => Abis.init().then(async (abis) => {
  const {config,Client,Prompt,Pdf,Treeview,Listview,Statusbar,XLSBook,authClient,abisClient,socketClient,tags,treeview,listview,account,Aliconnect,getAccessToken} = abis;
  const {num} = Format;
  const url = new URL(document.location);
  const {client_id,forms,costs,info} = config;
  /** @todo load translate librarie */
  // Translate.init();
  socketClient.on('message', ({data,target}) => {
    const {message_type,content,from} = data;
    console.log(from,message_type,content);
    switch(message_type) {
      case 'NOTIFY_MESSAGE': {
        Messenger.show(content);
      }
    }
  })
  async function contract(config){
    const serviceRoot = 'https://aliconnect.nl/v1/docs';
    const titel = 'Explore-Legal-Contract.md';
    const contentType = 'text/html';
    Aim.fetch(serviceRoot+'/'+titel).get().then(content => {
      $('.page>div').text('').html(content.render().replaceTags(config)).querySelectorAll('.paint', elem => elem.paint()).append(
        $('style').text('.paint{display:block;}'),
        $('div').append(
          $('button').text('next').on('click', e => {
            abisClient.api(`/client(${config.client_id})/document`).post({titel,contentType}).then(doc => {
              abisClient.api(`/document(${doc.Id})/resource`).put(elem.convasToImg().el.innerHTML).then(body => {
                abisClient.api(`/client(${config.client_id})/config`).patch({ docs: { [titel]: doc.Id } }).then(body => {
                  console.log(body);
                  abisClient.api(`/client(${config.client_id})/config/mail`).post().then(body => {
                    console.log(body);
                  });
                  // success();
                });
              });
            });
            // e.target.remove();

            // aliconnectClient.api(`Document(${doc.Id})`).put(elem.convasToImg().el.innerHTML).then(body => {
            //   aliconnectClient.api(`Document(${doc.Id})`).get().then(body => {
            //     $('iframe').parent(document.body).src(`https://aliconnect.nl/api/v1.0/Document(${doc.Id})/resource`);
            //     aliconnectClient.api(`Client/Send/Update`).get();
            //     // aliconnectClient.api(`Document(${document.Id})/resource`).get().then(body => {
            //     //   console.debug(12, body);
            //     // });
            //   });
            // });
            // .then(success);
          })
        )
      )

    });


    return;

    const docs = [
      'Explore-Legal-Verwerkers-overeenkomst',
      // 'Explore-Legal-Verwerkingsregister',
      // 'Explore-Legal-Protocol-meldplicht-datalekken',
    ];
    for (let src of docs) {
      console.log(src);
      await new Promise(async (success,fail)=>{
        const docs = await abisClient.api(`/client(${config.client_id})/document`).select('titel').filter(`titel eq '${src}'`).get();
        // return console.log(docs);

        let doc = docs.shift();
        // console.log(doc);
        async function newdoc(){
          const content = await Aim.fetch(serviceRoot+'/'+src+'.md').get();
          elem.text('').html(content.render().replaceTags(config))
          .querySelectorAll('.paint', Aim.paint)
          .append(
            $('style').text('.paint{display:block;}'),
            $('div').append(
              $('button').text('next').on('click', e => {
                // e.target.remove();
                abisClient.api(`/document(${doc.Id})/resource`).put(elem.convasToImg().el.innerHTML).then(success);

                // aliconnectClient.api(`Document(${doc.Id})`).put(elem.convasToImg().el.innerHTML).then(body => {
                //   aliconnectClient.api(`Document(${doc.Id})`).get().then(body => {
                //     $('iframe').parent(document.body).src(`https://aliconnect.nl/api/v1.0/Document(${doc.Id})/resource`);
                //     aliconnectClient.api(`Client/Send/Update`).get();
                //     // aliconnectClient.api(`Document(${document.Id})/resource`).get().then(body => {
                //     //   console.debug(12, body);
                //     // });
                //   });
                // });
                // .then(success);
              })
            )
          )
        }
        if (doc && 0) {
          const content = await abisClient.api(`/document(${doc.Id})/resource`).get();
          elem.text('').html(content).append(
            $('div').append(
              $('button').text('new').on('click', newdoc),
              $('button').text('next').on('click', success),
            )
          );
        } else {
          doc = await abisClient.api(`/client(${config.client_id})/document`).post({
            titel: src,
            contentType: 'text/html',
          });
          newdoc();
        }
      })
      parentElem.text('');
    }
  }
  async function demopage(options){
    const {start,description} = options;
    await Web.listview.elem.loadPage();
    $('.page>div').class('').text('');
    $('.page>aside.right').text('');
    if(description){
      $('.page>div').append(
        $('h1').text('Inleiding'),
        $('p').text(description),
      )
    }
    await start();
    // console.log(String(start));
    $('.page>div').append(
      $('h2').text('Javascript'),
      $('pre').append(
        $('code').html(
          String(start).split(/\n/).slice(1).slice(0,-1).join('\n').unident().code('js')
        )
      ),
      // !this.data ? null : [
      //   $('h2').text('Data'),
      //   $('pre').append(
      //     $('code').style('max-height:500px;overflow:auto;').html(Markdown.code(JSON.stringify(data,null,2),'json'))
      //   ),
      // ],
    );
    // if (sources) {
    //   sources.forEach(source => {
    //     $('h2').parent('.page>div').text(source.src.split('/').pop());
    //     const elem = $('pre').parent('.page>div');
    //     Aim.fetch(source.src).get().then(body => elem.append(
    //       $('code').style('max-height:500px;overflow:auto;').html(Markdown.code(body,source.src.split('.').pop()))
    //     ))
    //   })
    // }
  }
  config({
    paths:{
      '/me/config': {
        get:{
          async operation() {
            // $('.icn-account').highlight({message: 'Meld u hier aan'});
            // $('.accountName').highlight({message: 'Meld u hier aan'});

            // const config_default = await Aim.fetch('/config/config_default').get();
            const self = this;
            const parentElem = await Web.listview.elem.loadPage();
            var elForm;
            let clientConfig = {};
            async function init() {
              console.log(config.tags,config.options);
              parentElem.text('').append(
                $('h1').text(`Welkom ${account.id.name}`),
                $('div').class('msg'),
                // $('i').svg('/assets/img/options/personen.svg'),
                // $('i').svg('/assets/img/options/shop.svg'),
                $('form').class('main').on('submit', submit).on('change', calc).append(
                  $('details').open(1).append(
                    $('summary').append(
                      $('h1').text('Uw gegevens'),
                    ),
                    $('div').append(
                      $('label').style('width:100px;display:inline-block;').text('Gebruikers'),
                      $('input').type('number').style('width:80px;display:inline-block;').name('gebruikers').min(1).value(1),
                    ),
                    $('div').append(
                      $('label').style('width:100px;display:inline-block;').text('EMail adres'),
                      $('input').type('text').style('width:200px;display:inline-block;').name('email').value(account ? account.id.email || account.id.accountname : ''),
                    ),
                    $('div').append(
                      $('label').style('width:100px;display:inline-block;').text('Domain'),
                      $('input').type('text').style('width:200px;display:inline-block;').autocomplete('off').name('domain').required(true).on('change', event => {
                        sessionStorage.setItem('domain', event.target.value);
                        init();
                      }),
                    ),
                    // $('div').append(
                    //   $('label').style('width:100px;display:inline-block;').text('Client id'),
                    //   $('input').type('text').style('width:300px;display:inline-block;font-family:monospace;').autocomplete('off').name('client_id'),
                    // ),
                    // $('div').append(
                    //   $('label').style('width:100px;display:inline-block;').text('Client secret'),
                    //   $('input').type('text').style('width:300px;display:inline-block;font-family:monospace;').autocomplete('off').name('client_secret').on('change', event => {
                    //     console.log(event);
                    //   }),
                    // ),
                  ),
                  $('details').open(1).append(
                    $('summary').append(
                      $('h1').text('Kies je modules'),
                    ),
                    $('form').class('options').append(
                      config.tags.map(tag => tag.elemMain = $('div').append(
                        // Array.from(Object.entries(options)).map(([name,option]) => (tags[name] = option = option || {}).elemMain = $('div').append(
                        $('input').type('checkbox').id(tag.name).name(tag.name),
                        $('label').for(tag.name).append(
                          // $('i').svg('/assets/img/options/'+(tag.icn||tag.name)+'.svg').css('background', tag.background),
                          // $('img').src('/assets/img/options/'+((option||{}).img||name)+'.svg').css('background', (option||{}).background),
                          tag.elemDiv = $('div').append(
                            $('div').append(
                              $('span').text(Format.displayName(tag.title||tag.name)),
                            ),
                            $('div').append(
                              $('b').text('€',num(tag.cost = tag.cost || 0)),
                              $('small').text(' / maand'),
                              $('span').text('?').style('float:right;display:inline-block;width:20px;height:20px;border:solid 1px gray;text-align:center').on('click', event => {
                                event.stopPropagation();
                                event.preventDefault();
                                tag.elemMain.style('flex: 1 0 100%;');
                                tag.elemDiv.append(
                                  $('div').text(tag.description),
                                )
                                event.target.remove();
                              })
                            ),
                          ),
                        ),
                      )),
                    ),
                  ),
                  $('details').open(0).append(
                    $('summary').append($('h1').text('Wijzig je gegevens')),
                    $('div').class('pageview').append(
                      $('form').class('properties gegevens'),
                    )
                  ),
                  $('details').open(0).append(
                    $('summary').append($('h1').text('Extra configuratie script')),
                    $('textarea').class('clientYaml').name('clientYaml').spellcheck(false).style('display:block;width:100%;height:600px;').on('keydown', async event => {
                      if (event.keyName==='CtrlKeyS') {
                        event.preventDefault();
                        event.stopPropagation();
                        $('button[value="save"]').click();
                        return
                        const {target} = event;
                        // var start = target.selectionStart;
                        // var end = target.selectionEnd;
                        await Aim.fetch(url).post(target.form).then(body => {
                          console.log('saved');
                          $(target).css('background',null);
                          // target.value = body;
                          // target.focus();
                          // target.selectionEnd = end;
                        }).catch(err => {
                          console.error(err);
                          $(target).css('background','rgba(255,0,0,0.1)');
                        });
                      }
                    }),
                  ),
                  $('nav').append(
                    // $('button').type('button').text('Opslaan client script').on('click', event => {
                    //   console.log(Object.fromEntries(new FormData(document.querySelector('form.main'))));
                    // }),
                    //
                    // $('button').type('button').text('Opslaan client script').on('click', event => abisClient.api('/client').post({
                    //   domain: elForm.domain.value,
                    //
                    //   clientYaml: document.querySelector('.clientYaml').value,
                    // }).then(body => console.debug(body))),
                    //
                    // $('button').type('button').text('Opslaan client').on('click', event => abisClient.api('/client').post({
                    //   domain: elForm.domain.value,
                    // }).then(body => console.debug(body))),
                    //
                    //
                    $('button').class('icn-save').name('response_type').value('save').text('Opslaan'),
                    $('button').class('icn-done').name('response_type').value('done').text('Gereed'),
                    $('button').class('icn-delete').text('Verwijderen').disabled(true).type('button').on('click', (event) => {
                      abisClient.api('/config').body(clientConfig).delete().then(body => {
                        console.log('Success');
                        document.location.reload();
                      }, err => {
                        Web.error(err);
                      })
                    }),
                    // $('button').class('icn-update').disabled(true).type('button').text('Bijwerken').on('click', async (event) => {}),
                    $('button').class('icn-zip').disabled(true).type('button').text('ZIP').on('click', async (event) => {
                      $('pre.response').text('Even wachten, zip files worden aangemaakt. Kan enkele minuten duren.');
                      const url = 'https://aliconnect.nl/v1/config?'+new URLSearchParams({clientId:clientConfig.client_id, response_type:'zip'});
                      fetch(url).then(response => response.blob()).then(blob => $('a').href(URL.createObjectURL(blob)).download('aliconnect.zip').click().remove());
                      return;
                      //
                      //
                      // const reader = new FileReader();
                      //
                      // abisClient.api('/config').query({clientId:clientConfig.client_id, response_type:'zip'}).get().then(body => {
                      //   console.log(body);
                      //   body.map(o => $('a').text(o.title).href(o.href).download(o.filename).style('display:block;')),
                      // })
                      // const body = await abisClient.api('/config').query({clientId:clientConfig.client_id, response_type:'zip'}).get();
                      // // console.log(body);
                      // $('pre.response').text('').append(
                      //   body.map(o => $('a').text(o.title).href(o.href).download(o.filename).style('display:block;')),
                      // )
                    }),
                  )
                ),
                $('div').class('col').append(
                  $('a').text('Overeenkomst').on('click', event => docToSign('Explore-Legal-Contract.md')),
                  $('a').text('Verwerkers overeenkomst').on('click', event => docToSign('Explore-Legal-Verwerkers-overeenkomst.md')),
                  $('a').text('Protocol meldplicht datalekken').on('click', event => docToSign('Explore-Legal-Protocol-meldplicht-datalekken.md')),
                  $('div').class('overeenkomst').style('background:white;color:black;'),
                ),
                $('pre').class('response'),
              );
              async function docToSign (name) {
                // const serviceRoot = 'https://aliconnect.nl/v1/docs';
                const serviceRoot = 'https://aliconnect.nl/v1/docs';
                const contentType = 'text/html';
                const content = await Aim.fetch(serviceRoot+'/'+name).get();
                console.log({clientConfig});
                $('div.overeenkomst').text('').html(content.render().replaceTags(clientConfig)).querySelectorAll('.paint', elem => elem.paint()).append(
                  $('style').text('.paint{display:block;}'),
                  $('div').append(
                    $('button').text('next').on('click', async (event) => {
                      const doc = await abisClient.api(`/client(${config.client_id})/document`).post({titel,contentType});
                      return console.log(doc);
                      await abisClient.api(`/document(${doc.Id})/resource`).put(elem.convasToImg().el.innerHTML);
                      await abisClient.api(`/client(${config.client_id})/config`).patch({ docs: { [titel]: doc.Id } });
                      await abisClient.api(`/client(${config.client_id})/config/mail`).post();
                    })
                  )
                );
              }
              const elForm = document.querySelector('form.main');
              const domain = elForm.domain.value = sessionStorage.getItem('domain');//url.searchParams.get('domain');// || sessionStorage.getItem('domain');

              // elForm.clientYaml.value = '';
              // elForm.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
              // console.log(tags);
              // Object.values(tags).forEach(option => option.checked = false);

              // options.forEach(option => option.checked = false);
              if (domain) {
                const {properties} = forms.clientConfig;
                clientConfig = await abisClient.api('/config').query({domain}).get().catch(err => console.log(err));
                if (!clientConfig) {
                  clientConfig = {};
                } else {
                  const {client_id} = clientConfig;
                  console.log(account);
                  elForm.clientYaml.value = await abisClient.api('/config').query({client_id,response_type:'yaml'}).get() || '';
                  // console.log(elForm.clientYaml.value);
                }
                $('form.gegevens').properties({properties, row:clientConfig}, true);
                // elForm.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
                const {options} = clientConfig;
                console.log({options});
                const formOptions = $('form.options').el;
                if (options) {
                  options.forEach(tag => document.querySelectorAll(`form.options input[name="${tag}"]`).forEach(el => el.checked = true));
                }
                $('button.icn-zip').disabled(!clientConfig.client_id);
                $('button.icn-delete').disabled(!clientConfig.client_id);
                calc();
              }
            }
            async function submit(event){
              event.preventDefault();
              const {submitter,target} = event;
              const {name,value} = submitter;
              const {info,client} = clientConfig;
              const options = Object.fromEntries(new FormData(document.querySelector('form.options')));
              const body = Object.assign(Object.fromEntries(new FormData(target)),{info,client,options});
              abisClient.api('/config').body(body).post().then(body => {
                console.debug(body);
                // Object.assign(clientConfig,body);
                // clientConfig = body;
                $('textarea.clientYaml').css('background-color',null);
                calc();
              }, err => {
                return Web.error(err);
                $('textarea.clientYaml').css('background-color','salmon');
                $('.messagebox').text('').append(err.message);
                $('.icn-account').highlight({message: 'Meld u hier aan'});
              })
            }
            async function calc(event){
              const options = new Map(new FormData(document.querySelector('form.options')));
              const tags = config.tags.filter(tag => options.has(tag.name));
              const elForm = document.querySelector('form.main');
              // if (event) {
              //   if (event.target && tags[event.target.name]) {
              //     tags[event.target.name].checked = event.target.checked;
              //   }
              // }
              // elForm.querySelectorAll('input').forEach(el => {
              //   if (tags[el.name]) {
              //     el.disabled = false;
              //     el.checked = tags[el.name].checked;
              //   }
              // });
              const {client_id} = clientConfig;
              const rightElem = $('aside.right').text('');
              if (!client_id) {
                $('div').parent(rightElem).text('Domein beschikbaar');
              } else {
                $('div').parent(rightElem).append(
                  $('a').target('mysite')
                  .text(`${elForm.domain.value}.aliconnect.nl`)
                  .href(
                    `https://${elForm.domain.value}.aliconnect.nl`
                  ),
                );
              }
              const elem = $('div').class('rek').parent(rightElem);
              var tot = elForm.gebruikers.value * config.costs.user;

              $('div').parent(elem).append(elForm.gebruikers.value, ' Gebruikers', $('span').text('€',num(tot)));

              var modules = tags.map(tag => tag.cost).reduce((a,b)=>a+b, 0);
              // console.debug(1111, options)
              $('div').parent(elem).append('Modules', $('span').text('€',num(modules)));
              tot += modules;
              $('div').parent(elem).class('tot').append(
                $('span').text('Totaal'),
                $('small').html('&nbsp;/&nbsp;maand'),
                $('span').text('€',num(tot))
              );
              $('div').parent(elem).class('messagebox');

              return;

              const body = await abisClient.api('/setup/change')
              .query(document.location.search)
              // .post(event && event.type === 'submit' ? event : elForm)
              .post(event && event.type === 'submit' ? event : elForm)
              // .catch(Aim.errorPopup);
              .then(body => {
                console.log(123123, body, clientConfig);
                const {config,next} = body;
                if (next) {
                  Aim[next](clientConfig);
                }
                return;
                value=value||{options:{}};
                // const {options} = value;

                // console.log(value.options, error,log,value,config,next);
                elForm.config.value = config||'';
                elForm.gebruikers.value = value.gebruikers || 1;
                // if (next) return Aim[next](value);

                elem.append((log||[]).map(log => $('div').text(log)));
                // console.log(log,value);
                // return;
                // const {log,value} = body;

                // elem.append(warn.map(warn => $('div').text(warn).style('color: orange;')));
                // elem.append(err.map(err => $('div').text(err).style('color: red;')));
                // elForm.config.value = body;
                if (config) {
                  const {client} = config;
                  // console.log(data,client.gebruikers,client,config);
                  if (config.options) {
                    config.options.forEach(option => elForm[option.name].checked = true);
                  }
                }
                return body;
              })
              .catch(error => {
                const {code,message,status,details,errors,innererror} = error||{};
                // console.log(error);
                // const {trace,context} = innererror||{};
                $('div').parent(elem).text(message).style('color: red;');
                // elem.append(err.map(err => $('div').text(message).style('color: red;')));
                // console.log(code,message,status,details);
                // const {code,message,status,details} = error;
                // elem.append(log.map(log => $('div').text(log)));
                // elem.append(warn.map(warn => $('div').text(warn).style('color: orange;')));
                return {error};
              })
              .finally(body => {
              });
              // console.log(1,body);
            }
            init();
          },
        },
      },
    },
    operations: {
      maak_facturen() {
        const period = url.searchParams.get('period');
        // return console.log(period);
        const supplier = {
          stylesheet: 'https://aliconnect.nl/assets/css/print.css',
          logo: 'https://aliconnect.nl/assets/img/logo/logodoc.png',
          companyName: 'Alicon Systems BV',
          companyMainTelephoneNumber: '+31(0)26 3390790',
          // businessFaxNumber: '',
          vatNumber: '234123412B01',
          bic: 'INGB10',
          iban: 'INGB 234123 12 34123',
          businessAddress: {
            postOfficeBox: '',
            street: 'Klingelbeeksweg',
            street2: '67',
            street3: '',
            postalCode: '6862 VS',
            city: 'Oosterbeek',
            state: '',
            country: 'Nederland',
          },
          otherAddress: {
            postOfficeBox: '',
            street: 'Geelkerkenkamp',
            street2: '14',
            street3: 'A',
            postalCode: '6862 ER',
            city: 'Oosterbeek',
            state: '',
            country: 'Nederland',
          },
        };
        abisClient.api(`/client`).get().then(async rows => {
          console.log(rows);
          for (let row of rows) {
            await abisClient.api(`/client(${row.id})/usage/period`).query({period}).get().then(async ([methods,[users]]) => {
              if (!methods.length) return;
              // return console.log(methods,users);
              await abisClient.api(`/client(${row.id})/config`).get().then(async config => {
                var {options,tags} = config;
                if (options) {
                  console.log(config, tags);
                  const customer = {
                    companyName: config.client.dataController.companyName,
                    businessAddress: {
                      postOfficeBox: '',
                      street: config.client.dataController.businessAddress.street,
                      street2: '',
                      street3: '',
                      postalCode: config.client.dataController.businessAddress.postalCode,
                      city: config.client.dataController.businessAddress.city,
                      state: config.client.dataController.businessAddress.state,
                      country: config.client.dataController.businessAddress.country,
                    },
                    // otherAddress: {
                    //   postOfficeBox: '',
                    //   street: '',
                    //   street2: '',
                    //   street3: '',
                    //   postalCode: '',
                    //   city: 'Arnhem',
                    //   state: '',
                    //   country: '',
                    // },
                    btw: {
                      0: {proc: 0},
                      1: {proc: 6},
                      2: {proc: 21},
                    },
                  };
                  const rows = [{
                    pos: 1,
                    artId: 123,
                    code: 'users',
                    description: 'Gebruikers',//'Kast, Alicon, Groen, 1200 x 400',
                    // remark: 'Klantspecifiek',
                    // remarkInternal: 'Afwerken rond 5',
                    quant: users.quant,
                    unit: 'st',
                    listprice: 18,
                    discount: 0,
                    weight: 1200, // gram
                    unNr: 3400,
                    unCat: 'AB',
                    loc: '3.1.1',
                    btwcode: 2,
                  }].concat(tags.map(tag => Object({
                    pos: 1,
                    artId: 123,
                    code: tag.name,
                    description: tag.description,//'Kast, Alicon, Groen, 1200 x 400',
                    // remark: 'Klantspecifiek',
                    // remarkInternal: 'Afwerken rond 5',
                    quant: 1,
                    unit: 'st',
                    listprice: tag.cost,
                    discount: 0,
                    weight: 1200, // gram
                    unNr: 3400,
                    unCat: 'AB',
                    loc: '3.1.1',
                    btwcode: 1,
                  })), methods.map(method => Object({
                    pos: 1,
                    artId: 123,
                    code: method.name,
                    description: method.name+' 1000 st',
                    quant: Math.ceil(method.quant/1000),
                    unit: 'st',
                    listprice: 0.10,
                    discount: 0,
                    weight: 1200, // gram
                    unNr: 3400,
                    unCat: 'AB',
                    loc: '3.1.1',
                    btwcode: 2,
                  })));
                  const content = {
                    supplier,
                    customer,
                    rows,

                    invoiceNr: '22020001',
                    orderNr: '512313',
                    customerNr: '00432',
                    remark: 'Opmerking',
                    orderDate: '1-1-2020',
                    sendDate: '1-1-2020',
                    customerReference: 'UwRef',
                    orderType: 'Mail',
                    transportType: 'Route',

                    discountProc: 2,

                  };
                  console.log(content);
                  await abisClient.api(`/me/mail/send`).body({
                    // 'prio'=>2,
                    'to': 'max.van.kampen@alicon.nl',
                    // 'bcc'=> 'max.van.kampen@alicon.nl',
                    'chapters': [
                      {'title': "Factuur", 'content': "Uw factuur" },
                    ],
                    'attachements': [
                      { 'name': 'invoice.pdf', 'content': invoice(content).innerHTML },
                    ],
                  }).post().then(body => {
                    console.log(body);
                  });
                }
              });
            });
          }
        });
      },
      async formoverzicht() {
        const parentElem = await Aim.loadMdPage();
        const editmode = true;
        const row = {
          schemaName: 'test',
        }
        const properties = {
          html:{
            type: 'string',
            format: 'html',
            placeholder: 'Type hier html in',
          },
          accountname:{
            type: 'string',
            format: 'email',
            required: true,
            autocomplete: 'off',
          },
          password:{
            type: 'string',
            format: 'password',
            required: true,
            minlength: 8,
          },
          required1:{
            type: 'string',
            required: true,
          },
          email1:{
            type: 'string',
            format: 'email',
          },
          color:{
            type: 'string',
            format: 'color',
          },
          time:{
            type: 'time',
            format: 'time',
          },
          date:{
            type: 'date',
            format: 'date',
            required: true,
          },
          datetime:{
            type: 'datetime',
            format: 'datetime',
          },
          week:{
            type: 'string',
            type: 'week',
          },
          month:{
            type: 'string',
            type: 'month',
          },

          file:{
            type: 'file',
          },
          number:{
            type: 'number',
          },

          // range1:{
          //   type: 'integer',
          //   format: 'range',
          //   min: 0,
          //   max: 10,
          // },
          meter1:{
            type: 'integer',
            // format: 'meter',
            format: 'range',
            min: 0,
            optimum: 2,
            low: 4,
            high: 8,
            max: 10,
            step: 2,
          },
          meter2:{
            type: 'integer',
            // format: 'meter',
            format: 'range',
            min: 0,
            optimum: 5,
            low: 3,
            high: 7,
            max: 10,
            step: 1,
          },

          search:{
            type: 'search',
          },
          tel:{
            type: 'tel',
          },
          url:{
            type: 'url',
          },
          boolean1:{
            type: 'boolean',
          },
          radio1:{
            type: 'string',
            format: 'radio',
            options: [
              'red',
              'green',
              'blue',
            ],
          },
          radio11:{
            type: 'string',
            format: 'radio',
            options: [
              { title: 'Red' },
              { title: 'Green' },
              { title: 'Blue' },
            ],
          },
          radio2:{
            type: 'string',
            format: 'radio',
            options: {
              r: 'Red',
              g: 'Green',
              b: 'Blue',
            }
          },
          radio3:{
            type: 'string',
            format: 'radio',
            options: {
              r: {
                title: 'Red',
                color: 'red',
              },
              g: {
                title: 'Green',
                color: 'green',
              },
              b: {
                title: 'Blue',
                color: 'blue',
              },
            }
          },
          select1:{
            type: 'string',
            format: 'select',
            description: 'Select multiple options from array',
            required: true,
            options: [
              {
                title: 'Red',
                color: 'red',
              },
              {
                title: 'Green',
                color: 'green',
              },
              {
                title: 'Blue',
                color: 'blue',
              },
            ]
          },
          select2:{
            type: 'string',
            format: 'select',
            description: 'Select multiple options from object',
            options: {
              r: {
                title: 'Red',
                color: 'red',
              },
              g: {
                title: 'Green',
                color: 'green',
              },
              b: {
                title: 'Blue',
                color: 'blue',
              },
            }
          },
          last:{
            type: 'string',
          },
        }
        parentElem.text('').append(
          $('div').class('pv').append(
            $('form').on('focusin', e => {
              $('#params').text(JSON.stringify(properties[e.target.name],null,2));
              console.log(e.target.name);
            }).on('change', e => {

              $('#row').text(JSON.stringify(row,null,2));
              $('.pv>div').text('').buildForm({row,properties});
            }).buildForm({row,properties,editmode}),
            $('div'),
            $('pre').id('params'),
            $('pre').id('row'),
          )
        )
      },
      async databaseoverzicht() {
        // const parentElem = (await Aim.loadMdPage()).text('');
        const parentElem = document.body;
        const tableElem = $('tbody').parent($('table').style('white-space:nowrap;font-size:0.9em;font-family:monospace;').parent($('div').style('position:absolute;overflow:auto;height:calc(100vh - 50px);width:100vw;top:50px;background:white;').parent(parentElem)).append(
          $('thead').append(
            $('tr').style('background:#ccc;').append(
              'schema,name,legend,title,format,type,size,filter,outlook,crmc,abis2'.split(',').map(v => $('th').text(v)),
            )
          )
        ));
        const {options} = config;
        var sql = '';
        Object.entries(options).forEach(([optionName,option])=>{
          console.log(optionName,option);
          if (option && option.config && option.config.components) Object.entries(option.config.components.schemas).forEach(([schemaName,schema])=>{
            Object.entries(schema.properties).filter(([propertyName,property])=>property).forEach(([propertyName,property])=>{
              property.name = propertyName;
              const {legend,title,format,type,size,filter,outlook,crmc,abis2}=property||{};
              $('tr').parent(tableElem).append(
                [schemaName,propertyName,legend,title,format,type,size,filter,outlook,crmc,abis2].map(v => $('td').text(v)),
              )
            })
            if (schema.abis2) {
              var names1 = Object.values(schema.properties).filter(property => property.abis2).map(property => property.name);
              var names2 = Object.values(schema.properties).filter(property => property.abis2).map(property => property.abis2);
              sql += `

              DELETE ${schemaName}
              SET IDENTITY_INSERT ${schemaName} ON
              INSERT INTO ${schemaName} ([${schemaName}Id],${names1.join(',')}) SELECT ${schema.abis2idName},[${names2.join('],[')}]
              FROM ${schema.abis2}
              SET IDENTITY_INSERT ${schemaName} OFF`;
            }
          })
        })
        console.log(sql);
      },
      async contract(config){
        console.log(4523452345234, config);
        const parentElem = await Aim.loadMdPage();
        const serviceRoot = 'https://aliconnect.nl/docs';
        const docs = [
          'Explore-Legal-Verwerkingsregister',
          'Explore-Legal-Protocol-meldplicht-datalekken',
          'Explore-Legal-Verwerkers-overeenkomst',
        ];
        const elem = $('div').parent(parentElem.text('').append(
          $('style').text('canvas.paint{border:solid 1px gray;}'),
        ));
        for (let src of docs) {
          console.log(src);
          await new Promise(async (success,fail)=>{
            const docs = await aliconnectClient.api(`/Client(${config.client_id})/Document`).select('Titel').filter(`titel eq '${src}'`).get();
            let doc = docs.shift();
            console.log(docs);
            console.log(doc);
            async function newdoc(){
              const content = await Aim.fetch(serviceRoot+'/'+src+'.md').get();
              elem.text('').html(content.render().replace(config)).querySelectorAll('.paint', Aim.paint)
              .append(
                $('style').text('.paint{display:block;}'),
                $('div').append(
                  $('button').text('next').on('click', e => {
                    e.target.remove();
                    aliconnectClient.api(`/Client(${config.client_id})/Document(${doc.Id})/resource`).put(elem.convasToImg().el.innerHTML).then(success);

                    // aliconnectClient.api(`Document(${doc.Id})`).put(elem.convasToImg().el.innerHTML).then(body => {
                    //   aliconnectClient.api(`Document(${doc.Id})`).get().then(body => {
                    //     $('iframe').parent(document.body).src(`https://aliconnect.nl/api/v1.0/Document(${doc.Id})/resource`);
                    //     aliconnectClient.api(`Client/Send/Update`).get();
                    //     // aliconnectClient.api(`Document(${document.Id})/resource`).get().then(body => {
                    //     //   console.debug(12, body);
                    //     // });
                    //   });
                    // });
                    // .then(success);
                  })
                )
              )
            }
            if (doc && 0) {
              const content = await aliconnectClient.api(`/Client(${config.client_id})/Document(${doc.Id})/resource`).get();
              elem.text('').html(content).append(
                $('div').append(
                  $('button').text('new').on('click', newdoc),
                  $('button').text('next').on('click', success),
                )
              );
            } else {
              doc = await aliconnectClient.api(`/Client(${config.client_id})/Document`).post({
                titel: src,
                contentType: 'text/html',
              });
              newdoc();
            }
          })
        }
        parentElem.text('');
      },
      demoChartXY1: () => demopage({
        async start() {
          const href = 'https://aliconnect.nl/demo/data/chartXY1';
          const data = await Aim.fetch(href).get();
          console.log(data);
          $('div.page>div').class('').text('').append(
            $('div').append('Data: ', $('a').text(href+'.yaml').href(href+'.yaml').target('bron')),
            $('div').style('height:600px;border:solid 1px gray;').chart(data)
          );
        }
      }),
      demoChartPie1: () => demopage({
        async start() {
          const href = 'https://aliconnect.nl/demo/data/chartPie1';
          const data = await Aim.fetch(href).get();
          console.log(data);
          $('div.page>div').class('').text('').append(
            $('div').append('Data: ', $('a').text(href+'.yaml').href(href+'.yaml').target('bron')),
            $('div').style('height:600px;border:solid 1px gray;').chart(data)
          );
        }
      }),
      _demoChart1: () => demopage({
        async start() {
          const factor = 365/daysIntoYear(new Date);
          const options = {
            // cursor: { type: "XYCursor", behavior: "zoomY" },
            legend: {
              type: "Legend",
              position: "right",
              scrollable : true,
            },
            // scrollbarX: { type: "XYChartScrollbar", scrollbarX: "scrollbarX" },
            yAxes: [{ type: "CategoryAxis", renderer: { minGridDistance: 20, grid: { location: 0 } }, dataFields: { category: "category" } }],
            xAxes: [{ type: "ValueAxis" }],
          };
          const charts = [
            [ 'Omzet/jaar',  '/chart/omzet/jaar' ],
            [ 'Orders/jaar',  '/chart/orders/aantal/jaar' ],
            [ 'Regels/jaar',  '/chart/regels/aantal/jaar' ],
          ];
          function daysIntoYear(date){
            return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
          }
          function chart(elem, path, options) {
            Aim.fetch('https://dms.aliconnect.nl/api/v1/abisingen'+path).get().then(([rows]) => {
              console.log(path, rows);
              rows.filter(row => row.category==2022).forEach(row => rows.push({ name: row.name, category: String(row.category)+'*', value: Math.round(row.value * factor) }));
              elem.chart(rows, options);
            });
            return elem;
          }
          $('.page>aside.right').text('');
          $('.page>div').class('').text('').append(
            // $('script').text('#legenddiv{color:red !important;}'),
            charts.map(([title,path]) => [
              $('h1').text(title),
              chart($('div').style('display:block;height:10cm;border:solid 1px gray;'), path, options),
            ]),
          );
        }
      }),
      demoGraph1: () => demopage({
        async start() {
          const href = 'https://aliconnect.nl/demo/data/graph1';
          const data = await Aim.fetch(href).get();
          $('.page>div').append(
            $('div').append('Data: ', $('a').text(href+'.yaml').href(href+'.yaml').target('bron')),
            $('div').style('height:600px;border:solid 1px gray;').graph(data),
          )
        },
      }),
      demoThree1: () => demopage({
        async start() {
          const layoutSource = 'https://aliconnect.nl/demo/data/maglayout';
          const data = await Aim.fetch(layoutSource).get();
          // const [rows] = await Aim.fetch('https://dms.aliconnect.nl/api/v1/abisingen/analyse/maganalyse').get();
          // data.pickpos = rows.map(row => Object({
          //   pos: row.maglokatie.split('.'),
          //   color: 0xff0000,
          // }))
          // $('.page>aside.right').text('');
          $('.page>div').class('').text('').append(
            $('div').append('Layout: ', $('a').text(layoutSource+'.yaml').href(layoutSource+'.yaml').target('bron')),
            $('div').style('height:500px;').three(data),
            // $('div')
            // .style('display:block;height:100%;width:100%;position:absolute;')
            // .three(data),
          );
        },
      }),
      demoGoogleMap: () => demopage({
        async start() {
          const href = 'https://aliconnect.nl/demo/data/maps1';
          const {value} = await Aim.fetch(href).get();
          $('.page>div').append(
            $('div').append('Data: ', $('a').text(href+'.yaml').href(href+'.yaml').target('bron')),
            $('div').style('height:600px;border:solid 1px gray;').googleMap(value),
          );
        },
      }),
      demoGoogleRoute: () => demopage({
        async start() {
          const href = 'https://aliconnect.nl/demo/data/maps1';
          const {value} = await Aim.fetch(href).get();
          $('.page>div').append(
            $('div').append('Data: ', $('a').text(href+'.yaml').href(href+'.yaml').target('bron')),
            $('div').style('height:600px;border:solid 1px gray;').googleRoute(value),
            $('div').class('pageview'),
          )
        },
      }),
      demoFactuur1: () => demopage({
        async start() {
          const href = 'https://aliconnect.nl/demo/data/invoice1';
          const data = await Aim.fetch(href).get();
          $('.page>div').append(
            $('div').append('Data: ', $('a').text(href+'.yaml').href(href+'.yaml').target('bron')),
            $('div').append(
              $('button').text('Order print').on('click', event => Abis.purchaseorder(data).print()),
              $('button').text('Factuur print').on('click', event => Abis.invoice(data).print()),
              $('button').text('Factuur verzenden').on('click', event => {
                api(`/me/mail/send`).body({
                  // 'prio'=>2,
                  'to': 'max.van.kampen@alicon.nl',
                  // 'bcc'=> 'max.van.kampen@alicon.nl',
                  'chapters': [
                    {'title': "Aliconnect Configuratie bijgewerkt 2", 'content': "Uw configuratie is bijgewerkt" },
                  ],
                  'attachements': [
                    // { 'name': 'purchaseorder.pdf', 'content': purchaseorder(order).innerHTML },
                    { 'name': 'invoice.pdf', 'content': Abis.invoice(data).innerHTML },
                    // { 'name': 'invoice.pdf', 'content': invoice().innerHTML },
                    // { 'name': 'prijslijst.xls', base64 },
                  ],
                }).post().then(body => {
                  console.log(body);
                });
              }),
            ),
          )
        }
      }),
      demoForm: () => demopage({
        async start() {
          const href = 'https://aliconnect.nl/demo/data/form1';
          const {properties,row} = await Aim.fetch(href).get();
          $('div.page>div').class('pv').append(
            $('div').append('Data: ', $('a').text(href+'.yaml').href(href+'.yaml').target('bron')),
            $('h1').text('Form'),
            $('h2').text('Edit'),
            $('form').class('properties').properties({properties,row},true).on('change', event => console.log(row)),
            $('h2').text('View'),
            $('div').class('properties').properties({properties,row}),
          )
        },
      }),
      demoPayForm: () => demopage({
        async start() {
          const href = 'https://aliconnect.nl/demo/data/invoice1';
          const data = await Aim.fetch(href).get();
          $('div.page>div').append(
            Abis.payform(data),
          )
        },
      }),
      demoPdfProducties: () => demopage({
        description: `Bij het bekijken van depagina kan je op de hyperlinks klikken ([CTRL]+klik toont de bijlage in een nieuw venster).
        Na Maak PDF worden de bijlage als productie toegevoegd.`,
        async start() {
          const href = 'https://aliconnect.nl/samples/pdf-producties/letter.md';
          const content = await Aim.fetch(href).get();
          const elem = $('div').html(content.render());
          $('.page>div').append(
            $('div').append('Content: ', $('a').text(href).href(href).target('bron')),
            elem,
            $('div').append(
              $('button').text('Maak PDF met producties').on('click', event => Pdf.producties(elem)),
            )
          )
        },
      }),
      demoPdfToData: () => demopage({
        begin: $('div').append(
          $('h1').text('Intro'),
          $('p').text(
            `Analyseren van pdf`
          ),
        ),
        async start() {
          const url = 'https://rws-lts.aliconnect.nl/bstti/input/R1.2 SP2 B2-1.6 Basisspecificatie TTI RWS Tunnelsysteem.pdf';
          var data;
          $('.page>div').append(
            $('li').append(
              'Bron: ', $('a').text(url).href(url).target('pdf'),
            ),
            $('li').append(
              $('button').text('pdf to data').on('click', async event => {
                data = await Pdf.getPages(url);
                console.log(data);
              }),
              $('progress'),
            ),
          )
        },
      }),
      demoWebcam: () => demopage({
        async start() {
          const facingMode = 'environment'; // environment | user
          const url = new URL(document.location);
          const cam = url.searchParams.get('cam');
          const wall = url.searchParams.get('wall');
          function camOn(){
            $('div').parent('.page>div').webcam({cam,wall,facingMode}, socketClient.webSocket);
          }
          $('.page>div').append(
            $('div').append(
              $('button').class('icn-back').on('click', event => {}),
              $('button').text('icn-cam').on('click', camOn),
            )
          );
        },
      }),
      demoCam: () => demopage({
        async start() {
          $('.page>div').append(
            $('div').cam()
          );
        },
      }),
      demoExcelExport: () => demopage({
        // var elem = $('a').download(`test.xlsx`).rel('noopener').href(URL.createObjectURL(new Blob([s2ab(wbout)],{type:"application/octet-stream"}))).click().remove();
        async start() {
          const dataSrc = 'https://aliconnect.nl/demo/data/demoDataExcelExport';
          const data = await Aim.fetch(dataSrc).get();
          const {out,base64,href} = await XLSBook.create(data);
          console.log(href);
          $('.page>div').append(
            $('div').append('Data: ', $('a').text(dataSrc+'.yaml').href(dataSrc+'.yaml').target('bron')),
            $('div').append(
              $('a').download(`test.xlsx`).text(`test XLS`).href(href)
            ),
            $('div').append(
              $('button').text('Send').on('click', event => {
                abisClient.api(`/me/mail/send`).body({
                  // 'prio'=>2,
                  'to': 'max.van.kampen@alicon.nl',
                  'chapters': [
                    {'title': "Aliconnect Configuratie bijgewerkt 2", 'content': "Uw configuratie is bijgewerkt" },
                  ],
                  'attachements': [
                    { 'name': 'prijslijst.xls', base64 },
                  ],
                }).post().then(body => {
                  console.log(body);
                });
              }),
            ),
          );
        },
      }),
      demoExcelImport: () => demopage({
        async start() {
          const configSrc = 'https://aliconnect.nl/demo/data/demoDataExcelImport';
          const config = await Aim.fetch(configSrc).get();
          console.log(config);
        },
      }),
      demoTest1: () => demopage({
        async start() {
          /** DEMO CAM */
          const facingMode = 'environment'; // environment | user
          const url = new URL(document.location);
          const cam = url.searchParams.get('cam');
          const wall = url.searchParams.get('wall');

          $('.page>div').append(
            $('div').parent(document.body).webcam({cam,wall,facingMode}, socketClient.webSocket),
          );

          return;

          /** DEMO TREE EN LISTVIEW */
          const data = {
            rows: [
              { schemaName: 'company' },
              { schemaName: 'company' },
              { schemaName: 'company' },
            ],
          }
          const treeview = new Treeview;
          const listview = new Listview;
          $('.page>div').append(
            $('div').class('row').style('height:500px;').append(
              treeview.create().seperator(),
              listview.create(),
            )
          );
          treeview.append({
            crm: { children: {
              klanten: {
                $path: '/company',
                $filter: `typecode LIKE '%K%'`,
                $search: '',
                $top: 100,
              },
            }},
          });
          listview.render(data.rows);

          return;

          const contentSource = 'https://aliconnect.nl/demo/data/md-pdf-bijlage.md';
          const content = await Aim.fetch(contentSource).get();

          const messageContent = {
            title:'Test',
            options: {
              body: `Bla Bla`,
              url: 'https://moba.aliconnect.nl?test=1',
              icon: 'https://aliconnect.nl/favicon.ico',
              image: 'https://aliconnect.nl/shared/265090/2020/07/09/5f0719fb8fa69.png',
              // data: 'https://moba.aliconnect.nl?test=1',
              data: {
                href: document.location.href,
                url: document.location.href,
              },
              //   actions: [
              //     {
              //       action: 'open-action',
              //       title: 'Open',
              //       icon: 'https://aliconnect.nl/favicon.ico',
              //     },
              //     // {
              //     //   action: 'doughnut-action',
              //     //   title: 'Doughnut',
              //     //   icon: '/images/demos/action-2-128x128.png'
              //     // },
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
            }
          };
          $('.page>div').append(
            $('div').append(
              $('button').text('notify-init').on('click', event => {
                Messenger.init();
              }),
              $('button').text('notify-message').on('click', event => {
                Messenger.show(messageContent);
              }),
              $('button').text('notify-message-send').on('click', event => {
                socketClient.send('NOTIFY_MESSAGE', messageContent);
              }),

            )
          );
          return;
          $('.page>div').append(

            $('div').append(

              $('button').text('iframe page src').on('click', event => Abis.iframeSrc('https://aliconnect.nl/demo/data/md-pdf-bijlage.md')),
              $('button').text('iframe page html').on('click', event => Abis.iframeHtml('<h1>Hoi</h1>')),
              $('button').text('sample window').on('click', event => Abis.sampleWindow('https://aliconnect.nl/demo/data/md-pdf-bijlage.md')),
            ),
            $('div').style('height:500px;').three({
              src: 'https://aliconnect.nl/demo/data/portalgun/portalgun.3ds',
              controls: 'trackbal',
              camera: {
                fov: 60,
                near: 1,
                far: 10,
                posZ: 2,
              }
            }),
            $('div').style('height:500px;').three({
              src: 'https://aliconnect.nl/demo/data/portalgun/portalgun-kubus.3ds',
              controls: 'trackbal',
              camera: {
                fov: 30,
                near: 1,
                far: 10,
                posZ: 2,
              }
            }),
            $('div').svg('https://aliconnect.nl/sdk@0.0.9/src/font/svg/contactpersoon.svg'),
            // $('div').style('height:500px;').tds({
            //   src: 'https://aliconnect.nl/demo/data/portalgun/portalgun-maserati.3ds',
            //   hasControls: true,
            // }),
            $('div').append('Content: ', $('a').href(contentSource).target('bron')),
            $('table').append(
              $('thead').append(
                $('tr').append(
                  $('td').text('kop1'),
                  $('td').text('kop2'),
                ),
              ),
              $('tbody').append(
                $('tr').append(
                  $('td').text('val1'),
                  $('td').text('val2'),
                ),
                $('tr').append(
                  $('td').text('val1'),
                  $('td').text('val2'),
                ),
              ),
            ).resizable(),

            $('div').qrcode('ja is goed'),
            // $('img').qrcode('ja is goed'),

            $('div').html(content.render()).render()
          );
        },
      }),
      demoTest2: () => demopage({
        async start() {
          let item;
          const href = 'https://aliconnect.nl/demo/data/config1';
          const config = await Aim.fetch(href).get();
          Aim.config(config);
          console.log(config);
          function refresh(){
            $('.page>div>pre').text(JSON.stringify(item,null,2));
            console.log(item);
          }
          $('.page>div').append(
            $('div').append(
              $('button').text('Mail').on('click', async (event) => {
                /** DEMO MAIL */
                const {email} = account.id;
                console.log(email,account);
                // return;
                await abisClient.api(`/me/mail/send`).body({
                  // 'prio'=>2,
                  'to': email,//'max.van.kampen@alicon.nl',
                  // 'bcc'=> 'max.van.kampen@alicon.nl',
                  'chapters': [
                    {'title': "Factuur", 'content': "Uw factuur" },
                  ],
                  'attachements': [
                    { 'name': 'invoice.pdf', 'content': 'GROET' },
                  ],
                }).post().then(body => console.log(body));
              }),
              $('button').text('QR Read').on('click', async (event) => {
                Elem.qrscan().on('data', event => {
                  const {detail} = event;
                  alert(detail);
                  // client.send('/login/qrcode', {sid:detail});
                })
              }),
              $('button').text('AIM Item').on('click', async (event) => {
                console.log(new Aim({id:'test-1'}));
              }),
              $('button').text('Popup error').on('click', async (event) => {
                Abis.error({
                  code: 300,
                  status: 'status',
                  statusText: 'statusText',
                  message: 'Message',
                  url: 'gdskfjgskjdfgls jdlfk',
                  trace: [
                    'dfgsdfg sdf gsdfg sdfg s',
                  ],
                });
              }),
              $('button').text('item post').on('click', async (event) => {
                item = new Item({client_id,schemaName:'account'});
                await item.post();
                refresh(item);
              }),
              $('button').text('item get').on('click', async (event) => {
                item = new Item({id:'ddf32b40-ddc7-43ab-a9fd-4a2fe54dc076',schemaName:'account'});
                await item.get();
                refresh(item);
              }),
              $('button').text('item form').on('click', async (event) => {
                const {properties} = item;
                $('.page>div>form').clear().properties({properties,row:item}, true);
              }),
              $('button').text('item get').on('click', async (event) => {
                refresh(item);
              }),
              $('button').text('find').on('click', async (event) => {
                const items = await Doc.find({client_id,name:'20201016_403710 - Brief - Van Kampen(P000418868).pdf'});
                item = items[0];
                refresh();
              }),
              $('button').text('update').on('click', async (event) => {
                await item.update();
                refresh();
              }),
              $('button').text('view').on('click', event => {
                item.view();
              }),
              $('button').text('download').on('click', event => {
                item.download();
              }),
              $('button').text('add multiple').on('click', event => {
                $('input').type('file').multiple(true).accept('').on('change',event=>{
                  Array.from(event.target.files).forEach(async file => {
                    const {name,type,size,lastModified} = file;
                    const item = new Doc({client_id,name,type,size,lastModified});
                    await item.post();
                    await item.put(file);
                    item.view();
                    // item.download();
                    // const reader = new FileReader();
                    // reader.addEventListener('load', async event => {
                    //   // save(addImg({name,type,size,lastModified,src:value=reader.result}));
                    //   console.log(reader.result);
                    //   await item.put(reader.result);
                    //   console.log(item.id);
                    // }, false);
                    // reader.readAsDataURL(file);
                  })
                }).click().remove()
              }),
            ),
            $('pre'),
            $('form'),
          )
          // return;
          //
          // const name = 'Explore-Legal-Contract.md';
          // const type = 'text/markdown';
          // const doc = new Doc({client_id,name,type});
          // console.log(doc);
          // await doc.post();
          // console.log(doc.id, doc);
          // await doc.put('data:text/markdown;base64,'+btoa('hoi'));
          // console.log(doc.id, doc.lastUploadDateTime, doc);
          // await doc.get();
          // console.log(doc.id, doc);
          // await doc.put('data:text/markdown;base64,'+btoa('hoi2'));
          // console.log(doc.id, doc.lastUploadDateTime, doc);
          // const content = await doc.content();
          // console.log(doc.id, content, doc.href, doc);
          // doc.download();
          // console.log(doc.id);
        },
      }),
      demoContract: () => demopage({
        async start() {
          const contentSource = 'https://aliconnect.nl/demo/data/contract-voorbeeld.md';
          const dataSource = 'https://aliconnect.nl/demo/data/contract';
          const content = await Aim.fetch(contentSource).get();
          const data = await Aim.fetch(dataSource).get();
          const elem = $('div').html(content.render().replaceTags(data))
          .querySelectorAll('.paint', elem => elem.paint())
          .append(
            $('div').append(
              $('button').text('next').on('click', event => {
                elem.convasToImg();
              }),
            ),
          );
          $('.page>div').append(
            $('style').text('.paint{display:block;}'),
            $('div').append('Content: ', $('a').href(contentSource).target('bron')),
            $('div').append('Data: ', $('a').href(dataSource+'.yaml').target('bron')),
            elem,
          );
        },
      }),
      demoCodeEditor: () => demopage({
        async start() {
          $('.page>div').append(
            $('pre').append(
              $('code').editor('js'),
            ),
          );
        },
      }),
      demoGanth1: () => demopage({
        async start() {
          const href = 'https://aliconnect.nl/demo/data/calendar1';
          const data = await Aim.fetch(href).get();
          $('.page>div').append(
            $('div').ganth(data),
          );
        },
      }),
      demoCalendar1: () => demopage({
        async start() {
          const href = 'https://aliconnect.nl/demo/data/calendar1';
          const data = await Aim.fetch(href).get();
          $('.page>div').append(
            $('div').calendar(data),
          );
        },
      }),

      async demoPaypal(){
      },
      async demoIdeal(){
      },
      async aanmelden(){
      },
    }
  });
}, err => {
  console.error(err);
  $(document.body).append(
    $('div').text('Deze pagina is niet beschikbaar'),
  )
}));
