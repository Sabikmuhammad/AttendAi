import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'student' | 'faculty' | 'admin' | null;

interface RoleStore {
  selectedRole: Role;
  setRole: (role: Role) => void;
  clearRole: () => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      selectedRole: null,
      setRole: (role) => set({ selectedRole: role }),
      clearRole: () => set({ selectedRole: null }),
    }),
    {
      name: 'attendai-role',
    }
  )
);
