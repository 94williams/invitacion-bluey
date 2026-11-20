"use strict";

(() => {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionToggle = document.getElementById("motionToggle");
  const gameField = document.getElementById("gameField");
  const balloonStatus = document.getElementById("balloonStatus");
  const balloons = [...document.querySelectorAll("[data-balloon]")];
  const particleTimers = new Map();
  const bounceTimers = new Map();
  let userPaused = false;
  let touches = 0;

  document.querySelectorAll("[data-world-image]").forEach(image => {
    const scene = window.INVITATION?.ambientacion;
    if (scene?.src) image.src = scene.src;
    if (scene?.alt) image.alt = scene.alt;
  });

  // Keep the original inline markup and bindings while animating each word.
  document.querySelectorAll("[data-title]").forEach(heading => {
    if (heading.dataset.titleReady === "true") return;
    // innerText keeps a spoken space at <br> and block-level emphasis breaks.
    const label = (heading.innerText || heading.textContent).replace(/\s+/g, " ").trim();
    if (!label) return;
    heading.setAttribute("aria-label", label);
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    let wordIndex = 0;
    textNodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).filter(Boolean).forEach(part => {
        if (/^\s+$/.test(part)) {
          fragment.append(document.createTextNode(part));
          return;
        }
        const word = document.createElement("span");
        word.className = "title-word";
        word.textContent = part;
        word.setAttribute("aria-hidden", "true");
        word.style.setProperty("--word-delay", `${Math.min(wordIndex++, 16) * 65}ms`);
        fragment.append(word);
      });
      node.replaceWith(fragment);
    });
    heading.dataset.titleReady = "true";
  });

  const isPaused = () => motionPreference.matches || userPaused;

  function clearParticles() {
    particleTimers.forEach((timer, particle) => {
      window.clearTimeout(timer);
      particle.remove();
    });
    particleTimers.clear();
  }

  function updateMotion() {
    const paused = isPaused();
    document.body.classList.toggle("motion-paused", paused);
    document.documentElement.style.scrollBehavior = paused ? "auto" : "";
    if (motionToggle) {
      motionToggle.setAttribute("aria-pressed", String(paused));
      const label = motionToggle.querySelector("[data-motion-label]") || motionToggle;
      label.textContent = paused ? "Activar animaciones" : "Pausar animaciones";
      motionToggle.disabled = motionPreference.matches;
      if (motionPreference.matches) {
        motionToggle.title = "El movimiento está reducido según la configuración de tu dispositivo.";
      } else {
        motionToggle.removeAttribute("title");
      }
    }
    if (paused) {
      clearParticles();
      bounceTimers.forEach((timer, balloon) => {
        window.clearTimeout(timer);
        balloon.classList.remove("balloon-bop");
      });
      bounceTimers.clear();
    }
  }

  motionToggle?.addEventListener("click", () => {
    userPaused = !userPaused;
    updateMotion();
  });
  if (motionPreference.addEventListener) {
    motionPreference.addEventListener("change", updateMotion);
  } else {
    motionPreference.addListener(updateMotion);
  }
  updateMotion();

  function confetti() {
    if (!gameField || isPaused()) return;
    clearParticles();
    const colors = ["#f8b644", "#e9866c", "#72b9d9", "#fff2cb", "#67956e"];
    const fragment = document.createDocumentFragment();
    const count = touches % 5 === 0 ? 24 : 16;
    for (let index = 0; index < count; index++) {
      const particle = document.createElement("i");
      particle.className = "confetti-particle";
      particle.setAttribute("aria-hidden", "true");
      particle.style.setProperty("--x", `${Math.round((Math.random() - .5) * 360)}px`);
      particle.style.setProperty("--y", `${Math.round(-90 - Math.random() * 160)}px`);
      particle.style.setProperty("--rotation", `${Math.round((Math.random() - .5) * 720)}deg`);
      particle.style.setProperty("--color", colors[index % colors.length]);
      fragment.append(particle);
      const timer = window.setTimeout(() => {
        particle.remove();
        particleTimers.delete(particle);
      }, 1800);
      particleTimers.set(particle, timer);
    }
    gameField.append(fragment);
  }

  balloons.forEach(balloon => {
    balloon.addEventListener("click", () => {
      touches++;
      if (balloonStatus) {
        balloonStatus.textContent = touches === 1
          ? "¡Primer toque! La diversión sigue en el aire."
          : touches % 10 === 0
            ? `¡${touches} toques! ¡Eres parte del equipo de Bluey!`
            : touches % 5 === 0
              ? `¡${touches} toques! ¡Qué gran equipo hacemos!`
              : `${touches} toques. ¡Vamos por uno más!`;
      }
      if (isPaused()) return;
      window.clearTimeout(bounceTimers.get(balloon));
      balloon.classList.remove("balloon-bop");
      // Restart the short animation even when the balloon is tapped rapidly.
      void balloon.offsetWidth;
      balloon.classList.add("balloon-bop");
      bounceTimers.set(balloon, window.setTimeout(() => {
        balloon.classList.remove("balloon-bop");
        bounceTimers.delete(balloon);
      }, 850));
      confetti();
    });
  });

  const stages = [...document.querySelectorAll(".route-stage")];
  if ("IntersectionObserver" in window) {
    const visibleStages = new Set();
    const syncStage = stage => stage.classList.toggle("scene-in-view",
      visibleStages.has(stage) || stage.contains(document.activeElement));
    const stageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleStages.add(entry.target);
        else visibleStages.delete(entry.target);
        syncStage(entry.target);
      });
    }, { threshold: 0 });
    stages.forEach(stage => {
      stageObserver.observe(stage);
      stage.addEventListener("focusin", () => syncStage(stage));
      stage.addEventListener("focusout", () => requestAnimationFrame(() => syncStage(stage)));
    });
  } else {
    stages.forEach(stage => stage.classList.add("scene-in-view"));
  }

  const navLinks = [...document.querySelectorAll('.topbar a[href="#eldia"], .topbar a[href="#recuerdos"], .topbar a[href="#rsvp"]')];
  if ("IntersectionObserver" in window && navLinks.length) {
    const visibleSections = new Map();
    const activate = id => navLinks.forEach(link => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.target);
        else visibleSections.delete(entry.target.id);
      });
      const current = [...visibleSections.values()].sort((a, b) =>
        Math.abs(a.getBoundingClientRect().top - 120) - Math.abs(b.getBoundingClientRect().top - 120))[0];
      activate(current?.id || "");
    }, { rootMargin: "-15% 0px -35% 0px", threshold: 0 });
    navLinks.forEach(link => {
      const section = document.getElementById(link.getAttribute("href").slice(1));
      if (section) navObserver.observe(section);
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearParticles();
  });
})();
