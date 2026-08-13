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

  const prepareArticleToc = (toc, headings = null) => {
    if (!toc) return;
    const links = [...toc.querySelectorAll("a[href^='#']")];
    const headingNodes = headings || links
      .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
      .filter(Boolean);
    const linksById = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));

    const setCurrent = (id) => {
      links.forEach((link) => link.removeAttribute("aria-current"));
      linksById.get(id)?.setAttribute("aria-current", "location");
    };

    links.forEach((link) => {
      link.addEventListener("click", () => setCurrent(link.getAttribute("href").slice(1)));
    });

    if (window.location.hash) setCurrent(decodeURIComponent(window.location.hash.slice(1)));
    if (!("IntersectionObserver" in window) || !headingNodes.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setCurrent(visible.target.id);
    }, { rootMargin: "-18% 0px -70% 0px", threshold: 0 });

    headingNodes.forEach((heading) => observer.observe(heading));
  };

  const buildArticleToc = (headings, title) => {
    if (!headings.length) return null;
    const toc = document.createElement("details");
    toc.className = "article-toc";
    toc.dataset.articleToc = "";
    toc.open = true;

    const summary = document.createElement("summary");
    summary.textContent = title || "本文目錄";
    toc.append(summary);

    const list = document.createElement("ol");
    headings.forEach((heading) => {
      const item = document.createElement("li");
      if (heading.tagName === "H3") item.className = "article-toc__subsection";
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.trim();
      item.append(link);
      list.append(item);
    });
    toc.append(list);
    return toc;
  };

  const base64ToBytes = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

  const decryptPayload = async (payload, password) => {
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: base64ToBytes(payload.salt),
        iterations: payload.iterations,
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(payload.iv) },
      key,
      base64ToBytes(payload.data),
    );
    return new TextDecoder().decode(decrypted);
  };

  const renderUnlockedContent = (gate, output, html) => {
    if (gate.dataset.contentKind !== "article") {
      output.innerHTML = html;
      return;
    }

    const prose = document.createElement("div");
    prose.className = "article__content prose";
    prose.innerHTML = html;
    const layout = document.createElement("div");
    layout.className = "article__reading-layout";
    const headings = [...prose.querySelectorAll("h2[id], h3[id]")];
    const showToc = gate.dataset.showToc === "true";
    const toc = showToc ? buildArticleToc(headings, gate.dataset.tocTitle) : null;

    if (toc) {
      layout.append(toc, prose);
    } else {
      layout.classList.add("article__reading-layout--solo");
      layout.append(prose);
    }
    output.replaceChildren(layout);
    prepareArticleToc(toc, headings);
  };

  document.querySelectorAll("[data-article-toc]").forEach((toc) => prepareArticleToc(toc));

  document.querySelectorAll("[data-password-gate]").forEach((gate) => {
    const payloadNode = gate.querySelector("[data-encrypted-payload]");
    const form = gate.querySelector("[data-password-form]");
    const input = gate.querySelector("[data-password-input]");
    const error = gate.querySelector("[data-password-error]");
    const panel = gate.querySelector("[data-gate-panel]");
    const output = gate.querySelector("[data-protected-output]");
    if (!payloadNode || !form || !input || !panel || !output) return;

    let payload;
    try {
      payload = JSON.parse(payloadNode.textContent);
    } catch {
      if (error) error.textContent = "加密內容讀取失敗，請稍後再試。";
      return;
    }

    const storageKey = `kusarium:access:${gate.dataset.accessScope || window.location.pathname}`;
    const unlock = async (password, isAutomatic = false) => {
      if (!window.crypto?.subtle) {
        if (error) error.textContent = "目前的瀏覽器不支援解鎖，請改用較新的瀏覽器。";
        return;
      }

      const submit = form.querySelector("button[type='submit']");
      submit?.setAttribute("disabled", "");
      gate.toggleAttribute("data-checking", true);
      if (error) error.textContent = "";

      try {
        const html = await decryptPayload(payload, password);
        renderUnlockedContent(gate, output, html);
        panel.hidden = true;
        output.hidden = false;
        gate.dataset.unlocked = "true";
        try { window.sessionStorage.setItem(storageKey, password); } catch { /* storage may be unavailable */ }
        if (!isAutomatic) output.focus({ preventScroll: true });
      } catch {
        try { window.sessionStorage.removeItem(storageKey); } catch { /* storage may be unavailable */ }
        if (error) error.textContent = gate.dataset.wrongMessage || "密碼不對，再想想。";
        if (!isAutomatic) input.select();
      } finally {
        submit?.removeAttribute("disabled");
        gate.removeAttribute("data-checking");
      }
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      unlock(input.value);
    });

    try {
      const savedPassword = window.sessionStorage.getItem(storageKey);
      if (savedPassword) unlock(savedPassword, true);
    } catch { /* storage may be unavailable */ }
  });

  const articlePoolNode = document.querySelector("[data-article-pool]");
  let articlePool = [];
  if (articlePoolNode) {
    try {
      articlePool = JSON.parse(articlePoolNode.textContent);
    } catch { /* keep the journal fallback when the pool cannot be read */ }
  }

  document.querySelectorAll("[data-random-article]").forEach((link) => {
    const currentPath = window.location.pathname.replace(/\/?$/, "/");
    const choices = articlePool.filter((url) => {
      try {
        return new URL(url, window.location.origin).pathname.replace(/\/?$/, "/") !== currentPath;
      } catch {
        return false;
      }
    });
    if (!choices.length) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      const destination = choices[Math.floor(Math.random() * choices.length)];
      window.location.assign(destination);
    });
  });
})();
