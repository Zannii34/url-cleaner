// URL Cleaner - background service worker
importScripts("lib/cleaner.js");

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "clean-link",
    title: "Clean this URL",
    contexts: ["link"]
  });
  chrome.contextMenus.create({
    id: "clean-page",
    title: "Clean this page's URL",
    contexts: ["page"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let targetUrl = null;

  if (info.menuItemId === "clean-link") {
    targetUrl = info.linkUrl;
  } else if (info.menuItemId === "clean-page") {
    targetUrl = tab?.url;
  }

  if (!targetUrl) return;

  const result = cleanUrl(targetUrl);

  // Copy to clipboard
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => navigator.clipboard.writeText(text),
      args: [result.cleaned]
    });
    showNotification(result);
  } catch (e) {
    console.error("Clipboard write failed:", e);
    showNotification(result, true);
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "clean-current-url") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  const result = cleanUrl(tab.url);

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => navigator.clipboard.writeText(text),
      args: [result.cleaned]
    });
    showNotification(result);
  } catch (e) {
    console.error(e);
  }
});

function showNotification(result, manualCopy = false) {
  const parts = [];
  if (result.removed.length) {
    parts.push(`Removed ${result.removed.length} tracker${result.removed.length > 1 ? "s" : ""}`);
  } else {
    parts.push("Already clean");
  }
  parts.push(manualCopy ? "Copy from console" : "Copied to clipboard");

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "URL Cleaner",
    message: parts.join(" — "),
    silent: true
  });

  if (manualCopy) {
    console.log("Cleaned URL:", result.cleaned);
  }
}