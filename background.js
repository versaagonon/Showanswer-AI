
chrome.runtime.onInstalled.addListener(() => {
  console.log("Gemini Helper installed. Ready to go.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "askGemini") {
    fetch("http://localhost:3000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message.text })
    })
      .then(res => res.json())
      .then(data => {
        const answer = data.answer || " No answer available.";

        if (sender.tab && sender.tab.id !== undefined) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "showAnswerBox",
            answer: answer
          });
        } else if (sender.frameId !== undefined && sender.documentId) {
          chrome.webNavigation.getAllFrames({ tabId: sender.tab.id }, (frames) => {
            const targetFrame = frames.find(f => f.frameId === sender.frameId);
            if (targetFrame) {
              chrome.tabs.sendMessage(sender.tab.id, {
                action: "showAnswerBox",
                answer: answer
              }, { frameId: sender.frameId });
            }
          });
        } else {
          console.warn("Failed to send answer to content script because tab or frame not found.");
        }
      })
      .catch(err => {
        if (sender.tab && sender.tab.id !== undefined) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "showAnswerBox",
            answer: "Error: " + err.message
          });
        }
      });
    return true;
  }
});

// Inject bypass copy and right-click protections
document.addEventListener("DOMContentLoaded", () => {
  const unlockCopy = () => {
    const tags = document.querySelectorAll("*");
    tags.forEach(el => {
      el.style.userSelect = "text";
      el.style.webkitUserSelect = "text";
      el.style.msUserSelect = "text";
      el.style.MozUserSelect = "text";
      el.style.pointerEvents = "auto";
    });
  };

  const bypassEvents = (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  const events = [
    "contextmenu", "copy", "cut", "paste",
    "mousedown", "mouseup", "keydown", "keyup",
    "selectstart", "dragstart"
  ];

  events.forEach(evt => {
    document.addEventListener(evt, bypassEvents, true);
    window.addEventListener(evt, bypassEvents, true);
  });

  const cleanHandlers = () => {
    document.querySelectorAll("*").forEach(el => {
      [
        "oncopy", "oncut", "onpaste", "onselectstart",
        "oncontextmenu", "onmousedown", "onmouseup", "ondragstart"
      ].forEach(attr => {
        if (el.hasAttribute(attr)) el.setAttribute(attr, "");
      });
    });
  };

  const observer = new MutationObserver(() => {
    unlockCopy();
    cleanHandlers();
  });

  observer.observe(document, { childList: true, subtree: true });

  setTimeout(() => {
    unlockCopy();
    cleanHandlers();
  }, 300);
});
