// URL Cleaner - popup logic
const inputUrl = document.getElementById("inputUrl");
const outputUrl = document.getElementById("outputUrl");
const cleanBtn = document.getElementById("cleanBtn");
const pasteBtn = document.getElementById("pasteBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const resultSection = document.getElementById("result");
const statsEl = document.getElementById("stats");

async function getCurrentTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url || "";
}

async function cleanInput() {
  const raw = inputUrl.value.trim();
  if (!raw) return;

  const result = cleanUrl(raw);
  outputUrl.value = result.cleaned;
  resultSection.classList.remove("hidden");

  if (result.removed.length) {
    statsEl.textContent = `Removed ${result.removed.length} tracking parameter${result.removed.length > 1 ? "s" : ""}: ${result.removed.join(", ")}`;
  } else {
    statsEl.textContent = "No tracking parameters found — URL was already clean.";
  }
}

async function pasteAndClean() {
  try {
    const text = await navigator.clipboard.readText();
    inputUrl.value = text;
    cleanInput();
  } catch (e) {
    const url = await getCurrentTabUrl();
    inputUrl.value = url;
    cleanInput();
  }
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(outputUrl.value);
    copyBtn.textContent = "Copied!";
    setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
  } catch (e) {
    outputUrl.select();
    document.execCommand("copy");
  }
}

function clearAll() {
  inputUrl.value = "";
  outputUrl.value = "";
  resultSection.classList.add("hidden");
  inputUrl.focus();
}

// Load current tab URL as default
window.addEventListener("DOMContentLoaded", async () => {
  const url = await getCurrentTabUrl();
  if (url && !url.startsWith("chrome://") && !url.startsWith("about:")) {
    inputUrl.value = url;
    cleanInput();
  }
});

cleanBtn.addEventListener("click", cleanInput);
pasteBtn.addEventListener("click", pasteAndClean);
copyBtn.addEventListener("click", copyOutput);
clearBtn.addEventListener("click", clearAll);
inputUrl.addEventListener("input", () => {
  if (inputUrl.value.trim()) cleanInput();
});