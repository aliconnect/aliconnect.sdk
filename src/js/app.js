$().on('load', async e => {
  let nav;
  config = await aim.fetch('https://dms.aliconnect.nl/api/v1/app/config').get();
  console.log(config);
  config.appmenu.push(
    { name: 'magazijn' },
    { name: 'inkoop' },
  )
  abis.login(document.body);
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
          .on('click', e => abis[menuitem.name](document.body))
        ),
      ),
    )
  }
});
// window.addEventListener( 'scroll', e => {
//   if (window.scrollYdir != (window.scrollYdir = (window.scrollYdiff = (window.scrollYprev||0) - (window.scrollYprev = window.scrollY)) > 0)) {
//     document.querySelector('div.search').style.top = window.scrollYdir ? null : -50 + 'px';
//   };
// });
