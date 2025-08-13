import {create} from "zustand";
interface useUserSyncState{
hasSynced:boolean;
setHasSynced:(value:boolean)=>void
}

export const useUserAuthStore=create<useUserSyncState>((set)=>({
hasSynced:false,
setHasSynced: (value) => set({ hasSynced: value }),
}))
