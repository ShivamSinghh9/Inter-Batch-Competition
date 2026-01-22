const content = document.querySelector(".content");
const buttons = document.querySelectorAll(".icon");
const rectBtn = document.querySelector(".rectangle");
const exportJsonBtn = document.querySelector(".json");
const exportHtmlBtn = document.querySelector(".html");
const clearBtn = document.querySelector(".clear");
const layersList = document.querySelector(".layerslist");
const toggleBtn = document.querySelector(".toggleicon");
const bgColorPicker = document.querySelector("#bgColorPicker");

let selectedElement = null;
let activeTool = null;
let rectCount = 0;
let textCount = 0;

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (
      btn.classList.contains("json") ||
      btn.classList.contains("html") ||
      btn.classList.contains("clear")
    )
      return;
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    if (btn.classList.contains("rectangle")) activeTool = "rectangle";
    else if (btn.classList.contains("text")) {
      activeTool = "text";
      createTextarea();
    } else activeTool = null;
  });
});
function select(el) {
  if (selectedElement) {
    selectedElement.classList.remove("selected");
    selectedElement.layerItem?.classList.remove("active");
  }
  selectedElement = el;
  el.classList.add("selected");
  el.layerItem?.classList.add("active");
}
content.addEventListener("mousedown", (e) => {
  if (e.target === content && selectedElement) {
    selectedElement.classList.remove("selected");
    selectedElement.layerItem?.classList.remove("active");
    selectedElement = null;
  }
});
function makeDraggable(el) {
  el.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    select(el);
    const sx = e.clientX;
    const sy = e.clientY;
    const sl = el.offsetLeft;
    const st = el.offsetTop;
    function drag(ev) {
      el.style.left = sl + (ev.clientX - sx) + "px";
      el.style.top = st + (ev.clientY - sy) + "px";
    }
    function stop() {
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stop);
    }
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stop);
  });
}
rectBtn.addEventListener("click", () => {
  const rect = document.createElement("div");
  rect.className = "rectangleshape";
  rect.style.left = "80px";
  rect.style.top = "80px";
  const handle = document.createElement("div");
  handle.className = "resizerect";
  rect.appendChild(handle);
  makeDraggable(rect);
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
  const li = document.createElement("li");
  li.textContent = `Rectangle ${rectCount}`;
  layersList.appendChild(li);
  rect.layerItem = li;
  li.addEventListener("click", () => select(rect));
});
function createTextarea() {
  const textarea = document.createElement("textarea");
  textarea.className = "textarea";
  textarea.style.left = "120px";
  textarea.style.top = "120px";
  makeDraggable(textarea);
  content.appendChild(textarea);
  textarea.focus();
  textCount++;
  const li = document.createElement("li");
  li.textContent = `Text ${textCount}`;
  layersList.appendChild(li);
  textarea.layerItem = li;
  li.addEventListener("click", () => select(textarea));
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Delete" && selectedElement) {
    selectedElement.layerItem?.remove();
    selectedElement.remove();
    selectedElement = null;
  }
});
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
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "design.json";
  a.click();
});
exportHtmlBtn.addEventListener("click", () => {
  let html = `<html><body style="margin:0"><div style="position:relative;height:100vh">`;
  for (let el of content.children) {
    if (el.classList.contains("rectangleshape")) {
      html += `<div style="position:absolute;
        left:${el.offsetLeft}px;
        top:${el.offsetTop}px;
        width:${el.offsetWidth}px;
        height:${el.offsetHeight}px;
        background:#e3e0e0"></div>`;
    }
    if (el.tagName === "TEXTAREA") {
      html += `<textarea style="position:absolute;
        left:${el.offsetLeft}px;
        top:${el.offsetTop}px;
        width:${el.offsetWidth}px;
        height:${el.offsetHeight}px;">${el.value}</textarea>`;
    }
  }
  html += `</div></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "design.html";
  a.click();
});
clearBtn.addEventListener("click", () => {
  content.innerHTML = "";
  layersList.innerHTML = "";
  selectedElement = null;
  rectCount = 0;
  textCount = 0;
  buttons.forEach((b) => b.classList.remove("active"));
});
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});
bgColorPicker.addEventListener("input", (e) => {
  if (!selectedElement) return;
  selectedElement.style.backgroundColor = e.target.value;
});
