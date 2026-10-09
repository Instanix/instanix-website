import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@ix/i18n";

/**
 * Runs before first paint so the persisted theme never flashes.
 * Static string, no user input — safe to inline. Needs a nonce once CSP lands.
 */
export const themeInitScript = `(function(){var d=document.documentElement,t="${DEFAULT_THEME}";try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");if(s==="light"||s==="dark")t=s}catch(e){}d.dataset.theme=t})()`;
