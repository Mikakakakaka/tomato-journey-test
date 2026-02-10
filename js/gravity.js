/**
 * 重力感应封装 - 兼容 DeviceMotion / DeviceOrientation
 * 需要 HTTPS 或 localhost，iOS 需用户授权
 */
(function (global) {
  var callbacks = [];
  var lastBeta = 0;
  var lastGamma = 0;
  var smoothing = 0.15;

  // 归一化倾斜：-1 ~ 1（左负右正，用于横屏感应的 gamma）
  function getTilt() {
    return {
      x: Math.max(-1, Math.min(1, lastGamma / 45)),
      y: Math.max(-1, Math.min(1, (lastBeta - 45) / 45)),
      raw: { beta: lastBeta, gamma: lastGamma }
    };
  }

  function onMotion(e) {
    var b = e.beta != null ? e.beta : e.accelerationIncludingGravity?.y;
    var g = e.gamma != null ? e.gamma : e.accelerationIncludingGravity?.x;
    if (typeof b === 'number') lastBeta = lastBeta + (b - lastBeta) * smoothing;
    if (typeof g === 'number') lastGamma = lastGamma + (g - lastGamma) * smoothing;
    callbacks.forEach(function (cb) { cb(getTilt()); });
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
  var keySpeed = 0.5;
  function onKey(e) {
    var down = e.type === 'keydown' ? 1 : 0;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keyTilt.x = -down * keySpeed;
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyTilt.x = down * keySpeed;
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keyTilt.y = -down * keySpeed;
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keyTilt.y = down * keySpeed;
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
  }
  function getTiltWithKeys() {
    var t = getTilt();
    var useKeys = (keyTilt.x !== 0 || keyTilt.y !== 0);
    if (useKeys) return { x: keyTilt.x, y: keyTilt.y, raw: t.raw };
    return t;
  }

  global.Gravity = {
    on: function (callback) {
      if (typeof callback === 'function') callbacks.push(callback);
    },
    off: function (callback) {
      callbacks = callbacks.filter(function (c) { return c !== callback; });
    },
    getTilt: getTiltWithKeys,
    requestPermission: requestPermission,
    isSupported: function () {
      return true;
    }
  };
})(typeof window !== 'undefined' ? window : this);
