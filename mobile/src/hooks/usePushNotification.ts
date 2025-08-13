// hooks/useRemovePushToken.ts
// import { useMutation } from "@tanstack/react-query";
import { Platform } from "react-native";
import { useApiClient } from "../api/api";

import { useMutation } from "@tanstack/react-query"



export const usePushNotification = () => {
    const api = useApiClient()
    const removePushToken = useMutation({
        mutationFn: async () => api.post('/users/remove-push-token'),
        onError: (error) => console.error("Push token removal failed", error),
    });

    const updateTokenInDb = useMutation({
        mutationFn: (token:string) => api.put("/users/push-token", {
            token: token,
            platform: Platform.OS
        })
    })


    return {
        removePushToken: removePushToken.mutateAsync,
        updateTokenInDb:updateTokenInDb.mutateAsync
    }
}


