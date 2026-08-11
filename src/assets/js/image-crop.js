(() => {
  const root = document.querySelector("[data-image-cropper]");
  if (!root) return;

  const fileInput = root.querySelector("[data-crop-file]");
  const presetInput = root.querySelector("[data-crop-preset]");
  const zoomInput = root.querySelector("[data-crop-zoom]");
  const zoomOutput = root.querySelector("[data-crop-zoom-output]");
  const formatInput = root.querySelector("[data-crop-format]");
  const qualityInput = root.querySelector("[data-crop-quality]");
  const qualityOutput = root.querySelector("[data-crop-quality-output]");
  const resetButton = root.querySelector("[data-crop-reset]");
  const downloadButton = root.querySelector("[data-crop-download]");
  const status = root.querySelector("[data-crop-status]");
  const canvas = root.querySelector("[data-crop-canvas]");
  const canvasWrap = root.querySelector("[data-crop-canvas-wrap]");
  const placeholder = root.querySelector("[data-crop-placeholder]");
  const context = canvas?.getContext("2d");

  if (!fileInput || !presetInput || !zoomInput || !canvas || !context) return;

  const presets = {
    gallery: { width: 1600, height: 1200, label: "文章／葉影帖" },
    home: { width: 1248, height: 1600, label: "首頁檔案卡" },
    keeper: { width: 1280, height: 1600, label: "園丁室" },
    square: { width: 1400, height: 1400, label: "方形頭像" },
    wide: { width: 1600, height: 900, label: "寬幅插圖" },
  };

  let image = null;
  let sourceName = "kusarium-image";
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let pointerX = 0;
  let pointerY = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const currentPreset = () => presets[presetInput.value] || presets.gallery;
  const zoom = () => Number(zoomInput.value) / 100;

  const resizeCanvas = () => {
    const preset = currentPreset();
    canvas.width = preset.width;
    canvas.height = preset.height;
    canvasWrap?.style.setProperty("--crop-aspect", `${preset.width} / ${preset.height}`);
  };

  const drawingMetrics = () => {
    if (!image) return null;
    const baseScale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const scale = baseScale * zoom();
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const centeredX = (canvas.width - width) / 2;
    const centeredY = (canvas.height - height) / 2;
    const x = clamp(centeredX + offsetX, canvas.width - width, 0);
    const y = clamp(centeredY + offsetY, canvas.height - height, 0);
    offsetX = x - centeredX;
    offsetY = y - centeredY;
    return { x, y, width, height };
  };

  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#efefef";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const metrics = drawingMetrics();
    if (!metrics) return;
    context.drawImage(image, metrics.x, metrics.y, metrics.width, metrics.height);
  };

  const resetView = () => {
    offsetX = 0;
    offsetY = 0;
    zoomInput.value = "100";
    zoomOutput.textContent = "100%";
    draw();
  };

  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      status.textContent = "請選擇圖片檔案。";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const nextImage = new Image();
    nextImage.onload = () => {
      URL.revokeObjectURL(objectUrl);
      image = nextImage;
      sourceName = file.name.replace(/\.[^.]+$/, "") || "kusarium-image";
      resizeCanvas();
      resetView();
      placeholder?.setAttribute("hidden", "");
      canvasWrap?.setAttribute("data-ready", "");
      resetButton.disabled = false;
      downloadButton.disabled = false;
      status.textContent = `${currentPreset().label} · 輸出 ${canvas.width} × ${canvas.height}px`;
    };
    nextImage.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      status.textContent = "這張圖片無法讀取，請改用 JPG、PNG 或 WebP。";
    };
    nextImage.src = objectUrl;
  };

  fileInput.addEventListener("change", () => loadFile(fileInput.files?.[0]));
  presetInput.addEventListener("change", () => {
    resizeCanvas();
    resetView();
    if (image) status.textContent = `${currentPreset().label} · 輸出 ${canvas.width} × ${canvas.height}px`;
  });
  zoomInput.addEventListener("input", () => {
    zoomOutput.textContent = `${zoomInput.value}%`;
    draw();
  });
  qualityInput?.addEventListener("input", () => {
    qualityOutput.textContent = `${qualityInput.value}%`;
  });
  resetButton?.addEventListener("click", resetView);

  canvas.addEventListener("pointerdown", (event) => {
    if (!image) return;
    dragging = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvasWrap?.setAttribute("data-dragging", "");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging || !image) return;
    const rect = canvas.getBoundingClientRect();
    offsetX += (event.clientX - pointerX) * (canvas.width / rect.width);
    offsetY += (event.clientY - pointerY) * (canvas.height / rect.height);
    pointerX = event.clientX;
    pointerY = event.clientY;
    draw();
  });
  const stopDragging = (event) => {
    if (!dragging) return;
    dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvasWrap?.removeAttribute("data-dragging");
  };
  canvas.addEventListener("pointerup", stopDragging);
  canvas.addEventListener("pointercancel", stopDragging);
  canvas.addEventListener("wheel", (event) => {
    if (!image) return;
    event.preventDefault();
    const nextZoom = clamp(Number(zoomInput.value) + (event.deltaY < 0 ? 5 : -5), 100, 300);
    zoomInput.value = String(nextZoom);
    zoomOutput.textContent = `${nextZoom}%`;
    draw();
  }, { passive: false });

  downloadButton?.addEventListener("click", () => {
    if (!image) return;
    const format = formatInput.value;
    const quality = Number(qualityInput.value) / 100;
    const extension = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
    status.textContent = "正在產生成品……";
    canvas.toBlob((blob) => {
      if (!blob) {
        status.textContent = "無法產生成品，請換一種檔案格式。";
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sourceName}-${presetInput.value}.${extension}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = `已下載 ${canvas.width} × ${canvas.height}px 成品；現在可以上傳至 CMS。`;
    }, format, quality);
  });

  resizeCanvas();
  draw();
})();
