chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.url.includes(".webvtt")) {
      console.log("VTT Found:", details.url);
      chrome.storage.local.set({ latestVttUrl: details.url });
    }
  },
  { urls: ["<all_urls>"] }
);

chrome.action.onClicked.addListener(async (tab) => {
  const result = await chrome.storage.local.get(["latestVttUrl"]);
  const url = result.latestVttUrl;

  if (!url) {
    console.log("No VTT found yet.");
    return;
  }

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("utf-8");
    const rawText = decoder.decode(buffer);

    const cleanText = rawText
      .replace(/WEBVTT[\s\S]*?\n\n/g, "")
      .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/g, "")
      .replace(/^\d+\s*$/gm, "")
      .replace(/\n+/g, " ");

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied!");
      },
      args: [cleanText],
    });

    chrome.tabs.create({
      url: "https://www.lingq.com/en/learn/es/web/editor/",
    });
  } catch (err) {
    console.error("Error:", err);
  }
});
