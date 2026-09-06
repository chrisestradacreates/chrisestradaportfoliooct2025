(function () {
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const nameEl = document.getElementById("loader-name");
  const loaderContentEl = document.querySelector(".loader-content");
  const loaderEl = document.getElementById("loader");
  const blockGridEl = document.getElementById("block-grid");

  const GRID_COLS = 10;
  const GRID_ROWS = 6;

  const FONT_CYCLE = [
    "var(--pixel)",
    "Georgia, serif",
    "'Courier New', monospace",
    "Impact, sans-serif",
    "'Brush Script MT', cursive",
    "var(--sans)",
    "Georgia, serif",
    "var(--pixel)",
    "'Courier New', monospace",
    "var(--sans)",
  ];

  function cycleFonts(step, delay) {
    if (step < FONT_CYCLE.length) {
      nameEl.style.fontFamily = FONT_CYCLE[step];
      setTimeout(() => cycleFonts(step + 1, delay * 1.22), delay);
    } else {
      nameEl.style.fontFamily = "";
      nameEl.classList.add("settled");
      setTimeout(startBlockFall, 500);
    }
  }

  function buildBlocks() {
    const total = GRID_COLS * GRID_ROWS;
    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / GRID_COLS);
      const block = document.createElement("div");
      block.className = "block";
      block.style.setProperty("--rot", (Math.random() * 60 - 30).toFixed(1) + "deg");
      block.dataset.delay = row * 85 + Math.random() * 45;
      blockGridEl.appendChild(block);
    }
  }

  function startBlockFall() {
    loaderContentEl.classList.add("fading");
    const blocks = blockGridEl.querySelectorAll(".block");
    let maxDelay = 0;
    blocks.forEach((block) => {
      const delay = parseFloat(block.dataset.delay);
      maxDelay = Math.max(maxDelay, delay);
      block.style.transitionDelay = `${delay}ms`;
      block.classList.add("fall");
    });
    setTimeout(finishLoading, maxDelay + 750);
  }

  function revealHeroWords() {
    const words = document.querySelectorAll(".reveal-word");
    words.forEach((w, i) => {
      setTimeout(() => w.classList.add("in"), i * 55);
    });
  }

  function finishLoading() {
    loaderEl.classList.add("fade-out");
    document.body.classList.remove("no-scroll");
    initSiteInteractions();
    revealHeroWords();
    setTimeout(() => {
      loaderEl.style.display = "none";
    }, 600);
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildBlocks();
    setTimeout(() => cycleFonts(0, 55), 300);
  });

  // ---------- Site interactions (start once loader completes) ----------
  function initSiteInteractions() {
    initCustomCursor();
    initScrollProgress();
    initReveals();
    initMagnetic();
    initTilt();
    initNav();
    initBackToTop();
    initCaseModal();
    initRotatingWord();
  }

  function initCustomCursor() {
    if (!isFinePointer) return;
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    let pressedScale = 1;
    let targetScale = 1;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    document.addEventListener("mousedown", () => {
      targetScale = 0.7;
      ring.classList.add("pressed");
      dot.classList.add("pressed");
    });

    document.addEventListener("mouseup", () => {
      targetScale = 1;
      ring.classList.remove("pressed");
      dot.classList.remove("pressed");
    });

    function raf() {
      ringX += (mouseX - ringX) * 0.4;
      ringY += (mouseY - ringY) * 0.4;
      pressedScale += (targetScale - pressedScale) * 0.3;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%) scale(${pressedScale})`;
      requestAnimationFrame(raf);
    }
    raf();

    bindCursorHoverTargets(document);
  }

  function bindCursorHoverTargets(root) {
    if (!isFinePointer) return;
    const ring = document.getElementById("cursor-ring");
    root.querySelectorAll("a, button, .tilt").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("hovering"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hovering"));
    });
  }

  function initScrollProgress() {
    const bar = document.getElementById("scroll-progress");
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    });
  }

  function initReveals() {
    const items = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, groupIndex) => {
          if (entry.isIntersecting) {
            const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 60;
            entry.target.style.transitionDelay = `${Math.min(delay, 240)}ms`;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((item) => observer.observe(item));
  }

  function initMagnetic() {
    bindMagnetic(document);
  }

  function bindMagnetic(root) {
    if (!isFinePointer) return;
    root.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0, 0)";
      });
    });
  }

  function initTilt() {
    if (!isFinePointer) return;
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-py * 6}deg) rotateY(${px * 6}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateY(0)";
      });
    });
  }

  function initNav() {
    const nav = document.getElementById("nav");
    const navLinks = document.querySelectorAll(".nav a[data-nav]");
    window.addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    });

    const sections = Array.from(navLinks).map((link) =>
      document.getElementById(link.dataset.nav)
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => link.classList.remove("active"));
            const activeLink = document.querySelector(`.nav a[data-nav="${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((section) => section && observer.observe(section));
  }

  function initRotatingWord() {
    const el = document.getElementById("rotating-word");
    if (!el) return;
    const words = ["empathy", "curiosity", "craft", "clarity", "intention"];
    let i = 0;

    // Lock the box to the widest word so swapping text never shifts
    // the rest of the line.
    const measurer = document.createElement("span");
    const cs = getComputedStyle(el);
    measurer.style.cssText = "position:absolute; visibility:hidden; white-space:nowrap; left:-9999px;";
    measurer.style.fontFamily = cs.fontFamily;
    measurer.style.fontSize = cs.fontSize;
    measurer.style.fontStyle = cs.fontStyle;
    measurer.style.fontWeight = cs.fontWeight;
    measurer.style.letterSpacing = cs.letterSpacing;
    document.body.appendChild(measurer);
    let maxWidth = 0;
    words.forEach((w) => {
      measurer.textContent = w + ".";
      maxWidth = Math.max(maxWidth, measurer.offsetWidth);
    });
    document.body.removeChild(measurer);
    el.style.minWidth = maxWidth + "px";

    setInterval(() => {
      el.style.opacity = "0";
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i] + ".";
        el.style.opacity = "1";
      }, 460);
    }, 2600);
  }

  function initBackToTop() {
    const btn = document.getElementById("back-to-top");
    if (!btn) return;
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function initCaseModal() {
    const modal = document.getElementById("case-modal");
    const body = document.getElementById("case-modal-body");
    const closeBtn = document.getElementById("case-modal-close");
    const backdrop = document.getElementById("case-modal-backdrop");

    function openCase(key) {
      const template = document.getElementById(`case-${key}`);
      if (!template) return;
      body.innerHTML = "";
      body.appendChild(template.content.cloneNode(true));
      bindMagnetic(body);
      bindCursorHoverTargets(body);
      modal.scrollTop = 0;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    }

    body.addEventListener("click", (e) => {
      const toggle = e.target.closest(".cm-more-toggle");
      if (!toggle) return;
      const more = toggle.nextElementSibling;
      const isOpen = more.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.firstChild.textContent = isOpen ? "View Less " : "View More Details ";
    });

    function closeCase() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
    }

    document.querySelectorAll(".case-link[data-case]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        openCase(link.dataset.case);
      });
    });

    closeBtn.addEventListener("click", closeCase);
    backdrop.addEventListener("click", closeCase);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeCase();
    });
  }
})();
