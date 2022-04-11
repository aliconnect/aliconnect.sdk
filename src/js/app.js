$().on('load', async e => {


  function api(path, options) {
    return aim.fetch('https://dms.aliconnect.nl/api/v1'+path).headers(localStorage.getItem('access_token') ? {
      Authorization: 'bearer ' + localStorage.getItem('access_token'),
    } : {});
  }
  function login() {
    localStorage.setItem('access_token', '');
    $(document.body).text('').append(
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
  }

  function list(title) {
    $(document.body).style('height:100%;').text('').append(
      $('div').class('card'),
      $('nav').append(
        // $('button').text('contacten').on('click', e => contacten()),
        $('div').class('title').text(title),
        $('a').class('icn-back').caption('Terug').on('click', e => menu()),
      ),
      $('div').class('search').append(
        $('input').placeholder('Typ hier om te zoeken').value(localStorage.getItem('search'+title)).on('change', e => {
          localStorage.setItem('search'+title, e.target.value);
          searchfunction(e.target.value);
        }),
      ),
      $('div').class('list'),
    );
  }

  async function contact(organisatieId,contactpersoonId) {
    const [[detail]] = await api('/app/contacten').query({
      select: `*`,
      filter: `organisatieId=${organisatieId} AND ISNULL(contactpersoonId,0)=0${contactpersoonId||0}`,
      organisatieId: organisatieId,
      contactpersoonId: contactpersoonId,
    }).get();
    console.log(detail.contactpersoonId,detail);

    function input(name, tagname = 'input', options) {
      // console.log(tagname);
      return $(tagname).value(detail[name]).placeholder(aim.displayName(name)).on('change', async e => {
        await api('/app/contacten').query({
          organisatieId: organisatieId,
          contactpersoonId: contactpersoonId,
        }).post({
          [name]: detail[name] = e.target.value,
        });
      }).append(options ? options.map(k => $('option').text(k).selected(k==detail[name])) : null);
    }

    const config = {
      contactNames: [
        'Titel',
        'Roepnaam',
        'Voornamen',
        'Voorletters',
        'Tussenvoegsel',
        'Achternaam',
        'TitelNa',
        // 'WeergaveNaam',
      ],
      phoneNames: [
        'MobielZakelijk',
        'MobielPrive',
        'TelefoonOrganisatie',
        'TelefoonZakelijk',
        'TelefoonPrive',
        'FaxOrganisatie',
        'FaxZakelijk',
        'FaxPrive',
      ],
      mailNames: [
        'MailadresZakelijk',
        'MailadresOrganisatie',
        'MailadresFacturatie',
        'MailadresPrive',
      ],
      linkNames: [
        'WebsiteOrganisatie',
        'LinkedIn',
        'Skype',
        'Twitter',
        'Facebook',
        'Instagram',
        'TikTok',
      ],
      adresNames: [
        'Bezoekadres',
        'Postadres',
        'Woonadres',
      ],
      remarkNames: [
        // 'OpmerkingenPersoon',
        'OpmerkingenContact',
        'OpmerkingenOrganisatie',
      ],
      groupNames: [
        [
          'KVK_Nummer',
          'KVK_Omschrijving',
        ],
        [
          'IBAN',
          'BIC',
          'BankNummer',
          'Bank_Omschrijving',
          'Swift',
        ],
        [
          'Debiteur_Nummer',
          'BTW_Nummer',
        ],
        [
          'Indicatie_Omzet',
          'Indicatie_Winst',
          'Indicatie_Activa',
        ],
      ]
    };

    function options(a,v) {
      return a.map(k => $('option').text(k).selected(k==v))
    }

    $('.card').text('').append(
      $('nav').append(
        $('a').class('icn-back').caption('Zoek').on('click', e => {
          $('.card').text('');
          window.scrollTo(0,scrollY);
        }),
        $('a').text('Wijzig').style('margin-left:auto;').on('click', e => {
          $('.card').text('').append(
            $('nav').append(
              $('a').text('Gereed').style('margin-left:auto;').on('click', e => contact(organisatieId,contactpersoonId)),
            ),
            $('div').class('panel').append(
              $('div').append(
                input('Aanspreekvorm', 'select', [
                  '',
                  'De heer',
                  'Mevrouw',
                  'De heer/mevrouw',
                  'Mr.',
                  'Mrs.',
                  'Frau',
                  'Madame',
                  'Monsieur',
                  'Madame',
                  'Beste',
                ]),
                input('Titel', 'select', [
                  '',
                  'ing',
                  'mr',
                ]).style('width: 70px;').placeholder('Titel'),
              ),
              $('div').append(
                input('Voornamen'),
              ),
              $('div').append(
                input('Voorletters').style('width: 70px;'),
                input('Roepnaam'),
              ),
              $('div').append(
                input('Tussenvoegsel').style('width: 70px;'),
                input('Achternaam'),
              ),
              // config.contactNames.map(name => input(name)),
            ),
            $('div').class('panel').append(
              config.phoneNames.map(name => $('div').append(input(name))),
            ),
            $('div').class('panel').append(
              config.mailNames.map(name => $('div').append(input(name))),
            ),
            $('div').class('panel').append(
              config.linkNames.map(name => $('div').append(input(name))),
            ),
            $('div').class('panel').append(
              config.adresNames.map(name => [
                $('div').append(
                  $('label').text(aim.displayName(name)),
                ),
                $('div').append(
                  input(name+'Straat').placeholder('Straat').style('flex: 1 1 auto;width: 50%;'),
                  input(name+'Nummer').placeholder('Nr.').style('width: 70px;'),
                  input(name+'Toevoeging').placeholder('Toe.').style('width: 70px;'),
                ),
                $('div').append(
                  input(name+'Postcode').placeholder('Postcode').style('width: 100px;'),
                  input(name+'Plaats').placeholder('Plaats').style('flex: 1 1 auto;width: 50%;'),
                ),
                $('div').append(
                  input(name+'Land').placeholder('Land').style('flex-grow: 1;width: 40%;'),
                  input(name+'Provincie').placeholder('Provincie').style('flex: 1 1 auto;width: 40%;'),
                ),
              ]),
            ),
            config.groupNames.map(arr => $('div').class('panel').append(
              arr.map(name => $('div').append(input(name))),
            )),
          );
          window.scrollTo(0,0);
        }),
      ),
      $('div').style('text-align:center;').append(
        $('div').class('image').append(
          detail.ContactAfbeeldingBlob
          ? $('img')
          .style('border-radius:500px;width:200px;height:200px;object-fit:cover')
          .src(`data:${detail.ContactAfbeeldingType};base64,${detail.ContactAfbeeldingBlob}`)
          .on('click', e => {
            const img = $('img').parent(document.body).src(`data:${detail.ContactAfbeeldingType};base64,${detail.ContactAfbeeldingBlob}`)
            .style('position:fixed;top:0;right:0;bottom:0;left:0;object-fit:contain;width:100%;height:100%;background-color:rgba(0,0,0,0.5);')
            .on('click', e => img.remove());
          })
          : null,
        ),
        $('div').text(
          detail.Titel,
          detail.Voorletters ? `${detail.Voorletters} ${detail.Roepnaam ? `(${detail.Roepnaam})` : ''}` : detail.Roepnaam,
          detail.Tussenvoegsel,
          detail.Achternaam,
        ),
        $('div').class('organisatienaam').text(detail.OrganisatieNaam).style('font-size: 0.8em;'),
      ),
      $('div').class('panel').append(
        config.phoneNames.map(name => detail[name] ? $('div').append(
          $('label').text(aim.displayName(name)),
          $('div').append(
            $('a').href('tel:'+detail[name]).text(detail[name]),
          ),
        ) : null),
      ),
      $('div').class('panel').append(
        config.mailNames.map(name => detail[name] ? $('div').append(
          $('label').text(aim.displayName(name)),
          $('div').append(
            $('a').href('mailto:'+detail[name]).text(detail[name])
          ),
        ) : null),
      ),
      $('div').class('panel').append(
        config.linkNames.map(name => detail[name] ? $('div').append(
          $('label').text(aim.displayName(name)),
          $('div').append($('a').href(detail[name]).text(detail[name])),
        ) : null),
      ),
      config.adresNames.map(group => {
        const s = [
          detail[group+'Straat'],
          detail[group+'Nummer'],
          detail[group+'Toevoeging'],
          detail[group+'Postcode'],
          detail[group+'Plaats'],
          detail[group+'Land'],
          detail[group+'Provincie'],
        ].filter(Boolean).join('+');
        if (s) return $('div').class('panel').append(
          $('div').style('display:flex;flex-direction: row;').append(
            $('div').append(
              $('div').text(detail[group+'Straat'], detail[group+'Nummer'], detail[group+'Toevoeging']),
              $('div').text(detail[group+'Postcode'], detail[group+'Plaats']),
              $('div').text(detail[group+'Land'], detail[group+'Provincie']),
            ),
            $('a').class('').text('MAP').style('color:inherit;margin-left:auto;').href(`https://www.google.com/maps/search/?api=1&query=`+s),
          ),
        )
      }),
      config.remarkNames.map(name => $('div').class('panel').append(
        $('div').append(
          $('label').text(aim.displayName(name)),
          input(name,'textarea').text(detail[name]),
        ),
      )),
      config.groupNames.map(arr => $('div').class('panel').append(
        arr.map(name => detail[name] ? $('div').append(
          $('label').text(aim.displayName(name)),
          $('div').text(detail[name]),
        ) : null),
      )),
      $('div').class('panel').append(
        detail.kenmerken.map(kenmerk => $('div').text(kenmerk).append(
          $('button').class('icn-del'),
        )),
      ),
    );
    window.scrollTo(0,0);
  }
  const methods = {
    async producten(search) {
      searchfunction = arguments.callee;
      list('Producten');
      const [rows] = await api('/app/producten').query({
        search: localStorage.getItem('searchProducten') || '',
      }).get();
      console.log(rows);
      $('.list').text('').append(
        rows.map(row => $('div').append(
          $('div').append(row.Titel),
          $('div').class('row').append(
            `${row.Id.pad(5)} (-${aim.num(row.inkKorting)}% / € ${aim.num(row.inkNetto)})`,
            $('span').class('bruto').text('€',aim.num(row.Bruto)),
            // $('span').class('inknetto').text(aim.num(row.inkNetto)),
          ),
        ).on('click', e => {
          const scrollY = window.scrollY;
        }))
      )
      window.scrollTo(0,0);
    },
    async contacten(search) {
      searchfunction = arguments.callee;
      list('Relaties');

      const [rows] = await api('/app/contacten').query({
        select: `organisatienaam,achternaam,roepnaam,voornamen,voorletters,tussenvoegsel,organisatieId,contactpersoonId`,
        order: `ISNULL(achternaam,'zzz'),organisatienaam`,
        search: localStorage.getItem('searchRelaties') || '',
      }).get();
      console.log(rows);
      $('.list').text('').append(
        rows.map(row => $('div').append(
          // $('div').append(row.roepnaam||row.voornamen||row.voorletters, row.tussenvoegsel).append($('b').text(row.achternaam))),
          $('div').append(`${row.roepnaam||row.voorletters||row.voornamen||''} ${row.tussenvoegsel||''} <b>${row.achternaam||''}</b>`),
          $('div').class('organisatienaam').text(row.organisatienaam),
        ).on('click', e => {
          const scrollY = window.scrollY;
          contact(row.organisatieId,row.contactpersoonId);
        }))
      )
      window.scrollTo(0,0);
    },
    async campanyinfo(search) {
      searchfunction = arguments.callee;
      list('CompanyInfo');
      if (search) {
        const result = await api('/app/companyinfo').query({
          search: search,
        }).get();
        // console.log(result);
        const rows = result.out.results.item;
        // console.log(rows);
        $('.list').text('').append(
          rows.map(row => $('div').append(
            $('div').append(row.name),
            $('div').append(row.establishment_city, row.establishment_street),
          ).on('click', async e => {
            const scrollY = window.scrollY;
            const result = await api('/app/companyinfo').query({
              dossier_number: row.dossier_number,
            }).get();
            const {out} = result;
            const detail = out;
            $('.card').text('').append(
              $('nav').append(
                $('a').class('icn-back').caption('Zoek').on('click', e => {
                  $('.card').text('');
                  window.scrollTo(0,scrollY);
                }),
                $('a').text('Voegtoe').style('margin-left:auto;').on('click', e => {
                  $('.card').text('');
                  window.scrollTo(0,0);
                }),
              ),
              $('div').class('panel').append(
                $('label').text('Organisatie'),
                $('div').text(detail.legal_name),
                $('div').text('Chamber number', detail.chamber_number),
                $('div').text('RSIN', detail.rsin_number),
                $('div').text('Bedrijfs vorm', detail.legal_form_code),
                $('div').text(detail.legal_form_text),
                $('div').text('Handelsnaam', detail.trade_name_45),
                $('div').text('Handelsnaam volledig', detail.trade_name_full),
              ),
              $('div').class('panel').append(
                $('label').text('Bezoekadres'),
                $('div').text(detail.establishment_street, detail.establishment_house_number, detail.establishment_house_number_addition),
                $('div').text(detail.establishment_postcode, detail.establishment_city),
              ),
              $('div').class('panel').append(
                $('label').text('Postadres'),
                $('div').text(detail.correspondence_street, detail.correspondence_house_number, detail.correspondence_house_number_addition),
                $('div').text(detail.correspondence_postcode, detail.correspondence_city, detail.correspondence_country),
              ),
              $('div').class('panel').append(
                $('div').text('Telefoon', detail.telephone_number),
                $('div').text('Domeinnaam', detail.domain_name),
              ),
              $('div').class('panel').append(
                $('label').text('Contactpersoon'),
                $('div').text(detail.contact_title1),
                $('div').text(detail.contact_title2),
                $('div').text(detail.contact_initials, detail.contact_prefix, detail.contact_surname),
                $('div').text(detail.contact_gender),
              ),
              $('div').class('panel').append(
                $('label').text('SBI'),
                $('div').text(detail.primary_sbi_code),
                $('div').text(detail.secondary_sbi_code1),
                $('div').text(detail.secondary_sbi_code2),
                $('div').text(detail.primary_sbi_code_text),
                $('div').text(detail.secondary_sbi_code1_text),
                $('div').text(detail.secondary_sbi_code2_text),
              ),
              $('div').class('panel').append(
                $('div').text(`${detail.personnel}FTE (${detail.class_personnel}), ${detail.personnel_fulltime}FTE (${detail.class_personnel_fulltime}) Fulltime`),
              ),
              $('div').class('panel').append(
                $('div').text(detail.indication_import ? 'Importeur' : ''),
                $('div').text(detail.indication_export ? 'Exporteur' : ''),
                $('div').text(detail.indication_economically_active ? 'Actief' : ''),
                $('div').text(detail.indication_non_mailing ? 'Geen mailing' : ''),
                $('div').text(detail.indication_bankruptcy ? 'Bankrupt' : ''),
                $('div').text(detail.indication_dip ? 'Dip' : ''),
                $('div').text('Inleg kapitaal:', detail.paid_up_share_capital, detail.paid_up_share_capital_currency),
                $('div').text('Aandelen kapitaal:', detail.issued_share_capital, detail.issued_share_capital_currency),
              ),
              $('div').class('panel').append(
                $('div').text(`Opgericht: ${detail.founding_date.Day}/${detail.founding_date.Month}/${detail.founding_date.Year}`),
                $('div').text(`Voortgezet: ${detail.continuation_date.Day}/${detail.continuation_date.Month}/${detail.continuation_date.Year}`),
                $('div').text(`Bouwdatum pand: ${detail.establishment_date.Day}/${detail.establishment_date.Month}/${detail.establishment_date.Year}`),
              ),
            );
          }))
        )
        window.scrollTo(0,0);
      }
    },
    async activiteiten(search) {
      searchfunction = arguments.callee;
      list('Activiteiten');
      const [rows] = await api('/app/activiteiten').query({
        search: localStorage.getItem('searchActiviteiten') || '',
      }).get();
      console.log(rows);
      // const [rows] = data;
      $('.list').text('').append(
        rows.map(row => $('div').append(
          $('div').append(new Date(row.startDatumTijd).toLocaleString()),
          $('div').append(row.omschrijving),
          // $('div').append(row.datum, row.begintijd, row.eindtijd),
          $('div').append($('a').text(row.contactPersoonNaam, row.organisatieNaam).on('click', e => contact(row.organisatieId,row.contactpersoonId))),
          // $('div').append(row.contactpersoonId),
          // $('div').append(row.projectId),
        )),
      )
      window.scrollTo(0,0);
    },
  }
  function menu(){
    $(document.body).text('').append(
      $('div').class('list').append(
        config.appmenu.map(
          menuitem => $('div')
          .class(`icn-${menuitem.icon || menuitem.name} panel`)
          .text(aim.displayName(menuitem.title || menuitem.name))
          .on('click', e => methods[menuitem.name]())
        ),
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
  // $(document.body).style(`
  //   background-color: rgb(
  //     ${config.opties.gebruikerOpties.schermkleuren.algemeen.kleurAchtergrond.r},
  //     ${config.opties.gebruikerOpties.schermkleuren.algemeen.kleurAchtergrond.g},
  //     ${config.opties.gebruikerOpties.schermkleuren.algemeen.kleurAchtergrond.b}
  //   );
  // `)

  return localStorage.getItem('access_token') ? menu() : login();
});
window.addEventListener( 'scroll', e => {
  if (window.scrollYdir != (window.scrollYdir = (window.scrollYdiff = (window.scrollYprev||0) - (window.scrollYprev = window.scrollY)) > 0)) {
    document.querySelector('div.search').style.top = window.scrollYdir ? null : -50 + 'px';
  };
});
