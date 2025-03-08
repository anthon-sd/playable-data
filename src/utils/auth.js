import { getCurrentUser, getUserRole } from './supabase';

export async function isAuthenticated() {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

export async function isEditor() {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    const role = await getUserRole(user.id);
    return role === 'editor' || role === 'admin';
  } catch (error) {
    console.error('Authorization error:', error);
    return false;
  }
}

export async function isAdmin() {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    const role = await getUserRole(user.id);
    return role === 'admin';
  } catch (error) {
    console.error('Authorization error:', error);
    return false;
  }
}

export function redirectToLogin(url = '/admin/login') {
  return Response.redirect(url);
}