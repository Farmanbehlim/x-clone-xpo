import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { useApiClient, userApi } from "../api/api";
import { useUserAuthStore } from "../store/use-Auth-store";

export const useUserSync = () => {
    const { isSignedIn } = useAuth();
    const api = useApiClient();
    console.log(api, "api");
    const setHasSynced = useUserAuthStore((s) => s.setHasSynced)
    const syncUserMutation = useMutation({
        // mutationFn: () => userApi.syncUser(api),
        mutationFn: async () => {
            console.log(" Sending request to sync user...");
            const res = await userApi.syncUser(api);
            console.log(" Response received:", res.data);
            if (res?.data?.metaData?.code === 200) {
                setHasSynced(true);
            }

            return res;
        },
        onSuccess: (response: any) => console.log("User synced successfully:", response.data.user),
        onError: (error) => console.error("User sync failed:", error),
    });

    // auto-sync user when signed in
    useEffect(() => {

        // if user is signed in and user is not synced yet, sync user
        if (isSignedIn && !syncUserMutation.data) {
            syncUserMutation.mutate();
        }
    }, [isSignedIn]);

    return null;
};