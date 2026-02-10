/**
 * 番茄的旅程 - 主流程与章节切换
 */
(function () {
  var screens = {
    intro: document.getElementById('screen-intro'),
    chapterIntro: document.getElementById('screen-chapter-intro'),
    game: document.getElementById('screen-game'),
    win: document.getElementById('screen-win'),
    lose: document.getElementById('screen-lose')
  };

  var chapterTitle = document.getElementById('chapter-title');
  var chapterDesc = document.getElementById('chapter-desc');
  var btnStart = document.getElementById('btn-start');
  var btnPlayChapter = document.getElementById('btn-play-chapter');
  var btnNextChapter = document.getElementById('btn-next-chapter');
  var btnFinalDone = document.getElementById('btn-final-done');
  var btnRetry = document.getElementById('btn-retry');
  var winTitle = document.getElementById('win-title');
  var winDesc = document.getElementById('win-desc');
  var loseDesc = document.getElementById('lose-desc');
  var trashTomatoes = document.getElementById('trash-tomatoes');

  var currentChapter = 1;
  var totalChapters = 3;
  var failedCount = 0;

  var chapters = [
    {
      title: '第一章 · 生长',
      desc: '你是一颗刚发芽的番茄。倾斜手机左右摇摆，让植株接触到左侧的水滴和右侧的阳光，努力长得又红又大。生长不足会被淘汰，扔进垃圾桶。',
      loseDesc: '生长未达标，被当作次品丢弃。'
    },
    {
      title: '第二章 · 运输',
      desc: '番茄被装车运往市场。车厢颠簸，你需要用重力感应保持番茄平衡，避免磕碰。表皮一旦损伤，就只能被扔掉。',
      loseDesc: '运输中磕碰受损，无法售卖，被丢弃。'
    },
    {
      title: '第三章 · 冰箱',
      desc: '番茄被买回家，放进冰箱。冰箱对你来说像一座迷宫。倾斜手机让番茄滚动，找到真正的出口，才能被做成菜肴端上桌；否则会遗忘在角落，腐烂。',
      loseDesc: '没能走出冰箱，被遗忘在角落，最终腐烂。'
    }
  ];

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('active', key === name);
    });
  }

  function showChapterIntro() {
    var ch = chapters[currentChapter - 1];
    chapterTitle.textContent = ch.title;
    chapterDesc.textContent = ch.desc;
    showScreen('chapterIntro');
  }

  function startGame() {
    showScreen('game');
    if (window.TomatoJourney && window.TomatoJourney.startChapter) {
      window.TomatoJourney.startChapter(currentChapter);
    }
  }

  function onChapterWin() {
    winTitle.textContent = currentChapter === 3 ? '🎉 端上餐桌！' : '🎉 过关！';
    winDesc.textContent = currentChapter === 3
      ? '这颗番茄终于被做成菜肴，被珍惜地端上餐桌。感谢你体会了食物从田间到餐桌的旅程。'
      : '你成功度过了这一关，继续下一段旅程吧。';
    btnNextChapter.style.display = currentChapter >= totalChapters ? 'none' : 'inline-block';
    btnFinalDone.style.display = currentChapter >= totalChapters ? 'inline-block' : 'none';
    showScreen('win');
  }

  function onChapterLose() {
    failedCount++;
    loseDesc.textContent = chapters[currentChapter - 1].loseDesc;
    trashTomatoes.innerHTML = '';
    for (var i = 0; i < failedCount; i++) {
      var el = document.createElement('div');
      el.className = 'trash-tomato';
      trashTomatoes.appendChild(el);
    }
    showScreen('lose');
  }

  function goNextChapter() {
    currentChapter++;
    if (currentChapter <= totalChapters) {
      showChapterIntro();
    }
  }

  function retry() {
    showScreen('game');
    if (window.TomatoJourney && window.TomatoJourney.startChapter) {
      window.TomatoJourney.startChapter(currentChapter);
    }
  }

  btnStart.addEventListener('click', function () {
    if (!window.Gravity || !window.Gravity.isSupported()) {
      alert('您的设备或浏览器不支持重力感应，请使用手机并允许「运动与方向」权限。');
      return;
    }
    window.Gravity.requestPermission(function (ok) {
      if (!ok) {
        alert('需要允许使用设备方向/运动传感器才能游玩，请在设置中开启后刷新页面。');
        return;
      }
      currentChapter = 1;
      failedCount = 0;
      showChapterIntro();
    });
  });

  btnPlayChapter.addEventListener('click', startGame);
  btnNextChapter.addEventListener('click', goNextChapter);
  btnFinalDone.addEventListener('click', function () {
    currentChapter = 1;
    failedCount = 0;
    showScreen('intro');
  });
  btnRetry.addEventListener('click', retry);

  function startChapter(num) {
    if (window.TomatoJourney.chapter1) window.TomatoJourney.chapter1.stop();
    if (window.TomatoJourney.chapter2) window.TomatoJourney.chapter2.stop();
    if (window.TomatoJourney.chapter3) window.TomatoJourney.chapter3.stop();
    if (num === 1 && window.TomatoJourney.chapter1) window.TomatoJourney.chapter1.start();
    else if (num === 2 && window.TomatoJourney.chapter2) window.TomatoJourney.chapter2.start();
    else if (num === 3 && window.TomatoJourney.chapter3) window.TomatoJourney.chapter3.start();
  }

  window.TomatoJourney = window.TomatoJourney || {};
  window.TomatoJourney.showScreen = showScreen;
  window.TomatoJourney.onChapterWin = onChapterWin;
  window.TomatoJourney.onChapterLose = onChapterLose;
  window.TomatoJourney.startChapter = startChapter;
})();
