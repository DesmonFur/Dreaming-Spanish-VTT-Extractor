chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.includes(".webvtt")) {
      chrome.storage.local.set({ latestVttUrl: details.url });
    }
  },
  { urls: ["<all_urls>"] }
);

chrome.action.onClicked.addListener(async (tab) => {
  const result = await chrome.storage.local.get(["latestVttUrl"]);
  const url = result.latestVttUrl;

  if (!url) {
    console.log("No VTT found.");
    return;
  }

  try {
    const displays = await chrome.system.display.getInfo();
    const {
      width,
      height,
      left: screenLeft,
      top: screenTop,
    } = displays[0].workArea;
    const videoWidth = Math.round(width * 0.6);
    const editorWidth = width - videoWidth;
    await chrome.windows.update(tab.windowId, {
      left: screenLeft,
      top: screenTop,
      width: videoWidth,
      height: height,
      state: "normal",
    });
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("utf-8");
    const rawText = decoder.decode(buffer);

    const cleanText = rawText
      .replace(/WEBVTT[\s\S]*?\n\n/g, "")
      .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/g, "")
      .replace(/^\d+\s*$/gm, "")
      .replace(/\n+/g, " ");

    const titleResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () =>
        document.querySelector("h1")?.innerText || "Dreaming Spanish Lesson",
    });
    const pageTitle = titleResults[0].result;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => navigator.clipboard.writeText(text),
      args: [cleanText],
    });

    chrome.windows.create(
      {
        url: "https://www.lingq.com/en/learn/es/web/editor/",
        left: screenLeft + videoWidth,
        top: screenTop,
        width: editorWidth,
        height: height,
        focused: true,
        type: "popup",
      },
      (newWindow) => {
        const newTab = newWindow.tabs[0];
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === newTab.id && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);

            chrome.scripting.executeScript({
              target: { tabId: newTab.id },
              func: (title, body) => {
                const waitFor = (selector) => {
                  return new Promise((resolve) => {
                    if (document.querySelector(selector))
                      return resolve(document.querySelector(selector));
                    const observer = new MutationObserver(() => {
                      if (document.querySelector(selector)) {
                        observer.disconnect();
                        resolve(document.querySelector(selector));
                      }
                    });
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true,
                    });
                  });
                };

                waitFor(".title-section input").then((input) => {
                  input.focus();
                  input.value = title;
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                });

                waitFor(".public-DraftEditor-content").then((editor) => {
                  editor.focus();

                  const pasteEvent = new ClipboardEvent("paste", {
                    bubbles: true,
                    cancelable: true,
                    clipboardData: new DataTransfer(),
                  });

                  pasteEvent.clipboardData.setData("text/plain", body);

                  editor.dispatchEvent(pasteEvent);
                });
              },
              args: [pageTitle, cleanText],
            });
          }
        });
      }
    );
  } catch (err) {
    console.error("Error:", err);
  }
});
