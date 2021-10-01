// Version 0.0.6
eol = '\n';
function validSchemaName(schemaName){
  if (!schemaName) throw 'invalid schemaname';
  // TODO: Location illegal schema name
  return String(schemaName)
  .replace(/^\d|\.|\s|-|\(|\)|,/g,'')
  .replace(/\bLocation\b/,'Loc')
}
(function(){
  const isModule = typeof module === "object" && typeof exports === "object";
  window = isModule ? global : window;
  document = window.document;
  console.msg = console.msg || console.info;
  today = new Date();
  dstart = 0;
  maxdate = 0;
  const meshitems = [];
  const AUTHORIZATION_URL = 'https://login.aliconnect.nl/api/oauth';
  const TAGNAMES = [
    'a',
    'abbr',
    'address',
    'area',
    'article',
    'aside',
    'audio',
    'b',
    'base',
    'bdi',
    'bdo',
    'blockquote',
    'body',
    'br',
    'button',
    'canvas',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'data',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'div',
    'dl',
    'dt',
    'em',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hgroup',
    'hr',
    'html',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'label',
    'legend',
    'li',
    'link',
    'main',
    'map',
    'mark',
    'menu',
    'meta',
    'meter',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'output',
    'p',
    'param',
    'picture',
    'pre',
    'progress',
    'q',
    'rp',
    'rt',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'slot',
    'small',
    'source',
    'span',
    'strong',
    'style',
    'sub',
    'summary',
    'sup',
    'table',
    'tbody',
    'td',
    'template',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'track',
    'u',
    'ul',
    'var',
    'video',
    'wbr',
  ];
	const zoneMappings = {
	  "Dateline Standard Time": "Etc/GMT+12",
	  "UTC-11": "Etc/GMT+11",
	  "Aleutian Standard Time": "America/Adak",
	  "Hawaiian Standard Time": "Pacific/Honolulu",
	  "Marquesas Standard Time": "Pacific/Marquesas",
	  "Alaskan Standard Time": "America/Anchorage",
	  "UTC-09": "Etc/GMT+9",
	  "Pacific Standard Time (Mexico)": "America/Tijuana",
	  "UTC-08": "Etc/GMT+8",
	  "Pacific Standard Time": "America/Los_Angeles",
	  "US Mountain Standard Time": "America/Phoenix",
	  "Mountain Standard Time (Mexico)": "America/Chihuahua",
	  "Mountain Standard Time": "America/Denver",
	  "Central America Standard Time": "America/Guatemala",
	  "Central Standard Time": "America/Chicago",
	  "Easter Island Standard Time": "Pacific/Easter",
	  "Central Standard Time (Mexico)": "America/Mexico_City",
	  "Canada Central Standard Time": "America/Regina",
	  "SA Pacific Standard Time": "America/Bogota",
	  "Eastern Standard Time (Mexico)": "America/Cancun",
	  "Eastern Standard Time": "America/New_York",
	  "Haiti Standard Time": "America/Port-au-Prince",
	  "Cuba Standard Time": "America/Havana",
	  "US Eastern Standard Time": "America/Indianapolis",
	  "Turks And Caicos Standard Time": "America/Grand_Turk",
	  "Paraguay Standard Time": "America/Asuncion",
	  "Atlantic Standard Time": "America/Halifax",
	  "Venezuela Standard Time": "America/Caracas",
	  "Central Brazilian Standard Time": "America/Cuiaba",
	  "SA Western Standard Time": "America/La_Paz",
	  "Pacific SA Standard Time": "America/Santiago",
	  "Newfoundland Standard Time": "America/St_Johns",
	  "Tocantins Standard Time": "America/Araguaina",
	  "E. South America Standard Time": "America/Sao_Paulo",
	  "SA Eastern Standard Time": "America/Cayenne",
	  "Argentina Standard Time": "America/Buenos_Aires",
	  "Greenland Standard Time": "America/Godthab",
	  "Montevideo Standard Time": "America/Montevideo",
	  "Magallanes Standard Time": "America/Punta_Arenas",
	  "Saint Pierre Standard Time": "America/Miquelon",
	  "Bahia Standard Time": "America/Bahia",
	  "UTC-02": "Etc/GMT+2",
	  "Azores Standard Time": "Atlantic/Azores",
	  "Cape Verde Standard Time": "Atlantic/Cape_Verde",
	  "UTC": "Etc/GMT",
	  "GMT Standard Time": "Europe/London",
	  "Greenwich Standard Time": "Atlantic/Reykjavik",
	  "Sao Tome Standard Time": "Africa/Sao_Tome",
	  "Morocco Standard Time": "Africa/Casablanca",
	  "W. Europe Standard Time": "Europe/Berlin",
	  "Central Europe Standard Time": "Europe/Budapest",
	  "Romance Standard Time": "Europe/Paris",
	  "Central European Standard Time": "Europe/Warsaw",
	  "W. Central Africa Standard Time": "Africa/Lagos",
	  "Jordan Standard Time": "Asia/Amman",
	  "GTB Standard Time": "Europe/Bucharest",
	  "Middle East Standard Time": "Asia/Beirut",
	  "Egypt Standard Time": "Africa/Cairo",
	  "E. Europe Standard Time": "Europe/Chisinau",
	  "Syria Standard Time": "Asia/Damascus",
	  "West Bank Standard Time": "Asia/Hebron",
	  "South Africa Standard Time": "Africa/Johannesburg",
	  "FLE Standard Time": "Europe/Kiev",
	  "Israel Standard Time": "Asia/Jerusalem",
	  "Kaliningrad Standard Time": "Europe/Kaliningrad",
	  "Sudan Standard Time": "Africa/Khartoum",
	  "Libya Standard Time": "Africa/Tripoli",
	  "Namibia Standard Time": "Africa/Windhoek",
	  "Arabic Standard Time": "Asia/Baghdad",
	  "Turkey Standard Time": "Europe/Istanbul",
	  "Arab Standard Time": "Asia/Riyadh",
	  "Belarus Standard Time": "Europe/Minsk",
	  "Russian Standard Time": "Europe/Moscow",
	  "E. Africa Standard Time": "Africa/Nairobi",
	  "Iran Standard Time": "Asia/Tehran",
	  "Arabian Standard Time": "Asia/Dubai",
	  "Astrakhan Standard Time": "Europe/Astrakhan",
	  "Azerbaijan Standard Time": "Asia/Baku",
	  "Russia Time Zone 3": "Europe/Samara",
	  "Mauritius Standard Time": "Indian/Mauritius",
	  "Saratov Standard Time": "Europe/Saratov",
	  "Georgian Standard Time": "Asia/Tbilisi",
	  "Volgograd Standard Time": "Europe/Volgograd",
	  "Caucasus Standard Time": "Asia/Yerevan",
	  "Afghanistan Standard Time": "Asia/Kabul",
	  "West Asia Standard Time": "Asia/Tashkent",
	  "Ekaterinburg Standard Time": "Asia/Yekaterinburg",
	  "Pakistan Standard Time": "Asia/Karachi",
	  "Qyzylorda Standard Time": "Asia/Qyzylorda",
	  "India Standard Time": "Asia/Calcutta",
	  "Sri Lanka Standard Time": "Asia/Colombo",
	  "Nepal Standard Time": "Asia/Katmandu",
	  "Central Asia Standard Time": "Asia/Almaty",
	  "Bangladesh Standard Time": "Asia/Dhaka",
	  "Omsk Standard Time": "Asia/Omsk",
	  "Myanmar Standard Time": "Asia/Rangoon",
	  "SE Asia Standard Time": "Asia/Bangkok",
	  "Altai Standard Time": "Asia/Barnaul",
	  "W. Mongolia Standard Time": "Asia/Hovd",
	  "North Asia Standard Time": "Asia/Krasnoyarsk",
	  "N. Central Asia Standard Time": "Asia/Novosibirsk",
	  "Tomsk Standard Time": "Asia/Tomsk",
	  "China Standard Time": "Asia/Shanghai",
	  "North Asia East Standard Time": "Asia/Irkutsk",
	  "Singapore Standard Time": "Asia/Singapore",
	  "W. Australia Standard Time": "Australia/Perth",
	  "Taipei Standard Time": "Asia/Taipei",
	  "Ulaanbaatar Standard Time": "Asia/Ulaanbaatar",
	  "Aus Central W. Standard Time": "Australia/Eucla",
	  "Transbaikal Standard Time": "Asia/Chita",
	  "Tokyo Standard Time": "Asia/Tokyo",
	  "North Korea Standard Time": "Asia/Pyongyang",
	  "Korea Standard Time": "Asia/Seoul",
	  "Yakutsk Standard Time": "Asia/Yakutsk",
	  "Cen. Australia Standard Time": "Australia/Adelaide",
	  "AUS Central Standard Time": "Australia/Darwin",
	  "E. Australia Standard Time": "Australia/Brisbane",
	  "AUS Eastern Standard Time": "Australia/Sydney",
	  "West Pacific Standard Time": "Pacific/Port_Moresby",
	  "Tasmania Standard Time": "Australia/Hobart",
	  "Vladivostok Standard Time": "Asia/Vladivostok",
	  "Lord Howe Standard Time": "Australia/Lord_Howe",
	  "Bougainville Standard Time": "Pacific/Bougainville",
	  "Russia Time Zone 10": "Asia/Srednekolymsk",
	  "Magadan Standard Time": "Asia/Magadan",
	  "Norfolk Standard Time": "Pacific/Norfolk",
	  "Sakhalin Standard Time": "Asia/Sakhalin",
	  "Central Pacific Standard Time": "Pacific/Guadalcanal",
	  "Russia Time Zone 11": "Asia/Kamchatka",
	  "New Zealand Standard Time": "Pacific/Auckland",
	  "UTC+12": "Etc/GMT-12",
	  "Fiji Standard Time": "Pacific/Fiji",
	  "Chatham Islands Standard Time": "Pacific/Chatham",
	  "UTC+13": "Etc/GMT-13",
	  "Tonga Standard Time": "Pacific/Tongatapu",
	  "Samoa Standard Time": "Pacific/Apia",
	  "Line Islands Standard Time": "Pacific/Kiritimati"
	};
  const dmsOrigin = 'https://aliconnect.nl';
  const dmsUrl = dmsOrigin + '/dms/v1.0/api';
  const pageHtml = `<!DOCTYPE HTML><html><head><link href="${dmsUrl}/css/web_debug.css" rel="stylesheet"/><script src="${dmsUrl}/js/aim_debug.js" libraries="web"></script></head><body></body></html>`;

  minimist = function (args, opts){
    if (!opts) opts = {};
    var flags = { bools: {}, strings: {}, unknownFn: null };
    if (typeof opts['unknown'] === 'function'){
      flags.unknownFn = opts['unknown'];
    }
    if (typeof opts['boolean'] === 'boolean' && opts['boolean']){
      flags.allBools = true;
    } else {
      [].concat(opts['boolean']).filter(Boolean).forEach(function (key){
        flags.bools[key] = true;
      });
    }
    var aliases = {};
    Object.keys(opts.alias || {}).forEach(function (key){
      aliases[key] = [].concat(opts.alias[key]);
      aliases[key].forEach(function (x){
        aliases[x] = [key].concat(aliases[key].filter(function (y){
          return x !== y;
        }));
      });
    });
    [].concat(opts.string).filter(Boolean).forEach(function (key){
      flags.strings[key] = true;
      if (aliases[key]){
        flags.strings[aliases[key]] = true;
      }
    });
    var defaults = opts['default'] || {};
    // var argv = { _: [] };
    var argv = { };
    // var argv = {};//{ _: [] };
    Object.keys(flags.bools).forEach(function (key){
      setArg(key, defaults[key] === undefined ? false : defaults[key]);
    });
    var notFlags = [];
    if (args.indexOf('--') !== -1){
      notFlags = args.slice(args.indexOf('--') + 1);
      args = args.slice(0, args.indexOf('--'));
    }
    function argDefined(key, arg){
      return (flags.allBools && /^--[^=]+$/.test(arg)) ||
      flags.strings[key] || flags.bools[key] || aliases[key];
    }
    function setArg(key, val, arg){
      if (arg && flags.unknownFn && !argDefined(key, arg)){
        if (flags.unknownFn(arg) === false) return;
      }
      var value = !flags.strings[key] && !isNaN(val)
      ? Number(val) : val
      ;
      setKey(argv, key.split('-'), value);
      (aliases[key] || []).forEach(function (x){
        setKey(argv, x.split('-'), value);
      });
    }
    function setKey(obj, keys, value){
      var o = obj;
      keys.slice(0, -1).forEach(function (key){
        if (o[key] === undefined) o[key] = {};
        o = o[key];
      });
      var key = keys[keys.length - 1];
      if (o[key] === undefined || flags.bools[key] || typeof o[key] === 'boolean'){
        o[key] = value;
      }
      else if (Array.isArray(o[key])){ o[key].push(value); }
      else {
        o[key] = [o[key], value];
      }
    }
    function aliasIsBoolean(key){
      return aliases[key].some(function (x){
        return flags.bools[x];
      });
    }
    for (var i = 0; i < args.length; i++){
      var arg = args[i];
      if (/^--.+=/.test(arg)){
        // Using [\s\S] instead of . because js doesn't support the
        // 'dotall' regex modifier. See:
        // http://stackoverflow.com/a/1068308/13216
        var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
        var key = m[1];
        var value = m[2];
        if (flags.bools[key]){
          value = value !== 'false';
        }
        setArg(key, value, arg);
      }
      else if (/^--no-.+/.test(arg)){
        var key = arg.match(/^--no-(.+)/)[1];
        setArg(key, false, arg);
      }
      else if (/^--.+/.test(arg)){
        var key = arg.match(/^--(.+)/)[1];
        var next = args[i + 1];
        if (next !== undefined && !/^-/.test(next)
        && !flags.bools[key]
        && !flags.allBools
        && (aliases[key] ? !aliasIsBoolean(key) : true)){
          setArg(key, next, arg);
          i++;
        }
        else if (/^(true|false)$/.test(next)){
          setArg(key, next === 'true', arg);
          i++;
        }
        else {
          setArg(key, flags.strings[key] ? '' : true, arg);
        }
      }
      else if (/^-[^-]+/.test(arg)){
        var letters = arg.slice(1, -1).split('');
        var broken = false;
        for (var j = 0; j < letters.length; j++){
          var next = arg.slice(j + 2);
          if (next === '-'){
            setArg(letters[j], next, arg);
            continue;
          }
          if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)){
            setArg(letters[j], next.split('=')[1], arg);
            broken = true;
            break;
          }
          if (/[A-Za-z]/.test(letters[j])
          && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)){
            setArg(letters[j], next, arg);
            broken = true;
            break;
          }
          if (letters[j + 1] && letters[j + 1].match(/\W/)){
            setArg(letters[j], arg.slice(j + 2), arg);
            broken = true;
            break;
          }
          else {
            setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
          }
        }
        var key = arg.slice(-1)[0];
        if (!broken && key !== '-'){
          if (args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1])
          && !flags.bools[key]
          && (aliases[key] ? !aliasIsBoolean(key) : true)){
            setArg(key, args[i + 1], arg);
            i++;
          }
          else if (args[i + 1] && /true|false/.test(args[i + 1])){
            setArg(key, args[i + 1] === 'true', arg);
            i++;
          }
          else {
            setArg(key, flags.strings[key] ? '' : true, arg);
          }
        }
      }
      else {
        if (!flags.unknownFn || flags.unknownFn(arg) !== false){
          // argv._.push(
          // 	flags.strings['_'] || isNaN(arg) ? arg : Number(arg)
          // );
        }
        if (opts.stopEarly){
          argv._.push.apply(argv._, args.slice(i + 1));
          break;
        }
      }
    }
    Object.keys(defaults).forEach(function (key){
      if (!hasKey(argv, key.split('.'))){
        setKey(argv, key.split('.'), defaults[key]);
        (aliases[key] || []).forEach(function (x){
          setKey(argv, x.split('.'), defaults[key]);
        });
      }
    });
    if (opts['--']){
      argv['--'] = new Array();
      notFlags.forEach(function (key){
        argv['--'].push(key);
      });
    }
    else {
      notFlags.forEach(function (key){
        argv._.push(key);
      });
    }
    return argv;
  };
  function createParam (param, splitter){
    var result = {};
    if (param) param.split(splitter || '&').forEach(function (val){
      var val = val.split('='), name = val.shift(), val = val.shift();
      result[name] = val ? decodeURIComponent(val) : val;
    });
    return result;
  };
  function dateText(date){
    const dateTime = new Date(date);
    dateTime.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    const days = Math.round((dateTime.valueOf() - now.valueOf())/1000/60/60/24);
    if (days<-730) return '2 years ago';
    if (days<-365) return '1 year ago';
    if (days<-60) return '2 months ago';
    if (days<-30) return '1 month ago';
    if (days<-14) return '2 weeks ago';
    if (days<-7) return '1 weeks ago';
    if (days<-2) return 'last week';
    if (days<-1) return 'yesterday';
    if (days<0) return 'today';
    if (days>730) return 'after 2 years';
    if (days>365) return 'after 1 year';
    if (days>60) return 'after 2 months';
    if (days>30) return 'after 1 month';
    if (days>14) return 'over 2 weeks';
    if (days>7) return 'next week';
    if (days>1) return 'day after tomorrow';
    if (days>0) return 'tomorrow';
  }
  function setPrototype(fn, prototype, properties){
    Object.assign(fn.prototype, prototype);
    for (let [name, property] of Object.entries(properties)){
      Object.defineProperty(fn.prototype, name, property);
    }
  }
  function uploadState(e){
    $.url('https://login.aliconnect.nl/api')
    .path('/oauth')
    .query({
      response_type: 'socket_id',
      state: e.type,
      socket_id: $.WebsocketClient.socket_id,
      id_token: $.his.cookie.id_token,
      // origin: document.location.href,
    })
    .get();
  };
  function aDate(d) {
    if (!d) return new Date();
    var resdate = new Date(d);
    //// //console.debug('new date 1', d, resdate.toLocaleString());
    if (d.length === 10) resdate.setTime(resdate.getTime() + resdate.getTimezoneOffset() * 60 * 1000);
    //// //console.debug('new date 2', d, resdate.toLocaleString());
    //// //console.debug(['new date 2', d, res.toDateTimeStr(), res.toLocaleString(), res.toGMTString(), res.toISOString(), res.toLocal(), res.getTimezoneOffset()].join(';'));
    return resdate;
  }
  function authSubmit(e) {
    $()
    .url(AUTHORIZATION_URL + document.location.search)
    .post(e.target)
    .then(checkResponse);
    return false;
  }
  function dateTime0 (date, days) {
    date = new Date(date);
    date.setHours(0,0,0,0);
    if (days) {
      date.setDate(date.getDate() + days);
    }
    return date;
  }
  function eventKeyState (e) {
    return e ? (e.shiftKey && e.ctrlKey ? 'link' : (e.shiftKey ? 'move' : (e.ctrlKey ? 'copy' : 'default'))) : 'default';
  }
  function focusSection(e, offset) {
    if (e.clickEvent && document.activeElement === document.body) {
      const currentSection = e.clickEvent.path.find(elem => elem.tagName === 'SECTION');
      const children = [...document.body.getElementsByTagName('SECTION')];
      const index = children.indexOf(currentSection);
      const nextSection = children[index + offset];
      if (nextSection) {
        nextSection.click();
      }
      e.preventDefault();
    }
  }
  function importXlsFile(file) {
    // new $.HttpRequest($.config.$, '/')
    const basePath = document.location.pathname.split(/\/(api|docs|om)/)[0];
    const sub = $.access.sub;
    const path = `/${sub}/config.json`;
    const config = {app:{nav:{items:{List:{items:{}}}}}};
    // //console.error(importXlsFile);
    // //console.error('IMPORT XLS', XLSX, file.name);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = e => {
      //console.error(XLSX, jszip);
      const components = config.components = config.components || {};
      const schemas = components.schemas = components.schemas || {};
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      function importSheet(sheetname) {
        const wbsheet = workbook.Sheets[sheetname];
        const schema = schemas[sheetname] = schemas[sheetname] || {};
        const properties = schema.properties = schema.properties || {};
        // const $.his = wbsheet['!$.his'].split(':').pop();
        const [start,end] = wbsheet['!ref'].split(':');
        const [end_colstr] = end.match(/[A-Z]+/);
        const col_index = XLSX.utils.decode_col(end_colstr);
        const types = {
          s: 'string',
        };
        for (var c=0;c<=col_index;c++) {
          var cellstr = XLSX.utils.encode_cell({c:c,r:0});
          var cell = wbsheet[cellstr];
          if (!cell || !cell.v) {
            break;
          }
          properties[cell.v] = properties[cell.v] || { type: types[cell.t] || 'string' }
          // //console.log(cellstr, cell);
        }
        // var irows = Number($.his.match(/\d+/g));
        // //console.log(sheetname, wbsheet, ref, irows);
      }
      for (let sheetname in workbook.Sheets) {
        importSheet(sheetname);
        config.app.nav.items.List.items[sheetname] = {
          title: sheetname,
          href: '#/' + sheetname,
        }
      }
      //console.log(config);
      // $().url($.config.$).post('/').input(config).res(e => {
      // 	//console.log(e.target.responseText);
      // 	// $.SampleWindow('/om/?prompt=config_edit');
      // }).send();
      new $.HttpRequest($.config.$, 'post', '/').query({append: true}).input(config).send().onload = e => {
        //console.log(e.target.responseText);
      };
    }
  }
  function getIanaFromWindows(windowsZoneName) {
    return zoneMappings[windowsZoneName] || "Etc/GMT";
  }
  function _gotDevices(mediaDevices) {
    select.innerHTML = '';
    select.appendChild(document.createElement('option'));
    let count = 1;
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        const option = document.createElement('option');
        option.value = mediaDevice.deviceId;
        const label = mediaDevice.label || `Camera ${count++}`;
        const textNode = document.createTextNode(label);
        option.appendChild(textNode);
        select.appendChild(option);
      }
    });
  }
  function handleData(targetItem, e) {
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
            // return;
            // data.value.forEach(item => targetItem.append($(item.tag)));
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
              //console.log(item, $().tree());
              $().tree().setFocusElement(item.elemTreeLi.elem);
              item.edit();
            })();
          }
        }
        // TODO: files cut copy uitwerken
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
        // //console.debug('HTML', html);
        // importeer html img if pasted
        var tmpStr = data.match("<!--StartFragment-->(.*)<!--EndFragment-->");
        var fragment = tmpStr[1];
        // //console.debug('FRAGMENT', fragment);
        if (fragment.substr(0, 3) == '<a>') {
          console.debug('REF', fragment);
        }
        else if (fragment.substr(0, 5) == '<img ') {
          console.debug('IMG', fragment);
        }
        //return;
      } else if (data = eventData.getData("text")) {
        if (data.substr(0, 4) == 'http') {
          //console.debug('URL', data);
        }
      }
    }
    $.clipboard.dragItems = [];
  }
  function pageClose() {
    colpage.innerText = '';
    $.his.replaceUrl(document.location.href.replace(/\/id\/([^\?]*)/, ''));
  }
  function stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  function swipedetect(el, callback) {
    var touchsurface = el,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 150, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 300, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function(swipedir) { };
    touchsurface.addEventListener('touchstart', function(e) {
      var touchobj = e.changedTouches[0],
      swipedir = 'none',
      dist = 0,
      startX = touchobj.pageX,
      startY = touchobj.pageY,
      startTime = new Date().getTime(); // record time when finger first makes contact with surface
      e.preventDefault();
    }, false);
    touchsurface.addEventListener('touchmove', function(e) {
      e.preventDefault(); // pre scrolling when inside DIV
    }, false);
    touchsurface.addEventListener('touchend', function(e) {
      var touchobj = e.changedTouches[0],
      distX = touchobj.pageX - startX, // get horizontal dist traveled by finger while in contact with surface
      distY = touchobj.pageY - startY, // get vertical dist traveled by finger while in contact with surface
      elapsedTime = new Date().getTime() - startTime; // get time elapsed
      if (elapsedTime <= allowedTime) { // first condition for awipe met
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) { // 2nd condition for horizontal swipe met
          swipedir = (distX < 0) ? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
        }
        else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) { // 2nd condition for vertical swipe met
          swipedir = (distY < 0) ? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
        }
      }
      handleswipe(swipedir);
      e.preventDefault();
    }, false);
  }
  function getId(id){
    return Number(id.split('-').shift());
  }
  function getUid(id){
    return id.replace(/^\d+-/,'')
  }
  function replaceOutsideQuotes(codeString, callback, pre = '<span class=hl-string>', post = '</span>') {
    // const a = codeString.split(/((?<![\\])['"`])((?:.(?!(?<![\\])\1))*.?)\1/);
    const a = codeString.split(/(['"`])\1/);
    return a.map((s,i) => i%3===0 ? (callback ? callback(s) : s) : i%3===2 ? `${a[i-1]}${pre}${s}${post}${a[i-1]}` : '').join('');
  }

  Object.assign(Array.prototype, {
    unique() {
      return this.filter((e,i,arr) => arr.indexOf(e) === i)
    },
    // delete(selector){
    //   return this.splice(this.indexOf(selector), 1);
    // },
  });
  Object.assign(Date.prototype, {
    adddays(i){
      var day = new Date(this);
      day.setDate(this.getDate() + i);
      return day;
    },
    getWeek(){
      var d = new Date(+this);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
    },
    getWeekday(){
      return (this.getDay() + 6) % 7;
    },
    monthDays(){
      var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
      return d.getDate();
    },
    toDateText(full){
      // return this.toDateString();
      let res = '';
      if (this){
        const now = new Date();
        let dagen = Math.ceil((this.getTime() - now.getTime()) / 24 / 60 / 60 / 1000);
        let dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saterday', 'Sunday'];
        let monthNames = ['Januari', 'Februari', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'];
        const time = this.toLocaleTimeString();
        return [
          __(dagen===0 ? 'Today' : dagen === -1 ? 'Yesterday' : dayNames[this.getDay()-1]),
          this.getDate(),
          __(monthNames[this.getMonth()-1]),
          this.getFullYear(),
          time === '00:00:00' ? '' : time.substr(0,5),
          __('week'),
          this.getWeek(),
        ].filter(Boolean).join(' ');
        // res += '-'+this.toISOString();
        //var t = this.toLocaleTimeString().substr(0, 5);
        //if (t != '00:00') res += ' ' + t;
      }
      return res;
    },
    toDateTimeText(full){
      var res = this.toDateText();
      if (this.getHours() || this.getMinutes()) res += this.toLocaleTimeString().substr(0, 5);
    },
    toDateTimeStr(length){
      //    return this.getDate().pad(2) + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getFullYear() + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + '.' + this.getMilliseconds().pad(3);
      var s = this.getFullYear() + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getDate().pad(2);
      if (this.getHours() != 0 && this.getMinutes() != 0 && this.getSeconds() != 0)
      s += ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2); + '.' + this.getMilliseconds().pad(3);
      return s.substring(0, length);
    },
    toDateTimeStringT(){
      //    return this.getDate().pad(2) + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getFullYear() + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + '.' + this.getMilliseconds().pad(3);
      return this.getFullYear() + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getDate().pad(2) + 'T' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + '.' + this.getMilliseconds().pad(3);
    },
    toDateTimeString(){
      //    return this.getDate().pad(2) + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getFullYear() + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + '.' + this.getMilliseconds().pad(3);
      return this.getFullYear() + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getDate().pad(2) + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + '.' + this.getMilliseconds().pad(3);
    },
    toLocal(){
      this.setTime(this.getTime() - this.getTimezoneOffset() * 60 * 1000);
      return this;
    },
    toLocalDBString(){
      this.setTime(this.getTime() - this.getTimezoneOffset() * 60 * 1000);
      return this.toISOString().replace(/T|Z/g, ' ');
    },
    toShortStr(){
      return this.getDate().pad(2) + '-' + (this.getMonth() + 1).pad(2) + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2);
    },
    toWeekDay(){
      return this.getFullYear() + '-' + this.getWeek() + ' ' + day[this.getDay()];
    },
  });
  Object.assign(Number.prototype, {
    formatMoney(c, d, t){
      var n = this,
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? ', ' : d,
      t = t == undefined ? '.' : t,
      s = n < 0 ? '-' : '',
      i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '',
      j = (j = i.length) > 3 ? j % 3 : 0;
      return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
    },
    pad(size){
      var s = String(this);
      while (s.length < (size || 2)){
        s = '0' + s;
      }
      return s;
    },
  });
  Object.assign(String.prototype, {
    capitalize(){
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    stripTags() {
      return this.replace(/(<([^>]+)>)/gi, "");
    },
  });
  Object.assign(JSON, {
    stringifyReplacer (data, space) {
      const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
          if (typeof value === "object" && value !== null){
            if (seen.has(value)){
              return;
            }
            seen.add(value);
          }
          return value;
        };
      };
      return JSON.stringify(data, getCircularReplacer(), space);
    },
  });
  Object.assign(Object, {

  });
  YAML = {
    stringify(selector) {
      return JSON.stringify(selector, null, 2)
      .replace(/^\{|^  /gm, '')
      .replace(/,\n/gs, '\n')
      .replace(
        /\[(.*?)\]/gs, (s, p1) => p1
        .replace(/^(.*?)"(.*?)": "(.*?)"$/gm, '$1$2: $3')
        .replace(/^(.*?)"(.*?)":/gm, '$1$2:')
        .replace(/(.*?)\{(.*?)(\w+)/gs, '$1- $3')
        .replace(/^(.*?)"(.*?)"$/gm, '$1- "$2"')
      )
      .replace(/(\},|\}|\{|\])(?=\n|$)/gs, '')
      .replace(/"(.*?)":/g, '$1:')
      .replace(/: "(.+?)"/g, ': $1')
      .replace(/- "(.+?)"/g, '- $1')
      .replace(/^\s*\n/gms, '')
    },
  };

  __ = function(){
    const translate = $.his.translate || new Map();
    // console.debug(arguments, translate);
    // return '';
    return [].concat(...arguments).map(text => {
      // console.log([text, translate[text]]);
      if (translate.has(text)) return translate.get(text);
      text = String(text||'').replace(/^\w/,v => v.toUpperCase()).replace(/([a-z])([A-Z])/g, (v,p1,p2) => p1+' '+p2.toLowerCase()).replace(/_/g, ' ');
      return text && translate.has(text) ? translate.get(text) : (text || '');
    }).join(' ');
  };
  Crypto = {
    base64_encode: function (obj){
      return this.btoajson(JSON.stringify(obj));
    },
    jwt_signature: function (base64_header, base64_payload, secret){
      var message = [base64_header, base64_payload].join('.');
      var signature = this.btoaToJson(CryptoJS.HmacSHA256(message, secret).toString(CryptoJS.enc.Base64));
      //var signature = this.btoaToJson(crypto.createHmac('sha256', secret).update(message).digest('base64'));//.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
      // console.debug("signature", base64_header, base64_payload, secret, signature);
      return signature;
    },
    jwt_encode: function (payload, secret){
      var base64_header = this.base64_encode({ typ: "JWT", alg: "sha256" });
      var base64_payload = this.base64_encode(payload);
      return [base64_header, base64_payload, this.jwt_signature(base64_header, base64_payload, secret)].join('.');
    },
    btoajson: function (s){
      return this.btoaToJson(btoa(s));
    },
    btoaToJson: function (s){
      return s.replace(
        /\+/g,
        '-'
      ).replace(
        /\=/g,
        ''
      ).replace(
        /\//g,
        "_"
      );
    },
    decodeId: function (Id){
      if (!Id) return {};
      var a = Id.split('.');
      return JSON.parse(atob(a[1] || a[0]));
    },
  };
  function Request(url, base){
    this.url(url, base);
  }
  Request.prototype = {
    body(){
      this.returnBody = true;
      return this;
    },
    delete(){
      this.method = 'delete';
      return this.http();
    },
    accept(selector){
      return this.headers('Accept', selector);
    },
    exec(){
      for ([key, value] of this.URL.searchParams) {
        // console.log(key, value);
        if (typeof $[key] === 'function'){
          // $.his.replaceUrl(new $().url().query(req.query).toString());
          // console.error('EXEC', key, value);
          return $[key].apply($, value ? value.split(', ') : []) || true;
        }
      };
      console.error('EXEC', this.URL.pathname);
      // return;
      const getPathname = path => {
        var [dummy, basePath, folder, sep, id] = path.match(/(.*?\/om|\/api|^)(\/.*?)(\/id\/|$)(.*)/);
        return [basePath, folder, sep, id];
      };
      var basePath, path, sep, id, newPath = [basePath, path, sep, id] = getPathname(this.URL.pathname);
      if (path && path !== '/') {
        var [root, tag, propertyName, attr] = path.match(/.*?\/(\w+\(\d+\))\/([\w_]+?)\((\.*?)\)/)||[];
        // console.log(tag, $.his.map.has(tag));
        const item = $.his.map.get(tag)||{};
        if (item[propertyName]) {
          return item[propertyName].apply(item, attr.split(','));
        }
        if ($().paths) {
          const paths = $().paths;
          // console.debug('this.paths2', [basePath, path, sep, id]);
          let replaceLocation = false;
          if (id) {
            replaceLocation = true;
            try {
              [id] = atob($.id = id.replace(/(\/.*)/, '')).match(/\/\w+\(.+?\)/);
              // console.error($(id));
              // dms.api(id).get().then(e => $('view').show(e.body));
              $(id).details().then(item => $('view').show(item));
            } catch (err){
              return console.error('Illegal requestPath.id', id, paths);
            }
          }
          const method = this.method || 'get';
          const folderTag = path.replace(/\(.*?\)/g,'()');
          let pathKey = Object.keys(paths).find(key => key.replace(/\(.*?\)/g,'()') === folderTag);
          let apiPath = paths[pathKey];
          if (apiPath && apiPath.get){
            replaceLocation = true;
            $().list([], path);
            if (this.URL.searchParams.has('$search') && !this.URL.searchParams.get('$search')){
              console.error('NO SEARCH');
              // return;
            }
            aimClient.api(path).query(this.URL.searchParams.toString())
            .get().then(async body => {
              if (body){
                const items = body.value || await body.children;
                $().list(items);
              }
            });
          }
          if (replaceLocation && typeof document !== 'undefined'){
            if (document.location.protocol === 'file:'){
              var currentPath = getPathname(document.location.hash.substr(1));
              [basePath, path, sep, id] = currentPath.map((value,i) => newPath[i] || value);
              var replacePath = ['#', path, sep, id];
            } else {
              var currentPath = getPathname(document.location.pathname);
              var replacePath = currentPath.map((value,i) => newPath[i] || value);
            }
            const search = this.URL.searchParams.toString();
            var replacePath = replacePath.join('') + (search ? '?' + search : '');
            // console.debug(
            // 	currentPath.join(''),
            // 	replacePath,
            // );
            $.his.replaceUrl( replacePath);
          }
        }
        if (this.paths_){
          // console.debug(req.path, pathKey);
          var args = [];
          let pathKey = path.replace(/\((.+?)\)/g, '()');
          pathKey = Object.keys($.paths).find(key => key.replace(/\(([^\)]+)\)/g,'()') === pathKey);
          if (pathKey){
            const def = $.paths[pathKey][req.method.toLowerCase()] || $.paths[pathKey][req.method.toUpperCase()];
            console.error('pathKey', pathKey, def);
            if (!def){
              return console.error(req.method.toUpperCase(), req.toString(), 'Method not allowed');
            }
            if (req.search){
              req.search.forEach((value, key) => req.path = req.path.replace(key, value));
            }
            var args = path.match(/\(([^\)]+)\)/g);
            for (var i=0, arr = def.operationId.split(/\/|\./), name, obj; name = arr[i]; i++){
              var objName = name.split('(').shift();
              console.error('objName', objName, obj, window[objName]);
              var parentObj = obj ? obj : (window[objName] ? window : ( $.operations && $.operations[objName] ? $.operations : Item.items ));
              // console.error('objName', objName, parentObj, obj);
              console.error('parentObj', objName, parentObj);
              var nextArgument = args ? args.shift() : null;
              var param = nextArgument ? nextArgument.replace(/\(|\)/g, '').split(', ') : [];
              if (typeof parentObj[objName] === 'function'){
                obj = parentObj[objName](...param);
              } else {
                obj = parentObj[objName];
              }
            }
            if (obj){
              console.debug('obj', obj);
              return obj;
            }
          }
        }
      }
      return;
      return this;
    },
    filter(){
      return this.query('$filter', ...arguments);
    },
    get(){
      this.method='get';
      return this.http();
    },
    getPath (path){
      path = path || (this.URL ? this.URL.pathname : '');
      // console.debug([path])
      var [dummy, basePath, folder, sep, id] = path.match(/(.*?\/om|\/api|^)(\/.*?)(\/id\/|$)(.*)/) || [];
      return [basePath, folder, sep, id];
    },
    headers(selector, context){
      if (typeof selector === 'object'){
        Object.assign(this.URL.headers, selector)
      } else {
        this.URL.headers[selector] = context;
      }
      return this;
    },
    authProvider(authProvider){
      this.getAccessToken = authProvider.getAccessToken;
      return this;
    },
    http(){
      return $.promise('http', async (resolve,reject) => {
        if (this.getAccessToken) {
          const access_token = await this.getAccessToken();
          // console.log('access_token', access_token);
          this.headers('Authorization', 'Bearer ' + access_token);
        }
        return typeof XMLHttpRequest !== 'undefined' ? this.web(resolve,reject) : this.node(resolve,reject)
      });
    },
    // body(callback){
    //   this.promise.then(e => callback(e.body));
    //   return this;
    // },
    item(callback){
      this.promise.then(e => callback(e.body));
      return this;
    },
    data(callback){
      this.promise.then(e => callback(JSON.parse(e.target.responseText)));
      return this;
    },
    input(param, formData){
      if (!param) {
        return this.input.data;
      } else if (param instanceof window.Element) {
        this.input.data = new FormData(param);
      } else if (param.elem instanceof window.Element) {
        this.input.data = new FormData(param.elem);
      } else if (param instanceof FormData || param instanceof File){
        this.input.data = param;
      } else if (param instanceof Event){
        param.preventDefault();
        this.input.data = new FormData(param.target);
        if (param.submitter){
          this.input.data.append(param.submitter.name, param.submitter.value);
        };
      } else if (param.constructor){
        console.log('param.constructor.name', param.constructor.name);
        if (['Object','Array'].includes(param.constructor.name)){
          if (formData) {
            this.input.data = new FormData();
            Object.entries(param).forEach(entry => this.input.data.append(...entry));
          } else {
            this.headers('Content-Type', 'application/json');
            this.input.data = JSON.stringifyReplacer(param);
          }
        } else if (this[param.constructor.name]) {
          return this[param.constructor.name](param);
        } else {
          this.input.data = param;
          // console.error(param);
        }
      } else {
        this.input.data = param;
      }
      return this;
    },
    setmethod(method) {
      this.method = method;
      return this;
    },
    node(resolve){
      this.resolve = resolve;
      const input = this.input();
      if (input){
        this.headers('Content-Length',input.length);
      }
      const options = {
        method: this.method,
        hostname: this.URL.hostname,
        // path: req.pathname,//[req.basePath, req.path, req.searchParams.toString()].filter(Boolean).join(''),
        path: this.URL.pathname+'?'+this.URL.searchParams.toString(),
        headers: this.URL.headers,
        patch: input,
      };
      // console.debug(this.URL.headers);
      const url = this.URL.toString();
      // const handleTag = this.method + url;
      const protocol = url.split(':').shift();
      // const path = [req.params.basePath, req.params.path, req.params.search].filter(Boolean).join('');
      // const HTTP = window[protocol] = window[protocol] || require(protocol);
      const HTTP = require(protocol);
      // console.debug('NODE SEND');
      // let options = req.options;
      // { method: req.method, hostname:req.hostname, path: req.pathname, headers:req.headers};
      // console.debug('OPTIONS', req.options);
      const xhr = HTTP.request(options, e => {
        e.target = xhr;
        e.target.request = this;
        e.target.responseText = '';
        e.on('data', function (data){
          // console.debug('data', data);
          e.target.responseText += data;
        }).on('end', () => {
          // console.debug('end', Object.keys(xhr));
          e.status = e.statusCode;
          e.statusText = e.statusMessage;
          try {
            // console.debug(e.headers['content-type'], e.data);
            e.body = e.headers['content-type'].includes('application/json')
            ? JSON.parse(e.target.responseText)
            : e.target.responseText;
            e.response = e.body = e.body; // deprecated
          } catch(err){
            console.debug('ERROR JSON', err, e.target.responseText.substr(0,1000));
            // throw e.target.responseText;
          }
          resolve(e);
          // if (req.params.then){
          // 	req.params.then.call(e.target, e);
          // }
        });
      }).on('error', e => {
        console.debug('ERROR');
      });
      if (input){
        xhr.write(input);
      }
      xhr.startTime = new Date();
      xhr.end();
      return xhr;
    },
    onerror(e){
      console.msg('HTTP ON ERROR', e)
    },
    onload(e){
      ((e.body||{}).responses || [e]).forEach(res => res.body = $().evalData(res.body));

      if (this.statusElem){
        this.statusElem.remove();
      }
      if ($.config.debug && e.target.status < 400 || isModule){
        console.debug (
          // e.target.sender,
          this.method.toUpperCase(),
          this.URL.toString(),
          e.target.status,
          e.target.statusText,
          e.target.responseText.length, 'bytes',
          new Date().valueOf() - e.target.startTime.valueOf(), 'ms',
          // [e.target.responseText],
          // e.body || this.responseText,
        );
      }
    },
    onprogress(e){
      console.debug('onprogressssssssssssssssssssss', e.type, e);
      var msg = `%c${this.method} ${this.responseURL} ${this.status} (${this.statusText}) ${this.response.length} bytes ${new Date().valueOf() - this.startTime.valueOf()}ms`;
      if (this.elStatus){
        this.elStatus.innerText = decodeURIComponent(this.msg) + ' ' + e.loaded + 'Bytes';
      }
    },
    order(){
      return this.query('$order', ...arguments);
    },
    post(param){
      this.method = 'post';
      if (param){
        this.input(param, true);
      }
      return this.http();
    },
    patch(data){
      this.method='post';
      this.input(data);
      return this.http();
    },
    query(selector, context){
      this.url();
      if (selector instanceof Object){
        Object.entries(selector).forEach(entry => this.query(...entry));
      } else if (arguments.length === 1){
        const search = new URLSearchParams(selector);
        search.forEach((value,key) => this.URL.searchParams.set(key,value));
        // this.URL.search = selector;
      } else {
        this.URL.searchParams.set(...arguments);
      }
      return this;
    },
    setParam(name, value){
      this.props = this.props || [];
      this.props[name] = value;
    },
    servers(servers){
      if (servers && servers.length){
        url(servers[0].url);
      }
    },
    select(){
      return this.query('$select', ...arguments);
    },
    toString(){
      return this.URL.toString();
    },
    top(){
      return this.query('$top', ...arguments);
    },
    url(url, base){
      this.URL = this.URL || new URL(url || '', base || (window.document ? document.location.href : dmsOrigin));
      this.URL.headers = this.URL.headers || {};
      this.input.data = null;
    },
    web(resolve,reject){
      // console.log('AAAAA',resolve,reject,this);
      // this.resolve = resolve;
      const xhr = new XMLHttpRequest();
      xhr.request = this;
      const url = this.URL.toString();
      xhr.open(this.method, url);
      xhr.addEventListener('error', e => {
        console.error(`${xhr.method} ${xhr.src} ${xhr.status} ERROR ${xhr.statusText}`); // responseText is the server
      });
      xhr.addEventListener('load', e => {
        if (xhr.elLoadlog){
          xhr.elLoadlog.appendTag('span', '', new Date().toLocaleString() );
        }
        if (xhr.waitfolder){
          window.collist.setAttribute('wait', Number(window.collist.getAttribute('wait')) - 1);
        }
        if (xhr.status !== 200) {
          return reject(xhr.status);
          // throw 'FOUTJE';
          // reject('STATUS', xhr.status);
        }
        try {
          e.body = xhr.responseText;
          if (xhr.getResponseHeader('content-type').includes('application/json')){
            e.body = JSON.parse(e.body);
          }
        } catch(err){
          console.error('JSON error', xhr, xhr.responseText.substr(0,5000));
        }
        this.onload(e);
        resolve(this.returnBody ? e.body : e);
      });
      if ($.his.elem.statusbar) {
        xhr.total = xhr.loaded = 0;
        xhr.addEventListener('loadend', e => {
          $().progress(-xhr.loaded,-xhr.total);
        });
        if (xhr.upload) {
          xhr.addEventListener('progress', e => {
            const loaded = e.loaded - xhr.loaded;
            xhr.loaded = e.loaded;
            if (!xhr.total){
              $().progress(0, xhr.total = e.total);
            }
            $().progress(loaded)
          });
        }
      }
      Object.entries(this.URL.headers).forEach(entry => xhr.setRequestHeader(...entry));
      xhr.startTime = new Date();
      xhr.send(this.input.data);
      // return xhr;
      // $().status('main', url);
      // xhr.withCredentials = url.includes(document.location.origin);
      // xhr.setCharacterEncoding("UTF-8");
      // xhr.overrideMimeType('text/xml; charset=iso-8859-1');
    },
  };
  const clients = new Map();
  Aim = function Aim (selector, context){
    // console.error(1);
    if(selector instanceof Elem) return selector;
    if(!(this instanceof $)) return new $(...arguments);
    // if (!selector) return new $('$');
    if (selector){
      if (selector instanceof Item){
        return selector;
      }
      this.selector = selector;
    }
    selector = selector || 'aim';
    if (['string','number'].includes(typeof selector)){
      if ($.his.map.has(selector)){
        selector = $.his.map.get(selector);
        if (context) $(selector).extend(context);
        return selector;
      } else if (window.document){
        // selector = TAGNAMES.includes(selector) ? document.createElement(selector) : (document.getElementById(selector) || selector)
        const element = document.getElementById(selector);
        selector = element ? element : (TAGNAMES.includes(selector) ? document.createElement(selector) : selector);
      }
    }
    if (window.Element && selector instanceof window.Element){
      if ($.his.map.has(selector.id)) return $.his.map.get(selector.id);
      selector = new Elem(selector, ...[...arguments].slice(1));
      if (selector.elem.id){
        $.his.map.set(selector.elem.id, selector);
      }
      return selector;
    }
    // if(!(this instanceof $)) return new $(...arguments);
    if (typeof selector === 'string'){
      if (selector.match(/\w+\(\d+\)/)){
        return Item.get(selector);
      } else {
        this.id(selector)
      }
    } else if (selector instanceof Item) {
      return selector;
    } else if (typeof Window !== 'undefined' && selector instanceof Window) {
      return this;
    } else if (selector.ID || selector.LinkID || selector.tag) {
      return Item.get(selector);
    }
    this.extend(context)
  };
  const $ = Aim;
  window.$ = window.$ || Aim;

  // sessionStorage.clear();

  Aim.prototype = {
    // info: {
    //   title: 'Object Manager',
    // },
    pdfpages(selector) {
      return $.promise('pdf-pages', resolve => {
        let pages=[];
        function read_pages(pdf) {
          // pagesProgress.max = pdf.numPages;
          $().progress(0, pdf.numPages);
          (function getPage(pageNumber) {
            // console.log(pageNumber);
            pdf.getPage(pageNumber).then(function(page) {
              page.getTextContent({
                normalizeWhitespace: true,
                disableCombineTextItems: false,
              }).then(item => {
                pages.push(item.items);
                if (pageNumber < pdf.numPages) {
                  $().progress(pageNumber);
                  setTimeout(() => getPage(++pageNumber),0);
                } else {
                  resolve(pages);
                }
              });
            });
          })(1);
        }
        if (selector instanceof File) {
          console.log('is file', selector);
          var fileReader = new FileReader();
          fileReader.onload = function(e){
            const array = new Uint8Array(e.target.result);
            pdfjsLib.getDocument({data: array}).promise.then(read_pages);
          };
          fileReader.readAsArrayBuffer(selector);
        } else {
          pdfjsLib.getDocument(selector).promise.then(read_pages);
        }
      });
    },
    access_token(){
      return this.set('access_token', ...arguments);
    },
    // authProvider(context){
    //   // console.error(context);
    //   return this.get(AuthProvider, context);
    // },
    auth(context){
      console.error('AUTH', context);
      return this.get(AuthProvider, {auth: context});
    },
    copyFrom(source, master, index) {
      return $.promise( 'copyFrom', resolve => {
        // return;
        const [s,schemaName,sourceId] = source.tag.match(/(\w+)\((\d+)\)/);
        console.warn(schemaName, source, master);
        const item = {
          // schema: source.schema,
          header0: source.header0,
          Src: {
            LinkID: sourceId,
          },
          Class: {
            LinkID: !source.Class || !source.Class.LinkID === 0 ? sourceId : source.Class.LinkID,
          },
        };
        if (master) {
          master.attr('HasChildren', 1, true);
          item.Master = {
            LinkID: master.data.ID,
            Data: index === undefined ? (master.items ? master.items.length : 0) : index,
          }
        }
        console.debug('COPY START', item);
        aimClient.api(`/${schemaName}`).input(item).post().then(item => {
          // console.debug('COPY DONE', e.target.responseText);
          item.details().then(async item => {
            console.debug('COPY START', item);
            await item.clone();
            if (master) {
              if (master.items) {
              master.items.push(item);
              // master.emit('change');
              await master.reindex();
              if (master.elemTreeLi.elem.open) {
                master.elemTreeLi.emit('toggle')
              } else {
                master.elemTreeLi.elem.open = true;
              }
              // if (index !== undefined) {
              //   console.debug('INDEX', index);
              //   item.movetoidx(master,index);
              // }
            }
            }
            console.debug('COPY END', item);
            // item.emit('change');
            resolve(item);
          })
        })
      });
    },
    clone(obj){
      // console.error('clone', obj);
      return JSON.parse(JSON.stringify(obj));
    },
    components(components){
      return this.extend(components)
    },
    setconfig(context){
      $().extend(context);
    },
    connector(){
      Object.assign(this, {
        external(name, args, callback){
          let params = {to: { sid: $.Aliconnector.connector_id }, external: {} };
          // let args = [...arguments];
          params.external[name] = Array.isArray(args) ? args : (args ? [args] : []);
          $.Aliconnector.callback = callback;
          wsClient.send(JSON.stringify(params));
        },
        reply(par){
          if ($.Aliconnector.callback){
            $.Aliconnector.callback(par);
          }
          $.Aliconnector.callback = null;
          // console.debug('ALICONNECTOR REPLY', par);
        },
        printurl(url){
          this.external('printurl', url, par => {
            console.debug('PRINT REPLY', par);
          });
        },
        hide(){
          this.external('hide', null, par => {
            console.debug('HIDE REPLY', par);
          });
        },
        show(){
          this.external('show', null, par => {
            console.debug('SHOW REPLY', par);
          });
        },
        // writelnfile(){
        // 	this.external('show', null, par => {
        // 		console.debug('SHOW REPLY', par);
        // 	});
        // },
        // writefile(){
        // 	this.external('show', null, par => {
        // 		console.debug('SHOW REPLY', par);
        // 	});
        // },
        // readfile(){
        // 	this.external('show', null, par => {
        // 		console.debug('SHOW REPLY', par);
        // 	});
        // },
        // readfilearray(){
        // 	this.external('show', null, par => {
        // 		console.debug('SHOW REPLY', par);
        // 	});
        // },
        // EditFile(){
        // 	this.external('show', null, par => {
        // 		console.debug('SHOW REPLY', par);
        // 	});
        // },
        filedownload(par){
          this.external('filedownload', "http://alicon.nl" + par, par => {
            console.debug('SHOW REPLY', par);
          });
        },
        mailimport(){
          this.external('show', null, par => {
            console.debug('SHOW REPLY', par);
          });
        },
        contactimport(){
          this.external('show', null, par => {
            console.debug('SHOW REPLY', par);
          });
        },
        // opcSetVar(){},
        // opcSet(){},
        // opcConnect(){},
        // opcDisconnect(){},
        // geturl(){},
        // getHtml(){},
      });
    },
    create(){
      this.selector = this.selector.createElement(...arguments);
      return this;
    },
    // client(options){
    //   this.get(Client, options ? Object.assign(options,{authProvider: options.authProvider || this.authProvider()}) : null);
    //   return this;
    // },
    client_get(){
      return clients;
    },
    css(selector, context) {
      if (document) {
        if (selector instanceof Object) {
          Object.entries(selector).forEach(entry => arguments.callee(...entry))
        } else {
          document.querySelector('html').style.setProperty('--' + selector, context);
        }
      }
      return this;
      //
      //
      // let style = [...document.getElementsByTagName('style')].pop() || $('style').parent(document.head).elem;
      // const sheet = style.sheet;
			// function addRule(selector, context) {
			// 	if ('insertRule' in sheet) {
			// 		sheet.insertRule(selector + "{" + context + "}", sheet.cssRules.length);
			// 	} else if ('addRule' in sheet) {
			// 		sheet.addRule(selector, context);
			// 	}
			// }
			// if (selector instanceof Object) {
			// 	Object.entries(selector).forEach(entry => addRule(...entry))
			// } else {
			// 	addRule(...arguments);
			// }
      // return this;
		},
    data(data){
      Item.get(data);
      return this;
    },
    // doc:{
    //   value: new Doc(),
    // },
    document(mainElem, buttons){
      $('doc').append(
        this.pageElem = $('div').class('col doc').append(
          $('div').class('row top stickybar').append(
            $('span').class('aco'),
            $('button').class('abtn pdf').on('click', async e => {
              const html = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>'+this.docElem.elem.innerHTML;
              $().url(dmsUrl + '/?request_type=pdf').post(html).then(e => {
                const elem = $('div').parent(this.pageElem).class('col abs').append(
                  $('div').class('row top btnbar').append(
                    $('button').class('abtn close').on('click', e => elem.remove()),
                  ),
                  $('iframe').class('aco').src(e.body.src)
                )
              })
            }),
            $('button').class('abtn close').on('click', e => this.pageElem.remove()),
          ),
          $('div').class('row aco').append(
            this.leftElem = $('div').class('mc-menu left np oa').append(),
            $('div').class('aco col').on('click', e => {
              const href = e.target.getAttribute('href');
              if (href && href.match(/^http/)) {
                e.stopPropagation();
                e.preventDefault();
                window.history.pushState('page', '', '?l='+url_string(href));
                const panel = $('div').parent(elem.docElem).class('col abs').append(
                  elem.elemBar = $('div').class('row top abs btnbar').append(
                    $('span').class('aco'),
                    $('button').class('abtn close').on('click', e => panel.remove()),
                  ),
                  $('iframe').src(href),
                );
              }
            }).append(
              $('nav').class('row docpath').append($('small').id('navDoc')),
              this.docNavTop = $('nav').class('row dir'),
              this.docElem = mainElem.class('doc-content aco'),
            ),
            $('div').class('mc-menu right np oa').append(
              $('div').class('ac-header').text('Table of contents'),
              this.indexElem = $('ul').index(this.docElem)
            ),
          ),
        )
      );
      // $(document.body).on('scroll', e => this.scrollTop.set(this.src, e.target.scrollTop));
      // this.doc.indexElem.index(this.doc.docElem)
      this.pageElem.elem.doc = this;
      return this;
    },
    async emit(type, context){
      const selector = this.elem || this.selector || this;
      // if (type === 'change') console.debug('emit', type, context, selector);
      if (selector.addEventListener){
        let e;
        if (typeof (Event) === 'function'){
          e = new Event(type);
        } else {
          e = document.createEvent('Event');
          e.initEvent(selector, true, true);
        }
        if (typeof context === 'object'){
          delete context.path;
          Object.assign(e, context);
        }
        await selector.dispatchEvent(e);
      } else {
        if (selector.eventListeners && selector.eventListeners.has(type)){
          const eventListener = selector.eventListeners.get(type);
          for (const i in eventListener){
            // console.debug('EMIT', type, eventListener[i]);
            await eventListener[i](context || {});
          }
        }
      }
      return this;
    },
    evalData(data){
      // console.debug('evalData', data);
      // keys = ['components'];
      // const cfg = ['components'].map(key => data[key]);
      if (data instanceof Object){
        // const keys = ['components','info'].filter(key => key in data);
        // const config = keys.reduce((result, key) => ({ ...result, [key]: data[key] }), {});
        //
        // // console.debug(data,config);
        //
        // this.extend(config);
        // console.debug('evalDataevalDataevalDataevalData', data);
        if (Array.isArray(data.value)){
          data.value = data.value.map(data => Item.get(data));
        } else if (data['@id']){
          data = Item.get(data);
        }
        // console.debug('A', data.body);
      }
      return data;
    },
    eventHandle: {
      value: null,
    },
    elements:{
      get(){
        if (isModule){
          return [];
        }
        return this.props && (this.props[0] instanceof Object)
        ? Object.values(this.props[0]).filter(value => value instanceof Element)
        : [];
      },
    },
    extend(){
      $.extend(this.elem || this.selector || this, ...arguments);
      return this;
    },
    execQuery(selector, context, replace){
      $.url = $.url || new URL(document.location.origin);
      var url = new URL(document.location);
      if (typeof selector === 'object') {
        Object.entries(selector).forEach(entry => url.searchParams.set(...entry));
      } else {
        url.searchParams.set(selector, context);
      }


      // console.error('execQuery', url_string($.url.href), url_string(url.href));
      if (url_string($.url.href) !== url_string(url.href)) {
        this.execUrl(url_string(url.href));
        // if (url.searchParams.get('l')) {
        //   url.searchParams.set('l', decodeURIComponent(url.searchParams.get('l')));
        //   console.log(url.searchParams.get('l'));
        //
        // }
        // var href = url.href;
        // console.log(href);
        if (replace) {
          // console.error('REPLACE');
          window.history.replaceState('page', '', url_string(url.href));
        } else {
          // console.error('PUSH');
          window.history.pushState('page', '', url_string(url.href));
        }
      }
      return this;
    },
    execUrl(url){
      // console.warn('execUrl', url);
      $.url = $.url || new URL(document.location.origin);
      var url = new URL(url, document.location);
      // console.log(url.hash, url.searchParams.get('l'), $.url.searchParams.get('l'));
      if (url.hash) {
        if (this.execUrl(url.hash.substr(1))) {
          $.his.mergeState(url.hash.substr(1));
          return;
        }
        // if ($[url.hash.substr(1)]) {
        //   return $[url.hash.substr(1)]();
        // }
        // this.execUrl(url.hash.substr(1));
      }
      // console.log(url.searchParams.get('l'));
      if (url.searchParams.get('l') && url.searchParams.get('l') !== $.url.searchParams.get('l')) {

        var documentUrl = new URL(document.location);
        // url.searchParams.forEach((value, key) => console.log(key, value));
        url.searchParams.forEach((value, key) => documentUrl.searchParams.set(key, value));
        documentUrl.hash = '';
        // window.history.replaceState('page', '', documentUrl.href.replace(/%2F/g, '/'));



        // window.history.replaceState('page', '', url.href.replace(/%2F/g, '/'));
        $.url.searchParams.set('l', url.searchParams.get('l'));
        var refurl = new URL(url.searchParams.get('l'), document.location);
        if (refurl.pathname.match(/^\/api\//)) {
          // const client = clients.get(refurl.hostname) || $();
          // console.log('CLIENT',client,refurl.hostname);
          refurl.pathname += '/children';
          aimClient.api(refurl.href)
          .filter('FinishDateTime eq NULL')
          .select($.config.listAttributes)
          .get().then(async body => {
            if (body){
              const items = body.value || await body.children;
              $().list(items);
            }
          });
        } else {
          return $('list').load(url.searchParams.get('l'));
        }
      }
      if (url.searchParams.get('v') && url.searchParams.get('v') !== $.url.searchParams.get('v')) {
        $.url.searchParams.set('v', url.searchParams.get('v'));
        if (url.searchParams.get('v')) {
          var refurl = new URL(url.searchParams.get('v'), document.location);
          if (refurl.pathname.match(/^\/api\//)) {
            // const client = clients.get(refurl.hostname) || $();
            aimClient.api(refurl.href).get().then(async body => $('view').show(body));
          }
        } else {
          $('view').text('');
        }
      }
      for ([key, value] of url.searchParams) {
        if (typeof $[key] === 'function'){
          return $[key].apply($, value ? value.split(', ') : []) || true;
        }
      };
      // if (!$().url(document.location.hash ? document.location.hash.substr(1) : document.location.href).exec()) {
      //   if (url.searchParams.get('p')) {
      //     return $('list').load(url.searchParams.get('p'));
      //   }
      // }
      // if (url.searchParams.get('id')) {
      //   var refurl = new URL(atob(url.searchParams.get('id')));
      //   if (refurl.pathname.match(/^\/api\//)) {
      //     $().url(refurl.href).get().then(async e => {
      //       $('view').show(e.body);
      //     });
      //   }
      // }
      // return;
      // console.log('POPSTATE2', document.location.pathname);
    },
    forEach(selector, context, fn){
      if (selector instanceof Object){
        Object.entries(selector).forEach(entry => fn.call(this, ...entry));
      } else {
        fn.call(this, selector, context)
      }
      return this;
    },
    get(selector, options) {
      this.props = this.props || new Map();
      if (!selector) return this.props;
      const name = selector.name || selector;
      if (!this.props.has(name)){
        options = typeof options === 'string' ? $(options) : options;
        // console.log(selector);
        this.props.set(name, typeof selector === 'function' && selector.prototype ? new selector(options) : options)
      }
      return this.props.get(name)
      // let prop = (this.props = this.props || new Map()).get(name);
      // if (options){
      //   if (!prop){
      //     options = Array.isArray(options) ? options.shift() : options;
      //     options = typeof options === 'string' ? $(options) : options;
      //     options = typeof selector === 'function' ? new selector(options) : options;
      //     prop = this.props.set(name, options).get(name)
      //     prop.key = this.key;
      //   } else {
      //     $(prop).extend(options)
      //     if (prop.init){
      //       prop.init();
      //     }
      //   }
      // }
      // return prop
    },
    getApi(url){
      return $.promise(
        'getApi',
        resolve => this
        .url(url)
        .get()
        .then(e => {
          console.debug('GET', JSON.parse(e.target.responseText));
          $(this).extend(e.body);
          resolve(e);
        })
      )
    },
    getObject(name, constructor, args) {
      const props = this.props = this.props || new Map();
      if (!props.has(name)) {
        props.set(name, new constructor(...args))
      } else if (!args.length) {
        return props.get(name);
      } else {
        props.get(name).show(...args);
      }
      return this;
    },
    has(selector){
      return this.props && this.props.has(selector);
    },
    id(selector){
      this.key = selector; // deprecated
      this.set('id', selector);
      $.his.map.set(selector, this);
      return this;
    },
    async login(){
      // const url = new URL(this.server.url, document.location);
      var url = new URL(this.server ? this.server.url : '/api', dmsOrigin);
      if (this.authProvider().access && this.authProvider().access.iss) {
        url.hostname = this.authProvider().access.iss;
      }
      // console.debug( url );
      // return;
      //
      // var url = new URL(this.server ? this.server.url : this.authProvider().access.iss, 'https://aliconnect.nl/api');
      //
      // console.debug( this.authProvider().access.iss, url );
      // return;
      clients.set(url.hostname, this);
      // return console.debug(this.ws());
      // clients.set()
      if (this.ws().url){
        await this.ws().connect()
      }
      if (this.authProvider()){
        await this.authProvider().login(...arguments);
        if (this.ws()){
          await this.ws().login(this.authProvider().getAccessToken())
        }
      }
      return this;
    },
    // logout(){
    //   app.logout();
    // },
    list(selector) {
      return this.getObject(arguments.callee.name, Listview, [...arguments]);
    },
    message: {
      get(){
        const [basePath, folder, sep, id] = this.getPath();
        // console.debug(basePath, folder, sep, id, this);
        return {
          method: this.req.method,
          url: [folder, this.URL.searchParams.toString()].filter(Boolean).join(''),
          body: this.req.input,
          to: this.to,
        }
      },
    },
    msa() {
			return $.msa = $.msa || new Msa(...arguments);
		},
    nav() {
			return nav;
		},
    notify(title, options) {
      // $().sw.active.postMessage({
      //   test: 'ja',
      // })
      return;
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          // $().sw.showNotification(title, {
          //   body: `Bla Bla`,
          //   // url: 'https://moba.aliconnect.nl',
          //   icon: 'https://aliconnect.nl/favicon.ico',
          //   image: 'https://aliconnect.nl/shared/265090/2020/07/09/5f0719fb8fa69.png',
          //   // data: {
          //   //   href: document.location.href,
          //   //   url: 'test',
          //   // },
          //   actions: [
          //     {
          //       action: 'coffee-action',
          //       title: 'Coffee',
          //       icon: '/images/demos/action-1-128x128.png'
          //     },
          //     {
          //       action: 'doughnut-action',
          //       title: 'Doughnut',
          //       icon: '/images/demos/action-2-128x128.png'
          //     },
          //     {
          //       action: 'gramophone-action',
          //       title: 'gramophone',
          //       icon: '/images/demos/action-3-128x128.png'
          //     },
          //     {
          //       action: 'atom-action',
          //       title: 'Atom',
          //       icon: '/images/demos/action-4-128x128.png'
          //     }
          //   ]
          // })
          //
          // return;
          //
          options = {
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
          };
          var notification = new Notification(title, options);
          notification.onclick = function(e) {
            console.log('CLICKED', options);
            // window.open("http://www.stackoverflow.com");
            // window.location.href = 'https://aliconnect.nl';
          }
        }
      }
    },
    noPost(fn){
      $.his.noPost = true;
      fn();
      $.his.noPost = false;
    },
    on(type, context, useCapture){
      const selector = this.elem || this.selector || this;
      this.forEach(type, context, (type, context) => {
        if (selector.addEventListener){
          selector.addEventListener(type, context, useCapture);
        } else {
          // if (type === 'change') console.debug('on', type, context, selector);
          const eventListeners = selector.eventListeners = selector.eventListeners || new Map();
          if (!eventListeners.has(type)) eventListeners.set(type, []);
          const eventListener = eventListeners.get(type);
          if (!eventListener.includes(context)){
            eventListener.push(context);
          }
        }
      });
      return this;
    },
    onload(e){
      // console.error(this, e.target);
      if ($.config.debug && e.target.status < 400 || isModule){
        console.debug (
          // e.target.sender,
          this.props('method').toUpperCase(),
          this.props('url').toString(),
          e.target.status,
          e.target.statusText,
          e.target.responseText.length, 'bytes',
          new Date().valueOf() - this.startTime.valueOf(), 'ms',
          // e.target.responseText,
          // e.body || this.responseText,
        );
      }
      // if (e.status >= 400) document.body.appendTag('DIV', {className:'errorMessage', innerHTML:this.responseText });
      // this.getHeader = this.getHeader || this.getResponseHeader;
      // var contentType = e.headers ? e.headers['content-type'] : this.getHeader('content-type');
      (e.body.responses || [e]).forEach((res, i) => {
        if (res && res.body){
          // res.body = $.evalData(res.body);
        }
        // console.debug('BODY', res.body);
      });
      // this.body = e.body;
      // this.resolve(this);
      this.resolve(e);
      // this.resolve({
      // 	body: e.body,
      // 	json(){
      // 		return e.body;
      // 	}
      // });
    },
    origin: window.document ? document.currentScript.src.replace(/\/lib.*/,'') : '',
    panel() {
      return $('div').panel();
    },
    procstate(selector) {
      return $('div').class('procstate').text(selector);
    },
    progress(value = 0, max = 0) {
      if ($.his.elem.statusbar) {
        value = $.his.elem.statusbar.progress.elem.value = ($.his.elem.statusbar.progress.elem.value || 0) + value;
        max = $.his.elem.statusbar.progress.elem.max = ($.his.elem.statusbar.progress.elem.max || 0) + max;
        $.his.elem.statusbar.progress
        .max(max)
        .value(value || null)
        .attr('proc', max ? Math.round(value / max * 100) : null)
      }
    },
    popupmenuitems(item) {
			return;
			var itemmenu = $.menuitems;
			if (item.attributes && item.attributes.state && item.attributes.state.options) {
				//item.attributes.state.options.onclick = function() {
				//	// //console.debug('SET STATE', this.item);
				//	this.item.set({ state: $.Object.findFieldValue(this.item.attributes.state.options, 'Title', this.menuitem.Title) });
				//};
				itemmenu.state.menu = item.attributes.state.options;
			}
			return itemmenu;
		},
    prompt(selector, context) {
      return $.prompt(selector, context);
		},
    promptform(url, prompt, title = '', options = {}){
      options.description = options.description || $.his.translate.get('prompt-'+title+'-description') || '';
      title = $.his.translate.get('prompt-'+title+'-title') || title;
      console.log([title, options.description]);
      options.properties = options.properties || {};
      // Object.entries($.sessionPost).forEach(([key,value])=>Object.assign(options.properties[key] = options.properties[key] || {type:'hidden'}, {value: value, checked: ''}));
      $.sessionPost = $.sessionPost || {};
      //console.log('$.sessionPost', $.sessionPost);
      Object.entries($.sessionPost).forEach(([selector,value])=>Object.assign(selector = (options.properties[selector] = options.properties[selector] || {type:'hidden'}), {value: selector.value || value, checked: ''}));
      return prompt.form = $('form').parent(prompt.is.text('')).class('col aco').append(
        $('h1').ttext(title),
        prompt.div = $('div').md(options.description),
      )
      .properties(options.properties)
      .append(options.append)
      .btns(options.btns)
      .on('submit', e => url.query(document.location.search).post(e).then(e => {
        console.log('JA', e.body);
        window.sessionStorage.setItem('post', JSON.stringify($.sessionPost = e.body));
        // return;
        // return console.log('$.sessionPost', $.sessionPost);
        if ($.sessionPost.id_token) {
          localStorage.setItem('id_token', $.sessionPost.id_token);
          $().send({ to: { nonce: $.sessionPost.nonce }, id_token: $.sessionPost.id_token });
        }
        if ($.sessionPost.prompt) prompt = $().prompt($.sessionPost.prompt);
        if ($.sessionPost.msg && prompt && prompt.div) prompt.div.text('').html($.sessionPost.msg);
        if ($.sessionPost.socket_id) return $().send({to:{sid:$.sessionPost.socket_id}, body:$.sessionPost});
        if ($.messageHandler && $.sessionPost.url) {
          $.messageHandler.source.postMessage({
            url: $.sessionPost.url,
          }, $.messageHandler.origin);
          window.close();
          return;
        }
        if ($.sessionPost.url) document.location.href = $.sessionPost.url;

        // return;
        // // //console.log(e.target.responseText);
        // if (!e.body) return;
        // $.sessionPost = e.body;
        // $.responseProperties = Object.fromEntries(Object.entries($.sessionPost).map(([key,value])=>[key,{format:'hidden',value:value}]));
        //
        // // //console.log('$.sessionPost', $.sessionPost);
        // [...document.getElementsByClassName('AccountName')].forEach((element)=>{
        //   element.innerText = $.sessionPost.AccountName;
        // });
        // if (e.body.msg) {
        //   e.target.formElement.messageElement.innerHTML = e.body.msg;
        //   //console.log(e.target.formElement.messageElement);
        // } else if (e.body.socket_id) {
        //   //console.log('socket_id', e.body);
        //   // return;
        //   $.WebsocketClient.request({
        //     to: { sid: e.body.socket_id },
        //     body: e.body,
        //   });
        //   window.close();
        // } else if (e.body.url) {
        //   // return //console.error(e.body.url);
        //   // if ()
        //
        //   document.location.href = e.body.url;
        // } else {
        //   //console.log(e.body);
        //   // document.location.href = '/api/oauth' + document.location.search;
        // }
      }))
    },
    schemas (selector, context){
      if (!selector) return this.get('schemas');
      if (selector instanceof Object){
        return Object.entries(selector).forEach(entry => this.schemas(...entry));
      } else {
        const schemas = this.get('schemas') || this.set('schemas', new Map()).get('schemas');
        // console.log(selector, context, this.has('schemas'), schemas);
        selector = validSchemaName(selector);
        if (!schemas.has(selector)){
          if (!window[selector]){
            eval(`${selector} = function(){}`);
          } else {
            // console.debug(`${selector} exists`);
          }
          // console.log(selector);
          const constructor = window[selector];
          // if (selector !== 'Item') {
          Object.values(context.properties = context.properties || {}).forEach(property => {
            if (property.enum && typeof property.enum === 'object') {
              property.options = property.enum;
            }
            if (property.options) {
              property.options = Object.fromEntries(Object.entries(property.options).map(([optionName,option])=>[optionName,typeof option === 'object' ? option : {title: option}]));
              property.enum = Object.keys(property.options);
              if (property.enum.length === 2 && Object.values(property.options).filter(Boolean).length === 1) {
                property.format = 'checkbox';
              }
            }
          });
          // const allOf = [selector];
          context.allOf=context.allOf||['Item'];
          const allContext = {};
          // for (let name of context.allOf) {
          //   console.log(name,Object.keys(schemas.get(selector).properties).join(','))
          //   context.allOf.concat((schemas.get(selector)||{}).allOf);
          // }
          // // context.allOf.forEach(selector => context.allOf.concat((schemas.get(selector)||{}).allOf));
          // console.log(selector, context.allOf);
          //
          context.allOf.forEach(selector => $.extend(allContext, schemas.has(selector) ? JSON.parse(JSON.stringify(schemas.get(selector))) : null));
          schemas.set(selector, this.schemas[selector] = context = $.extend(allContext, context));
          //
          //
          // context.allOf = (function getAllOf(allOf) {
          //   allOf.concat().forEach(selector => if (schemas.has(selector)))
          //   // console.log(allOf);
          //   // (context.allOf||[]).forEach(allOfSelector => {
          //   //   allOf.unshift(allOfSelector);
          //   // });
          //   // return $.extend(allContext, context);
          //   return allOf;
          // })(context.allOf||[]);
          // console.log(selector, Object.keys(context.properties).join(','));
          if (constructor !== Item) {
            constructor.prototype = Object.assign(Object.create(Item.prototype), constructor.prototype);
          }
          // const items = new Map();
          Object.assign(constructor.prototype, {
            schema: context,
            schemaName: selector,
            // clear() { return items.clear(); },
            // deleteItem() { return items.delete(...arguments); },
            // entries() { return items.entries(...arguments); },
            // // forEach() { return items.forEach(...arguments); },
            // getItem() { return items.get(...arguments); },
            // hasItem() { return items.has(...arguments); },
            // keys() { return items.keys(...arguments); },
            // setItem() { return items.set(...arguments); },
            // values() { return items.values(...arguments); },
          });
          for (let [propertyName, property] of Object.entries(context.properties||{})) {
            property.name = propertyName;
            if (!constructor.prototype.hasOwnProperty(propertyName)){
              Object.defineProperty(constructor.prototype, propertyName, typeof property.value === 'function' ? {
                value: new Function(property.value.replace(/^value\(\) \{|\}$/g,''))
              } : {
                get(){
                  // if (property.get){
                  //   if (typeof property.get === 'function'){
                  //     return property.get.call(this);
                  //   } else {
                  //     const names = property.get.split(',');
                  //     return Object.entries(this.schema.properties)
                  //     .filter(entry => names.includes(entry[0]))
                  //     .filter(entry => entry[0] in this.data)
                  //     .map(entry => (this.data[entry[0]] ? this.data[entry[0]].Value || this.data[entry[0]] : '') )
                  //     .join(' ')
                  //     // 	console.debug('headerValue', attributeName, index, v, this.data, this.schemaName, this.schema.properties);
                  //
                  //   }
                  // }
                  // console.debug(propertyName, this);
                  return this.getValue(propertyName);
                  // if (this.data && this.data[propertyName]){
                  //   return typeof this.data[propertyName] === 'object' ? this.data[propertyName].Value : this.data[propertyName];
                  // }
                },
                set(value){
                  this.attr(propertyName, value, true);
                }
              });
            }
          }
          // }
          if (context.operations){
            for (let [operationName, operation] of Object.entries(context.operations)){
              // console.debug(operationName);
              operationName = operationName.replace(/(\(.*)/,'');
              if (constructor.prototype[operationName]){
                let operation = constructor.prototype[operationName];
                // console.debug('OPEREATION', operationName, String(operation));
                console.debug('OPERATION', selector, operationName);
                constructor.prototype[operationName] = function (){
                  $.forward = null;
                  operation.apply(item, arguments);
                }
              } else {
                if (typeof operation === 'function'){
                  constructor.prototype[operationName] = operation;
                } else {
                  constructor.prototype[operationName] = function(){
                    let args = [...arguments];
                    if ($.forward) return;
                    // console.error('Send',tag,operationName,args);
                    // return;
                    let path = `/${tag}/${operationName}(${args.join(', ')})`;
                    new $.WebsocketRequest({
                      to: { aud: $.auth.access.aud },
                      path: path,
                      method: 'post',
                      forward: $.forward || $.WebsocketClient.socket_id,
                    });
                  };//.bind({ path: '/' + tag + '/' + operationName  });
                }
              }
            }
          }
          const item = Item.get(context);
          item.isSchema = true;
        }
      }
      return this;
    },
    send(context){
      // console.debug(context, this.ws());
      this.ws().send(context);
      // if ($.ws){
      // 	$.ws.message(JSON.stringify(context));
      // }
    },
    set(selector, context){
      (this.props = this.props || new Map()).set(selector, context);
      return this;
    },
    setState(state){
      Object.values($.client).forEach(client => client.setUserstate(state));
    },
    state(){},
    storage(selector, context, type){
      // cookieSettings = localStorage.getItem('cookieSettings');
      const cookieSettings = {
        session: true,
        functional: true,
        tracking: true,
        cookie: true,
      };
      $.his.cookie = $.his.cookie || new Map(window.document ? document.cookie.split("; ").map(val => val.split('=')) : null);
      // console.debug($.his.cookie.get('id_token'));
      if (arguments.length === 1){
        const value =
        $.his.cookie.get(selector) ||
        (window.sessionStorage ? window.sessionStorage.getItem(selector) : null) ||
        (localStorage ? localStorage.getItem(selector) : null) ||
        '';
        // console.warn(selector,value);
        try {
          return JSON.parse(value);
        } catch (err){
          return value;
        }
      } else if (context === null){
        console.debug('remove', selector);
        window.sessionStorage.removeItem(selector);
        localStorage.removeItem(selector);
        document.cookie = `${selector}= ;path=/; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
        $.his.cookie.delete(selector);
        // console.debug(document.cookie);
        // console.debug('delete', selector, localStorage.getItem(selector));
      } else {
        type = type || 'functional';
        context = JSON.stringify(context);
        // console.warn('SET', selector, context);
        if (type === 'cookie'){
          $.his.cookie(selector, context);
          document.cookie = `${selector}=${context} ;path=/; SameSite=Lax`;
        } else if (type === 'session'){
          if (window.sessionStorage){
            window.sessionStorage.setItem(selector, context);
          }
        } else if (cookieSettings[type]){
          if (localStorage){
            localStorage.setItem(selector, context);
          }
          // console.debug('set', selector, context, localStorage.getItem(selector));
        }
      }
      return this;
    },
    status(selector, context){
      if ($.his.elem.statusbar && $.his.elem.statusbar[selector]){
        $.his.elem.statusbar[selector].attr('context', context);
      } else {
        // console.debug(selector, context);
      }
      return this;
    },
    translate(){
      return this.url(dmsUrl)
      .query('request_type','translate')
      .query('lang','nl')
      .get()
      .then(e => {
        $.his.translate = new Map(Object.entries(e.body))
      });
    },
    tree(selector) {
      return this.getObject(arguments.callee.name, Treeview, [...arguments]);
		},
    url(url, base){
      return new Request(url, base);
    },
    userName(){
      return $.auth && $.auth.id ? $.auth.id.name : ''
    },
    ws(options){
      return this.get(WebSocket, options ? Object.assign(options,{authProvider: options.authProvider || $.client.authProvider}) : null);
    },
    _sendNotification() {
      ws.send({
        to: this.item.users,
        Notification: {
          Title: this.put.Subject,
          options: {
            body: "Bericht geplaatst door " + this.get.from,
            url: "https://aliconnect.nl/tms/app/om/#id=" + this.get.id,
            icon: "https://aliconnect.nl/favicon.ico",
            //image: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
            data: {
              href: '#?id=' + this.get.id
            },
          }
          //api: this.api, get: this.get, put: this.put
        }
      });
    },
    cam() {
      const elem = document.head.appendChild(document.createElement('script'));
      elem.setAttribute('src', $.config.apiPath + '/js/cam.js');
    },
    extendConfig(yaml){
      // console.log(yaml);
      return aimClient.api('/').query('extend', true).post({config: yaml});
    },
    dashboard() {
      const panel = $('div').panel();
      aimClient.api('/').query('request_type', 'personal_dashboard_data_domain').get().then(body => {
        panel.elemMain.class('dashboard').append(
          $('div').class('row wrap').append(
            ...body.map(row => $('div').class('col').append(
              $('h1').text(row.schemaPath),
              ...row.items.map(item => $('a').text(item.header0).on('click', e => $('view').show($(`${row.schemaPath}(${item.id})`)) ))
            )),
            ...[0,0,0,0,0,0,0,0,0].map(a => $('div').class('ghost')),
          )
        );
      })
    },
    signin(){
      $().on({
        async load() {
          $().server.url = $().server.url || document.location.origin;
          await $().url($().server.url+'/api.json').get().then(e => $().extend(e.body));
          await $().login();
        }
      });
    },
    cookies() {
      console.log('COOKIES');
      $().on({
        async load() {
          if (!localStorage.getItem('cookieSettings')) {
            const elem = $('div')
            .parent(document.body)
            .class('cookieWarning')
            .text('Opslag van uw gegevens')
            .append(
              $('button')
              .text('Werkende website')
              .on('click', e => {
                localStorage.setItem('cookieSettings', 'session');
                elem.remove();
              }),
              $('button')
              .text('Allen voor u persoonlijk')
              .on('click', e => {
                localStorage.setItem('cookieWarning', 'private');
                elem.remove();
              }),
              $('button')
              .text('Delen met onze organisatie')
              .on('click', e => {
                localStorage.setItem('cookieWarning', 'shared');
                elem.remove();
              }),
              $('a').text('Cookie beleid').href('#?l=//aliconnect.nl/aliconnect/wiki/Explore-Legal-Cookie-Policy')
            )
          }
          return this;
        }
      })
    },
    account_config(config, extend, save) {
      const panel = $('form').class('col')
      .style('position:absolute;margin:auto;left:0;right:0;top:0;bottom:0;background-color:white;z-index:200;')
      .parent($('list'));
      const tabControl = $('div').parent(panel).class('row top btnbar');
      const pageControl = $('div').parent(panel).class('row aco').style('height:100%;');
      function upload() {
        // console.log('UPLOAD', page);
        configInput.elem.value = configText.elem.innerText;
        aimClient.api('/').post(panel).then(body => {
          console.debug("API", body);
        });
        // aimClient.api(url).post(page).query({
        //   base_path: document.location.protocol === 'file:' ? '/' : document.location.pathname.split(/\/(api|docs|om)/)[0],
        // }).input(this.value).post().then(e => {
        //   console.debug("API", e.target.responseText );
        // });
      }
      const page = $('div').parent(pageControl)
      .class('aco oa col')
      .css('margin:auto;position:absolute;top:0;bottom:0;left:0;right:0;')
      .css('background-color:var(--bg);');
      const configText = $('pre').parent(page)
      .class('aco')
      .css('margin:0;padding:0 10px;outline:none;')
      .text(config.replace(/^---\n/, '').replace(/\n\.\.\./, '').trim())
      .contenteditable('')
      .spellcheck(false)
      .on('keydown', e => {
        if (e.key === "s" && e.ctrlKey) {
          e.preventDefault();
          upload();
        }
        if (e.key == 'Tab' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
          document.execCommand('insertHTML', false, '&#009');
          e.preventDefault()
        }
      });
      const configInput = $('input').parent(page).name('config').type('hidden');
      function focus () {
        [...pageControl.elem.children].forEach(elem => elem.style.display = 'none');
        page.elem.style.display = '';
      }
      function close () {
        page.remove();
        tab.remove();
        if (!tabControl.elem.innerText) {
          panel.remove();
        }
      }
      const tab = $('div').parent(tabControl).append(
        $('span').text('config.yaml').on('click', focus),
        $('input').type('checkbox').name('extend').id('expand').checked(extend),
        $('label').text('extend').for('expand'),
        $('button').class('abtn close').on('click', close),
      );
      focus();
      if (save) upload();
      // open(aimClient.api('/').accept('yaml'));
    },
    analytics() {
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', {
        trackingId: 'UA-28018977-1',
        cookieDomain: 'auto',
        // name: 'schiphol',
        // userId: '12345'
      });
      ga('send', 'pageview');
    },
    ga(){
      if (window.ga) {
        ga(arguments);
      }
      return this;
    },
  };

  function Account(id_token) {
    const id = this.idToken = JSON.parse(atob((this.id_token = id_token).split('.')[1]));
    this.sub = id.sub;
    this.name = id.name || id.email || id.sub;
    this.username = id.preferred_username || this.name;
    this.accountIdentifier = this.idToken.oid;
  };
  Account.prototype = {
    // getSecret() {
    //   console.log(111111, this.id_token);
    //   return $().url('https://aliconnect.nl/api/').query('request_type', 'account_secret').headers('Authorization', 'Bearer ' + this.id_token).get();
    // },
  }
  Aim.UserAgentApplication = function UserAgentApplication(config) {
    aimClient = this;
    $.extend($.config, config);
    config = this.config = $.config;
    this.clients = [];
    this.servers = new Map;
    this.storage = window[config.cache.cacheLocation];
    this.clientId = config.auth.client_id = config.client_id || config.auth.client_id;
    // config.auth.scopes = config.scope.split(' ');

    // this.clientSecret = config.client_secret = this.storage.getItem('client_secret');
    if (this.storage.getItem('aim.id_token')) {
      this.account = new Account(this.storage.getItem('aim.id_token'));
      console.log(this.account);
    }
    if (this.storage.getItem('aim.access_token')) {
      // console.log(this.storage.getItem('access_token'));
    }
    const url = new URL(document.location);
    if (url.searchParams.has('code')){
      // return console.error(url.searchParams.get('code'));
      this.getAccessToken({code: url.searchParams.get('code')}).then(e => {
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        document.location.href = url.href;
      });
      throw "Sign in processed. Please wait";
    }



    // console.error(this.config.components, this.config, $().schemas())


    (function loadpar(arr, path = '') {
      if (arr) {
        for (let [key,value] of Object.entries(arr)) {
          if (typeof value === 'object') {
            loadpar(value, `${path}${key}-`);
          } else {
            // console.log(`%${path}${key}%`,value);
            $.his.api_parameters[`%${path}${key}%`] = value;
          }
        }
      }
    })(config);
    // if (config.components && config.components.schemas) {
    //   $().schemas(config.components.schemas);
    // }
    $.his.items = {};
  }
  Aim.UserAgentApplication.prototype = {
    // getClient(src) {
    //   src = new URL(src, this.config.url ? this.config.url : document.location).href;
    //   // console.log(src, this.config.url, this.servers.length);
    //   for (let [url, client] of this.servers.entries()) {
    //     if (src.match(url)) return client;
    //   }
    //   return this.clients[0];
    // },
    api(src) {
      for (let client of this.clients) {
        // console.log(client, client.config.servers);
        // client.config.servers = Array.from(client.config.servers);
        for (let [i,server] of Object.entries(client.config.servers)) {
          // console.log(i,server);
          if (src.match(server.url) || !src.match(/^http/)) {
            return client.api(src);
          }
        }
      }
    },
    clientAttr(options) {
      return $().url(dmsUrl).query({
        request_type: 'client_attr',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }).post(options).then(e => {
        console.log(e.target.responseText)
      })
    },
    getAccount() {
      return this.account;
    },
    getAccessToken(options){
      if (options){
        options = Object.assign({
          grant_type: 'authorization_code',
          // code: options.code, // default, overide by params
          client_id: this.config.auth.client_id,
          // 'client_secret' => $this->client_secret,
          access_type: 'offline', // only if access to client data is needed when user is not logged in
        }, options);
        // console.debug(options);
        return $.promise('getAccessToken', resolve => $()
        .url(new URL('token', this.config.auth.url).href)
        .post(options)
        // .post()
        .then(e => {
          console.log(this);
          this.storage.setItem(`aim.${this.clientId}.id_token`, e.body.id_token);
          this.storage.setItem('aim.id_token', e.body.id_token);
          this.storage.setItem('aim.access_token', e.body.access_token);
          this.storage.setItem('aim.refresh_token', e.body.refresh_token);
          this.account = new Account(e.body.id_token);
          // return;
          // this.init({auth: e.body});
          // const url = new URL(document.location.href);
          // url.searchParams.delete('code');
          // url.searchParams.delete('state');
          // $.his.replaceUrl( url.toString() );
          // $.clipboard.reload();
          resolve();
        }));
      }
      // console.debug(this.access_token);
      return this.access_token;
    },
    init(){
      return this;
      // return console.warn(this);
      // Object.assign(this, options);
      // const auth = this.config.auth;
      // ['id_token', 'refresh_token', 'access_token'].forEach(token => $().storage(token, auth[token] = auth[token] || $().storage(token) || ''));
      // window.sessionStorage.clear();
      // localStorage.clear();
      const access_token = auth.api_key || auth.access_token || auth.id_token;
      // console.log([access_token, auth.api_key, auth.access_token, auth.id_token]);
      if (access_token){
        try {
          // console.error(access_token);
          this.access = JSON.parse(atob(access_token.split('.')[1]));
          this.sub = this.access.sub;
          this.aud = this.access.aud;
          if (this.ws){
            this.send({ headers: {Authorization:'Bearer ' + aimClient.getAccessToken() } });
          }
        } catch (err){
        }
      }
      if (token = this.token(auth.api_key)){
        this.access_token = token.token;
      } else if (token = this.token(auth.access_token)){
        const refresh = this.token(this.access_token = auth.refresh_token);
        if (refresh){
          clearTimeout(this.refreshTokenTimeout);
          // console.error(`REFRESH EXPIRES IN ${expires_in}`, $.auth.refreshTokenTimeout);
          this.refreshTokenTimeout = setTimeout(this.refreshToken, (refresh.expires_in - 2) * 1000);
        }
      }
      // $().storage(this.key+'AuthProvider',this.auth)
      return this;
    },
    login(options){
      return $.promise('Login', async (resolve, fail) => {
        // console.log('LOGIN', options);
        // return;

        if (options !== undefined){
          let state = Math.ceil(Math.random() * 99999);
          console.log(99999, options);
          options = {
            // scope: 'name+email+phone_number',
            response_type: 'code',
            client_id: this.config.auth.client_id = this.config.auth.client_id || this.config.auth.clientId,
            redirect_uri: this.config.auth.redirect_uri = this.config.auth.redirect_uri || this.config.auth.redirectUri || this.config.redirect_uri || this.config.redirectUri,
            state: state,
            prompt: 'consent',
            scope: options.scope || options.scopes.join(' ') || '',
            // socket_id: $.WebsocketClient.socket_id,
          }
          const url = $().url(this.config.auth.url).query(options).toString();
          console.log(url, this.config);
          if (document.location.protocol === 'file:'){
            options.socket_id = this.ws.socket_id;
            this.loginWindow = window.open(
              url,
              'login',
              `top=${10},left=${10},width=400,height=500,resizable=0,menubar=0,status=0,titlebar=0`
            );
          } else {
            $.clipboard.reload(url);
          }
        }
        this.init();

        window.addEventListener('focus', e => {
          if (this.access_token) {
            // console.log('JE BENT INGELOGT, DUS CONTROLEREN OF TOKEN NOG OK IS ALS HET EEN INLOG TOKEN IS');
            const access = this.access;
            // als een nonce aanwezig is dan is het een inlog token.
            // controleer of token nog actief is, c.q. gebruiker is ingelogt
            if (access.nonce) {
              $().url('https://login.aliconnect.nl/api/oauth').headers('Authorization', 'Bearer ' + this.access_token).post({
                request_type: 'access_token_verification',
                // access_token: aimClient.access_token,
              }).then(e => {
                if (e.target.status !== 200) {
                  $().logout();
                }
              });
            }
            // console.log(aimClient);
          }
        });

        // console.log(this);
        if (this.account) {
          resolve(this.account);
        } else {
          fail('no login');
        }

        // let previousIdToken = $.auth.id_token;
        // let previousAccessToken = $.auth.access_token;
        // $.auth.init();
        // if ($.auth.id_token && previousIdToken !== $.auth.id_token){
        // 	$().emit('login');
        // }
      });
    },
    loginPopup(options) {
      return $.promise('LoginPopup', async (resolve, fail) => {
        options = {
          // scope: 'name+email+phone_number',
          response_type: 'code',
          client_id: this.config.auth.client_id = this.config.auth.client_id || this.config.auth.clientId,
          // redirect_uri: this.config.auth.redirect_uri = this.config.auth.redirect_uri || this.config.auth.redirectUri || this.config.redirect_uri || this.config.redirectUri,
          // state: state,
          prompt: 'consent',
          scope: options.scope || options.scopes.join(' ') || '',
          // socket_id: $.WebsocketClient.socket_id,
        }
        const url = $().url(this.config.auth.url).query(options).toString();
        const height = 600;
  			const width = 400;
  			let rect = document.body.getBoundingClientRect();
  			let top = window.screenTop + (window.innerHeight - height) / 2;
  			let left = window.screenLeft + (window.innerWidth - width) / 2;
  			const popup = window.open(url, 'loginPopup', `top=${top},left=${left},width=${width},height=${height},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`);

        // popup.addEventListener('onload', e => {
        //   console.log(e);
        // })

        // This does nothing, assuming the window hasn't changed its location.
        // setInterval(()=>{
        //   console.log('msg');
        //   popup.postMessage("hello there!", "https://login.aliconnect.nl");
        // },1000);
        // popup.postMessage("The user is 'bob' and the password is 'secret'",
        //
        const interval = setInterval(() => {
          popup.postMessage({
            msg: "loginPopup",
          }, "https://login.aliconnect.nl");
        },1000);
        window.addEventListener("message", (event) => {
          console.log(event.origin, event);
          if (event.data.msg === 'loginPopupAck') {
            clearInterval(interval);
          }
          if (event.data.url) {
            this.getAccessToken({code: new URL(event.data.url, document.location).searchParams.get('code')}).then(e => {
              resolve({
                accessToken: this.storage.getItem('aim.access_token'),
                account: this.account,
                accountState: "72fc40a8-a2d7-4998-afd0-3a74589015ac",
                expiresOn: null,
                fromCache: false,
                idToken: this.account.idToken,
                // idToken: {
                //   rawIdToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5Pbz…SUqywC4QuHklGPvrKVQiMc9jpdJfz2DMIfT6O--gxZD2ApJZg",
                //   claims: {…},
                //   issuer: "https://login.microsoftonline.com/09786696-f227-4199-91a0-45783f6c660b/v2.0",
                //   objectId: "f40f8462-da7f-457c-bd8c-d9e5639d2975", subject: "w6TIVTl01uuD9UHe12Fk6YLiilqhf1arasLwPwGnxV0", …}
                // idTokenClaims: {aud: "4573bb93-5012-4c50-9cc5-562ac8f9a626", iss: "https://login.microsoftonline.com/09786696-f227-4199-91a0-45783f6c660b/v2.0", iat: 1625751439, nbf: 1625751439, exp: 1625755339, …}
                scopes: [],
                tenantId: "09786696-f227-4199-91a0-45783f6c660b",
                tokenType: "id_token",
                uniqueId: "f40f8462-da7f-457c-bd8c-d9e5639d2975",
              });
            });
          }

          // Do we trust the sender of this message?  (might be
          // different from what we originally opened, for example).
          // if (event.origin !== "http://example.com")
          //   return;

          // event.source is popup
          // event.data is "hi there yourself!  the secret response is: rheeeeet!"
        }, false);
        // win.onbeforeunload = e => resolve();
      });
      // this.authProvider.login(this.config.auth);
    },
    config(config){
      $.extend(this.config, config);
      if (this.config.components && this.config.components.schemas) {
        $().schemas(this.config.components.schemas);
      }
    },
    // login() {
    //   return this.authProvider.login(...arguments);
    // },
    logout(options){
      // console.log(sessionStorage('aim.id_token'));
      if (this.storage.getItem('aim.id_token')) {
        this.storage.removeItem('aim.id_token');
        this.storage.removeItem('aim.refresh_token');
        this.storage.removeItem('aim.access_token');
        // $.clipboard.reload();
        $.clipboard.reload($().url('https://login.aliconnect.nl/api/oauth').query({
          prompt: 'logout',
          client_id: $().client_id || '',
          redirect_uri: document.location.origin + document.location.pathname,
        }).toString());
      } else {
        const searchParams = new URLSearchParams(document.location.href);
        if (searchParams.get('redirect_uri')) {
          document.location.href = searchParams.get('redirect_uri');
        }
      }
    },
    refreshToken(){
      return console.error('refreshToken');
      if (this.refreshTokenHandle) return;
      console.log($.Client);
      this.refreshTokenHandle = new $.Client('https://login.aliconnect.nl/api/token').post({
        grant_type: 'refresh_token',
        refresh_token: $.his.cookie.refresh_token,
        client_id: $().client_id,
        // 'redirect_uri' => self::$redirect_uri,
        // 'client_secret' => $this->client_secret,
      }).then(e => {
        // console.debug('REFR TOKEN',e);
        this.refreshTokenHandle = null;
        // var token = e.body.access_token;
        // var access = JSON.parse(atob(token.split('.')[1]));
        // var time = new Date().getTime()/1000;
        // var expires_in = Math.round(access.exp - time);
        // console.error('RRRRRRRRRRRRefreshToken', expires_in, access);
        // $.his.cookie = {
        // 	access_token: e.body.access_token
        // };
        // var token = $.auth.access_token = $.his.cookie.access_token || $.his.cookie.id_token;
        // var access = JSON.parse(atob(token.split('.')[1]));
        // var time = new Date().getTime()/1000;
        // var expires_in = Math.round(access.exp - time);
        // console.error('RRRRRRRRRRRRefreshToken', expires_in, access);
        //
        return;
        $.his.cookie = {
          access_token: e.body.access_token
        };
        $.auth.init();
        // $.auth.refreshToken = () => {console.debug('NOOOO');};
        // updateAccessToken();
      });
    },
    token(token, clientSecret){
      if (token){
        const time = new Date().getTime() / 1000;
        const access = JSON.parse(atob(token.split('.')[1]));
        return {
          token: token,
          access: access,
          time: time,
          expires_in: Math.round(access.exp - time),
          isValid: access.exp > time || true,
        }
      }
    },
    trackLocalSession(){
      return;
      clearTimeout(arguments.callee.timeout);
      const cookie = $.his.cookie;
      // console.debug (`trackLocalSession`);
      if (!cookie.id_token && auth.id_token > ''){
        return this.logout();
      } else if (cookie.id_token > '' && !auth.id_token){
        // return client.login();
      }
      arguments.callee.timeout = setTimeout(arguments.callee, $.config.trackLocalSessionTime);
    },
    trackSession(){
      return;
      // console.error (`trackSession`, $.auth.id.iss, arguments.callee.timeout);
      if (arguments.callee.httpRequest) return;
      clearTimeout(arguments.callee.timeout);
      window.removeEventListener('focus', arguments.callee);
      window.addEventListener('focus', arguments.callee);
      // $.auth.id.iss = 'login.aliconnect.nl/api/oauth';
      // alert(1);
      arguments.callee.timeout = setTimeout(arguments.callee, $.config.trackSessionTime);
      arguments.callee.httpRequest = $().url(authorizationUrl)
      .query('request_type', 'check_access_token')
      .headers('Authorization', 'Bearer ' + auth.id_token)
      .get()
      .then(e => {
        console.warn('trackSession', e.target);
        arguments.callee.httpRequest = null;
        // console.debug($.auth.id.nonce, e.target.status, e.target.responseText);
        if (e.target.status !== 200){
          window.removeEventListener('focus', arguments.callee);
          // return $.auth.logout();
        }
      });
    },
    getAccountByUsername(name) {
      console.log(name);
      return this.account;
    },
    acquireTokenSilent(silentRequest) {
      return $.promise('LoginPopup', async (resolve, fail) => {
        resolve({});
      })
    },
    acquireTokenPopup(aimRequest) {
      return this.loginPopup(aimRequest);
    }
  };

  Aim.InteractionRequiredAuthError = function () {

  }

  Object.assign(Aim, {
    attr: {
      displayvalue(value, property) {
      if (value === undefined) {
        return null;
      }
      if (property) {
        if (property.options && property.options[value]) {
          console.log(property.name, value, property.options[value].title);
          return property.options[value].title;
        }
        if (property.type === 'datetime') {
          return value ? new Date(value).toLocaleString() : null;
        }
      }
      return value;
    },
    },
    clipboard: {
  		undo: function() {
  			//console.debug('UNDO', $.his.updateList);
  			if (this.undoData = $.his.updateList.shift()) {
  				this.undoData.Value.reverse().forEach(function(row) {
  					if (row.eventType == 'paste') row.eventType = 'cut';
  					else if (row.eventType == 'cut') row.eventType = 'paste';
  				});
  				this.undoData.from = true;
  				$.data.update(this.undoData, true);
  			}
  		},
  		update: function(data, targetItem, eventType) {
  			//if (!data || !targetItem) return false;
  			if (!data) return false;
  			if (typeof data == 'string') data = JSON.parse(data);
  			if (data.Value) {
  				//var updateAction = '';
  				if (!data.from) $.his.updateList.unshift(data); // Add data to update history list
  				data.Value.forEach(function(row, i, rows) {
  					var item = Item.create(row.id);
  					row.eventType = row.eventType || eventType;
  					////console.debug("UPDATE", eventType, row.eventType, row, targetItem, item);
  					if (!item) return;
  					switch (eventType || row.eventType) {
  						case 'copy':
  						targetItem.appendItem(null, { schema: item.schema, Title: item.Title, userID: 0, srcID: item.id }, null, true);
  						break;
  						case 'link':
  						//console.debug('LINK', item);
  						new $.HttpRequest($.config.$, 'POST', '/' + targetItem.tag + '/link', { itemID: item.id } ).send();
  						// targetItem.appendChild(null, { schema: item.schema, Title: item.Title, detailID: item.id }, null, true);
  						break;
  						case 'cut':
  						////console.debug('CUT', row.masterID, item.masterID);
  						if (row.masterID != item.masterID) {
  							//console.debug('NO CUT', row.masterID, item.masterID);
  							return;
  						}
  						if (item.master && item.master.children && item.master.children.length) {
  							item.master.children.splice(item.master.children.indexOf(item), 1);
  							item.master.children.forEach(function(item, i) { item.index = i });
  						}
  						if (item.elemTreeLi) item.elemTreeLi.parentElement.removeChild(item.elemTreeLi);
  						if (item.elemListLi && item.elemListLi.parentElement) item.elemListLi.parentElement.removeChild(item.elemListLi);
  						if (targetItem) {
  							////console.debug('MOVE TO');
  							if (targetItem.masterID == targetItem.srcID) {
  								//target isClass en verplaatsen: ITEM wordt afgeleid van nieuwe CLASS
  								//item.masterID = item.srcID = row.srcID = row.masterID = targetItem.id;
  								//console.debug('MOVE TO CLASS', targetItem, item.srcID = row.srcID = item.masterID = row.masterID = row[item.getPropertyAttributeName('masterID')] = targetItem.id, item.master);
  								var propertyAttributeName = item.getPropertyAttributeName('srcID');
  								if (propertyAttributeName) row[propertyAttributeName] = { itemID: row.srcID };
  								var propertyAttributeName = item.getPropertyAttributeName('masterID');
  								if (propertyAttributeName) row[propertyAttributeName] = { itemID: row.masterID };
  							}
  							else {
  								//console.debug('MOVE TO', targetItem.elLI, item.masterID = row.masterID = row[item.getPropertyAttributeName('masterID')] = targetItem.id, item.master);
  							}
  							////Item isClass en target !isClass, dus verplaatsen en ITEM wordt afgeleid van nieuwe CLASS
  							//if (row.masterID == row.srcID && targetItem.masterID != targetItem.srcID && eventType=="paste") item.masterID = item.srcID = row.srcID = row.masterID = targetItem.id;
  							//item.masterID = targetItem.id;
  							if (item.master) {
  								item.master.children = item.master.children || [];
  								item.master.children.push(item);
  								if (item.master.elemTreeLi.elemTreeUl) item.appendTo(item.master.elemTreeLi.elemTreeUl);
  							}
  						}
  						$.Selection.cancel();
  						break;
  						//case 'paste':
  						//	if (row.masterID) {
  						//		item.masterID = row.masterID;
  						//		if (item.master) {
  						//			if (row.masterID == row.srcID && item.master.masterID == item.master.srcID);
  						//			if (row.masterID == row.srcID && item.master.masterID == item.master.srcID);
  						//			item.master.children.push(item);
  						//			if (item.master.elemTreeLi.elemTreeUl) item.appendTo(item.master.elemTreeLi.elemTreeUl);
  						//		}
  						//	}
  						//	break;
  						default:
  						break;
  					}
  				});
  				////console.debug('UPDATE', data);
  				//return true;
  				// @todo: mkan, versturen via ws
  				// if (!data.from) $.ws.send(Object.assign({ post: 1, to: { host: $.config.$.auth.accessToken.aud } }, data));
  				return true;
  			}
  		},
  		cancel: () => {
  			//console.debug($.his.items.oncancel);
  			return $.his.items.oncancel && $.his.items.oncancel.length ? $.his.items.oncancel.pop()() : null;
  		},
  		oncancel(fn) {
  			const oncancel = $.his.items.oncancel = $.his.items.oncancel || [];
  			if (oncancel.includes(fn)) {
  				oncancel.splice(oncancel.indexOf(fn), 1);
  			}
  			oncancel.push(fn);
  		},
  		reload(href) {
  			//console.error('$.reload', href);
  			setTimeout(() => {
  				if (href) document.location.href = href;
  				else document.location.reload();
  			},0);
  		},
  		// attr(items, attributeName, value) {
  		// 	//console.debug(items, attributeName, value, this[attributeName]);
  		// 	if (this[attributeName]) {
  		// 		this[attributeName].forEach(item => {
  		// 			Object.values(item).filter(value => value instanceof Elem).forEach(selector => selector.attr(attributeName, null))
  		// 		})
  		// 	}
  		// 	items.forEach(item => {
  		// 		Object.values(item).filter(value => value instanceof Elem).forEach(selector => selector.attr(attributeName, value))
  		// 	})
  		// 	this[attributeName] = items;
  		// },
  		items: [],
  		setItem(item, attributeName, value) {
  			if (!item) throw 'no item';
  			e = window.event;
  			let items = this[attributeName] || [];
        items.forEach(item => item.setAttribute ? item.setAttribute(attributeName, null) : null);
  			// this.items.forEach(item => item.setAttribute(attributeName));
  			// $.attr(this.items,'checked');
  			// $.attr(this.items,'clipboard');
  			if (item) {
  				if (Array.isArray(item)) {
  					items = item;
            this.itemFocussed = item[0];
  				} else {
  					if (!e.altKey) {
  						if (e.ctrlKey) {
  							if (e.shiftKey) {
  								// !ALT+CTRL+SHIFT
  							} else {
  								// !ALT+CTRL+!SHIFT
  								items.push(item);
  							}
  						} else if (e.shiftKey) {
  							// !ALT+!CTRL+SHIFT
  							// if (this.items.length) {
  							// 	//console.error ('find first elem', e.path);
  							//
  							// }
  							items.push(item); // lijst
  						} else {
  							// !ALT+!CTRL+!SHIFT
  							items = [item];
  						}
  					}
  				}
  				// items.forEach(item => item.setAttribute(attributeName, this.items.length));
  			} else {
  				items = [];
  			}
        // //console.debug(item);
  			value = items.length;
        $().status('checked', value);
  			items.forEach(item => {
  				Object.values(item)
  				.filter(value => value instanceof Elem)
  				.forEach(selector => selector.attr(attributeName, value))
  			});
  			this[attributeName] = items;
  			return this;
  		},
  		get length() {
  			return this.items.length;
  		},
  		push(item) {
  			if (!this.items.includes(item)) {
  				this.items.push(item);
  			}
  		},
  		copy(e) {
        const selection = window.getSelection();
        if (selection.focusNode.nodeType === 3) {
          return;
        }
        // console.log('CLIPBOARD', e.type, selection, selection.focusNode.nodeType, selection.focusNode, selection.ancherNode, selection.extendNode, selection.baseNode);
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
  		},
  		remove(item) {
        console.debug('REMOVE');
  			if (this.items.includes(item)) {
  				this.items.splice(this.items.indexOf(item), 1);
  			}
  		},
  		cancel(e){
  			this.setItem([]);
  		},
  		clear(e){
  			//console.debug('clear');
  			$.attr(this.items,'clipboard');
  			this.items = [this.itemFocussed];
  			document.execCommand('copy');
  			// this.setItem([]);
  			return;
  		},
  		paste(e) {
  		},
  		link() {
  			for (var i = 0, o; o = $.selapi.item[i]; i++) {
  				//console.debug(o);
  			}
  		},
  		delete() {
  			for (var i = 0, o; o = $.selapi.item[i]; i++) {
  				//console.debug(o);
  			}
  		},
      copyToClipboard(obj) {
      $.clipboard.data = obj;
      // // $('input').value(JSON.stringify(obj)).focus().select();
      // const el = e => {
      //   e.preventDefault();
      //   e.stopPropagation();
      //   console.log(obj);
      // };
      // window.addEventListener('copy', el);
      document.execCommand('copy');
      // window.removeEventListener('copy', el);
      // const el = $('input')
      // .parent(document.body)
      // // .value(JSON.stringify(obj))
      // .focus()
      // .select()
      // .on('copy', e => {
      //   e.preventDefault();
      //   e.stopPropagation();
      //   console.log('COPY', obj);
      // });
      // // window.addEventListener('copy', el, true);
      // document.execCommand('copy');
      // el.remove();
      // // window.removeEventListener('copy', el, true);
    },
  	},
    config: {
      listAttributes: 'header0,header1,header2,name,schemaPath,Master,Src,Class,Tagname,InheritedID,HasChildren,HasAttachements,State,Categories,CreatedDateTime,LastModifiedDateTime,LastVisitDateTime,StartDateTime,EndDateTime,FinishDateTime',
      trackLocalSessionTime: 5000, // timeout between tracking local cookie login session
      trackSessionTime: 30000, // timeout between tracking login session
      debug: 1,
      minMs: 60000,
      auth: {
        url: 'https://login.aliconnect.nl/api/oauth',
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
        forceRefresh: false
      },
      clients: [],
      url: dmsUrl,
      app: {
        url: dmsOrigin,
      },
      ref: {
        home: dmsOrigin + '/wiki',
      }
    },
    const: {
      prompt: {
        menu: {
          prompts: [
            // 'qrscan',
            'lang',
            // 'chat',
            // 'msg',
            // 'task',
            // 'shop',
            'config',
            'help',
          ]
        },
        config: {
          prompts: [
            // 'upload_datafile',
            // 'import_outlook_mail',
            // 'import_outlook_contact',
            // 'account_create',
            // 'account_domain',
            'account_config',
            // 'sitemap',
            // 'get_api_key',
            'get_aliconnector_key',
            'verwerkingsregister',
          ]
        },
      },
      languages: {
        ab:{iso:'Abkhazian', native:'аҧсуа бызшәа, аҧсшәа'},
        aa:{iso:'Afar', native:'Afaraf'},
        af:{iso:'Afrikaans', native:'Afrikaans'},
        ak:{iso:'Akan', native:'Akan'},
        sq:{iso:'Albanian', native:'Shqip'},
        am:{iso:'Amharic', native:'አማርኛ'},
        ar:{iso:'Arabic', native:'العربية'},
        an:{iso:'Aragonese', native:'aragonés'},
        hy:{iso:'Armenian', native:'Հայերեն'},
        as:{iso:'Assamese', native:'অসমীয়া'},
        av:{iso:'Avaric', native:'авар мацӀ, магӀарул мацӀ'},
        ae:{iso:'Avestan', native:'avesta'},
        ay:{iso:'Aymara', native:'aymar aru'},
        az:{iso:'Azerbaijani', native:'azərbaycan dili'},
        bm:{iso:'Bambara', native:'bamanankan'},
        ba:{iso:'Bashkir', native:'башҡорт теле'},
        eu:{iso:'Basque', native:'euskara, euskera'},
        be:{iso:'Belarusian', native:'беларуская мова'},
        bn:{iso:'Bengali', native:'বাংলা'},
        bh:{iso:'Bihari languages', native:'भोजपुरी'},
        bi:{iso:'Bislama', native:'Bislama'},
        bs:{iso:'Bosnian', native:'bosanski jezik'},
        br:{iso:'Breton', native:'brezhoneg'},
        bg:{iso:'Bulgarian', native:'български език'},
        my:{iso:'Burmese', native:'ဗမာစာ'},
        ca:{iso:'Catalan, Valencian', native:'català, valencià'},
        ch:{iso:'Chamorro', native:'Chamoru'},
        ce:{iso:'Chechen', native:'нохчийн мотт'},
        ny:{iso:'Chichewa, Chewa, Nyanja', native:'chiCheŵa, chinyanja'},
        zh:{iso:'Chinese', native:'中文 (Zhōngwén), 汉语, 漢語'},
        cv:{iso:'Chuvash', native:'чӑваш чӗлхи'},
        kw:{iso:'Cornish', native:'Kernewek'},
        co:{iso:'Corsican', native:'corsu, lingua corsa'},
        cr:{iso:'Cree', native:'ᓀᐦᐃᔭᐍᐏᐣ'},
        hr:{iso:'Croatian', native:'hrvatski jezik'},
        cs:{iso:'Czech', native:'čeština, český jazyk'},
        da:{iso:'Danish', native:'dansk'},
        dv:{iso:'Divehi, Dhivehi, Maldivian', native:'ދިވެހި'},
        nl:{iso:'Dutch, Flemish', native:'Nederlands, Vlaams'},
        dz:{iso:'Dzongkha', native:'རྫོང་ཁ'},
        en:{iso:'English', native:'English'},
        eo:{iso:'Esperanto', native:'Esperanto'},
        et:{iso:'Estonian', native:'eesti, eesti keel'},
        ee:{iso:'Ewe', native:'Eʋegbe'},
        fo:{iso:'Faroese', native:'føroyskt'},
        fj:{iso:'Fijian', native:'vosa Vakaviti'},
        fi:{iso:'Finnish', native:'suomi, suomen kieli'},
        fr:{iso:'French', native:'français, langue française'},
        ff:{iso:'Fulah', native:'Fulfulde, Pulaar, Pular'},
        gl:{iso:'Galician', native:'Galego'},
        ka:{iso:'Georgian', native:'ქართული'},
        de:{iso:'German', native:'Deutsch'},
        el:{iso:'Greek, Modern (1453-)', native:'ελληνικά'},
        gn:{iso:'Guarani', native:'Avañe\'ẽ'},
        gu:{iso:'Gujarati', native:'ગુજરાતી'},
        ht:{iso:'Haitian, Haitian Creole', native:'Kreyòl ayisyen'},
        ha:{iso:'Hausa', native:'(Hausa) هَوُسَ'},
        he:{iso:'Hebrew', native:'עברית'},
        hz:{iso:'Herero', native:'Otjiherero'},
        hi:{iso:'Hindi', native:'हिन्दी, हिंदी'},
        ho:{iso:'Hiri Motu', native:'Hiri Motu'},
        hu:{iso:'Hungarian', native:'magyar'},
        ia:{iso:'Interlingua (International Auxiliary Language Association)', native:'Interlingua'},
        id:{iso:'Indonesian', native:'Bahasa Indonesia'},
        ie:{iso:'Interlingue, Occidental', native:'(originally:) Occidental, (after WWII:) Interlingue'},
        ga:{iso:'Irish', native:'Gaeilge'},
        ig:{iso:'Igbo', native:'Asụsụ Igbo'},
        ik:{iso:'Inupiaq', native:'Iñupiaq, Iñupiatun'},
        io:{iso:'Ido', native:'Ido'},
        is:{iso:'Icelandic', native:'Íslenska'},
        it:{iso:'Italian', native:'Italiano'},
        iu:{iso:'Inuktitut', native:'ᐃᓄᒃᑎᑐᑦ'},
        ja:{iso:'Japanese', native:'日本語 (にほんご)'},
        jv:{iso:'Javanese', native:'ꦧꦱꦗꦮ, Basa Jawa'},
        kl:{iso:'Kalaallisut, Greenlandic', native:'kalaallisut, kalaallit oqaasii'},
        kn:{iso:'Kannada', native:'ಕನ್ನಡ'},
        kr:{iso:'Kanuri', native:'Kanuri'},
        ks:{iso:'Kashmiri', native:'कश्मीरी, كشميري‎'},
        kk:{iso:'Kazakh', native:'қазақ тілі'},
        km:{iso:'Central Khmer', native:'ខ្មែរ, ខេមរភាសា, ភាសាខ្មែរ'},
        ki:{iso:'Kikuyu, Gikuyu', native:'Gĩkũyũ'},
        rw:{iso:'Kinyarwanda', native:'Ikinyarwanda'},
        ky:{iso:'Kirghiz, Kyrgyz', native:'Кыргызча, Кыргыз тили'},
        kv:{iso:'Komi', native:'коми кыв'},
        kg:{iso:'Kongo', native:'Kikongo'},
        ko:{iso:'Korean', native:'한국어'},
        ku:{iso:'Kurdish', native:'Kurdî, کوردی‎'},
        kj:{iso:'Kuanyama, Kwanyama', native:'Kuanyama'},
        la:{iso:'Latin', native:'latine, lingua latina'},
        lb:{iso:'Luxembourgish, Letzeburgesch', native:'Lëtzebuergesch'},
        lg:{iso:'Ganda', native:'Luganda'},
        li:{iso:'Limburgan, Limburger, Limburgish', native:'Limburgs'},
        ln:{iso:'Lingala', native:'Lingála'},
        lo:{iso:'Lao', native:'ພາສາລາວ'},
        lt:{iso:'Lithuanian', native:'lietuvių kalba'},
        lu:{iso:'Luba-Katanga', native:'Kiluba'},
        lv:{iso:'Latvian', native:'latviešu valoda'},
        gv:{iso:'Manx', native:'Gaelg, Gailck'},
        mk:{iso:'Macedonian', native:'македонски јазик'},
        mg:{iso:'Malagasy', native:'fiteny malagasy'},
        ms:{iso:'Malay', native:'Bahasa Melayu, بهاس ملايو‎'},
        ml:{iso:'Malayalam', native:'മലയാളം'},
        mt:{iso:'Maltese', native:'Malti'},
        mi:{iso:'Maori', native:'te reo Māori'},
        mr:{iso:'Marathi', native:'मराठी'},
        mh:{iso:'Marshallese', native:'Kajin M̧ajeļ'},
        mn:{iso:'Mongolian', native:'Монгол хэл'},
        na:{iso:'Nauru', native:'Dorerin Naoero'},
        nv:{iso:'Navajo, Navaho', native:'Diné bizaad'},
        nd:{iso:'North Ndebele', native:'isiNdebele'},
        ne:{iso:'Nepali', native:'नेपाली'},
        ng:{iso:'Ndonga', native:'Owambo'},
        nb:{iso:'Norwegian Bokmål', native:'Norsk Bokmål'},
        nn:{iso:'Norwegian Nynorsk', native:'Norsk Nynorsk'},
        no:{iso:'Norwegian', native:'Norsk'},
        ii:{iso:'Sichuan Yi, Nuosu', native:'ꆈꌠ꒿ Nuosuhxop'},
        nr:{iso:'South Ndebele', native:'isiNdebele'},
        oc:{iso:'Occitan', native:'occitan, lenga d\'òc'},
        oj:{iso:'Ojibwa', native:'ᐊᓂᔑᓈᐯᒧᐎᓐ'},
        cu:{iso:'Church Slavic, Old Slavonic, Church Slavonic, Old Bulgarian, Old Church Slavonic', native:'ѩзыкъ словѣньскъ'},
        om:{iso:'Oromo', native:'Afaan Oromoo'},
        or:{iso:'Oriya', native:'ଓଡ଼ିଆ'},
        os:{iso:'Ossetian, Ossetic', native:'ирон æвзаг'},
        pa:{iso:'Punjabi, Panjabi', native:'ਪੰਜਾਬੀ, پنجابی‎'},
        pi:{iso:'Pali', native:'पालि, पाळि'},
        fa:{iso:'Persian', native:'فارسی'},
        pl:{iso:'Polish', native:'język polski, polszczyzna'},
        ps:{iso:'Pashto, Pushto', native:'پښتو'},
        pt:{iso:'Portuguese', native:'Português'},
        qu:{iso:'Quechua', native:'Runa Simi, Kichwa'},
        rm:{iso:'Romansh', native:'Rumantsch Grischun'},
        rn:{iso:'Rundi', native:'Ikirundi'},
        ro:{iso:'Romanian, Moldavian, Moldovan', native:'Română'},
        ru:{iso:'Russian', native:'русский'},
        sa:{iso:'Sanskrit', native:'संस्कृतम्'},
        sc:{iso:'Sardinian', native:'sardu'},
        sd:{iso:'Sindhi', native:'सिन्धी, سنڌي، سندھی‎'},
        se:{iso:'Northern Sami', native:'Davvisámegiella'},
        sm:{iso:'Samoan', native:'gagana fa\'a Samoa'},
        sg:{iso:'Sango', native:'yângâ tî sängö'},
        sr:{iso:'Serbian', native:'српски језик'},
        gd:{iso:'Gaelic, Scottish Gaelic', native:'Gàidhlig'},
        sn:{iso:'Shona', native:'chiShona'},
        si:{iso:'Sinhala, Sinhalese', native:'සිංහල'},
        sk:{iso:'Slovak', native:'Slovenčina, Slovenský Jazyk'},
        sl:{iso:'Slovenian', native:'Slovenski Jezik, Slovenščina'},
        so:{iso:'Somali', native:'Soomaaliga, af Soomaali'},
        st:{iso:'Southern Sotho', native:'Sesotho'},
        es:{iso:'Spanish, Castilian', native:'Español'},
        su:{iso:'Sundanese', native:'Basa Sunda'},
        sw:{iso:'Swahili', native:'Kiswahili'},
        ss:{iso:'Swati', native:'SiSwati'},
        sv:{iso:'Swedish', native:'Svenska'},
        ta:{iso:'Tamil', native:'தமிழ்'},
        te:{iso:'Telugu', native:'తెలుగు'},
        tg:{iso:'Tajik', native:'тоҷикӣ, toçikī, تاجیکی‎'},
        th:{iso:'Thai', native:'ไทย'},
        ti:{iso:'Tigrinya', native:'ትግርኛ'},
        bo:{iso:'Tibetan', native:'བོད་ཡིག'},
        tk:{iso:'Turkmen', native:'Türkmen, Түркмен'},
        tl:{iso:'Tagalog', native:'Wikang Tagalog'},
        tn:{iso:'Tswana', native:'Setswana'},
        to:{iso:'Tonga (Tonga Islands)', native:'Faka Tonga'},
        tr:{iso:'Turkish', native:'Türkçe'},
        ts:{iso:'Tsonga', native:'Xitsonga'},
        tt:{iso:'Tatar', native:'татар теле, tatar tele'},
        tw:{iso:'Twi', native:'Twi'},
        ty:{iso:'Tahitian', native:'Reo Tahiti'},
        ug:{iso:'Uighur, Uyghur', native:'ئۇيغۇرچە‎, Uyghurche'},
        uk:{iso:'Ukrainian', native:'Українська'},
        ur:{iso:'Urdu', native:'اردو'},
        uz:{iso:'Uzbek', native:'Oʻzbek, Ўзбек, أۇزبېك‎'},
        ve:{iso:'Venda', native:'Tshivenḓa'},
        vi:{iso:'Vietnamese', native:'Tiếng Việt'},
        vo:{iso:'Volapük', native:'Volapük'},
        wa:{iso:'Walloon', native:'Walon'},
        cy:{iso:'Welsh', native:'Cymraeg'},
        wo:{iso:'Wolof', native:'Wollof'},
        fy:{iso:'Western Frisian', native:'Frysk'},
        xh:{iso:'Xhosa', native:'isiXhosa'},
        yi:{iso:'Yiddish', native:'ייִדיש'},
        yo:{iso:'Yoruba', native:'Yorùbá'},
        za:{iso:'Zhuang, Chuang', native:'Saɯ cueŋƅ, Saw cuengh'},
        zu:{iso:'Zulu', native:'isiZulu'},
      },
    },
    extend(parent, selector, context){
      if (!selector) {
        selector = parent;
        parent = this;
      }
      // console.log(111, parent, selector);
      const objects = [];
      if (context){
        Object.entries(context).forEach(entry => Object.defineProperty(parent, ...entry))
      }
      if (selector){
        (function recurse(parent, selector, context){
          if (parent && selector && selector instanceof Object) {
            for (let [key, value] of Object.entries(selector)) {
              if (typeof parent[key] === 'function' && typeof value !== 'function') {
                // console.log(key, value, parent[key]);
                parent[key](value)
              } else if (typeof value === 'function' && !parent.hasOwnProperty(key)) {
                parent[key] = value;
                // Object.defineProperty(parent, key, {
                //   enumerable: false,
                //   configurable: false,
                //   writable: false,
                //   value: value,
                // });
              }
              if (typeof value !== 'object' || Array.isArray(value) || !(key in parent) || objects.includes(value)) {
                parent[key] = value;
              } else {
                objects.push(value);
                recurse(parent[key], selector[key]);
              }
            }
          }
        })(parent, selector, context);
      }
      return parent;
    },
    handleData(data){
      return $.promise( 'handle data', async resolve => {
        // console.debug('handleData');
        if (data.path){
          $().url(data.path).setmethod(data.method).exec();
        }
        const body = data.body;
        if (body){
          const reindex = [];
          function handleData(data) {
            // console.debug('handleData', data);
            if (data.method === 'patch'){
              const body = data.body;
              const itemId = body.ID || data.ID;
              if ($.his.map.has(itemId)) {
                const item = $.his.map.get(itemId);
                if (body.Master) {
                  const parentID = body.Master.LinkID;
                  const index = body.Master.Data;
                  const parent = $.his.map.get(parentID);
                  if (item) {
                    if (item.parent) {
                      if (item.parent !== parent && item.elemTreeLi) {
                        // DEBUG: MAX FOUT
                        // item.parent.items.splice(item.parent.items.indexOf(item), 1);
                        item.elemTreeLi.elem.remove();
                        reindex.push(item.parent);
                      }
                      // if (item.elemTreeLi) {
                      // }
                    }
                    // const master = [].concat(item.data.Master).shift();
                    // master.LinkID = parentID;
                    // master.Data = index;
                    if (parent && parent.items) {
                      if (!parent.items.includes(item)) {
                        // parent.items.push(item);
                      }
                      reindex.push(parent);
                    }
                  }
                }
                Object.entries(body).forEach(entry=>item.attr(...entry));
                item.refresh();
              }
            }
          }
          if (body.requests){
            body.requests.forEach(handleData)
          } else {
            handleData(data);
          }
          reindex.unique().forEach(parent => parent ? parent.reindex() : null);
        }
        resolve();
        //
        //
        //
        // // console.debug('handleRequest', req);
        // if (req.method && req.method.toLowerCase() === 'patch'){
        //   const [tag] = req.path.match(/\w+\(\d+\)/);
        //   const item = Item.get(tag);
        //   if (item){
        //     for (let [attributeName, value] of Object.entries(req.body)){
        //       if (item.properties[attributeName].setValue){
        //         item.properties[attributeName].setValue(value);
        //       }
        //       // console.debug(item, tag, attributeName, value, item.properties[attributeName]);
        //     }
        //   }
        // } else {//if (isModule){
        //   // isModule foorwaarde is opgenomen zodat bericht niet gaat rondzingen.
        //   for (var name in req){
        //     if (typeof $[name] === 'function'){
        //       $[name].apply(this, req[name]);
        //     }
        //   }
        //   try {
        //     console.error('DO FORWARD', isModule, req);
        //
        //     if (req.body){
        //       $.handleAimItems(req.body);
        //     }
        //
        //
        //
        //
        //     $.forward = req.forward;
        //     // $().exec(req, res => {
        //     // 	res.id = req.id;
        //     // });
        //   } catch (err){
        //     console.error(err)
        //   }
        //   $.forward = null;
        //   if (req.message_id && $.WebsocketClient.requests[req.message_id]){
        //     $.WebsocketClient.requests[req.message_id](req);
        //   }
        // }
        // $().emit('message', req);
        // return;
        //
      });
    },
    his: {
      map: new Map(),
      api_parameters: {},
      handlers: {},
      classes: {},
      httpHandlers: {},
      fav: [],
      itemsModified: {},
      items: [],
      elem: {},
      mergeState(url) {
        var documentUrl = new URL(document.location);
        url = new URL(url, document.location);
        url.searchParams.forEach((value, key) => documentUrl.searchParams.set(key, value));
        // documentUrl.hash='';
        window.history.replaceState('page', '', documentUrl.href.replace(/%2F/g, '/'));
      },
      replaceUrl(selector, context){
      if (window.history){
        if (typeof selector === 'object'){
          Object.entries(selector).forEach(entry => arguments.callee(...entry));
        } else if (arguments.length>1){
          var url = new URL(document.location);
          if (context){
            url.searchParams.set(selector, context);
          } else {
            url.searchParams.delete(selector)
          }
          url.hash='';
        } else {
          var url = new URL(selector, document.location.origin);
        }
        url = url.pathname.replace(/^\/\//,'/') + url.search;
        window.history.replaceState('page', '', url);
      }
    },
    },
    log() {
      if (window.document && document.getElementById('console')) {
        $('console').append($('div').text(...arguments))
      } else if ($().statusElem) {
        $().statusElem.text(...arguments);
      } else {
        console.msg(...arguments)
      }
      return arguments;
    },
    maps() {
			return $.promise( 'maps', resolve => {
				if (window.google) resolve (window.google.maps);
				else $('script').parent(document.head)
				.attr('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAKNir6jia2uSgmEoLFvrbcMztx-ao_Oys&libraries=places')
				.on('load', e => resolve (window.google.maps))
			});
		},
    object: {
      isFile(ofile) {
        return (ofile.type || '').indexOf('image') != -1 || $.string.isImgSrc(ofile.src)
      },
    },
    promise(selector, context) {
      const messageElem = $.his.elem.statusbar ? $('span').parent($.his.elem.statusbar.main).text(selector) : null;
      // $().progress(1, 1);
      // const progressElem = $.his.elem.statusbar.progress;
      // progressElem.elem.max += 1;
      // progressElem.elem.value = (progressElem.elem.value || 0) + 1;
      if (Aim.LOGPROMISE) {
        console.debug(selector, 'start');
      }
      return new Promise( context )
      .then( result => {
        // $().progress(-1, -1);
        if (messageElem) {
          messageElem.remove();
        }
        if (Aim.LOGPROMISE) {
          console.debug(selector, 'end');
        }
        return result;
      })
      .catch(err => {
        // $().progress(-1, -1);
        if (messageElem) {
          messageElem.text(selector, err).css('color','red');
        }
        throw err;
      })
    },
    string: {
      html(s) {
        return this.code(s).replace(/(.*?)(&lt;\!--.*?--&gt;|$)/gs, (s,codeString,cmt) => {
          return codeString
          .replace(/&lt;(.*?)&gt;/g, (s,p1) => `&lt;${
            replaceOutsideQuotes(
              p1.replace(/(\w+)/,'<span class=hl-name>$1</span>')
              , s => {
                return s.replace(/ (\w+)(?![^<]*>|[^<>]*<\/)/g,' <span class=hl-attr>$1</span>')
              }
            )
          }&gt;`) + (cmt ? `<span class=hl-comment>${cmt}</span>` : '')
        })
      },
      js(s) {
        // console.error(s);
        return this.code(s)
        .replace(/(.*?)(\/\/.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
          return replaceOutsideQuotes(
            codeString, codeString => codeString.replace(
              /\b(class|abstract|arguments|await|boolean|break|byte|case|catch|char|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield|abstract|boolean|byte|char|double|final|float|goto|int|long|native|short|synchronized|throws|transient|volatile)\b(?![^<]*>|[^<>]*<\/)/gi,
              '<span class=hl-res>$1</span>'
            )
            .replace(
              /\b(Array|Date|eval|function|hasOwnProperty|Infinity|isFinite|isNaN|isPrototypeOf|length|Math|NaN|name|Number|Object|prototype|String|toString|undefined|valueOf)\b/g,
              '<span class=hl-methods>$1</span>'
            )
            .replace(
              /\b(alert|all|anchor|anchors|area|assign|blur|button|checkbox|clearInterval|clearTimeout|clientInformation|close|closed|confirm|constructor|crypto|decodeURI|decodeURIComponent|defaultStatus|document|element|elements|embed|embeds|encodeURI|encodeURIComponent|escape|e|fileUpload|focus|form|forms|frame|innerHeight|innerWidth|layer|layers|link|location|mimeTypes|navigate|navigator|frames|frameRate|hidden|history|image|images|offscreenBuffering|open|opener|option|outerHeight|outerWidth|packages|pageXOffset|pageYOffset|parent|parseFloat|parseInt|password|pkcs11|plugin|prompt|propertyIsEnum|radio|reset|screenX|screenY|scroll|secure|select|self|setInterval|setTimeout|status|submit|taint|text|textarea|top|unescape|untaint)\b/g,
              '<span class=hl-prop>$1</span>'
            )
            .replace(
              /\b(onblur|onclick|onerror|onfocus|onkeydown|onkeypress|onkeyup|onmouseover|onload|onmouseup|onmousedown|onsubmit)\b/g,
              '<span class=hl-events>$1</span>'
            )
            .replace(/(\w+)(\s*\()/g, '<span class="hl-fn">$1</span>$2')
            .replace(/\.(\w+)/g, '.<span class="hl-attr">$1</span>')
            .replace(/\b([A-Z]\w+)\./g, '<span class="hl-obj">$1</span>.')
            .replace(/\b(\w+)\./g, '<span class="hl-attr">$1</span>.')
            .replace(/\b(\d+)\b/g, '<span class="hl-nr">$1</span>')
          ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        })
      },
      javascript(s) {
        return this.js(s);
      },
      css(s) {
        return s.replace(/(.*?)(\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
          return replaceOutsideQuotes(
            codeString, codeString => codeString
            .replace(/\.(.*)\b/g, '.<span class="hl-obj">$1</span>')
          ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        })
      },
      json(s) {
        return s
        .replace(/"(.*?)":/g, '"<span class="hl-fn">$1</span>":')
        .replace(/(:\s*)"(.*?)"/g, '$1"<span class="hl-string">$2</span>"')
      },
      yaml(s) {
        return s.replace(/(.*?)(#.*?\n|$)/gs, (s,codeString,cmt) => {
          return codeString
          .replace(/^(?=\s*)(.+?):/gm, '<span class="hl-fn">$1</span>:')
          .replace(/: (.*?)$/gm, ': <span class="hl-string">$1</span>')
          + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        })
      },
      php(s) {
        return s.replace(/(.*?)(\/\/.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
          return replaceOutsideQuotes(
            codeString, codeString => codeString.replace(
              /\b(class|abstract|arguments|await|boolean|break|byte|case|catch|char|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield|abstract|boolean|byte|char|double|final|float|goto|int|long|native|short|synchronized|throws|transient|volatile)\b(?![^<]*>|[^<>]*<\/)/gi,
              '<span class=hl-res>$1</span>'
            )
          ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        })
      },
      sql(s) {
        return s.replace(/(.*?)(--.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
          return replaceOutsideQuotes(
            codeString, codeString => codeString.replace(
              /\b(ADD|ADD CONSTRAINT|ALTER|ALTER COLUMN|ALTER TABLE|ALL|AND|ANY|AS|ASC|BACKUP DATABASE|BETWEEN|CASE|CHECK|COLUMN|CONSTRAINT|CREATE|CREATE DATABASE|CREATE INDEX|CREATE OR REPLACE VIEW|CREATE TABLE|CREATE PROCEDURE|CREATE UNIQUE INDEX|CREATE VIEW|DATABASE|DEFAULT|DELETE|DESC|DISTINCT|DROP|DROP COLUMN|DROP CONSTRAINT|DROP DATABASE|DROP DEFAULT|DROP INDEX|DROP TABLE|DROP VIEW|EXEC|EXISTS|FOREIGN KEY|FROM|FULL OUTER JOIN|GROUP BY|HAVING|IN|INDEX|INNER JOIN|INSERT INTO|INSERT|IS NULL|IS NOT NULL|JOIN|LEFT JOIN|LIKE|LIMIT|NOT|NOT NULL|OR|ORDER BY|OUTER JOIN|PRIMARY KEY|PROCEDURE|RIGHT JOIN|ROWNUM|SELECT|SELECT DISTINCT|SELECT INTO|SELECT TOP|SET|TABLE|TOP|TRUNCATE TABLE|UNION|UNION ALL|UNIQUE|UPDATE|VALUES|VIEW|WHERE)\b/gi,
              '<span class=hl-res>$1</span>'
            )
          ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        })
      },
      st(s) {
        return s.replace(/(.*?)(--.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
          return replaceOutsideQuotes(
            codeString, codeString => codeString.replace(
              /\b(PROGRAM|END_PROGRAM|VAR|END_VAR|IF|THEN|ELSEIF|ELSIF|ELSE|END_IF|CASE|OF|END_CASE|FOR|TO|BY|DO|END_FOR|REPEAT|UNTIL|END_REPEAT|WHILE|DO|END_WHILE|EXIT|RETURN|ADD|SQRT|SIN|COS|GT|MIN|MAX|AND|OR|BYTE|WORD|DWORD|LWORD|INTEGER|SINT|INT|DINT|LINT|USINT|UINT|UDINT|ULINT|REAL|REAL|LREAL|TIME|LTIME|DATE|LDATE|TIME_OF_DAY|TOD|LTIME_OF_DAY|LTOD|DATE_AND_TIME|DT|LDATE_AND_TIME|LDT|CHAR|WCHAR|STRING|WSTRING|STRING|ANY|ANY_DERIVED|ANY_ELEMENTARY|ANY_MAGNITUDE|ANY_NUM|ANY_REAL|ANY_INT|ANY_UNSIGNED|ANY_SIGNED|ANY_DURATION|ANY_BIT|ANY_CHARS|ANY_STRING|ANY_CHAR|ANY_DATE|DATE_AND_TIME|DATE_AND_TIME|DATE|TIME_OF_DAY|LTIME_OF_DAY)\b/g,
              '<span class=hl-res>$1</span>'
            )
            .replace(
              /\b(LEN|CONCAT|LEFT|RIGHT|MID|INSERT|DELETE|REPLACE|FIND|SEL|MAX|MIN|LIMIT|MUX|TP|TON|TOF|R_TRIG|F_TRIG|TRUNC|TRUNC_INT|ROL|ROR|SHL|SHR|CTU|CTD|CTUD|ABS|SQR|LN|LOG|EXP|SIN|COS|TAN|ASIN|ACOS|ATAN|EXPT|NOT|AND|XOR|OR|MOD|BOOL_TO_INT|WORD_TO_DINT|BYTE_TO_REAL|REAL_TO_LREAL|TIME_TO_DINT)\b/g,
              '<span class=hl-methods>$1</span>'
            )
            .replace(
              /(&lt;|&gt;|&lt;&equals;|&gt;&equals;|&lt;&gt;|:&equals;|&equals;)/g,
              '<b class=hl-string>$1</b>'
            )
            .replace(
              /\b(BOOL|TRUE|FALSE)\b/gi,
              '<span class=hl-prop>$1</span>'
            )
          ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        })
      },
      code(s) {
        s = s || '';
        const ident = (s.match(/^ +/)||[''])[0].length;
        // console.log(s);
        return s.split(/\n/).map(s => s.slice(ident)).join('\n').trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/=/g, '&equals;')
        .replace(/\t/g, '  ')
        .replace(/\^\^(.*?)\^\^/g, '<MARK>$1</MARK>')
        // .replace(/"/g, '&quot;')
        // .replace(/'/g, '&apos;')
      },
      mdHtml(s){
        function mdToHtml (s) {
          return replaceOutsideQuotes(
            s
            // .replace(
            //   /(^|\n)(.*?)(\n\n|$)/gs,
            //   (s,p1) => {
            //     console.log('>>>',s);
            //     return s
            //     .replace(/^((\*|-|\d+\.) .*?$)/s, (s) => list(s,0))
            //   }
            // )
            .replace(/^# (.*?)$/gm, '<H1>$1</H1>\n')
            .replace(/^## (.*?)$/gm, '<H2>$1</H2>\n')
            .replace(/^### (.*?)$/gm, '<H3>$1</H3>\n')
            .replace(/^#### (.*?)$/gm, '<H4>$1</H4>\n')
            .replace(/^##### (.*?)$/gm, '<H5>$1</H5>\n')
            .replace(/^###### (.*?)$/gm, '<H6>$1</H6>\n')
            .replace(/^####### (.*?)$/gm, '<H7>$1</H7>\n')
            // .replace(/(^|\n)(\*|-|\d+\.) .*?(?=\n\n|\n$|$)/gs, (s) => list(s,0))
            .replace(/(^|\n)\s*>( \[\!(\w+)\]| )(.*?)(?=\n\n|$)/gs, (s, prefix, p2, type, content) => prefix + `<BLOCKQUOTE class=${(type||'').toLowerCase()}>${content.replace(/\n\s*> /g,' ')}</BLOCKQUOTE>`)
            // .replace(/(^|\n)\s*>( \[\!(\w+)\]| )(.*?)(?=\n\n|$)/gs, (s, p1, p2, p3, p4) => console.log([s, p1, p2, p3, p4]))

            // .replace(/(^|\n)\s*> (.+?)(?=\n\n|$)/gs, (s, p1, p2) => p1 + `<BLOCKQUOTE>${p2.replace(/\n> /g,' ')}</BLOCKQUOTE>`)

            .replace(/\[ \](?=(?:(?:[^`]*`){2})*[^`]*$)/g, '&#9744;')
            .replace(/\[v\](?=(?:(?:[^`]*`){2})*[^`]*$)/g, '&#9745;')
            .replace(/\[x\](?=(?:(?:[^`]*`){2})*[^`]*$)/g, '&#9745;')
            .replace(/(^|\n)(.*? \| .*?)\n-+ \| -.*?\n(.*?)(?=\n\n|$)/gs, (s, p1, p2, p3) => `${p1}<TABLE><THEAD><TR><TH>${p2.trim().replace(/ \| /g, '</TH><TH>')}</TH></TR></THEAD><TBODY><TR><TD>${p3.replace(/\n/s, '</TD></TR><TR><TD>').replace(/ \| /g, '</TD><TD>')}</TD></TR></TBODY></TABLE>`)
            // .replace(/\n\n(.*?)\n\n/, '\n\n<p>$1</p>\n\n')
            // .replace(/^/, '<p>')
            // .split(/\n\n/).map(s => s && !s.trim().match(/^</) ? '<p>' + s + '</p>' : s).join('\n')
            .split(/\n\n/).map(s => s ? '<p>' + s + '</p>' : s).join('\n')

            // .replace(/^(.+?)$/gs, (s,p1) => `<p>${p1.trim().replace(/\n\n/gs, '</p><p>')}</p>`)
            // .replace(/(^|^\n|\n\n)(.+?)(\n\n|\n$|$)/gs, '$1<p>$2</p>$3')

            .replace(/`(.+?)`/g, (s, p1) => `<CODE>${$.string.code(p1)}</CODE>`),

            s => s
            .replace(/  \n/gm, '<BR >')
            .replace(/\!\[(.*?)\]\((.*?)\)(?=(?:(?:[^`]*`){2})*[^`]*$)/g, '<IMG src="$2" alt="$1">')
            .replace(/\[(.*?)\]\((.*?)\)(?=(?:(?:[^`]*`){2})*[^`]*$)/g, '<A href="$2">$1</A>')
            .replace(/\*\*(.+?)\*\*/g, '<B>$1</B>')
            .replace(/\*(.*?)\*/g, '<I>$1</I>')
            .replace(/__(.*?)__/g, '<B>$1</B>')
            .replace(/_(.*?)_(?![^<]*>|[^<>]*<\/)/g, '<I>$1</I>')
            .replace(/~~(.*?)~~/g, '<DEL>$1</DEL>')
            .replace(/~(.*?)~/g, '<U>$1</U>')
            .replace(/\^\^(.*?)\^\^/g, '<MARK>$1</MARK>')
            // .replace(/\n</gs, '<')
            // .replace(/>\n/gs, '>')
          , '', '')
        }

        let identList = [];
        let html = [];
        function istr(ident) {
          return '                '.slice(0,ident);
        }
        s = !s ? '' : s
        .replace(/\r/gs ,'')
        .split(/\n/)
        .map((s,i,arr) => {
          let pre = '';
          if (s || i === arr.length - 1 ) {
            const lineIdent = (s.match(/^ +/)||[''])[0].length;
            const match = s.trim().match(/^(\*|-|\d+\.) /);
            (function setIdent() {
              let identOptions = identList[0];
              if (identOptions) {
                if (lineIdent < identOptions.ident || (lineIdent === identOptions.ident && !match)) {
                  pre += `</li></${identOptions.tag}>\n`;
                  identList.shift();
                  setIdent();
                } else if (identOptions.ident === lineIdent) {
                  pre += '</li>\n';
                }
              }
              if (match) {
                if (!identOptions || identOptions.ident < lineIdent) {
                  identOptions = {ident: lineIdent, tag: s.trim().match(/^(\*|-) /) ? 'ul' : 'ol'};
                  identList.unshift(identOptions);
                  pre += `<${identOptions.tag}>\n`;
                }
              }
            })();
            s = s.replace(/^\s*(\*|-|\d+\.) /, '<li>');
          }
          // console.log(pre + s);
          return pre + s;
        })
        .join('\n')
        .replace(/:::(\w+)(.*?):::/gs, '<$1$2></$1>')
        .replace(/(.*?)(```(.*?)\n(.*?)```|$)/gs, (s,md,s2,type,codeString) => {
          s = mdToHtml(md);
          if (codeString) {
            codeString = this.code(codeString);
            if (type) {
              typeToLowerCase = type.toLowerCase();
              // console.error(7777, typeToLowerCase);
              codeString = $.string[typeToLowerCase] ? $.string[typeToLowerCase](codeString) : codeString;
              s += `<div class="code-header row" ln="${type}"><span class="aco">${type}</span></div>`;
            }
            s += `<div class="code ${type ? type : ''}">${codeString}</div>`;
          }
          return s;
        })
        // console.log(s);
        return s;
      },
      isImg(src) {
        return src.match(/jpg|png|bmp|jpeg|gif|bin/i)
      },
      isImgSrc(src) {
        if (src) for (var i = 0, ext; ext = ['.jpg', '.png', '.bmp', '.jpeg', '.gif', '.bin'][i]; i++) if (src.toLowerCase().indexOf(ext) != -1) return true;
        return false;
      },
    },
  });
  if (!window.document) {
    require("./node.js");
    setTimeout(async e => await $().emit('load') && await $().emit('ready'));
    return module.exports = $;
  }

  const currentScript = document.currentScript;
  [...currentScript.attributes].forEach(attribute => $.extend({config: minimist(['--'+attribute.name.replace(/^--/, ''), attribute.value])}));
  (new URLSearchParams(document.location.search)).forEach((value,key)=>$.extend({config: minimist([key,value])}));

})();
