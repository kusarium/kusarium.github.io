(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");

  if (menuButton && menu) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      menu.removeAttribute("data-open");
      document.body.classList.remove("menu-open");
    };

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menu.toggleAttribute("data-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.hasAttribute("data-open")) {
        closeMenu();
        menuButton.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const header = document.querySelector("[data-site-header]");
  const progressBar = document.querySelector("[data-scroll-progress]");
  const backToTop = document.querySelector("[data-back-to-top]");
  let scrollTicking = false;

  const updateScrollUI = () => {
    const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / scrollRange, 0), 1);

    header?.toggleAttribute("data-scrolled", window.scrollY > 16);
    progressBar?.style.setProperty("--scroll-progress", String(progress));
    backToTop?.style.setProperty("--scroll-angle", `${progress * 360}deg`);
    backToTop?.toggleAttribute("data-visible", window.scrollY > Math.min(520, window.innerHeight * 0.7));
    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  };

  updateScrollUI();
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  if (!reducedMotion) {
    document.documentElement.classList.add("motion-active");

    const revealGroups = [
      [".hero__copy > *", () => "left", 70],
      [".hero__specimen", () => "right", 140],
      [".garden-note__inner > *", (index) => ["left", "up", "right"][index] || "up", 70],
      [".page-intro > *", (index) => (index === 1 ? "left" : "up"), 80],
      [".section-heading > *", (index) => (index ? "right" : "left"), 80],
      [".collection-card", () => "up", 90],
      [".post-card", () => "up", 90],
      [".gallery-item", (index) => (index % 2 ? "right" : "left"), 70],
      [".journal-list > li", () => "up", 55],
      [".archive-year", () => "up", 70],
      [".tag-group", (index) => (index % 2 ? "right" : "left"), 60],
      [".tag-cloud", () => "up", 0],
      [".about > *", (index) => (index ? "right" : "left"), 100],
      [".keeper__card", () => "right", 0],
      [".archive-callout", () => "up", 0],
      [".article__header > *", () => "up", 70],
      [".article__cover", () => "up", 0],
      [".article__content > *", () => "up", 35],
      [".article__footer", () => "up", 0]
    ];

    const revealElements = [];
    const prepared = new Set();

    revealGroups.forEach(([selector, getDirection, delayStep]) => {
      document.querySelectorAll(selector).forEach((element, index) => {
        if (prepared.has(element)) return;
        prepared.add(element);
        element.dataset.reveal = getDirection(index);
        element.style.setProperty("--reveal-delay", `${Math.min(index * delayStep, 280)}ms`);
        revealElements.push(element);
      });
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

      revealElements.forEach((element) => observer.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    }

    const parallax = document.querySelector("[data-hero-parallax]");
    const specimen = parallax?.querySelector(".specimen-frame");
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (parallax && specimen && finePointer) {
      const resetSpecimen = () => {
        specimen.style.setProperty("--shift-x", "0px");
        specimen.style.setProperty("--shift-y", "0px");
        specimen.style.setProperty("--tilt-x", "0deg");
        specimen.style.setProperty("--tilt-y", "0deg");
      };

      parallax.addEventListener("pointermove", (event) => {
        const bounds = parallax.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        specimen.style.setProperty("--shift-x", `${x * 10}px`);
        specimen.style.setProperty("--shift-y", `${y * 8}px`);
        specimen.style.setProperty("--tilt-x", `${y * -4}deg`);
        specimen.style.setProperty("--tilt-y", `${x * 5}deg`);
      });
      parallax.addEventListener("pointerleave", resetSpecimen);

      document.querySelectorAll(".collection-card").forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const bounds = card.getBoundingClientRect();
          card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
          card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
        });
      });
    }
  }

  const dialog = document.querySelector("[data-lightbox]");
  const dialogImage = dialog?.querySelector("[data-lightbox-image]");
  const closeButton = dialog?.querySelector("[data-lightbox-close]");
  const previousButton = dialog?.querySelector("[data-lightbox-prev]");
  const nextButton = dialog?.querySelector("[data-lightbox-next]");
  const lightboxStatus = dialog?.querySelector("[data-lightbox-status]");

  if (dialog && dialogImage) {
    const triggers = [...document.querySelectorAll("[data-lightbox-trigger]")];
    let activeIndex = 0;
    let pointerStartX = null;

    const showImage = (index) => {
      activeIndex = (index + triggers.length) % triggers.length;
      const trigger = triggers[activeIndex];
      dialogImage.src = trigger.dataset.src || "";
      dialogImage.alt = trigger.dataset.alt || "";
      if (lightboxStatus) {
        const caption = trigger.dataset.caption || trigger.dataset.alt || "";
        lightboxStatus.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(triggers.length).padStart(2, "0")} · ${caption}`;
      }
    };

    previousButton?.toggleAttribute("hidden", triggers.length < 2);
    nextButton?.toggleAttribute("hidden", triggers.length < 2);

    triggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => {
        showImage(index);
        dialog.showModal();
        document.body.classList.add("lightbox-open");
      });
    });

    const closeDialog = () => {
      dialog.close();
      document.body.classList.remove("lightbox-open");
    };

    closeButton?.addEventListener("click", closeDialog);
    previousButton?.addEventListener("click", () => showImage(activeIndex - 1));
    nextButton?.addEventListener("click", () => showImage(activeIndex + 1));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("close", () => document.body.classList.remove("lightbox-open"));
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" && triggers.length > 1) showImage(activeIndex - 1);
      if (event.key === "ArrowRight" && triggers.length > 1) showImage(activeIndex + 1);
    });
    dialogImage.addEventListener("pointerdown", (event) => {
      pointerStartX = event.clientX;
    });
    dialogImage.addEventListener("pointerup", (event) => {
      if (pointerStartX === null || triggers.length < 2) return;
      const distance = event.clientX - pointerStartX;
      if (Math.abs(distance) > 55) showImage(activeIndex + (distance < 0 ? 1 : -1));
      pointerStartX = null;
    });
  }
})();
