const returnKey = 'ds:return-after-sign-in';

function isDashboardPath(pathname: string) {
  const clean = pathname.replace(/\/+$/, '');
  return clean === '/dashboard' || clean === '/dasboard';
}

export function saveReadingLink() {
  const url = new URL(window.location.href);
  const page = url.searchParams.get('page');
  const onDashboard = isDashboardPath(url.pathname) || page === 'dashboard';
  const onPrivateExams = page === 'exams';
  if (!onDashboard && !onPrivateExams) {
    try { window.sessionStorage.removeItem(returnKey); } catch { /* ignore */ }
    return;
  }
  const saved = new URLSearchParams();
  if (onDashboard) saved.set('path', '/dashboard');
  else saved.set('page', 'exams');
  try { window.sessionStorage.setItem(returnKey, saved.toString()); }
  catch { /* The course still opens when storage is unavailable. */ }
}

export function restoreReadingLink() {
  let saved: string | null;
  try {
    saved = window.sessionStorage.getItem(returnKey);
    window.sessionStorage.removeItem(returnKey);
  } catch { return; }
  if (!saved) return;
  const url = new URL(window.location.href);
  if (isDashboardPath(url.pathname) || url.searchParams.has('page')) return;
  const previous = new URLSearchParams(saved);
  if (previous.get('path') === '/dashboard') {
    url.pathname = '/dashboard';
  } else if (previous.get('page') === 'exams') {
    url.searchParams.set('page', 'exams');
  } else {
    return;
  }
  window.history.replaceState(window.history.state, '', url);
}
