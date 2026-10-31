(() => {
  "use strict";

  const WORLD = { width: 1000, height: 600 };
  const ARENA = { x: 34, y: 34, width: 932, height: 532 };
  const PLAYER_RADIUS = 11;
  const PLAYER_SPEED = 202;
  const LOOP_DURATION = 16;
  const SAMPLE_INTERVAL = 1 / 32;
  const SYNC_DURATION = 1.15;

  const TAU = Math.PI * 2;
  const COLORS = {
    cyan: "#62f0df",
    cyanSoft: "#b1fff4",
    blue: "#78a9ff",
    blueSoft: "#c5d8ff",
    coral: "#ff8e79",
    danger: "#ff646d",
    gold: "#ffe4a3",
    white: "#f7fffc",
  };

  const LEVELS = [
    {
      code: "01",
      title: "双生练习",
      brief: "让 α、β 两个节点同时共振。",
      clearLine: "你和过去的自己完成了第一次握手。",
      spawn: { x: 120, y: 470 },
      nodes: [
        { id: "alpha", label: "α", x: 806, y: 134 },
        { id: "beta", label: "β", x: 724, y: 462 },
      ],
      walls: [
        { x: 272, y: 300, width: 470, height: 24 },
        { x: 272, y: 126, width: 24, height: 176 },
      ],
      hazards: [],
      decoration: "first",
    },
    {
      code: "02",
      title: "三方通话",
      brief: "三个节点，三条时间线。",
      clearLine: "三条时间线找到了同一个节拍。",
      spawn: { x: 110, y: 486 },
      nodes: [
        { id: "alpha", label: "α", x: 836, y: 104 },
        { id: "beta", label: "β", x: 844, y: 470 },
        { id: "gamma", label: "γ", x: 166, y: 108 },
      ],
      walls: [
        { x: 300, y: 254, width: 24, height: 276 },
        { x: 510, y: 284, width: 340, height: 22 },
        { x: 652, y: 88, width: 22, height: 144 },
      ],
      hazards: [],
      decoration: "fork",
    },
    {
      code: "03",
      title: "四方回声",
      brief: "记忆开始分岔。让四个节点同步。",
      clearLine: "四条回路重叠，空间短暂地折成了一张纸。",
      spawn: { x: 500, y: 518 },
      nodes: [
        { id: "alpha", label: "α", x: 134, y: 104 },
        { id: "beta", label: "β", x: 856, y: 104 },
        { id: "gamma", label: "γ", x: 130, y: 470 },
        { id: "delta", label: "δ", x: 856, y: 470 },
      ],
      walls: [
        { x: 280, y: 82, width: 24, height: 218 },
        { x: 700, y: 82, width: 24, height: 218 },
        { x: 120, y: 300, width: 274, height: 22 },
        { x: 606, y: 300, width: 274, height: 22 },
        { x: 430, y: 232, width: 140, height: 118 },
      ],
      hazards: [],
      decoration: "cross",
    },
    {
      code: "04",
      title: "扫描盲区",
      brief: "避开记忆扫描。回声可以穿过它。",
      clearLine: "扫描只抹去了现在，而过去已经记住了安全的路线。",
      spawn: { x: 500, y: 518 },
      nodes: [
        { id: "alpha", label: "α", x: 128, y: 112 },
        { id: "beta", label: "β", x: 870, y: 112 },
        { id: "gamma", label: "γ", x: 128, y: 486 },
        { id: "delta", label: "δ", x: 870, y: 486 },
      ],
      walls: [
        { x: 350, y: 202, width: 300, height: 20 },
        { x: 350, y: 378, width: 300, height: 20 },
        { x: 350, y: 202, width: 20, height: 196 },
        { x: 630, y: 202, width: 20, height: 196 },
        { x: 214, y: 96, width: 20, height: 154 },
        { x: 766, y: 96, width: 20, height: 154 },
      ],
      hazards: [
        { cx: 500, cy: 300, length: 330, speed: 0.72, phase: 0.2, width: 7 },
        { cx: 500, cy: 300, length: 270, speed: -0.51, phase: 1.5, width: 6 },
      ],
      decoration: "scan",
    },
    {
      code: "05",
      title: "最后一拍",
      brief: "五层回响。让整座记忆场同时歌唱。",
      clearLine: "所有声音同时到来。原来出口一直藏在回声之间。",
      spawn: { x: 500, y: 506 },
      nodes: [
        { id: "alpha", label: "α", x: 500, y: 84 },
        { id: "beta", label: "β", x: 872, y: 234 },
        { id: "gamma", label: "γ", x: 764, y: 506 },
        { id: "delta", label: "δ", x: 236, y: 506 },
        { id: "epsilon", label: "ε", x: 128, y: 234 },
      ],
      walls: [
        { x: 356, y: 210, width: 288, height: 20 },
        { x: 356, y: 370, width: 288, height: 20 },
        { x: 356, y: 230, width: 20, height: 140 },
        { x: 624, y: 230, width: 20, height: 140 },
        { x: 406, y: 280, width: 46, height: 40 },
        { x: 548, y: 280, width: 46, height: 40 },
      ],
      hazards: [
        { cx: 500, cy: 300, length: 290, speed: 0.58, phase: 1.1, width: 6 },
      ],
      decoration: "final",
    },
  ];

  const dom = {
    stage: document.querySelector("#stage"),
    canvas: document.querySelector("#gameCanvas"),
    hud: document.querySelector("#hud"),
    soundBtn: document.querySelector("#soundBtn"),
    soundIcon: document.querySelector("#soundIcon"),
    soundLabel: document.querySelector("#soundLabel"),
    chamberNumber: document.querySelector("#chamberNumber"),
    levelTitle: document.querySelector("#levelTitle"),
    levelBrief: document.querySelector("#levelBrief"),
    nodeReadout: document.querySelector("#nodeReadout"),
    loopTime: document.querySelector("#loopTime"),
    timeFill: document.querySelector("#timeFill"),
    loopCount: document.querySelector("#loopCount"),
    recordingState: document.querySelector("#recordingState"),
    echoCount: document.querySelector("#echoCount"),
    echoSlots: document.querySelector("#echoSlots"),
    worldToast: document.querySelector("#worldToast"),
    toastIcon: document.querySelector("#toastIcon"),
    toastText: document.querySelector("#toastText"),
    syncBadge: document.querySelector("#syncBadge"),
    syncPercent: document.querySelector("#syncPercent"),
    syncFill: document.querySelector("#syncFill"),
    startScreen: document.querySelector("#startScreen"),
    startBtn: document.querySelector("#startBtn"),
    interlude: document.querySelector("#interlude"),
    clearTitle: document.querySelector("#clearTitle"),
    clearLine: document.querySelector("#clearLine"),
    resultEchoes: document.querySelector("#resultEchoes"),
    resultTime: document.querySelector("#resultTime"),
    resultResets: document.querySelector("#resultResets"),
    nextBtn: document.querySelector("#nextBtn"),
    ending: document.querySelector("#ending"),
    totalTime: document.querySelector("#totalTime"),
    totalEchoes: document.querySelector("#totalEchoes"),
    totalResets: document.querySelector("#totalResets"),
    restartBtn: document.querySelector("#restartBtn"),
    pauseScreen: document.querySelector("#pauseScreen"),
    resumeBtn: document.querySelector("#resumeBtn"),
    liveStatus: document.querySelector("#liveStatus"),
    touchControls: document.querySelector("#touchControls"),
    touchCollapse: document.querySelector("#touchCollapse"),
    touchReset: document.querySelector("#touchReset"),
  };

  const ctx = dom.canvas.getContext("2d");
  const keys = new Set();
  const touchDirections = new Set();
  const stars = createStars(84);
  const ambientDust = createDust(36);
  let viewport = { width: 1, height: 1, dpr: 1, scale: 1, ox: 0, oy: 0 };
  let lastFrame = performance.now();
  let toastTimeout = 0;
  let transitionTimeout = 0;
  let game = null;
  let mode = "menu";
  let soundEnabled = true;
  let session = createSession();

  class Soundscape {
    constructor() {
      this.context = null;
      this.master = null;
    }

    init() {
      if (this.context) {
        if (this.context.state === "suspended") this.context.resume();
        return;
      }
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0.72;
      this.master.connect(this.context.destination);
    }

    tone(frequency, duration, options = {}) {
      if (!soundEnabled) return;
      this.init();
      if (!this.context) return;
      const now = this.context.currentTime + (options.delay || 0);
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = options.type || "sine";
      oscillator.frequency.setValueAtTime(Math.max(30, frequency), now);
      if (options.endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(30, options.endFrequency),
          now + duration
        );
      }
      const volume = options.volume ?? 0.035;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.04);
    }

    node(index = 0) {
      const notes = [392, 493.88, 587.33, 698.46, 783.99];
      this.tone(notes[index % notes.length], 0.34, { volume: 0.025, type: "sine" });
      this.tone(notes[index % notes.length] * 2, 0.2, {
        volume: 0.012,
        type: "triangle",
        delay: 0.025,
      });
    }

    collapse() {
      this.tone(680, 0.48, {
        endFrequency: 130,
        volume: 0.03,
        type: "sine",
      });
      this.tone(1160, 0.28, {
        endFrequency: 420,
        volume: 0.013,
        type: "triangle",
        delay: 0.04,
      });
    }

    hazard() {
      this.tone(150, 0.4, {
        endFrequency: 70,
        volume: 0.04,
        type: "sawtooth",
      });
    }

    sync() {
      [261.63, 329.63, 392, 523.25].forEach((note, index) => {
        this.tone(note, 0.9, {
          volume: 0.018,
          type: "sine",
          delay: index * 0.075,
        });
      });
    }

    complete() {
      [392, 493.88, 587.33, 783.99, 987.77].forEach((note, index) => {
        this.tone(note, 1.15, {
          volume: 0.021,
          type: "sine",
          delay: index * 0.1,
        });
        this.tone(note * 0.5, 0.8, {
          volume: 0.008,
          type: "triangle",
          delay: index * 0.1,
        });
      });
    }
  }

  const audio = new Soundscape();

  function createSession() {
    return {
      startedAt: 0,
      totalEchoes: 0,
      totalResets: 0,
    };
  }

  function createGame(levelIndex) {
    const level = LEVELS[levelIndex];
    return {
      levelIndex,
      level,
      mode: "playing",
      loopTime: 0,
      loopNumber: 1,
      loopLimit: level.nodes.length,
      recordings: [],
      currentFrames: [],
      lastSample: 0,
      player: {
        x: level.spawn.x,
        y: level.spawn.y,
        radius: PLAYER_RADIUS,
        facing: -Math.PI / 2,
        trail: [],
        trailClock: 0,
      },
      echoPositions: [],
      activeNodes: new Set(),
      previousActiveNodes: new Set(),
      sync: 0,
      particles: [],
      ripples: [],
      flash: 0,
      levelStartedAt: performance.now(),
      tutorialShown: false,
      completionStarted: false,
      lastEchoCount: 0,
    };
  }

  function createStars(count) {
    const random = mulberry32(771921);
    return Array.from({ length: count }, () => ({
      x: random() * WORLD.width,
      y: random() * WORLD.height,
      radius: 0.35 + random() * 1.15,
      alpha: 0.08 + random() * 0.34,
      speed: 0.25 + random() * 1.1,
      phase: random() * TAU,
    }));
  }

  function createDust(count) {
    const random = mulberry32(84317);
    return Array.from({ length: count }, () => ({
      x: random() * WORLD.width,
      y: random() * WORLD.height,
      vx: -7 + random() * 14,
      vy: -9 + random() * 18,
      size: 0.4 + random() * 1.3,
      alpha: 0.05 + random() * 0.18,
    }));
  }

  function mulberry32(seed) {
    return function random() {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function formatTime(seconds) {
    const safe = Math.max(0, seconds);
    const minutes = Math.floor(safe / 60);
    const remainder = safe - minutes * 60;
    return `${String(minutes).padStart(2, "0")}:${remainder.toFixed(1).padStart(4, "0")}`;
  }

  function distanceSquared(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function chooseLevelNarrative(index) {
    return LEVELS[index]?.clearLine || "所有时间线在同一个瞬间重合。";
  }

  function announce(text) {
    dom.liveStatus.textContent = "";
    requestAnimationFrame(() => {
      dom.liveStatus.textContent = text;
    });
  }

  function showToast(text, options = {}) {
    clearTimeout(toastTimeout);
    dom.toastText.textContent = text;
    dom.toastIcon.textContent = options.icon || "⌁";
    dom.worldToast.classList.toggle("danger", Boolean(options.danger));
    dom.worldToast.hidden = false;
    toastTimeout = window.setTimeout(() => {
      dom.worldToast.hidden = true;
    }, options.duration || 3800);
  }

  function hideToast() {
    clearTimeout(toastTimeout);
    dom.worldToast.hidden = true;
  }

  function updateNodeReadout(level, activeNodes) {
    dom.nodeReadout.innerHTML = level.nodes
      .map(
        (node) => `
          <span class="node-indicator${activeNodes.has(node.id) ? " active" : ""}">
            <i></i><span>${node.label} 节点</span>
          </span>
        `
      )
      .join("");
  }

  function updateEchoSlots() {
    if (!game) return;
    const totalSlots = Math.max(1, game.loopLimit - 1);
    const filled = game.recordings.length;
    dom.echoCount.textContent = `${filled} / ${totalSlots}`;
    dom.echoSlots.innerHTML = Array.from({ length: totalSlots }, (_, index) => {
      const isFilled = index < filled;
      return `<span class="echo-slot${isFilled ? " filled" : ""}">${String(index + 1).padStart(
        2,
        "0"
      )}</span>`;
    }).join("");
  }

  function configureLevel(levelIndex) {
    hideToast();
    game = createGame(levelIndex);
    mode = "playing";
    dom.startScreen.hidden = true;
    dom.interlude.hidden = true;
    dom.ending.hidden = true;
    dom.pauseScreen.hidden = true;
    dom.hud.hidden = false;
    dom.touchControls.classList.remove("suspended");
    dom.chamberNumber.textContent = game.level.code;
    dom.levelTitle.textContent = game.level.title;
    dom.levelBrief.textContent = game.level.brief;
    dom.loopCount.textContent = `循环 01 / ${String(game.loopLimit).padStart(2, "0")}`;
    dom.timeFill.style.transform = "scaleX(1)";
    dom.loopTime.textContent = LOOP_DURATION.toFixed(1);
    updateNodeReadout(game.level, game.activeNodes);
    updateEchoSlots();
    resetCurrentLoop(false);
    announce(`第 ${levelIndex + 1} 档案，${game.level.title}。${game.level.brief}`);
    showToast(game.level.brief, { icon: "◇", duration: 4100 });
  }

  function resetCurrentLoop(record = true) {
    if (!game) return;
    if (record) {
      finalizeRecording();
      if (game.recordings.length >= game.loopLimit) {
        overloadTimeline();
        return;
      }
    }

    const spawn = game.level.spawn;
    game.player.x = spawn.x;
    game.player.y = spawn.y;
    game.player.facing = -Math.PI / 2;
    game.player.trail = [];
    game.player.trailClock = 0;
    game.loopTime = 0;
    game.loopNumber = game.recordings.length + 1;
    game.currentFrames = [{ x: spawn.x, y: spawn.y, t: 0 }];
    game.lastSample = 0;
    game.sync = 0;
    game.activeNodes.clear();
    game.previousActiveNodes.clear();
    game.flash = 0;
    game.completionStarted = false;

    dom.loopTime.textContent = LOOP_DURATION.toFixed(1);
    dom.timeFill.style.transform = "scaleX(1)";
    dom.loopCount.textContent = `循环 ${String(game.loopNumber).padStart(2, "0")} / ${String(
      game.loopLimit
    ).padStart(2, "0")}`;
    updateEchoSlots();
  }

  function finalizeRecording() {
    const duration = Math.max(game.loopTime, 0);
    const finalFrame = {
      x: game.player.x,
      y: game.player.y,
      t: duration,
    };
    const frames = game.currentFrames.slice();
    const previous = frames[frames.length - 1];
    if (!previous || duration - previous.t > 0.001) {
      frames.push(finalFrame);
    } else if (frames.length) {
      frames[frames.length - 1] = finalFrame;
    }
    game.recordings.push({
      frames,
      duration,
      colorIndex: game.recordings.length,
    });
    game.lastEchoCount = game.recordings.length;
    updateEchoSlots();
  }

  function collapseTimeline() {
    if (!game || mode !== "playing" || game.completionStarted) return;
    if (game.loopTime < 0.18) {
      showToast("至少留下 0.2 秒的行动轨迹。", { icon: "!" });
      return;
    }
    finalizeRecording();
    if (game.recordings.length >= game.loopLimit) {
      overloadTimeline();
      return;
    }
    spawnCollapseEffect();
    audio.collapse();
    game.loopTime = 0;
    game.player.x = game.level.spawn.x;
    game.player.y = game.level.spawn.y;
    game.player.facing = -Math.PI / 2;
    game.player.trail = [];
    game.player.trailClock = 0;
    game.loopNumber = game.recordings.length + 1;
    game.currentFrames = [{ x: game.level.spawn.x, y: game.level.spawn.y, t: 0 }];
    game.lastSample = 0;
    game.sync = 0;
    game.activeNodes.clear();
    game.previousActiveNodes.clear();
    game.completionStarted = false;
    dom.loopCount.textContent = `循环 ${String(game.loopNumber).padStart(2, "0")} / ${String(
      game.loopLimit
    ).padStart(2, "0")}`;
    updateEchoSlots();
    showToast(
      game.loopNumber === 2
        ? "回声已生成。它会重复上一次的路线。"
        : `第 ${game.loopNumber - 1} 层回响已刻录。`,
      { icon: "↶", duration: 2500 }
    );
  }

  function spawnCollapseEffect() {
    game.player.trail.forEach((point, index) => {
      game.particles.push({
        x: point.x,
        y: point.y,
        vx: (index % 2 ? 1 : -1) * (12 + (index % 5) * 7),
        vy: -18 + (index % 4) * 9,
        life: 0.45 + (index % 6) * 0.04,
        maxLife: 0.7,
        size: 1 + (index % 3) * 0.5,
        color: COLORS.cyan,
      });
    });
    for (let index = 0; index < 24; index += 1) {
      const angle = (index / 24) * TAU;
      const speed = 45 + (index % 5) * 11;
      game.particles.push({
        x: game.player.x,
        y: game.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.42 + (index % 3) * 0.1,
        maxLife: 0.72,
        size: 0.8 + (index % 3) * 0.55,
        color: index % 3 === 0 ? COLORS.blue : COLORS.cyan,
      });
    }
    game.ripples.push({
      x: game.player.x,
      y: game.player.y,
      radius: 12,
      maxRadius: 148,
      life: 0.8,
      maxLife: 0.8,
      color: COLORS.cyan,
    });
    game.flash = 0.72;
  }

  function spawnNodeEffect(node, index) {
    for (let particleIndex = 0; particleIndex < 14; particleIndex += 1) {
      const angle = (particleIndex / 14) * TAU + Math.random() * 0.3;
      const speed = 26 + Math.random() * 54;
      game.particles.push({
        x: node.x,
        y: node.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.45 + Math.random() * 0.45,
        maxLife: 0.9,
        size: 0.7 + Math.random() * 1.4,
        color: index % 2 ? COLORS.blueSoft : COLORS.cyanSoft,
      });
    }
    game.ripples.push({
      x: node.x,
      y: node.y,
      radius: 20,
      maxRadius: 74,
      life: 0.65,
      maxLife: 0.65,
      color: index % 2 ? COLORS.blue : COLORS.cyan,
    });
  }

  function overloadTimeline() {
    if (!game || mode !== "playing") return;
    mode = "overload";
    audio.hazard();
    game.flash = 1;
    showToast("回响层已满，闭环仍未建立。档案正在重新载入……", {
      icon: "×",
      danger: true,
      duration: 2200,
    });
    announce("回响层已满，档案重置。");
    session.totalResets += 1;
    const levelIndex = game.levelIndex;
    window.clearTimeout(transitionTimeout);
    transitionTimeout = window.setTimeout(() => {
      if (mode === "overload") configureLevel(levelIndex);
    }, 1150);
  }

  function restartLevel(manual = true) {
    if (!game || (mode !== "playing" && mode !== "paused")) return;
    if (manual) session.totalResets += 1;
    const levelIndex = game.levelIndex;
    mode = "playing";
    configureLevel(levelIndex);
    if (manual) showToast("档案已重置。回声记录已清空。", { icon: "↺" });
  }

  function beginGame() {
    window.clearTimeout(transitionTimeout);
    audio.init();
    session = createSession();
    session.startedAt = performance.now();
    configureLevel(0);
  }

  function completeLevel() {
    if (!game || game.completionStarted) return;
    game.completionStarted = true;
    mode = "transition";
    audio.complete();
    game.flash = 0.45;
    game.level.nodes.forEach((node, index) => {
      spawnNodeEffect(node, index);
    });

    const elapsed = (performance.now() - game.levelStartedAt) / 1000;
    session.totalEchoes += game.recordings.length;
    dom.clearTitle.textContent =
      game.levelIndex === LEVELS.length - 1 ? "全频共振" : "闭环建立";
    dom.clearLine.textContent = chooseLevelNarrative(game.levelIndex);
    dom.resultEchoes.textContent = String(game.recordings.length);
    dom.resultTime.textContent = `${elapsed.toFixed(1)}s`;
    dom.resultResets.textContent = String(session.totalResets);
    dom.nextBtn.querySelector("span").textContent =
      game.levelIndex === LEVELS.length - 1 ? "查看最终回声" : "进入下一档案";
    announce(`闭环建立。使用 ${game.recordings.length} 层回响。`);

    window.clearTimeout(transitionTimeout);
    transitionTimeout = window.setTimeout(() => {
      if (mode !== "transition") return;
      mode = "interlude";
      dom.interlude.hidden = false;
      dom.touchControls.classList.add("suspended");
      dom.nextBtn.focus();
    }, 980);
  }

  function advanceLevel() {
    if (!game || mode !== "interlude") return;
    if (game.levelIndex >= LEVELS.length - 1) {
      showEnding();
      return;
    }
    configureLevel(game.levelIndex + 1);
  }

  function showEnding() {
    mode = "ending";
    dom.interlude.hidden = true;
    dom.ending.hidden = false;
    dom.hud.hidden = true;
    dom.touchControls.classList.add("suspended");
    const elapsed = (performance.now() - session.startedAt) / 1000;
    dom.totalTime.textContent = formatTime(elapsed);
    dom.totalEchoes.textContent = String(session.totalEchoes);
    dom.totalResets.textContent = String(session.totalResets);
    audio.complete();
    announce("全部档案接通。你就是最后一层回响。");
    dom.restartBtn.focus();
  }

  function togglePause(force) {
    if (!game) return;
    const shouldPause = typeof force === "boolean" ? force : mode === "playing";
    if (shouldPause && mode === "playing") {
      mode = "paused";
      dom.pauseScreen.hidden = false;
      dom.touchControls.classList.add("suspended");
      dom.resumeBtn.focus();
      keys.clear();
      touchDirections.clear();
      announce("游戏已暂停。");
    } else if (!shouldPause && mode === "paused") {
      mode = "playing";
      dom.pauseScreen.hidden = true;
      dom.touchControls.classList.remove("suspended");
      lastFrame = performance.now();
      announce("游戏继续。");
    }
  }

  function updateSoundButton() {
    dom.soundLabel.textContent = soundEnabled ? "声音 开" : "声音 关";
    dom.soundIcon.textContent = soundEnabled ? "◖" : "×";
    dom.soundBtn.setAttribute("aria-label", soundEnabled ? "关闭声音" : "开启声音");
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundButton();
    if (soundEnabled) {
      audio.init();
      audio.tone(523.25, 0.18, { volume: 0.016, type: "sine" });
    }
  }

  function sampleRecording(recording, time) {
    const frames = recording.frames;
    if (!frames.length) return { x: game.level.spawn.x, y: game.level.spawn.y };
    if (time <= frames[0].t) return { x: frames[0].x, y: frames[0].y };
    if (time >= recording.duration || time >= frames[frames.length - 1].t) {
      const last = frames[frames.length - 1];
      return { x: last.x, y: last.y };
    }

    let low = 0;
    let high = frames.length - 1;
    while (low + 1 < high) {
      const middle = (low + high) >> 1;
      if (frames[middle].t <= time) low = middle;
      else high = middle;
    }
    const a = frames[low];
    const b = frames[high];
    const span = Math.max(0.0001, b.t - a.t);
    const ratio = clamp((time - a.t) / span, 0, 1);
    return {
      x: a.x + (b.x - a.x) * ratio,
      y: a.y + (b.y - a.y) * ratio,
    };
  }

  function readMovementInput() {
    const left =
      keys.has("arrowleft") || keys.has("a") || touchDirections.has("left") ? 1 : 0;
    const right =
      keys.has("arrowright") || keys.has("d") || touchDirections.has("right") ? 1 : 0;
    const up = keys.has("arrowup") || keys.has("w") || touchDirections.has("up") ? 1 : 0;
    const down =
      keys.has("arrowdown") || keys.has("s") || touchDirections.has("down") ? 1 : 0;
    let x = right - left;
    let y = down - up;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    return { x, y };
  }

  function circleIntersectsRect(x, y, radius, rect) {
    const nearestX = clamp(x, rect.x, rect.x + rect.width);
    const nearestY = clamp(y, rect.y, rect.y + rect.height);
    const dx = x - nearestX;
    const dy = y - nearestY;
    return dx * dx + dy * dy < radius * radius;
  }

  function movePlayer(dx, dy) {
    const player = game.player;
    const walls = game.level.walls;
    const radius = player.radius;

    if (dx !== 0) {
      player.x += dx;
      for (const wall of walls) {
        if (circleIntersectsRect(player.x, player.y, radius, wall)) {
          if (dx > 0) player.x = wall.x - radius - 0.01;
          else player.x = wall.x + wall.width + radius + 0.01;
        }
      }
      player.x = clamp(
        player.x,
        ARENA.x + radius,
        ARENA.x + ARENA.width - radius
      );
    }

    if (dy !== 0) {
      player.y += dy;
      for (const wall of walls) {
        if (circleIntersectsRect(player.x, player.y, radius, wall)) {
          if (dy > 0) player.y = wall.y - radius - 0.01;
          else player.y = wall.y + wall.height + radius + 0.01;
        }
      }
      player.y = clamp(
        player.y,
        ARENA.y + radius,
        ARENA.y + ARENA.height - radius
      );
    }
  }

  function pointToSegmentDistanceSquared(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;
    const projection = apx * abx + apy * aby;
    const lengthSquared = abx * abx + aby * aby;
    const t = lengthSquared > 0 ? clamp(projection / lengthSquared, 0, 1) : 0;
    const closestX = ax + abx * t;
    const closestY = ay + aby * t;
    const dx = px - closestX;
    const dy = py - closestY;
    return dx * dx + dy * dy;
  }

  function getHazardGeometry(hazard, time) {
    const angle = hazard.phase + time * hazard.speed;
    const half = hazard.length * 0.5;
    return {
      ax: hazard.cx - Math.cos(angle) * half,
      ay: hazard.cy - Math.sin(angle) * half,
      bx: hazard.cx + Math.cos(angle) * half,
      by: hazard.cy + Math.sin(angle) * half,
      angle,
    };
  }

  function playerHitsHazard() {
    for (const hazard of game.level.hazards) {
      const geometry = getHazardGeometry(hazard, game.loopTime);
      const limit = PLAYER_RADIUS + hazard.width * 0.5 + 2.5;
      if (
        pointToSegmentDistanceSquared(
          game.player.x,
          game.player.y,
          geometry.ax,
          geometry.ay,
          geometry.bx,
          geometry.by
        ) <
        limit * limit
      ) {
        return true;
      }
    }
    return false;
  }

  function rewindFromHazard() {
    if (!game || mode !== "playing") return;
    game.flash = 0.9;
    audio.hazard();
    game.ripples.push({
      x: game.player.x,
      y: game.player.y,
      radius: 6,
      maxRadius: 94,
      life: 0.55,
      maxLife: 0.55,
      color: COLORS.danger,
    });
    for (let index = 0; index < 18; index += 1) {
      const angle = Math.random() * TAU;
      const speed = 20 + Math.random() * 58;
      game.particles.push({
        x: game.player.x,
        y: game.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.35,
        maxLife: 0.6,
        size: 0.7 + Math.random(),
        color: COLORS.danger,
      });
    }

    game.loopTime = 0;
    game.player.x = game.level.spawn.x;
    game.player.y = game.level.spawn.y;
    game.player.trail = [];
    game.player.trailClock = 0;
    game.currentFrames = [{ x: game.player.x, y: game.player.y, t: 0 }];
    game.lastSample = 0;
    game.sync = 0;
    game.activeNodes.clear();
    game.previousActiveNodes.clear();
    showToast("扫描命中。当前时间线已回卷，已有回声保持完整。", {
      icon: "×",
      danger: true,
      duration: 2800,
    });
    announce("扫描命中，当前尝试已回卷。");
  }

  function updateTrail(dt) {
    const player = game.player;
    player.trailClock += dt;
    if (player.trailClock > 0.028) {
      player.trailClock = 0;
      player.trail.push({ x: player.x, y: player.y, life: 0.34 });
      if (player.trail.length > 16) player.trail.shift();
    }
    player.trail.forEach((point) => {
      point.life -= dt;
    });
    player.trail = player.trail.filter((point) => point.life > 0);
  }

  function updateParticles(dt) {
    game.particles.forEach((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= Math.pow(0.14, dt);
      particle.vy *= Math.pow(0.14, dt);
    });
    game.particles = game.particles.filter((particle) => particle.life > 0);

    game.ripples.forEach((ripple) => {
      ripple.life -= dt;
      const progress = 1 - ripple.life / ripple.maxLife;
      ripple.radius = ripple.radius + (ripple.maxRadius - ripple.radius) * progress * dt * 2.4;
    });
    game.ripples = game.ripples.filter((ripple) => ripple.life > 0);
    game.flash = Math.max(0, game.flash - dt * 1.8);
  }

  function updateGame(dt) {
    if (!game || mode !== "playing" || game.completionStarted) return;

    game.loopTime += dt;
    if (game.loopTime >= LOOP_DURATION) {
      game.loopTime = LOOP_DURATION;
      collapseTimeline();
      if (!game || mode !== "playing") return;
    }

    const movement = readMovementInput();
    if (movement.x !== 0 || movement.y !== 0) {
      const dx = movement.x * PLAYER_SPEED * dt;
      const dy = movement.y * PLAYER_SPEED * dt;
      movePlayer(dx, dy);
      game.player.facing = Math.atan2(movement.y, movement.x);
    }

    updateTrail(dt);

    if (game.level.hazards.length && playerHitsHazard()) {
      rewindFromHazard();
      return;
    }

    if (game.loopTime - game.lastSample >= SAMPLE_INTERVAL) {
      const frameTime = game.loopTime;
      game.currentFrames.push({
        x: game.player.x,
        y: game.player.y,
        t: frameTime,
      });
      game.lastSample = frameTime;
    }

    game.echoPositions = game.recordings.map((recording) =>
      sampleRecording(recording, game.loopTime)
    );

    const occupants = [
      { x: game.player.x, y: game.player.y, radius: game.player.radius, kind: "player" },
      ...game.echoPositions.map((position, index) => ({
        x: position.x,
        y: position.y,
        radius: PLAYER_RADIUS,
        kind: "echo",
        index,
      })),
    ];

    game.previousActiveNodes = new Set(game.activeNodes);
    game.activeNodes.clear();
    game.level.nodes.forEach((node) => {
      const occupied = occupants.some((occupant) => {
        const radius = node.radius || 28;
        const reach = radius + occupant.radius * 0.4;
        return distanceSquared(occupant, node) <= reach * reach;
      });
      if (occupied) game.activeNodes.add(node.id);
    });

    game.level.nodes.forEach((node, index) => {
      if (game.activeNodes.has(node.id) && !game.previousActiveNodes.has(node.id)) {
        spawnNodeEffect(node, index);
        audio.node(index);
        if (game.loopNumber === 1 && !game.tutorialShown) {
          game.tutorialShown = true;
          showToast("节点已点亮。按空格坍缩现在，让这一步变成回声。", {
            icon: "↶",
            duration: 4700,
          });
        }
      }
    });

    const allActive = game.activeNodes.size === game.level.nodes.length;
    if (allActive) {
      if (game.sync === 0) audio.sync();
      game.sync += dt;
      if (game.sync >= SYNC_DURATION) {
        completeLevel();
        return;
      }
    } else {
      game.sync = Math.max(0, game.sync - dt * 1.75);
    }

    updateHUD(dt, allActive);
  }

  function updateHUD(dt, allActive) {
    const remaining = Math.max(0, LOOP_DURATION - game.loopTime);
    dom.loopTime.textContent = remaining.toFixed(1);
    dom.timeFill.style.transform = `scaleX(${clamp(remaining / LOOP_DURATION, 0, 1)})`;
    dom.loopCount.textContent = `循环 ${String(game.loopNumber).padStart(2, "0")} / ${String(
      game.loopLimit
    ).padStart(2, "0")}`;

    dom.nodeReadout.querySelectorAll(".node-indicator").forEach((element, index) => {
      const node = game.level.nodes[index];
      element.classList.toggle("active", game.activeNodes.has(node.id));
    });

    const syncProgress = clamp(game.sync / SYNC_DURATION, 0, 1);
    if (allActive || game.sync > 0.01) {
      dom.syncBadge.hidden = false;
      dom.syncPercent.textContent = `${Math.round(syncProgress * 100)}%`;
      dom.syncFill.style.transform = `scaleX(${syncProgress})`;
    } else {
      dom.syncBadge.hidden = true;
    }
  }

  function updateAmbient(dt, now) {
    ambientDust.forEach((dust, index) => {
      dust.x += dust.vx * dt;
      dust.y += dust.vy * dt;
      if (dust.x < -5) dust.x = WORLD.width + 5;
      if (dust.x > WORLD.width + 5) dust.x = -5;
      if (dust.y < -5) dust.y = WORLD.height + 5;
      if (dust.y > WORLD.height + 5) dust.y = -5;
      dust.alpha = 0.05 + ((Math.sin(now * 0.0003 + index) + 1) / 2) * 0.16;
    });
  }

  function roundedRectPath(context, x, y, width, height, radius) {
    const r = Math.min(radius, width * 0.5, height * 0.5);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function drawBackground(now) {
    const gradient = ctx.createRadialGradient(500, 300, 40, 500, 300, 590);
    gradient.addColorStop(0, "rgba(18, 46, 55, 0.19)");
    gradient.addColorStop(0.52, "rgba(6, 12, 19, 0.12)");
    gradient.addColorStop(1, "rgba(3, 7, 11, 0.4)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    stars.forEach((star) => {
      const pulse = 0.7 + Math.sin(now * 0.001 * star.speed + star.phase) * 0.3;
      ctx.globalAlpha = star.alpha * pulse;
      ctx.fillStyle = star.radius > 1 ? "#bdeeea" : "#79a8b6";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, TAU);
      ctx.fill();
    });
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(132, 192, 198, 0.035)";
    ctx.lineWidth = 1;
    for (let x = 50; x < WORLD.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x, WORLD.height - 30);
      ctx.stroke();
    }
    for (let y = 30; y < WORLD.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(WORLD.width - 30, y);
      ctx.stroke();
    }
    ctx.restore();

    ambientDust.forEach((dust) => {
      ctx.globalAlpha = dust.alpha;
      ctx.fillStyle = "#9ddad9";
      ctx.beginPath();
      ctx.arc(dust.x, dust.y, dust.size, 0, TAU);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawArena(now) {
    ctx.save();
    roundedRectPath(ctx, ARENA.x, ARENA.y, ARENA.width, ARENA.height, 18);
    ctx.fillStyle = "rgba(6, 13, 20, 0.34)";
    ctx.fill();
    ctx.strokeStyle = "rgba(141, 213, 214, 0.13)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = "rgba(98, 240, 223, 0.035)";
    ctx.setLineDash([3, 7]);
    roundedRectPath(ctx, ARENA.x + 8, ARENA.y + 8, ARENA.width - 16, ARENA.height - 16, 13);
    ctx.stroke();
    ctx.setLineDash([]);

    const pulse = 0.5 + Math.sin(now * 0.0012) * 0.5;
    ctx.globalAlpha = 0.08 + pulse * 0.04;
    ctx.strokeStyle = COLORS.cyan;
    ctx.beginPath();
    ctx.arc(WORLD.width / 2, WORLD.height / 2, 184 + Math.sin(now * 0.0006) * 5, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.04;
    ctx.beginPath();
    ctx.arc(WORLD.width / 2, WORLD.height / 2, 242, 0, TAU);
    ctx.stroke();

    ctx.globalAlpha = 0.13;
    ctx.fillStyle = "#759398";
    ctx.font = '7px "Cascadia Mono", "Consolas", monospace';
    ctx.letterSpacing = "1px";
    ctx.fillText("RESONANCE FIELD / 04", ARENA.x + 15, ARENA.y + 22);
    ctx.fillText("T−LOCAL", ARENA.x + ARENA.width - 70, ARENA.y + 22);
    ctx.restore();
  }

  function drawWalls() {
    if (!game) return;
    game.level.walls.forEach((wall) => {
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      roundedRectPath(ctx, wall.x, wall.y, wall.width, wall.height, 5);
      const gradient = ctx.createLinearGradient(
        wall.x,
        wall.y,
        wall.x + wall.width,
        wall.y + wall.height
      );
      gradient.addColorStop(0, "rgba(24, 41, 52, 0.98)");
      gradient.addColorStop(1, "rgba(11, 22, 31, 0.98)");
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(137, 206, 210, 0.19)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.strokeStyle = "rgba(98, 240, 223, 0.08)";
      ctx.beginPath();
      if (wall.width > wall.height) {
        ctx.moveTo(wall.x + 7, wall.y + 4);
        ctx.lineTo(wall.x + wall.width - 7, wall.y + 4);
      } else {
        ctx.moveTo(wall.x + 4, wall.y + 7);
        ctx.lineTo(wall.x + 4, wall.y + wall.height - 7);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawHazards(now) {
    if (!game) return;
    game.level.hazards.forEach((hazard) => {
      const geometry = getHazardGeometry(hazard, game.loopTime);
      ctx.save();
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(255, 84, 103, 0.5)";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = "rgba(255, 84, 103, 0.2)";
      ctx.lineWidth = hazard.width + 8;
      ctx.beginPath();
      ctx.moveTo(geometry.ax, geometry.ay);
      ctx.lineTo(geometry.bx, geometry.by);
      ctx.stroke();

      ctx.shadowBlur = 8;
      ctx.strokeStyle = "rgba(255, 118, 127, 0.72)";
      ctx.lineWidth = hazard.width;
      ctx.beginPath();
      ctx.moveTo(geometry.ax, geometry.ay);
      ctx.lineTo(geometry.bx, geometry.by);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255, 222, 217, 0.72)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(geometry.ax, geometry.ay);
      ctx.lineTo(geometry.bx, geometry.by);
      ctx.stroke();

      const endpointPulse = 6 + Math.sin(now * 0.007) * 1.5;
      [geometry.ax, geometry.bx].forEach(() => {});
      ctx.fillStyle = "rgba(255, 114, 123, 0.4)";
      ctx.beginPath();
      ctx.arc(hazard.cx, hazard.cy, endpointPulse, 0, TAU);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawDecorations(now) {
    if (!game) return;
    const centerX = WORLD.width / 2;
    const centerY = WORLD.height / 2;
    const time = game.loopTime;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.strokeStyle = "rgba(121, 177, 184, 0.07)";
    ctx.lineWidth = 1;
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, 80 + ring * 31, time * (0.07 + ring * 0.02), time * (0.07 + ring * 0.02) + Math.PI * 1.25);
      ctx.stroke();
    }
    ctx.rotate(time * 0.045);
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * TAU;
      const radius = 112;
      ctx.globalAlpha = 0.12 + Math.sin(now * 0.001 + index) * 0.04;
      ctx.fillStyle = index % 2 ? "#77a6ff" : "#8be4dd";
      ctx.fillRect(Math.cos(angle) * radius - 1, Math.sin(angle) * radius - 1, 2, 2);
    }
    ctx.restore();
  }

  function drawEchoTraces() {
    if (!game) return;
    game.recordings.forEach((recording, index) => {
      const color = index % 2 === 0 ? COLORS.blue : "#79b8d1";
      ctx.save();
      ctx.globalAlpha = 0.1 + index * 0.012;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      recording.frames.forEach((frame, frameIndex) => {
        if (frameIndex === 0) ctx.moveTo(frame.x, frame.y);
        else ctx.lineTo(frame.x, frame.y);
      });
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawNodes(now) {
    if (!game) return;
    game.level.nodes.forEach((node, index) => {
      const active = game.activeNodes.has(node.id);
      const radius = node.radius || 28;
      const pulse = (Math.sin(now * 0.0022 + index * 1.3) + 1) * 0.5;

      ctx.save();
      ctx.translate(node.x, node.y);

      if (active) {
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, radius * 2.3);
        glow.addColorStop(0, "rgba(98, 240, 223, 0.18)");
        glow.addColorStop(0.48, "rgba(98, 240, 223, 0.055)");
        glow.addColorStop(1, "rgba(98, 240, 223, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 2.3, 0, TAU);
        ctx.fill();
      }

      ctx.strokeStyle = active
        ? "rgba(98, 240, 223, 0.5)"
        : "rgba(120, 166, 171, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.stroke();

      ctx.strokeStyle = active
        ? "rgba(160, 255, 242, 0.36)"
        : "rgba(119, 160, 166, 0.12)";
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.72, now * 0.0003 + index, now * 0.0003 + index + Math.PI * 1.4);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = active
        ? `rgba(98, 240, 223, ${0.07 + pulse * 0.06})`
        : "rgba(31, 54, 62, 0.38)";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.48, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = active
        ? "rgba(195, 255, 246, 0.6)"
        : "rgba(131, 174, 179, 0.22)";
      ctx.stroke();

      ctx.fillStyle = active ? COLORS.cyanSoft : "rgba(137, 175, 179, 0.6)";
      ctx.font = '13px "Cascadia Mono", "Consolas", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, 0, 1);

      if (active) {
        ctx.strokeStyle = `rgba(98, 240, 223, ${0.24 + pulse * 0.24})`;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 7 + pulse * 3, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function echoColor(index, alpha = 1) {
    const hue = index % 2 === 0 ? 218 : 190;
    return `hsla(${hue}, 92%, 76%, ${alpha})`;
  }

  function drawEchoes(now) {
    if (!game) return;
    game.echoPositions.forEach((position, index) => {
      const speed = index % 2 === 0 ? 1 : -1;
      const angle = game.loopTime * speed * 0.5;
      ctx.save();

      for (let afterimage = 4; afterimage >= 1; afterimage -= 1) {
        const point = sampleRecording(
          game.recordings[index],
          Math.max(0, game.loopTime - afterimage * 0.065)
        );
        ctx.globalAlpha = (1 - afterimage / 5) * 0.14;
        ctx.fillStyle = echoColor(index);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10 - afterimage * 0.8, 0, TAU);
        ctx.fill();
      }

      ctx.translate(position.x, position.y);
      ctx.rotate(angle);
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = echoColor(index, 0.7);
      ctx.shadowBlur = 16;
      ctx.fillStyle = echoColor(index, 0.22);
      ctx.strokeStyle = echoColor(index, 0.78);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_RADIUS + 1.5, 0, TAU);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = echoColor(index, 0.38);
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_RADIUS + 7, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.rotate(-angle);
      ctx.fillStyle = echoColor(index, 0.92);
      ctx.font = '7px "Cascadia Mono", "Consolas", monospace';
      ctx.textAlign = "center";
      ctx.fillText(String(index + 1).padStart(2, "0"), 0, -19);
      ctx.restore();
    });
  }

  function drawPlayer(now) {
    if (!game || mode === "interlude" || mode === "ending") return;
    const player = game.player;
    player.trail.forEach((point, index) => {
      const alpha = (point.life / 0.34) * 0.18;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = COLORS.cyan;
      ctx.beginPath();
      ctx.arc(point.x, point.y, PLAYER_RADIUS * (0.35 + index / 26), 0, TAU);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(player.x, player.y);
    const aura = ctx.createRadialGradient(0, 0, 1, 0, 0, 31);
    aura.addColorStop(0, "rgba(216, 255, 249, 0.37)");
    aura.addColorStop(0.4, "rgba(98, 240, 223, 0.12)");
    aura.addColorStop(1, "rgba(98, 240, 223, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 31, 0, TAU);
    ctx.fill();

    ctx.rotate(now * 0.0015);
    ctx.strokeStyle = "rgba(185, 255, 247, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_RADIUS + 7, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.rotate(-now * 0.0015);

    ctx.shadowColor = "rgba(98, 240, 223, 0.9)";
    ctx.shadowBlur = 19;
    ctx.fillStyle = COLORS.white;
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_RADIUS - 2, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = COLORS.cyanSoft;
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_RADIUS - 4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-2, -2, 2, 0, TAU);
    ctx.fill();

    const facing = player.facing;
    ctx.rotate(facing);
    ctx.strokeStyle = "rgba(223, 255, 250, 0.66)";
    ctx.beginPath();
    ctx.moveTo(PLAYER_RADIUS + 2, 0);
    ctx.lineTo(PLAYER_RADIUS + 7, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawSyncLinks(now) {
    if (!game || game.activeNodes.size !== game.level.nodes.length) return;
    const nodes = game.level.nodes;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const pulse = 0.5 + Math.sin(now * 0.005) * 0.25;
    for (let index = 0; index < nodes.length; index += 1) {
      const current = nodes[index];
      const next = nodes[(index + 1) % nodes.length];
      const gradient = ctx.createLinearGradient(current.x, current.y, next.x, next.y);
      gradient.addColorStop(0, `rgba(98, 240, 223, ${0.22 + pulse * 0.2})`);
      gradient.addColorStop(0.5, `rgba(155, 210, 255, ${0.12 + pulse * 0.14})`);
      gradient.addColorStop(1, `rgba(98, 240, 223, ${0.22 + pulse * 0.2})`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 9]);
      ctx.lineDashOffset = -game.loopTime * 24;
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      const midX = (current.x + next.x) * 0.5 + (WORLD.width * 0.5 - (current.x + next.x) * 0.5) * 0.2;
      const midY = (current.y + next.y) * 0.5 + (WORLD.height * 0.5 - (current.y + next.y) * 0.5) * 0.2;
      ctx.quadraticCurveTo(midX, midY, next.x, next.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles() {
    if (!game) return;
    game.particles.forEach((particle) => {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * (0.6 + alpha * 0.7), 0, TAU);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    game.ripples.forEach((ripple) => {
      const alpha = clamp(ripple.life / ripple.maxLife, 0, 1);
      ctx.globalAlpha = alpha * 0.52;
      ctx.strokeStyle = ripple.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, TAU);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function drawWorldBorder(now) {
    const margin = 22;
    ctx.save();
    ctx.strokeStyle = "rgba(135, 203, 203, 0.09)";
    ctx.lineWidth = 1;
    const corner = 18;
    ctx.beginPath();
    ctx.moveTo(margin + corner, margin);
    ctx.lineTo(WORLD.width - margin - corner, margin);
    ctx.moveTo(WORLD.width - margin, margin + corner);
    ctx.lineTo(WORLD.width - margin, WORLD.height - margin - corner);
    ctx.moveTo(WORLD.width - margin - corner, WORLD.height - margin);
    ctx.lineTo(margin + corner, WORLD.height - margin);
    ctx.moveTo(margin, WORLD.height - margin - corner);
    ctx.lineTo(margin, margin + corner);
    ctx.stroke();

    ctx.globalAlpha = 0.17;
    ctx.fillStyle = "#7e999e";
    ctx.font = '7px "Cascadia Mono", "Consolas", monospace';
    ctx.fillText("ECHO // FIELD STABLE", margin + 6, WORLD.height - 9);
    ctx.textAlign = "right";
    ctx.fillText(`T+${game ? game.loopTime.toFixed(2) : "00.00"}`, WORLD.width - margin - 6, WORLD.height - 9);
    ctx.textAlign = "left";
    ctx.restore();
  }

  function drawMenuBackdrop(now) {
    if (game && mode !== "menu") return;
    ctx.save();
    ctx.translate(WORLD.width / 2, WORLD.height / 2);
    ctx.strokeStyle = "rgba(109, 188, 190, 0.08)";
    for (let ring = 0; ring < 5; ring += 1) {
      const radius = 130 + ring * 48;
      ctx.beginPath();
      ctx.arc(0, 0, radius, now * 0.00005 * (ring + 1), now * 0.00005 * (ring + 1) + Math.PI * 1.4);
      ctx.stroke();
    }
    ctx.rotate(-now * 0.00003);
    ctx.strokeStyle = "rgba(109, 188, 190, 0.06)";
    for (let line = 0; line < 12; line += 1) {
      ctx.rotate(TAU / 12);
      ctx.beginPath();
      ctx.moveTo(160, 0);
      ctx.lineTo(330, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  function render(now) {
    const { dpr, scale, ox, oy, width, height } = viewport;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);
    ctx.fillStyle = "#050910";
    ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);

    drawBackground(now);
    if (game) {
      drawArena(now);
      drawDecorations(now);
      drawEchoTraces();
      drawSyncLinks(now);
      drawHazards(now);
      drawWalls();
      drawNodes(now);
      drawEchoes(now);
      drawPlayer(now);
      drawParticles();
      drawWorldBorder(now);

      if (game.flash > 0) {
        ctx.save();
        ctx.globalAlpha = game.flash * 0.22;
        ctx.fillStyle = mode === "overload" ? COLORS.danger : COLORS.cyan;
        ctx.fillRect(0, 0, WORLD.width, WORLD.height);
        ctx.restore();
      }
    } else {
      drawMenuBackdrop(now);
    }

    if (viewport.width !== width || viewport.height !== height) {
      resizeCanvas();
    }
  }

  function tick(now) {
    const dt = Math.min(0.034, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    updateAmbient(dt, now);
    if (mode === "playing") updateGame(dt);
    if (game && mode !== "paused") updateParticles(dt);
    render(now);
    requestAnimationFrame(tick);
  }

  function resizeCanvas() {
    const bounds = dom.stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewport.width = bounds.width;
    viewport.height = bounds.height;
    viewport.dpr = dpr;
    viewport.scale = Math.min(bounds.width / WORLD.width, bounds.height / WORLD.height);
    viewport.ox = (bounds.width - WORLD.width * viewport.scale) * 0.5;
    viewport.oy = (bounds.height - WORLD.height * viewport.scale) * 0.5;
    dom.canvas.width = Math.max(1, Math.round(bounds.width * dpr));
    dom.canvas.height = Math.max(1, Math.round(bounds.height * dpr));
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (
      ["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "enter"].includes(key)
    ) {
      event.preventDefault();
    }

    if (event.repeat) return;

    if ((key === "enter" || key === " ") && mode === "menu") {
      beginGame();
      return;
    }
    if (key === "enter" && mode === "interlude") {
      advanceLevel();
      return;
    }
    if ((key === "r" || key === "enter") && mode === "ending") {
      beginGame();
      return;
    }
    if (key === "escape") {
      if (mode === "playing" || mode === "paused") togglePause();
      return;
    }
    if (mode === "paused" && key === "enter") {
      togglePause(false);
      return;
    }
    if (mode !== "playing") return;

    if (key === " ") {
      collapseTimeline();
      return;
    }
    if (key === "r") {
      restartLevel();
      return;
    }
    if (key === "m") {
      toggleSound();
      return;
    }
    keys.add(key);
  }

  function handleKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  function bindTouchDirections() {
    dom.touchControls.querySelectorAll("[data-direction]").forEach((button) => {
      const direction = button.dataset.direction;
      const press = (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        touchDirections.add(direction);
        button.classList.add("pressed");
      };
      const release = (event) => {
        event.preventDefault();
        touchDirections.delete(direction);
        button.classList.remove("pressed");
      };
      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", release);
    });
  }

  dom.startBtn.addEventListener("click", beginGame);
  dom.soundBtn.addEventListener("click", toggleSound);
  dom.nextBtn.addEventListener("click", advanceLevel);
  dom.restartBtn.addEventListener("click", beginGame);
  dom.resumeBtn.addEventListener("click", () => togglePause(false));
  dom.touchCollapse.addEventListener("click", collapseTimeline);
  dom.touchReset.addEventListener("click", () => restartLevel());
  window.addEventListener("keydown", handleKeyDown, { passive: false });
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("blur", () => {
    if (mode === "playing") togglePause(true);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && mode === "playing") togglePause(true);
  });
  bindTouchDirections();
  updateSoundButton();
  resizeCanvas();
  if (new URLSearchParams(window.location.search).has("debug")) {
    window.__echoProtocolDebug = {
      snapshot() {
        if (!game) return null;
        return {
          mode,
          levelIndex: game.levelIndex,
          loopNumber: game.loopNumber,
          loopTime: game.loopTime,
          player: { x: game.player.x, y: game.player.y },
          activeNodes: Array.from(game.activeNodes),
          sync: game.sync,
          recordings: game.recordings.map((recording) => ({
            duration: recording.duration,
            endX: recording.frames[recording.frames.length - 1]?.x,
            endY: recording.frames[recording.frames.length - 1]?.y,
          })),
        };
      },
    };
  }
  requestAnimationFrame(tick);
})();
