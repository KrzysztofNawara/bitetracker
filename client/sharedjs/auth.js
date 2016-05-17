
const Cookies = require('js-cookie');
const CookieHelper = require('./cookies');
const ex = require('./exceptions').createException;

const LOCAL_AUTH_URL = '/auth/local';
const USERID_COOKIE_NAME = 'user';
const REDIRURL_COOKIE_NAME = 'redirUrl';

export const EX = {
  INCORRECT_CREDENTIALS: 'INCORRECT_CREDENTIALS',
  NETWORK: 'NETWORK',
  UNKNOWN: 'UNKNOWN'
};
/**
 * Attempts to contact login service.
 * Service is expected to return 200 with reponse {redirectUrl: <rootRelativeUrl>, userId: <>} or 403
 *
 * @param {String} username
 * @param {String} passwd - plaintest passowrd
 * @returns {Promise} resolve(response payload), reject(Error(reason for failure))
 * Error type (err.name):
 * * INCORRECT_CREDENTIALS
 * * NETWORK - communication with server wasn't successfull
 * * UNKNOWN - response was received, but authentication failed
 */
export function login(username, passwd) {
  return fetch(LOCAL_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: passwd
      })
    })
    .catch(ex => {
      throw ex(EX.NETWORK, 'Cannot contact server: ' + ex.message);
    })
    .then(response => {
      if(response.status == 200) {
        return response;
      } else if(response.status == 403) {
        throw ex(EX.INCORRECT_CREDENTIALS, response.status);
      } else {
        throw ex(EX.UNKNOWN, response.status);
      }
    })
    /* response.json() returns promise, but we will need both json and original response later */
    .then(response => Promise.all([Promise.resolve(response), response.json().catch(err => {throw ex(EX.UNKNOWN, 'payload parsing error')})]))
    .then(([_, json]) => {
      if(!json.hasOwnProperty('userId') || !json.hasOwnProperty('redirectUrl'))
        throw ex(EX.UNKNOWN, 'malformed response payload: ' + JSON.stringify(json));
      else
        return [_, json];
    })
    .then(([_, json]) => {
      Cookies.set(USERID_COOKIE_NAME, json.userId, {expires: CookieHelper.NEVER});
      Cookies.set(REDIRURL_COOKIE_NAME, json.redirectUrl, {expires: CookieHelper.NEVER});

      return [_, json];
    });
}

/**
 * Checks whether 'user' cookie is present and non-empty, returning either true or false
 */
export function isCookiePresent() {
  const cookie = Cookies.get(USERID_COOKIE_NAME);
  return cookie != undefined && cookie != '';
}

export function getCachedRedirectionUrl() {
  return Cookies.get(REDIRURL_COOKIE_NAME);
}
