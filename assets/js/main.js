(() => {
  const BUILD_ID = "20260213r8";
  const TOTAL_PHOTOS = 46;
  const BASE_MS = 3800;
  const SPECIAL_MS = 5200;
  const MIN_BOOT_MS = 7000;
  const SPEED_OFFSET = 0.1;
  const SOUND_PREF_KEY = "valentine_sound_pref";
  const STARTED_KEY = "valentine_started";
  const BLOCKED_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"]);
  const EFFECT_SCENES = new Set([1, 10, 20, 30, 46]);
  const CAPTIONS = [
    "Happy Valentine’s Day.",
    "I know you don’t really celebrate… but I made this anyway.",
    "Just a little “I appreciate you” in my own way.",
    "You’re beautiful — effortlessly.",
    "Your presence feels like peace.",
    "Did you eat? ??",
    "Take care, sucker ??",
    "Okay… bye bye ??",
    "Still a vampire… and somehow still adorable.",
    "Night owl energy, always.",
    "You’re rare. That’s the whole point.",
    "You make ordinary days feel different.",
    "Blunt… but that’s why you’re my favorite.",
    "No beating around the bush. Say it directly.",
    "You’re funny in that “effortless” way.",
    "You’re amazing as always.",
    "Your smile does damage (in a good way).",
    "You don’t even try… and you still stand out.",
    "Monthly check-in: you good?",
    "If you’re tired, rest. Don’t force strength.",
    "I’m proud of you — even when you don’t say much.",
    "You deserve softness, not stress.",
    "You deserve love that feels safe.",
    "You’re the calm and the chaos… somehow perfectly balanced.",
    "I like you. Like… properly.",
    "I don’t say it all the time, but I mean it.",
    "You’re not “pretty.” You’re wow.",
    "You’re kind in ways people don’t notice. I notice.",
    "You make “simple” look powerful.",
    "You’re not hard to love. You’re easy to choose.",
    "I’d still choose you on your worst day.",
    "You’re the type of person you don’t replace.",
    "Some people shine. You glow.",
    "Even your silence has a vibe.",
    "I hope today feels gentle for you.",
    "If nobody told you lately: you’re doing great.",
    "You’re the reason I believe in effort.",
    "I don’t need a reason to care. I just do.",
    "You’re the best kind of distraction.",
    "You’re the best kind of motivation.",
    "I’m grateful you exist.",
    "Thank you for being you — fully.",
    "This is me saying: you matter.",
    "Happy Valentine’s Day (again)… because you’re worth repeating.",
    "One more thing… you’re loved.",
    "End scene: Always take care. Always. ??"
  ];

  const CHAPTERS = {
    12: { kicker: "Chapter I", title: "No Beating Around The Bush", text: "Direct words. Real care. No extra drama." },
    24: { kicker: "Chapter II", title: "Calm + Chaos", text: "You balance both somehow, and make it look effortless." },
    36: { kicker: "Chapter III", title: "Still Choosing You", text: "Same feeling, clearer every day." }
  };

  const PHOTO_GROUPS = [
    [1],
    [2, 3],
    [4, 5],
    [6, 7, 8],
    [9, 10],
    [11, 12],
    [13, 14],
    [15, 16, 17],
    [18, 19],
    [20, 21],
    [22, 23, 24],
    [25, 26],
    [27, 28, 29],
    [30, 31],
    [32, 33, 34],
    [35, 36],
    [37, 38],
    [39, 40],
    [41, 42, 43],
    [44, 45],
    [46]
  ];

  const q = (id) => document.getElementById(id);
  const track = q("sceneTrack");
  const audio = q("bgMusic");
  const heroStart = q("heroStartButton");
  const toggleBtn = q("musicToggle");
  const restartBtn = q("restartSlideshow");
  const exitBtn = q("exitSlideshow");
  const speedSel = q("playbackSpeed");
  const controlDock = q("controlDock");
  const controlMenuToggle = q("controlMenuToggle");
  const control = q("musicControl");
  const replayMusicBtn = q("replayMusic");
  const backTopBtn = q("backToTop");
  const topScene = q("top");
  const endOverlay = q("endOverlay");
  const endRestart = q("endRestart");
  const endReplayMusic = q("endReplayMusic");
  const endExit = q("endExit");
  const bootOverlay = q("bootLoader");
  const bootStatus = q("bootLoaderStatus");
  const bootBar = q("bootLoaderBar");

  if (!track || !heroStart || !topScene) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasAnime = typeof window.anime === "function";
  const hasConfetti = typeof window.confetti === "function";

  let scenes = [];
  let state = "idle";
  let active = -1;
  let timer = null;
  let locked = false;
  let playerMode = false;
  let controlOpen = false;
  let bootReady = false;
  let started = localStorage.getItem(STARTED_KEY) === "true";
  const usedEffects = new Set();

  console.info("[Valentine] build", BUILD_ID);

  if (reducedMotion) {
    document.body.classList.add("reduced-motion");
  }

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if ((conn && conn.saveData) || (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4)) {
    document.body.classList.add("low-power");
  }

  setVhUnit();
  window.addEventListener("resize", debounce(setVhUnit, 70), { passive: true });
  window.addEventListener("orientationchange", setVhUnit);

  buildScenes();
  bindUi();
  initAudio();
  initLockHandlers();
  enableLock();
  syncUi();
  if (started) {
    revealControl();
  }
  primeExperience();

  function buildScenes() {
    const frag = document.createDocumentFragment();

    PHOTO_GROUPS.forEach((group) => {
      const first = group[0];
      const last = group[group.length - 1];

      const photoItem = {
        type: "photo",
        photoIndex: first,
        photoIndexes: group,
        transition: first % 5 === 0 || first % 7 === 0 ? "slide" : "fade",
        durationMs: first === 1 || last === TOTAL_PHOTOS ? SPECIAL_MS : BASE_MS,
        typewriter: first === 1 || last === TOTAL_PHOTOS || first % 4 === 0,
        caption: fitTwoLines(mergeCaptions(group)),
        counterLabel: first === last ? `${pad2(first)}/${TOTAL_PHOTOS}` : `${pad2(first)}-${pad2(last)}/${TOTAL_PHOTOS}`,
        element: null
      };
      photoItem.element = makePhotoScene(photoItem);
      scenes.push(photoItem);
      frag.appendChild(photoItem.element);

      if (CHAPTERS[last]) {
        const ch = CHAPTERS[last];
        const chapterItem = {
          type: "chapter",
          transition: "fade",
          durationMs: SPECIAL_MS,
          kicker: ch.kicker,
          title: ch.title,
          text: ch.text,
          element: null
        };
        chapterItem.element = makeChapterScene(chapterItem);
        scenes.push(chapterItem);
        frag.appendChild(chapterItem.element);
      }
    });

    track.appendChild(frag);
  }

  function primeExperience() {
    window.scrollTo({ top: 0, behavior: "auto" });

    if (bootOverlay) {
      bootOverlay.hidden = false;
      document.body.classList.add("overlay-open");
    }

    setBootProgress(0, TOTAL_PHOTOS);
    setBootStatus("Loading memories from top to bottom...");

    Promise.all([wait(MIN_BOOT_MS), preloadImagesSequentially(), preloadAudioAsset()])
      .catch(() => {})
      .finally(() => {
        bootReady = true;
        setBootProgress(TOTAL_PHOTOS, TOTAL_PHOTOS);
        setBootStatus("Ready. Press Start Slideshow.");
        hideBootOverlay();
        animateHeroIntro();
        syncUi();
      });
  }

  function makePhotoScene(item) {
    const section = document.createElement("section");
    section.className = `scene photo-scene transition-${item.transition}`;
    section.dataset.sceneType = "photo";
    section.dataset.photoIndex = String(item.photoIndex);
    section.dataset.photoCount = String(item.photoIndexes.length);
    section.classList.add(`layout-${Math.min(item.photoIndexes.length, 3)}`);

    const media = document.createElement("div");
    media.className = "scene-media";

    const src = `assets/images/photo${pad2(item.photoIndex)}.jpg`;

    const bg = document.createElement("div");
    bg.className = "scene-bg-blur";
    bg.style.backgroundImage = `url(${src})`;

    const frame = document.createElement("div");
    frame.className = "scene-frame";

    const gallery = document.createElement("div");
    gallery.className = `scene-gallery scene-gallery-${Math.min(item.photoIndexes.length, 3)}`;
    const portraitThreshold = Math.ceil(item.photoIndexes.length * 0.67);
    let portraitCount = 0;

    item.photoIndexes.forEach((photoNumber) => {
      const card = document.createElement("div");
      card.className = "scene-card";

      const img = document.createElement("img");
      img.className = "scene-image";
      img.src = `assets/images/photo${pad2(photoNumber)}.jpg`;
      img.alt = `Photo ${pad2(photoNumber)}`;
      img.loading = "eager";
      img.decoding = "async";
      img.addEventListener("error", () => card.classList.add("image-missing"), { once: true });

      const markRatio = () => {
        if (card.dataset.ratioReady === "1") return;
        card.dataset.ratioReady = "1";

        const ratio = getRatio(img);
        if (ratio < 0.92) {
          card.classList.add("is-portrait");
          portraitCount += 1;
        } else if (ratio <= 1.08) {
          card.classList.add("is-square");
        } else {
          card.classList.add("is-landscape");
        }

        if (item.photoIndexes.length > 1 && portraitCount >= portraitThreshold) {
          section.classList.add("scene-mostly-portrait");
        }
      };

      img.addEventListener("load", markRatio, { once: true });

      card.appendChild(img);
      gallery.appendChild(card);

      if (img.complete && img.naturalWidth > 0) {
        markRatio();
      }
    });

    const grad = document.createElement("div");
    grad.className = "scene-gradient";

    const content = document.createElement("div");
    content.className = "scene-content container-fluid";

    const stage = document.createElement("div");
    stage.className = "scene-stage";

    const counter = document.createElement("span");
    counter.className = "scene-counter";
    counter.textContent = item.counterLabel;

    const shell = document.createElement("div");
    shell.className = "scene-caption-shell";

    const cap = document.createElement("p");
    cap.className = "scene-caption";
    cap.dataset.mode = item.typewriter ? "typewriter" : "fade";
    cap.dataset.text = item.caption;
    cap.dataset.lines = String(item.photoIndexes.length > 1 ? 3 : 2);
    cap.style.setProperty("--caption-lines", cap.dataset.lines);
    cap.setAttribute("aria-label", item.caption.replace(/\n/g, " "));

    if (reducedMotion) {
      cap.innerHTML = toCaptionHtml(item.caption);
      cap.style.opacity = "1";
      cap.style.transform = "none";
    }

    frame.appendChild(gallery);
    stage.appendChild(frame);
    media.append(bg, grad);
    shell.appendChild(cap);
    content.append(counter, stage, shell);
    section.append(media, content);

    return section;
  }

  function makeChapterScene(item) {
    const section = document.createElement("section");
    section.className = "scene chapter-card transition-fade";
    section.dataset.sceneType = "chapter";

    const container = document.createElement("div");
    container.className = "container";

    const panel = document.createElement("div");
    panel.className = "chapter-panel text-center mx-auto";

    panel.innerHTML = `<p class="chapter-kicker">${escapeHtml(item.kicker)}</p><h2 class="chapter-title">${escapeHtml(item.title)}</h2><p class="chapter-text">${escapeHtml(item.text)}</p>`;

    container.appendChild(panel);
    section.appendChild(container);
    return section;
  }

  function fitTwoLines(text) {
    const compact = text.replace(/\s+/g, " ").trim();

    if (!compact || compact.length <= 52 || compact.includes("\n")) {
      return compact;
    }

    const midpoint = Math.floor(compact.length / 2);
    let splitAt = compact.lastIndexOf(" ", midpoint);

    if (splitAt < compact.length * 0.35) {
      splitAt = compact.indexOf(" ", midpoint);
    }

    if (splitAt <= 0 || splitAt >= compact.length - 1) {
      return compact;
    }

    return `${compact.slice(0, splitAt)}\n${compact.slice(splitAt + 1)}`;
  }

  function mergeCaptions(photoIndexes) {
    const parts = photoIndexes.map((index) => CAPTIONS[index - 1]).filter(Boolean);

    if (parts.length <= 1) {
      return parts[0] || "";
    }

    return parts.join("\n");
  }

  function animateHeroIntro() {
    const targets = [".hero-kicker", ".hero-title", ".hero-subtitle", ".hero-note", ".hero-start-wrap"];

    if (reducedMotion || !hasAnime) {
      targets.forEach((selector) => {
        const node = topScene.querySelector(selector);
        if (node) {
          node.style.opacity = "1";
          node.style.transform = "none";
        }
      });
      return;
    }

    window.anime
      .timeline({ easing: "easeOutQuad" })
      .add({
        targets: ".hero-kicker",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 520
      })
      .add(
        {
          targets: ".hero-title",
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 820
        },
        "-=180"
      )
      .add(
        {
          targets: ".hero-subtitle, .hero-note, .hero-start-wrap",
          opacity: [0, 1],
          translateY: [14, 0],
          duration: 620,
          delay: window.anime.stagger(100)
        },
        "-=280"
      );
  }
  function bindUi() {
    if (controlMenuToggle) {
      controlMenuToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!bootReady || (!started && state === "idle")) return;
        setControlOpen(!controlOpen);
      });
    }

    document.addEventListener("pointerdown", (event) => {
      if (!controlOpen || !controlDock) return;
      if (controlDock.contains(event.target)) return;
      setControlOpen(false);
    });

    heroStart.addEventListener("click", async () => {
      if (!bootReady) return;
      if (state === "playing") {
        pauseSlideshow();
      } else if (state === "paused") {
        await resumeSlideshow();
      } else {
        await startSlideshow({ fromBeginning: true });
      }
    });

    if (toggleBtn) {
      toggleBtn.addEventListener("click", async () => {
        if (!bootReady) return;
        if (state === "playing") {
          pauseSlideshow();
        } else if (state === "paused") {
          await resumeSlideshow();
        } else {
          await startSlideshow({ fromBeginning: true });
        }
        setControlOpen(false);
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener("click", async () => {
        if (!bootReady) return;
        await restartSlideshow();
        setControlOpen(false);
      });
    }

    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        exitSlideshow();
        setControlOpen(false);
      });
    }

    if (speedSel) {
      speedSel.addEventListener("change", () => {
        if (!bootReady) return;
        if (state === "playing") {
          scheduleNext();
        }
      });
    }

    if (replayMusicBtn) {
      replayMusicBtn.addEventListener("click", async () => {
        if (!audio || audio.error) return;
        audio.currentTime = 0;
        await playAudio(true);
      });
    }

    if (backTopBtn) {
      backTopBtn.addEventListener("click", () => {
        if (state !== "idle") return;
        topScene.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      });
    }

    if (endRestart) {
      endRestart.addEventListener("click", async () => {
        hideEndOverlay();
        await restartSlideshow();
      });
    }

    if (endReplayMusic) {
      endReplayMusic.addEventListener("click", async () => {
        if (!audio || audio.error) return;
        audio.currentTime = 0;
        await playAudio(true);
      });
    }

    if (endExit) {
      endExit.addEventListener("click", () => {
        exitSlideshow();
      });
    }
  }

  function initAudio() {
    if (!audio) return;

    audio.volume = 0.5;
    audio.addEventListener("play", syncUi);
    audio.addEventListener("pause", syncUi);
    audio.addEventListener("error", () => {
      if (toggleBtn) {
        toggleBtn.disabled = true;
        toggleBtn.textContent = "Audio unavailable";
      }
      syncUi();
    });
  }

  async function playAudio(force) {
    if (!audio || audio.error) return false;
    if (!force && localStorage.getItem(SOUND_PREF_KEY) === "off") return false;

    try {
      await audio.play();
      localStorage.setItem(SOUND_PREF_KEY, "on");
      syncUi();
      return true;
    } catch (_err) {
      syncUi();
      return false;
    }
  }

  function pauseAudioByUser() {
    if (!audio) return;
    audio.pause();
    localStorage.setItem(SOUND_PREF_KEY, "off");
  }

  function pauseAudioSoft() {
    if (audio) audio.pause();
  }

  async function startSlideshow({ fromBeginning = true } = {}) {
    if (!bootReady || !scenes.length) return;

    hideEndOverlay();
    markStarted();
    enterPlayerMode();

    if (fromBeginning || active < 0) {
      active = 0;
      usedEffects.clear();
    }

    state = "playing";
    enableLock();
    await playAudio(true);
    await showScene(active, { transition: false, triggerEffects: true, forceType: true });
    scheduleNext();
    syncUi();
  }

  function pauseSlideshow() {
    if (state !== "playing") return;
    state = "paused";
    clearTimer();
    enableLock();
    pauseAudioByUser();
    syncUi();
  }

  async function resumeSlideshow() {
    if (state === "idle") {
      await startSlideshow({ fromBeginning: true });
      return;
    }

    hideEndOverlay();
    state = "playing";
    enableLock();
    await playAudio(true);
    scheduleNext();
    syncUi();
  }

  async function restartSlideshow() {
    active = 0;
    usedEffects.clear();
    await startSlideshow({ fromBeginning: true });
  }

  function exitSlideshow() {
    clearTimer();
    hideEndOverlay();
    state = "idle";
    leavePlayerMode();
    syncUi();
    topScene.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }

  async function showScene(nextIndex, opts = {}) {
    const safe = clamp(nextIndex, 0, scenes.length - 1);
    const prev = active;
    const prevItem = prev >= 0 ? scenes[prev] : null;
    const item = scenes[safe];
    if (!item || !item.element) return;

    const dir = prevItem && safe < prev ? -1 : 1;

    if (playerMode && opts.transition && prevItem && prevItem.element !== item.element) {
      await transitionScene(prevItem.element, item.element, item.transition, dir);
    }

    active = safe;
    applySceneClasses(active);
    animateScene(item, opts.forceType);
    if (opts.triggerEffects && item.type === "photo") {
      item.photoIndexes.forEach((photoNumber) => triggerEffects(photoNumber));
    }
  }

  function applySceneClasses(activeIndex) {
    scenes.forEach((item, index) => {
      if (!item.element) return;
      item.element.classList.toggle("is-active", index === activeIndex);
      item.element.classList.toggle("is-prev", index < activeIndex);
      item.element.classList.toggle("is-next", index > activeIndex);
    });
  }

  function transitionScene(prevEl, nextEl, kind, dir) {
    if (!hasAnime || reducedMotion) {
      clearInline(prevEl);
      clearInline(nextEl);
      return Promise.resolve();
    }

    window.anime.remove(prevEl);
    window.anime.remove(nextEl);

    prevEl.classList.add("is-active");
    nextEl.classList.add("is-active");

    const slide = kind === "slide";
    const inX = slide ? dir * 14 : 0;
    const outX = slide ? -dir * 10 : 0;
    const inScale = slide ? 1 : 1.06;

    window.anime.set(nextEl, { opacity: 0, translateX: inX, scale: inScale });
    window.anime.set(prevEl, { opacity: 1, translateX: 0, scale: 1 });

    return new Promise((resolve) => {
      const tl = window.anime.timeline({
        easing: "easeOutCubic",
        duration: 760,
        complete: () => {
          clearInline(prevEl);
          clearInline(nextEl);
          resolve();
        }
      });

      tl.add({ targets: prevEl, opacity: [1, 0], translateX: [0, outX], scale: [1, 1.01], duration: 620 }, 0);
      tl.add({ targets: nextEl, opacity: [0, 1], translateX: [inX, 0], scale: [inScale, 1], duration: 760 }, 0);
    });
  }

  function animateScene(item, forceType) {
    if (!item || !item.element) return;

    if (item.type === "chapter") {
      const panel = item.element.querySelector(".chapter-panel");
      if (!panel) return;
      if (reducedMotion || !hasAnime) {
        panel.style.opacity = "1";
        panel.style.transform = "none";
      } else {
        window.anime.remove(panel);
        window.anime({ targets: panel, opacity: [0, 1], translateY: [22, 0], duration: 760, easing: "easeOutCubic" });
      }
      return;
    }

    const imgs = item.element.querySelectorAll(".scene-image");
    const cap = item.element.querySelector(".scene-caption");

    if (imgs.length && !reducedMotion && hasAnime) {
      window.anime.remove(imgs);
      window.anime({
        targets: imgs,
        scale: [1.03, 1],
        duration: 1200,
        delay: window.anime.stagger(90),
        easing: "easeOutCubic"
      });
    }

    if (!cap) return;
    const text = cap.dataset.text || "";
    const typeMode = cap.dataset.mode === "typewriter" && !reducedMotion;

    if (typeMode && (forceType || item.element.dataset.typed !== "true")) {
      item.element.dataset.typed = "true";
      typeCaption(cap, text);
      return;
    }

    cap.innerHTML = toCaptionHtml(text);
    if (!reducedMotion && hasAnime) {
      window.anime.remove(cap);
      window.anime({ targets: cap, opacity: [0, 1], translateY: [12, 0], duration: 640, easing: "easeOutQuad" });
    } else {
      cap.style.opacity = "1";
      cap.style.transform = "none";
    }
  }
  function scheduleNext() {
    clearTimer();
    if (state !== "playing") return;

    const current = scenes[active];
    const selectedSpeed = Number.parseFloat(speedSel ? speedSel.value : "1") || 1;
    const speed = Math.max(0.2, selectedSpeed - SPEED_OFFSET);
    const ms = Math.max(1800, Math.round(((current ? current.durationMs : BASE_MS) / speed)));

    timer = window.setTimeout(async () => {
      if (state !== "playing") return;

      const next = active + 1;
      if (next >= scenes.length) {
        onSlideshowEnd();
        return;
      }

      await showScene(next, { transition: true, triggerEffects: true, forceType: true });
      scheduleNext();
    }, ms);
  }

  function onSlideshowEnd() {
    clearTimer();
    state = "paused";
    enableLock();
    pauseAudioSoft();
    showEndOverlay();
    syncUi();
  }

  function triggerEffects(photoIndex) {
    if (!hasConfetti || reducedMotion || !EFFECT_SCENES.has(photoIndex) || usedEffects.has(photoIndex)) return;
    usedEffects.add(photoIndex);

    const mobile = window.innerWidth <= 768;
    const base = mobile ? 26 : 56;

    if (photoIndex === 1) {
      burst({ particleCount: base, spread: 56, startVelocity: mobile ? 20 : 28, origin: { y: 0.72 } });
      return;
    }

    if (photoIndex === 10) {
      burst({ particleCount: mobile ? 22 : 42, spread: 38, startVelocity: mobile ? 18 : 25, gravity: 0.65, colors: ["#fff7fc", "#ffd8e9", "#ff9bc0"], origin: { x: 0.5, y: 0.68 } });
      return;
    }

    if (photoIndex === 20) {
      firework(mobile, 0.35, 0.58);
      firework(mobile, 0.68, 0.58);
      return;
    }

    if (photoIndex === 30) {
      burst({ particleCount: mobile ? 48 : 92, spread: 74, startVelocity: mobile ? 24 : 32, origin: { y: 0.68 } });
      return;
    }

    if (photoIndex === 46) {
      burst({ particleCount: mobile ? 64 : 130, spread: 88, startVelocity: mobile ? 28 : 36, origin: { y: 0.66 } });
      window.setTimeout(() => firework(mobile, 0.24, 0.58), 120);
      window.setTimeout(() => firework(mobile, 0.78, 0.58), 260);
    }
  }

  function burst(options) {
    window.confetti({ disableForReducedMotion: true, ticks: 130, gravity: 0.88, scalar: window.innerWidth <= 768 ? 0.82 : 1, ...options });
  }

  function firework(mobile, x, y) {
    burst({ particleCount: mobile ? 16 : 34, angle: 62, spread: 70, startVelocity: mobile ? 28 : 40, colors: ["#ff8fbc", "#ffd7eb", "#fff9fd", "#ff6ea4"], origin: { x, y } });
    window.setTimeout(() => {
      burst({ particleCount: mobile ? 12 : 26, angle: 118, spread: 70, startVelocity: mobile ? 22 : 34, origin: { x, y } });
    }, 120);
  }

  function initLockHandlers() {
    window.addEventListener("wheel", preventGesture, { passive: false });
    window.addEventListener("touchmove", preventGesture, { passive: false });
    window.addEventListener("keydown", preventKeys, { passive: false });
  }

  function preventGesture(event) {
    if (!locked) return;
    if (isInteractive(event.target)) return;
    event.preventDefault();
  }

  function preventKeys(event) {
    if (!locked) return;
    if (isInteractive(event.target)) return;
    if (BLOCKED_KEYS.has(event.key)) event.preventDefault();
  }

  function isInteractive(target) {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    return ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName);
  }

  function enableLock() {
    locked = true;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }

  function disableLock() {
    enableLock();
  }

  function enterPlayerMode() {
    if (playerMode) {
      enableLock();
      return;
    }
    playerMode = true;
    document.body.classList.add("player-mode");
    enableLock();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function leavePlayerMode() {
    if (!playerMode) {
      disableLock();
      return;
    }

    playerMode = false;
    document.body.classList.remove("player-mode");
    disableLock();

    scenes.forEach((s) => {
      if (!s.element) return;
      s.element.classList.remove("is-active", "is-prev", "is-next");
      clearInline(s.element);
    });

    active = -1;
  }

  function markStarted() {
    started = true;
    localStorage.setItem(STARTED_KEY, "true");
    revealControl();
  }

  function revealControl() {
    if (controlDock) controlDock.classList.add("is-visible");
  }

  function showEndOverlay() {
    if (endOverlay) endOverlay.hidden = false;
    setControlOpen(true);
  }

  function hideEndOverlay() {
    if (endOverlay) endOverlay.hidden = true;
    setControlOpen(false);
  }

  function setControlOpen(next) {
    controlOpen = Boolean(next);
    if (controlDock) {
      controlDock.classList.toggle("is-open", controlOpen);
      controlDock.classList.toggle("is-visible", started || state !== "idle");
    }
    if (controlMenuToggle) {
      controlMenuToggle.setAttribute("aria-expanded", controlOpen ? "true" : "false");
    }
  }

  function syncUi() {
    const playing = state === "playing";
    const paused = state === "paused";
    const booting = !bootReady;
    const audioBroken = Boolean(audio && audio.error);

    heroStart.textContent = booting ? "Loading Slideshow..." : playing ? "Pause Slideshow" : paused ? "Resume Slideshow" : "Start Slideshow";
    heroStart.disabled = booting;

    if (toggleBtn) {
      if (audioBroken) {
        toggleBtn.textContent = "Audio unavailable";
        toggleBtn.disabled = true;
      } else {
        toggleBtn.textContent = playing ? "Pause" : "Play";
        toggleBtn.setAttribute("aria-label", playing ? "Pause slideshow" : "Play slideshow");
        toggleBtn.disabled = booting;
      }
    }

    if (controlDock) {
      const controlVisible = started || state !== "idle";
      controlDock.classList.toggle("is-visible", controlVisible);
      if (!controlVisible && controlOpen) {
        setControlOpen(false);
      }
    }

    if (control) {
      control.classList.toggle("is-paused", !playing);
    }

    if (restartBtn) restartBtn.disabled = booting;
    if (speedSel) speedSel.disabled = booting || state === "idle";
    if (exitBtn) exitBtn.disabled = booting || state === "idle";
    if (controlMenuToggle) {
      controlMenuToggle.disabled = booting || (!started && state === "idle");
    }
  }

  async function preloadImagesSequentially() {
    for (let i = 1; i <= TOTAL_PHOTOS; i += 1) {
      setBootStatus(`Loading photo ${pad2(i)} of ${TOTAL_PHOTOS}...`);
      await preloadImage(i);
      setBootProgress(i, TOTAL_PHOTOS);
    }
  }

  function preloadImage(index) {
    const src = `assets/images/photo${pad2(index)}.jpg`;
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };

      img.onload = () => {
        if (typeof img.decode === "function") {
          img.decode().catch(() => {}).finally(finish);
          return;
        }
        finish();
      };
      img.onerror = finish;
      img.src = src;
      if (img.complete) finish();
    });
  }

  function preloadAudioAsset() {
    if (!audio) return Promise.resolve();

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const cleanup = () => {
        window.clearTimeout(timeoutId);
        audio.removeEventListener("canplaythrough", finish);
        audio.removeEventListener("loadeddata", finish);
        audio.removeEventListener("error", finish);
      };

      const timeoutId = window.setTimeout(finish, 3000);
      audio.addEventListener("canplaythrough", finish);
      audio.addEventListener("loadeddata", finish);
      audio.addEventListener("error", finish);
      audio.load();
    });
  }

  function hideBootOverlay() {
    if (!bootOverlay) {
      document.body.classList.remove("overlay-open");
      return;
    }

    bootOverlay.classList.add("is-hidden");
    window.setTimeout(() => {
      bootOverlay.hidden = true;
      document.body.classList.remove("overlay-open");
    }, 320);
  }

  function setBootStatus(text) {
    if (bootStatus) {
      bootStatus.textContent = text;
    }
  }

  function setBootProgress(done, total) {
    if (!bootBar || !total) return;
    const ratio = clamp(done / total, 0, 1);
    bootBar.style.transform = `scaleX(${ratio})`;
  }

  function clearTimer() {
    if (!timer) return;
    window.clearTimeout(timer);
    timer = null;
  }

  function clearInline(el) {
    if (!el) return;
    el.style.opacity = "";
    el.style.transform = "";
  }

  function typeCaption(el, text) {
    if (el._t) window.clearTimeout(el._t);
    const chars = Array.from(text);
    let i = 0;
    el.innerHTML = "";
    el.style.opacity = "1";
    el.style.transform = "none";

    const tick = () => {
      i += 1;
      el.innerHTML = toCaptionHtml(chars.slice(0, i).join(""));
      if (i < chars.length) el._t = window.setTimeout(tick, 18);
    };

    tick();
  }

  function toCaptionHtml(v) {
    return escapeHtml(v).replace(/\n/g, "<br>");
  }

  function escapeHtml(v) {
    const m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return v.replace(/[&<>"']/g, (c) => m[c]);
  }

  function setVhUnit() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  function debounce(fn, wait) {
    let t;
    return () => {
      window.clearTimeout(t);
      t = window.setTimeout(fn, wait);
    };
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function getRatio(img) {
    const w = img.naturalWidth || img.width || 1;
    const h = img.naturalHeight || img.height || 1;
    return w / h;
  }

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  function pad2(v) {
    return String(v).padStart(2, "0");
  }
})();

