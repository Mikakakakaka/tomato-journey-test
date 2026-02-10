/**
 * 第三章：冰箱迷宫 - 倾斜滚出迷宫找到出口
 */
(function () {
  var canvas, ctx, w, h;
  var cols = 9, rows = 11;
  var cellW, cellH;
  var maze = [];
  var ball = { x: 0, y: 0, vx: 0, vy: 0 };
  var exitCell = { col: 0, row: 0 };
  var friction = 0.92;
  var animId;
  var startCell = { col: 1, row: 1 };

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
    cellW = w / cols;
    cellH = h / rows;
  }

  function buildMaze() {
    maze = [];
    for (var r = 0; r < rows; r++) {
      maze[r] = [];
      for (var c = 0; c < cols; c++) {
        maze[r][c] = 1;
      }
    }
    function carve(c, r) {
      maze[r][c] = 0;
      var dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];
      for (var i = dirs.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = dirs[i]; dirs[i] = dirs[j]; dirs[j] = t;
      }
      for (var d = 0; d < dirs.length; d++) {
        var nc = c + dirs[d][0];
        var nr = r + dirs[d][1];
        if (nc > 0 && nc < cols - 1 && nr > 0 && nr < rows - 1 && maze[nr][nc] === 1) {
          maze[nr][nr][nr] = 0;
          maze[r + (nr - r) / 2][c + (nc - c) / 2] = 0;
          carve(nc, nr);
        }
      }
    }
    carve(1, 1);
    for (var rr = 0; rr < rows; rr++) {
      for (var cc = 0; cc < cols; cc++) {
        if (maze[rr][cc] === 0 && (rr === 0 || cc === 0 || rr === rows - 1 || cc === cols - 1)) {
          maze[rr][cc] = 0;
        }
      }
    }
    maze[1][1] = 0;
    maze[0][1] = 0;
    maze[rows - 1][cols - 2] = 0;
    maze[rows - 2][cols - 2] = 0;
    exitCell = { col: cols - 2, row: rows - 2 };
    startCell = { col: 1, row: 1 };
  }

  function buildSimpleMaze() {
    maze = [];
    for (var r = 0; r < rows; r++) {
      maze[r] = [];
      for (var c = 0; c < cols; c++) {
        var wall = 1;
        if (c === 0 || c === cols - 1 || r === 0 || r === rows - 1) {
          wall = 1;
        } else {
          if (r === 1 && c >= 1 && c <= 7) wall = 0;
          if (r === 2 && (c === 1 || c === 2 || c === 7)) wall = 0;
          if (r === 3 && c >= 1 && c <= 7) wall = 0;
          if (r === 4 && (c === 1 || c === 7)) wall = 0;
          if (r === 5 && (c === 1 || c === 2 || c === 3 || c === 7)) wall = 0;
          if (r === 6 && c >= 1 && c <= 7) wall = 0;
          if (r === 7 && (c === 5 || c === 6 || c === 7)) wall = 0;
          if (r === 8 && c >= 5 && c <= 7) wall = 0;
          if (r === 9 && c >= 5 && c <= 7) wall = 0;
        }
        maze[r][c] = wall;
      }
    }
    maze[1][1] = 0;
    maze[0][1] = 0;
    maze[rows - 1][cols - 2] = 0;
    maze[rows - 2][cols - 2] = 0;
    exitCell = { col: cols - 2, row: rows - 2 };
    startCell = { col: 1, row: 1 };
  }

  function cellToPixel(col, row) {
    return {
      x: (col + 0.5) * cellW,
      y: (row + 0.5) * cellH
    };
  }

  function getCell(px, py) {
    var col = Math.floor(px / cellW);
    var row = Math.floor(py / cellH);
    if (col < 0 || col >= cols || row < 0 || row >= rows) return 1;
    return maze[row][col];
  }

  function drawMaze() {
    ctx.fillStyle = '#1a4d6d';
    ctx.fillRect(0, 0, w, h);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (maze[r][c] === 1) {
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(c * cellW + 2, r * cellH + 2, cellW - 4, cellH - 4);
          ctx.strokeStyle = '#34495e';
          ctx.lineWidth = 2;
          ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }

    var ex = cellToPixel(exitCell.col, exitCell.row);
    ctx.fillStyle = 'rgba(46, 204, 113, 0.6)';
    ctx.fillRect(exitCell.col * cellW + 4, exitCell.row * cellH + 4, cellW - 8, cellH - 8);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('出口', ex.x - 12, ex.y + 5);
  }

  function drawBall() {
    var r = Math.min(cellW, cellH) * 0.35;
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawHUD() {
    var hudLeft = document.getElementById('hud-left');
    var hudCenter = document.getElementById('hud-center');
    if (hudLeft) hudLeft.textContent = '冰箱迷宫';
    if (hudCenter) hudCenter.textContent = '滚到绿色出口';
  }

  function loop() {
    if (!ctx || !canvas) return;

    var acc = 0.35;
    ball.vx += accelX * acc;
    ball.vy += accelY * acc;
    ball.vx *= friction;
    ball.vy *= friction;

    var newX = ball.x + ball.vx;
    var newY = ball.y + ball.vy;
    var rad = Math.min(cellW, cellH) * 0.32;

    if (getCell(newX - rad, ball.y) === 0 && getCell(newX + rad, ball.y) === 0) {
      ball.x = newX;
    } else {
      ball.vx = 0;
    }
    if (getCell(ball.x, newY - rad) === 0 && getCell(ball.x, newY + rad) === 0) {
      ball.y = newY;
    } else {
      ball.vy = 0;
    }

    ball.x = Math.max(rad, Math.min(w - rad, ball.x));
    ball.y = Math.max(rad, Math.min(h - rad, ball.y));

    var exitPx = cellToPixel(exitCell.col, exitCell.row);
    if (Math.hypot(ball.x - exitPx.x, ball.y - exitPx.y) < cellW * 0.5) {
      if (window.TomatoJourney && window.TomatoJourney.onChapterWin) {
        window.TomatoJourney.onChapterWin();
      }
      return;
    }

    drawMaze();
    drawBall();
    drawHUD();

    animId = requestAnimationFrame(loop);
  }

  var accelX = 0, accelY = 0;
  function onTilt(tilt) {
    accelX = tilt.x * 8;
    accelY = tilt.y * 8;
  }

  function start() {
    buildSimpleMaze();
    var startPx = cellToPixel(startCell.col, startCell.row);
    ball.x = startPx.x;
    ball.y = startPx.y;
    ball.vx = ball.vy = 0;
    accelX = accelY = 0;
    if (!getCanvas()) return;
    if (window.Gravity) window.Gravity.on(onTilt);
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    if (window.Gravity) window.Gravity.off(onTilt);
    if (animId) cancelAnimationFrame(animId);
  }

  window.TomatoJourney = window.TomatoJourney || {};
  window.TomatoJourney.chapter3 = { start: start, stop: stop };
})();
