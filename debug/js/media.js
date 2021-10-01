function Media() {}
Media.prototype = {
  Audio(url) {
    return $.promise('audio', function(resolve, reject) {   // return a promise
      var audio = new Audio(url);                     // create audio wo/ src
      audio.preload = "auto";                      // intend to play through
      audio.autoplay = true;                       // autoplay when loaded
      audio.onerror = reject;                      // on error, reject
      audio.onended = resolve;                     // when done, resolve
      //audio.src = url; // just for example
      // //console.debug(audio);
    });
  },
  onscroll: function() {
    if (this.images && this.images[0]) for (var i1 = 0, imagesElement; imagesElement = this.images[i1]; i1++) {
      var files = imagesElement.files;
      if (files && files.images && files.images[files.slideIdx]) {
        if (checkVisible(files.images[files.slideIdx])) files.images[files.slideIdx].show();
        if (files.images[files.slideIdx].pause) {
          if (checkVisibleAll(files.images[files.slideIdx])) {
            if (!items.player.elPlaying) {
              player.elPlaying = files.images[files.slideIdx];
              $.player.elPlaying.play();
            }
          }
          else
          files.images[files.slideIdx].pause();
        }
      }
    }
  },
  init: function() {
    this.images = colpage.getElementsByClassName('images');
    for (var i1 = 0, imagesElement; imagesElement = this.images[i1]; i1++) {
      var files = imagesElement.files;
      imagesElement.createElement('DIV', { className: 'btr prev', files: files, onclick: function() { this.files.slide(-1); } });
      imagesElement.createElement('DIV', { className: 'btr next', files: files, onclick: function() { this.files.slide(1); } });
      if (files) {
        files.images = files.el.getElementsByClassName('aimage');
        files.slideIdx = 0;
        files.slide();
      }
    }
  },
  play: function(elPrev) {
    var c = colpage.getElementsByTagName('video');
    if (!elPrev) var start = true;
    for (var i = 0, e; e = c[i]; i++) {
      if (start && checkVisibleAll(e)) return e.play();
      if (e == elPrev) var start = true;
    }
  },
  pause: function() {
  },
};
