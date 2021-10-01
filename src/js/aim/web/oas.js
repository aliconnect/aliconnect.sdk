window.addEventListener('load', e => {
  let elements = document.querySelectorAll('data');
  Array.from(elements[0].attributes).forEach(a => this[a.name]=JSON.parse(a.value));
  console.log(this.config);
  const config = this.config;
  const formElem = $('form').parent(document.body).on('submit', e => {
    console.log(config);
    return false;
  });
  var contentElem = $('details').parent(formElem).append(
    $('summary').text('Config')
  );
  (function build(obj){
    Object.entries(obj).forEach(([key,val]) => {
      // return;
      if (val && typeof val === 'object') {
        const parent = contentElem;
        contentElem = $('details').parent(contentElem).append(
          $('summary').text(isNaN(key) ? key : Number(key)+1)
        );
        build(val);
        contentElem = parent;
      } else {
        if (val === null) {
          val === '';
          for (var p = contentElem; p; p = p.parentElement) p.open(1);
        }
        // val = String(val);
        console.log(typeof val)
        contentElem.append(
          $('div').append(
            $('label').text(key),
            $('input').value(val||'').placeholder(' ').on('change', e => {
              obj[key] = e.target.value;
              console.log(obj, config)
            }),
          )
        )
      }
    })
  })(config);
  formElem.append(
    $('button').text('SUBMIT')
  )

  // let config = elements[0].getAttribute('config');
  // console.log(elements[0]);

})
