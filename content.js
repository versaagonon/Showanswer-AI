chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "showGeminiAnswer") {
      const answerBox = document.createElement("div");
      answerBox.innerText = "⏳ Processing answer...";
      answerBox.style.position = "fixed";
      answerBox.style.top = "100px";
      answerBox.style.left = "100px";
      answerBox.style.maxWidth = "400px";
      answerBox.style.background = "#fff";
      answerBox.style.color = "#000";
      answerBox.style.border = "1px solid #ccc";
      answerBox.style.padding = "10px";
      answerBox.style.borderRadius = "6px";
      answerBox.style.zIndex = 999999;
      answerBox.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      answerBox.className = "gemini-answer-popup";
      document.body.appendChild(answerBox);
  
      chrome.runtime.sendMessage({ action: "askGemini", text: msg.text }, (response) => {
        answerBox.innerText = response.answer;
      });
    }
  });
  
  (function unlockCopyAndRightClick() {
    const enableSelectAll = () => {
      const tags = document.querySelectorAll("*");
      tags.forEach(el => {
        el.style.userSelect = "text";
        el.style.webkitUserSelect = "text";
        el.style.msUserSelect = "text";
        el.style.MozUserSelect = "text";
        el.style.pointerEvents = "auto";
      });
    };
  
    const allowCopyEvent = (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };
  
    const blockedEvents = [
      "contextmenu", "copy", "cut", "paste",
      "mousedown", "mouseup", "keydown", "keyup",
      "selectstart", "dragstart"
    ];
  
    blockedEvents.forEach(evt => {
      document.addEventListener(evt, allowCopyEvent, true);
      window.addEventListener(evt, allowCopyEvent, true);
    });
  
    const removeInlineHandlers = () => {
      const tags = document.querySelectorAll("*");
      tags.forEach(el => {
        [
          "oncopy", "oncut", "onpaste", "onselectstart",
          "oncontextmenu", "onmousedown", "onmouseup", "ondragstart"
        ].forEach(attr => {
          if (el.hasAttribute(attr)) {
            el.setAttribute(attr, "");
          }
        });
      });
    };
  
    const observer = new MutationObserver(() => {
      enableSelectAll();
      removeInlineHandlers();
    });
  
    observer.observe(document, { childList: true, subtree: true });
  
    setTimeout(() => {
      enableSelectAll();
      removeInlineHandlers();
    }, 300);
  })();
  
  document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;
  
    chrome.runtime.sendMessage({ action: "askGemini", text: selectedText });
  });
  
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "showAnswerBox") {
      document.querySelectorAll(".gemini-answer-popup").forEach(el => el.remove());
  
      const box = document.createElement("div");
      box.innerText = msg.answer;
      box.className = "gemini-answer-popup";
      Object.assign(box.style, {
        position: "fixed",
        top: "100px",
        left: "100px",
        maxWidth: "400px",
        background: "#fff",
        color: "#000",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        zIndex: 999999
      });
      document.body.appendChild(box);
    }
  });
  