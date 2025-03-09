import { getCurrentUser } from './supabase';

export async function isAuthenticated() {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

// Simplified redirect function for generic usage
export function redirectToLogin(url = '/login') {
  return Response.redirect(url);
}