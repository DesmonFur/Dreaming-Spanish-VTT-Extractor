chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.url.includes(".webvtt")) {
      console.log("VTT Found:", details.url);
      chrome.storage.local.set({ latestVttUrl: details.url });
    }
  },
  { urls: ["<all_urls>"] }
);
