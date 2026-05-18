'use server';

// Static mockup of authenticated user session
export interface UserSession {
  id: string;
  email: string;
  name: string;
}

const MOCK_USER: UserSession = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'gardener@antigravity.dev',
  name: 'Alex Gardner',
};

export async function getCurrentUser(): Promise<UserSession | null> {
  // Offline mock returns our standard mock user
  return MOCK_USER;
}
