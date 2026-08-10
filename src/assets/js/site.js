(() => {
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
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const header = document.querySelector("[data-site-header]");
  if (header) {
    const updateHeader = () => header.toggleAttribute("data-scrolled", window.scrollY > 16);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  const dialog = document.querySelector("[data-lightbox]");
  const dialogImage = dialog?.querySelector("[data-lightbox-image]");
  const closeButton = dialog?.querySelector("[data-lightbox-close]");

  if (dialog && dialogImage) {
    document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        dialogImage.src = trigger.dataset.src || "";
        dialogImage.alt = trigger.dataset.alt || "";
        dialog.showModal();
      });
    });

    const closeDialog = () => dialog.close();
    closeButton?.addEventListener("click", closeDialog);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
  }
})();
