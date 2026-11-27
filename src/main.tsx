import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './styles/book.css';
import { AuthSession, AuthLoading } from './components/auth/AuthSession';

function reloadAfterImportFailure() {
  const retryKey = 'ds:app-load-retry';
  const bundle = new URL(import.meta.url).pathname;
  try {
    if (sessionStorage.getItem(retryKey) === bundle) return false;
    sessionStorage.setItem(retryKey, bundle);
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

function AppLoadError() {
  return (
    <main className="auth-screen">
      <div className="auth-content">
        <p className="auth-loading" role="alert">The textbook could not load.</p>
        <button className="ctrl-btn app-retry" type="button" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    </main>
  );
}

const App = lazy<typeof import('./App').App>(() => import('./App').then(
  (module) => ({ default: module.App }),
  (error: unknown) => {
    if (reloadAfterImportFailure()) return { default: () => <AuthLoading /> };
    console.error('Could not load the textbook', error);
    return { default: AppLoadError };
  },
));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthSession>
      {({ user, signIn, signOut, signingIn, error }) => (
        <Suspense fallback={<AuthLoading />}>
          <App key={user?.id ?? 'guest'} onSignIn={signIn} onSignOut={signOut} signingIn={signingIn}
            accountError={error} userId={user?.id} userEmail={user?.email} />
        </Suspense>
      )}
    </AuthSession>
  </React.StrictMode>
);
