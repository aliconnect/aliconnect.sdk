Paint = function (canvas, options) {
  setTimeout(()=>{
    var self = this;
    var opts = options || {};
    this._handleMouseDown = function(e) {
      if (e.which === 1) {
        self._mouseButtonDown = true;
        self._strokeBegin(e);
      }
    };
    this._handleMouseMove = function(e) {
      if (self._mouseButtonDown) {
        self._strokeUpdate(e);
      }
    };
    this._handleMouseUp = function(e) {
      if (e.which === 1 && self._mouseButtonDown) {
        self._mouseButtonDown = false;
        self._strokeEnd(e);
      }
    };
    this._handleTouchStart = function(e) {
      if (e.targetTouches.length == 1) {
        var touch = e.changedTouches[0];
        self._strokeBegin(touch);
      }
    };
    this._handleTouchMove = function(e) {
      // Prevent scrolling.
      e.preventDefault();
      var touch = e.targetTouches[0];
      self._strokeUpdate(touch);
    };
    this._handleTouchEnd = function(e) {
      var wasCanvasTouched = e.target === self._canvas;
      if (wasCanvasTouched) {
        e.preventDefault();
        self._strokeEnd(e);
      }
    };
    this._canvas = canvas;
    this._ctx = canvas.context = canvas.getContext("2d");
    // console.log(canvas);
    // canvas.width = canvas.clientWidth;
    // canvas.height = canvas.clientHeight;
    // console.log(canvas.clientWidth,canvas.offsetWidth,canvas.width,canvas.height)
    // canvas.width = 640;
    // canvas.height = 480;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    // console.log('CANVAS', canvas.getBoundingClientRect(), canvas.height, canvas.width, canvas.clientWidth, canvas.clientHeight, canvas.offsetHeight)
    this.velocityFilterWeight = opts.velocityFilterWeight || 0.7;
    this.minWidth = opts.minWidth || 0.5;
    this.maxWidth = opts.maxWidth || 2.5;
    this.dotSize = opts.dotSize || function() {
      return (this.minWidth + this.maxWidth) / 2;
    };
    this.penColor = opts.penColor || "black";
    this.backgroundColor = opts.backgroundColor || "rgba(0, 0, 0, 0)";
    this.onEnd = opts.onEnd;
    this.onBegin = opts.onBegin;
    // this.clear();
    // we need add these inline so they are available to unbind while still having
    //  access to 'self' we could use _.bind but it's not worth adding a dependency
    // setTimeout(()=>{
      this._handleMouseEvents();
      this._handleTouchEvents();
      // })

  })
};
Paint.prototype = {
  clear() {
    var ctx = this._ctx,
    canvas = this._canvas;
    ctx.fillStyle = this.backgroundColor;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this._reset();
  },
  toDataURL(imageType, quality) {
    var canvas = this._canvas;
    return canvas.toDataURL.apply(canvas, arguments);
  },
  fromDataURL(dataUrl) {
    var self = this,
    image = new Image(),
    ratio = window.devicePixelRatio || 1,
    width = this._canvas.width / ratio,
    height = this._canvas.height / ratio;
    this._reset();
    image.src = dataUrl;
    image.onload = function() {
      self._ctx.drawImage(image, 0, 0, width, height);
    };
    this._isEmpty = false;
  },
  _strokeUpdate(e) {
    var point = this._createPoint(e);
    this._addPoint(point);
  },
  _strokeBegin(e) {
    this._reset();
    this._strokeUpdate(e);
    if (typeof this.onBegin === 'function') {
      this.onBegin(e);
    }
  },
  _strokeDraw(point) {
    var ctx = this._ctx,
    dotSize = typeof (this.dotSize) === 'function' ? this.dotSize() : this.dotSize;
    ctx.beginPath();
    this._drawPoint(point.x, point.y, dotSize);
    ctx.closePath();
    ctx.fill();
  },
  _strokeEnd(e) {
    var canDrawCurve = this.points.length > 2,
    point = this.points[0];
    if (!canDrawCurve && point) {
      this._strokeDraw(point);
    }
    if (typeof this.onEnd === 'function') {
      this.onEnd(e);
    }
  },
  _handleMouseEvents() {
    this._mouseButtonDown = false;
    this._canvas.addEventListener("mousedown", this._handleMouseDown);
    this._canvas.addEventListener("mousemove", this._handleMouseMove);
    document.addEventListener("mouseup", this._handleMouseUp);
  },
  _handleTouchEvents() {
    // Pass touch events to canvas elem on mobile IE.
    this._canvas.style.msTouchAction = 'none';
    this._canvas.addEventListener("touchstart", this._handleTouchStart);
    this._canvas.addEventListener("touchmove", this._handleTouchMove);
    document.addEventListener("touchend", this._handleTouchEnd);
  },
  on() {
    this._handleMouseEvents();
    this._handleTouchEvents();
  },
  off() {
    this._canvas.removeEventListener("mousedown", this._handleMouseDown);
    this._canvas.removeEventListener("mousemove", this._handleMouseMove);
    document.removeEventListener("mouseup", this._handleMouseUp);
    this._canvas.removeEventListener("touchstart", this._handleTouchStart);
    this._canvas.removeEventListener("touchmove", this._handleTouchMove);
    document.removeEventListener("touchend", this._handleTouchEnd);
  },
  isEmpty() {
    return this._isEmpty;
  },
  _reset() {
    this.points = [];
    this._lastVelocity = 0;
    this._lastWidth = (this.minWidth + this.maxWidth) / 2;
    this._isEmpty = true;
    this._ctx.fillStyle = this.penColor;
  },
  _createPoint(e) {
    var rect = this._canvas.getBoundingClientRect();
    return new Point(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  },
  _addPoint(point) {
    var points = this.points,
    c2, c3,
    curve, tmp;
    points.push(point);
    if (points.length > 2) {
      // To reduce the initial lag make it work with 3 points
      // by copying the first point to the beginning.
      if (points.length === 3) points.unshift(points[0]);
      tmp = this._calculateCurveControlPoints(points[0], points[1], points[2]);
      c2 = tmp.c2;
      tmp = this._calculateCurveControlPoints(points[1], points[2], points[3]);
      c3 = tmp.c1;
      curve = new Bezier(points[1], c2, c3, points[2]);
      this._addCurve(curve);
      // Remove the first elem from the list,
      // so that we always have no more than 4 points in points array.
      points.shift();
    }
  },
  _calculateCurveControlPoints(s1, s2, s3) {
    var dx1 = s1.x - s2.x, dy1 = s1.y - s2.y,
    dx2 = s2.x - s3.x, dy2 = s2.y - s3.y,
    m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 },
    m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 },
    l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1),
    l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2),
    dxm = (m1.x - m2.x),
    dym = (m1.y - m2.y),
    k = l2 / (l1 + l2),
    cm = { x: m2.x + dxm * k, y: m2.y + dym * k },
    tx = s2.x - cm.x,
    ty = s2.y - cm.y;
    return {
      c1: new Point(m1.x + tx, m1.y + ty),
      c2: new Point(m2.x + tx, m2.y + ty)
    };
  },
  _addCurve(curve) {
    var startPoint = curve.startPoint,
    endPoint = curve.endPoint,
    velocity, newWidth;
    velocity = endPoint.velocityFrom(startPoint);
    velocity = this.velocityFilterWeight * velocity
    + (1 - this.velocityFilterWeight) * this._lastVelocity;
    newWidth = this._strokeWidth(velocity);
    this._drawCurve(curve, this._lastWidth, newWidth);
    this._lastVelocity = velocity;
    this._lastWidth = newWidth;
  },
  _drawPoint(x, y, size) {
    var ctx = this._ctx;
    ctx.moveTo(x, y);
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    this._isEmpty = false;
  },
  _drawCurve(curve, startWidth, endWidth) {
    var ctx = this._ctx,
    widthDelta = endWidth - startWidth,
    drawSteps, width, i, t, tt, ttt, u, uu, uuu, x, y;
    drawSteps = Math.floor(curve.length());
    ctx.beginPath();
    for (i = 0; i < drawSteps; i++) {
      // Calculate the Bezier (x, y) coordinate for this step.
      t = i / drawSteps;
      tt = t * t;
      ttt = tt * t;
      u = 1 - t;
      uu = u * u;
      uuu = uu * u;
      x = uuu * curve.startPoint.x;
      x += 3 * uu * t * curve.control1.x;
      x += 3 * u * tt * curve.control2.x;
      x += ttt * curve.endPoint.x;
      y = uuu * curve.startPoint.y;
      y += 3 * uu * t * curve.control1.y;
      y += 3 * u * tt * curve.control2.y;
      y += ttt * curve.endPoint.y;
      width = startWidth + ttt * widthDelta;
      this._drawPoint(x, y, width);
    }
    ctx.closePath();
    ctx.fill();
  },
  _strokeWidth(velocity) {
    return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
  },
};
function Point(x, y, time) {
  this.x = x;
  this.y = y;
  this.time = time || new Date().getTime();
};
Point.prototype = {
  velocityFrom(start) {
    return (this.time !== start.time) ? this.distanceTo(start) / (this.time - start.time) : 1;
  },
  distanceTo(start) {
    return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
  },
};
function Bezier(startPoint, control1, control2, endPoint) {
  this.startPoint = startPoint;
  this.control1 = control1;
  this.control2 = control2;
  this.endPoint = endPoint;
};
Bezier.prototype = {
  length() {
    var steps = 10,
    length = 0,
    i, t, cx, cy, px, py, xdiff, ydiff;
    for (i = 0; i <= steps; i++) {
      t = i / steps;
      cx = this._point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
      cy = this._point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
      if (i > 0) {
        xdiff = cx - px;
        ydiff = cy - py;
        length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
      }
      px = cx;
      py = cy;
    }
    return length;
  },
  _point(t, start, c1, c2, end) {
    return start * (1.0 - t) * (1.0 - t) * (1.0 - t)
    + 3.0 * c1 * (1.0 - t) * (1.0 - t) * t
    + 3.0 * c2 * (1.0 - t) * t * t
    + end * t * t * t;
  },
};