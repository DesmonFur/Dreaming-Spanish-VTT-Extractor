# 🇪🇸 Dreaming Spanish Transcript Snatcher

A specialized Chrome Extension for language learners that extracts, decodes, and formats subtitles from the Dreaming Spanish platform for use in LingQ and other study tools.

## 🛑 The Problem

Dreaming Spanish uses the **Shaka Player** to stream video content. Unlike standard HTML5 video players:

1.  **No Accessibility:** Subtitles are streamed as binary chunks, not a simple download link.
2.  **Encoding Errors:** The raw `.webvtt` stream is often served with `Windows-1252` encoding instead of `UTF-8`. If you try to copy it manually, special characters (like `ñ` or `é`) break (becoming `Ã±` or `Ã©`).
3.  **Formatting Noise:** The raw text is full of timestamps and header metadata that ruins the reading experience.

## ⚡ The Solution

This extension intercepts the network traffic at the browser level to:

- **Sniff:** Listens for `webRequest` signals matching the `.webvtt` MIME type.
- **Decode:** Uses the JavaScript `TextDecoder` API to force-decode the binary buffer into clean UTF-8 Spanish text.
- **Sanitize:** Applies Regex to strip timestamps, `WEBVTT` headers, and line numbers.
- **Automate:** Copies the clean text to the clipboard and automatically opens the LingQ import page for a seamless study workflow.

## 🚀 How to Install (Developer Mode)

Since this is a custom tool, you install it as an "Unpacked Extension":

1.  Clone or download this repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Toggle **Developer mode** (top right switch).
4.  Click **Load unpacked**.
5.  Select the folder containing this project.

## 🛠 Usage

1.  Open any video on the [Dreaming Spanish](https://www.dreamingspanish.com) website.
2.  **Refresh the page** (essential so the extension can catch the initial network request).
3.  **Click the Extension Icon** (subtitles logo) in your browser toolbar.
    - _Note: There is no menu. The script runs immediately upon clicking the icon._
4.  A new **LingQ Import** tab will open automatically.
5.  Click the text box, Paste (`Ctrl+V`), and Save!

## 💻 Tech Stack

- **JavaScript (ES6+)**
- **Chrome Extension API (Manifest V3)**
- **TextDecoder API** (Binary Stream Handling)
- **Regex** (Data Cleaning)

# Dreaming-Spanish-VTT-Extractor
