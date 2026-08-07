import {
  COMMANDER_COOKIE,
  verifyCommanderSession
} from './lyra.session.js';

function getCookie(req, name) {
  const cookieHeader = req.headers?.cookie || '';

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) return '';

  return decodeURIComponent(
    cookie.slice(name.length + 1)
  );
}

export function determineLyraProfile(req) {
  const sessionToken = getCookie(req, COMMANDER_COOKIE);
  const isCommander = verifyCommanderSession(sessionToken);

  if (isCommander) {
    return {
      profile: 'LYRA_COMMANDER',
      clearance: 'OMEGA',
      user: 'Commander Zach',
      isCommander: true
    };
  }

  return {
    profile: 'LYRA_STANDARD',
    clearance: 'STANDARD',
    user: 'Operator',
    isCommander: false
  };
}
