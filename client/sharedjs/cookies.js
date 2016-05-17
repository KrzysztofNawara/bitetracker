/* Maximum cross-browser value for 'expire' parameter */
export const NEVER = new Date('Tue, 19 Jan 2038 03:14:07 GMT');

export function cookiesEnabled() {
  document.cookie = "testcookie";
  return document.cookie.indexOf("testcookie") != -1;
}

export function ensureCookiesEnabled(onEnabled) {
  if(cookiesEnabled()) {
    onEnabled();
  } else {
    document.write('You must enable cookies for this application to work');
  }
}
