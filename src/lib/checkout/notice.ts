const KEY = "dp-checkout-notice";

// A message from checkout that must survive the page change (a gateway redirect or the move to
// the confirmation page), for example "FIRSTTIMEOFFER was removed: this offer is valid on your
// first order only". It lives in sessionStorage so it survives a full page load; the value read
// is cached for the page so the same text is shown on every render.

let cached: string | null | undefined;

const subscribeNothing = () => () => {};

/** Saves (or clears) the notice for the next page. */
export function rememberNotice(notice: string | undefined) {
  cached = undefined;
  try {
    if (notice) window.sessionStorage.setItem(KEY, notice);
    else window.sessionStorage.removeItem(KEY);
  } catch {
    // Storage can be unavailable (private mode); the notice is then simply not shown.
  }
}

function readNotice(): string | null {
  if (cached === undefined) {
    try {
      cached = window.sessionStorage.getItem(KEY);
    } catch {
      cached = null;
    }
  }
  return cached;
}

/** Forgets the stored notice so a reload does not show it again; the page keeps what it read. */
export function forgetNotice() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to forget.
  }
}

/** For useSyncExternalStore: the notice in the browser, null while rendering on the server. */
export const noticeStore = {
  subscribe: subscribeNothing,
  getSnapshot: readNotice,
  getServerSnapshot: (): string | null => null,
};
