/**
 * URL Cleaner - core logic
 * Removes common tracking parameters from URLs
 */

const TRACKING_PARAMS = [
  // UTM parameters
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "utm_name", "utm_reader", "utm_referrer", "utm_social",
  "utm_social-type", "utm_visitor",
  // Facebook
  "fbclid", "fb_action_ids", "fb_action_types", "fb_ref", "fb_source",
  "fbc", "fbp", "refsrc",
  // Google
  "gclid", "gclsrc", "dclid", "gbraid", "wbraid",
  // Mailchimp
  "mc_cid", "mc_eid",
  // HubSpot
  "_hsenc", "_hsmi", "__hssc", "__hstc", "__hsfp", "hsCtaTracking",
  // Marketo
  "mkt_tok",
  // Yandex
  "_openstat", "yclid",
  // Instagram
  "igshid",
  // TikTok
  "ttclid",
  // Microsoft / Bing
  "msclkid",
  // Twitter / X
  "twclid",
  // LinkedIn
  "lipi", "trk", "trackingId", "refId",
  // Adobe
  "s_cid", "s_kwcid",
  // Mailgun / email
  "spm", "scm",
  // Misc trackers
  "ref", "ref_src", "ref_url", "source", "campaign",
  "feature", "share_id", "share_source",
  "icid", "vero_id", "vero_conv",
  "_ga", "_gl", "wickedid",
  "smid", "partner", "partnerId",
  "cid", "eid", "sid", "uid",
  "utm", "fbclid", "gclid",
];

const TRACKING_PREFIXES = [
  "utm_",
  "pk_",
  "mtm_",
  "at_",
  "trk_",
  "hsa_",
  "matomo_",
];

function isTrackingParam(name) {
  const lower = name.toLowerCase();
  if (TRACKING_PARAMS.includes(lower)) return true;
  return TRACKING_PREFIXES.some(p => lower.startsWith(p));
}

function cleanUrl(rawUrl) {
  if (!rawUrl) return { cleaned: rawUrl, removed: [] };

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { cleaned: rawUrl, removed: [] };
  }

  const removed = [];
  const keysToDelete = [];

  for (const [key] of url.searchParams) {
    if (isTrackingParam(key)) {
      keysToDelete.push(key);
    }
  }

  for (const key of keysToDelete) {
    removed.push(key);
    url.searchParams.delete(key);
  }

  // Remove trailing "?" if no params remain
  let cleaned = url.toString();
  cleaned = cleaned.replace(/\\?$/, "");

  return { cleaned, removed };
}

if (typeof module !== "undefined") {
  module.exports = { cleanUrl, isTrackingParam, TRACKING_PARAMS };
}
if (typeof self !== "undefined") {
  self.cleanUrl = cleanUrl;
  self.isTrackingParam = isTrackingParam;
}