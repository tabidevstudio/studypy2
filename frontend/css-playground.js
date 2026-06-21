/**
 * css-playground.js - Interactive controls for CSS Layout and CSS Clip-Path sandboxes.
 */

// Tab Mode Switching
function initModeTabs() {
  const btnLayout = document.getElementById("btn-mode-layout");
  const btnClipPath = document.getElementById("btn-mode-clippath");
  const secLayout = document.getElementById("section-layout");
  const secClipPath = document.getElementById("section-clippath");

  if (!btnLayout || !btnClipPath) return;

  btnLayout.addEventListener("click", () => {
    btnLayout.classList.add("active");
    btnClipPath.classList.remove("active");
    secLayout.classList.add("active");
    secClipPath.classList.remove("active");
  });

  btnClipPath.addEventListener("click", () => {
    btnClipPath.classList.add("active");
    btnLayout.classList.remove("active");
    secClipPath.classList.add("active");
    secLayout.classList.remove("active");
  });
}

// ---------------------------------------------------------------------------
// 1. CSS Layout Playground Controller
// ---------------------------------------------------------------------------
function initLayoutPlayground() {
  const container = document.getElementById("layout-sandbox-container");
  const flexToggle = document.getElementById("layout-mode-flex");
  const gridToggle = document.getElementById("layout-mode-grid");
  const flexControls = document.getElementById("controls-flex");
  const gridControls = document.getElementById("controls-grid");

  // Inputs
  const flexDirSelect = document.getElementById("flex-direction");
  const flexJustSelect = document.getElementById("flex-justify");
  const flexAlignSelect = document.getElementById("flex-align");
  const flexWrapSelect = document.getElementById("flex-wrap");

  const gridColsSelect = document.getElementById("grid-columns");
  const gridJustSelect = document.getElementById("grid-justify");
  const gridAlignSelect = document.getElementById("grid-align");

  const gapRange = document.getElementById("layout-gap");
  const gapVal = document.getElementById("gap-val");

  const btnAddItem = document.getElementById("btn-add-item");
  const btnRemoveItem = document.getElementById("btn-remove-item");
  const codeOutput = document.getElementById("code-layout-output");
  const copyBtn = document.getElementById("btn-copy-layout-code");

  if (!container) return;

  let mode = "flex"; // "flex" or "grid"

  function updateLayout() {
    const gap = gapRange.value;
    gapVal.textContent = `${gap}px`;

    if (mode === "flex") {
      const dir = flexDirSelect.value;
      const justify = flexJustSelect.value;
      const align = flexAlignSelect.value;
      const wrap = flexWrapSelect.value;

      container.className = "layout-container flex-mode";
      container.style.display = "flex";
      container.style.flexDirection = dir;
      container.style.justifyContent = justify;
      container.style.alignItems = align;
      container.style.flexWrap = wrap;
      container.style.gap = `${gap}px`;

      // Reset Grid styles
      container.style.gridTemplateColumns = "";
      container.style.justifyItems = "";

      codeOutput.textContent = `.container {
  display: flex;
  flex-direction: ${dir};
  justify-content: ${justify};
  align-items: ${align};
  flex-wrap: ${wrap};
  gap: ${gap}px;
}`;
    } else {
      const cols = gridColsSelect.value;
      const justify = gridJustSelect.value;
      const align = gridAlignSelect.value;

      container.className = "layout-container grid-mode";
      container.style.display = "grid";
      container.style.gridTemplateColumns = cols;
      container.style.justifyItems = justify;
      container.style.alignItems = align;
      container.style.gap = `${gap}px`;

      // Reset Flex styles
      container.style.flexDirection = "";
      container.style.justifyContent = "";
      container.style.flexWrap = "";

      codeOutput.textContent = `.container {
  display: grid;
  grid-template-columns: ${cols};
  justify-items: ${justify};
  align-items: ${align};
  gap: ${gap}px;
}`;
    }
  }

  // Event Listeners for selects and sliders
  const controls = [
    flexDirSelect, flexJustSelect, flexAlignSelect, flexWrapSelect,
    gridColsSelect, gridJustSelect, gridAlignSelect, gapRange
  ];
  controls.forEach(ctrl => ctrl?.addEventListener("change", updateLayout));
  gapRange?.addEventListener("input", updateLayout);

  // Layout mode toggles
  flexToggle?.addEventListener("click", () => {
    mode = "flex";
    flexToggle.classList.add("active");
    gridToggle.classList.remove("active");
    flexControls.classList.remove("hidden");
    gridControls.classList.add("hidden");
    updateLayout();
  });

  gridToggle?.addEventListener("click", () => {
    mode = "grid";
    gridToggle.classList.add("active");
    flexToggle.classList.remove("active");
    gridControls.classList.remove("hidden");
    flexControls.classList.add("hidden");
    updateLayout();
  });

  // Adding / Removing boxes
  btnAddItem?.addEventListener("click", () => {
    const boxCount = container.children.length;
    if (boxCount >= 12) return; // limit boxes to keep layout clean
    const box = document.createElement("div");
    box.className = "layout-box";
    box.textContent = boxCount + 1;
    container.appendChild(box);
    updateLayout();
  });

  btnRemoveItem?.addEventListener("click", () => {
    if (container.children.length <= 1) return; // keep at least one
    container.removeChild(container.lastElementChild);
    updateLayout();
  });

  // Copy code utility
  copyBtn?.addEventListener("click", () => {
    navigator.clipboard.writeText(codeOutput.textContent.trim());
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = "<i class='bx bx-check'></i> Copied!";
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2000);
  });

  // Init default layout
  updateLayout();
}

