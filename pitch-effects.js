// ============================================================
// PITCH CLUTCH '26 — scroll football effect
// ------------------------------------------------------------
// Spawns balls at the cursor/finger position during scroll.
// Leaves a permanent, unshiny, faded "GOAL" mark where they vanish.
// ============================================================

(function () {
  const BALL_CHAR = "⚽";
  const BALL_SIZE = 30; // px
  const LIFETIME_MS = 500; // ball disappears after 2s
  const MAX_BALLS = 5; // cap concurrent balls
  const SPAWN_COOLDOWN_MS = 250; // minimum time between spawns
  const MIN_SPEED = 700; // px/s
  const SPEED_VARIANCE = 400; // px/s

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let activeBalls = 0;
  let lastSpawnTime = 0;
  let lastScrollY = window.scrollY;

  // Pointer position tracker (works for both mouse cursor and touch/finger)
  let pointerPos = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  };

  function updatePointer(e) {
    if (e.touches && e.touches.length > 0) {
      pointerPos.x = e.touches[0].clientX;
      pointerPos.y = e.touches[0].clientY;
    } else if (e.clientX !== undefined) {
      pointerPos.x = e.clientX;
      pointerPos.y = e.clientY;
    }
  }

  function injectStyles() {
    if (document.getElementById("pc-fx-style")) return;
    const style = document.createElement("style");
    style.id = "pc-fx-style";
    style.textContent = `
      .pc-fx-layer{
        position:fixed;
        inset:0;
        pointer-events:none;
        z-index:9999;
        overflow:hidden;
      }
      .pc-ball{
        position:absolute;
        top:0;
        left:0;
        font-size:${BALL_SIZE}px;
        line-height:1;
        will-change:transform;
        filter:drop-shadow(0 0 6px rgba(0,164,58,0.85)) drop-shadow(0 0 16px rgba(0,164,58,0.45));
        transition:opacity .25s ease;
      }
      .pc-ball.pc-fade{
        opacity:0;
      }
      /* Initial shiny GOAL burst */
      .pc-goal-burst{
        position:absolute;
        font-family:'Anton', sans-serif, system-ui;
        color:#00A43A;
        font-size:22px;
        font-weight:bold;
        letter-spacing:0.04em;
        text-transform:uppercase;
        text-shadow:0 0 14px rgba(0,164,58,0.9);
        opacity:1;
        transform:translate(-50%,-50%) scale(1.2);
        transition:all 0.3s ease-out;
        pointer-events:none;
        z-index:9999;
      }
      /* Permanent unshiny, faded GOAL mark */
      .pc-goal-mark{
        position:absolute;
        font-family:'Anton', sans-serif, system-ui;
        color:#888888;
        font-size:20px;
        font-weight:bold;
        letter-spacing:0.04em;
        text-transform:uppercase;
        opacity:0.25;
        text-shadow:none;
        filter:none;
        transform:translate(-50%,-50%) scale(1);
        pointer-events:none;
        z-index:1;
      }
      @media (prefers-reduced-motion: reduce){
        .pc-fx-layer{ display:none; }
      }
    `;
    document.head.appendChild(style);
  }

  function getFixedLayer() {
    let layer = document.querySelector(".pc-fx-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "pc-fx-layer";
      document.body.appendChild(layer);
    }
    return layer;
  }

  function spawnBall(direction) {
    if (activeBalls >= MAX_BALLS) return;
    activeBalls++;

    const layer = getFixedLayer();
    const ball = document.createElement("div");
    ball.className = "pc-ball";
    ball.textContent = BALL_CHAR;
    layer.appendChild(ball);

    // Start ball at current pointer/finger position
    let x = pointerPos.x - BALL_SIZE / 2;
    let y = pointerPos.y - BALL_SIZE / 2;

    let vx = (Math.random() - 0.5) * 2 * MIN_SPEED; // px/s, sideways drift
    let vy = (direction === "up" ? -1 : 1) * (MIN_SPEED + Math.random() * SPEED_VARIANCE);

    ball.style.transform = `translate(${x}px, ${y}px) rotate(0deg)`;

    const startTime = performance.now();
    let lastFrame = startTime;
    let spin = 0;

    function tick(now) {
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const elapsed = now - startTime;

      x += vx * dt;
      y += vy * dt;
      spin += 720 * dt;

      const maxX = window.innerWidth - BALL_SIZE;
      const maxY = window.innerHeight - BALL_SIZE;

      if (x <= 0) {
        x = 0;
        vx = Math.abs(vx);
      } else if (x >= maxX) {
        x = maxX;
        vx = -Math.abs(vx);
      }

      if (y <= 0) {
        y = 0;
        vy = Math.abs(vy);
      } else if (y >= maxY) {
        y = maxY;
        vy = -Math.abs(vy);
      }

      ball.style.transform = `translate(${x}px, ${y}px) rotate(${spin}deg)`;

      if (elapsed >= LIFETIME_MS) {
        finishBall(ball, x + BALL_SIZE / 2, y + BALL_SIZE / 2);
        return;
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function finishBall(ball, viewportX, viewportY) {
    ball.classList.add("pc-fade");
    setTimeout(() => {
      ball.remove();
      activeBalls--;
    }, 250);

    // Convert viewport position to absolute page position so mark stays fixed on scroll
    const pageX = viewportX + window.scrollX;
    const pageY = viewportY + window.scrollY;

    // 1. Create initial shiny goal burst
    const goalBurst = document.createElement("div");
    goalBurst.className = "pc-goal-burst";
    goalBurst.textContent = "GOAL!!";
    goalBurst.style.left = pageX + "px";
    goalBurst.style.top = pageY + "px";
    document.body.appendChild(goalBurst);

    // 2. Transition burst to persistent, unshiny faded mark
    setTimeout(() => {
      goalBurst.remove();
      const goalMark = document.createElement("div");
      goalMark.className = "pc-goal-mark";
      goalMark.textContent = "GOAL!!";
      goalMark.style.left = pageX + "px";
      goalMark.style.top = pageY + "px";
      document.body.appendChild(goalMark);
    }, 300);
  }

  function handleScroll() {
    const now = performance.now();
    if (now - lastSpawnTime < SPAWN_COOLDOWN_MS) return;

    const currentY = window.scrollY;
    if (Math.abs(currentY - lastScrollY) < 5) return; // ignore micro-scrolls

    lastSpawnTime = now;
    const scrolledDown = currentY > lastScrollY;
    lastScrollY = currentY;

    // Launch ball opposite to scroll direction
    spawnBall(scrolledDown ? "up" : "down");
  }

  function init() {
    if (prefersReducedMotion) return;
    injectStyles();
    getFixedLayer();
    lastScrollY = window.scrollY;

    // Track active mouse and touch inputs across all pages
    window.addEventListener("mousemove", updatePointer, { passive: true });
    window.addEventListener("touchmove", updatePointer, { passive: true });
    window.addEventListener("touchstart", updatePointer, { passive: true });
    window.addEventListener("wheel", updatePointer, { passive: true });

    // Track scroll events
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();