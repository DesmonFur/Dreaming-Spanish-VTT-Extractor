document.getElementById("snatchBtn").addEventListener("click", async () => {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = "Processing...";

  chrome.storage.local.get(["latestVttUrl"], async (result) => {
    const url = result.latestVttUrl;
    if (!url) {
      statusDiv.textContent = "No VTT found! Refresh page.";
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

      await navigator.clipboard.writeText(cleanText);

      chrome.tabs.create({
        url: "https://www.lingq.com/en/learn/es/web/editor/",
      });
      statusDiv.textContent = "Copied! Opening LingQ...";
    } catch (err) {
      statusDiv.textContent = "Error: " + err.message;
    }
  });
});
