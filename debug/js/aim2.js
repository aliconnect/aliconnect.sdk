eol = '\n';
// console.log('sdk 0.0.1')
// version 0.0.1

function validSchemaName(schemaName){
  if (!schemaName) throw 'invalid schemaname';
  // TODO: Location illegal schema name
  return String(schemaName)
  .replace(/^\d|\.|\s|-|\(|\)|,/g,'')
  .replace(/\bLocation\b/,'Loc')
}
function urlToId(href){
  return btoa(href).replace(/[=]+$/g,'');
}
function idToUrl(id){
  return atob(id);
}



// Version 0.0.6
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['exports'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    // CommonJS
    factory(exports);
  } else {
    // Browser globals
    factory((root.Aim = {}));
  }
}(this, function (exports) {

  const dmsOrigin = 'https://aliconnect.nl';
  let aimClient;
  const dmsUrl = 'https://dms.aliconnect.nl';
  //use b in some fashion.
  // attach properties to the exports object to define
  // the exported module properties.
  const isModule = typeof module === "object" && typeof exports === "object";
  window = isModule ? global : window;
  document = window.document;
  console.msg = console.msg || console.info;
  today = new Date();
  dstart = 0;
  maxdate = 0;
  const meshitems = [];
  const AUTHORIZATION_URL = 'https://login.aliconnect.nl/oauth';
  const AUTHORIZATION_TOKEN_URL = 'https://login.aliconnect.nl/token';
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
    $.url(AUTHORIZATION_URL)
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
  function importScript (src) {
    // console.log('importScript', src);
    // src = new URL(src, document.location).href;
    return $.promise('script', callback => {
      // console.log(2, 'SCRIPT', src);
      function loaded(e) {
        e.target.loading = false;
        for (let [key,value] of Object.entries(e.target)) {
          if (typeof value === 'function') {
            Elem.prototype[key] = value;
          }
        }
        callback();
      }
      for (let script of [...document.getElementsByTagName('SCRIPT')]) {
        if (script.getAttribute('src') === src) {
          // console.log(3, 'SCRIPT', src);
          if (script.loading) {
            // console.log(4, 'SCRIPT', src);
            return $(script).on('load', loaded);
          }
          // console.log(4, 'SCRIPT', src);
          return callback();
        }
      }
      var el = $('script').src(src).parent(document.head).on('load', loaded);
      el.elem.loading = true;
      // console.log('SCRIPT', el);
    });
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
      // xhr.addEventListener('error', e => {
      //   console.error(111, `${xhr.method} ${xhr.src} ${xhr.status} ERROR ${xhr.statusText}`); // responseText is the server
      // });
      // xhr.addEventListener('error', err => {
      //   console.error(99991, err);
      // });
      xhr.addEventListener('load', e => {
        if (xhr.elLoadlog){
          xhr.elLoadlog.appendTag('span', '', new Date().toLocaleString() );
        }
        if (xhr.waitfolder){
          window.collist.setAttribute('wait', Number(window.collist.getAttribute('wait')) - 1);
        }
        e.body = xhr.response;
        if (xhr.getResponseHeader('content-type').includes('application/json')) {
          try {
            e.body = JSON.parse(e.body);
          } catch (err) {
            console.error('JSON error', xhr, xhr.response.substr(0,5000));
          }
        }
        if (xhr.status >= 400) {
          // console.error(`${xhr.method} ${xhr.src} ${xhr.status} (${xhr.statusText})`, e.body); // responseText is the server
          // console.log(xhr);
          const elem = $(document.body).append(
            $('pre').class('message error')
            .text(`${xhr.status} (${xhr.statusText})\n${e.body && e.body.error ? e.body.error.message : ''}\n${this.method.toUpperCase()} ${decodeURI(xhr.request.URL.href)}`)
            .on('click', e => e.target.remove())
          );
          // console.error(xhr.getResponseHeader('content-type'), e.body, e);
          return reject(e);
          // throw 'FOUTJE';
          // reject('STATUS', xhr.status);
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
    if(!(this instanceof Aim)) return new Aim(...arguments);
    // if (!selector) return new $('$');
    if (selector){
      if (window.Item && selector instanceof window.Item){
        return selector;
      }
      this.selector = selector;
    }
    selector = selector || 'Aim';
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
    // } else if (window.Item && selector instanceof Item) {
    //   return selector;
    } else if (typeof Window !== 'undefined' && selector instanceof Window) {
      return this;
    } else if (selector.ID || selector.LinkID || selector.tag) {
      // console.log(selector, selector.ID, selector.LinkID, selector.tag);
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
      console.warn('execUrl', url);
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
      if (url.searchParams.get('l')) {// && url.searchParams.get('l') !== $.url.searchParams.get('l')) {

        var documentUrl = new URL(document.location);
        // url.searchParams.forEach((value, key) => console.log(key, value));
        url.searchParams.forEach((value, key) => documentUrl.searchParams.set(key, value));
        documentUrl.hash = '';
        // window.history.replaceState('page', '', documentUrl.href.replace(/%2F/g, '/'));



        // window.history.replaceState('page', '', url.href.replace(/%2F/g, '/'));
        $.url.searchParams.set('l', url.searchParams.get('l'));
        var refurl = new URL(idToUrl(url.searchParams.get('l')), document.location);
        // console.warn('refurl', refurl.pathname);

        if (refurl.hostname.match(/^dms\./)) {
          refurl.pathname += '/children';
          dmsClient.api(refurl.href)
          .filter('FinishDateTime eq NULL')
          .select($.config.listAttributes)
          .get().then(async body => {
            // console.error(body)
            if (body){
              const items = body.value || body.Children || await body.children;
              $().list(items);
            }
          });
        } else {
          return $('list').load(refurl.href);
        }
      }
      if (url.searchParams.get('v') && url.searchParams.get('v') !== $.url.searchParams.get('v')) {
        $.url.searchParams.set('v', url.searchParams.get('v'));
        if (url.searchParams.get('v')) {
          var refurl = new URL(idToUrl(url.searchParams.get('v')), document.location);
          if (refurl.hostname.match(/^dms\./)) {
            // const client = clients.get(refurl.hostname) || $();
            // aimClient.api(refurl.href).get().then(console.error);
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
        console.log(e.body);

        window.sessionStorage.setItem('post', JSON.stringify($.sessionPost = e.body));
        // return;
        // return console.log('$.sessionPost', $.sessionPost);
        if ($.sessionPost.id_token) {
          localStorage.setItem('id_token', $.sessionPost.id_token);
          $().send({ to: { nonce: $.sessionPost.nonce }, id_token: $.sessionPost.id_token });
        }
        if ($.sessionPost.url) {
          if ($.messageHandler) {
            $.messageHandler.source.postMessage({
              url: $.sessionPost.url,
            }, $.messageHandler.origin);
            window.close();
            return;
          }
          document.location.href = $.sessionPost.url;
        }


        if ($.sessionPost.prompt) prompt = $().prompt($.sessionPost.prompt);
        if ($.sessionPost.msg && prompt && prompt.div) {
          prompt.div.text('').html($.sessionPost.msg);
        }
        if ($.sessionPost.socket_id) {
          return $().send({to:{sid:$.sessionPost.socket_id}, body:$.sessionPost});
        }
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
      }).catch(err => {
        console.error(err, prompt, prompt.div);
        if (err.error && prompt && prompt.div) {
          prompt.div.text('').html(err.error.message);
        }
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
        // console.warn(selector, $.his.elem.statusbar, $.his.elem.statusbar[selector]);
        $.his.elem.statusbar[selector].attr('context', context);
      } else {
        // console.debug(selector, context);
      }
      return this;
    },
    translate(lang) {
      lang = (lang || navigator.language || navigator.userLanguage).split(/-/)[0];
      return this.url(dmsUrl + '/translate').query('lang', lang)
      .get().then(e => $.his.translate = new Map(Object.entries(e.body)));
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
      // console.log('MAXXXX');
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
    // console.warn(1, id_token);
    try {
      const id = this.idToken = JSON.parse(atob((this.id_token = id_token).split('.')[1]));
      aimClient.storage.setItem('aimAccount', JSON.stringify(id));
      // console.warn(2, id);
      this.sub = id.sub;
      this.name = id.name || id.email || id.sub;
      this.username = id.preferred_username || this.name;
      this.accountIdentifier = this.idToken.account_id;
    } catch (err) {
      console.error(err);
    }
  };
  Account.prototype = {
    // getSecret() {
    //   console.log(111111, this.id_token);
    //   return $().url('https://aliconnect.nl/api/').query('request_type', 'account_secret').headers('Authorization', 'Bearer ' + this.id_token).get();
    // },
  }

  function Application () {}
  Application.prototype = {
    // getClient(src) {
    //   src = new URL(src, this.config.url ? this.config.url : document.location).href;
    //   // console.log(src, this.config.url, this.servers.length);
    //   for (let [url, client] of this.servers.entries()) {
    //     if (src.match(url)) return client;
    //   }
    //   return this.clients[0];
    // },
    // constructor() {
    //   console.log('constructor WEB');
    // },
    // test() {
    //   console.log('TEST');
    // },
    api(src) {
      const url = new URL(src, document.location);
      const srcPathname = url.pathname.replace(/\(.*?\)/, '()');
      for (var client of this.clients) {
        // console.error(src, srcPathname, client.apiConfig.paths);
        for (let [pathname,path] of Object.entries(client.apiConfig.paths)) {
          if (pathname.replace(/\(.*?\)/, '()') === srcPathname) {
            return client.api(src);
          }
        }
      }
      return client.api(src);
      // console.error(000, client);
      //
      // return new Promise((callback, fail) => {
      //   fail('NOT FOUND');
      // })
      // console.log(11111, pathname,path);
      //
      // console.error(url.pathname);
      // for (let client of this.clients) {
      //
      //   // console.log(client, client.config.servers);
      //   // client.config.servers = Array.from(client.config.servers);
      //   for (let [i,server] of Object.entries(client.config.servers)) {
      //     // console.log(i,server);
      //     if (src.match(server.url) || !src.match(/^http/)) {
      //       return client.api(src);
      //     }
      //   }
      // }
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
      return Object.fromEntries(
        [
          'accountname',
          'unique_name',
          'prefered_username',
          'name',
          'email',
          'family_name',
          'given_name',
          'middle_name',
          'nickname',
          'phone_number',
        ]
        .filter(name => this.account.idToken[name])
        .map(name => [name,this.account.idToken[name]])
      );
    },
    store(name, value) {
      if (value) {
        this.storage.setItem(`aim.${name}`, value);
        this.storage.setItem(`aim.${this.clientId}.${name}`, value);
      } else {
        this.storage.removeItem(`aim.${name}`);
        this.storage.removeItem(`aim.${this.clientId}.${name}`);
      }
    },
    getAccessToken(options){
      return $.promise('getAccessToken', resolve => {
        if (options){
          $().url(AUTHORIZATION_TOKEN_URL).post(Object.assign({
            grant_type: 'authorization_code',
            // code: options.code, // default, overide by params
            client_id: this.config.auth.client_id,
            // 'client_secret' => $this->client_secret,
            access_type: 'offline', // only if access to client data is needed when user is not logged in
          }, options)).then(e => {
            this.store('id_token', e.body.id_token);
            this.store('access_token', e.body.access_token);
            this.store('refresh_token', e.body.refresh_token);
            this.account = new Account(e.body.id_token);
            resolve(this.access_token);
          })
        } else {
          resolve(this.access_token);
        }
      });
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
              $().url(AUTHORIZATION_URL).headers('Authorization', 'Bearer ' + this.access_token).post({
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
        $.clipboard.reload($().url(AUTHORIZATION_URL).query({
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
      this.refreshTokenHandle = new $.Client('https://login.aliconnect.nl/token/').post({
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
      // console.log(name);
      return this.account;
    },
    acquireTokenSilent(silentRequest) {
      /**
      silentRequest.scopes
      silentRequest.account (aimClient.getAccountByUsername(account))
      */
      return $.promise('acquireTokenSilent', async (resolve, fail) => {
        // check token exppired, if yes get new token.
        // console.log(this);
        resolve({
          accessToken: this.storage.getItem(`aim.${this.clientId}.access_token`),
        });
      })
    },
    acquireTokenPopup(aimRequest) {
      return this.loginPopup(aimRequest);
    },
  }

  Aim.UserAgentApplication = function UserAgentApplication(config = {}) {
    // if (!config.client_id) throw 'Missing client_id';
    // console.log('WEB CONSTRUCTOR');
    aimClient = this;
    $.extend($.config, config);
    config = this.config = $.config;
    this.clients = [];
    this.servers = new Map;
    this.storage = window[config.cache.cacheLocation];

    // this.storage.clear();

    this.clientId = config.auth.client_id = config.client_id || config.auth.client_id;
    // config.auth.scopes = config.scope.split(' ');

    // this.clientSecret = config.client_secret = this.storage.getItem('client_secret');


    if (this.storage.getItem('aim.id_token')) {
      this.account = new Account(this.storage.getItem('aim.id_token'));
      // console.log(111, this.account);
    }
    if (this.storage.getItem('aim.access_token')) {
      // console.log(this.storage.getItem('access_token'));
    }
    const url = new URL(document.location);

    if (url.searchParams.has('token')) {
      this.store('access_token', url.searchParams.get('token'));
      url.searchParams.delete('token');
      url.searchParams.delete('state');
      window.history.replaceState('page', '', url.href);
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
  };
  Object.defineProperties(Aim.UserAgentApplication.prototype = new Application, {
    init: {
      value: async function init () {
        // console.log('INIT');
        const url = new URL(document.location);
        if (url.searchParams.has('code')){
          // return console.error(url.searchParams.get('code'));
          await this.getAccessToken({code: url.searchParams.get('code')}).then(e => {
            url.searchParams.delete('code');
            url.searchParams.delete('state');
            window.history.replaceState('page', '', url.href);
            // document.location.href = url.href;
          });
          // throw "Sign in processed. Please wait";
        }
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
    },
    loginPopup: {
      value: function loginPopup (options) {
        return $.promise('LoginPopup', async (resolve, fail) => {

          console.log('options', options);

          options = {
            // scope: 'name+email+phone_number',
            response_type: 'code',
            response_type: 'token',
            client_id: this.config.auth.client_id = this.config.auth.client_id || this.config.auth.clientId,
            // redirect_uri: this.config.auth.redirect_uri = this.config.auth.redirect_uri || this.config.auth.redirectUri || this.config.redirect_uri || this.config.redirectUri,
            // state: state,
            prompt: 'consent',
            scope: options.scope || options.scopes.join(' ') || '',
            // socket_id: $.WebsocketClient.socket_id,
          }
          const url = $().url(AUTHORIZATION_URL).query(options).toString();
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
          if (!$.loginPopupMessageListener) {
            $.loginPopupMessageListener = 1;
            window.addEventListener("message", (event) => {
              console.log(event.origin, event);
              if (event.data.msg === 'loginPopupAck') {
                clearInterval(interval);
              }
              if (event.data.url) {
                const url = new URL(event.data.url, document.location);
                if (url.searchParams.has('token')) {
                  const access_token = url.searchParams.get('token');
                  this.store('access_token', access_token);
                  const access = JSON.parse(atob((access_token).split('.')[1]));
                  $().url('https://login.aliconnect.nl/token')
                  .query('client_id', this.config.auth.client_id)
                  .query('response_type', 'id_token')
                  .headers('Authorization', 'Bearer ' + access_token)
                  .get().then(e => {
                    this.store('id_token', e.body.id_token);
                    this.account = new Account(e.body.id_token);
                    // console.error(e.body);
                  })
                  console.error(1212121, access);
                } else if (url.searchParams.has('code')) {
                  this.getAccessToken({
                    code: url.searchParams.get('code')
                  }).then(e => {
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
              }

              // Do we trust the sender of this message?  (might be
              // different from what we originally opened, for example).
              // if (event.origin !== "http://example.com")
              //   return;

              // event.source is popup
              // event.data is "hi there yourself!  the secret response is: rheeeeet!"
            }, false);
          }
          // win.onbeforeunload = e => resolve();
        });
        // this.authProvider.login(this.config.auth);
      },
    },
    // getAccount: {
    //   value: function () {
    //     return JSON.parse(this.storage.getItem('aimAccount'));
    //   }
    // }
  });

  Aim.NodeApplication = function UserAgentApplication(config) {
    console.log('NodeApplication', config);
    console.debug('NODE SRC');

    setTitle = function (title) {
    	console.log(process.title = [...arguments].filter(Boolean).join(' '));
    };
    fs = require('fs');
    WebSocket = require('ws');
    atob = require('atob');
    // btoa = require('btoa');
    crypto = require('crypto');

    Object.assign (console, {
    	color : {
    		black: "\x1b[30m",
    		red: "\x1b[31m",
    		green: "\x1b[32m",
    		yellow: "\x1b[33m",
    		blue: "\x1b[34m",
    		magenta: "\x1b[35m",
    		steelblue: "\x1b[36m",
    		white: "\x1b[37m",
    		debug: "\x1b[33m",
    		error: "\x1b[31m",
    	},
    	bgColor : {
    		black: "\x1b[40m",
    		red: "\x1b[41m",
    		green: "\x1b[42m",
    		yellow: "\x1b[43m",
    		blue: "\x1b[44m",
    		magenta: "\x1b[45m",
    		steelblue: "\x1b[46m",
    		white: "\x1b[47m",
    		debug: "\x1b[40m",
    		error: "\x1b[47m",
    	},
    	code : {
    		reset: "\x1b[0m",
    		bright: "\x1b[1m",
    		dim: "\x1b[2m",
    		underscore: "\x1b[4m",
    		blink: "\x1b[5m",
    		reverse: "\x1b[7m",
    		hidden: "\x1b[8m",
    	},
    });
    ['debug'].forEach(name => {
    	console[name] = function () {
    		// console.log('DEBUG', Aim.config.debug);
    		// if (Aim.config && !Aim.config.debug) return;
    		var args = [...arguments];//, sCode = '', color = '', bgColor = '';
    		// console.log('DEBUG', Aim.config.debug, args);
    		//if (args[0] && colors[args[0]]) sCode += colors[color = args.shift()];
    		//if (args[0] && bgColors[args[0]]) sCode += bgColors[bgColor = args.shift()];
    		args = args.filter(val => val != null);
    		// args = args.map(val => val instanceof Object ? Aim.stringify(val).substr(0,1000): val);
    		var initiator = 'unknown place';
    		try { throw new Error(); }
    		catch (event) {
    			if (typeof event.stack === 'string') {
    				let isFirst = true;
    				for (var line of event.stack.split('\n')) {
    					const matches = line.match(/^\s+at\s+(.*)/);
    					if (matches) {
    						if (!isFirst) { // first line - current function
    							// second line - caller (what we are looking for)
    							initiator = matches[1];
    							break;
    						}
    						isFirst = false;
    					}
    				}
    			}
    		}
    		initiator = initiator.split('\\').pop().split('/').pop().split(':').slice(0, 2).join(':').replace('.js', '').padEnd(12, ' ');
    		process.stdout.write(console.bgColor[name] + console.color[name]);
    		console.log.apply(console, [initiator, ...args]);
    		process.stdout.write(console.code.reset);
    	};
    });

    console.msg = function(msg) {
    	var args = [...arguments];
    	var args = [].concat(args.shift().padEnd(16) + '\x1b[36m', ...args, '\x1b[0m');
    	console.log.apply(this, [...args]);
    }
    hasKey = function (obj, keys) {
    	var o = obj;
    	keys.slice(0, -1).forEach(function (key) {
    		o = (o[key] || {});
    	});
    	var key = keys[keys.length - 1];
    	return key in o;
    };
    isNumber = function (x) {
    	if (typeof x === 'number') return true;
    	if (/^0x[0-9a-f]+$/i.test(x)) return true;
    	return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(event[-+]?\d+)?$/.test(x);
    };
    bitTo = function (typename, s) {
    	var s = s.match(/.{1,16}/g).reverse().join('');
    	var type = types[typename], arr = s.replace(/ /g, '').split(''), sign = type.signed ? (Number(arr.shift()) ? -1 : 1) : 1;
    	if (!type.exponent) return parseInt(arr.join(''), 2) * sign;
    	var mantissa = 0, exponent = parseInt(exp = arr.splice(0, type.exponent).join(''), 2) - (Math.pow(2, type.exponent - 1) - 1);
    	arr.unshift(1);
    	arr.forEach(function (val, i) { if (Number(val)) mantissa += Math.pow(2, -i); });
    	return sign * mantissa * Math.pow(2, exponent);
    };
    strToOid = function (oid) {
    	oid = oid.split(".");
    	oid.forEach(function (nr, i) { oid[i] = Number(nr); });
    	return oid;
    };
    writeCommand = function (cmd, path) {
    	var buffer = new Buffer(cmd + "\n");
    	//// console.log('MKA', cmd , path);
    	var fd = fs.open(path, "w", undefined, function (err, fd) {
    		if (err)
    			console.debug("Error opening file: " + err);
    		else {
    			fs.write(fd, buffer, 0, buffer.length, -1, function (error, written, buffer) {
    				//return;
    				if (error)
    					console.error("Error occured writing to " + path + ": " + error);
    				else
    					fs.close(fd, function (err) { });
    			});
    		}
    	});
    }

    for (var topparent = module; topparent.parent; topparent = topparent.parent);
    approot = topparent.filename.replace(/\\/g,'/').split('/');
    approot.pop();
    approot = approot.join('/');
    projectroot = process.cwd();



    // console.log(approot, projectroot,__dirname, search_dirnames, module.paths, process.mainModule.filename
    // console.log(
    //   module.paths.map(fname => fname.replace(/node_modules$/,'public'))
    //   .concat(module.paths.map(fname => fname.replace(/node_modules$/,'webroot')))
    //   .concat(process.mainModule.paths.map(fname => fname.replace(/node_modules$/,'public')))
    //   .concat(process.mainModule.paths.map(fname => fname.replace(/node_modules$/,'webroot')))
    //   .filter(fname => fs.existsSync(fname)),
    //   // process.mainModule.paths
    // );



    // const search_dirnames = this.search_dirnames = [
    //   __dirname,
    //   projectroot,
    //   approot + '/webroot',
    //   approot + '/public',
    //   // approot,
    //   // __dirname + '/..',
    //   // __dirname + '/../..',
    //   // __dirname + '/../../..',
    //   // __dirname + '/../../../..',
    //   // __dirname + '/../../../../..',
    //   projectroot + '/webroot',
    //   projectroot + '/public',
    //   // projectroot,
    //   // projectroot + '/..',
    //   // projectroot + '/../..',
    //   // projectroot + '/../../..',
    //   // approot,
    //   // approot + '/..',
    //   // approot + '/../..',
    //   // approot + '/../../..',
    //   approot + '/node_modules/@aliconnect',
    // ]
    // .map(
    //   path => path
    //   .replace(/\\/g,'/')
    //   // .replace(/\/(public|webroot).*/g,''))
    //   // .map(path => [
    //   //   path + '/webroot',
    //   //   path + '/public',
    //   //   // path + '/node_modules',
    //   // ])
    // )
    // .filter(fname => fs.existsSync(fname))
    // .unique();

    // console.log(search_dirnames, module.paths);

    const virtual_maps = new Map();
    virtual_maps.set ('sdk', __dirname.replace(/\\public\\.*/,''));
    console.log(virtual_maps);

    this.addVirtualMap = (name, path) => {
      virtual_maps.set(name, path);
      console.log(virtual_maps);
    };

    function getFileExists(basename) {
      return search_dirnames
      .map(path => path + basename)
      // .map(path => { console.log(path); return path; }) // DEBUG:
      .find(fname => !console.log(fname) && fs.existsSync(fname) && (fileExists = fs.statSync(fname).isFile()))
    };
    function requireExists(basename) {
    	var filename = getFileExists(basename);
    	return filename ? require(filename) : {};
    };
    function parseCookies(request) {
    	var list = {},
    	rc = request.headers.cookie;

    	rc && rc.split(';').forEach(function (cookie) {
    		var parts = cookie.split('=');
    		list[parts.shift().trim()] = decodeURI(parts.join('='));
    	});

    	return list;
    };
    function createMachine(stateMachineDefinition) {
      Object.assign(this,stateMachineDefinition);
      // this.stateMachineDefinition = stateMachineDefinition;
      this.transition = (destinationState) => {
        // console.debug('switch state from',this.value,'to',destinationState)
        this.destinationState = destinationState;
        const currentStateDefinition = this[this.value];
        const destinationTransition = currentStateDefinition[destinationState];
        if (destinationTransition) {
          if (typeof destinationTransition === 'string') eval(destinationTransition);
          else destinationTransition.call(this);
        }
        // const destinationState = event//destinationTransition.target
        const destinationStateDefinition = this[destinationState];
        if (currentStateDefinition.onExit) {
          if (typeof currentStateDefinition.onExit === 'string') eval(currentStateDefinition.onExit);
          else currentStateDefinition.onExit.call(this);
        }
        if (destinationStateDefinition.onEnter) {
          if (typeof destinationStateDefinition.onEnter === 'string') eval(destinationStateDefinition.onEnter);
          else destinationStateDefinition.onEnter.call(this);
        }
        this.value = destinationState
        // // console.debug('switch state DONE',this.value)
        return this.value;
      }
      this.value =  stateMachineDefinition.initialState
      const currentStateDefinition = this[this.value];
      if (currentStateDefinition) {
        if (typeof currentStateDefinition.onEnter === 'string') eval(currentStateDefinition.onEnter);
        else currentStateDefinition.onEnter.call(this);
      }
    };
    function isFile(fname) {
      return fs.existsSync(fname) && fs.statSync(fname).isFile();
    }
    function getData(fname) {
      return isFile(fname) ? require(fname) : {}
    }

    aimconfig = {};
    [
      { info:package = getData(approot + '/package.json')},
      getData(approot + '/config.json'),
      getData(projectroot + '/config.json'),
      getData(projectroot + '/secret.json'),
      config,
      minimist(process.argv.slice(2)),
    ].forEach(config => $.extend(aimconfig, config));
    $().extend(aimconfig);
    config = $().config;
    // console.debug(config);

    // [
    //   { info:package = getData(approot + '/package.json')},
    //   getData(approot + '/config.json'),
    //   getData(projectroot + '/config.json'),
    //   getData(projectroot + '/secret.json'),
    //   minimist(process.argv.slice(2)),
    // ].forEach(data => $().extend(data))

    // console.debug($());process.exit();
    // console.log(projectroot, approot, require(projectroot + '/config.json'));



    function executeStatement(query, callback) {
    	if (!config.dbs) return callback ? callback([]) : null;
    	// console.log(config.dbs);
    	Aim.sqlBuffer = Aim.sqlBuffer || [];
    	if (query) {
    		Aim.sqlBuffer.push(query);
    	}
    	if (!Aim.sqlConnection) {
    		Aim.sqlIsBusy = true;
    		navigator = {};
    		const options = {
    			port: config.dbs.port || 1433,
    			server: config.dbs.server,
    			options: {
    				database: config.dbs.database,
    				encrypt: true,
    				validateBulkLoadParameters: true,
    				trustServerCertificate: true,
    				cryptoCredentialsDetails: {
    					minVersion: 'TLSv1'
    				}
    			},
    			authentication: {
    				type: 'default',
    				options: {
    					userName: config.dbs.user,
    					password: config.dbs.password,
    				}
    			},
    		};
    		Aim.sql = require('tedious');
    		Aim.sqlConnection = new Aim.sql.Connection(options);
    		Aim.sqlConnection.on('connect', err => {
    			if (err) {
    	      return console.log('Error: ', err)
    	    }
    			console.msg('SQL',"Connected");
    			Aim.sqlIsBusy = false;
    			executeStatement(...arguments);
    		});
    		Aim.sqlConnection.connect();
    		return;
    	}
    	if (Aim.sqlIsBusy) {
    		return;
    	}
    	clearTimeout(Aim.sqlTimeout);
    	Aim.sqlTimeout = setTimeout(event => {
    		if (Aim.sqlBuffer.length) {
    			Aim.sqlIsBusy = true;
    			const sqlQuery = Aim.sqlBuffer.join('\n');
    			Aim.sqlBuffer = [];
    			const rows = [];
    			console.log(sqlQuery);
    			const request = new Aim.sql.Request(sqlQuery, err => {
    				if (err) {
    					console.error(err);
    				} else if (callback) {
    					callback(rows);
    				}
    				Aim.sqlIsBusy = false;
    				executeStatement();
    			});
    			request.on('row', columns => {
    				const row = {};
    				columns.forEach(column => row[column.metadata.colName] = column.value);
    				rows.push(row);
    			});
    			Aim.sqlConnection.execSql(request);
    		}
    	});
    }

    const networkInterfaces = require('os').networkInterfaces();
    const mac_addresses = {};
    const ip_addresses = [];
    const isIp = s => s.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/);
    const isMac = s => s.match(/[\w][\w]:[\w][\w]:[\w][\w]:[\w][\w]:[\w][\w]:[\w][\w]/);
    Object.values(networkInterfaces).forEach(int => {
    	int.forEach(conn => {
    		if (conn.mac && isMac(conn.mac) && conn.mac !== '00:00:00:00:00:00' && isIp(conn.address)) {
    			ip_addresses.push(conn.address);
    			mac_addresses[conn.mac] = conn.address;
    		}
    	});
    });

    // console.log(approot, projectroot);
    console.log(aimconfig);

    function httpServerRequest (req, res) {
    	res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
    	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
      res.setHeader('Access-Control-Request-Method', '*');
    	// const pathname = new URL(req.url, 'https://aliconnect.nl').pathname.replace(/npm/, 'node_modules');


      const cookies = parseCookies(req);
      body = '';
    	req.on('data', chunk => body += chunk.toString());


      var fname = new URL(req.url, 'https://aliconnect.nl').pathname
      .replace(
        /\/dist\//,'/'
      );

      virtual_maps.forEach((value, key) => {
        fname = fname.replace(new RegExp(`^\/${key}\/`), `${value}/`);
      });

      fname = fname.replace(
        /^\//,
        process.cwd() + '/public/'
      );

      // console.log(1, req.url, fname);

      function end(statusCode, header, body) {
        res.writeHead(res.statusCode = statusCode, header);
        res.end(body);
      }

      if (fname = [
        '',
        '.html',
        'index.html',
        'index.htm',
        'README.md'
      ]
      .map(name => fname + name)
      .find(fname => fs.existsSync(fname) && fs.statSync(fname).isFile())) {
        // console.log(fname);
        return fs.readFile(fname, (err, data) => {
          if (err) {
            return end(404, { 'Content-Type': 'text/html' }, `404 Not Found 1 ${req.url}`);
          }
          var ext = fname.split('.').pop()
          // if (ext == 'md') {
          // 	data = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><link rel="stylesheet" href="/css/theme/aliconnect.css" /><link rel="stylesheet" href="/css/document.css" /><div class="doc-content">' + converter.makeHtml(String(data)) + '</div>';
          // 	ext = 'html';
          // }
          if (config.access_token && config.id_token ) {
            end(200, {
              'Set-Cookie': 'access_token=' + config.access_token + '; id_token=' + config.id_token,
              'Content-Type': ext == 'json' ? 'application/json' : 'text/' + ext
            });
          }
          const headers = {
            json: {
              'Content-Type': 'application/json',
              'OData-Version': '4.0',
            },
            js: {
              'Content-Type': 'text/javascript',
              'Service-Worker-Allowed': '/',
            },
            css: {
              'Content-Type': 'text/css',
              'Service-Worker-Allowed': '/',
            },
            html: {
              'Content-Type': 'text/html',
              'Service-Worker-Allowed': '/',
            },
          };
          if (ext === 'html') {
            // console.log(data.toString());
            // data = data.toString().replace(/github.io/gs, '');
            data = data.toString()
            // .replace(/"\/\/.*?\//gs, '"/')
            // .replace(/".*?(npm\/.*?)@\d.*?\//g, '"$1/')
            .replace(/"\/\/(npm.aliconnect.nl\/sdk@\d+\.\d+\.\d+|aliconnect.github.io\/sdk\/dist)/g, '"/sdk')
          }
          end(200, headers[ext], data);
        });
      } else {
        end(404, { 'Content-Type': 'text/html' }, `404 Not Found 2 ${req.url}`);
      }
      return;

    	if (!filename) {
    		if (req.url === ('/data.json')) {
          const data = { config: {Aim: {headers: config.headers }}};
          console.log(data);
          [
            { info:package = getData(approot + '/package.json')},
            getData(approot + '/config.json'),
            getData(approot + '/webroot/config.json'),
            getData(projectroot + '/config.json'),
            // require(data_filename),
          ].forEach(options => $(data).extend(options))
          // if (data.value) {
          // 	data.value.forEach(item => Object.assign(item, Aim.find(item.ID).values));
          // }
          // console.log(data.config);

    			const content = JSON.stringifyReplacer({
            info: data.info,
            components: data.components,
            value: data.value,
          });
          // console.log(config);
    			return req.on('end', () => {
    				res.writeHead(200, { 'Content-Type': 'application/json' });
    				res.write(content);
    				return res.end();
    			})
    		}

    		res.setHeader('OData-Version', '4.0');
    		if (root !== 'api') {
    			res.statusCode = 404;
    			res.writeHead(404, { 'Content-Type': 'text/html' });
    			return res.end("404 Not Found: " + req.url);
    		}
    		return req.on('end', () => {
    			req.search = req.url.split('?')[1];
    			req.search = !req.search ? {} : Object.assign.apply(Object, req.search.split('&').map(val => {
    				val = val.split('='); return {
    					[val.shift()]: val.shift()
    				};
    			}));



    			// if (req.search.code) return Aim.getTokenFromAuthCode(req.search.code, res);
    			try {
    				req.url = req.url.split('?').shift().replace('/api', '');
    				if (req.url === '/js/config') {
    					res.writeHead(200, { 'Content-Type': 'text/javascript' });
    					fs.readFile(config_filename, function read(err, data) {
    						if (err) {
    							throw err;
    						}
    						res.write(`Aim=${data};`);
    						return res.end();
    					});
    					return;
    				} else {
    					// return // console.debug('DEBUG', req.url);
    					var result = Aim.request({ path: req.url, method: req.method, headers: req.headers, body: body }, res);
    					if (!result) {
    						res.statusCode = 202; // no content
    					} else {
    						res.writeHead(result ? 200 : 202, { 'Content-Type': 'application/json' });
    						res.write(JSON.stringify(result));
    					}
    				}
    			} catch (err) {
    				// console.debug('ERROR', err);
    				//res.statusCode = err;
    			}
    			return res.end();
    		});
    	}
    }

    // return module.exports = Aim;

    $.saveRequests = function (param) {
    	// console.debug('SAFE ITEMS TO SQL', param);
    	param.forEach(row => {
    		for (let [attributeName, attribute] of Object.entries(row.body)) {
    			if (Aim.has(row.ID)) {
            const item = Aim.get(row.ID);
    				item.data[attributeName] = Object.assign(item.data[attributeName] || {}, attribute);
    			}
    			var param = [ `itemID=${row.ID}`, `name='${attributeName}'` ];
    			for (let [key, value] of Object.entries(attribute)) {
    				param.push (key + '=' + (value === null || value === '' ? 'NULL' : `'${value}'` ) );
    			}
    			// sqlArray.push('EXEC item.setAttribute @' + param.join(',@'));
    			const sql = 'EXEC item.attr @' + param.join(',@');
    			Aim.log(sql);
    			executeStatement(sql);
    		}
    	});
    }
    $().on('load', async event => {

      // console.log('LOAD', $().authProvider());

      // await $().login();
      // $().client({
      //   servers: [
      //     {
      //       url: 'https://rws-tms.aliconnect.nl/api',
      //     },
      //   ]
      // });

      // const sub = $().authProvider().sub;
      // process.exit();
      // console.debug($().authProvider());
      // return;
      // data_filename = projectroot + `/data_${sub}.json`;

      // dataJsFilename = projectroot + `/webroot/data.js`;
      // if (0 && isFile(dataJsFilename)) {
      //   $.log('REQUIRE', dataJsFilename);
      //   // require(projectroot + `/webroot/data1.js`);
      //   require(dataJsFilename);
      // } else {
      //   console.log('LOAD1', sub);
      //   $.log('GET', dataJsFilename)
      //   await $()
      //   .api('/')
      //   .query('request_type', 'build_node_data')
      //   // .patch({mac: mac_addresses})
      //   .get()
      //   .then(event => {
      //     // return console.debug(event.target.responseText.substr(0,1000));
      //     if (event.body) {
      //       // $().extend(event.body)
      //       fs.writeFile(dataJsFilename, `$().body=${event.target.responseText}`, err => {
      //         if (err) throw err;
      //         console.msg('SAVED', dataJsFilename);
      //       });
      //
      //       data = JSON.parse(event.target.responseText);
      //       data = {
      //         info: data.info,
      //         components: data.components,
      //         value: data.value,
      //       }
      //
      //
      //       // fs.writeFile(data_filename, event.target.responseText, err => {
      //       //   if (err) throw err;
      //       //   console.msg('SAVED', data_filename);
      //       // });
      //       // if (!isFile(dataJsFilename)) {
      //       //   fs.writeFile(projectroot + `/webroot/data.js`, `$().extend(${JSON.stringify(data,null,2)})`, err => {
      //       //     if (err) throw err;
      //       //     console.msg('SAVED', dataJsFilename);
      //       //   });
      //       // }
      //     }
      //   });
      // }
    })
    .on('connect', event => {
      console.log('CONNECT');
      // Aim.WebsocketClient.login();
      $().emit('init');
    })
    .on('ready', event => {
      console.log('READY', config)
    	if (config.http) {
    		if (config.http.cert && fs.existsSync(process.cwd() + config.http.key)) {
    			HttpServer = require('https').createServer({
    				key: fs.readFileSync(process.cwd() + config.http.key),
    				cert: fs.readFileSync(process.cwd() + config.http.cert),
    				ca: config.http.ca ? fs.readFileSync(process.cwd() + config.http.ca) : null,
    			}, httpServerRequest);
    		} else {
    			HttpServer = require('http').createServer(httpServerRequest);
    		}
    		HttpServer.listen(config.http.port);
    		Aim.server = new WebSocket
        .Server({ server: HttpServer })
        .on('connection', (wsc, req) => {
    			wsc.remoteAddress = req.connection.remoteAddress.split(':').pop();
    			wsc.sid = Crypto.btoaToJson(req.headers['sec-websocket-key']);
    			wsc.access = {sid: wsc.sid};
    			console.msg('CONNECTION', wsc.sid, wsc.remoteAddress);
    			wsc.on('close', connection => {
    				if (wsc.access) {
              const message = JSON.stringify({from_id: wsc.sid, state: 'disconnect'});
    					[...Aim.server.clients]
              .filter(ws => ws !== wsc && ws.access && (ws.access.sub === wsc.access.sub || ws.access.aud === wsc.access.aud || ws.access.nonce === wsc.access.nonce))
              .forEach(ws => ws.send(message));
    				}
    				console.msg('DISCONNECT', wsc.sid, wsc.remoteAddress, wsc.access.sub);
    				// console.debug(userConnected);

    				// Aim.server.clients.forEach(wsChild => {
    				// 	console.msg('DISCONNECT CHILDS', wsChild.sid);
    				// });
    				// Aim.server.clients.splice(Aim.server.clients.indexOf(wsc), 1);
    			});
    			wsc.onmessage = event => {
    				// if (!event.data) return;
    				// let data = event.data;
    				// console.log(event.data, JSON.parse(data));
    				// let data;
    				try {
    					// console.debug('ONMESSAGE', String(event.data));
    					data = wsc.response = JSON.parse(event.data);
    				} catch (err) {
    					console.error('json_error', event.data.substr(0,1000));
    				}
    				if (!data) {
    					console.error('no data');
              return;
    				} else if (typeof data !== 'object') {
              console.error('data is not object', data);
              return;
            }
            console.log(wsc.sid);
    				if ('userstate' in data) {
    					const states = [
    						'unknown',
    						'offline',
    						'blocked',
    						'busy_inactive',
    						'inactive',
    						'appear_away',
    						'urgentonly',
    						'donotdisturb',
    						'busy',
    						'available',
    					];
    					const userstate = states.indexOf(data.userstate);
    					var clients = [...Aim.server.clients].filter(ws => ws.access && ws.access.aud === wsc.access.aud);
    					var subclients = clients.filter(ws => ws.access.sub === wsc.access.sub);
    					const currentState = Math.max(...subclients.map(ws => ws.userstate || 0));
    					wsc.userstate = userstate;
    					// var sub = wsc.access.sub;
    					const newState = Math.max(...subclients.map(ws => ws.userstate || 0));
    					if (currentState !== newState) {
    						console.log('state set', data.userstate, currentState, newState, subclients.map(ws => ws.userstate));
    						data.userstate = states[newState];
    						event.data = JSON.stringify(data);
    						clients.forEach(ws => ws.send(event.data));
    					}


    					// if (subclients.every(ws => ws.userstate < userstate)) {
    					// 	console.log('newstate', userstate, data.userstate);
    					// 	var clients = [...Aim.server.clients].filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud);
    					// 	clients.forEach(ws => ws.send(event.data));
    					// }


    					// if (!subclients.some(ws => ws.userstate > userstate)) {
    					// 	console.log('newstate', userstate, data.userstate);
    					// 	var clients = [...Aim.server.clients].filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud);
    					// 	clients.forEach(ws => ws.send(event.data));
    					// }
    					// if (!subclients.some(ws => ws.userstate < userstate)) {
    					// 	console.log('newstate some');
    					// 	var clients = [...Aim.server.clients].filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud && ws.userstate);
    					// 	clients.forEach(ws => ws.send(event.data));
    					// }

    					// var a = subclients.map(ws => ws.userstate);
    					// console.debug(data.userstate);
    					// console.log(subclients.filter(ws => ws.userstate === data.userstate).map(ws => ws.userstate));
    					// console.log(data.userstate, a, a.every(userstate => userstate == data.userstate));
    					// console.log(['ja','ja','ja','ja'].every(ws => ws === 'ja'));

    					// if (data.userstate === 'available' && !subclients.some(ws => ws.userstate === data.userstate)) {
    					// 	clients.forEach(ws => ws.send(event.data));
    					// 	console.debug('send', data.userstate);
    					// }
    					// wsc.userstate = data.userstate;
    					// if (data.userstate === 'inactive' && subclients.every(ws => ws.userstate === data.userstate)) {
    					// 	clients.forEach(ws => ws.send(event.data));
    					// 	console.debug('send', data.userstate);
    					// }


    					// if (data.userstate === 'available' && !subclients.some(ws => ws.userstate === data.userstate)) {
    					// 	clients.forEach(ws => ws.send(event.data));
    					// 	console.debug('send', data.userstate);
    					// }
    					// wsc.userstate = data.userstate;
    					// if (data.userstate === 'inactive' && subclients.every(ws => ws.userstate === data.userstate)) {
    					// 	clients.forEach(ws => ws.send(event.data));
    					// 	console.debug('send', data.userstate);
    					// }
    					return;

    					// console.debug([...Aim.server.clients].map(ws => ws.access));

    					// console.debug('userstate',data,clients,sub);
    				}


    				if (data.itemsModified) {
    					// console.log('response.itemsModified FROM CLIENT');
    					if (data.body && data.body.requests) {
    						Aim.saveRequests(data.body.requests);
    					}
    					if (Aim.ws) {
    						Aim.ws.send(event.data);
    					}
    				}

    				if (data.forward && Aim.WebsocketClient && Aim.WebsocketClient.conn) {
    					// console.debug('FORWARD TO SERVER', response.forward, Aim.WebsocketClient.socket_id);
    					Aim.WebsocketClient.conn.send(event.data);
    					// Aim.server.forward(response, responseText, Aim.WebsocketClient.conn);
    				}


    				// CHAT ROOM
    				if (data.message_type) {
    					var { message_type, content, to } = data;
    					if (message_type === 'OPTIONS') {
    						wsc.options = content;
    						// return;
    					}
    					data.from = wsc.sid;
    					data.options = wsc.options;
    					let message = JSON.stringify(data);
    					if (to) {
    						var clients = [...Aim.server.clients]
    						.filter(ws => ws.options && ws.options.wall === wsc.options.wall && wsc !== ws && ws.readyState && ws.sid === to);
    					} else {
    						var clients = [...Aim.server.clients]
    						.filter(ws => ws.options && ws.options.wall === wsc.options.wall && wsc !== ws && ws.readyState && ws.sid);
    					}
    					clients.forEach(ws => {
    						console.msg('SEND', message_type, ws.sid);
    						ws.send(message);
    					});
    					return;
    				}

    				// console.debug('server ws client');
    				// Aim.onmessage.call(wsc, event);

    				if (this.response) {
    					try {
    						data = this.response = JSON.parse(this.responseText);
    					} catch (err) {
    						console.error('json_error', String(this.responseText).substr(0,1000));
    					}
    				}

    				if (wsc.response.headers) {
    					wsc.headers = wsc.response.headers;
    					// console.debug('wsc.headers', wsc.headers);
    					// this.hostname = this.response.hostname;
    					let apiKey = Object.keys(wsc.headers).find(key => ['api_key','api-key','x-api-key'].includes(key.toLowerCase()));
    					let accessToken;
    					if (apiKey) {
    						accessToken = wsc.headers[apiKey];
    					} else {
    						let authorizationKey = Object.keys(wsc.headers).find(key => ['authorization'].includes(key.toLowerCase()));
    						if (authorizationKey) {
    							accessToken = wsc.headers[authorizationKey].split(' ')[1];
    						}
    					}
    					if (accessToken) {
    						let accessTokenArray = accessToken.split('.');
    						try {
    							var data = wsc.response = JSON.parse(event.data);
    						} catch (err) {
    							throw 'json_error';
    						}
                try {
                  let payload = wsc.access = JSON.parse(atob(accessTokenArray[1]));
      						let domainName = payload.iss.split('.').shift();
      						$().url('https://' + payload.iss + '/api/').query({
      							request_type:'check_access_token',
      							headers: {
      								Authorization: 'Bearer ' + accessToken,
      							},
      						}).get().then(event => {
      							console.msg('SIGNIN', wsc.sid );
      							if (payload.nonce) {
      								const message = JSON.stringify({signin: wsc.sid, access:wsc.access });
      								[...Aim.server.clients]
      								.filter(ws => ws !== wsc && ws.access.nonce === payload.nonce)
      								.forEach(ws => ws.send(message));
      							}
      							wsc.send(JSON.stringify({ socket_id: wsc.sid, payload: payload }));
      							return;
      						});
                } catch (err) {
                  console.error(err, accessTokenArray)
                }
    						return;
    					}
    				}
            if (wsc.response.hostname) {
    					// console.msg('CONNECT', wsc.sid, wsc.remoteAddress, wsc.response.hostname, wsc.response);
    					console.msg('CONNECT', wsc.sid, wsc.remoteAddress, wsc.response.hostname);
    					wsc.access = wsc.response;
    					wsc.access.socket_id = wsc.sid;
    					return wsc.send(JSON.stringify(wsc.access));
    				}



    				// if (!this.access) return;
    				// console.debug('wsc.access && Aim.server.clients');
    				if (wsc.access && Aim.server.clients) {
    					data.from_id = wsc.sid;
    					data.nonce = wsc.access.nonce;
    					responseText = JSON.stringify(data);
    					var sendto = [];
    					// console.debug('server onmessage clients', this.response.path, this.response.form_id, 'aud', wsc.access.aud, 'sub', wsc.access.sub);
    					// console.msg('clients', response.to, this.responseText);
    					Aim.server.forward(data, responseText, wsc);
    				}

    			};
    		});
    		Aim.server.forward = function(response, responseText, wsc) {
    			// console.debug('FORWARD TO', response.forward);
    			// return;
    			// const clients = Aim.server.clients.filter(ws => ws !== wsc);
    			Aim.server.clients.forEach(ws => {
    				ws.access.sid = ws.sid;
    				// if (wsChild.readyState !== 1 || wsc === wsChild || !wsChild.access || wsChild.sid === response.forward) return;
    				if (ws.readyState !== 1 || wsc === ws || !ws.access ) return;
    				if (response.to) {
    					for (let [name, value] of Object.entries(response.to)) {
    						if (ws.access[name] && ws.access[name] == value) {
    							ws.send(responseText);
    							return;
    						}
    					}
    				} else {
    					if (
    						ws.access.sub == wsc.access.aud ||
    						ws.access.aud == wsc.access.sub ||
    						String(ws.access.aud).split(',').includes(String(wsc.access.aud))
    					) {
    						return ws.send(responseText);
    					}
    				}
    			});
    		}
    	}
    	/* download source files form server */
    	if (Aim.src) {
    		for (var i = 0, cfg; cfg = Aim.src[i]; i++) {
    			const req = require("https").request({ hostname: 'aliconnect.nl', port: 443, method: 'GET', path: '/' + cfg.source }, function (res) {
    				res.on('data', function (d) {
    					// console.debug('974 data', String(d));
    					fs.writeFile(process.cwd() + '/' + this.dest, String(d), function (err) {
    						if (err) throw err;
    					}.bind(this));

    				}.bind(this));
    			}.bind(cfg));
    			req.on('error', (error) => { console.error(error) });
    			//req.write(par.input);
    			req.end();
    		}
    	}
    	if (Aim.require) {
    		// Aim.require.forEach(function (fname) {
    		// 	Aim.extend(Aim, require(fname));
    		// });
    		for (var name in Aim.require) {
    			const req = require('https').request({ hostname: 'aliconnect.nl', port: 443, method: 'GET', path: '/' + Aim.require[name] }, function (res) {
    				res.on('data', function (d) {
    					fs.writeFile(process.cwd() + '/' + this.name + '.js', String(d), function (err) {
    						if (err) throw err;
    						module[this.name] = require(process.cwd() + '/' + this.name + '.js');
    					}.bind(this));
    				}.bind(this));
    			}.bind({ name: name }));
    			req.on('error', (error) => { console.error(error) });
    			req.end();
    		}
    	}

    	if (this.data) {
    		Aim.extend(this.data);
    		Aim.emit('config');
    		Aim.operations = Aim.operations || {};
    		// console.log(Aim.operations);
    		// console.log('paths', data.paths);


    		if (this.data.value) {
    			const ids = data.value.map(item => item.ID);
    			executeStatement(`SELECT ItemID AS ID,* FROM attribute.vw WHERE ItemID IN (${ids.join(',')})`, rows => {
    				rows.forEach(row => {
    					const item = data.value.find(item => item.ID == row.ItemID);
    					item[row.AttributeName] = row;
    				})
    				Aim.evalData(data);
    				for (let [schemaName, schema] of Object.entries(data.components.schemas)) {
    					// let [schemaName] = item;
    					// console.log(1, schemaName);
    					if (schema.operations && Aim.ref[schemaName]) {
    						Aim.ref[schemaName].forEach(item => {
    							// eval(schemaName + `=item;`);
    							for (let [operationName, operation] of Object.entries(schema.operations)) {
    								if (operation.js) {
    									try {
    										let code = operation.js.replace(/\b([A-Z_]+)\b/g,'"$1"');
    										// console.log(operationName,code);
    										// code = `console.log('${'ja'}');`;
    										item[operationName] = new Function(schemaName + `=this;` + code);
    									} catch (err) {
    										console.debug('error js code', schemaName, operationName, code);
    									}
    								}
    							}

    							Aim.operations[schemaName] = id => Aim.find(id);
    								// this.id = 'TEST';
    								// console.log(schemaName, id, item.$id, this.title, operations);
    								// return operations;
    								// console.log(schemaName, operationName, id, Verkeersbuis.title, operation.js);
    								// return new Function(operation.js);
    							// }
    						});
    					}
    				}
    			});
    			{
    				// 	Aim.items.forEach(Aim.get);

    				// Unselect all unselected items
    				// 	Aim.ref.forEach(function (item) {
    				// 		if (item.selected == 0) {
    				// 			(recursive = function (item) {
    				// 				item = items[item.detailID || item.id];
    				// 				item.selected = 0;
    				// 				(item.values.Value = item.values.Value || {}).value = item.Value = null;
    				// 				item.Children.forEach(recursive);
    				// 			})(item);
    				// 		}
    				// 	});

    				// attributeChange on all items
    				// 	Aim.ref.forEach(Aim.attributeChange);
    				// 	control_items(Aim.ref);
    				// 	Aim.emit('data');
    				// 	return // console.debug('done');

    				// 	setState(items[Aim.freeMemID], 'connect');
    				// 	setState(items[Aim.freeDiskSpaceID], 'connect');
    				// 	setState(items[Aim.timeSyncID], 'connect');

    			}
    		}
    	}
    	// if websocket configured, connect to server
    	// if (Aim.config.Aim.websocket) {
    	// 	new Aim.WebsocketRequest();
    	// }

    	setTitle(
    		// Aim.auth.access && Aim.auth.access.sub && Aim.find(Aim.auth.access.sub) ? Aim.find(Aim.auth.access.sub).title : null,
    		$().info.name,
    		// Aim.auth.access.sub,
    		$().info.version,
    		// ip_addresses.join(', ') + ':' + $().config.http.port,
    	);
    	if ($().info.description) {
    		console.log($().info.description);
    	}
      console.log('READY END')
    })


    // require("./node.js");
    setTimeout(async e => await $().emit('load') && await $().emit('ready'));
  };
  Aim.NodeApplication.prototype = new Application;

  Aim.InteractionRequiredAuthError = function () {

  }

  Aim.Client = function Client (config) {

    // console.log('Aim', Aim.aimClient);

    this.config = config;
    aimClient.clients.push(this);
    config.servers = config.servers || [{url: $.config.url}];
    // console.warn(config.servers, $.config.url);
    Array.from(config.servers).forEach(server => aimClient.servers.set(server.url, this));
    this.url = config.servers[0].url;
    // this.hostname = this.url.match(/\/\/(.*?)\//)[1];
    this.headers = {};

    return this;
    // client(options){
    //   this.get(Client, options ? Object.assign(options,{authProvider: options.authProvider || this.authProvider()}) : null);
    //   return this;
    // },
    // console.error(...arguments);
    // [...arguments].forEach($(this).extend)
    this.config = {
      id: {},
      server: [
        {
          url: window.document ? document.location.origin+'/api' : 'https://aliconnect.nl/api',
        }
      ]
    };
    [...arguments].forEach(options => $(this.config).extend(options));
    this.url = this.config.servers[0].url;
    this.hostname = this.url.match(/\/\/(.*?)\//)[1];
    clients.set(this.hostname, this);



    // this.config = config;
    // console.debug(this.authProvider);
    // if (this.access_token = this.authProvider.getAccessToken()){
    // 	this.access = JSON.parse(atob(this.access_token.split('.')[1]));
    // 	this.sub = this.access.sub;
    // 	this.aud = this.access.aud;
    // }
    // $.his.dms = $.his.dms || [];
    // $.his.dms.push(this);
    // $().dms[selector] = this;
    // Object.assign(this, context);
    // this.config = context;
    // console.debug('SERVERS', this.servers);

    // this.id = {};
    // this.servers = this.servers || [];
    // this.server = this.servers[0] || {};
    // this.url = this.server.url || (window.document ? document.location.origin+'/api' : 'https://aliconnect.nl/api');
    // const hostname = this.hostname = this.url.match(/\/\/(.*?)\//)[1];
    // $[hostname] = this;
    // console.debug('Client', this.hostname, this);
    // const servers = this.servers || [];
    // this.server = servers[0] || {};
    // console.debug(`Client ${selector} = ${context.info ? context.info.title : ''}`);
  }
  Aim.Client.prototype = {
    loadConfig() {
      return $().url(dmsUrl + '/config')
      .query('client_id', $.config.client_id)
      .get().then(e => Aim.extend($.config, this.apiConfig = e.body))
    },
    loginUrl() {
      console.error(this.config.client_id);
      return $()
      .url('https://login.aliconnect.nl/')
      .query({
        prompt: 'login',
        response_type: 'code',
        client_id: this.config.client_id,
        redirect_uri: document.location.origin + (this.config.redirect_path || ''),
        // client_id: config.auth.client_id || config.auth.clientId,
        // state: state,
        scope: this.config.scope,//('all'),
        // socket_id: data.socket_id,
      });
    },
    // configGet() {
    //   return $().url(this.url+'/../config.json').get().then(e => {
    //     console.warn('configGet', e.body);
    //     $.extend(this.config, e.body);
    //     // $.config = e.body;
    //   }).catch(console.error);
    // },
    // configUserGet() {
    //   return $().url(this.url+`/../config/${this.authProvider.sub}/config.json`).get().then(e => {
    //     $.extend(this.config, e.body);
    //     // $.extend($.config, JSON.parse(e.target.responseText));
    //     // $($.config).extend(aimClient.api_user = e.body);
    //   }).catch(err => {
    //     // aimClient.api_user = {};
    //   });
    // },
    api(src){
      // console.error(5555, this);
      return $().url(new URL(src.replace(
        /^\//,
        ''
      ), this.config.servers[0].url + '/').href)
      .headers('accept', 'application/json')
      .headers(this.headers)
      .authProvider(this.config.authProvider)
      .body()
    },
    // getApi(){
    //   return $.promise( 'Get API', (resolve,fail) => {
    //     const api = this.api('/').get().then(e => {
    //       if (e.body.components && e.body.components.schemas) {
    //         $().schemas(e.body.components.schemas);
    //       }
    //       // console.warn(e.body);
    //       resolve(e.body);
    //     })
    //   });
    // },



    Get_Aliconnector_Key(){
      copyText = document.body.createElement('INPUT', { value: $.deviceUID });
      copyText.select();
      document.execCommand("Copy");
      document.body.removeChild(copyText);
      alert('Plak (Ctrl+V) de code in het veld "User device UID" van uw aliconnector app');
    },
    addrules(){
      if (this.web && this.web.css && this.web.css.rules){
        for (let [name, value] of Object.entries(this.web.css.rules)){
          new $.css(name, value);
        }
      }
    },
    createLoginFrame(params){
      params = Object.assign(params, {
        response_type: 'code',
        // redirect_uri: document.location.href,
        prompt: 'accept',
        scope: 'name email',
      });
      // params = new URLSearchParams({
      // 	client_id: client_id || $.config.$.client_id,
      // 	response_type: 'code',
      // 	// redirect_uri: document.location.href,
      // 	scope: 'name email',
      // 	state: '12345',
      // 	prompt: 'login',
      // });
      let url = 'https://login.aliconnect.nl?' + new URLSearchParams(params).toString();
      console.debug('LOGIN', url);
      // let login_window = window.open(url, 'login', 'top=0,left=0,width=300,height=300');
      // let loginElement = document.body.createElement('iframe', {src: url, style: 'position:fixed;margin:auto;width:100%;height:100%;top:50px;right:50px;bottom:50px;left:50px;'});
      let loginElement = document.body.createElement('DIV', { style: 'position:fixed;margin:auto;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,0.5);' }, [
        ['IFRAME', { src: url, style: 'position:fixed;margin:auto;top:0;right:0;bottom:0;left:0;width:100%;height:100%;max-width:500px;max-height:500px;border:none;' }]
      ]);
      window.addEventListener('message', e => {
        loginElement.remove();
        $.auth.getLogin();
        // if (callback) callback($.auth.id);
      }, false);
      return;
      // const params = new URLSearchParams({
      // 	client_id: client_id || $.config.$.client_id,
      // 	response_type: 'code',
      // 	redirect_uri: document.location.href,
      // 	scope: 'name email',
      // 	state: '12345',
      // 	prompt: 'login',
      // });
      // document.location.href = 'https://login.aliconnect.nl?' + params.toString();
    },
    mail(){
      return new $.HttpRequest('POST', $.origin + '/api?request_type=mail', params, res).send();
    },
    pdf(){
      return new $.HttpRequest('POST', $.origin + '/api?request_type=pdf', params, res).send();
    },
    publish(){
      console.debug("PUBLISH");
      new $.HttpRequest($.config.$, 'POST', '/', aimapi, e => {
        console.debug("API", this.responseText );
        return;
        var swaggerUrl = 'https://editor.swagger.io/?url=https://'+$.config.$.domain+'.aliconnect.nl/openapi.json';
        var onlineUrl = 'https://' + $.config.$.domain + '.aliconnect.nl';
        console.debug(swaggerUrl, onlineUrl);
        if (confirm("Show in Swagger editor")) window.open(swaggerUrl, "swagger");
        //else console.debug(swaggerUrl);
        if (confirm("Show online")) window.open(onlineUrl, "om");
        return;
        console.debug(onlineUrl, this.responseText);
        document.location.href = document.location.pathname;
      }).send();
      return;
      var def = {
        paths: {
          item: {
            get: {
              parameters: [
                {name: "id", in: "path", description: "", required: true, schema: { type: "integer", format:"int64"}},
                {name: "child", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "tree", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "master", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "src", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "user", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "refby", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "link", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "select", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "search", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "sync", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "order", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "filter", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "three", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "top", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "Accept", in: "query", description: "", schema: { type: "integer", format:"int64"}},
                {name: "Accept", in: "header", description: "", schema: { type: "integer", format:"int64"}},
                {name: "Odata-Version", in: "header", description: "", schema: { type: "integer", format:"int64"}},
                {name: "aud", in: "header", description: "", schema: { type: "integer", format:"int64"}},
                {name: "sub", in: "header", description: "", schema: { type: "integer", format:"int64"}},
              ],
              responses: {
                405: { description: "Invalid input", content: { } }
              },
            },
          }
        }
      };
      var api = JSON.parse(aimapi);
      api.paths = api.paths || {};
      for (var SchemaName in api.components.schemas){
        var schemaName = SchemaName, schema = api.components.schemas[SchemaName];
        (api.tags = api.tags || []).push({name:SchemaName});
        schema.security = schema.security || {
          get: [{ default_auth: ['read:web'] }],
          post: [{ default_auth: ['read:web'] }],
          patch: [{ default_auth: ['read:web'] }],
          delete: [{ default_auth: ['read:web'] }],
        };
        api.paths['/' + schemaName] = api.paths['/' + schemaName] || {
          get: {
            //"tableName": schema.tableName, "idname": schema.idname, "searchNames": schema.searchNames,
            tags: [schemaName],
            Summary: "Get list of " + SchemaName,
            operationId: "item('" + SchemaName + "').find",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
            security: schema.security.get,
          },
          post: {
            tableName: schema.tableName, "idname": schema.idname,
            tags: [schemaName],
            Summary: "Add a new " + SchemaName,
            operationId: "item('" + SchemaName + "').add",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
            requestBody: {
              description: SchemaName + " object that needs to be added to the store",
              content: { "application/json": { schema: { "$ref": "#/components/schemas/" + SchemaName } } }
            },
            security: schema.security.post,
          },
        };
        api.paths['/' + schemaName + "(id)"] = api.paths['/' + schemaName + "(id)"] || {
          get: {
            // tableName: schema.tableName,
            // idname: schema.idname,
            tags: [schemaName],
            Summary: "Find " + SchemaName + " by ID",
            description: "Returns a single " + SchemaName,
            operationId: "item('" + SchemaName + "').get",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: {
              200: { description: "successful operation", content: { "application/json": { schema: { "$ref": "#/components/schemas/" + SchemaName } } } },
              400: { description: "Invalid ID supplied", content: {} },
              404: { description: SchemaName + " not found", content: {} }
            },
            security: schema.security.get,
          },
          post: {
            // tableName: schema.tableName, "idname": schema.idname,
            tags: [schemaName],
            Summary: "Updates a " + SchemaName + " with form data",
            operationId: "item('" + SchemaName + "').post",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
            requestBody: {
              content: {
                "application/x-IsPublic-form-urlencoded": {
                  schema: {
                    properties: {
                      name: { type: "string", description: "Updated name of the " + SchemaName },
                      status: { type: "string", description: "Updated status of the " + SchemaName }
                    }
                  }
                }
              }
            },
            security: schema.security.post,
          },
          patch: {
            // tableName: schema.tableName,
            // idname: schema.idname,
            tags: [schemaName],
            Summary: "Updates a " + SchemaName,
            operationId: "item('" + SchemaName + "').patch",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
            security: schema.security.patch,
          },
          delete: {
            // "tableName": schema.tableName, "idname": schema.idname,
            tags: [schemaName],
            Summary: "Deletes a " + SchemaName,
            operationId: "item('" + SchemaName + "').delete",
            parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
            responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
            security: schema.security.delete,
          }
        }
        //"security, usertasks".split(", ").forEach(function(key){delete(schema[key]);});
        // var properties = {};
        // for (var propertyName in schema.properties){
        // 	var property = properties[propertyName] = {};
        // 	for (var key in ref.properties){
        // 		if (schema.properties[propertyName][key]) property[key] = schema.properties[propertyName][key];
        // 	}
        // }
        //api.components.schemas[SchemaName] = {properties: properties};
      }
      console.debug(api.paths);
      aimapi = JSON.stringify(api, null, 2);
      var js = $.operations ? JSON.stringify($.operations, function(key, value){ return typeof value == "function" ? value.toString() : value }, 4).replace(/\\r\\n/g, '\r\n').replace(/\\t/g, '    ').replace(/"function /g, 'function ').replace(/}"/g, '}') : "";
      //return;
      //console.debug("FN", "$.extend({operations: {\n" + fn.join(", \n") + "\n}});" );
      new $.HttpRequest($.config.$, 'POST', '/', aimapi, e => {
        console.debug("API", this.responseText );
        new $.HttpRequest($.config.$, 'POST', '/?js', `$.operations = ${js};`, e => {
          console.debug("JS", this.responseText );
          var swaggerUrl = 'https://editor.swagger.io/?url=https://'+$.config.$.domain+'.aliconnect.nl/openapi.json';
          var onlineUrl = 'https://'+$.config.$.domain+'.aliconnect.nl';
          console.debug(swaggerUrl, onlineUrl);
          if (confirm("Show in Swagger editor")) window.open(swaggerUrl, "swagger");
          //else console.debug(swaggerUrl);
          window.open(onlineUrl, "om");
          return;
          console.debug(onlineUrl, this.responseText);
          document.location.href = document.location.pathname;
        });
      }).send();
    },
    qrcode(selector){
      if (typeof QRCode === 'undefined'){
        return Object.assign(document.head.createElement('script'), {
          src: scriptPath + 'qrcode.js',
          onload: arguments.callee.bind(this, ...arguments),
        });
      }
      new QRCode(selector, {
        // text: $.config.$.websocket.socket_id,
        text: $.config.$.websocket.socket_id ? 'https://login.aliconnect.nl?s=' + $.config.$.websocket.socket_id : '',
        width: 160,
        height: 160
      });
    },
    randompassword(){
      a = [];
      for (var i = 0; i < 20; i++){
        // a.push(String.fromCharCode(48 + Math.round(74 * Math.random())));
        a.push(String.fromCharCode(33 + Math.round((126-33) * Math.random())));
      }
      return a.join('');
    },
    setUserstate(userstate){
      clearTimeout(this.stateTimeout);
      const config = this.config;
      if (this.access && this.access.sub){
        if (userstate === 'available'){
          this.stateTimeout = setTimeout(() => $.setUserstate('inactive'), 5 * $.config.minMs);
        } else if (userstate === 'inactive'){
          this.stateTimeout = setTimeout(() => $.setUserstate('appear_away'), 5 * $.config.minMs);
        }
        if (this.userstate !== userstate){
          $.send({
            // to: { aud: $.auth.access.aud, sub: $.auth.access.sub },
            sub: this.access.sub,
            userstate: this.userstate = userstate,
          });
        }
      }
    },
    setState(activestate){
      //// console.debug('setactivestate', activestate);
      //var data = { activestate: activestate, accountID: $.client.account.id, userID: $.Account.sub, to: [$.key] };
      //fieldset($.Account.sub, 'state', activestate, true);
      //fieldset($.client.account.id, 'state', activestate, true);
      // Check if current logged in user is still logged in
      if (activestate == 'focus'){
        //if ('auth' in $) $.auth.check_state();
        // src='https://login.aliconnect.nl/api/v1/oauth/tokenindex.php';
        // src='https://login.aliconnect.nl/$-connect/$-api/v1/oauth/token/index.php';
        // new $.Client({
        // 	src: src, onload: function(e){
        // 		// console.debug('SETACTIVESTATE', this.status, this.responseText, this.data);
        // 		if (this.status != 200) $.auth.login();
        // 		//// console.debug('api', this.data);
        // 	}
        // });
        // src=$.authurl + 'token/';
        // new $.Client({
        // 	src: src, onload: function(e){
        // 		// console.debug('SETACTIVESTATE', this.status, this.responseText, this.data);
        // 		if (this.status != 200) $.auth.login();
        // 		//// console.debug('api', this.data);
        // 	}
        // });
        return;
        ws.send({
          //broadcast: true,
          //to: { host: $.Account.aud },
          value: [{ id: $.Account.sub, values: { state: activestate } }, { id: $.client.account.id, values: { state: activestate } }]
        });
      }
      //return;
      //ws.send(data);
      //ws.send({ a: 'set', id: $.client.account.id, name: 'online', value: false });
      //ws.send({ a: 'blur' });
      //clearTimeout(msg.to);
      //new $.Client({
      //    api: 'window/blur/' + aliconnect.deviceUID,
      //    //post: { exec: 'onblur', deviceUID: aliconnect.deviceUID, },
      //    onload: function(){
      //        //// console.debug('onblur done', this.post);
      //    }
      //});
    },
    sms(){
      return new $.HttpRequest('POST', $.origin + '/api?request_type=sms', params, res).send();
    },
    then(callback){
      this.callback = callback;
    },
    ws_send_code(socket_id, code){
      $.WebsocketClient.request({
        to: {
          sid: socket_id,
        },
        body: {
          // id_token: $.auth.id_token,
          code: code,
        },
      });
      window.close();
    },
  };
  Object.defineProperties(Aim.Client, {
    initWithMiddleware: { value: function() {
      // const options = Object.assign()
      return new this(Object.assign({}, ...arguments));
    }, },
  });

  Object.assign(Aim, {
    importScript: importScript,
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
        $().status('is_checked', value);
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
            e.clipboardData.setData('Aim/items', JSON.stringify(data));
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
        url: AUTHORIZATION_URL,
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
      return new Promise( context ).then( result => {
        // $().progress(-1, -1);
        if (messageElem) {
          messageElem.remove();
        }
        if (Aim.LOGPROMISE) {
          console.debug(selector, 'end');
        }
        return result;
      }).catch( err => {
        // $().progress(-1, -1);
        if (messageElem) {
          messageElem.text(selector, err).css('color','red');
        }
        // console.error('aaaaa', err, arguments);
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
        let identList = [];
        let identOptions = null;
        let html = [];
        function istr(ident) {
          return '                '.slice(0,ident);
        }
        const lines = [];
        const arr = !s ? '' : s
        .replace(/\r/gs ,'')
        .split(/\n/);

        let tag = '';
        function setTag (p, par = '') {
          if (tag) {
            lines.push(`</${tag}>`);
          }
          if (p) {
            lines.push(`<${(p + ' ' + par).trim()}>`);
          }
          tag = p;
        }

        for (var i=0;i<arr.length;i++) {
          s = arr[i];
          if (s || i === arr.length - 1 ) {
            const lineIdent = (s.match(/^ +/)||[''])[0].length;
            const match = s.trim().match(/^(\*|-|\d+\.) /);
            (function unident() {
              identOptions = identList[0];
              if (identOptions) {
                if (lineIdent < identOptions.ident || (lineIdent === identOptions.ident && !match)) {
                  setTag();
                  lines.push(`</li></${identOptions.tag}>`);
                  identList.shift();
                  unident();
                } else if (identOptions.ident === lineIdent) {
                  setTag();
                  lines.push('</li>');
                }
              }
            })()

            if (s.match(/```/)) {
              setTag();
              var codeLines = [];
              for (i++; i<arr.length; i++) {
                if (arr[i].match(/```/)) {
                  let type = '';
                  codeLines = this.code(codeLines.join('\n'));
                  lines.push(
                    s.replace(/```/, '<pre><code>')
                    .replace(/<pre><code>(\w+)/, (s,p1) => `<div class="code-header row" language="${type = p1.toLowerCase()}"><span class="aco">${p1}</span></div><pre><code language="${p1.toLowerCase()}">`)
                    + ($.string[type] ? $.string[type](codeLines) : codeLines)
                    + '</code></pre>'
                  );
                  break;
                }
                codeLines.push(arr[i]);
              }
              continue;
            }
            if (s.match(/.*? \| .*?/)) {
              setTag();
              lines.push(`<TABLE><THEAD><TR><TH>${s.replace(/ \| /g, '</TH><TH>')}</TR></TH></THEAD><TBODY>`);
              for (i = i+2; i<arr.length; i++) {
                if (arr[i].match(/.*? \| .*?/)) {
                  lines.push(`<TR><TD>${s.replace(/ \| /g, '</TD><TD>')}</TR></TD>`);
                } else {
                  break;
                }
              }
              lines.push('</TBODY></TABLE>');
              continue;
            }
            s = s
            .replace(/`(.+?)`/g, (s, p1) => `<CODE>${p1
              .replace(/~/gs, '&#126;')
              .replace(/\^/gs, '&#94;')
              .replace(/\*/gs, '&#42;')
              .replace(/_/gs, '&#95;')
              .replace(/</gs, '&lt;')
              .replace(/>/gs, '&gt;')
            }</CODE>`)
            .replace(/\*\*(.+?)\*\*/g, '<B>$1</B>')
            .replace(/\*(.*?)\*/g, '<I>$1</I>')
            .replace(/__(.*?)__/g, '<B>$1</B>')
            .replace(/_(.*?)_/g, '<I>$1</I>')
            .replace(/~~(.*?)~~/g, '<DEL>$1</DEL>')
            .replace(/~(.*?)~/g, '<U>$1</U>')
            .replace(/\^\^(.*?)\^\^/g, '<MARK>$1</MARK>')
            // .replace(/`(.+?)`/g, (s, p1) => `<CODE>${$.string.code(p1)}</CODE>`)
            .trim();
            if (match) {
              setTag();
              if (!identOptions || identOptions.ident < lineIdent) {
                identOptions = {ident: lineIdent, tag: s.trim().match(/^(\*|-) /) ? 'ul' : 'ol'};
                identList.unshift(identOptions);
                lines.push(`<${identOptions.tag}>`);
              }
              s = s.replace(/^\s*(\*|-|\d+\.) /, '<li>')
            } else if (s.match(/^#/)) {
              setTag();
              s = s
              .replace(/^# (.*?)$/gm, '<H1>$1</H1>')
              .replace(/^## (.*?)$/gm, '<H2>$1</H2>')
              .replace(/^### (.*?)$/gm, '<H3>$1</H3>')
              .replace(/^#### (.*?)$/gm, '<H4>$1</H4>')
              .replace(/^##### (.*?)$/gm, '<H5>$1</H5>')
              .replace(/^###### (.*?)$/gm, '<H6>$1</H6>')
              .replace(/^####### (.*?)$/gm, '<H7>$1</H7>')
            } else if (s.match(/^> /)) {
              if (tag !== 'BLOCKQUOTE') {
                s = s.replace(/^> (\[\!(\w+)\]|)/, (s, p1, type) => setTag('BLOCKQUOTE', type ? `class=${type.toLowerCase()}` : '') || '')
              }
              s = s.replace(/^> /,'')
            } else if (!arr[i-1]) {
              setTag('P');
            } else if (tag !== 'P') {
              setTag('P');
            }
            s = s
            .trim()
            .replace(/  $/gm, '<BR >')
            .replace(/\[ \]/, '&#9744;')
            .replace(/\[v\]/, '&#9745;')
            .replace(/\[x\]/, '&#9745;')
            .replace(/\!\[(.*?)\]\((.*?)\)(?=(?:(?:[^`]*`){2})*[^`]*$)/g, '<IMG src="$2" alt="$1">')
            .replace(/\[(.*?)\]\((.*?)\)(?=(?:(?:[^`]*`){2})*[^`]*$)/g, '<A href="$2">$1</A>')
            .replace(/:::(\w+)(.*?):::/gs, '<PRE><$1$2></$1></PRE>')
          } else {
            setTag();
          }
          lines.push(s);
        }
        setTag();
        s = lines
        .join('\n')
        ;

        //.split(/\n\n/).map(s => s.trim()).map(s => s ? `<p>${s}</p>` : s).join('\n');
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

  Item = function () {};
  Object.defineProperties(Item, {
    get: { value: function(selector, schemaName){
      // console.log(selector.schemaName);
      // iii++;
      // if (iii>1000) throw 'STOP';
      if (!selector) throw 'No Item selector';
      if (selector instanceof Item) return selector;
      if (typeof selector !== 'object'){
        if ($.his.map.has(selector)){
          return $.his.map.get(selector);
        } else if (isNaN(selector)){
          selector = { '@id' : selector };
        } else {
          return null;
        }
      }
      if (selector.AttributeID){
        selector = {
          '@id': selector['@id'],
          header0: selector.Value,
        };
      }
      let match = (selector['@id'] || selector['@odata.id'] || selector.tag || '').match(/(\w+)\((\d+)\)/);
      // console.log(selector.schema);
      if (match && !selector.schema && !selector.schemaName) {
        selector.schema = match[1];
        selector.ID = match[2];
      }
      const ID = selector.ID = selector.ID ? selector.ID.Value || selector.ID : String('item'+(selector.nr = Item.nr = Item.nr ? ++Item.nr : 1));
      // console.log(selector.ID);
      // if (selector.schemaPath) console.debug(selector.schemaPath)
      // if (!selector.schema) console.error(selector.schemaPath, selector)
      // console.log(selector.schema);
      schemaName = validSchemaName(selector.schema = selector.schema || selector.schemaName || schemaName || 'Item');
      const tag = `${schemaName}(${ID})`;
      if (tag.includes('[')) console.warn(tag, selector);
      const id = selector.id || tag;
      var item = $.his.map.get(id);
      // console.warn(111,schemaName,id);
      if (item) {
        // console.log(item.data);
        item.data = Object.assign(item.data, selector);
      } else {
        // console.debug(schemaName, window[schemaName]);
        // if (!window[schemaName]) return console.warn(schemaName, 'not exists');
        // console.log(schemaName, window[schemaName]);
        var item = window[schemaName] ? new window[schemaName]() : new Item();
        // console.debug(selector, item.schema, window[schemaName].prototype);
        // console.log(selector.properties);
        item.properties = Object.fromEntries(
          Object.entries(selector.properties || item.schema.properties)
          .map(([propertyName, property]) => [
            propertyName,
            Object.assign({
              item: item,
              get value(){
                return item[propertyName];
              },
              set value(value) {
                item[propertyName] = value;
              },
            }, property)
          ])
        );
        item.tag = tag;
        if (item.href = selector['@id'] || selector['@odata.id']) {
          item.Id = btoa(item.href);
        }
        item.data = selector;
        item.schemaName = schemaName;
        if (window[schemaName] && window[schemaName].set){
          window[schemaName].set(tag, item);
        }
        $.his.map.set(ID,item);
        // console.debug(ID, $.his.map.get(ID));
        $.his.map.set(tag,item);
        $.his.map.set(id,item);
        // item.on('change', e => {
        //   // console.debug($().list())
        //   // Object.values(this).filter(obj => typeof obj === 'object' && obj.emit).forEach(obj => obj.emit('change'));
        // });
      }
      return item;
      Object.entries(item.data).forEach(([propertyName,property]) => {
        // console.log(propertyName,property, item.hasOwnProperty(propertyName));
        if (!item.hasOwnProperty(propertyName)) {
          Object.defineProperty(item, propertyName, {
            get(){
              return this.getValue(propertyName);
            },
            set(value){
              this.attr(propertyName, value, true);
            }
          });
        }
      });
      return item;
    } },
    mergeinto: { value: function(newID, oldID){
      //om drop action move into
      // console.debug('SAMENVOEGEN');
      new $.HttpRequest($.config.$, 'GET', `/item(${newID})`, {
        oldID: oldID,
      }, this.onload || function (){
        // console.debug(this.data);
      }).send();
    } },
    new: { value: function(item){
      return $.promise( 'New item', resolve => {
        //Geeft inzicht in bal bla
        //// console.debug('ADD', this.caller);
        //return;
        //var a = String(this.id || get.lid).split(';');
        //var schemaname;// = api.find(post.classID);
        //var schema = $.config.components.schemas[this.caller.schema];// || $.config.components.schemas[schemaname = api.find(post.classID)];
        //var post = { id: a.shift(), };
        //if (schema.onadd) schema.onadd.call(post);
        // var put = { schema: item.schema || item.get.folder };
        //// console.debug('ADD', this, put, this.caller);
        if (item.source){
          const [s,schemaName,id] = item.source.match(/(\w+)\((\d+)\)/);
          var url = `/${schemaName}`;
          item
        }
        aimClient.api(url).patch(item).then(body => {
          console.debug(body);
          resolve(body);
        });
        return;
        new $.HttpRequest($.config.$, 'PATCH', '/' + this.schema, {
          value: [put],
        }, this.onload || function(e){
          // console.debug('ADDED', this.data);
          //return;
          //// console.debug(this.src, this.responseText, this.data.id, this.data, $.getItem(this.data.id]);
          //var itemID = this.data[];//.set[0][0].id;
          var item = ItemAdded = $.getItem(e.body.Value.shift().id);
          item.onloadEdit = true;
          for (var name in item.properties){
            if (item.properties[name].initvalue){
              item.setAttribute(name, item.properties[name].initvalue);
            }
          }
          $.url.set({ schema: item.schema, id: item.id });
          //// console.debug('LV', $.listview);
          //$.listview.elItems.insertBefore($.listview.items.appendListitem(item), $.listview.elItems.firstChild);
          //$.show({ id: item.id });
        }).send();
        resolve('ja');
      })
    } },
    toData: { value: function(item){
      console.debug('TODATA', item);
      return {
        ID: item.ID,
        tag: item.tag,
        index: item.index,
        title: item.headerTitle,
        // hostID: item.hostID,
        // srcID: item.srcID,
        // classID: item.classID,
        Master: item.elemTreeLi && item.elemTreeLi.elem.parentElement.item ? { tag: item.elemTreeLi.elem.parentElement.item.tag } : null,
        Class: item.data.Class,
        // type: type,
      }
    } },
    toHtml: { value: function(item){
      return `<table>${Object.entries(item).filter(entry => !['object', 'function'].includes(typeof entry[1])).map(entry => `<tr><td>${entry[0]}</td><td>${entry[1]}</td></tr>`).join('')}</table>`;
    } },
    toText: { value: function(item){
      return `${Object.entries(item).filter(entry => !['object', 'function'].includes(typeof entry[1])).map(entry => `${entry[0]}\t${entry[1]}\n`).join('')}`;
    } },
  });
  Object.defineProperties(Item.prototype, {
    api: {
      value: function (selector = '') {
        // console.log(aimClient.api(`/${this.tag}` + selector))
        // console.log(1, aimClient)
        return aimClient.api(`/${this.tag}` + selector);
      },
    },
    attr: {
      value: function (attributeName, value, postdata){
        return $.promise( 'Attribute', async resolve => {
          try {
            // console.warn(1, 'attr', attributeName, value, postdata);
            const item = this;
            const property = this.schema.properties[attributeName] || {};
            if (property.readOnly) return resolve(item);
            if (value === undefined){
              return resolve(item);// console.error('value is undefined', arguments.length, attributeName, this);
            }
            if (value instanceof String){
              value = String(value);
            }
            const values = item.data = item.data || {};
            if (Array.isArray(value)){
              values[attributeName] = value;
              // console.debug('attr1', attributeName, value);
              return resolve(item);
            }
            let data = values[attributeName] = values[attributeName] || {};
            data = [].concat(data);
            data = data.filter(data => !data.SrcID || data.SrcID == item.ID);
            if (typeof value !== 'object' || value === null) {
              value = { Value: value };//values[attributeName] = values[attributeName] || value;
            }
            function getItem(selector) {
              if (selector instanceof Item) return selector;
              selector = typeof selector === 'object' ? selector.tag : selector;
              if ($.his.map.has(selector)) return $.his.map.get(selector);
            }
            if (value.target) {
              console.log(value.target);
              value.LinkID = getItem(value.target).ID;
            }
            if (value.current) {
              const current = getItem(value.current);
              data = data.find(attr => attr.AttributeName === attributeName && attr.LinkID === current.ID) || null;
            } else if (value.AttributeID) {
              data = data.find(data => data.AttributeID === value.AttributeID)
            } else if (value.type !== 'append') {
              data = data.shift();
            }
            // if (value === data){
            //   console.debug('attr2', attributeName, value);
            //   return resolve(item);
            // }
            if (typeof data !== 'object' || data === null){
              data = values[attributeName] = { Value: data };
            }
            value = Object.assign({},{
              AttributeID: data.AttributeID,
              Value: data.Value,
              HostID: data.HostID,
              Data: data.Data,
              LinkID: data.LinkID
            },value);
            if (value.LinkID1) {
              async function reindex(parent) {
                await parent.children.then(children => {
                  if (children.length) {
                    // children.forEach((item,i) => item.getIndex(attributeName, parent) != i ? item.setLink(attributeName, parent, i, parent) : null);
                  }
                  // parent.attr('HasChildren', children.length ? 1 : 0, true);
                })
              }
              const to = $.his.map.get(value.LinkID);
              // const name = attributeName || 'link';
              const action = value.action || 'move';
              if (attributeName === 'Master') {
                if (action === 'move') {
                  const current = item.elemTreeLi.elem.parentElement.item;
                  value.Data = Math.max(0, value.Data === undefined ? 99999 : value.Data );
                  await current.children.then(children => {
                    children.splice(children.indexOf(item), 1);
                    if (current !== to) {
                      // reindex(current);
                    }
                  });
                  if (to) {
                    await to.children.then(children => {
                      children.splice(value.Data, 0, item);
                      reindex(to);
                    });
                    // } else {
                    //   item.setLink(attributeName, to, value.Data, current);
                  }
                  // } else {
                  //   item.setLink(attributeName, to, params.index, current);
                }
                // setTimeout(() => resolve(item));
                // return;
              }
            }
            const currentJson = [data.AttributeID,data.Value,data.HostID,data.Data,data.LinkID].join();
            const newJson = [value.AttributeID,value.Value,value.HostID,value.Data,value.LinkID].join();
            if (value.max) {
              delete value.AttributeID;
            } else if (currentJson === newJson){
              return resolve(item);
            } else {
              // console.log(attributeName,currentJson,newJson,value,data);
            }
            // console.debug(attributeName, value);
            if ($.threeObjects && $.threeObjects[item.tag] && $.threeObjects[item.tag].obj.onchange){
              $.threeObjects[item.tag].obj.onchange(attributeName, value.Value);
            }
            item['@id'] = item['@id'] || item.tag;
            // console.debug(attributeName, value);
            Object.assign(data, value);
            if (item.elems) {
              item.elems.forEach(elem => {
                var displayvalue = newvalue = typeof value === 'object' ? value.Value : value;
                // console.debug(attributeName, value, item.elems);
                // var displayvalue = property.displayvalue || displayvalue;
                const el = elem.elem;
                if (el.hasAttribute('displayvalue')) {
                  elem.displayvalue(this.displayvalue(attributeName));
                }
                // if (property.type === 'datetime'){
                // 	newvalue = new Date(newvalue).toISOString().substr(0,19);
                // }
                // Do not update if type in files
                // if (!['files','radio','select'].includes(property.format)){
                // displayvalue = String(displayvalue).split('-').length == 3 && String(displayvalue).split(':').length == 3 && new Date(displayvalue) !== "Invalid Date" && !isNaN(new Date(displayvalue)) ? new Date(displayvalue).toISOString().substr(0, 19).replace(/T/, ' ') : displayvalue;
                // if (displayvalue && !isNaN(displayvalue)){
                // 	displayvalue = Math.round(displayvalue * 100) / 100;
                // }
                if (el.hasAttribute(attributeName) && el.getAttribute(attributeName) != newvalue){
                  el.setAttribute(attributeName, newvalue);
                  el.setAttribute('modified', new Date().toLocaleString());
                }
                // [...el.getElementsByClassName(attributeName)].forEach((attributeElement, i) => {
                //   // if (attributeElement.noupdate) return;
                //   // if (attributeElement === document.activeElement) return;
                //
                //   if (['files','radio','select'].includes(attributeElement.format)) return;
                //   if (attributeElement.hasAttribute('checked')){
                //     if (newvalue){
                //       attributeElement.setAttribute('checked', '');
                //     } else {
                //       attributeElement.removeAttribute('checked');
                //     }
                //     attributeElement.setAttribute('modified', new Date().toLocaleString());
                //   } else if ('value' in attributeElement && attributeElement.type === 'radio'){
                //     attributeElement.checked = attributeElement.value === newvalue;
                //   } else if ('value' in attributeElement){
                //     // return console.error(attributeElement, document.activeElement, attributeElement === document.activeElement);
                //     // return console.error(1);
                //     // console.error(attributeElement.value, newvalue)
                //     if (attributeElement.value != newvalue){
                //       attributeElement.value = newvalue;
                //       attributeElement.setAttribute('modified', new Date().toLocaleString());
                //     }
                //   } else if (attributeElement.hasAttribute('value')){
                //     if (attributeElement.getAttribute('value') != newvalue){
                //       attributeElement.setAttribute('value', newvalue);
                //       attributeElement.setAttribute('modified', new Date().toLocaleString());
                //     }
                //   } else if (['SPAN', 'DIV', 'TD'].includes(attributeElement.tagName)){
                //     // console.debug(attributeElement.tagName, attributeElement, attributeElement.children);
                //     if (property && property.options && property.options[newvalue] && property.options[newvalue].color){
                //       if (attributeElement.style.backgroundColor){
                //         attributeElement.style.backgroundColor = property.options[newvalue].color;
                //       }
                //     } else if (!attributeElement.children.length){
                //       attributeElement.innerHTML = displayvalue != undefined ? displayvalue : '';
                //     }
                //     // attributeElement.setAttribute('modified3', new Date().toLocaleString());
                //   }
                // });
                setTimeout(e => elem.emit('change'));
                // if (el.onupdate){
                //   setTimeout(el.onupdate);
                // }
              })
            }
            if (!$.his.noPost && postdata){
              // console.error(arguments);
              // for (var callee = arguments.callee, caller = callee.caller;caller;caller = caller.caller){
              // 	console.debug(caller);
              // }
              // return;
              const itemModified = $.his.itemsModified[item['@id']] = $.his.itemsModified[item['@id']] || {
                ID: item.data.ID ? item.data.ID.Value || item.data.ID : null,
                method: 'patch',
                path: '/' + item.tag,
                body: {
                  // ID: item.data.ID,
                },
                // res: (e) => {
                // 	// console.debug('DONE', item.tag, e.request );
                // }
              };
              // console.log(itemModified);
              const updateProperty = itemModified.body[attributeName] = itemModified.body[attributeName] || {};
              Object.assign(updateProperty, (({ AttributeID, Value, HostID, UserID, LinkID, Data }) => ({ AttributeID, Value, HostID, UserID, LinkID, Data }))(data));
              if ('max' in property && !('max' in value)) {
                value.max = property.max;
              }
              if ('max' in value) {
                updateProperty.max = value.max;
                if (value.LinkID !== null || value.Value !== null) {
                  delete updateProperty.AttributeID;
                }
              }
              // if (value.LinkID === null) return console.warn(value,updateProperty);
              let values = Object.values($.his.itemsModified);
              if (values.length){
                clearTimeout($.his.itemsModifiedTimeout);
                $.his.itemsModifiedResolve = $.his.itemsModifiedResolve || [];
                $.his.itemsModifiedResolve.push([resolve, item]);
                $.his.itemsModifiedTimeout = setTimeout(() => {
                  $.his.itemsModified = {};
                  const param = { requests: values };
                  // console.debug('saveRequests', param.requests);
                  if ($.config && $.config.dbs) {
                    $.saveRequests(param.requests);
                  } else if (this.schema.table) {
                  } else {
                    $().send({
                      to: { aud: $.aud, sub: $.aud },
                      body: param,
                      itemsModified: true,
                    });
                    // DEBUG: MKAN STAAT UIT IVM SCHIPHOL
                    $().send({body: param});
                  }
                  $.handleData({body: { requests: values }});
                  $.his.itemsModifiedResolve.forEach(([resolve, item]) => resolve(item));
                  $.his.itemsModifiedResolve = [];
                });
              }
            } else {
              resolve(item);
            }
            // if (properties[attributeName]){
            // var property = item.properties[attributeName];
            // if (property.type === 'datetime'){
            // 	if (value.Value){
            // 		value.Value = (value.Value + ':00').substr(0,19);
            // 	}
            // }
            // return;
            if (property.type === 'datetime'){
              if (value.Value && value.Value.match(/T\d+:\d+$/)){
                value.Value = (value.Value + ':00').substr(0,19);
              }
            }
            // let {UserID,Value} = value;
            // console.debug(Object.entries(value), JSON.stringify(data), JSON.stringify(value));
            // Object.assign(data, value);
            //
            // for (let [key, keyValue] of Object.entries(value)){
            // 	if (values[key] != keyValue){
            // 		let object = Object.assign(data, value);
            // 		['UserID', 'Value', 'LinkID', 'Data'].forEach(key => {
            // 			if (key in data){
            // 				var bodyAttribute = itemModified.body[attributeName] = itemModified.body[attributeName] || {};
            // 				bodyAttribute[key] = value[key];
            // 			}
            // 		});
            // 		break;
            // 	}
            // }
            // execute autonoom_proces for item and parent
            for (let parent = item; parent; parent = parent.parent){
              if (parent.operations){
                for (let [operationName, operation] of Object.entries(parent.operations)){
                  if (parent[operationName] && operation.stereotype === 'autonoom_proces' && typeof parent[operationName] === 'function'){
                    // console.debug('setAttribute autonoom_proces', operationName);
                    try {
                      // item[operationName]();
                    } catch (err){
                      console.debug('ERROR', err);
                    }
                  }
                }
              }
            }
            // }
            /* bij data van database, item.loading dan stoppen met uitvoeren, niet wegschrijven naar database, is ook actief bij data van WS  */
            /* If attribute exists (been loaded) then this is an update and the change should be writen to the database			*/
            (recursive = function (item){
              if (!item) return;
              if (typeof item.onchange === 'function') item.onchange();
              recursive(item.master);
            })(item);
            // $().emit("attributeChange", { item: this, [attributeName]: modvalues });
            // return ref.itemsModified;
          } catch (err) {
            console.error(err);
          }
        });
      },
    },
    append: {
      value: function (item, index){
        return $.promise( 'Append', async resolve => {
          if (item.parent) {
            await item.parent.children.then(children => {
              const index = children.indexOf(item);
              children.splice(index, 1);
              if (item.parent !== this) {
                children.forEach((item,i) => item.index !== i ? item.Masterindex = i : i);
              }
            });
          }
          this.children.then(children => {
            children.splice(index = Math.max(index,0), 0, item);
            item.attr('Master', { LinkID: this.data.ID }, true);
            console.debug('MASTER',this.data.ID,item.data.Master.LinkID)
            children.forEach((item,i) => item.index !== i ? item.index = i : i);
            setTimeout(() => resolve(item));
          });
        });
      },
    },
    appendItem: {
      value: async function (previousItem, item, sourceItem, noedit) {
        // const itemIndex = previousItem ? this.children.indexOf(previousItem) + 1 : (this.children ? this.children.length : 0);
        // ? this.children.indexOf(previousItem) + 1 : (this.children ? this.children.length : 0);
        // Update all indexes of childs after inserted item
        item.Master = { LinkID: this.ID };
        if (sourceItem) {
          item.schema = sourceItem.schema;
          item.userID = 0;
          item.srcID = sourceItem.ID;
        };
        // let e = await aimClient.api(`/${item.schemaName}`).input(item).post();
        // TODO: 1 aanroep naar api
        const newItem = await aimClient.api(`/${e.body.tag}`).select('*').get();
        newItem.selectall = true;
        const index = previousItem ? previousItem.index + 1 : this.children.length;
        // TODO: index meenemen in aanroep => een api call, => na aanroep wel sorteren.
        //console.log(index, previousItem);
        await newItem.movetoidx(this, index);
        return newItem;
        // await this.open();
      },
    },
    bccRecipients: {
      get(){
        console.log(this);
        return this.data.bccRecipients || 0;
      },
    },
    ccRecipients: {
      get(){
        return this.data.ccRecipients || 0;
      },
    },
    children: {
      get() {
        return $.promise( 'Children', resolve => {
          if (this.items) return resolve(this.items);
          const api = this.api(`/children`).filter('FinishDateTime eq NULL')
          .select($.config.listAttributes).get().then(body => {
            // const children = Array.isArray(this.data.Children) ? this.data.Children : this.data.children;
            // console.log('children_then', this.header0, this.data.Children, this.data.children, this.data, JSON.parse(e.target.responseText));
            const children = body.Children || body.children;
            this.items = [].concat(children).filter(Boolean).map($).unique();
            // console.warn('BODY', this.items);
            this.items.url = body['@context'];
            this.HasChildren = this.items.length>0;
            resolve (this.items);
          })
        });
      },
    },
    class: {
      get() {
        console.debug(this,this.schemaName,this.schema,this.classID);
        return $.his.map.get(this.classID);
      },
    },
    classItemName: {
      get(){
        return (this.source && this.source.name ? this.source.name : '') + (this.name || '');
      },
    },
    classTag: {
      get(){
        return (this.source && this.source.tag ? this.source.tag : '') + (this.tag || '');
      },
    },
    className: {
      get() {
        // console.debug(this.schema.Name, this.schema.allOf);
        return [
          // this.schema.Name || 'Item',
          ...(this.schema.allOf || []),
          this.name,
          this.schemaName,
          this.isSchema ? 'constructor' : '',
          // this.schema.Name === 'Item' ? 'isclass' : 'noclass',
          // this.ID,
        ].join(' ')
      },
    },
    created: {
      get(){
        return dateText(this.data.CreatedDateTime);
      },
    },
    createdDateTime: {
      get(){
        return this.data.createdDateTime;
      },
    },
    combine: {
      value: function (config){
        return config.split(',')
        .map(name => this.data[name] ? this.data[name].Value || this.data[name] || '' : '')
        .filter(Boolean)
        .join(' ');
      },
    },
    _catElement: {
      value: function () {
        if (this.Categories && this.Categories.options) {
          let categories = String(this.Categories);
          categories = 'draft,concept';
          let catElement = $.createElement('DIV', 'cat');
          var cats = categories.split(',');
          cats.forEach((cat)=>{
            // //console.log(cat, this.Categories.options[cat].color);
            catElement.createElement('SPAN').style.backgroundColor = this.Categories.options[cat].color;
          });
          return catElement;
        }
      },
    },
    copytoidx: {
      value: function (master, index) {
        //console.debug('COPY TO', master, index);
        master.appendChild(null, { srcID: this.detailID || this.id });
        this.master.reindex();
      },
    },
    _createPriceElement: {
      value: function (parentElement) {
        // this.CatalogPrice = 0;
        // this.SalesDiscount = 3;
        // this.AccountDiscount = 4;
        let catalogPrice = this.catalogPrice = Number(this.CatalogPrice || 0);
        if (!catalogPrice) {
          return;
        }
        let salesDiscount = Number(this.SalesDiscount);
        let accountDiscount = Number(this.AccountDiscount);
        let discount = accountDiscount || salesDiscount;
        let price = this.price = discount ? catalogPrice * (100 - discount) / 100 : catalogPrice;
        let customer = $.shop.customer, item = this;
        let product = customer && customer.Product && customer.Product.find
        ? customer.Product.find(function(row){
          return row == item;
        })
        : null;
        // writeprice: function(el, index) {
        // //console.log('CatalogPrice', this.CatalogPrice);
        // //console.log('SalesDiscount', this.SalesDiscount);
        // //console.log('AccountDiscount', this.AccountDiscount);
        if (accountDiscount) {
          parentElement.createElement('DIV', 'tagAccountDiscount', __('Account discount'));
        }
        if (discount) {
          parentElement.createElement('DIV', 'tagSalesDiscount', -discount.toFixed(1));
        }
        return parentElement.createElement('DIV', 'pricerow col', [
          ['DIV', 'aco', [
            discount ? ['SPAN', 'currency strikeThrough', catalogPrice.toFixed(2)] : null,
            ['SPAN', 'currency price', price.toFixed(2)],
          ]],
          ['DIV', 'shopbag', [
            ['INPUT', 'addbag', {type:'number', value:this.amount = product ? product.Data : '', onchange: (e)=>{
              return // //console.log(this.tag, e.target.value);
              $.shop.add(this.row, e.target.value);
            }}],
            ['BUTTON', 'abtn icn bagAdd', {type:'button', tabindex: -1, onclick: (e)=>{
              e.stopPropagation();
              e.preventDefault();
              return // //console.log(this.tag);
              $.shop.add(
                this.id,
                $.shop.data && $.shop.data[this.id]
                ? Number($.shop.data[this.id].quant) + 1
                : 1
              );
            }}],
          ]],
          ['DIV', this.Stock ? 'delivery onstock' : 'delivery notonstock', __('notonstock', this.Stock) ],
        ]);
      },
    },
    clone: {
      value: function () {
        if (this.data.Src) {
          return $.promise( 'Clone', resolve => {
            console.debug('CLONE', this.data);
            const sourceId = [].concat(this.data.Src).shift().LinkID;
            aimClient.api(`/${this.tag}`).query('request_type','build_clone_data').get().then(async items => {
              // console.warn('clone1',e.body);
              (async function clone(targetId,sourceId){
                // console.warn('clone',targetId,sourceId);
                if (targetId && sourceId) {
                  const children = items.filter(row => row.masterId && sourceId && row.masterId == sourceId);
                  await children.forEach(async (child,i) => {
                    let allOf = JSON.parse(child.allOf);
                    const schemaName = allOf.find(schemaName => $().schemas().has(schemaName));
                    if (child.cloneId === null){
                      const data = {
                        header0: child.header0,
                        header1: child.header1,
                        header2: child.header2,
                        Master: {
                          LinkID: targetId,
                          Data: i,
                        },
                        Src: {
                          LinkID: child.itemId,
                        },
                        Inherited: {
                          LinkID: child.itemId,
                        },
                      };
                      console.debug('create',data);
                      // console.debug(targetId, sourceId, i, child.id, child.title, child.schemaName);
                      await aimClient.api(`/${schemaName}`).input(data).post().then(body => clone(body.data.ID, child.itemId));
                    } else {
                      clone(child.cloneId, child.itemId)
                    }
                  });
                  const target = $(targetId);
                  if(target && target.elemTreeLi) {
                    target.elemTreeLi.emit('toggle')
                  }
                }
              })(this.data.ID,sourceId);
              resolve(this);
            });
          });
        }
      },
    },
    detail: {
      get(){
        return this.detailID ? Item.create({ id: this.detailID }) : {};
      },
    },
    details: {
      value: function (reload){
        return $.promise( 'Details', resolve => {
          if (reload || !this.hasDetails){
            this.data = {};
            this.get().then(e => resolve(e.body, this.hasDetails = true)).catch(console.error);
          } else {
            resolve(this)
          }
        })
      },
    },
    delete: {
      value: function (){
        this.remove();
        return aimClient.api(`/${this.tag}`).delete();
      },
    },
    displayvalue: {
      value: function (attributeName) {
        return $.attr.displayvalue(this.getValue(attributeName), ((this.schema||{}).properties||{})[attributeName]);
      },
    },
    elements: {
      get(){
        return Object.values(this).filter(value => value instanceof Element);
      },
    },
    eval: {
      value: function (name){
        const config = this.schema[name] || '';
        // console.debug(name);
        if (typeof config === 'function'){
          return config.call(this);
        }
        return this.combine(config);
      },
    },
    emit: {
      value: $.prototype.emit,
    },
    fav: {
      get(){
        let isFavorite = 'Fav' in this ? Number(this.Fav) : $.his.fav.includes(this.tag);
        // console.debug('isFavorite', isFavorite);
        return isFavorite;
      },
      set(value){
        console.debug(value);
        let id = this.tag;
        $.his.fav.splice($.his.fav.indexOf(id), 1);
        if (value){
          $.his.fav.unshift(this.tag);
        }
        // console.debug('SET FAV', private.fav, this.tag, this.id, value, $.auth.access.sub);
        this.Fav = { UserID: $.auth.access.sub, Value: value };
        this.rewriteElements();
      },
    },
    filternames: {
      get() {
        return Object.entries(this.schema.properties||{}).filter(([name,prop]) => prop.filter).map(([name,prop]) => name);
      },
    },
    fieldDefault: {
      value: function () {
        for (var attributeName in this.properties) { if (this.properties[attributeName].default) break; }
        if (!attributeName) for (var attributeName in this.properties) { if (this.properties[attributeName].kop === 0) break; }
        return this.properties[attributeName];
      },
    },
    flag: {
      get(){
        return this.data.flag || false;
      },
    },
    flagState: {
      value: function (){
        const today = new Date();
        if (String(this.FinishDateTime)){
          return 'done';
        } else if (String(this.EndDateTime)){
          let daysLeft = Math.round((new Date(this.EndDateTime) - today) / 1000 / 60 / 60 / 24);
          if (daysLeft > 28) return '4weeks';
          if (daysLeft > 21) return '3weeks';
          if (daysLeft > 14) return '2weeks';
          if (daysLeft > 7) return 'nextweek';
          if (daysLeft > 1) return 'thisweek';
          if (daysLeft > 0) return 'tomorrow';
          if (daysLeft == 0) return 'today';
          return 'overdate';
        }
        return '';
      },
    },
    flagMenu: {
      value: {
        vandaag: { title: 'Vandaag', className: 'flag', flag: 'today', onclick: e => {
          // console.debug(this, new Date().toISOString().substr(0, 10));
          this.FinishDateTime = '';
          this.EndDateTime = new Date().toISOString().substr(0, 10) + 'T17:00:00';
          // this.item.set({ FinishDateTime: '', EndDateTime: aDate().toISOString().substr(0, 10) });
        }},
        morgen: { title: 'Morgen', className: 'flag', flag: 'tomorrow', onclick: e => {
          const today = new Date();
          const endDate = new Date();
          endDate.setDate(today.getDate() + (0 < today.getDay() < 5 ? 1 : 3));
          this.FinishDateTime = '';
          this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
        }},
        dezeweek: { title: 'Deze week', className: 'flag', flag: 'thisweek', onclick: e => {
          const today = new Date();
          const endDate = new Date();
          endDate.setDate(today.getDate() + (5 - today.getDay()));
          this.FinishDateTime = '';
          this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
        }},
        volgendeWeek: { title: 'Volgende week', className: 'flag', flag: 'nextweek', onclick: e => {
          const today = new Date();
          const endDate = new Date();
          endDate.setDate(today.getDate() + 7 + (5 - today.getDay()));
          this.FinishDateTime = '';
          this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
        }},
        over2weken: { title: 'Over 2 weken', className: 'flag', flag: '2weeks', onclick: e => {
          const today = new Date();
          const endDate = new Date();
          endDate.setDate(today.getDate() + 14 + (5 - today.getDay()));
          this.FinishDateTime = '';
          this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
        } },
        over3weken: { title: 'Over 3 weken', className: 'flag', flag: '3weeks', onclick: e => {
          const today = new Date();
          const endDate = new Date();
          endDate.setDate(today.getDate() + 21 + (5 - today.getDay()));
          this.FinishDateTime = '';
          this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
        } },
        over4weken: { title: 'Over 4 weken', className: 'flag', flag: '4weeks', onclick: e => {
          const today = new Date();
          const endDate = new Date();
          endDate.setDate(today.getDate() + 28 + (5 - today.getDay()));
          this.FinishDateTime = '';
          this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
        } },
        none: { title: 'Geen', className: 'flag', flag: '', onclick: e => {
          this.EndDateTime = '';
        } },
        // datum: { title: 'Datum', className: 'calendar', onclick: e => {
        // 	// console.debug(this.item);
        // } },
        gereed: { title: 'Gereed', className: 'flag', flag: 'done', onclick: e => {
          const today = new Date();
          this.FinishDateTime = today.toISOString().substr(0, 19);
        } },
      },
    },
    forEach: {
      value: $.prototype.forEach,
    },
    fullName: {
      get(){
        var text = [this.classItemName], item = this.master;
        while (item){
          if (item.tag) text.unshift(item.classItemName);
          item = item.master;
        }
        return text.join('_');
      },
    },
    fullTag: {
      get(){
        var text = [this.classTag], item = this.master;
        while (item){
          if (item.tag) text.unshift(item.classTag);
          item = item.master;
        }
        return text.join('.');
      },
    },
    from: {
      get(){
        return this.data.from || 0;
      },
    },
    get: {
      value: function () {
        return this.api().select('*').get();
      },
    },
    getrel: {
      value: function (name, root){
        if (!this[name]) return;
      },
    },
    getPropertyAttributeName: {
      value: function (propertyName){
        for (var attributeName in this.properties){
          if (this.properties[attributeName].idname == propertyName){
            return attributeName;
          }
        }
      },
    },
    getValue: {
      value: function (name) {
        if (this.data && this.data[name]) {
          const data = [].concat(this.data[name]);
          const value =
          data.find(value => typeof value === 'object' && value.SrcID == this.data.ID && 'Value' in value) ||
          data.find(value => typeof value === 'object' && 'Value' in value) ||
          data.shift();
          // console.log(value);
          // // console.debug(name, this.data[name]);
          // value = value
          // .filter(value => value.Value)
          // .map(value => value.Value)
          // .shift() ||
          // value
          // .filter(value => value.SrcValue)
          // .map(value => value.SrcValue)
          // .shift();
          return typeof value === 'object' ? value.value || value.Value : value;
        }
        return null;
      },
    },
    getIndex: {
      value: function (name, to) {
        if (this.data[name] && to) {
          to = to instanceof Item ? to : $(to.tag);
          const attribute = [].concat(this.data[name]).find(attr => attr.AttributeName === name && attr.LinkID === to.ID) || {};
          return attribute.Data;
        }
      },
    },
    getDisplayValue: {
      value: function (attributeName) {
        return $.attr.displayvalue(this.getValue(attributeName), ((this.schema||{}).properties||{})[attributeName]);
      },
    },
    hasAttach: {
      get(){
        return Object.values((this.schema || {}).properties || {}).find(property => property.format === 'files' && this.data[property.name]) ? true : false;
      },
    },
    hasAttachments: {
      get(){
        return this.data.hasAttachments || false;
      },
    },
    _hasChildren: {
      get(){
        if (this.data && this.data.children) return true;
        // console.debug(this.data);
        return this.getValue('HasChildren');
        const children = this.data.Children || this.data.children;
        return children ? children.length > 0 : this.getValue('HasChildren');
      },
    },
    hasChildren: {
      get(value){
        new $(this).elements.forEach(element => {
          if (element.hasAttribute('open')){
            if (value){
              if (element.getAttribute('open') === ''){
                element.setAttribute('open', 0);
                element.onopen = e => this.open();
                element.onclose = e => this.close();
              }
            } else {
              element.setAttribute('open', '');
              element.onopen = null;
              element.onclose = null;
              console.debug('REMOVE OPEN', element.getAttribute('open'), element);
            }
          }
        });
      },
    },
    hasImage: {
      get(){
        return this.hasAttach && $.object.isFile(this.files[0]);
      },
    },
    header0: {
      get() {
        // return this.getValue('header0') || this.getValue('Title') || this.getValue('Name') || this.title || this.name || this.tag || '';
        // console.log(this.data);
        // return this.data.header0.value;
        var value = this.headerValue(0,'header0') || this.getValue('header0') || this.getValue('Title') || this.getValue('Name') || this.title || this.name || this.tag || '';
        return (typeof value === 'object' ? value.value || value.Value : value);
      },
      set(value) {
        this[this.headerId(0)[0]] = value;
      },
    },
    header1: {
      get() {
        return this.headerValue(1,'header1');
      },
    },
    header2: {
      get() {
        return this.headerValue(2,'header2');
      },
    },
    headerId: {
      value: function (id) {
        return this.schema.header && this.schema.header[id] ? this.schema.header[id] : Object.entries(this.schema.properties).filter(([name,prop]) => prop.header === id).map(([name,prop]) => name);
      },
    },
    headerValue: {
      value: function (id,name) {
        if (this.hasDetails) {
          const headerValue = this.headerId(id).map(name => String(this.getValue(name)||'').stripTags()).filter(Boolean).join(' ').substr(0,500) || null;
          const value = this.getValue(name) || null;
          // console.debug(headerValue, value)
          if (headerValue != value) {
            // console.warn([headerValue, value]);
            this.attr(name, headerValue, true);
          }
        }
        return this.getValue(name)||'';
      },
    },
    iconsrc: {
      get(){
        if (!this.files || !this.files.length) return '';
        for (var i = 0, f; f = this.files[i]; i++){
          if ($.object.isFile(f)){
            break;
          }
        }
        if (f && f.src && f.src[0] == '/'){
          f.src = 'https://aliconnect.nl' + f.src;//// console.debug(f.src);
        }
        return f ? f.src : '';
      },
    },
    _index: {
      get(){
        return Number(this.getIndex('Master', this.parent));
      },
    },
    index: {
      get(value){
        if (this.parent) this.Master = { LinkID: this.parent.data.ID, Data: value };
      },
    },
    init: {
      value: function () {},
    },
    ID: {
      get(){
        return this.data.ID;
      },
    },
    id: {
      get(){
        return this.data.ID;
      },
    },
    importance: {
      get(){
        return this.data.importance || 0;
      },
    },
    isClass: {
      get(){
        return this.data && this.data.Class && [].concat(this.data.Class).shift().LinkID == 0 ? true : false;
      },
    },
    isInherited: {
      get(){
        // console.debug(this.tag,this.header0,this.data.InheritedID);
        return this.getValue('InheritedID') ? 1 : 0;//this.data && this.data.InheritedID;
      },
    },
    isDraft: {
      get(){
        return this.data.isDraft || false;
      },
    },
    lastModified: {
      get(){
        return dateText(this.data.LastModifiedDateTime);
      },
    },
    lastModifiedDateTime: {
      get(){
        return this.data.lastModifiedDateTime;
      },
    },
    lastModifiedBy: {
      get(){
        var value = (this.data || {}).lastModifiedBy || '';
        value = value.user || value;
        value = value.displayName || value.Value || value.value || value || '';
        return value;
      },
    },
    modified: {
      get(){
        return !this.LastModifiedDateTime ? '' : (!this.LastVisitDateTime ? 'new' : (new Date(this.LastModifiedDateTime).valueOf() > new Date(this.LastVisitDateTime).valueOf() ? 'modified' : ''));
      },
    },
    movetoidx: {
      value: async function (parent, index, noput){
        return parent.append(this, index === undefined ? 99999 : index, true);
        // return;
        // DEBUG: CLASS LOGICA
        if (this.isClass && master.isClass){
          this.srcID = master.id;
        } else if (this.isClass && !master.isClass){
          if (confirm("Class '" + this.Title + "' moved into object '" + master.Title + "', do you want to instantiate?")) return this.copytoidx(master, index);
          if (confirm("Make '" + this.Title + "' a derived class from '" + master.Title + "'?")) set.srcID = master.id;
          else if (!confirm("Continue move?")) return;
        } else if (!this.isClass && master.isClass){
          if (confirm("Object '" + this.Title + "' moved into class '" + master.Title + "', make this an inherited?")) set.srcID = master.id;
          //else if (!confirm("Continue move?")) return;
        }
      },
    },
    moveup: {
      value: function () {
        return $.link({
          item: this,
          to: this.parent,
          name: 'Master',
          index: this.index - 1,
          action: 'move',
        });
        // return this.parent.append(this, this.index - 1);
        // if (this.index > 0){
        //   this.movetoidx(this.parent, this.index - 1);
        // }
      },
    },
    movedown: {
      value: function (e){
        return $.link({
          item: this,
          to: this.parent,
          name: 'Master',
          index: this.index - 1,
          action: 'move',
        });
        // return this.parent.append(this, this.index + 1);
        // if (this.index < this.parent.items.length - 1){
        //   this.movetoidx(this.parent, this.index + 1);
        // }
      },
    },
    model2d: {
      value: function (e) {
        //console.debug('MODEL 2d', this.id, this.ID, this.tag, this, this.item);
        //get:{masterID: this.id} ?
        new $.HttpRequest($.config.$, 'GET', `/item(${this.id})/model2d`, e => {
          self.innerText = '';
          self.createElement('DIV', 'row top btnbar np', { operations: {
            filter: { Title: 'Lijst filteren', onclick: function(e) { $.show({ flt: get.flt ^= 1 }); } },
          } });
          function ondrop (e) {
            //console.debug(e, this, e.clientX, e.clientY);
            e.stopPropagation();
            var childItem = $.dragdata.item;
            with (this.newTag = this.createElement('DIV', { Title: childItem.Title, className: 'symbol icn ' + childItem.schema + " " + childItem.typical + " " + (childItem.name || childItem.Title) + " " + childItem.id, item: childItem, id: childItem.id, value: 1 })) {
              style.top = (e.offsetY - 25) + 'px';
              style.left = (e.offsetX - 25) + 'px';
            }
            var children = [];
            new $.HttpRequest($.config.$, 'POST', `/item(${this.id})/model2d`, {
              masterID: this.id,
              childID: childItem.id,
              offsetTop: this.newTag.offsetTop,
              offsetLeft: this.newTag.offsetLeft,
            });
            return false;
          };
          this.elContent = self.createElement('DIV', 'row aco model2d', { id: this.get.masterID, ondrop: ondrop });
          this.data.forEach(row => {
            var childItem = $.getItem(row.id);
            let el = this.elContent.createElement('DIV', { Title: row.Title, className: 'symbol icn ' + row.schema + " " + row.typical + " " + (childItem.name || childItem.Title) + " " + row.id, id: row.id, value: childItem.Value, onclick: Element.onclick, set: { schema: row.schema, id: row.id } });
            el.style.top = (row.offsetTop) + 'px';
            el.style.left = (row.offsetLeft) + 'px';
          });
        }).send();
      },
    },
    name: {
      get() {
        return this.getValue('name') || this.getValue('Name') ;
      },
    },
    networkdiagram: {
      value: function (e) {
        new $.HttpRequest($.config.$, 'GET', `/item(${this.item.id})/network`, e => {
          //console.debug(this.src, this.data);
          new $.graph(Listview.createElement('DIV', { className: 'slidepanel col bgd oa pu', }), this.data);
          //if (!$.graph.init()) return;
          //$.graph(Listview.createElement('DIV', { className: 'slidepanel col bgd oa pu', }), this.data);
        }).send();
      },
    },
    on: {
      value: $.prototype.on,
    },
    options: {
      value: function (attr){
        const properties = (this.schema || {}).properties || {};
        const property = properties[attr] || {};
        const options = property.options || {};
        const value = this[attr] || '';
        const option = value.split(',').map(v => options[v] || { color: '' });
        return [option, options];
      },
    },
    parent: {
      get() {
        if (this.elemTreeLi && this.elemTreeLi.elem.parentElement) {
          return this.elemTreeLi.elem.parentElement.item;
        }
        return this.data.Master ? $([].concat(this.data.Master).shift()) : null
        // return this.elemTreeLi && this.elemTreeLi.elem.parentElement ? this.elemTreeLi.elem.parentElement.item : null;
      },
    },
    properties: {
      get(){
        return this.schema.properties;
      },
    },
    post: {
      value: function (postfields) {
        setItems([{ id: this.id, schema: this.schema, values: postfields }], true);
      },
    },
    popout: {
      value: function (left = 0,top = 0,width = 600,height = 600) {
        const item = this;
        var url = document.location.origin;
        var url = 'about:blank';
        if (item.popoutWindow) {
          return item.popoutWindow.focus();
        }
        const win = item.popoutWindow = window.open(url, item.tag, `top=${top},left=${left},width=${width},height=${height}`);
        // //console.log(window.innerHeight,window.outerHeight,window.outerHeight-window.innerHeight,window.screen,this.elem.getBoundingClientRect());
        window.addEventListener('beforeunload', e => win.close());
        const doc = win.document;
        //console.log(pageHtml);
        doc.open();
        doc.write(pageHtml);
        doc.close();
        win.onload = function (e) {
          const $ = this.$;
          $(this.document.documentElement).class('app');
          $(this.document.body).class('col $ om bg').id('body').append(
            $('section').class('row aco main').append(
              $('section').class('col aco apv printcol').id('view'),
            ),
          );
          console.log(item);
          $('view').show(item);
          win.addEventListener('beforeunload', e => item.popoutWindow = null);
        }
        // win.$.on('load', e => {
          //   win.elem = win.$(doc.body)
          //   win.elem.append(
            //     $('div').text('JAsfdssdfgs')
            //   )
            // })
            //popout: { schema: this.schema, id: this.id, uid: this.uid, onclick: $.windows.open },
            //
            // dragItems.forEach(item => window.open(
              //   document.location.href.split('/id').shift()+'/id/'+ btoa(item['@id']),
              //   '_blank',
              //   'width=640, height=480, left=' + (e.screenX || 0) + ', top=' + (e.screenY || 0)
              // ));
            },
          },
    receivedDateTime: {
      get(){
        return this.data.receivedDateTime || 0;
      },
    },
    reindex: {
      value: function (e){
        return $.promise( 'Reindex', async resolve => {
          // return;
          if (this.hasChildren){
            console.warn('reindexOOOO1');
            const children = await this.children;
            console.warn('reindexOOOO', children);
            if (this.elemTreeLi) this.elemTreeLi.emit('toggle');
            children.forEach((child, i) => {
              if (child.elemListLi && child.elemListLi.elem && child.elemListLi.elem.parentElement){
                child.elemListLi.elem.parentElement.appendChild(child.elemListLi.elem);
              }
            });
          }
          resolve(this);
        });
      },
    },
    refresh: {
      value: function (row){
        const deadline = {
          'done': 'Gereed',
          'overdate': 'Te laat',
          'today': 'Vandaag',
          'tomorrow': 'Morgen',
          'thisweek': 'Deze week',
          'nextweek': 'Volgende week',
          'afternextweek': 'Later',
          '': 'Geen'
        };
        this.filterfields = this.filterfields || {
        };
        this.filterfields.Deadline = deadline[this.flagState()];
        this.filterfields.Bijlagen = this.hasAttach ? 'Ja' : 'Nee';
        this.filterfields.Status = this.state;
        this.filterfields.Schema = this.schema;
        if (this.elLvLi) this.elLvLi.rewrite();
        if (this.createTreenode) this.createTreenode();
      },
    },
    refreshAttribute: {
      value: function (attributeName){
      },
    },
    refreshAttributes: {
      value: function (){
        var s = new Date();
        var attributes = {
          Title: { displayvalue: this.Title }, Subject: { displayvalue: this.Subject }, Summary: { displayvalue: this.Summary }, ModifiedDT: { displayvalue: this.modifiedDT = new Date().toISOString() }
        };
        if (this.data)
        for (var attributeName in this.data)
        if (!attributes[attributeName]) attributes[attributeName] = {
          value: this.data[attributeName].value, displayvalue: this.properties[attributeName].displayvalue
        };
        //this.ModifiedDT = (this.data.ModifiedDT = this.data.ModifiedDT || {}).value =
        //this.modifiedDT = attributes.ModifiedDT = new Date().toISOString();
        for (var i = 0, e, c = document.getElementsByClassName(this.id) ; e = c[i]; i++){
          //$.Alert.appendAlert({ id: 1, condition: 1, Title: 'TEMP HOOG', created: new Date().toISOString(), categorie: 'Alert', ack: 0 });
          //if (row.attr) for (var name in row.attr) if (row.attr[name]) e.setAttribute(name, row.attr[name]); else e.removeAttribute(name);
          for (var attributeName in attributes){
            //if (attributeName == 'ModifiedDT') // console.debug(attributeName, attributes[attributeName]);
            var displayvalue = attributes[attributeName].displayvalue, value = attributes[attributeName].value;//typeof attributes[attributeName] == 'object' ? attributes[attributeName].value : attributes[attributeName];
            //if (attributeName=='Value') // console.debug('hhhhhh', attributeName, displayvalue);
            displayvalue = String(displayvalue).split('-').length == 3 && String(displayvalue).split(':').length == 3 && new Date(displayvalue) !== "Invalid Date" && !isNaN(new Date(displayvalue)) ? new Date(displayvalue).toISOString().substr(0, 19).replace(/T/, ' ') : displayvalue;
            displayvalue = (isNaN(displayvalue) ? displayvalue : Math.round(displayvalue * 100) / 100);
            //if (attributeName == "CriticalFailure") // console.debug('REFESH', this.id, this.Title, attributeName, e.getAttribute(attributeName), val);
            if (e.hasAttribute(attributeName) && e.getAttribute(attributeName) != value){
              e.setAttribute(attributeName, value);
              e.setAttribute('modified', new Date().toLocaleString());
            }
            for (var i1 = 0, e1, c1 = e.getElementsByClassName(attributeName) ; e1 = c1[i1]; i1++){
              if (e1.hasAttribute('checked')){
                if (value) e1.setAttribute('checked', ''); else e1.removeAttribute('checked');
                e1.setAttribute('modified', new Date().toLocaleString());
              }
              else if ("value" in e1){
                if (e1.value != value){
                  e1.value = value;
                  e1.setAttribute('modified', new Date().toLocaleString());
                }
              }
              else if (e1.hasAttribute('value')){
                if (e1.getAttribute('value') != value){
                  e1.setAttribute('value', value);
                  e1.setAttribute('modified', new Date().toLocaleString());
                }
              }
              else if (['SPAN', 'DIV', 'TD'].indexOf(e1.tagName) != -1){
                //if (attributeName == "CriticalFailure") // console.debug('REFESH', this.id, this.Title, attributeName, e.getAttribute(attributeName), val);
                //MKAN DIsplay value of value, probleem DMS
                e1.innerHTML = displayvalue != undefined ? displayvalue : "";
                e1.setAttribute('modified', new Date().toLocaleString());
              }
            }
          }
        }
      },
    },
    remove: {
      value: function (){
        console.warn('remove', this);
        if (this.parent){
          if (this.parent.items){
            this.parent.items.splice(this.parent.items.indexOf(this), 1);
            this.elemTreeLi.elem.remove();
            if (this.parent) {
              this.parent.reindex();
            }
            // $.delay(this.parent.reindex);
          }
        }
        Object.entries(this).filter(elem => elem instanceof Element).forEach(elem => elem.remove());
      },
    },
    rewriteElements: {
      value: function (){
        [...document.getElementsByClassName(this.tag)].forEach(element => element.rewrite ? element.rewrite() : null);
      },
    },
    replyTo: {
      get(){
        return this.data.replyTo || 0;
      },
    },
    schemaColor: {
      get() {
        return (this.data||{}).color || (this.schema||{}).color || '';
      },
    },
    set: {
      value: function (values, onload){
        api.request({
          put: { value: [{ schema: this.schema, id: this.detailID || this.id, values: values }] },
          item: this
        }, onload || function (){
          // console.debug('SET DONE', this.src, this.put, this.data);
          //if (this.item.id == get.id) this.item.reload();
        });
        this.refresh();
        this.show();
      },
    },
    setAttribute: {
      value: function (selector, context){
        if (window.document && this.elems) {
          this.elems.forEach( elem => elem.attr(selector, context))
          // Object.entries(this).filter(entry => entry[1] instanceof Element).forEach(entry => context === undefined ? entry[1].removeAttribute(selector) : entry[1].setAttribute(selector, context))
        }
      },
    },
    sender: {
      get(){
        return this.data.sender || 0;
      },
    },
    selectitem: {
      value: function (e) {
        if (e) {
          ////console.debug('selectitem stopPropagation');
          e.stopPropagation();
          return this.item.selectitem();
        }
        this.selectitemset(this.elemTreeLi.getAttribute('sel') ^ 1);
      },
    },
    selectitemcheckchildren: {
      value: function (value) {
        if (isnull(this.selected, false) !== false) {
          this.selectcnt = 0;
          for (var i = 0, e; e = this.items[i]; i++) if (e.selected) this.selectcnt += 1;
          if (this.selectcnt) this.selectitemset(1);
          else this.selectitemset(0);
          if (this.parent && this.parent.selectitemcheckchildren) this.parent.selectitemcheckchildren();
        }
      },
    },
    selectitemset: {
      value: function (value) {
        if (this.groupname) {
          var c = this.elemTreeLi.parentElement.children;
          for (var i = 0, e; e = c[i]; i++) if (e.item.groupname == this.groupname && e.item.selected) {
            e.setAttribute('sel', 0);
            e.item.selected = 0;
            e.item.set({ selected: e.item.selected });
            e.item.close();
          }
        }
        var a = [];
        var ia = [];
        e = this.elemTreeLi;
        if (value) {
          while (e.item) {
            a.push(e);
            e = e.parentElement.parentElement;
          }
        }
        else
        a.push(e);
        var c = this.elemTreeLi.getElementsByTagName('LI');
        for (var i = 0, e; e = c[i]; i++) a.push(e);
        for (var i = 0, e; e = a[i]; i++) {
          e.item.selected = value;
          e.setAttribute('sel', value);
        }
        this.set({ selected: value });
      },
    },
    sentDateTime: {
      get(){
        return this.data.sentDateTime || 0;
      },
    },
    setClass: {
      value: function (className, unique) {
        this.elements.forEach(elem => elem.className = elem.className.split(' ').concat(className).filter((value, index, self) => self.indexOf(value) === index).join(' '));
      },
    },
    setChecked: {
      value: function (checked) {
        this.checked = checked;
        // 	if (!item.elemTreeLi.getAttribute('checked')) {
        // 		item.elemTreeLi.removeAttribute('checked');
        // 	}
        let elements = [this.elemListLi,this.elemTreeLi];
        if (this.checked) {
          $.clipboard.push(this);
          elements.forEach((elem)=>{
            if (elem) {
              elem.setAttribute('checked', '');
            }
          });
        } else {
          $.clipboard.remove(this);
          elements.forEach((elem)=>{
            if (elem) {
              elem.removeAttribute('checked');
            }
          });
        }
      },
    },
    setFocus: {
      value: function () {
        // if ($.focusItem) {
        //
        // }
        // $.focusItem = this;
        // this.checked = checked;
        // // 	if (!item.elemTreeLi.getAttribute('checked')) {
        // // 		item.elemTreeLi.removeAttribute('checked');
        // // 	}
        // let elements = [this.elemListLi,this.elemTreeLi];
        // if (this.checked) {
        // 	$.clipboard.push(this);
        // 	elements.forEach((elem)=>{
        // 		if (elem) {
        // 			elem.setAttribute('checked', '');
        // 		}
        // 	});
        // } else {
        // 	$.clipboard.remove(this);
        // 	elements.forEach((elem)=>{
        // 		if (elem) {
        // 			elem.removeAttribute('checked');
        // 		}
        // 	});
        // }
      },
    },
    show: {
      value: function (e) {
        if (e) return this.item.show();
        //if ()
        // get.id = this.id;
        if (colpage.item && colpage.item.editing) colpage.item.editclose();
        this.PageElement();
        if ($.his.err) {
          var c = $.his.err.children;
          for (var i = 0, elErrRow; elErrRow = c[i]; i++) if (elErrRow.meshitem.src.itemID == this.id) break;
          if (elErrRow) {
            elErrRow.accept = new Date();
            elErrRow.elAccept.innerText = elErrRow.accept.toISOString().substr(11, 8);
            elErrRow.refresh();
          }
        }
      },
    },
    showinfo: {
      value: function () {
        //this.load(function() {
        colinfo = document.getElementById('colinfo') || document.body.createElement('SECTION', 'col ainf', {id: 'colinfo'});
        colinfo.innerText = '';
        setTimeout(() => {
          colinfo.createElement([
            this.createHeaderElement(),
            ['DIV', 'row top btnbar', [
              ['A', 'abtn icn form r', ]
            ]]
          ]);
        })
        // with (colinfo.createElement('DIV', { className: 'row top btnbar' })) {
        // 	createElement('A', {
        // 		className: 'abtn icn form r', onclick: Element.onclick, par: { id: this.itemID, lid: this.itemID }, onclick: function(e) {
        // 			//console.debug('show ifo');
        // 			e.stopPropagation();
        // 			private.info.innerText = '';
        // 		}
        // 	});
        // }
        // var elDetails = createElement('DIV', { className: 'details' });
        // elDetails.createElement('DIV', { className: 'name', innerText: this.Title });
        // this.writedetails(elDetails);
        //});
      },
    },
    state: {
      get(){
        const data = this.data.State || '';
        return data.Value || data;
      },
    },
    stateElementArray: {
      value: function () {
        if (this.properties && this.properties.state && this.properties.state.options) {
          return ['DIV', 'stateicon', {
            // item: this,
            contextmenu: this.properties.state.options,
            onselect: e => {
              //console.log(e);
              let el = [...e.path].find(el => el.value);
              this.state = el.value;
            },
          }, [
            ['SPAN', 'state', {
              style: 'background-color:' + (this.state ? this.state.color : ''),
            }]
          ]]
        } else {
          return [];
        }
      },
    },
    _stateColor: {
      get(){
        return (((((this.schema || {}).properties || {}).State || {}).options || {})[((this.data || {}).State || {}).Value] || {}).color;
      },
    },
    stateColor: {
      get(){
        return this.properties && this.properties.State && this.properties.State.options && this.properties.State.options[this.State] ? this.properties.State.options[this.State].color : 'inherited';
      },
    },
    scope: {
      get(){
        // let isFavorite = 'Fav' in this ? Number(this.Fav) : private.fav.includes(this.tag);
        // console.debug('isFavorite', isFavorite);
        let userId = Number(this.UserID);
        if (!userId) return 'public';
        if (userId && userId == $.auth.access.sub) return 'private';
        return 'read';
      },
      set(value){
        /// console.debug(value);
        const values = {
          private: () => this.UserID = $.auth.access.sub,
          public: () => this.UserID = 0,
        }[value]();
        this.rewriteElements();
        // values[value]();
        // let id = this.tag;
        // private.fav.splice(private.fav.indexOf(id), 1);
        // if (value){
        // 	private.fav.unshift(this.tag);
        // }
        // console.debug('SET FAV', private.fav, this.tag, this.id, value, $.auth.access.sub);
        // this.Fav = { UserID: $.auth.access.sub, Value: value };
        // this.rewriteElements();
      },
    },
    source: {
      get(){
        return this.data && this.data.Src ? $([].concat(this.data.Src).shift()) : null;
      },
    },
    sourceName: {
      get() {
        // console.debug(this.data.Source);
        return this.data && this.data.Src
        ? [].concat(this.data.Src)
        .filter(v=>v['@id'])
        .map(v=>v['@id'].match(/(\w+)\(\d+\)/)[1])
        .shift()
        : null;
        // return this.data.schemaPath ? this.data.schemaPath.split('/')[1] : '';
      },
    },
    submit: {
      value: function (e) {
        if (e) e.preventDefault();
        this.remove();
        return;
        //// //console.debug('SUBMIT', this, this.elUsers.innerText, this.oldusers);
        var item = { id: this.id };
        //// //console.debug(this.oldusers, this.elUsers.innerText);
        if (this.elUsers && this.oldusers != this.elUsers.innerText) {
          var users = (this.link = this.link || {}).users = [];
          item.userlist = {};
          for (var i = 0, e, c = this.elUsers.getElementsByTagName('A') ; e = c[i]; i++) if (e.id) users.push(item.userlist[e.innerText] = e.id);// || e.getAttribute('itemID') || '';
        }
        // //console.debug('SUBMIT ITEM', item);
        $.ws.request({
          to: [ { sub: $.auth.sub } ],
          showNotification: [this.Title, {
            // title: 'Come',
            tag: this.ID,
            body: 'Modified', //this.Subject,
            click_action: document.location.href,
            data: { click_action: document.location.href },
            actions: [ {action: "open_url", title: "Read Now"} ],
          }]
        });
        // (new $.showNotification(this.Title, {
        // 	// title: 'Come',
        // 	tag: this.ID,
        // 	body: 'Modified', //this.Subject,
        // 	click_action: document.location.href,
        // 	data: { click_action: document.location.href },
        // 	actions: [ {action: "open_url", title: "Read Now"} ],
        // })).send();
        //// //console.debug('item.submit', document.activeElement);
        this.editclose();
        setTimeout(function(item) {
          //// //console.debug(item);
          //return;
          new $.HttpRequest($.config.$, 'PATCH', `/item(${item.id})`, item, {
            query: { reindex: 1 },
          }).send();
        }, 10, item);
        // //console.log(this);
        // this.remove();
      },
    },
    // schema: {
    //   value: {
    //     properties: {}
    //   },
    // },
    toRecipients: {
      get(){
        return this.data.toRecipients || 0;
      },
    },
    tooltipText: {
      get(){
        return;
        var s = '';
        var fnames = 'keyname, name, fullName, tag, fullTag'.split(', ');
        for (var i = 0, name; name = fnames[i]; i++) if (this[name]) s += name + ':' + this.getAttribute(name) + "\r\n";
        return s;
      },
    },
    typicalIdx: {
      get(){
        if (!this.master) return null;
        var index = 0;
        for (var i = 0, item; item = this.master.Children[i]; i++){
          if ('selected' in item && item.selected == 0) continue;
          if (item.srcID == this.srcID) index++;
          if (item == this) return index;
        }
      },
    },
    type: {
      get(){
        if (this.data){
          const parent = this.parent;
          const sourceID = this.data.Src ? Number([].concat(this.data.Src).shift().LinkID) : null;
          if (sourceID) {
            const masterID = this.parent ? this.parent.ID : null;
            if (this.getValue('InheritedID')) {
              return 'inherit';
            } else if (![...$().schemas().values()].some(schema => schema.ID == sourceID)) {
              // console.debug(sourceID, [...$().schemas().values()].some(schema => schema.ID == sourceID));
              return 'copy';
            }
          }
        }
        return 'nodata';
      },
    },
    url: {
      get() {
        return (this.data||{})['@id'] || '/'+this.schemaName;
      },
    },
    viewstate: {
      get(){
        return $.his.items[this.data.ID] ? 'read' : 'new';
      },
    },
  });

  if (!window.document) {
    return module.exports = Aim;
  }

  Elem = function Elem (elem) {
    const args = [...arguments];
    elem = this.elem = args.shift();
    this.elem.selector = this.elem.is = this;
    this.map = new Map();
    if (args.length){
      if (typeof this[elem.id] === 'function'){
        // console.debug(elem.id);
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
  [
    'parentElement',
    'nextSibling'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    get() {
      return this.elem[name] ? this.elem[name].is : null;
    },
    enumerable: true,
    configurable: true,
  }));
  [
    'default',
    'autoplay'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function attr() {
      return this.attr(name, '');
    }
  }));
  [
    'focus',
    'select'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function fn() {
      console.log(name, typeof this.elem[name]);
      this.elem[name](...arguments);
      // if (typeof this.elem[name] === 'function'){
      //   this.elem[name](...arguments);
      // }
      return this;
    }
  }));
  [
    'draggable'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
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
    enumerable: false,
    configurable: false,
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
    // 'class',
    // 'code',
    'codebase',
    'color',
    'cols',
    'colspan',
    'content',
    'contenteditable',
    // 'contextmenu',
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
    // 'displayvalue',
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
    // 'id',
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
    // 'list',
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
    // 'open',
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
    // 'tag',
    'title',
    'translate',
    // 'type',
    'usemap',
    'value',
    'width',
    'wrap'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function attrValue() {
      return this.attr(name, ...arguments);
    }
  }));
  [
    'click',
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function exec() {
      this.elem[name](...arguments);
      return this;
    }
  }));
  [
    'submit',
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    configurable: false,
    value: function emit() {
      this.emit(name, ...arguments);
      return this;
    }
  }));
  Object.assign(Elem.prototype, {
    // action() {
    //   return this.attr('action', ...arguments)
    // },
    append() {
			this.elem = this.elem || document.body;
      // const args = [].concat(...arguments);
      // console.log(arguments, args);
      Array.from(arguments).forEach(arg => {
        if (typeof arg === 'string') {
          this.elem.append(document.createTextNode(arg));
        } else if (Array.isArray(arg)) {
          arg.forEach(arg => this.append(arg));
        } else if (arg instanceof Elem) {
          this.elem.append(arg.elem);
        } else if (arg) {
          this.elem.append(arg);
        }
      });
			// args.forEach(a => a ? this.elem.append(typeof a === 'string' ? document.createTextNode(a) : a.elem || a) : null);
			return this;
		},
    accept_scope(scope, socket_id) {
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
    attr(selector, context, save) {
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
          // } else if (selector in this.elem) {
          //   this.elem[selector] = context;
          } else {
            this.elem.setAttribute(selector, [].concat(context).join(' '))
          }
        }
      }
      return this;
    },
    assign(selector, context) {
			if (typeof selector === 'string') {
				this.elem[selector] = context;
			} else if (selector instanceof Object) {
				Object.assign(this.elem, context);
			}
			// //console.log(this.elem);
			return this;
		},
    btns(selector, context) {
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
    },
    cam() {
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
    },
    cancel() {
      this.elem.innerText;
			// if (this.elem.innerText) {
			// 	if (this.selector.contains(this.form)) {
			// 		this.form.remove();
			// 	} else {
			// 		this.selector.innerText = '';
			// 	}
			// 	return this;
			// } else {
			// 	return false;
			// }
			// el.innerText = '';
			// targetElement.item = null;
			// if ($.show) $.show({ id: 0 });
			// if (window.onWindowResize) window.onWindowResize();
		},
    caption() {
      return this.attr('caption', __(...arguments))
    },
    calendar(data) {
			new Calendar(data, this);
			return this;
		},
    chat(selector, context){
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
		},
    checkbox() {
      const property = Object.assign({}, ...arguments);
      // console.log(property);
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
    },
    class(className) {
      // this.elem.className = [].concat(this.elem.className.split(' '), [...arguments]).unique().join(' ').trim();
      this.elem.className = [...arguments].join(' ').trim();
			return this;
		},
    code(content, format) {
      this.class('code');
      if (typeof content === 'function') {
        format = 'js';
        content = String(content).replace(/^(.*?)\{|\}$/g,'');
      }
      content = format && $.string[format] ? $.string[format](content) : content;
      this.elem.innerHTML = content;
      return this;
    },
    contextmenu(menu){
      // console.warn(menu);
      menu = $.extend({}, ...arguments);
      if (!menu.items) console.warn('no items', menu);
      // console.log(menu);
      const menuitems = new Map(Object.entries(menu.items));
      // console.log(menuitems);
      this.tabindex(0);
      this.on('keydown', e => {
        // console.warn('keydown', e.keyPressed);
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
        // window.addEventListener('contextmenu', this.close, true);
        window.addEventListener('click', this.close, true);
        this.elemPopup = $('div')
        .parent(document.body)
        .class('col popup')
        .css('top', top+'px')
        .css('left', Math.max(0, left)+'px')
        .css('max-height', (window.screen.availHeight - top) + 'px')
        // .on('contextmenu', e => e.preventDefault(e.stopPropagation()))
        .append(
          [...menuitems.entries()].map(([name, menuitem]) => $('div').class('row abtn icn').extend(menuitem).extend({srcEvent:e})),
        );
        return;
    		if (this.handlers.menuElement) {
    			this.handlers.menuElement.remove();
    		}
    		// window.addEventListener('mousedown', e => {
    		// 	if (e.path.find(elem => elem === menuElement)) {
    		// 		return;
    		// 	}
    		// }, true);
    		// var menu = $.mainPopup;
    		if (targetElement.popupmenu) {
    			targetElement.right = 0;
    		}
    		// //console.debug('POS', targetElement, targetRect, targetElement.left, targetElement.right);
    		// //console.debug('PUMENU', this, this.menu, menu, pos);
    		menuElement.innerText = '';
    		for (let [menuname, menuitem] of Object.entries(menuItems)) {
    			// let title = __(menuitem.header0 || menuname);
    			// //console.debug('MENUITEM', menuitem, title);
    			if (menuitem.hidden) continue;
    			var linkElement = menuElement.createElement('A', {
    				name: menuname,
    				value: menuname,
    				elMenu: menuElement,
    				left: 5,
    				menuitem: menuitem,
    				popupmenu: menuitem.menu,
    				// item: this.item,
    				onclick: menuitem.onclick || (this.menu ? this.menu.onclick : null) || targetElement.onselect || function (e) {
    					//console.log ('MENU CLICK');
    					e.stopPropagation();
    				},
    				// onselect: this.onselect,
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
    			// var left = pos.right;
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
        // new Popup(e, context);
      });
			// this.elem.contextmenu = context;
			return this;
		},
    messagesPanel() {
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
    },
    css(selector, value) {
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
					// let id = elem === document.body ? '_body' : elem.id;
					// if (id) {
					// 	let css = localStorage.getItem('css');
					// 	css = css ? JSON.parse(css) : {};
					// 	(css[id] = css[id] || {})[selector] = value;
					// 	localStorage.setItem('css', JSON.stringify(css));
					// }
				}
        elem.style.cssText = css.join(';');
			}
			return this;
		},
    dark() {
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
    },
    displayvalue(selector) {
      if (this.elem.item) {
        this.text(this.elem.item.displayvalue(selector));
      }
      return this;
    },
    draw(options) {
			// this.elem = elem('CANVAS', 'aco');
			// setTimeout(() => this.paint = new Paint(this.elem, options));
      this.paint = new Paint(this.elem, options);
			// if (this.selector) {
			// 	this.selector.append(this.elem);
			// }
			// //console.log(this.elem);
			return this;
		},
    insertBefore(newNode, referenceNode) {
      console.log(newNode, referenceNode);
      this.elem.insertBefore(newNode.elem || newNode, referenceNode ? referenceNode.elem || referenceNode : null)
    },
    extend() {
      $.extend(this, ...arguments);
      return this;
    },
    edit(item) {
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
        // TODO: Item Users
        return ['A', 'c ' + row.ID, row.Value || ($.getItem(row.tag) ? $.getItem(row.tag).Title : row.ID), {
					onclick: Web.Element.onclick,
					id: row.ID,
					// innerText: row.Value || ($.getItem(row.tag] ? $.getItem(row.tag].Title : row.ID),
				},[
					['BUTTON', {
						type: 'BUTTON',
						row: row,
						onclick: $.removeUser = (e)=>{
							e.preventDefault();
							e.stopPropagation();
							// //console.log();
							new $.HttpRequest($.config.$, 'DELETE', `/${this.tag}/Users(${e.target.row.ID})`, e => {
								//console.log(e.target.responseText);
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
                //
                // const video = this.cam.video;
                // const canvasElem = $('canvas').parent(panelElem).width(video.videoWidth).height(video.videoHeight).draw();
                // const canvas = canvasElem.paint._canvas;
                // const context = canvasElem.paint._ctx;
                // context.drawImage(video, 0, 0, canvas.width, canvas.height);
                // canvas.toBlob(blob => {
                //   item.elemFiles.appendFile(new File([blob], `image_${new Date().toISOString().replace(/\.|:|Z|-/g,'')}.png`));
                //   // canvas.remove();
                // });
              }),
              $('button').class('abtn close').on( 'click', this.closeCam = e => panelElem.remove() )
              // this.panelElem
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
              // this.panelElem
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
                  icon: 'https://aliconnect.nl/favicon.ico',
                  image: 'https://aliconnect.nl/shared/265090/2020/07/09/5f0719fb8fa69.png',
                  data: {
                    url: document.location.href,
                  },
                  // actions: [
                  //   {
                  //     action: 'new',
                  //     title: 'New',
                  //     // icon: 'https://aliconnect.nl/favicon.ico',
                  //   },
                  //   {
                  //     action: 'open',
                  //     title: 'Open',
                  //     // icon: 'https://aliconnect.nl/favicon.ico',
                  //   },
                  //   // {
                  //   //   action: 'gramophone-action',
                  //   //   title: 'gramophone',
                  //   //   icon: '/images/demos/action-3-128x128.png'
                  //   // },
                  //   // {
                  //   //   action: 'atom-action',
                  //   //   title: 'Atom',
                  //   //   icon: '/images/demos/action-4-128x128.png'
                  //   // }
                  // ]
                }
              }
            }
          });
          // return;
          // var notification = new Notification('sadfasd');
          // notification.onclick = function(e) {
          //   console.log('CLICKED');
          //   window.focus();
          //   // window.open("http://www.stackoverflow.com");
          //   // window.location.href = 'https://aliconnect.nl';
          // }
          // notification.onclick = e => {
          //   console.log('CLICKED');
          //   window.focus();
          // }
          // return;
          //
          // $().notify(`${item.header0} modified`, {
          //   body: `Bla Bla`,
          //   url: 'https://moba.aliconnect.nl',
          //   icon: 'https://aliconnect.nl/favicon.ico',
          //   image: 'https://aliconnect.nl/shared/265090/2020/07/09/5f0719fb8fa69.png',
          //   data: {
          //     href: document.location.href,
          //     url: 'test',
          //   },
          // });
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
    },
    markup(el) {
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
      }
      this.elem.innerHTML = replace.yaml(this.elem.innerText);
      this.elem.markup = true;
      return this;
    },
    editor(lang) {
      // const statusBar =
      // setTimeout(() => {
      //   console.log('EDITOR', this.parentElement);
      //   this.parentElement.insertBefore($('div').text('ja'), this.nextSibling)
      // })
      // this.parentElement.insertBefore($('div').text('pos'), this.nextSibling);
      this.class('code-editor');
      const his = [];
			const elem = this.elem;
      const rectContainer = this.elem.getBoundingClientRect();
      const html = lang ? $.string[lang](elem.innerText) : elem.innerText;
      let rows;
      let selLine;
      // console.log(html);
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
        // this.createRows();
      }
      this.src = url => {

      }
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
			// .css("display:inline-block;width:100%;")
      .on('paste', e => {
        // console.log(e);
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
					// document.execCommand('insertHTML', false, '&#009');
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
          // console.log(el, sel, e.keyCode);
          if (el.hasAttribute('hide')) {
            for (var el; el && el.hasAttribute('hide'); el = e.keyCode >= 39 ? el.nextSibling : el.previousSibling);
            if (el) {
              if (e.keyCode === 37) col=el.innerText.length;
              if (e.keyCode === 39) col=0;
              var range = window.getSelection().getRangeAt(0).cloneRange();
              var [node,pos] = getNode(el, Math.min(col, el.innerText.length));
              // console.log(node,pos);
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

          // console.log('pos', row, col);
          if (!e.ctrlKey) {
            if (e.keyCode >= 0x30 || e.keyCode == 0x20) {
              const rowsOpen = children.map(el => el.getAttribute('open'));
              $(el).markup();
              console.log(el, col);
              setCaret(el, col);

              //
              //
              // // rowsOpen.forEach(i => children[i].setAttribute('open', ''));
              //
              // return;
              //
              // var content = children.map(el => el.innerText.replace(/\n$/, '')).join('\n');
              // his.push(content);
              // // console.log(content);
              // this.elem.innerText = '';
              // this.append(content.split(/\n/).map(l => $('div').html(replace.yaml(l) || '<br>')));
              // var children = Array.from(this.elem.children);
              // var el = children[row];
              //
              // setCaret(col, el);
              // // this.refresh();
              // // console.log('up');
              // // const pos = caret(elem);
              // //
              // // const range = window.getSelection().getRangeAt(0);
              // // const el = range.startContainer.parentElement;
              // // el.innerHTML = replace.yaml(el.innerText);
              // // // console.log(el, el.innerText, el.innerHTML)
              // // // Array.from(this.elem.children).forEach(el => el.innerText = el.innerText);
              // // // js(el);
              // // // this.attr('showall', 1);
              // // // this.text(elem.innerText.replace(/\n\n/gs, '\n'));
              // // // this.attr('showall', null);
              // // // elem.innerHTML = lang ? $.string[lang](elem.innerText) : elem.innerHTML;
              // // // elem.innerText = elem.innerText.replace(/\n\n/gs, '\n');
              // // setCaret(pos, elem);
            }
          }
          // this.elem.getElementsByTagName('SPAN')

        })
			})
		},
    editorCollapse(){

    },
    emit(selector, detail){
			this.elem.dispatchEvent(new CustomEvent(selector, {detail: detail}));
			return this;
		},
    exists(parent) {
			return (parent || document.documentElement).contains(this.elem)
		},
    files(item, attributeName){
      this.item = item;
      this.files = item[attributeName];
      // console.log('FILES', this.files);
      // this.files = [];
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
          // lastModifiedDate: file.lastModifiedDate,
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
          // item[attributeName] = { max:999, Value: JSON.stringify(e.body) };
          item[attributeName] = JSON.stringify(this.files);
          // console.log(item[attributeName]);
          this.emit('change');
          callback(file);
        })
      });
      this.removeElem = (elem, e) => {
        e.stopPropagation();
        elem.remove();
        this.files = [...this.elem.getElementsByClassName('file')].map(e => e.is.get('ofile'));
        // console.log(this.files);
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
            // elem.elem.ofile = ofile;
            return;
            // return elem;
            if (ofile.src) {
              this.src(ofile.src);
            }
            return this;
            const access_token = $.auth.access_token;
            const iss = $.auth.access.iss;
            if (!ofile.src) return imgElement;
            var src = (ofile.srcs || ofile.src) + '?access_token=' + access_token;
            imgElement.src = (src.indexOf('http') === -1 ? ofile.host || "https://" + iss : '') + src;
            var src = (ofile.src) + '?' + ofile.lastModifiedDate;
            imgElement.srcl = (src.indexOf('http') === -1 ? ofile.host || "https://" + iss : '') + src;
            imgElement.alt = ofile.name || '';
            // return imgElement;
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
                      $().ws().sendto($().aliconnector_id, {external: {filedownload: ['http://alicon.nl'+href]}}).then(e => {
                        console.log(e);
                      });
                    }
                  }),
                  // el.elModDate = createElement('SPAN', { className: 'aco', innerText: (ofile.lastModifiedDate ? new Date(ofile.lastModifiedDate).toLocaleString() + ' ' : '') + ((ofile.size) ? Math.round(ofile.size / 1000) + 'kB' : '') });
                  // if (hasEdit) {
                  // 	createElement('A', 'abtn pulldown', { popupmenu: {
                  // 		bewerken: {
                  // 			Title: 'Bewerken',
                  // 			onclick: editFile,
                  // 		},
                  // 	} });
                  // }
                ),
              ),
            );
            elem.elem.ofile = ofile;
            // return elem;
          }
        })
      })
      .emit('change')
    },
		filesNext() {
			this.filesSlide(1);
			if (this.slideIdx == 0 && get.pv) {
				//// //console.debug('NEXT PAGE');
			}
		},
		filesSlide(step) {
			//var elSlide = this.images[this.slideIdx];
			//if (elSlide) {
			//    if (elSlide.pause) this.elSlide.pause();
			//    elSlide.parentElement.removeAttribute('show');
			//}
			this.images = this.elem.getElementsByClassName('aimage');
			//// //console.debug('IMAGES', this.images);
			this.slideIdx += step || 0;
			this.imagesElement.setAttribute('prev', this.slideIdx > 0);
			this.imagesElement.setAttribute('next', this.slideIdx < this.images.length - 1);
			//if (this.slideIdx == 0) this.setAttribute('dir', 'r');
			//if (this.slideIdx < 0) this.slideIdx = this.images.length - 1;
			//// //console.debug(this, step, elSlide, this.slideIdx);
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
				//items.player.elPlaying = elSlide;
				elSlide.play();
			}
			//else
			//    items.player.play();
		},
		forEach(fn, selector, context) {
			if (selector) {
				if (typeof selector !== 'object') {
					return fn.apply(this, [...arguments].slice(1))
				} else {
					Object.entries(selector).forEach(entry => fn.call(this, ...entry))
				}
			}
			return this;
		},
    ganth(data) {
			setTimeout(() => new Ganth(data, this));
			return this;
		},
    get() {
      return this.map.get(...arguments);
    },
    has() {
      return this.map.has(...arguments);
    },
    header(item) {
			// let startDate = new Date(this.StartDateTime.replace('000Z','Z'));
			// let endDate = new Date(this.EndDateTime.replace('000Z','Z'));
			// let createdDate = new Date(this.CreatedDateTime.replace('000Z','Z'));
      // if (item.IsPublic) {
			// 	item.publicElement = ['DIV', 'icn IsPublic ' + (item.hostID === 1 ? 'public' : '')];
			// }
			return $('header')
      .class('row header', item.tag)
      .draggable()
      // .item(item, 'view')
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
          // $('div').class('modified'),
					// .contextmenu(this.properties.State.options)
					// .on('contextmenu', e => //console.log(e))
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
						//console.log(window.innerHeight);
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
              // linkSource(item, 'Src', $('span').class('path source')),
            ),
            $('div', 'header subject', item.header1),
            $('div', 'header preview', item.header2),
            // linkMaster(item, 'Master', $('div').class('row path master')),
            $('div', 'row date')
            // .contextmenu(item.flagMenu)
            ,
          ),
        );
      }).emit('change')
		},
    html(content, format) {
			const elem = this.elem;
      [].concat(content).forEach(content => {
        if (typeof content === 'function') {
          format = 'js';
          content = String(content).replace(/^(.*?)\{|\}$/g,'');
        }
        content = format && $.string[format] ? $.string[format](content) : content;
        this.elem.innerHTML += content;
      })
			return this;
		},
    write(content) {
      return this.elem.innerHTML += content;
    },
    htmledit(property) {
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
					//console.log('<');
					var startSize = parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize);
					for (var i = 7; i >= 1; i--) {
						formatDoc('fontsize', i);
						if (parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize) < startSize) break;
					}
				},
			};
			const keysdown = {
				ctrl_KeyD() {
					//console.log('D');
					formatDoc('strikeThrough');
				},
			};
      this
      .contenteditable('')
      .on('paste', e => {
        // e.preventDefault();
        console.log(e, e.clipboardData, e.clipboardData.files, e.clipboardData.types.includes('Files'));
      })
      .on('drop', e => {
        e.preventDefault();
        if (e.dataTransfer.files) {
          [...e.dataTransfer.files].forEach(file => {
            property.item.elemFiles.appendFile(file).then(file => {
              console.log(file);
              // return;
              if (window.getSelection) {
                var sel, range, html;
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                  //let offset = sel.focusOffset;
                  range = sel.getRangeAt(0);
                  range.deleteContents();
                  var elImg = document.createElement('img');
                  elImg.src = file.srcs || file.src;
                  range.insertNode(elImg);
                  range.setStartAfter(elImg);
                  //range.setEnd(elImg, 0);
                  //range.setStart()
                  //range.set
                  //window.getSelection().addRange()
                  //range.setStart(el.childNodes[2], 5);
                  //range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                  //document.activeElement.setSelectionRange(5,5);
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
				//console.log('FOCUS')
				oDoc.currentRange = null;
				// setDocMode();
				document.execCommand('defaultParagraphSeparator', false, 'p');
				// if ($.editBtnRowElement) $.editBtnRowElement.remove();
				// switchBox = $.editBtnRowElement.createElement('INPUT', {type:"checkbox", onchange:function(e){setDocMode(this.checked);} });
				// for (var name in btns) $.editBtnRowElement.createElement('span', { className: 'abtn icn ' + name }).createElement('img', Object.assign({
				// 	// onclick: Element.onclick,
				// 	src:'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
				// 	title: __(name),
				// }, btns[name]));
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
							if (sLnk && sLnk != '' && sLnk != 'http://') {
								formatDoc('createlink', sLnk)
							}
						}),
						stateButtons.unlink = $('button').class('abtn unlink').on('click', e => formatDoc('unlink')),
						$('button').class('abtn clean split').on('click', e => {
							if(validateMode()&&confirm('Are you sure?')){ this.innerHTML = this.value; }
						}),
						$('button').class('abtn print').on('click', e => printDoc()),
						// $('button').class('abtn paste').attr('cmd', 'paste').on('click', setDocMode),
					).on('click', e => {
						//console.log('CLICK');
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
				// let html = oDoc.innerHTML;
				// //console.log(html);
				// html = html.trim()
				// .replace(/<p><\/p>/gis, '')
				// .replace(/<p><br><\/p>/gis, '')
				// .replace(/<div><\/div>/gis, '')
				// .replace(/<div><br><\/div>/gis, '')
				// .replace(/^<p>/is, '')
				// .replace(/<\/p>$/is, '')
				// .replace(/^/is, '<p>')
				// .replace(/$/is, '</p>')
				// ;
				// oDoc.innerHTML = html;
				if (p && p.item && oDoc.name) {
					p.item[oDoc.name] = oDoc.innerHTML;
				}
				if (property) {
						property.value = oDoc.innerHTML;
					}
			})
			.on('mouseup', e => contentEditableCheck);
			return this;
		},
    insert(){
			this.elem = this.elem || document.body;
			const args = [].concat(...arguments);
			args.forEach(a => !a ? null : this.elem.insertBefore(typeof a === 'string' ? document.createTextNode(a) : a.elem || a, this.elem.firstChild));
			return this;
		},
    id(selector) {
			this.elem.setAttribute('id', selector);
      $.his.map.set(selector, this);
			// this.attr('id', ...arguments);
			// if ($.localAttr[selector]) {
			// 	Object.entries($.localAttr[selector]).forEach(entry => this.elem.setAttribute(...entry));
			// }
			return this;
		},
    index(docelem){
			const all = [...docelem.elem.querySelectorAll("h1, h2, h3")];
      // console.log(1111, all);
      const topItem = docelem.topItem = all[0];
      const elemTop = docelem.elemTop = docelem.elem.getBoundingClientRect().top;
      const findAll = docelem.findAll = all.slice().reverse();
			const allmenu = docelem.allmenu = [];
			let i = 0;
      var li;
      var path = [];
			function addChapters (ul, level) {
				for (let elem = all[i]; elem; elem = all[i]) {
					const tagLevel = Number(elem.tagName[1]);
          path.slice(0, tagLevel-1);
          // console.log(path);
					const title = elem.innerText;
          path[tagLevel-1] = title.toLowerCase().replace(/ /g,'_');
          const name = path.join('-');
					if (tagLevel === level) {
						$(elem).append(
              // $('a').attr('name', 'chapter' + i)
              $('a').attr('name', name)
						);
						li = $('li').parent(ul).append(
							elem.a = $('a').text(elem.innerText).attr('href', '#' + name).attr('open', '0').attr('target', '_self')
						);
						i++;
						allmenu.push(elem.a);
						// all.shift();
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
      // console.error($('navDoc'));
      // (docelem.onscroll = e => {
      //   if (!to) {
      //     // const div = Math.abs(lastScrollTop - docelem.elem.scrollTop);
      //     // clearTimeout(to);
      //     to = setTimeout(() => {
      //       // console.log('re');
      //       to = null;
      //       // if (div > 50) {
      //       lastScrollTop = document.body.scrollTop;
      //       let elem = findAll.find(elem => elem.getBoundingClientRect().top < elemTop) || topItem;
      //       console.log(findAll, elem);
      //       // let elem = all.find(elem => elem.offsetParent );
      //       // console.log(elem.innerText, elemTop, elem.getBoundingClientRect().top, elem.getBoundingClientRect().height, all.indexOf(elem));
      //       // return;
      //       // elem = all[all.indexOf(elem)-1];
      //       allmenu.forEach(a => a.attr('open', '0').attr('select', null));
      //       const path = [];
      //       for (var p = elem.a.elem; p.tagName === 'A' && p.parentElement && p.parentElement.parentElement; p=p.parentElement.parentElement.parentElement.firstChild) {
      //         p.setAttribute('select', '');
      //         p.setAttribute('open', '1');
      //         path.push(p);
      //       }
      //       $(elem.a.elem).scrollIntoView();
      //       if ($('navDoc')) {
      //         $('navDoc').text('').append(...path.reverse().map(elem => ['/', $('a').text(elem.innerText)]))
      //       }
      //       // elem.li.select();
      //       // $()
      //       // let elem = all.forEach(elem => //console.log(elem.getBoundingClientRect().top));
      //       // //console.log(elem, elem.li);
      //       // }
      //     }, 500);
      //   }
      // })();
      // document.body.removeEventListener('scroll', docelem.onscroll);
      // document.body.addEventListener('scroll', docelem.onscroll);
      return this;
			// return $('ul').append(...[...this.elem.querySelectorAll("h1, h2, h3")].map(elem => $('li').text(elem.innerText)))
			this.addNextPreviousButtons()
		},
    item(item, name) {
      if (item) {
        if (name) {
          // console.log(item.elems);
          item.elems = item.elems || new Map();
          // console.log(item.elems, Map, new Map());
          item.elems.set(name, this);
        }
        this.elem.item = item;
        return this;
        this.set('item', item);
      }
      // console.log(elem, elem.item)
      for (var elem = this.elem; elem && !elem.item; elem = elem.parentElement);
      // console.log(elem, elem.item)
      return elem.item;
      // return this;
    },
    itemAttr(items, attributeName, value) {
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
			// set attributen van nieuwe lijst
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
		},
    itemLink(link){
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
    },
    langtext(value){
      return this.ttext(...arguments);
    },
    list(){
      $().list(this);
      return this;
    },
    async load(src, callback){
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
      function hrefSrc (href, src = '/') {
        if (href[0]==='#') return href;
        // console.log(href, src, new URL(src, document.location).href);
        if (href.match(/^http/)) return href;
        href = new URL(href, new URL(src, document.location)).href.replace(/^.*?\//,'/');
          // console.log(href);
        return href;
        // return href.toLowerCase();
      }
      function rawSrc(src) {
        console.log(777, src, document.location.hostname);
        src = src.replace(/\/(blob|tree)\/main/,'');
        if (document.location.hostname.split('.').pop() === 'localhost') {
          // src = src.replace(/github.com/, 'github.localhost');
          // console.error(333, new URL(new URL(src, document.location).pathname, document.location).href);
          src = new URL(new URL(src, document.location).pathname, 'http://github.aliconnect.nl').href;
        } else if (!src.match(/githubusercontent/)) {
          // src = src.replace(/\/\/([\w\.-]+)\.github\.io/, '//github.com/$1/$1.github.io');
          // src = src.replace(/\/\/([\w\.-]+)\.github\.io$/, '//github.com/$1/$1.github.io');
          src = src.replace(/\/\/([\w\.-]+)\.github\.io/, '//github.com/$1');
          src = src.replace(/github.com/, 'raw.githubusercontent.com');
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
          // src = src.replace(/\/main|\/aliconnect/g, '');
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
        // console.warn(4, src, rawSrc(src).replace(/wiki$/, 'wiki/'));
        var wikiPath = rawSrc(src).replace(/wiki$/, 'wiki/').replace(/[\w\.-]*$/,'');
        // wikiPath = wikiPath.match(/wiki/) ? wikiPath : new URL(wikiPath).origin + '/wiki/';
        // wikiPath = wikiPath.match(/wiki/) ? wikiPath : new URL(wikiPath).origin + '/wiki/';
        if (!elem.paths.includes(wikiPath)) {
          console.log(9, 'loadMenu', wikiPath, this.links);
          elem.paths.push(wikiPath);
          await $().url(rawSrc(wikiPath+'_Sidebar.md')).accept('text/markdown').get().catch(console.error)
          .then(e => {
            this.doc.leftElem.md(e.target.responseText);
            [...this.doc.leftElem.elem.getElementsByTagName('A')].forEach(elem => $(elem).href(hrefSrc(elem.getAttribute('href'), e.target.responseURL)));
          });
          [...this.doc.leftElem.elem.getElementsByTagName('LI')].forEach(li => {
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
            // console.log(li.childNodes);
          })
          this.links = [...this.doc.leftElem.elem.getElementsByTagName('A')];
        }
        // console.log('loadMenu2', src, wikiPath, this.links);
      }
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
          // console.log('elem.docElem', elem, elem.docElem && elem.docElem.elem.parentElement);
        } else {
          elem.loadIndex = true;
        }
				let content = e.target.responseText;
        if (callback) {
          content = callback(content);
        }
        const responseURL = e.target.responseURL;
        var title = responseURL.replace(/\/\//g,'/');
        var match = content.match(/^#\s(.*)/);
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
					// eval('content=`'+content.replace(/\`/gs,'\\`')+'`;');
				} catch (err) {
					//console.error(err);
				}

				this.doc.docElem.text('').append(
          this.doc.navElem = $('nav'),
          $('h1').text(title),
          date ? $('div').class('modified').text(__('Last modified'), new Date(date).toLocaleString()) : null,
        )
        .md(content)
        .mdAddCodeButtons();
        [...this.doc.docElem.elem.getElementsByTagName('code')].forEach(elem => {
          if (elem.hasAttribute('source')) {
            $().url(hrefSrc(elem.getAttribute('source'), responseURL)).get()
            .then(e => {
              var content = e.target.responseText.replace(/\r/g, '');
              if (elem.hasAttribute('id')) {
                var id = elem.getAttribute('id');
                var content = content.replace(new RegExp(`.*?<${id}>.*?\n(.*?)\n(\/\/|<\!--) <\/${id}.*`, 's'), '$1').trim();
              }
              if (elem.hasAttribute('function')) {
                var id = elem.getAttribute('function');
                var content = content.replace(/\r/g, '').replace(new RegExp(`.*?((async |)function ${id}.*?\n\})\n.*`, 's'), '$1').trim();
              }
              elem.innerHTML = elem.hasAttribute('language') ? $.string[elem.getAttribute('language')](content) : content;
              // console.log(content);
              // $(elem).html(content, elem.getAttribute('language'));
            });
          }
        });
        [...this.doc.docElem.elem.getElementsByTagName('A')].forEach(elem => $(elem).href(hrefSrc(elem.getAttribute('href'), responseURL)));
        [...this.doc.docElem.elem.getElementsByTagName('IMG')].forEach(elem => {
          // let imgsrc = elem.getAttribute('src')||'';
          // if (imgsrc.match(/\/\//)) {
          //   const url = new URL(imgsrc);
          //   src = url.origin + url.pathname;
          // } else if (src.match(/^\//)) {
          //   const url = new URL(filename);
          //   src = url.origin + src;
          // } else {
          //   const url = new URL(src, filename.replace(/[^\/]+$/,''));
          //   src = url.origin + url.pathname;
          // }
          // src = src.replace(/\/wiki$/, '/wiki/Home');
          // src = src.replace(/github.com/, 'raw.githubusercontent.com');
          // src = src.replace(/raw.githubusercontent.com\/(.*?)\/wiki/, 'raw.githubusercontent.com/wiki/$1');
          // src = src.replace(/\/tree|\/blob/, '');
          elem.setAttribute('src', new URL(elem.getAttribute('src'), new URL(src, document.location)).href.replace(/^.*?\//,'/'));
        });
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
    },
    async maps(selector, referenceNode) {
			const maps = await $.his.maps();
			// if (!$.his.maps.script) {
			// 	return $.his.maps.script = $('script')
			// 	.attr('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAKNir6jia2uSgmEoLFvrbcMztx-ao_Oys&libraries=places')
			// 	.parent(document.head)
			// 	.on('load', e => arguments.callee.apply(this, arguments))
			// }
			// $.his.maps.showonmap (par.maps, el);
			// referenceNode = referenceNode || $.listview.listItemElement;
			// referenceNode.innerText = '';
			// //console.log('============================');
			// const myLatLng = { lat: -25.363, lng: 131.044 };
			// const map = new google.maps.Map(document.getElementById("map"), {
			// 	zoom: 4,
			// 	center: myLatLng,
			// });
			// new google.maps.Marker({
			// 	position: myLatLng,
			// 	map,
			// 	title: "Hello World!",
			// });
			// referenceNode.style = 'width:100%;height:500px;';
			// this.mapel = referenceNode;//referenceNode.createElement('DIV', { className: 'googlemap', style: 'width:100%;height:100%;' });
			let map = new maps.Map(this.elem, { zoom: 8 });
			bounds = new maps.LatLngBounds();
			geocoder = new maps.Geocoder();
			// var address = selector;//decodeURI(params).split('/').pop();
			// //console.debug(address);
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
					// //console.debug('Geocode was not successful for the following reason: ' + status);
				}
			});
			// new $.his.maps(el, par.maps);
		},
    md(content) {
      // console.log($.his.api_parameters);
      for (let [key,value] of Object.entries($.his.api_parameters)) {
        content = content.replace(key,value);
      }

      const div = $('div').html($.string.mdHtml(content));

			// this.elem.innerHTML += $.string.mdHtml(s);
      this.elem.append(...div.elem.childNodes);
			return this;
		},
    mdc(s) {
      const newlines = [];
      let level = 0;
      $.string.mdHtml(s).split(/\n/).forEach(line => {
        const match = line.match(/^<h(\d)>(>\s)/);
        if (match) {
          // line = line.replace(/h\d>/g,'summary>')
          // if (match[1]==level) {
          //   newlines.push('</details><details>'+line);
          // } else if (match[1]>level) {
          //   newlines.push('<details>'+line);
          // } else if (match[1]<level) {
          //   newlines.push('</details></details><details>'+line);
          // }
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
      //   if (el.open) {
      //     console.log(el.firstChild.innerText);
      //     ga('send', 'pageview', el.firstChild.innerText);
      //   }
      // }))
      // this.on('click', e => {
      //   const el = e.path.filter(el => el.tagName === 'SUMMARY').shift();
      //   if (el && el.firstChild) {
      //     // ga('send', 'e', 'click', el.firstChild.innerText);
      //     ga('send', 'pageview', el.firstChild.innerText);
      //     // ga('send', 'e', {
      //     //   'hitType': 'pageview',
      //     //   'page': 'Testpage'
      //     // });
      //     // ga('send', 'e', 'Videos', 'play', 'Fall Campaign');
      //     // ga('send', 'e', {
      //     //   'eventCategory': 'Category',
      //     //   'eventAction': 'Action'
      //     // });
      //     // ga('set', 'title', el.firstChild.innerText);
      //     console.log(el.firstChild.innerText);
      //   }
      // })
      return this;
    },
    mdAddCodeButtons(){
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
                  /\/\*\* js start \*\*\/.*?\/\*\* js end \*\*\//s, codeElem.innerText
                );
              } else if (type === 'yaml') {
                block.html = block.html.replace(
                  /`yaml`/s, '`'+codeElem.innerText + '`',
                );
              } else if (type === 'css') {
                block.html = block.html.replace(
                  /\/\*\* css start \*\*\/.*?\/\*\* css end \*\*\//s, codeElem.innerText
                );
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
    },
    // media: new Media(),
    menuitems: {
			copy: { Title: 'Kopieren', key: 'Ctrl+C', onclick: function() { aimClient.selection.copy(); } },
			cut: { Title: 'Knippen', key: 'Ctrl+X', onclick: function() { aimClient.selection.cut(); } },
			paste: { Title: 'Plakken', key: 'Ctrl+V', onclick: function() { aimClient.selection.paste(); } },
			hyperlink: { Title: 'Hyperlink plakken', key: 'Ctrl+K', onclick: function() { aimClient.selection.link(); } },
			del: { Title: 'Verwijderen', key: 'Ctrl+Del', onclick: function() { aimClient.selection.delete(); } },
			//add: {
			//    Title: 'Nieuw',
			//    click: function() { // //console.debug(this); },
			//    menu: {
			//        map: { Title: 'Map', key: 'Ctrl+N', },
			//        contact: { Title: 'Contact', },
			//    }
			//},
			move: {
				Title: 'Verplaatsen',
				popupmenu: {
					moveup: { Title: 'Omhoog', key: 'Alt+Shift+Up', },
					movedown: { Title: 'Omlaag', key: 'Alt+Shift+Dwon', },
					ident: { Title: 'Inspringen', key: 'Alt+Shift+Right', },
					outdent: { Title: 'Terughalen', key: 'Alt+Shift+Left', },
				}
			},
			//cat: {
			//    Title: 'Categoriseren',
			//    menu: {
			//        Ja: { Title: 'Ja', color: 'black', },
			//        Nee: { Title: 'Nee', color: 'red', },
			//        Groen: { Title: 'Groen', color: 'green', },
			//        Blauw: { Title: 'Blauw', color: 'blue', },
			//    }
			//},
			state: {
				Title: 'Status',
				//menu: this.item.class.fields.state.options
			},
		},
    mse: {
			Contacts: {
				/** @function $.mse.Contacts.find
				*/
				find: function() {
					if (!$.mse.loggedin === undefined) setTimeout(arguments.callee.bind(this), 500);
					var url = "/api/v2.0/me/contacts?$select=DisplayName&$top=1000&$order=LastModifiedDateTime+DESC";
					$.https.request ({ hostname: "outlook.office.com", path: url, headers: $.mse.headers }, function(e) {
						//console.log("OUTLOOK contacts", e.body);
						if (!e.body || !e.body.Value) return;
						e.body.Value.forEach(function(row){
							row.req = {headers: $.mse.headers, path: row['@odata.id'] };
							row.Title = row.DisplayName
						});
						Listview.show(e.body.Value);
					});
				},
			},
			Messages: {
				/** @function $.mse.Messages.find
				*/
				find: function(){
					//console.log(this);
					var url = "/api/v2.0/me/messages?$select=*&$top=10&order=LastModifiedDateTime DESC";
					$.https.request ({ hostname: "outlook.office.com", path: url, headers: $.mse.headers }, function(e) {
						//console.log("OUTLOOK messsages", e.body);
						if (!e.body || !e.body.Value) return;
						e.body.Value.forEach(function(row){
							row.req = {headers: $.mse.headers, path: row['@odata.id'] };
							row.Title = row.From.EmailAddress.Name;
							row.Subject = row.Subject;
						});
						Listview.show(e.body.Value);
					});
				},
			},
			Events: {
				/** @function $.mse.Events.find
				*/
				find: function(){
					var url = "/api/v2.0/me/es?$select=*&$top=10";
					$.https.request ({ hostname: "outlook.office.com", path: url, headers: $.mse.headers }, function(e) {
						e.body.Value.forEach(function(row){
							row.Title = row.Subject;
							row.Subject = row.Start.DateTime + row.End.DateTime;
							row.Summary = row.BodyPreview;
							row.req = {headers: $.mse.headers, path: row['@odata.id'] };
						});
						Listview.show(e.body.Value);
						//console.log("OUTLOOK DATA", this.getHeader("OData-Version"), e.body);
					});
				},
			},
			Calendarview: {
				/** @function $.mse.Calendarview.find
				*/
				find: function() {
					var url = "/api/v2.0/me/calendarview?startDateTime=2017-01-01T01:00:00&endDateTime=2017-03-31T23:00:00&$select=Id, Subject, BodyPreview, HasAttachments&$top=100";
					$.https.request ({ hostname: "outlook.office.com", path: url, headers: $.mse.headers }, function(e) {
						e.body.Value.forEach(function(row){
							row.Title = row.Subject;
							row.req = {headers: $.mse.headers, path: row['@odata.id'] };
						});
						Listview.show(e.body.Value);
						//console.log("OUTLOOK DATA", this.getHeader("OData-Version"), e.body);
					});
				},
			},
			userdata: {},
			login: function() {
				return;
				if (!$.paths || !$.paths['/mse/login']) return $.mse.loggedin = null;
				aimClient.api.request ({ path: '/mse/login' }, function(e) {
					if (!e.body || !e.body.access_token) return $.mse.loggedin = false;
					$.mse.loggedin = true;
					this.userdata = e.body;
					var mse_access_token = e.body.access_token.split('-');
					var access = mse_access_token[0].split('.');
					var header = JSON.parse(atob(access[0]));
					this.payload = JSON.parse(atob(access[1]));
					// //console.log("RT", e.body.refresh_token);
					// //console.log("RT", e.body.refresh_token.split('.'));
					// for (var i=0, c=e.body.refresh_token.split('-'), code;i<c.length;i++) {
					// 	//console.log("C1", i, c[i]);
					// 	try { //console.log("E1", i, atob(c[i])); } catch(err) {}
					// 	for (var i2=0, c2=c[i].split('_'), code2;i2<c2.length;i2++) {
					// 		//console.log("C1", i, "C2", i2, c2[i2]);
					// 		try { //console.log("C1", i, "E2", i2, atob(c2[i2])); } catch(err) {}
					// 	}
					// }
					// //console.log("MSE", e.body.refresh_token.split('-'));
					var timeleft = Math.round(this.payload.exp * 1000 - new Date().getTime());
					// //console.log("MSE USER DATA", this.responseText, header, this.payload);
					this.headers = {
						"Authorization": "Bearer " + this.userdata.access_token,
						"Accept": "application/json",
						"client-request-id": $().client_id,
						"return-client-request-id": "true",
						"X-AnchorMailbox": this.userdata.preferred_username,
					};
					setTimeout(this.login, timeleft<0 ? 5000 : timeleft-10);
					rowinfo.createElement('SPAN', 'mse', this.payload.unique_name);
					this.userdata.login_url = this.userdata.login_url + "&state=" + btoa(document.location.href);
					// , href: "https://login.microsoftonline.com/common/oauth/v2.0/authorize?response_type=code&client_id=24622611-2311-4791-947c-5c1d1b086d6c&redirect_uri=https://aliconnect.nl/$/v1/api/mse.php&state=" + [$.config.$.domain].join("+") + "&prompt=login&scope=openid offline_access profile email https://outlook.office.com/mail.readwrite https://outlook.office.com/calendars.readwrite https://outlook.office.com/contacts.readwrite https://outlook.office.com/people.read"
					// rowinfo.createElement('SPAN').createElement('A', {innerText: 'login', href: $.mse.btnLogin.href = this.userdata.login_url = this.userdata.login_url + "&state=" + btoa(document.location.href) });
				}.bind(this));
			},
		},
    navlist(selector, context) {
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
		},
    on(selector, context) {
			if (typeof selector === 'object') {
				Object.entries(selector).forEach(entry => this.on(...entry))
			} else {
				// //console.log(selector, 'on'+selector in this.elem, this.elem['on'+selector])
				if (('on'+selector in this.elem) && !this.elem['on'+selector]) {
					this.elem['on'+selector] = context
					// //console.log('JA', this.elem['on'+selector])
				} else {
					this.elem.addEventListener(...arguments);
				}
			}
			// //console.log(this.elem, ...arguments);
			return this;
		},
    open(state) {
      if (!arguments.length) {
        return this.elem.hasAttribute('open')
      }
			if ('open' in this.elem) {
        this.elem.open = state;
      } else {
        this.attr('open', state ? '' : null);
      }
      return this;
    },
    operations(selector){
			this.append(Object.entries(selector).map(entry =>
				$('button').class('abtn', entry[0]).attr(name, entry[0]).assign(entry[1])
			))
		},
    payform(params){
			// if (!$.shop.customer || !$.shop.customer.Product) return;
			let subtotal = 0;
			function nr(val) {
				return Number(val).toLocaleString(undefined, {minimumFractionDigits: 2});
			}
			this.append(
				$('form')
				.class('col aco payform doc-content')
				.attr('action', '/?order')
				.attr('novalidate', 'true')
				// .on('submit', e => {
				// 	//console.log('submit', order);
				// 	e.preventDefault();
				// 	for (var i=0, el;el=this.elements[i];i++) {
				// 		if (el.required && el.offsetParent && !el.value) {
				// 			el.focus();
				// 			// return false;
				// 		}
				// 	}
				// 	this.order.value = JSON.stringify(order);
				// 	new $.HttpRequest($.config.$, 'POST', '/?order', this);
				// 	return false;
				// })
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
						// }).operations({
						// 	activate: { type: 'button' },
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
						// $('div').class('row btns').operations({
						// 	activate: { label: 'Bestellen en betalen', default:true },
						// }),
						$('div').text('Door op de bestelknop te klikken rond je de bestelling af.'),
						$('div').text('Als je nu bestelt, gaan we direct aan de slag!'),
					),
				),
			)
		},
    prompts() {
      this.append([...arguments].map(name=>$('a').class('abtn', name).caption(name).href('#?prompt='+name)));
      return this;
    },
    parent(selector){
			$(selector).append(this.elem);
			return this;
		},
    path(){
			const path = [];
			for (let p = this.elem; p ;p = p.parentElement) {
				// //console.log(p);
				path.push(p);
			}
			return path;
		},
    properties(properties) {
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
              // console.log(prefix);
              function onchange (e) {
  							const formElement = e.target.form;
                item[e.target.name] = e.target.value;
  							e.target.modified = true;
  							let address = [
                  ['Street', 'Number'].map(name => formElement[prefix + name].value).filter(Boolean).join('+'),
                  ['PostalCode', 'City'].map(name => formElement[prefix + name].value).filter(Boolean).join('+'),
                  ['Country'].map(name => formElement[prefix + name].value).filter(Boolean).join('+'),
  							].join(',');
                // console.log(address, formElement);
  							$().url('https://maps.googleapis.com/maps/api/geocode/json').query({
  								address: address,
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
                          // console.log(type);
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
  									//console.log(data);
  									// UPLOAD DATA
  									canvas.remove();
  									// App.files.fileUpload(this.item, { name: 'photo.png' }, $('canvas').toDataURL("image/png"));
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
          // check: {
  				// 	createInput: function() {
  				// 		this.elEdit.className += ' fw';
  				// 		var values = this.value.split(', ');
  				// 		this.elInp = this.elEdit.createElement('DIV', { className: 'inp row wrap' });
  				// 		this.options = this.options || this.enum;
  				// 		for (var optionname in this.options) {
  				// 			var option = this.options[optionname];
  				// 			var elInpOption = this.elInp.createElement('span', { className: 'radiobtn check' });
  				// 			elInpOption.createElement('INPUT', {
  				// 				el: this.elInp, type: 'checkbox', id: this.name + optionname, value: optionname, checked: (values.indexOf(optionname) != -1) ? 1 : 0, onclick: function(e) {
  				// 					var c = this.elEdit.getElementsByTagName('INPUT');
  				// 					var a = [];
  				// 					for (var i = 0, e; e = c[i]; i++) if (e.checked) a.push(e.value);
  				// 					this.elEdit.newvalue = a.join(', ');
  				// 				}
  				// 			});
  				// 			elInpLabel = elInpSpan.createElement('LABEL', { for: this.name + optionname  });
  				// 			elInpLabel.createElement('icon').style.backgroundColor = option.color;
  				// 			elInpLabel.createElement('span', { innerText: option.Title });
  				// 		}
  				// 		//this.elEdit.createElement('LABEL', { innerText: this.placeholder });
  				// 	}
  				// },
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
              // var forId = ['property',this.name].join('_');
              console.log('CEHCKBOX', this.name);
							$('div')
              .parent(this.selector)
              .class('col input check',this.format || this.type || '',this.property.name)
              .append(
                $('div').class('row check').append(
                  $('input')
                  .on('change', e => this.value = e.target.checked ? 'on' : null)
                  .type('checkbox')
                  // .name(this.name)
                  // .attr(this)
                  .checkbox(this, this.property, this.attributes),
                )
							);
              // return;
              // const elements = [];
  						// const inputElement = this.selector;
              //
              //
  						// let el = inputElement.createElement('DIV', ['col input check',property.format,property.name].join(' '));
              //
              // let value = this.value || this.defaultValue || '';
  						// if (property.options) {
  						// 	value = value.split(',');
  						// 	var options = property.options || {   };
  						// 	el.createElement('LABEL', '', __(property.title || property.name));
  						// 	el = el.createElement('DIV', 'row');
  						// 	function createElem(tag, option) {
  						// 		var forId = ['property',property.name,tag].join('_');
  						// 		el.createElement('DIV', 'row check', [
  						// 			['INPUT', {
  						// 				type: 'checkbox',
  						// 				// name: tag,
  						// 				id: forId,
  						// 				checked: value.includes(tag),
  						// 			}],
  						// 			['LABEL', 'caption', { for: forId }, [
  						// 				['I', option.color ? {style : `background-color:${option.color};`} : null],
  						// 				['SPAN', '', __(option.title || tag)],
  						// 			]],
  						// 		]);
  						// 	}
  						// 	Object.entries(options).forEach(entry => createElem(...entry));
  						// } else {
  						// 	var forId = ['property',property.name].join('_');
  						// 	el.createElement('DIV', 'row check', [
  						// 		['INPUT', {
  						// 			type: 'checkbox',
  						// 			name: property.name,
  						// 			id: forId,
  						// 			checked: value ? 1 : 0,
  						// 		}],
  						// 		['LABEL', 'caption', { for: forId }, [
  						// 			['I'],
  						// 			['SPAN', '', __(property.title || property.name)],
  						// 		]],
  						// 	]);
  						// }
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
                  // data.some(data => data.SrcID == ID) ? 'ownprop' : '',
                  // data.some(data => data.SrcID != ID) ? 'srcprop' : '',
                )
                .html(this.displayvalue),
  						)
  					},
  					edit(property) {
              console.log(property);
							$('div').parent(this.selector).class('col prop input',this.format || this.type || '',this.property.name).append(
								this.input = $('input')
                .class(
                  'inp focus aco',
                  this.className,
                  // data.some(data => data.SrcID == ID) ? 'ownprop' : '',
                  // data.some(data => data.SrcID != ID) ? 'srcprop' : '',
                )
                .id(this.name)
                .name(this.property.name)
                .attr(this)
                // .attr(this.attributes)
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
  						//console.log('FILESSSSS', attributeName, attribute, this.elEdit, this.item);
  						const files = new Files(this, this.elEdit);
  						if (this.item && this.item.editBarElement) {
  							if (!this.item.files) {
  								this.item.files = files;
  								this.item.editBarElement.createElement('button', 'abtn attach', {type: 'button', accept: '', onclick: files.openDialog});
  								this.item.editBarElement.createElement('button', 'abtn image', {type: 'button', accept: 'image/*', onclick: files.openDialog});
  							}
  						}
  						this.elEdit.append(files.elem);
  						// apr.item.editBarElement = $.pageEditElement.createElement('DIV', 'row top abs btnbar np', { id: 'pageEditTopBar', operations: {
  						// 	close: {Title: 'Sluit formulier' },
  						// 	attach: {type: 'button', accept: '', onclick: files.openDialog},
  						// 	image: {type: 'button', accept: 'image/*', onclick: files.openDialog},
  						// 	camera: {type: 'button', item: this, onclick: $.prompt.camera},
  						// 	freedraw: {type: 'button', item: this, onclick: $.prompt.freedraw},
  						// }});
  						// this.elEdit.append(new Files(this).elem);
  					},
  					createView() {
  						const files = new Files(this);
  						this.item.files = this.item.files || files;
  						// elForm.filesAttribute = elForm.filesAttribute || files;
  						// this.elSpan = this.elView.append(files.elem);
  						return this.elView = files.elem;
  						// new Files(this, this.elSpan);
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
							// let html = (this.value||'').trim()
							// 				.replace(/<p><\/p>/gis, '')
							// 				.replace(/<p><br><\/p>/gis, '')
							// 				.replace(/<div><\/div>/gis, '')
							// 				.replace(/<div><br><\/div>/gis, '')
							// 				.replace(/^<p>/is, '')
							// 				.replace(/<\/p>$/is, '')
							// 				.replace(/^/is, '<p>')
							// 				.replace(/$/is, '</p>')
							// 				;
							// 				html='';
							// //console.log(html);
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
  							// zoomControl: true,
  							// scaleControl: false,
  							// scrollwheel: false,
  							// disableDoubleClickZoom: true,
  							// gestureHandling: 'greedy',
  							// gestureHandling: 'none',
  							// gestureHandling: 'auto',
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
  								//console.log('CURRENT POS', position);
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
  										//console.error('Geocode was not successful for the following reason: ' + status);
  									}
  								});
  							}, function() {
  								// handleLocationError(true, infoWindow, map.getCenter());
  							});
  						} else {
  							alert('NOT navigator.geolocation');
  							// Browser doesn't support Geolocation
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
              // console.log(this.textvalue, this.property.options, this.property.value);
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
                  // data.some(data => data.SrcID == ID) ? 'ownprop' : '',
                  // data.some(data => data.SrcID != ID) ? 'srcprop' : '',
                )
                .item(this.property.item, this.name+'view')
                .displayvalue(this.property.name),
                // .html(this.displayvalue),
  						)
  					},
            createInput() {
              console.log(this.textvalue);
  						this.elInp = this.elEdit.createElement('select', 'inp row aco', { item: this.item, name: this.name });
  						this.elEdit.createElement('LABEL', '', this.title || this.name);
  						let selected = [];
  						let value = this.value || this.defaultvalue || '';
  						// //console.log(value);
  						if (this.type === 'array') {
  							this.elInp.setAttribute('multiple', '');
  							selected = value ? String(value).split(',') : [];
  							// //console.log(selected);
  						}
  						if (Object.prototype.toString.call(this.options) === '[object Array]') {
  							for (var i = 0, optionvalue; optionvalue = this.options[i]; i++) {
  								var optionElement = this.elInp.createElement('option', '', optionvalue, { value: optionvalue, selected: selected.includes(optionvalue) });
  							}
  						} else {
  							for (let [optionName, option] of Object.entries(this.options)) {
  								// //console.log(selected, option.value);
  								var optionElement = this.elInp.createElement('option', '', typeof option === 'object' ? option.title || optionName : option, { value: optionName });
  								if (selected.includes(optionName)) {
  									optionElement.setAttribute('selected', '');
  								}
  							}
  						}
  						//this.elInp.value = 'pe';
  						// //console.debug(this.value, this);
  						this.elInp.addEventListener('change', e => {
  							this.value = [...e.target.options].filter(option => option.selected).map(option => option.value).join(',');
  							//console.log(this.value);
  							// //console.log(e, [...e.target.options].filter(option => option.selected).map(option => option.value).join(','), e.target.value);
  							// this.elInp.value = [...e.target.options].filter(option => option.selected).map(option => option.value).join(',');
  							// // e.target.value = e.target.
  							// //console.log(this.elInp.value);
  						}, true);
  						// this.elInp.value = '1,2';
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
                  // .value(this.value)
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
  						const data = [].concat(this.property.item.data[property.name]).shift();
              // console.log(this.name, this.property.item.data, this.property.item.Master);
  						$('div').parent(this.selector)
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
                // console.log('updateList', e.detail, schemaName, finditems);
                e.detail.items
                .filter(item => item.header0.toLowerCase().includes(value))
                .forEach(item => $('option').parent(listElement).text(item.subject).value(item.header0 === item.tag ? item.header0 : item.header0 + ' ' + item.tag))
              });
              // console.log(this.selector, selector);
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
                      // console.log(item, this.property.item);
                      // return;
                      if (linkitem) {
                        this.property.item.attr(this.name, {
                          AttributeID: this.data ? this.data.AttributeID : null,
                          LinkID: linkitem.ID,
                        }, true).then(item => {
                          console.log('updated');
                          // this.inputElem.value($(linkitem).header0);
                          item.details(true).then(item => $('view').show(item, true));
                        })
                      }
                      // console.log(item, $(item));
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
                    //console.log(e.type);
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
  						//console.log('SHARE CAM', this);
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
                  // .click(this.property.item[this.name].bind(this.property.item))
                  .on('click', e => {
                    console.log(this.property.item.tag);
                    $().send({
                      // to: { aud: aimClient.access.aud },
                      path: `/${this.property.item.tag}/${this.name}()`,
                      method: 'post',
                      // forward: $.forward || $.WebsocketClient.socket_id,
                    })
                  })
                  // e => {
                  //   console.log(this.property.item, this.name, this.property.item[this.name]);
                  //   // property.item.handVerkeerslichtenGedoofd.call(property.item);
                  // })
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
                  // .click(this.property.item[this.name].bind(this.property.item))
                  .on('click', e => {
                    console.log(this.property.item.tag);
                    $().send({
                      // to: { aud: aimClient.access.aud },
                      path: `/${this.property.item.tag}/${this.name}()`,
                      method: 'post',
                      // forward: $.forward || $.WebsocketClient.socket_id,
                    })
                  })
                  // e => {
                  //   console.log(this.property.item, this.name, this.property.item[this.name]);
                  //   // property.item.handVerkeerslichtenGedoofd.call(property.item);
                  // })
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
                  // .click(this.property.item[this.name].bind(this.property.item))
                  .on('click', e => {
                    console.log(this.property.item.tag);
                    $().send({
                      // to: { aud: aimClient.access.aud },
                      path: `/${this.property.item.tag}/${this.name}()`,
                      method: 'post',
                      // forward: $.forward || $.WebsocketClient.socket_id,
                    })
                  })
                  // e => {
                  //   console.log(this.property.item, this.name, this.property.item[this.name]);
                  //   // property.item.handVerkeerslichtenGedoofd.call(property.item);
                  // })
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
            // if (this.enum && !this.options) {
            // 	if (Array.isArray(this.enum)) {
            // 		this.options = this.enum;
            // 	} else if (typeof this.enum === 'object') {
            // 		this.options = this.enum;
            // 		this.enum = Object.keys(this.options);
            // 		if (this.enum.length === 2 && Object.values(this.options).filter(Boolean).length === 1) {
            // 			this.format = 'checkbox';
            // 		}
            // 	}
            // }
            // if (this.options && !this.enum) {
            // 	this.enum = Object.keys(this.options);
            // 	// property.format = property.format || 'radio';
            // }
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
              // console.log('CLASSNAME', data);
              this.ownprop = data.some(data => data && data.Value && data.SrcID && data.SrcID == ID );
              this.srcprop = data.some(data => data && data.Value && data.SrcID && data.SrcID != ID);
              this.className = [
                this.ownprop ? 'ownprop' : '',
                this.srcprop ? 'srcprop' : '',
              ].join(' ')
              // console.log('CLASSNAME', this.name, this.className, data, this);
            }
            // console.log(property, typeof property.value);
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
		},
    qr(selector, context) {
      const elem = this.elem;
      (async function(){
        if (!window.QRCode) {
          await importScript(scriptPath + 'js/qrcode.js');
        }
        new QRCode(elem, selector);
        if (elem.tagName === 'IMG') {
          elem.src = elem.firstChild.toDataURL("image/png");
          elem.firstChild.remove();
        }
      })()
      return this;
		},
    remove(selector) {
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
    },
    resizable() {
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
                // nxtCol.style.width = (nxtColWidth - (diffX))+'px';
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
    },
    sample(selector, sample) {
			const htmlScript = `
			<html>
			<head>
			<link rel="stylesheet" href="https://aliconnect.nl/v1/api/css/web.css" />
			<script src="https://aliconnect.nl/v1/api/js/aim.js"></script>
			<style><!-- style --></style>
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
				// //console.log(content);
				return content.join('\n').trim();
			}
			//console.log(selector);
      const ref = {};
      sample.template = sample.template || htmlScript;
      // const elemHtml = $('td', 'code');
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
        //console.log(document._body);
        sample.script();
        document._body = null;
      }
			this.elem.append(
				$('h1', '', selector),
			);
			return this;
		},
		scrollIntoView(options = { block: "nearest", inline: "nearest" }) {
			this.elem.scrollIntoView(options);
			return this;
		},
    script(src) {
			return $.promise('script', resolve => $('script').src(src).parent(this).on('load', resolve))
		},
    _select(e) {
			const elem = this.elem;
			const setOpen = open => {
				//console.log('setOpen', open, elem);
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
				// //console.log('elementSelect', elem);
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
					// for (var el = elem.nextElementSibling; el && el.tagName != elem.tagName; el = el.nextElementSibling) {
					// 	el.style.display = 'none';
					// }
				}
			}
			if (elem.getAttribute('open') === '0') {
				return setOpen(1);
				// for (var el = elem.nextElementSibling; el && el.tagName != elem.tagName; el = el.nextElementSibling) {
				// 	el.style.display = '';
				// }
			}
			elem.setAttribute('selected', '');
			elem.scrollIntoViewIfNeeded(false);
			// //console.log('OPEN', elem.label);
			return this;
		},
    seperator(pos) {
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
				// //console.log(targetElement.id + 'Width', targetElement.style.maxWidth);
				selector.css('left', elem.moveX = 0).css('z-index', ZINDEX).attr('active', null);
			};
			selector
			.attr(pos, '')
			// .class('seperator')
			.class('seperator noselect')
			.on('mousedown', start)
			.css('z-index',ZINDEX);
			return this;
		},
    set() {
      return this.map.set(...arguments);
    },
    show(item, doEdit) {
      // TODO: wijzig rechten
      // var edit = !Number(this.userID) || this.userID == $.auth.sub;
      item.details().then(e => {
        ItemSelected = item;
        this.item = item;
        document.title = item.header0;
        $().ga('send', 'pageview');
        // if (item.data.Id) {
        //   const url = new URL(document.location);
        //   url.searchParams.set('id', item.data.Id);
        //   $.his.replaceUrl(url.toString());
        //
        //   // $.his.replaceUrl(document.location.origin+document.location.pathname.replace(/\/id\/.*/,'')+'/id/'+item.data.Id+document.location.search)
        // }
        function logVisit() {
          if (item.data.ID) {
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
          // TODO: Item Users
          fieldsElement.createElement('DIV', 'row users', [
  					__('To') + ': ',
  					['DIV', 'row aco', userElement],
  				]);
          if (Array.isArray(this.Users)) {
  					this.Users.forEach((row)=>{
  						userElement.push(['A', 'c ' + row.ID, row.Value || ($.getItem(row.tag) ? $.getItem(row.tag).Title : row.ID), {
  							// onclick: Web.Element.onclick,
  							href: '#'+row.tag,
  							// id: row.ID,
  							// innerText: row.Value || ($.getItem(row.tag] ? $.getItem(row.tag].Title : row.ID),
  						}], ';\u00A0');
  					});
  				}
        }
        function printmenu() {
          return;
          // TODO:
          //if (this.printmenu) for (var menuname in this.printmenu) {
          //	menuitem = this.printmenu[menuname];
          //	menuitem.name = menuname;
          //	menuitem.id = this.id;
          //	//menuitem.href = this.href;
          //	menuitem.item = this;
          //	//// //console.debug('MENU ITEM ', menuname);
          //	break;
          //	//// //console.debug('menuitem href', menuitem.href);
          //	//if (this.ref) this.printmenu[menuname].href = this.href+'/'+
          //	if (!menuitem.href) this.printmenu[menuname].onclick = menuitem.ref ? $.url.objbyref(menuitem.ref).e : function(e) {
          //		if (this.menuitem.object) {
          //			if (window[this.menuitem.object]) window[this.menuitem.object].onload(this.menuitem.id);
          //			else window[this.menuitem.script] = document.body.createElement('script', { src: this.menuitem.script, menuitem: this.menuitem, onload: function() { window[this.menuitem.object].onload(this.menuitem.id) } });
          //			return false;
          //		}
          //		if (this.menuitem.href) return true;// document.location.href = this.menuitem.href;
          //		this.menuitem.post = this.menuitem.post || {};
          //		this.menuitem.get = this.menuitem.get || {};
          //		this.menuitem.get.name = this.menuitem.name;
          //		this.menuitem.get.Title = this.menuitem.Title;
          //		this.menuitem.get.id = this.menuitem.id;
          //		//// //console.debug('MENUITEM PRINT', this.menuitem.post, this.menuitem.src);
          //		//if ($.url.byref())
          //		new $.HttpRequest({
          //			menuitem: this.menuitem,
          //			item: this.menuitem.item,
          //			api: this.menuitem.api ? this.menuitem.api : rpt ? this.menuitem.item.class.name + '/' + this.menuitem.id + '/' + this.menuitem.rpt + '.html' : null,
          //			src: this.menuitem.src,
          //			post: this.menuitem.post,
          //			get: this.menuitem.get,
          //			onload: $.Docs.onload
          //		});
          //	};
          //}
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
            // properties = ['ID', 'level','schemaPath','schemaName','header0','header1','header2'].concat(...schemas.map(([schemaName, schema]) => schemaName), ...schemas.map(([key, schema]) => Object.keys(schema.properties))).unique();
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
              // properties = ['ID', 'level','schemaPath','schemaName','header0','header1','header2'].concat(...schemas.map(([schemaName, schema]) => schemaName), ...schemas.map(([key, schema]) => Object.keys(schema.properties))).unique();
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
              //revert: { disabled: !this.srcID, Title: 'Revert to inherited', item: this, onclick: function() { this.item.revertToInherited(); } },
              // $('li').class('abtn sbs').text('SBS').on('click', e => {}),
              // $('li').class('abtn').text('Api key').href(`api/?request_type=api_key&sub=${item.ID}`),
              $('li').class('abtn').text('Api key').on('click', e => {
                aimClient.api('/').query('request_type', 'api_key').query('expires_after', 30).post({
                  sub: item.ID,
                  aud: item.ID
                }).get().then(body => {
                  $('dialog').open(true).parent(document.body).text(body);
                  console.log(body);
                })
              }),
              // $('li').class('abtn').text('Secret JSON Unlimited').attr('href', `api/?request_type=secret_json&release&sub=${this.ID}&aud=${$.auth.access.aud}`),
              // $('li').class('abtn doc').text('Breakdown').click(e => build_map(items => $().list(items))),
              $('li').class('abtn doc').text('Breakdown').on('click', e => {
                $().list([]);
                aimClient.api(`/${item.tag}`).query('request_type', 'build_breakdown').get().then(body => {
                  const data = body.value;
                  console.log(data);
                  const topitem = data.find(child => child.ID == item.data.ID);
                  const items = [];
                  (function build(item, tagname) {
                    console.log(item);
                    // if (!item) return;
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
                      // item.data.Linktagname = $(item.data.link.shift().LinkID).data.Tagname;
                    }
                  });
                  // items.sort((a,b) => (a.data.Tagname || '').localeCompare(b.data.Tagname || ''));
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
                      // console.log(item.schema, item.schemaPath);
                      // const schemaName = item.schemaPath.split(':').pop();
                      const properties = Object.entries(item.schema.properties)
                      .filter(([propertyName, property])=> item[propertyName])
                      .map(([propertyName, property])=> $('li').class('prop').append(
                        $('label').text(propertyName+': '),item[propertyName],
                      ));
                      return [
                        $('h'+level).text(item.header0),
                        // $('div').text('inleiding'),
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
              // $('li').class('abtn download').text('Data JSON').attr('href', `api/?request_type=data_json&id=${this.ID}`),
              $('a').class('abtn download').text('Build_2to1').href(`https://schiphol.aliconnect.nl/api/item(${item.data.ID})?request_type=build_2to1&download`),
            )),
            $('button').class('abtn msg').attr('cnt', item.data.Messages ? item.data.Messages.length : 0).on('click', this.showMessages),
            $('button').class('abtn send').on('click', e => {
              new $.HttpRequest($.config.$, 'GET', `/${this.item.schema}(${this.item.id})?mailing`, e => {
                // //console.debug(this.responseText);
                alert(this.responseText);
              }).send();
              return false;
            }),
            $('button').class('abtn fav').attr('checked', isFav).on('click', e => e => this.fav ^= 1),
            $('button').class('abtn edit').name('edit').on('click', e => this.edit(item)).append(
              $('ul').append(
                // $('li').class('row').append(
                //   $('a').class('aco abtn share').text('share').href('#?prompt=share'),
                // ),
                $('li').class('abtn share').text('share').on('click', e => e.stopPropagation()).on('click', e => $().prompt('share_item')),
                $('li').class('abtn read').text('readonly').attr('disabled', '').on('click', e => e.stopPropagation()),
                $('li').class('abtn public').text('public').on('click', e => this.scope = 'private').on('click', e => e.stopPropagation()),
                $('li').class('abtn private').text('private').on('click', e => this.scope = 'public').on('click', e => e.stopPropagation()),
                $('li').class('abtn upload mailimport').text('Importeer mail uit outlook')
                // .attr('hidden', !$.Aliconnector.connected)
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
              //console.log('ja1', data.value, data.value.length);
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
              //console.log('DROP', data.value);
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
            // $().files(),
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
        // console.log('FILES',item, item.data.files);
        //
        //
        // if (item.data.files) {
        //   JSON.parse(item.data.files).forEach(item.elemFiles.appendFile)
        // }
        // return console.log('SHOW', item);
        $.clipboard.setItem([item], 'selected', '');
        let link;
        if (item.data.link) {
          // console.log(item.data.link);
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
    },
    showpage(item) {
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
    },
    async showMenuTop(item) {
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
    },
    showLinks(item) {
			aimClient.api(`/${item.tag}`).query('request_type','build_link_data').get().then(body => {
				//console.log(e.body);
				$('div').style('display:block;width:100%;height:400px;background:white;border:solid 1px red;')
				.attr('height',400)
				.width(400)
				.parent(this.main)
				// .modelLinks(e.body)
				// .modelTraverse(e.body)
				.modelDigraph(body)
			});
		},
    sort: {
      Title: function(a, b) { return String(a.Title.toLowerCase()).localeCompare(String(b.Title.toLowerCase())) },
      index: function(a, b) {
        if (a.index != undefined && b.index == undefined) return -1;
        if (a.index != undefined && b.index == undefined) return 1;
        if (a.index > b.index) return 1;
        if (a.index < b.index) return -1;
        return 0;
      },
      id: function(a, b) {
        if (a.id < b.id)
        return -1;
        if (a.id > b.id)
        return 1;
        return 0;
      },
      filter: function(a, b) {
        if (a.cnt > 0 && b.cnt == 0) return -1;
        if (a.cnt == 0 && b.cnt > 0) return 1;
        return a.value.localeCompare(b.value, {}, 'numeric');
      },
      value: function(a, b) {
        var va = (isNaN(a.value)) ? a.value.toLowerCase() : a.value;
        var vb = (isNaN(b.value)) ? b.value.toLowerCase() : b.value;
        if (va < vb) return -1;
        if (va > vb) return 1;
        return 0;
      },
      prijs: function(a, b) {
        if (Number(isnull(a.Prijs, 0)) < Number(isnull(b.Prijs, 0)))
        return -1;
        if (Number(isnull(a.Prijs, 0)) > Number(isnull(b.Prijs, 0)))
        return 1;
        return 0;
      },
      prijsLaagHoog: function(a, b) {
        if (Number(isnull(a.field.Prijs.Value, 0)) < Number(isnull(b.field.Prijs.Value, 0)))
        return -1;
        if (Number(isnull(a.field.Prijs.Value, 0)) > Number(isnull(b.field.Prijs.Value, 0)))
        return 1;
        return 0;
      },
      prijsHoogLaag: function(a, b) {
        if (Number(isnull(a.field.Prijs.Value, 0)) < Number(isnull(b.field.Prijs.Value, 0)))
        return 1;
        if (Number(isnull(a.field.Prijs.Value, 0)) > Number(isnull(b.field.Prijs.Value, 0)))
        return -1;
        return 0;
      },
      nameAz: function(a, b) {
        if ((a.field.Name.Value || '').toLowerCase() < (b.field.Name.Value || '').toLowerCase())
        return -1;
        if ((a.field.Name.Value || '').toLowerCase() > (b.field.Name.Value || '').toLowerCase())
        return 1;
        return 0;
      },
      nameZa: function(a, b) {
        if ((a.field.Name.Value || '').toLowerCase() < (b.field.Name.Value || '').toLowerCase())
        return 1;
        if ((a.field.Name.Value || '').toLowerCase() > (b.field.Name.Value || '').toLowerCase())
        return -1;
        return 0;
      },
      prijsdesc: function(a, b) {
        if (Number(isnull(a.Prijs, 0)) < Number(isnull(b.Prijs, 0)))
        return 1;
        if (Number(isnull(a.Prijs, 0)) > Number(isnull(b.Prijs, 0)))
        return -1;
        return 0;
      },
      idx1: function(a, b) {
        if (a.index < b.index)
        return -1;
        if (a.index > b.index)
        return 1;
        return 0;
      },
      az: function(a, b) {
        if (isnull(a.Name, '') < isnull(b.Name, ''))
        return 1;
        if (isnull(a.Name, '') > isnull(b.Name, ''))
        return -1;
        return 0;
      },
      za: function(a, b) {
        if (isnull(a.Name, '') < isnull(b.Name, ''))
        return -1;
        if (isnull(a.Name, '') > isnull(b.Name, ''))
        return 1;
        return 0;
      },
      cntdn: function(a, b) {
        if (a.cnt < b.cnt)
        return 1;
        if (a.cnt > b.cnt)
        return -1;
        return 0;
      },
    },
    statusbar() {
      $.his.elem.statusbar = this.class('row statusbar np').append(
        ['ws','aliconnector','http','is_checked','clipboard','pos','source','target','main'].map(name => this[name] = $('span').class(name)),
      );
      this.progress = $('progress').parent(this.main.class('aco'));
      return this;
    },
    setProperty(selector, context) {
      this.elem.style.setProperty('--'+selector, context);
      return this;
    },
    slider(element){
      console.error('SLIDER');
  		const elements = [...document.getElementsByClassName('aimage')].filter(elem => elem.is.has('ofile'));
      let imageNr = elements.indexOf(element);
  		elements.forEach(element => { if (element.pause) element.pause() });
  		// let imageNr = 0;
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
          //window.requestAnimationFrame(scrollPlay);
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
          // this.srcElement.onended = e => {
          // 	this.next();
          // };
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
  			// this.elem = null;
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
  		// swipedetect(divElement, swipedir => {
  		// 	if (swipedir === 'left') next();
  		// 	else if (swipedir === 'right') prior();
  		// });
      this.show(element);
    },
    text(value) {
			if (arguments.length) {
        this.elem.innerText = [].concat(...arguments).join(' ');
        return this;
			}
      return this.elem.innerText;
		},
    tds(options = {}) {
      var container, controls;
      var camera, scene, renderer;
      container = this.elem;
      // console.log(this.elem, this.width(), this.height());
      // container.style = 'width:120px;';
      const width = this.width() || container.offsetWidth;
      const height = this.height() || container.offsetHeight;
      // console.log([...document.getElementsByTagName('SCRIPT')].find(s => s.src === '/lib/three/examples/js/controls/TrackballControls.js'));
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
        //3ds files dont store normal maps
        // var loader = new THREE.TextureLoader();
        // // var normal = loader.load( '/lib/three/examples/models/3ds/portalgun/textures/normal.jpg' );
        // var normal = loader.load( '/shared/upload/normal.jpg' );
        var loader = new THREE.TDSLoader( );
        // loader.setResourcePath( '/lib/three/examples/models/3ds/portalgun/textures/' );
        // loader.setResourcePath( '/shared/upload/' );
        // loader.load( '/lib/three/examples/models/3ds/portalgun/portalgun.3ds', function ( object ) {
        loader.load( options.src, function ( object ) {
          // object.traverse( function ( child ) {
          //
          // 	if ( child.isMesh ) {
          //
          // 		child.material.normalMap = normal;
          //
          // 	}
          //
          // } );
          scene.add( object );
        } );
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        // renderer.setSize( width, height );
        this.append( renderer.domElement );
        controls = new THREE.TrackballControls( camera, renderer.domElement );
        // console.log(window);
        $(window).on('resize', resize, false).emit('resize');
        setTimeout(() => {
          renderer.render( scene, camera );
        },200);
        if (options.hasControls) {
          animate();
        }
        // requestAnimationFrame( animate );
        // animate();
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
    },
    treelist(){
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
		},
    ttext(value){
      this.elem.innerText = [].concat(...arguments).map(s => __(s)).join(' ');
			return this;
		},
    toggle() {
			this.open(!this.open());
      return this;
    },
    toHtml() {
			return web.html(...arguments);
		},
    tree(){
      $().tree(this);
      return this;
    },
    type(){
			return this.attr('type', ...arguments);
		},
    openLinkInIframe(src) {
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
    },
    openHtmlInIframe(html) {
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
    },
    window(e) {
			this.url = apiorigin + "/" + $.config.$.domain + "/" + $.version + "/app/form/?select*&schema=" + this.schema + "&id=" + (this.detailID || this.id) + (this.uid ? "&uid=" + this.uid : "");
			if ($.his.handles[this.url]) {
				$.his.handles[this.url].focus();
			}
			else {
				$.his.handles[this.url] = window.open(this.url, this.url, 'width=600, height=800, left=' + (e.screenX || 0) + ', top=' + (e.screenY || 0));
				$.his.handles[this.url].name = this.url;
				$.his.handles[this.url].onbeforeunload = function() { $.his.handles[this.name] = null };
			}
		},
		sampleWindow(url) {
			const height = 600;
			const width = 1200;
			let rect = document.body.getBoundingClientRect();
			let top = window.screenTop + window.innerHeight - height + 50 - 20;
			let left = window.screenLeft + window.innerWidth - width - 20;
			return window.open(url, 'sample', `top=${top},left=${left},width=${width},height=${height},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`);
		},
		tileboard (menuname) {
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
									//href: '#' + $.url.stringify(menuitem.get || { bv: menuname })
								});
								if (menuitem.showbody) menuitem.showbody();
								for (var itemname in menuitem.items) {
									var item = $.$.menu.items[itemname];
									if (item) {
										item.elLink = createElement('DIV', { className: 'row bgd' }).createElement('A', {
											name: itemname, className: 'row aco abtn icn ' + item.className, innerText: item.Title, menuitem: item,
											//par: { mn: this.name },
											par: item.get,
											onclick: Element.onclick,
											//href: '#' + $.url.stringify({ mn: itemname })
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
		},
    panel(parent) {
      return this.parent(parent || $('list')).class('col abs').append(
        this.elemBar = $('div').class('row top abs btnbar').append(
          $('span').class('aco'),
          $('button').class('abtn close').on('click', e => this.elem.remove()),
        ),
        this.elemMain = $('main').class('aco oa'),
      );
      // return this.parent($('list')).class('col abs').append(
      //   this.elemBar = $('div').class('row top abs btnbar').append(
      //     $('span').class('aco'),
      //     $('button').class('abtn close').on('click', e => this.elem.remove()),
      //   ),
      //   this.elemMain = $('main').class('aco oa'),
      // );
    },
	});


  const currentScript = document.currentScript;
  const scriptPath = currentScript.src.replace(/js\/aim.js/, '');
  // console.debug(333, scriptPath);
  [...currentScript.attributes].forEach(attribute => $.extend({config: minimist(['--'+attribute.name.replace(/^--/, ''), attribute.value])}));
  (new URLSearchParams(document.location.search)).forEach((value,key)=>$.extend({config: minimist([key,value])}));

  if (currentScript.attributes.libraries) {
    currentScript.attributes.libraries.value.split(',')
    .forEach(selector => importScript(
      currentScript.attributes.src.value.replace(/aim/, selector)
    ));
  }
  window.addEventListener('load', async e => {
    if (currentScript.attributes.url) {
      await $().url('config.json', currentScript.attributes.url.value).get().catch(console.error).then(e => $.extend({config: e.body}));
    }
    // (new URL(document.currentScript.src)).searchParams.forEach((value, key)=>$.extend(config, minimist([key,value])));
    [...currentScript.attributes].forEach(attribute => $.extend({config: minimist(['--'+attribute.name.replace(/^--/, ''), attribute.value])}));
    (new URLSearchParams(document.location.search)).forEach((value,key)=>$.extend({config: minimist([key,value])}));

    $().emit('load').then(e => {
      $().emit('ready').then(e => {
        $(window).emit('popstate');
        $(window).emit('focus');
      });
    })
  })
}));
