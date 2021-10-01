aim().on('load', async e => {
  const formDefinitions = await fetch(document.location.pathname+'.yaml').then(res => res.json());
  console.log(formDefinitions);
  let data = {
    info: {
      name: '',
      title: '',
      contact: {
        email: '',
        // phone_number: '',
      },
      // description: 'sdfas',
    },
    client: {
      client_id: $.config.client_id || sessionStorage.getItem('client_id') || '',
      client_secret: $.config.client_secret || sessionStorage.getItem('client_secret') || '',
    }

  }
  // console.log(formDefinitions);
  // let config = {
  //   client_id: $.config.client_id || sessionStorage.getItem('client_id') || '',
  //   client_secret: $.config.client_secret || sessionStorage.getItem('client_secret') || '',
  //   domain: '',
  //   // last_modified: '',
  //   // info: {
  //   //   contact: {
  //   //     email: '',
  //   //   }
  //   // }
  // }
  // sessionStorage.clear();
  let activeField;
  function postForm(e){
    activeField = document.activeElement.name;
    // console.log(e, document.activeElement.name);

    // $().url(document.location.pathname + 'yaml')
    $().url('https://aliconnect.nl/api/aim/oas')
    .accept('application/json')
    .query('response_type', 'config')
    .query('client_id', data.client.client_id)
    .query('client_secret', data.client.client_secret)
    .post(JSON.stringify(data)).then(e => start(data = e.body))
    return false;
  }
  function start(){
    $(document.body).text('').class('aim-config');
    // var focusElement;
    // const config = e.body;
    sessionStorage.setItem('client_id', data.client.client_id || '');
    sessionStorage.setItem('client_secret', data.client.client_secret || '');
    // config.client_secret = $.config.client_secret;
    console.log('START', data, sessionStorage);
    const formElem = $('form').autocomplete("off").parent(document.body).on('submit', postForm);
    var contentElem = formElem;
    // $('details').open(1).parent(formElem).append(
    //   $('summary').text('Config')
    // );
    let inputId=0;
    function build(key, cfg, path){
      const metaData = cfg.metaData || { title: isNaN(key) ? key : Number(key)+1 };
      var dataObj = data;
      for (let p of path.concat(key)) {
        if (!(p in dataObj)) {
          dataObj = ''; break;
          return;
        }
        dataObj = dataObj[p];
      }
      // console.log(path,key,cfg,dataObj);
      const types = {
        boolean: 'checkbox',
        number: 'number',
        string: 'text',
        object: 'object',
      }

      // var inputElem;') Object.keys(cfg).length === 1) {
      if (cfg.metaData && Object.keys(cfg).length === 1 && (cfg.metaData.type = cfg.metaData.type || types[dataObj ? typeof dataObj : 'string']) && ['text','number','string','boolean'].includes(cfg.metaData.type || 'text')) {
        const name = path.concat(key).join('-');
        console.log(name, typeof dataObj);
        var placeholder = metaData.placeholder || (metaData.required || dataObj === null ? metaData.title || key : ' ');
        if (typeof dataObj === 'string' && dataObj.match(/^  .*  $/)) {
          placeholder = dataObj.trim();
          dataObj = null;
        }
        if (metaData.format === 'cam') {
          let userMedia;
          const video = $('video').style('background:white;flex-base: 50px;').autoplay().elem;
          const pausePlayElem = $('button').type('button').class('pause').text('Pause/Play').on('click', e => video.paused ? video.play() : video.pause());
          function toggleCam() {
            const rect = video.getBoundingClientRect();
            video.width = rect.width;
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
                pausePlayElem.disabled(true);
                video.srcObject = null;
              } else {
                navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                  try {
                    video.srcObject = stream;
                  } catch (error) {
                    video.src = window.URL.createObjectURL(stream);
                  }
                  video.play();
                  pausePlayElem.disabled(false);
                });
              }
            }
          }
          contentElem.append(
            $('div').class('input').append(
              $('span').class('info').title(metaData.description),
              $('label').class('title').text(metaData.title || key),
              $('div').class('aco col').append(
                $('div').class('row').append(
                  $('button').type('button').class('clear').text('Clear'),
                  $('button').type('button').class('on').text('On/Off').on('click', toggleCam),
                  pausePlayElem.disabled(true),
                  $('button').type('button').class('share').text('Share'),
                  $('button').type('button').class('save').text('Save'),
                  $('button').type('button').class('paint').text('Paint'),
                ),
                video,
              )
            ),
          );
        } else if (metaData.format === 'draw') {
          const canvasElem = $('canvas').style('background:white;height:150px;').paint();
          contentElem.append(
            $('div').class('input').append(
              $('span').class('info').title(metaData.description),
              $('label').class('title').text(metaData.title || key),
              $('div').class('aco col').append(
                $('div').class('row').append(
                  $('button').type('button').class('clear').text('Clear').on('click', e => canvasElem.paint.clear()),
                ),
                canvasElem,
                // $('canvas').class('aco').style('background:white;height:150px;').paint(),
              )
            ),
          );
        } else {
          contentElem.append(
            $('div').class('input').append(
              $('span').class('info').title(metaData.description),
              $('label').class('title').text(metaData.title || key),
              $('input').id('input'+inputId).class('aco')
              .name(name)
              .value(dataObj === null ? metaData.defaultValue || '' : dataObj)
              .type(types[typeof dataObj])
              // .autofocus(name === activeField ? '' : null)
              .required(metaData.required || dataObj === null ? '' : null)
              .placeholder(placeholder)
              .pattern(metaData.pattern)
              .on('change', e => {
                let obj = data;
                path.forEach(key => obj = obj[key] = obj[key] || {});
                obj[key] = e.target.value;
              }),
              // $('label').class('caption').for('input'+inputId),
              $('label').class('ico').for('input'+inputId),
            )
          )
        }
        inputId++;
        // console.log(inputElem, focusElement);
        // focusElement = focusElement || inputElem;
        // if (name === activeField || metaData.required || dataObj === null || !dataObj) {
        //   focusElement = inputElem;
        // }

        // if (cfg === null) {
        //   for (var p = contentElem; p; p = p.parentElement) p.open(1);
        // }
      } else {
        const parent = contentElem;
        contentElem = $('details').open(1).parent(contentElem).append(
          $('summary').text(metaData.title)
        );
        if (metaData.description) {
          contentElem.append($('div').html(metaData.description))
        }
        Object.entries(cfg).filter(([key,cfg])=>key !== 'metaData').forEach(entry => {
          build(...entry, path.concat(key));
        });
        contentElem = parent;
      }
    }
    Object.entries(formDefinitions).filter(([key,cfg])=>key !== 'metaData').forEach(entry => build(...entry, []));
    // console.log(1, focusElement)
    formElem.append(
      $('button').text('SUBMIT')
    )
    const elems = Array.from(formElem.elem.elements);
    const activeElment = elems.find(el => el.required) || elems.find(el => el.name === activeField) || elems.find(el => !el.value) || elems[0];
    // console.log(elems, activeElment)
    activeElment.focus();

    // focusElement.elem.focus();
  }

  // console.log(data.client.client_secret);

  if (data.client.client_secret) {
    postForm();
  } else {
    start();
  }
})
