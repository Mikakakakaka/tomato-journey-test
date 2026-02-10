/**
 * 第二章：运输 - 车内保持平衡，避免磕碰
 */
(function () {
  var canvas, ctx, w, h;
  var tomatoX = 0.5;
  var tomatoY = 0.5;
  var vx = 0, vy = 0;
  var truckShakeX = 0, truckShakeY = 0;
  var truckPhase = 0;
  var damage = 0;
  var maxDamage = 100;
  var timeLeft = 45;
  var safeZone = 0.22;
  var animId;

  function getCanvas() {
    var c = document.getElementById('game-canvas');
    if (!c) return false;
    canvas = c;
    ctx = c.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    return true;
  }

  function resize() {
    if (!canvas) return;
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function drawTruck() {
    ctx.save();
    ctx.translate(truckShakeX * 3, truckShakeY * 2);

    var boxY = h * 0.25;
    var boxH = h * 0.6;
    ctx.fillStyle = '#6b5b4f';
    ctx.fillRect(w * 0.05, boxY, w * 0.9, boxH);
    ctx.strokeStyle = '#4a3f36';
    ctx.lineWidth = 4;
    ctx.strokeRect(w * 0.05, boxY, w * 0.9, boxH);

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(w * 0.05, boxY, w * 0.9, boxH);

    var cx = w * 0.5;
    var cy = boxY + boxH * 0.5;
    var r = Math.min(w, h) * safeZone;
    ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  function drawTomato() {
    var px = w * tomatoX + truckShakeX * 3;
    var py = h * (0.25 + 0.6 * tomatoY) + truckShakeY * 2;
    var r = Math.min(w, h) * 0.06;

    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawHUD() {
    var hudLeft = document.getElementById('hud-left');
    var hudRight = document.getElementById('hud-right');
    if (hudLeft) hudLeft.textContent = '损伤: ' + Math.round(damage) + '%';
    if (hudRight) hudRight.textContent = '时间: ' + Math.max(0, Math.ceil(timeLeft)) + 's';
  }

  function loop(now) {
    if (!ctx || !canvas) return;
    var dt = 0.016;

    truckPhase += dt * 4;
    truckShakeX = Math.sin(truckPhase) * 8 + Math.sin(truckPhase * 2.3) * 4;
    truckShakeY = Math.cos(truckPhase * 1.1) * 6 + Math.cos(truckPhase * 0.7) * 3;

    var cx = 0.5;
    var cy = 0.5;
    var dx = tomatoX - cx;
    var dy = tomatoY - cy;
    var dist = Math.hypot(dx, dy);
    if (dist > safeZone) {
      var dmgRate = ((dist - safeZone) / (0.5 - safeZone)) * 25 * dt;
      damage = Math.min(maxDamage, damage + dmgRate);
    }

    timeLeft -= dt;
    if (timeLeft <= 0) {
      if (damage < maxDamage * 0.7) {
        if (window.TomatoJourney && window.TomatoJourney.onChapterWin) {
          window.TomatoJourney.onChapterWin();
        }
      } else {
        if (window.TomatoJourney && window.TomatoJourney.onChapterLose) {
          window.TomatoJourney.onChapterLose();
        }
      }
      return;
    }

    if (damage >= maxDamage) {
      if (window.TomatoJourney && window.TomatoJourney.onChapterLose) {
        window.TomatoJourney.onChapterLose();
      }
      return;
    }

    drawTruck();
    drawTomato();
    drawHUD();

    animId = requestAnimationFrame(loop);
  }

  function onTilt(tilt) {
    var k = 0.8;
    vx = -tilt.x * k;
    vy = -tilt.y * k;
    tomatoX = Math.max(0.15, Math.min(0.85, tomatoX + vx * 0.02));
    tomatoY = Math.max(0.2, Math.min(0.8, tomatoY + vy * 0.02));
  }

  function start() {
    tomatoX = 0.5;
    tomatoY = 0.5;
    vx = vy = 0;
    truckPhase = 0;
    damage = 0;
    timeLeft = 45;
    if (!getCanvas()) return;
    if (window.Gravity) window.Gravity.on(onTilt);
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    if (window.Gravity) window.Gravity.off(onTilt);
    if (animId) cancelAnimationFrame(animId);
  }

  window.TomatoJourney = window.TomatoJourney || {};
  window.TomatoJourney.chapter2 = { start: start, stop: stop };
})();