// ---------------------------------------------------------------------------
// 2. CSS Clip-Path Maker Controller
// ---------------------------------------------------------------------------
function initClipPathMaker() {
  const canvas = document.getElementById("clip-interactive-canvas");
  const targetImg = document.getElementById("clip-target-img");
  const polyPreview = document.getElementById("clip-poly-preview");
  const presetSelect = document.getElementById("clip-preset");
  const customVerticesWrap = document.getElementById("custom-vertices-wrap");
  const customVerticesRange = document.getElementById("custom-vertices");
  const verticesVal = document.getElementById("vertices-count-val");
  const codeOutput = document.getElementById("code-clip-output");
  const copyBtn = document.getElementById("btn-copy-clip-code");

  if (!canvas || !targetImg) return;

  const shapePresets = {
    triangle: [[50, 0], [0, 100], [100, 100]],
    trapezoid: [[20, 0], [80, 0], [100, 100], [0, 100]],
    pentagon: [[50, 0], [100, 38], [82, 100], [18, 100], [0, 38]],
    hexagon: [[50, 0], [100, 25], [100, 75], [50, 100], [0, 75], [0, 25]],
    star: [[50, 0], [61, 35], [98, 35], [68, 57], [79, 91], [50, 70], [21, 91], [32, 57], [2, 35], [39, 35]],
    custom: [[10, 10], [90, 10], [90, 90], [10, 90]]
  };

  let points = [...shapePresets.custom]; // Active polygon coordinates as percentage array [[x,y], [x,y]...]
  let activeHandle = null;

  // Initialize custom points dynamically based on count
  function setCustomPointsCount(count) {
    const radius = 40; // percentage radius
    const cx = 50, cy = 50; // center point percentages
    const newPoints = [];

    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2; // start from top
      const x = Math.round(cx + radius * Math.cos(angle));
      const y = Math.round(cy + radius * Math.sin(angle));
      newPoints.push([x, y]);
    }
    points = newPoints;
  }

  function renderHandles() {
    // Remove existing handle elements
    canvas.querySelectorAll(".clip-drag-handle").forEach(el => el.remove());

    points.forEach((pt, index) => {
      const handle = document.createElement("div");
      handle.className = "clip-drag-handle";
      handle.style.left = `${pt[0]}%`;
      handle.style.top = `${pt[1]}%`;
      handle.dataset.index = index;
      
      // Dragging events (Mouse & Touch support)
      handle.addEventListener("mousedown", dragStart);
      handle.addEventListener("touchstart", dragStart, { passive: false });

      canvas.appendChild(handle);
    });
  }

  function updateClipping() {
    // Reconstruct polygon point strings
    const pctString = points.map(pt => `${pt[0]}% ${pt[1]}%`).join(", ");
    
    // Apply styling
    targetImg.style.clipPath = `polygon(${pctString})`;

    // Update SVG overlay polygon points for visualization
    const rect = canvas.getBoundingClientRect();
    const svgPoints = points.map(pt => {
      const pxX = (pt[0] / 100) * rect.width;
      const pxY = (pt[1] / 100) * rect.height;
      return `${pxX},${pxY}`;
    }).join(" ");
    
    polyPreview.setAttribute("points", svgPoints);

    // Update code output text
    codeOutput.textContent = `.clipped-element {
  clip-path: polygon(${pctString});
}`;

    // Update position of handle elements visually
    const handles = canvas.querySelectorAll(".clip-drag-handle");
    handles.forEach((handle, i) => {
      handle.style.left = `${points[i][0]}%`;
      handle.style.top = `${points[i][1]}%`;
    });
  }

  function dragStart(e) {
    e.preventDefault();
    activeHandle = e.currentTarget;
    document.addEventListener("mousemove", dragMove);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("touchmove", dragMove, { passive: false });
    document.addEventListener("touchend", dragEnd);
    activeHandle.classList.add("dragging");
  }

  function dragMove(e) {
    if (!activeHandle) return;
    
    // Support touch details if active
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = canvas.getBoundingClientRect();
    
    // Compute percentage relative to canvas box
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;

    // Clamp coordinates inside bounds (0% to 100%)
    x = Math.max(0, Math.min(100, Math.round(x)));
    y = Math.max(0, Math.min(100, Math.round(y)));

    const index = parseInt(activeHandle.dataset.index);
    points[index] = [x, y];

    updateClipping();
  }

  function dragEnd() {
    if (activeHandle) {
      activeHandle.classList.remove("dragging");
    }
    activeHandle = null;
    document.removeEventListener("mousemove", dragMove);
    document.removeEventListener("mouseup", dragEnd);
    document.removeEventListener("touchmove", dragMove);
    document.removeEventListener("touchend", dragEnd);
  }

  // Handles shape switching dropdown
  presetSelect.addEventListener("change", () => {
    const shape = presetSelect.value;

    if (shape === "custom") {
      customVerticesWrap.classList.remove("hidden");
      setCustomPointsCount(parseInt(customVerticesRange.value));
    } else {
      customVerticesWrap.classList.add("hidden");
      points = [...shapePresets[shape]];
    }

    renderHandles();
    updateClipping();
  });

  // Handles Custom shape vertices counts slider
  customVerticesRange.addEventListener("input", () => {
    const count = parseInt(customVerticesRange.value);
    verticesVal.textContent = count;
    setCustomPointsCount(count);
    renderHandles();
    updateClipping();
  });

  // Re-adjust SVG rendering on window resizing
  window.addEventListener("resize", updateClipping);

  // Copy code utility
  copyBtn?.addEventListener("click", () => {
    navigator.clipboard.writeText(codeOutput.textContent.trim());
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = "<i class='bx bx-check'></i> Copied!";
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2000);
  });

  // Initialize
  points = [...shapePresets.custom];
  renderHandles();
  // Delay slightly to wait for DOM nodes to complete loading their bounding rects
  setTimeout(updateClipping, 200);
}

// Global initialization
initModeTabs();
initLayoutPlayground();
initClipPathMaker();
