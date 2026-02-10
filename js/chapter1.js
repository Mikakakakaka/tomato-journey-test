/**
 * 第一章：生长 - 左右摇摆获取水分与阳光
 */
(function () {
  var canvas, ctx, w, h;
  var growth = 0;
  var targetGrowth = 100;
  var timeLeft = 75;
  var totalTime = 75;
  var plantX = 0.5;
  var targetPlantX = 0.5;
  var plantTilt = 0;
  var animId;
  var waterDrops = [];
  var sunRays = [];
  var lastSpawn = 0;

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

  function drawSkySoil() {
    var skyH = h * 0.55;
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, w, skyH);
    ctx.fillStyle = '#5d4e37';
    ctx.fillRect(0, skyH, w, h - skyH);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, 0, w, skyH * 0.5);
  }

  function drawWaterZone() {
    ctx.fillStyle = 'rgba(52, 152, 219, 0.25)';
    ctx.fillRect(0, 0, w * 0.3, h);
    ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
    ctx.font = '14px sans-serif';
    ctx.fillText('💧 水分', w * 0.08, h * 0.12);
  }

  function drawSunZone() {
    ctx.fillStyle = 'rgba(241, 196, 15, 0.25)';
    ctx.fillRect(w * 0.7, 0, w * 0.3, h);
    ctx.fillStyle = 'rgba(230, 126, 34, 0.7)';
    ctx.font = '14px sans-serif';
    ctx.fillText('☀️ 阳光', w * 0.74, h * 0.12);
  }

  function drawPlant() {
    var x = w * plantX;
    var baseY = h * 0.7;
    var tilt = plantTilt * 0.4;
    var stemH = 50 + growth * 0.4;

    ctx.save();
    ctx.translate(x, baseY);
    ctx.rotate(tilt * Math.PI / 180);

    ctx.strokeStyle = '#2d5016';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -stemH);
    ctx.stroke();

    var tomatoSize = 12 + (growth / 100) * 25;
    var red = Math.min(255, 150 + (growth / 100) * 105);
    ctx.fillStyle = 'rgb(' + red + ', 50, 40)';
    ctx.beginPath();
    ctx.arc(0, -stemH - 8, tomatoSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  function drawWaterDrops() {
    waterDrops.forEach(function (d) {
      ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
      ctx.beginPath();
      ctx.arc(d.x, d.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawSunRays() {
    sunRays.forEach(function (s) {
      ctx.fillStyle = 'rgba(241, 196, 15, 0.9)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawHUD() {
    var hudLeft = document.getElementById('hud-left');
    var hudCenter = document.getElementById('hud-center');
    var hudRight = document.getElementById('hud-right');
    if (hudLeft) hudLeft.textContent = '生长: ' + Math.min(100, Math.round(growth)) + '%';
    if (hudCenter) hudCenter.textContent = '';
    if (hudRight) hudRight.textContent = '时间: ' + Math.max(0, Math.ceil(timeLeft)) + 's';
  }

  function spawnCollectibles(now) {
    if (now - lastSpawn < 350) return;
    lastSpawn = now;
    if (waterDrops.length < 8) {
      waterDrops.push({
        x: Math.random() * w * 0.2 + w * 0.05,
        y: h * 0.15 + Math.random() * h * 0.4,
        vy: 0.28
      });
    }
    if (sunRays.length < 8) {
      sunRays.push({
        x: w * 0.75 + Math.random() * w * 0.2,
        y: h * 0.15 + Math.random() * h * 0.4,
        vy: 0.24
      });
    }
  }

  function updateCollectibles(dt) {
    waterDrops = waterDrops.filter(function (d) {
      d.y += d.vy * dt;
      return d.y < h + 20;
    });
    sunRays = sunRays.filter(function (s) {
      s.y += s.vy * dt;
      return s.y < h + 20;
    });
  }

  function checkCollision() {
    var px = w * plantX;
    var py = h * 0.65;
    var hitR = Math.min(55, Math.min(w, h) * 0.15);

    waterDrops = waterDrops.filter(function (d) {
      if (Math.hypot(d.x - px, d.y - py) < hitR) {
        growth = Math.min(targetGrowth, growth + 7);
        return false;
      }
      return true;
    });

    sunRays = sunRays.filter(function (s) {
      if (Math.hypot(s.x - px, s.y - py) < hitR) {
        growth = Math.min(targetGrowth, growth + 7);
        return false;
      }
      return true;
    });
  }

  function loop(now) {
    if (!ctx || !canvas) return;
    var dt = 0.016;
    timeLeft -= dt;
    plantX += (targetPlantX - plantX) * 0.065;
    plantTilt += ((lastTiltX || 0) * 25 - plantTilt) * 0.08;
    spawnCollectibles(now);
    updateCollectibles(dt * 60);
    checkCollision();

    if (timeLeft <= 0) {
      if (growth >= targetGrowth * 0.5) {
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

    if (growth >= targetGrowth) {
      if (window.TomatoJourney && window.TomatoJourney.onChapterWin) {
        window.TomatoJourney.onChapterWin();
      }
      return;
    }

    drawSkySoil();
    drawWaterZone();
    drawSunZone();
    drawWaterDrops();
    drawSunRays();
    drawPlant();
    drawHUD();

    animId = requestAnimationFrame(loop);
  }

  var lastTiltX = 0;
  function onTilt(tilt) {
    var tx = Math.max(-1, Math.min(1, tilt.x));
    lastTiltX = tx;
    var tiltRange = 0.7;
    targetPlantX = Math.max(0.02, Math.min(0.98, (tx + tiltRange) / (tiltRange * 2)));
  }

  function start() {
    growth = 0;
    timeLeft = totalTime;
    plantX = 0.5;
    targetPlantX = 0.5;
    plantTilt = 0;
    lastTiltX = 0;
    waterDrops = [];
    sunRays = [];
    lastSpawn = 0;
    if (!getCanvas()) return;
    if (window.Gravity) window.Gravity.on(onTilt);
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    if (window.Gravity) window.Gravity.off(onTilt);
    if (animId) cancelAnimationFrame(animId);
  }

  window.TomatoJourney = window.TomatoJourney || {};
  window.TomatoJourney.chapter1 = { start: start, stop: stop };
})();
