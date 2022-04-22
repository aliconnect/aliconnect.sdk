abis = (function(){
  const docBasePath = 'https://aliconnect.nl/';
  function api(path, options) {
    return aim.fetch('https://dms.aliconnect.nl/api/v1'+path).headers(localStorage.getItem('access_token') ? {
      Authorization: 'bearer ' + localStorage.getItem('access_token'),
    } : {});
  }
  return {
    contact(organisatieId,contactpersoonId) {
      const elem = $('div').class('card').parent(document.body);
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
      (async function show() {
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
        function edit() {
          elem.text('').append(
            $('nav').append(
              $('a').text('Gereed').style('margin-left:auto;').on('click', show),
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
        }
        elem.text('').append(
          $('nav').append(
            $('a').class('icn-back').caption('Zoek').on('click', e => {
              elem.remove();
              window.scrollTo(0,scrollY);
            }),
            $('a').text('Wijzig').style('margin-left:auto;').on('click', edit),
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
          $('div').class('panel').append(
            $('button').text('Bestellijst').on('click', e => {
              window.history.replaceState('page', '', (document.location.search ? document.location.search + '&' : '?') + 'klant_id='+detail.organisatie_id);
              abis.bestellijst(document.body);
            }),
            $('button').text('Overeenkomst').on('click', async e => {
              Word.run(async context => {
                const body = aim.replaceFields(await aim.fetch(docBasePath + 'Explore-Legal-Contract-Voorbeeld.md').get(),detail);
                console.log(body);
                var range = context.document.getSelection();
                range.insertHtml(aim.markdown().render(body), Word.InsertLocation.end);
                // range.insertHtml('<ol><li>a<ul><li>b</li></ul></li><li>TEST</li></ol>', Word.InsertLocation.end);

                // range.insertHtml(`
                //   <ol>
                //     <li>First Item</li>
                //     <li>Second Item</li>
                //     <li>Third Item
                //         <ol type="a">
                //           <li>Third Item - One</li>
                //           <li>Third Item - Two
                //               <ol type="I">
                //                 <li>Sample Item A</li>
                //                 <li>Sample Item A</li>
                //               </ol>
                //           </li>
                //         </ol>
                //     </li>
                //     <li>Fourth Item</li>
                //   </ol>
                //   `, Word.InsertLocation.end);

                // for (var i = 0, line; line = wrlines[i]; i++) {
                //   var html = [];
                //   if (line.html) range.insertHtml(line.html, Word.InsertLocation.end);
                //   if (line.Base64String) range.insertInlinePictureFromBase64(line.Base64String, Word.InsertLocation.end);
                // }
                await context.sync();
              });
            }),
            $('button').text('Verzenden').on('click', e => {
              Word.run(async context => {
                e.target.disabled = true;
                var body = context.document.body;
                var bodyHTML = body.getHtml();
                await context.sync();
                var html = bodyHTML.value.replace(/.*?<body.*?>(.*?)<\/body>.*/s,'$1');
                var html = html
                .replace(/<(\w+)\s.*?>/sg,'<$1>')
                .replace(/&nbsp;/g,' ')
                .replace(/\r\n/g,'')
                .replace(/\s+/g,' ')
                .replace(/>\s</g,'><')
                // context.document.innerHtml;
                await aim.fetch('https://dms.aliconnect.nl/api/v1/abis/send').body({
                  from: "mailer@alicon.nl",
                  // from: "max.van.kampen@alicon.nl",
                  // to: 'max.van.kampen@outlook.com',
                  to: "max.van.kampen@alicon.nl",
                  chapters: [
                    { title:"Contract", content: 'Hierbij contract' },
                    // { title:"Aliconnect Configuratie bijgewerkt", content: 'test' },
                  ],
                  attachements: [
                    { name: `Contract-${new Date().toLocaleString()}.pdf`, content: '<link href="https://proving-nl.aliconnect.nl/assets/css/print.css" rel="stylesheet"/>'+html },
                    // { name: `Contract-${new Date().toLocaleString()}.pdf`, content: html },
                  ],
                }).post();
                e.target.disabled = false;
              });
            }),
          )
        );
        window.scrollTo(0,0);
      })();
    },
    bestellijst(parent) {
      const elem = $('div').parent(parent).class('bestellijst');
      (async function show(search){
        const [rows] = await api('/abis/bestel'+document.location.search).query().get();
        function rowdiv(row) {
          return $('div').append(
            $('div').append(row.titel),
            $('form').class('row product').on('submit', async e => {
              e.preventDefault();
              const res = await api('/abis/klantartikel').query({id:row.id}).post({aantal: row.aantal = e.target.aantal.value});
            }).append(
              $('div').append(
                $('div').append(
                  $('span').class('bruto small').text('€',aim.num(row.bruto)),
                  $('span').class('small').text('-'+aim.num(row.korting,0)+'%'),
                  $('span').class('netto').text('€',aim.num(row.bruto * (100-row.korting) / 100)),
                ),
                $('div').append(
                  $('span').class('incl small').text('€',aim.num(row.bruto * (100-row.korting) / 100 * 1.21), 'incl. btw'),
                ),
              ),
              $('button').text('-').value(-1).on('click', e => {
                e.target.form.aantal.value = Math.max(0,Number(e.target.form.aantal.value||0) + Number(e.target.value));
                $(e.target.form).emit('submit');
              }),
              $('input').name('aantal').type('number').min(0).value(row.aantal).on('keyup', e => $(e.target.form).emit('submit')),
              $('button').text('+').value(1).on('click', e => {
                e.target.form.aantal.value = Math.max(0,Number(e.target.form.aantal.value||0) + Number(e.target.value));
                $(e.target.form).emit('submit');
              }),
              // $('span').class('inknetto').text(aim.num(row.inkNetto)),
            ),
          )
        }
        function rowslist(rows) {
          return $('div').class('list').append(
            rows.map(rowdiv)
          );
        }
        (function list(){
          elem.text('').append(
            $('nav').append(
              $('div').class('title').text('Bestellijst'),
              $('a').class('icn-back').caption('Terug').on('click', e => elem.remove()),
              $('a').class('icn-verder').style('margin-left:auto;').text('Bestellen').on('click', e => {
                const elemBestel = $('div').parent(parent).class('bestellijst').append(
                  $('nav').append(
                    $('div').class('title').text('Bestellen'),
                    $('a').class('icn-back').caption('Terug').on('click', e => elemBestel.remove()),
                    // $('a').class('icn-verder').style('margin-left:auto;').text('Verzenden').on('click', async e => {
                    //   const res = await api('/abis/bestel_verzend'+document.location.search).post('form.order');
                    //   console.log(res);
                    //   // elemBestel.remove();
                    //   // elem.remove();
                    //   // alert('Verzonden');
                    // }),
                  ),
                  rowslist(rows.filter(row => Number(row.aantal))),
                  $('form').class('order').append(
                    $('div').text('Opdracht'),
                    $('input').name('opdrachtDatum').type('date').value(new Date().toISOString().substr(0,10)),
                    $('div').text('Verzenden op'),
                    $('input').name('planDatum').type('date').value(new Date().toISOString().substr(0,10)),

                    $('div').text('Ref'),
                    $('input').name('uwRef').placeholder('Klant PO nummer / referentie'),
                    $('div').text('Opmerking'),
                    $('input').name('opmerking').placeholder('Opmerking intern'),
                    $('div').text('Transport'),
                    $('select').name('routeNr').append(
                      [
                        'Niet ingevuld',
                        'Post',
                        'Visser',
                        'Route',
                        'Afgehaald',
                        'Vertegenwoordiger',
                      ].map((n,i)=>$('option').text(n).value(i)),
                    ),
                    $('div').text('Bestelwijze'),
                    $('select').name('volgNr').append(
                      [
                        'Niet ingevuld',
                        'Telefonisch',
                        'Whatsapp',
                        'Email order',
                        'Email',
                        'Balieverkoop',
                        'Vertegenwoordiger',
                      ].map((n,i)=>$('option').text(n).value(i)),
                    ),
                    // $('div').text('Gebruiker'),
                    // $('input').name('gebruiker').placeholder('Gebruiker'),
                  ),
                  $('nav').append(
                    $('button').class('icn-verder').style('margin-left:auto;').text('Verzenden').on('click', async e => {
                      const res = await api('/abis/bestel_verzend'+document.location.search).post('form.order');
                      console.log(res);
                      // elemBestel.remove();
                      // elem.remove();
                      // alert('Verzonden');
                    })
                  )
                );
                // alert('Uw bestelling is verzonden');
              }),
            ),
            $('div').class('search').append(
              $('input').placeholder('Typ hier om te zoeken').value(search).on('keyup', e => {
                $('.bestellijst>.list').text('').append(
                  rows
                  .filter(row => e.target.value.split(' ').every(w => row.titel.match(new RegExp(w,'i'))))
                  .map(rowdiv),
                )
              }),
            ),
            rowslist(rows),
          );
          window.scrollTo(0,0);
        })();
      })();
    },
    producten() {
      // searchfunction = arguments.callee;
      // list('Producten');
      const elem = $('div').parent(document.body);
      (async function show(search){
        localStorage.setItem('searchProducten', search);
        const [rows] = await api('/app/producten').query({ search: search || '' }).get();
        // console.log(rows);
        elem.text('').append(
          $('nav').append(
            $('div').class('title').text('Producten'),
            $('a').class('icn-back').caption('Terug').on('click', e => elem.remove()),
          ),
          $('div').class('search').append(
            $('input').placeholder('Typ hier om te zoeken').value(search).on('change', e => show(e.target.value)),
          ),
          $('div').class('list').append(
            rows.map(row => $('div').append(
              $('div').append(row.Titel),
              $('form').class('row product').on('submit', async e => {
                e.preventDefault();
                const res = await api('/abis/klantartikel').query({id:row.id}).post({aantal: row.aantal = e.target.aantal.value});
              }).append(
                $('div').append(
                  $('div').append(
                    $('span').class('small').text('inkoop €',aim.num(row.inkNetto),'-'+aim.num(row.inkKorting,0)+'%'),
                    $('span').class('netto').text('€',aim.num(row.netto = row.Bruto)),
                  ),
                  $('div').append(
                    $('span').class('incl small').text('€',aim.num(row.netto * 1.21), 'incl. btw'),
                  ),
                ),
                // $('button').text('-').value(-1).on('click', e => {
                //   e.target.form.aantal.value = Math.max(0,Number(e.target.form.aantal.value||0) + Number(e.target.value));
                //   $(e.target.form).emit('submit');
                // }),
                // $('input').name('aantal').type('number').min(0).value(row.aantal).on('keyup', e => $(e.target.form).emit('submit')),
                // $('button').text('+').value(1).on('click', e => {
                //   e.target.form.aantal.value = Math.max(0,Number(e.target.form.aantal.value||0) + Number(e.target.value));
                //   $(e.target.form).emit('submit');
                // }),
                // $('span').class('inknetto').text(aim.num(row.inkNetto)),
              ),
              // $('div').class('row').append(
              //   `${row.Id.pad(5)} (-${aim.num(row.inkKorting)}% / € ${aim.num(row.inkNetto)})`,
              //   $('span').class('netto').text('€',aim.num(row.Bruto)),
              //   // $('span').class('inknetto').text(aim.num(row.inkNetto)),
              // ),
            ))
          )
        )
        window.scrollTo(0,0);
      })(localStorage.getItem('searchProducten'));
    },
    contacten() {
      // searchfunction = arguments.callee;
      // list('Relaties');
      const elem = $('div').parent(document.body);
      (async function show(search){
        localStorage.setItem('searchContacten', search);
        const [rows] = await api('/app/contacten').query({
          select: `organisatienaam,achternaam,roepnaam,voornamen,voorletters,tussenvoegsel,organisatieId,contactpersoonId`,
          order: `ISNULL(achternaam,'zzz'),organisatienaam`,
          search: search || '',
        }).get();
        // console.log(rows);
        elem.text('').append(
          $('nav').append(
            $('div').class('title').text('Menu'),
            $('a').class('icn-back').caption('Terug').on('click', e => elem.remove()),
          ),
          $('div').class('search').append(
            $('input').placeholder('Typ hier om te zoeken').value(search).on('change', e => show(e.target.value)),
          ),
          $('div').class('list').append(
            rows.map(row => $('div').append(
              // $('div').append(row.roepnaam||row.voornamen||row.voorletters, row.tussenvoegsel).append($('b').text(row.achternaam))),
              $('div').append(`${row.roepnaam||row.voorletters||row.voornamen||''} ${row.tussenvoegsel||''} <b>${row.achternaam||''}</b>`),
              $('div').class('organisatienaam').text(row.organisatienaam),
            ).on('click', e => {
              const scrollY = window.scrollY;
              abis.contact(row.organisatieId,row.contactpersoonId);
            }))
          ),
        );
        window.scrollTo(0,0);
      })(localStorage.getItem('searchContacten'));
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
})();
