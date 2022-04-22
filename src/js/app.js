$().on('load', async e => {
  let nav;
  function menu(){
    $(document.body).text('').append(
      $('div').class('list').append(
        config.appmenu.map(
          menuitem => $('div')
          .class(`icn-${menuitem.icon || menuitem.name} panel`)
          .text(aim.displayName(menuitem.title || menuitem.name))
          .on('click', e => abis[menuitem.name]())
        ),
        $('div').class('icn-shop panel').text('Bestellijst').on('click', e => abis.bestellijst()),
        // $('div').class('icn-contact panel').text('Relaties').on('click', e => contacten()),
        // $('div').class('icn-shop panel').text('Producten').on('click', e => producten()),
        // $('div').class('icn-task panel').style('background:black;color:white;').append(
        //   $('div').class('relaties').text('Contact')
        // ),
        // $('div').class('icn-task panel').style('background:white;color:black;').append(
        //   $('div').class('relaties').text('Contact')
        // ),
        // $('div').class('icn-task panel').style('background:black;color:white;').append(
        //   $('div').class('projecten').text('Contact')
        // ),
        // $('div').class('icn-task panel').style('background:black;color:white;').append(
        //   $('div').class('activiteiten').text('Contact')
        // ),
        //
        //
        // $('div').class('icn-calendar panel').text('Agenda').on('click', e => contacten()),
        // $('div').class('icn-km panel').text('KM').on('click', e => contacten()),
        // $('div').class('icn-km panel').text('Tijd').on('click', e => contacten()),
        // $('div').class('icn-config panel').text('Opties').on('click', e => contacten()),
        $('div').class('icn-login panel').text('Afmelden').on('click', e => login()),
      ),
    );
  }
  function start(){
    let searchfunction;

    // contacten();
  }
  config = await aim.fetch('https://dms.aliconnect.nl/api/v1/app/config').get();
  console.log(config);
  $(document.body).append(
    $('form').on('submit', async e => {
      e.preventDefault();
      // localStorage.setItem('client_id', e.target.client_id.value);
      try {
        // console.log(await api('/login').post(e.target));
        const {access_token} = await api('/app/login').post(e.target);
        localStorage.setItem('access_token', access_token);
        location.reload();
      } catch (err) {
        alert(err);
      }
    }).append(
      $('div').text('Inlognaam'),
      $('input').name('accountname'),
      $('div').text('Wachtwoord'),
      $('input').name('password').type('password'),
      // $('div').text('Client ID'),
      // $('input').name('client_id').value(localStorage.getItem('client_id')),
      $('div').append(
        $('button').text('Login'),
      ),
    )
  )
  if (localStorage.getItem('access_token')) {
    const elemMenu = $('div').parent(document.body).append(
      $('nav').append(
        $('div').class('title').text('Menu'),
        $('a').class('icn-back').caption('Login').on('click', e => elemMenu.remove()),
      ),
      $('div').class('list').append(
        config.appmenu.map(
          menuitem => $('div')
          .class(`icn-${menuitem.icon || menuitem.name} panel`)
          .text(aim.displayName(menuitem.title || menuitem.name))
          .on('click', e => abis[menuitem.name]())
        ),
        // $('div').class('icn-shop panel').text('Bestellijst').on('click', e => abis.bestellijst()),
        // $('div').class('icn-contact panel').text('Relaties').on('click', e => contacten()),
        // $('div').class('icn-shop panel').text('Producten').on('click', e => producten()),
        // $('div').class('icn-task panel').style('background:black;color:white;').append(
        //   $('div').class('relaties').text('Contact')
        // ),
        // $('div').class('icn-task panel').style('background:white;color:black;').append(
        //   $('div').class('relaties').text('Contact')
        // ),
        // $('div').class('icn-task panel').style('background:black;color:white;').append(
        //   $('div').class('projecten').text('Contact')
        // ),
        // $('div').class('icn-task panel').style('background:black;color:white;').append(
        //   $('div').class('activiteiten').text('Contact')
        // ),
        //
        //
        // $('div').class('icn-calendar panel').text('Agenda').on('click', e => contacten()),
        // $('div').class('icn-km panel').text('KM').on('click', e => contacten()),
        // $('div').class('icn-km panel').text('Tijd').on('click', e => contacten()),
        // $('div').class('icn-config panel').text('Opties').on('click', e => contacten()),
        // $('div').class('icn-login panel').text('Afmelden').on('click', e => login()),
      ),
    )
  }
});
window.addEventListener( 'scroll', e => {
  if (window.scrollYdir != (window.scrollYdir = (window.scrollYdiff = (window.scrollYprev||0) - (window.scrollYprev = window.scrollY)) > 0)) {
    document.querySelector('div.search').style.top = window.scrollYdir ? null : -50 + 'px';
  };
});
