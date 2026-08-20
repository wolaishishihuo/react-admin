export interface AdminTab {
  id: string;
  routePath: string;
  fullPath: string;
  title: string;
  oldTitle: string;
  icon?: string;
  fixed: boolean;
  keepAlive: boolean;
}

export interface TabsPersistedState {
  homeTab: AdminTab;
  tabs: AdminTab[];
}
