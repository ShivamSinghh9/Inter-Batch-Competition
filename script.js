const content = document.querySelector(".content");
const buttons = document.querySelectorAll(".icon");
const rectBtn = document.querySelector(".rectangle");
const exportJsonBtn = document.querySelector(".json");
const exportHtmlBtn = document.querySelector(".html");
const clearBtn = document.querySelector(".clear");
let activeTool = null;
let selectedElement = null;
const layersList = document.querySelector(".layerslist");
let rectCount = 0;
let textCount = 0;
// TOOL SELECTION
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (
      btn.classList.contains("json") ||
      btn.classList.contains("html") ||
      btn.classList.contains("clear")
    ) {
      return;
    }
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    if (btn.classList.contains("rectangle")) activeTool = "rectangle";
    else if (btn.classList.contains("text")) activeTool = "text";
    else activeTool = null;
    if (activeTool === "text") createTextarea();
  });
});
// RECTANGLE
rectBtn.addEventListener("click", () => {
  const rect = document.createElement("div");
  rect.className = "rectangleshape";
  rect.style.left = Math.random() * 300 + "px";
  rect.style.top = Math.random() * 200 + "px";
  const handle = document.createElement("div");
  handle.className = "resizerect";
  rect.appendChild(handle);
  rect.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  // Select and Drag
  rect.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    select(rect);
    const sx = e.clientX;
    const sy = e.clientY;
    const sl = rect.offsetLeft;
    const st = rect.offsetTop;
    function drag(ev) {
      rect.style.left = sl + (ev.clientX - sx) + "px";
      rect.style.top = st + (ev.clientY - sy) + "px";
    }
    document.addEventListener("mousemove", drag);
    document.addEventListener(
      "mouseup",
      () => document.removeEventListener("mousemove", drag),
      { once: true },
    );
  });
  // Resize
  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    const sx = e.clientX;
    const sy = e.clientY;
    const sw = rect.offsetWidth;
    const sh = rect.offsetHeight;
    function resize(ev) {
      rect.style.width = Math.max(40, sw + (ev.clientX - sx)) + "px";
      rect.style.height = Math.max(30, sh + (ev.clientY - sy)) + "px";
    }
    document.addEventListener("mousemove", resize);
    document.addEventListener(
      "mouseup",
      () => document.removeEventListener("mousemove", resize),
      { once: true },
    );
  });
  content.appendChild(rect);
  rectCount++;
  const layerItem = document.createElement("li");
  layerItem.textContent = `Rectangle ${rectCount}`;
  layersList.appendChild(layerItem);
  layerItem.addEventListener("click", () => {
    select(rect);
    highlightLayer(layerItem);
  });
  rect.dataset.layerId = rectCount;
  rect.layerItem = layerItem;
});
// TEXTAREA
function createTextarea() {
  const textarea = document.createElement("textarea");
  textarea.className = "textarea";
  const rect = content.getBoundingClientRect();
  textarea.style.left = Math.random() * (rect.width - 200) + "px";
  textarea.style.top = Math.random() * (rect.height - 100) + "px";
  textarea.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  textarea.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    select(textarea);
    textarea.classList.add("dragging");
    const sx = e.clientX;
    const sy = e.clientY;
    const sl = textarea.offsetLeft;
    const st = textarea.offsetTop;
    function drag(ev) {
      textarea.style.left = sl + (ev.clientX - sx) + "px";
      textarea.style.top = st + (ev.clientY - sy) + "px";
    }
    function stop() {
      textarea.classList.remove("dragging");
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stop);
    }
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stop);
  });
  content.appendChild(textarea);
  textarea.focus();
  textCount++;
  const layerItem = document.createElement("li");
  layerItem.textContent = `Text ${textCount}`;
  layersList.appendChild(layerItem);
  layerItem.addEventListener("click", () => {
    select(textarea);
    highlightLayer(layerItem);
  });
  textarea.layerItem = layerItem;
}
// SELECTION
function select(el) {
  if (selectedElement) {
    selectedElement.classList.remove("selected");
    if (selectedElement.layerItem) {
      selectedElement.layerItem.classList.remove("active");
    }
  }
  el.classList.add("selected");
  selectedElement = el;
  if (el.layerItem) {
    highlightLayer(el.layerItem);
  }
}
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return "#000000";
  return (
    "#" + result.map((x) => parseInt(x).toString(16).padStart(2, "0")).join("")
  );
}
// DESELECT ON EMPTY CANVAS
content.addEventListener("click", () => {
  if (selectedElement) {
    selectedElement.classList.remove("selected");
    selectedElement = null;
  }
});
// DELETE KEY
document.addEventListener("keydown", (e) => {
  if (e.key === "Delete" && selectedElement) {
    if (selectedElement.layerItem) {
      selectedElement.layerItem.remove();
    }
    selectedElement.remove();
    selectedElement = null;
  }
});
// EXPORT JSON
exportJsonBtn.addEventListener("click", () => {
  const data = [];
  for (let el of content.children) {
    if (el.classList.contains("rectangleshape")) {
      data.push({
        type: "rectangle",
        x: el.offsetLeft,
        y: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    }
    if (el.tagName === "TEXTAREA") {
      data.push({
        type: "text",
        x: el.offsetLeft,
        y: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
        value: el.value,
      });
    }
  }
  const json = JSON.stringify(data, null, 2);
  downloadJSON(json);
});
function downloadJSON(data) {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "design.json";
  a.click();
  URL.revokeObjectURL(url);
}
// EXPORT HTML
exportHtmlBtn.addEventListener("click", () => {
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Exported Design</title>
<style>
  body { margin: 0; background: #1d1e20; }
  .canvas { position: relative; width: 100vw; height: 100vh; background: #232323; }
  .rect { position: absolute; background: #e3e0e0; }
  textarea {
    position: absolute;
    background: #1d1e20;
    color: white;
    border: 1px solid #aaa;
    resize: both;
    font-size: 16px;
    padding: 6px;
  }
</style>
</head>
<body>
<div class="canvas">
`;
  for (let el of content.children) {
    if (el.classList.contains("rectangleshape")) {
      html += `
<div class="rect" style="
  left:${el.offsetLeft}px;
  top:${el.offsetTop}px;
  width:${el.offsetWidth}px;
  height:${el.offsetHeight}px;
"></div>`;
    }
    if (el.tagName === "TEXTAREA") {
      const safeText = el.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      html += `
<textarea style="
  left:${el.offsetLeft}px;
  top:${el.offsetTop}px;
  width:${el.offsetWidth}px;
  height:${el.offsetHeight}px;
">${safeText}</textarea>`;
    }
  }
  html += `
</div>
</body>
</html>`;
  downloadHTML(html);
});
function downloadHTML(data) {
  const blob = new Blob([data], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "design.html";
  a.click();
  URL.revokeObjectURL(url);
}
// CLEAR CANVAS
clearBtn.addEventListener("click", () => {
  content.innerHTML = "";
  selectedElement = null;
  activeTool = null;
  buttons.forEach((btn) => btn.classList.remove("active"));
});
const toggleBtn = document.querySelector(".toggleicon");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});
const bgColorPicker = document.querySelector("#bgColorPicker");
bgColorPicker.addEventListener("input", (e) => {
  if (!selectedElement) return;
  if (selectedElement.classList.contains("rectangleshape")) {
    selectedElement.style.backgroundColor = e.target.value;
  }
  if (selectedElement.tagName === "TEXTAREA") {
    selectedElement.style.backgroundColor = e.target.value;
  }
});