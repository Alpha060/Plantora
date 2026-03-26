import { create } from "zustand";

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartDrawerOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  toggleCartDrawer: () => void;
  toggleSidebar: () => void;
  closeMobileMenu: () => void;
  closeSearch: () => void;
  closeCartDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartDrawerOpen: false,
  isSidebarCollapsed: false,
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  toggleCartDrawer: () =>
    set((s) => ({ isCartDrawerOpen: !s.isCartDrawerOpen })),
  toggleSidebar: () =>
    set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
}));
