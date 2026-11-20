"use strict";

(() => {
  const layer = document.getElementById("celebrationLayer");
  const balloon = document.getElementById("travellingBalloon");
  if (!layer || !balloon) return;

  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sections = [...document.querySelectorAll("main > section, .site-footer")];
  const decoratedSections = [...document.querySelectorAll(".cover, main > section, .site-footer")];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const ease = value => value * value * (3 - 2 * value);
  let points = [];
  let frame = null;
  let needsMeasure = true;
  let current = null;
  let viewport = { width: 0, height: 0, size: 76 };

  // The decorations are isolated from the content and never receive input.
  decoratedSections.forEach(section => {
    section.setAttribute("data-fx-section", "");
    const decoration = document.createElement("div");
    decoration.className = "fx-decorations";
    decoration.setAttribute("aria-hidden", "true");
    ["✧", "✦", "✳"].forEach((symbol, index) => {
      const spark = document.createElement("span");
      spark.className = `section-spark spark-${["one", "two", "three"][index]}`;
      spark.setAttribute("data-fx-decor", "");
      spark.textContent = symbol;
      decoration.append(spark);
    });
    section.append(decoration);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle("fx-visible", entry.isIntersecting));
    }, { rootMargin: "60px 0px", threshold: 0 });
    decoratedSections.forEach(section => observer.observe(section));
  } else {
    decoratedSections.forEach(section => section.classList.add("fx-visible"));
  }

  function motionAllowed() {
    const focusedField = document.activeElement?.matches("input, select, textarea, [contenteditable='true']");
    return !preference.matches && !document.hidden && !focusedField &&
      !document.body.classList.contains("motion-paused") &&
      !document.body.classList.contains("modal-open");
  }

  function measure() {
    viewport.width = document.documentElement.clientWidth || window.innerWidth;
    viewport.height = window.innerHeight;
    viewport.size = parseFloat(window.getComputedStyle(balloon).getPropertyValue("--balloon-size")) || 76;
    const { width, height, size } = viewport;
    const margin = width <= 600 ? 7 : 16;
    const left = margin;
    const right = Math.max(left, width - size - margin);
    const tops = sections.map(section => section.getBoundingClientRect().top + window.scrollY);
    const maxY = Math.max(12, height - size * 2.25 - 14);
    const safeY = value => clamp(value - size * .61, 12, maxY);
    let side = right;
    points = [{ scroll: 0, x: right, y: safeY(height * .32), crossing: false }];

    tops.forEach((top, index) => {
      const previousGap = index ? top - tops[index - 1] : height;
      const nextGap = index < tops.length - 1 ? tops[index + 1] - top : height;
      // A crossing stays in the empty padding around the section boundary.
      const span = Math.max(1, Math.min(height * .44, previousGap * .66, nextGap * .66));
      const start = top - height * .5 - span / 2;
      const end = top - height * .5 + span / 2;
      const nextSide = side === right ? left : right;
      if (end <= 0) {
        side = nextSide;
        points[0].x = side;
        return;
      }
      points.push({ scroll: start, x: side, y: safeY(top - start), crossing: false });
      points.push({ scroll: end, x: nextSide, y: safeY(top - end), crossing: true });
      side = nextSide;
    });
    points.sort((a, b) => a.scroll - b.scroll);
    points.push({ scroll: Math.max(document.documentElement.scrollHeight, points.at(-1).scroll + 1),
      x: side, y: safeY(height * .32), crossing: false });
    current = null;
    needsMeasure = false;
  }

  function positionAt(scroll) {
    let index = 1;
    while (index < points.length - 1 && scroll > points[index].scroll) index++;
    const from = points[index - 1];
    const to = points[index];
    const progress = clamp((scroll - from.scroll) / Math.max(1, to.scroll - from.scroll), 0, 1);
    const eased = ease(progress);
    return {
      x: from.x + (to.x - from.x) * eased,
      y: from.y + (to.y - from.y) * (to.crossing ? progress : eased),
      angle: to.crossing ? clamp((to.x - from.x) / Math.max(1, to.scroll - from.scroll) * 5, -13, 13) * Math.sin(progress * Math.PI) : 0
    };
  }

  function render() {
    frame = null;
    if (!motionAllowed()) return;
    if (needsMeasure) measure();
    const target = positionAt(window.scrollY);
    if (!current) current = { ...target };
    current.x += (target.x - current.x) * .16;
    current.y += (target.y - current.y) * .16;
    current.angle += (target.angle - current.angle) * .12;
    balloon.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0) rotate(${current.angle.toFixed(2)}deg)`;
    balloon.classList.add("is-ready");
    const distance = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) + Math.abs(target.angle - current.angle);
    if (distance > .15) frame = window.requestAnimationFrame(render);
  }

  function schedule() {
    if (frame === null && motionAllowed()) frame = window.requestAnimationFrame(render);
  }

  function syncAvailability() {
    const allowed = motionAllowed();
    layer.hidden = !allowed;
    if (!allowed && frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
    }
    if (allowed) schedule();
  }

  function remeasure() {
    needsMeasure = true;
    schedule();
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", remeasure, { passive: true });
  window.addEventListener("load", remeasure, { once: true });
  document.fonts?.ready.then(remeasure);
  document.addEventListener("visibilitychange", syncAvailability);
  document.addEventListener("focusin", syncAvailability);
  document.addEventListener("focusout", () => window.requestAnimationFrame(syncAvailability));
  if (preference.addEventListener) preference.addEventListener("change", syncAvailability);
  else preference.addListener(syncAvailability);
  if ("MutationObserver" in window) {
    new MutationObserver(syncAvailability).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }
  syncAvailability();
})();
