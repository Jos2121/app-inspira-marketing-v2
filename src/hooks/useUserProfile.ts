import { useQuery } from '@tanstack/react-query';

export type UserProfile = {
  role: 'SUPERADMIN' | 'ADMIN';
  accessibleTabs: string[];
};

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await fetch('/api/users/me');
      if (!res.ok) {
        return { role: 'ADMIN', accessibleTabs: [] } as UserProfile;
      }
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000 // 5 minutos de cache
  });
}