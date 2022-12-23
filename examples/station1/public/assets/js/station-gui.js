Web.on('loaded', async function () {
  // window.localStorage.setItem('apiKey', 'e30.eyJjbGllbnRfaWQiOiIxN2I2NjY3ZC0zMDAxLTQ5NzYtOGQyNi00YWQyZTAwNmU4MGEiLCJhdWQiOiIxN2I2NjY3ZC0zMDAxLTQ5NzYtOGQyNi00YWQyZTAwNmU4MGEiLCJzdWIiOiIwNWE2Mjc1MS0yOTdmLTRjOGMtYTZlYS1jMTJiNWU1MDc4NWYiLCJpYXQiOjE2NTc3MjQ4MTYsImV4cCI6MTY1NzcyODQxNn0.barnVGYY_AAEmPUBCDzjFMccbFqDi7tp7ND/Netsq5I');
  // window.localStorage.setItem('apiKey', 'e30.eyJjbGllbnRfaWQiOiJjOWIwNWM4MC00ZDJiLTQ2YzEtYWJmYi0wNDY0ODU0ZGJkOWEiLCJzdWIiOiIwNWE2Mjc1MS0yOTdmLTRjOGMtYTZlYS1jMTJiNWU1MDc4NWYiLCJhdWQiOiIxN2I2NjY3ZC0zMDAxLTQ5NzYtOGQyNi00YWQyZTAwNmU4MGEiLCJpYXQiOjE2NTc3Mjc5MjYsImV4cCI6MTY1NzczMTUyNn0.B89wRb2sGkEIReGgpTsIavPw6AubMmDrAXDFIXTKWfE');
  const serviceRoot = document.location.host.match(/aliconnect\.nl$/) ? 'https://aliconnect.nl:444/v1' : document.location.origin + '/api';

  const apiKey = new URL(document.location).searchParams.get('access_token');

  // console.log(apiKey);

  const {sub,aud} = JSON.parse(atob(apiKey.split('.')[1]));
  const systems = {};
  const {Client,config} = Aim;
  // console.log(111,Client);
  // const {Client} = aim;
  // const client = Client.init({serviceRoot,apiKey});
  // const socketClient = Client.create({serviceRoot,getAccessToken});
  const socketClient = Client.create({serviceRoot});
  // const {socketClient} = this;
  await socketClient.connect();
  socketClient.send('REQUEST_DATA', {}, aud);
  // console.debug('Requesting data',socketClient);

  socketClient.on('message', (event) => {
    const {data,target} = event;
    const {attr,path,message_type,content,from} = data;
    switch(message_type){
      case 'DATA':{
        const {items,attributeTypes} = content;
        init(items,attributeTypes);
        break;
      }
      case 'change':{
        const {attr} = content;
        const {systemId,name,state,value} = attr;
        // console.log('change',attr);
        const system = systems[systemId];
        if (system) {
          const systemAttr = system.data[name];
          // console.log(attr);
          if (systemAttr.state !== state) {
            setItemTypeValue(system, systemAttr.state, -1);
            setItemTypeValue(system, state, 1);
          }
          const oldValue = systemAttr.value;
          Object.assign(systemAttr, attr);
          if (systemAttr.attributeType) {
            setItemTypeValue(system, systemAttr.attributeType, - Number(oldValue||0));
            setItemTypeValue(system, systemAttr.attributeType, Number(systemAttr.value||0));
          }
          attributeRowUpdate(systemAttr);
        }
        if (name === 'WATCHDOG_ACSM') {
          acsmStateElem.text(`ACSM Status: ${state}`);
        }
        break;
      }
    }
  })
  function setItemTypeValue(item, name, value) {
    if (name) {
      name = name.split('_').shift().toLowerCase();
      for (var {el} = item.liElem; el; el = el.parentElement.parentElement) {
        const div = Array.from(el.children).find(el => el.tagName==='DIV');
        if (!div) break;
        const divElem = div.elem;
        const oldValue = Number(divElem.attr(name)||0);
        value = Number(value||0);
        const nr = (oldValue + value) || null;
        divElem.attr(name, (Number(divElem.attr(name)||0) + Number(value||0)) || null);
        divElem.attr('nok', ['connecting','disconnect','error_read','error'].map(n => Number(divElem.attr(n))).reduce((s, v) => s + v,0) );
        divElem.attr('nrWarning', ['measurementerrorflag','prewarning'].map(n => Number(divElem.attr(n))).reduce((s, v) => s + v,0) );
        divElem.attr('nrNoFailure', ['locking','maintenance','security','noncriticalfailure'].map(n => Number(divElem.attr(n))).reduce((s, v) => s + v,0) );
        divElem.attr('nrFailure', ['failure','criticalfailure'].map(n => Number(divElem.attr(n))).reduce((s, v) => s + v,0) );
      }
    }
  }
  function attributeRowUpdate(attr, el) {
    attr.trElem = el || attr.trElem;
    if (attr.trElem) {
      const {value,attributeType,modifiedDT,system,name,title,displayValue} = attr;
      const {typical,tag} = system;
      return attr.trElem.text('').attr(attr).append(
        $('td').class("symbol Value").value(value || 0).attr((attributeType||'').split('_').shift().toLowerCase(), ''),
        $('td').class("modifiedDT").text(modifiedDT ? new Date(modifiedDT).toISOString().substr(0, 19).replace(/T/, ' ') : ""),
        //$('td').text(((attr.system=attr.system||{}).INSTANTIE || ((attr.system.typical||'') + (attr.system.tag||'')))),
        $('td').text([typical||'', tag||''].join("typical" in system ? ("tag" in system ? '-' : '') : '')),
        $('td').text(name),
        // $('td').text(attr.enum ? attr.enum[attr.value] : attr.value),
        $('td').text("value" in attr ? ("enum" in attr ? ("displayValue" in attr ? attr.enum[displayValue] : attr.enum[value]) : value) : '#'),
        $('td').text(title),
        $('td').text(attributeType),
      )
    }
  }
  function init(items,attributeTypes){
    let filterAttributes = [];
    let itemList = [];
    let attributeSort = 'modifiedDT';
    let attributeSortDir = 1;
    const attributes = [];
    const setfilter = {
      select(checked, arr) {
        for (var attributeName in attributeTypes) {
          if (arr.indexOf(attributeTypes[attributeName].filtertype) != -1) {
            attributeTypes[attributeName].checked = checked;
          }
        }
      },
      actueel(selectedItem) {
        hisButtonId = "actueel";
        $.listData = [];
        (getItemAttributes = function (item) {
          if (item.schema == 'Device') return;
          if (item.schema == 'Attribute') $.listData.push(item);
          if (item.children) item.children.forEach(getItemAttributes);
        })($.selectedItem = typeof selectedItem == 'object' ? selectedItem : $.selectedItem);
        writefilter();
      },
      history(filter) {
        $().url('/sql.json').query({
          weblog: 1,
          filter,
        }).get().then(e => {
          listAttributes(e.body[0]);
        })
      },
      alles(checked) {
        for (var attributeName in attributeTypes) attributeTypes[attributeName].checked = 1;
        alarm.setAttribute("checked", "");
        state.setAttribute("checked", "");
        measurement.setAttribute("checked", "");
      },
      alarm(checked) { setfilter.select(checked, ['alarm']); },
      state(checked) { setfilter.select(checked, ['state']); },
      measurement(checked) { setfilter.select(checked, ['measurement']); },
    };
    for (var attributeName in attributeTypes) {
      attributeTypes[attributeName].checked = 1;
    }

    function listAttributes(attributes) {
      filterAttributes = attributes || [];
      const filter = $('attr_filter').el;
      filterAttributes = filterAttributes.filter(attr => [
        filter.Alles.checked,
        attr.attributeType && filter.Alarmen.checked && attr.attributeType.match(/failure|locking|maintenance|security|prewarning/),
        attr.attributeType && filter.Statussen.checked && attr.attributeType.match(/running/),
        attr.attributeType && filter.Meetwaarden.checked && attr.attributeType.match(/measurement/),
      ].some(Boolean));
      const sortDir = (1-2*attributeSortDir);
      filterAttributes.sort((a,b) => - sortDir * String(a[attributeSort]||'').localeCompare(String(b[attributeSort]||'')));
      $('attrlist').text('').append(filterAttributes.map(attr => attributeRowUpdate(attr, $('tr'))))
    }
    function itemAttributes(item) {
      return attributes.filter(attr => attr.systemId === item.systemId);
    }
    function select (e) {
      const {target} = e;
      if (target.name) {
        Array.from(target.parentElement.children).filter(el => el.name == target.name).forEach(el => el.removeAttribute("checked"));
      }
      if (target.hasAttribute("checked")) {
        target.removeAttribute("checked");
      } else {
        target.setAttribute("checked", "");
      }
      setfilter[target.id](target.hasAttribute("checked"));
      // writefilter();
    }
    function attr(id, name, value) {
      ws.send(JSON.stringify({attr:[id, name, value]}));
    }

    $(document.body).append(
      $('nav').class('row head').append(
        $('div').style('width:400px;color:white;').append(
          $('div').class('logo'),
          $('div').id('elementTime').html('UTC time:'),
          acsmStateElem = $('div').id('acsmconnect').text('ACSM Status: StartUp'),
        ),
        $('div').class('aco row').id('index').style('flex-wrap:wrap;').append(
          $('ul').class('row').style('padding:0;margin:0;list-style:none;').append(
            $('li').append($('div').class('symbol row').attr('Running','').html('Running')),
            $('li').append($('div').class('symbol row').attr('CriticalFailure','').html('Failure')),
            $('li').append($('div').class('symbol row').attr('NonCriticalFailure','').html('No Critical<br />Failure')),
            $('li').append($('div').class('symbol row').attr('PreWarning','').html('Pre Warning')),
            $('li').append($('div').class('symbol row').attr('nok','X').html('Communication<br />Failure')),
          ),
        ),
        $('div').class('logo2'),
      ),
      $('div').class('row aco').append(
        $('div').class('col').style('border-right:solid 1px gray;height:100%;flex-basis:400px;').append(
          $('div').class('row top').html('Navigatie'),
          $('div').class('aco col').style('height:0px;').id('folders')
        ),
        $('div').class('col aco').append(
          $('form').id('attr_filter').class('row top').on('submit', e => e.preventDefault()).append(
            $('input').id('Actueel').checked(true).type('radio').name('filter'),$('label').for('Actueel').on('click', e => listAttributes(attributes.filter(a => a.value))),
            $('input').id('1 uur').type('radio').name('filter'),$('label').for('1 uur').on('click', e => setfilter.history("DATEDIFF(MINUTE, [modifiedDT], GETDATE())<=60")),
            $('input').id('4 uur').type('radio').name('filter'),$('label').for('4 uur').on('click', e => setfilter.history("DATEDIFF(MINUTE, [modifiedDT], GETDATE())<=240")),
            $('input').id('24 uur').type('radio').name('filter'),$('label').for('24 uur').on('click', e => setfilter.history("DATEDIFF(MINUTE, [modifiedDT], GETDATE())<=1440")),
            $('input').id('Filter').type('radio').name('filter'),$('label').for('Filter').on('click', e => {
              const form = e.target.form;
              if (form.startDate.value && form.endDate.value) {
                setfilter.history(`[modifiedDT]>='${form.startDate.value.replace(/T/,' ')}' AND [modifiedDT]<'${form.endDate.value.replace(/T/,' ')}'`);
              }
            }),

            $('span').text('van:'),
            $('input').name('startDate').type('datetime-local'),
            $('span').text('tot:'),
            $('input').name('endDate').type('datetime-local'),

            $('input').id('Alles').type('checkbox').name('selectie').on('change', e => listAttributes()),$('label').for('Alles').style('margin-left:auto;'),
            $('input').id('Alarmen').checked(true).type('checkbox').name('filter').on('change', e => listAttributes()),$('label').for('Alarmen'),
            $('input').id('Statussen').type('checkbox').name('filter').on('change', e => listAttributes()),$('label').for('Statussen'),
            $('input').id('Meetwaarden').type('checkbox').name('filter').on('change', e => listAttributes()),$('label').for('Meetwaarden'),
          ),
          $('div').class('aco col oa').style('height:0px;').append(
            $('table').append(
              $('thead').style('position:sticky;top:0;z-index:1;background:#eee;').append(
                trHead = $('tr').on('click', e => {
                  const el = $(e.target);
                  // console.log(el.attr('sort'));
                  if (el.attr('sort') === null) {
                    trHead.children.forEach(el => el.attr('sort', null));
                  }
                  attributeSort = el.name();
                  el.attr('sort', attributeSortDir = el.attr('sort') ^ 1);
                  listAttributes();
                }).append(
                  $('th').width('10'),
                  $('th').width('160').html('Datum tijd').name('modifiedDT'),
                  $('th').width('160').html('Folder').name('name'),
                  $('th').width('160').html('Naam').name('name'),
                  $('th').width('160').html('Tekst').name('value'),
                  $('th').html('Omschrijving').name('title'),
                  $('th').width('160').html('ACSM').name('attributeType'),
                ),
              ),
              $('tbody').id('attrlist')
            ),
          ),
        ),
        $('div').id('loadlog1')
      ),
    );
    const folders = $('ul').parent($('folders'));
    $('folders').unselect = function(){
      folderItems.forEach(el => el.removeAttribute('selected'));
    }

    // console.log(items);
    items.filter(item => item.systemId).forEach(item => {
      const {systemId,parent,typical,tag} = item;
      systems[systemId] = item;
      item.data = [];
      let folder = folders;
      ('STATION.'+parent).split('.').forEach(key => {
        let liElem;
        const elem = folder = folder[key] = folder[key] || ($('ul').parent(liElem = $('li').parent(folder).attr('open', 0).append(
          $('i').class('open').on('click', e => elem.parentElement.attr('open',elem.parentElement.attr('open') ^ 1)),
          $('div').class('symbol').on('click', e => {
            $('folders').unselect();
            elem.parentElement.attr('selected','');
            const elements = Array.from(elem.parentElement.el.getElementsByTagName('LI')).filter(e => e.item);
            const attributes = [].concat(...elements.map(el => el.item.data));
            // const attributes = [].concat(...elements.map(el => el.attributes));
            listAttributes(attributes);
          }).append(
            $('span').text(key),
          ),
        )));
        // liElem.divElem = divElem;
      })
      const liElem = item.liElem = $('li').parent(folder).append(
        $('i').class('ln'),
        divElem = $('div').class('symbol').append(
          $('span').text([typical,tag].filter(Boolean).join('-')).on('click', e => {
            $('folders').unselect();
            liElem.attr('selected','');
            const elements = Array.from(liElem.el.getElementsByTagName('LI'));
            listAttributes(itemAttributes(item).concat(...elements.map(el => itemAttributes(el.item))));
          }),
        ),
      );
      liElem.el.item = item;
      liElem.divElem = divElem;
    })
    const folderItems = Array.from($('folders').el.getElementsByTagName('LI'));
    items.forEach(function addItem(item) {
      items.push(item);
      (item.children||[]).filter(Boolean).forEach(addItem);
    });
    attributes.push(...items.filter(item => item.systemId && item.name));
    attributes.forEach(attribute => {
      const {systemId,name} = attribute;
      attribute.system = systems[systemId];
      systems[systemId].data.push(systems[systemId].data[name] = attribute);
      // (attribute.children||[]).forEach(c => console.log(c));
    });
    listAttributes(attributes);
    attributes.forEach(attribute => {
      const {system,state,attributeType,value} = attribute;
      setItemTypeValue(system, state, 1);
      if (attributeType) {
        setItemTypeValue(system, attributeType, value || null);
      }
    })
    setInterval(event => elementTime.innerText = 'UTC time: ' + new Date().toISOString().substr(0, 19).replace(/T/, ' '), 1000);
  }
});
