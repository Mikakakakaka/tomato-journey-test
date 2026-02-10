/**
 * 重力感应封装 - 兼容 DeviceMotion / DeviceOrientation
 * 需要 HTTPS 或 localhost，iOS 需用户授权
 * 手机：死区 + 降灵敏度，更丝滑；电脑：WASD 通过轮询驱动
 */
(function (global) {
  var callbacks = [];
  var lastBeta = 0;
  var lastGamma = 0;
  var smoothing = 0.28;

  var deadZone = 0.12;
  var maxTilt = 0.65;
  var pollId = null;

  function applyDeadZoneAndCurve(v) {
    if (Math.abs(v) <= deadZone) return 0;
    var sign = v > 0 ? 1 : -1;
    var t = (Math.abs(v) - deadZone) / (1 - deadZone);
    t = Math.pow(t, 1.2);
    return sign * Math.min(maxTilt, t * maxTilt);
  }

  function getTilt() {
    var x = Math.max(-1, Math.min(1, lastGamma / 45));
    var y = Math.max(-1, Math.min(1, (lastBeta - 45) / 45));
    return {
      x: applyDeadZoneAndCurve(x),
      y: applyDeadZoneAndCurve(y),
      raw: { beta: lastBeta, gamma: lastGamma }
    };
  }

  function onMotion(e) {
    var b = e.beta != null ? e.beta : e.accelerationIncludingGravity?.y;
    var g = e.gamma != null ? e.gamma : e.accelerationIncludingGravity?.x;
    if (typeof b === 'number') lastBeta = lastBeta + (b - lastBeta) * smoothing;
    if (typeof g === 'number') lastGamma = lastGamma + (g - lastGamma) * smoothing;
  }

  function requestPermission(cb) {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(function (state) {
          if (state === 'granted') {
            startListening();
            if (cb) cb(true);
          } else if (cb) cb(false);
        })
        .catch(function () { if (cb) cb(false); });
    } else {
      startListening();
      if (cb) cb(true);
    }
  }

  function startListening() {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', onMotion, { passive: true });
    }
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', function (e) {
        var a = e.accelerationIncludingGravity;
        if (a) onMotion({ beta: null, gamma: null, accelerationIncludingGravity: a });
      }, { passive: true });
    }
  }

  var keyTilt = { x: 0, y: 0 };
  var keySpeed = 0.55;
  function onKey(e) {
    var key = e.key;
    var isOurKey = key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown' ||
                   key === 'a' || key === 'A' || key === 'd' || key === 'D' ||
                   key === 'w' || key === 'W' || key === 's' || key === 'S';
    if (!isOurKey) return;
    if (e.type === 'keydown') e.preventDefault();
    var down = e.type === 'keydown' ? 1 : 0;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') keyTilt.x = -down * keySpeed;
    else if (key === 'ArrowRight' || key === 'd' || key === 'D') keyTilt.x = down * keySpeed;
    else if (key === 'ArrowUp' || key === 'w' || key === 'W') keyTilt.y = -down * keySpeed;
    else if (key === 'ArrowDown' || key === 's' || key === 'S') keyTilt.y = down * keySpeed;
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKey, true);
  }

  function getTiltWithKeys() {
    var t = getTilt();
    var useKeys = (keyTilt.x !== 0 || keyTilt.y !== 0);
    if (useKeys) return { x: keyTilt.x, y: keyTilt.y, raw: t.raw };
    return t;
  }

  function poll() {
    if (callbacks.length === 0) return;
    var t = getTiltWithKeys();
    callbacks.forEach(function (cb) { cb(t); });
    pollId = requestAnimationFrame(poll);
  }

  global.Gravity = {
    on: function (callback) {
      if (typeof callback === 'function') {
        callbacks.push(callback);
        if (pollId === null) pollId = requestAnimationFrame(poll);
      }
    },
    off: function (callback) {
      callbacks = callbacks.filter(function (c) { return c !== callback; });
      if (callbacks.length === 0 && pollId !== null) {
        cancelAnimationFrame(pollId);
        pollId = null;
      }
    },
    getTilt: getTiltWithKeys,
    requestPermission: requestPermission,
    isSupported: function () {
      return true;
    }
  };
})(typeof window !== 'undefined' ? window : this);
