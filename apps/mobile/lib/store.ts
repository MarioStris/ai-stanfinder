import { create } from "zustand";
import type {
  User,
  Filter,
  MatchResult,
  Notification,
} from "@ai-stanfinder/shared-types";

interface UserSlice {
  user: User | null;
  authToken: string | null;
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  clearAuth: () => void;
}

interface FilterSlice {
  activeFilter: Filter | null;
  activeFilterId: string | null;
  filters: Filter[];
  setActiveFilter: (filter: Filter | null) => void;
  setActiveFilterId: (id: string | null) => void;
  setFilters: (filters: Filter[]) => void;
  addFilter: (filter: Filter) => void;
  updateFilter: (filter: Filter) => void;
  removeFilter: (filterId: string) => void;
}

interface MatchSlice {
  matches: MatchResult[];
  isLoadingMatches: boolean;
  matchesError: string | null;
  lastUpdated: Date | null;
  setMatches: (matches: MatchResult[]) => void;
  setLoadingMatches: (loading: boolean) => void;
  setMatchesError: (error: string | null) => void;
  setLastUpdated: (date: Date | null) => void;
  toggleFavorite: (matchId: string) => void;
}

interface FavoritesSlice {
  favoriteIds: Set<string>;
  addFavorite: (matchId: string) => void;
  removeFavorite: (matchId: string) => void;
  isFavorite: (matchId: string) => boolean;
  getFavorites: (matches: MatchResult[]) => MatchResult[];
}

interface NotificationSlice {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

type StoreState = UserSlice &
  FilterSlice &
  MatchSlice &
  FavoritesSlice &
  NotificationSlice;

export const useStore = create<StoreState>((set, get) => ({
  // User slice
  user: null,
  authToken: null,
  setUser: (user) => set({ user }),
  setAuthToken: (authToken) => set({ authToken }),
  clearAuth: () => set({ user: null, authToken: null }),

  // Filter slice
  activeFilter: null,
  activeFilterId: null,
  filters: [],
  setActiveFilter: (activeFilter) =>
    set({ activeFilter, activeFilterId: activeFilter?.id ?? null }),
  setActiveFilterId: (activeFilterId) => set({ activeFilterId }),
  setFilters: (filters) => set({ filters }),
  addFilter: (filter) =>
    set((state) => ({ filters: [...state.filters, filter] })),
  updateFilter: (filter) =>
    set((state) => ({
      filters: state.filters.map((f) => (f.id === filter.id ? filter : f)),
      activeFilter:
        state.activeFilter?.id === filter.id ? filter : state.activeFilter,
    })),
  removeFilter: (filterId) =>
    set((state) => ({
      filters: state.filters.filter((f) => f.id !== filterId),
      activeFilter:
        state.activeFilter?.id === filterId ? null : state.activeFilter,
      activeFilterId:
        state.activeFilterId === filterId ? null : state.activeFilterId,
    })),

  // Match slice
  matches: [],
  isLoadingMatches: false,
  matchesError: null,
  lastUpdated: null,
  setMatches: (matches) => set({ matches }),
  setLoadingMatches: (isLoadingMatches) => set({ isLoadingMatches }),
  setMatchesError: (matchesError) => set({ matchesError }),
  setLastUpdated: (lastUpdated) => set({ lastUpdated }),
  toggleFavorite: (matchId) => {
    const { favoriteIds } = get();
    const next = new Set(favoriteIds);
    if (next.has(matchId)) {
      next.delete(matchId);
    } else {
      next.add(matchId);
    }
    set((state) => ({
      favoriteIds: next,
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, isFavorite: !m.isFavorite } : m
      ),
    }));
  },

  // Favorites slice
  favoriteIds: new Set<string>(),
  addFavorite: (matchId) =>
    set((state) => {
      const next = new Set(state.favoriteIds);
      next.add(matchId);
      return {
        favoriteIds: next,
        matches: state.matches.map((m) =>
          m.id === matchId ? { ...m, isFavorite: true } : m
        ),
      };
    }),
  removeFavorite: (matchId) =>
    set((state) => {
      const next = new Set(state.favoriteIds);
      next.delete(matchId);
      return {
        favoriteIds: next,
        matches: state.matches.map((m) =>
          m.id === matchId ? { ...m, isFavorite: false } : m
        ),
      };
    }),
  isFavorite: (matchId) => get().favoriteIds.has(matchId),
  getFavorites: (matches) =>
    matches.filter((m) => get().favoriteIds.has(m.id) || m.isFavorite),

  // Notification slice
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
