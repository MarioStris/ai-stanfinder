import { create } from "zustand";
import type {
  User,
  Filter,
  MatchResult,
  Notification,
} from "@stanfinder/shared-types";

interface UserSlice {
  user: User | null;
  authToken: string | null;
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  clearAuth: () => void;
}

interface FilterSlice {
  activeFilter: Filter | null;
  filters: Filter[];
  setActiveFilter: (filter: Filter | null) => void;
  setFilters: (filters: Filter[]) => void;
  addFilter: (filter: Filter) => void;
  removeFilter: (filterId: string) => void;
}

interface MatchSlice {
  matches: MatchResult[];
  isLoadingMatches: boolean;
  matchesError: string | null;
  setMatches: (matches: MatchResult[]) => void;
  setLoadingMatches: (loading: boolean) => void;
  setMatchesError: (error: string | null) => void;
  toggleFavorite: (matchId: string) => void;
}

interface NotificationSlice {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

type StoreState = UserSlice & FilterSlice & MatchSlice & NotificationSlice;

export const useStore = create<StoreState>((set) => ({
  user: null,
  authToken: null,
  setUser: (user) => set({ user }),
  setAuthToken: (authToken) => set({ authToken }),
  clearAuth: () => set({ user: null, authToken: null }),

  activeFilter: null,
  filters: [],
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setFilters: (filters) => set({ filters }),
  addFilter: (filter) =>
    set((state) => ({ filters: [...state.filters, filter] })),
  removeFilter: (filterId) =>
    set((state) => ({
      filters: state.filters.filter((f) => f.id !== filterId),
    })),

  matches: [],
  isLoadingMatches: false,
  matchesError: null,
  setMatches: (matches) => set({ matches }),
  setLoadingMatches: (isLoadingMatches) => set({ isLoadingMatches }),
  setMatchesError: (matchesError) => set({ matchesError }),
  toggleFavorite: (matchId) =>
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, isFavorite: !m.isFavorite } : m
      ),
    })),

  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),
  markAsRead: (notificationId) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}));
