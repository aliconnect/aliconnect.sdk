Web.on('loaded', async function () {
  const url = new URL(document.location);
  const serviceRoot = url.origin + url.pathname;
  const {searchParams} = url;
  var id_token = searchParams.get('id_token');
  var accountname;
  let messageEvent;
  const {Client,Prompt,config} = Web;
  config({serviceRoot});
  const authClient = Client.create({serviceRoot});
  url.port = 444;
  console.log(url.origin);

  const socketClient = Client.create({
    // serviceRoot: 'https://aliconnect.nl:444/v1',
    // serviceRoot: 'http://localhost:81',//'https://aliconnect.nl:444/v1',
    serviceRoot: url.origin,
  });
  // console.log(socketClient);
  await socketClient.connect();
  window.addEventListener('message', event => {
    messageEvent = event;
    // const {data} = event;
    // const {message_type,content,to,path} = data;
    // console.log(event);
    // // messageEvent = event;
    // // aim.messageHandler = event;
    // switch(path) {
    //   // case '/loginPopup': return messageEvent.source.postMessage({path}, messageEvent.origin);
    //   case '/close': return window.close();
    // }
  }, false);
  $(document.body).append(
    $('main').append(
      $('div')
    ),

  )
  Prompt.set({
    login: async elem => form(elem).append(
      $('div').style('display:flex').append(
        $('div').style('flex:1 0 auto;margin-right:10px;').append(
          $('h1').text('Aanmelden'),
          $('div').class('msg'),
          $('div').append(
            // .style('position:absolute;top:0;width:5px;height:5px;'),
            $('input').required(true).name('accountname').placeholder('E-mailadres of telefoonnummer'),
            $('input').name('password').class('hidden').type('password'),
          ),
          $('div').append(
            'Geen account? ',
            $('a').text('Maak er een').on('click', event => Prompt.open('create_account')),
          ),
          $('div').class('col').append(
            // $('a').ttext('Aanmelden met Windows account'),
            $('a').text('Aanmeld opties').on('click', event => Prompt.open('login_options')),
          ),
        ),
        await $('div').style('flex:0 0 120px;').qrcode(socketClient.webSocket.sid),
      ),
      $('nav').append(
        $('button').class('icn-chevron_right').caption('Volgende').default().style('margin-left:auto;'),
      ),
    ),
    password: elem => form(elem).append(
      $('nav').append(
        $('button').class('icn-back').caption(accountname).type('button').on('click', event => Prompt.open('login')),
      ),
      $('h1').text('Wachtwoord'),
      $('div').class('msg'),
      $('div').append(
        $('input').required(true).name('password').type('password'),
        $('input').required(true).class('hidden').name('accountname').value(accountname).placeholder('E-mailadres of telefoonnummer'),
      ),
      $('div').append(
        $('a').text('Wachtwoord kwijt').on('click', event => Prompt.open('reset_password')),
      ),
      $('nav').append(
        $('button').class('icn-chevron_right').caption('Volgende').default().style('margin-left:auto;'),
      ),
    ),
    create_account: elem => form(elem).append(
      $('nav').append(
        $('button').class('icn-back').text(accountname).type('button').on('click', event => Prompt.open('login')),
      ),
      $('h1').text('Aanmaken account'),
      $('div').class('msg').text('Wij maken een account aan'),
      $('div').append(
        $('input').required(true).name('accountname').placeholder('E-mailadres'),
        // $('input').name('password').type('password').placeholder('Uw wachtwoord'),
      ),
      $('nav').append(
        $('button').class('icn-chevron_right').caption('Volgende').default().style('margin-left:auto;'),
      ),
    ),

    email_verifycode_send: elem => form(elem).append(
      $('div').class('msg').text('Er wordt een email verstuurd met een beveiligingscode'),
    ).emit('submit'),

    email_verified: elem => form(elem).append(
      // this.removeOnSucces = true;
      $('nav').append(
        $('button').class('icn-back').text(accountname).type('button').on('click', event => Prompt.open('login')),
      ),
      $('div').class('msg').text('Er is een email verstuurd met een beveiligingscode'),
      $('div').append(
        $('input').required(true).autocomplete('off').name('verify_code').placeholder('Voer hier uw beveiligingscode in'),
      ),
      $('div').append(
        $('a').text('Stuur nieuwe code').on('click', event => Prompt.open('email_verifycode_send')),
      ),
      $('nav').append(
        $('button').class('icn-chevron_right').caption('Volgende').style('margin-left:auto;'),
      ),
    ),

    reset_password: elem => form(elem).append(
      $('div').class('msg').text('Er wordt een verficatie code verstuurd aan uw email'),
    ).emit('submit'),
    reset_password_verify: elem => form(elem).append(
      $('nav').append(
        $('button').class('icn-back').text(accountname).type('button').on('click', event => Prompt.open('login')),
      ),
      $('div').class('msg').text('Er is een email verstuurd met een beveiligingscode'),
      $('div').append(
        $('input').required(true).autocomplete('off').name('verify_code').placeholder('Voer hier uw beveiligingscode in'),
      ),
      $('div').append(
        $('a').text('Stuur nieuwe code').on('click', event => Prompt.open('reset_password')),
      ),
      $('nav').append(
        $('button').class('icn-chevron_right').caption('Volgende').style('margin-left:auto;'),
      ),
    ),
    setpassword: elem => form(elem).append(
      $('nav').append(
        $('button').class('icn-back').text(accountname).type('button').on('click', event => Prompt.open('login')),
      ),
      $('h1').text('Wachtwoord instellen'),
      $('div').class('msg'),
      $('input').required(true).type('email').name('accountname').value(accountname).class('hidden'),
      $('input').required(true).type('password').autocomplete("new-password").name('password').placeholder('Voer uw wachtwoord in'),
      $('input').required(true).type('password').autocomplete("new-password").name('password2').placeholder('Voer uw controle wachtwoord in'),
      $('nav').append(
        $('button').class('icn-chevron_right').caption('Volgende').default().style('margin-left:auto;'),
      ),
    ).on('_submitted', event => document.location.reload()),
    phone_number: elem => form(elem).append(
      // this.removeOnSucces = true;
      $('nav').append(
        $('button').class('icn-back').text(accountname).type('button').on('click', event => Prompt.open('login')),
      ),
      $('div').class('msg').text('Voer uw telefoonummer in voor 2 traps verificatie'),
      $('div').append(
        $('input').required(true).name('phone_number').placeholder('Voer hier uw 06 nummer in'),
      ),
      $('nav').append(
        $('button').class('icn-chevron_right').caption('Volgende').style('margin-left:auto;'),
      ),
    ),
    phone_number_verifycode_send: elem => form(elem).append(
      $('div').class('msg').text('Er wordt een SMS verstuurd met een beveiligingscode'),
    ).emit('submit'),
    phone_number_verified: elem => form(elem).append(
      // this.removeOnSucces = true;
      $('nav').append(
        $('button').class('icn-back').text(accountname).type('button').on('click', event => Prompt.open('login')),
      ),
      $('div').class('msg').text('Er is een SMS verstuurd met een beveiligingscode'),
      $('div').append(
        $('input').required(true).autocomplete('off').name('verify_code').placeholder('Voer hier uw beveiligingscode in'),
      ),
      $('div').append(
        $('a').text('Stuur nieuwe code').on('click', event => Prompt.open('phone_number_verifycode_send')),
      ),
      $('nav').append(
        $('button').class('icn-chevron_right').caption('Volgende').style('margin-left:auto;'),
      ),
    ),
    login_options: elem => form(elem).append(
      $('nav').append(
        $('button').class('icn-back').text(accountname).type('button').on('click', event => Prompt.open('login')),
      ),
      $('h1').ttext('Kies een methode voor aanmelden'),
      $('a').ttext('Aanmelden met Windows account'),
      $('a').ttext('Aanmelden met Google account'),
      $('a').ttext('Aanmelden met Facebook account'),
    ),
    accept: elem => (searchParams.get('response_type') === 'token' ? $('form').method('post').parent(elem) : form(elem)).append(
      $('nav').append(
        $('button').class('icn-back').text(accountname).type('button').on('click', event => Prompt.open('login')),
      ),
      $('h1').text('Toegang tot gegevens'),
      $('div').class('msg').text('De applicatie wil toegang tot de volgende gegevens:'),
      $('div').append(
        $('input').name('id_token').value(id_token).type('hidden'),
        url.searchParams.get('scope').split(' ').map(scope => $('div').append(
          $('input').name(scope).id(scope).type('checkbox').checked(true),
          $('label').text(Format.displayName(scope)).for(scope),
        )),
      ),
      $('nav').append(
        $('button').class('icn-chevron_right').caption('Volgende').style('margin-left:auto;'),
      ),
    ),
  });
  Prompt.open(searchParams.get('prompt') || 'login');
  // Prompt.open(url.searchParams.get('prompt') || 'login');
  function form(parent) {
    return parent.formElem = $('form').method('post').parent(parent).on('submit', async event => {
      event.preventDefault();
      setTimeout(() => event.target.parentElement.className='out');
      // event.target.parentElement.className='out';
      authClient.api('/')
      .query(document.location.search)
      .query({id_token})
      .post(event.target)
      .then(body => {
        console.log(body);
        var {prompt,error,code,redirect_uri} = body;
        // console.log({prompt,error,code});
        if (redirect_uri) {
          return document.location.href = redirect_uri;
        }

        if (code) {
          // console.log(atob(code.split('.')[1]));
          const state = url.searchParams.get('state');
          const redirect_uri = url.searchParams.get('redirect_uri');
          if (redirect_uri) {
            return document.location.href = aim.fetch(redirect_uri).query({code,state}).href;
          }
          if (messageEvent) {
            // messageEvent.source.postMessage({message_type: 'LOGIN_ACK',content:{code,state}}, messageEvent.origin);
            messageEvent.source.postMessage({message_type: 'LOGIN_ACK',content:{code,state}}, '*');
            window.close();
            return;
          }
          return document.location.reload();
        }
        id_token = body.id_token;
        accountname = body.accountname;
        parent.formElem.emit('submitted');
        Prompt.open(prompt||'login');
        // setTimeout(event => Prompt.open(prompt||'login'), 500);
        // setTimeout(event => parent.formElem.remove(), 500);
      }).catch(error => {
        console.error(error);
        event.target.parentElement.className='in';
        $(parent.el.querySelector('.msg')).text('').append(
          $('div').text(error.message).style('color:red;'),
        );
      });
    });
  }
})
