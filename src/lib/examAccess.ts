import { supabase } from './supabase';
import { EXAM_DOWNLOAD_ENDPOINT } from '../data/pastExams';

export const USER_ACCESS_ROLES = ['base', 'privileged', 'admin'] as const;
export type UserAccessRole = typeof USER_ACCESS_ROLES[number];

export interface ExamDashboardUser {
  email: string;
  role: UserAccessRole;
}

export async function fetchUserAccessRole(signal?: AbortSignal): Promise<UserAccessRole> {
  if (!supabase) return 'base';
  let rpcQuery = supabase.rpc('current_exam_role');
  if (signal) rpcQuery = rpcQuery.abortSignal(signal);
  const { data, error } = await rpcQuery;
  if (error) throw error;
  if (data === 'admin' || data === 'privileged') return data;
  return 'base';
}

export async function loadExamDownloadUrls(
  files: string[],
  expiresInSeconds = 3600,
): Promise<Map<string, string>> {
  if (!supabase || files.length === 0) return new Map();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) throw new Error('SIGN_IN_REQUIRED');
  const response = await fetch(EXAM_DOWNLOAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
    body: JSON.stringify({ files, expiresIn: expiresInSeconds }),
  });
  if (!response.ok) throw new Error('EXAM_DOWNLOADS_UNAVAILABLE');
  return new Map(Object.entries(await response.json() as Record<string, string>));
}

export async function listExamDashboardUsers(signal?: AbortSignal): Promise<ExamDashboardUser[]> {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
  const users: ExamDashboardUser[] = [];
  for (let from = 0; ; from += 500) {
    let query = supabase.rpc('list_exam_users').order('email').range(from, from + 499);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query;
    if (error) throw error;
    const page = (data ?? []) as ExamDashboardUser[];
    users.push(...page);
    if (page.length < 500) return users;
  }
}

export async function setExamUserAccess(email: string, role: UserAccessRole): Promise<void> {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
  const { error } = await supabase.rpc('set_exam_user_access', {
    target_email: email.trim().toLowerCase(),
    target_role: role,
  });
  if (error) throw error;
}
