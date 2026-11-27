import { type KeyboardEvent, type RefObject, useCallback, useEffect, useId, useRef, useState } from 'react';
import { listExamDashboardUsers, setExamUserAccess, USER_ACCESS_ROLES, type ExamDashboardUser, type UserAccessRole } from '../../lib/examAccess';

const roleLabels: Record<UserAccessRole, string> = { base: 'Base', privileged: 'Privileged', admin: 'Admin' };

function RolePicker({ email, role, disabled, trigger, onChange }: {
  email: string;
  role: UserAccessRole;
  disabled: boolean;
  trigger: RefObject<HTMLButtonElement | null>;
  onChange: (role: UserAccessRole) => void;
}) {
  const [placement, setPlacement] = useState<'above' | 'below' | null>(null);
  const picker = useRef<HTMLDivElement>(null);
  const options = useRef<HTMLDivElement>(null);
  const optionsId = useId();

  useEffect(() => {
    if (!placement) return;
    options.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus({ preventScroll: true });
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !picker.current?.contains(event.target)) setPlacement(null);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [placement]);

  function toggle(button: HTMLButtonElement) {
    if (placement) {
      setPlacement(null);
      return;
    }
    const { top, bottom } = button.getBoundingClientRect();
    const viewportTop = window.visualViewport?.offsetTop ?? 0;
    const viewportBottom = viewportTop + (window.visualViewport?.height ?? window.innerHeight);
    const roomForOptions = 150;
    setPlacement(viewportBottom - bottom < roomForOptions && top - viewportTop >= roomForOptions ? 'above' : 'below');
  }

  function close() {
    setPlacement(null);
    trigger.current?.focus({ preventScroll: true });
  }

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!placement) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || !options.current?.contains(document.activeElement)) return;
    const buttons = Array.from(options.current.querySelectorAll('button'));
    const current = buttons.findIndex((button) => button === document.activeElement);
    let next = current;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (event.key === 'ArrowDown') next = (current + 1) % buttons.length;
    if (event.key === 'ArrowUp') next = (current - 1 + buttons.length) % buttons.length;
    event.preventDefault();
    buttons[next]?.focus({ preventScroll: true });
  }

  return (
    <div className="admin-role-picker" ref={picker} onKeyDown={handleKey} onBlur={(event) => {
      if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setPlacement(null);
    }}>
      <button ref={trigger} type="button" className="ctrl-btn admin-role-trigger" disabled={disabled}
        aria-label={`Access for ${email}, ${roleLabels[role]}`} aria-expanded={Boolean(placement)} aria-controls={optionsId}
        onClick={(event) => toggle(event.currentTarget)}>
        {roleLabels[role]}
        <svg aria-hidden="true" viewBox="0 0 16 16" className="admin-role-chevron"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      <div ref={options} id={optionsId} className="admin-role-options" role="group" aria-label="Access level"
        data-placement={placement} hidden={!placement}>
        {USER_ACCESS_ROLES.map((option) => (
          <button key={option} type="button" aria-pressed={option === role} onClick={() => { onChange(option); close(); }}>
            {roleLabels[option]}
            {option === role && <span aria-hidden="true">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminUserRow({ user, isOwnAccount, hidden, onSave }: {
  user: ExamDashboardUser;
  isOwnAccount: boolean;
  hidden: boolean;
  onSave: (email: string, role: UserAccessRole) => Promise<void>;
}) {
  const [draft, setDraft] = useState<UserAccessRole | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const roleTrigger = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const role = draft ?? user.role;
  const changed = role !== user.role;
  const saving = status === 'saving';

  useEffect(() => {
    if (status === 'saved' && restoreFocus.current) {
      restoreFocus.current = false;
      roleTrigger.current?.focus({ preventScroll: true });
    }
  }, [status]);

  async function save(button: HTMLButtonElement) {
    if (!changed || saving) return;
    setStatus('saving');
    try {
      await onSave(user.email, role);
      restoreFocus.current = document.activeElement === button;
      setDraft(null);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <tr hidden={hidden}>
      <th scope="row" className="admin-user-email">
        {user.email}
        {isOwnAccount && <span className="admin-own-account">You</span>}
      </th>
      <td>
        <div className="admin-role-controls">
          {isOwnAccount ? (
            <span className="admin-role-current">{roleLabels[user.role]}</span>
          ) : (
            <RolePicker email={user.email} role={role} disabled={saving} trigger={roleTrigger} onChange={(option) => {
              setDraft(option);
              setStatus('idle');
            }} />
          )}
          {changed && (
            <button className="ctrl-btn active admin-row-save" type="button" aria-label={`Save access for ${user.email}`} aria-disabled={saving}
              onClick={(event) => void save(event.currentTarget)}>{saving ? 'Saving…' : 'Save'}</button>
          )}
        </div>
        <div role="status" className={status === 'error' ? 'admin-row-error' : 'sr-only'}>
          {status === 'error' ? 'Couldn’t save. Try again.' : status === 'saved' ? `Access saved for ${user.email}.` : ''}
        </div>
      </td>
    </tr>
  );
}

export function AdminDashboardPage({ userEmail }: { userEmail?: string }) {
  const [users, setUsers] = useState<ExamDashboardUser[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const search = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const ownEmail = userEmail?.trim().toLowerCase();
  const matchingCount = users?.filter(({ email }) => email.includes(normalizedQuery)).length ?? 0;

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoadError(false);
    try {
      const rows = await listExamDashboardUsers(signal);
      if (!signal?.aborted) setUsers(rows);
    } catch {
      if (!signal?.aborted) setLoadError(true);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  async function saveAccess(email: string, role: UserAccessRole) {
    await setExamUserAccess(email, role);
    setUsers((currentUsers) => currentUsers?.map((user) => user.email === email ? { ...user, role } : user) ?? null);
  }

  return (
    <article className="chapter-article admin-dashboard">
      <div className="chapter-running-head"><span>Discrete Structures (INHN0004)</span></div>
      <h1 className="chapter-title">Access Dashboard</h1>
      <div className="admin-users-toolbar">
        <div role="search" className="admin-search">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="admin-search-icon">
            <circle cx="8.5" cy="8.5" r="4.5" /><path d="m12 12 3.5 3.5" />
          </svg>
          <input ref={search} type="search" aria-label="Search emails" value={query} placeholder="Search emails…"
            autoComplete="off" spellCheck={false} onChange={(event) => setQuery(event.target.value)} />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); search.current?.focus(); }}>
              <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m4 4 8 8m0-8-8 8" /></svg>
            </button>
          )}
        </div>
        {users && (
          <span className="admin-user-count" role="status">
            {normalizedQuery ? `${matchingCount} of ${users.length}` : users.length} {users.length === 1 ? 'user' : 'users'}
          </span>
        )}
      </div>
      {loadError ? (
        <div className="admin-list-message" role="status">
          Couldn’t load users. <button type="button" className="ctrl-btn" onClick={() => void refresh()}>Retry</button>
        </div>
      ) : !users ? <div className="admin-list-message" role="status">Loading users…</div> : (
        <>
          {matchingCount === 0 && (
            <div className="admin-list-message" role="status">{users.length ? 'No matching emails.' : 'No registered users yet.'}</div>
          )}
          <table className="admin-users-table" aria-label="Registered users" hidden={matchingCount === 0}>
            <colgroup><col /><col className="admin-access-column" /></colgroup>
            <thead className="sr-only"><tr><th scope="col">Email</th><th scope="col">Access</th></tr></thead>
            <tbody>{users.map((user) => (
              <AdminUserRow key={user.email} user={user} isOwnAccount={user.email === ownEmail}
                hidden={!user.email.includes(normalizedQuery)} onSave={saveAccess} />
            ))}</tbody>
          </table>
        </>
      )}
    </article>
  );
}
