import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pushNotificationApi, useApiClient } from "../api/api";


export const useNotifications = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications"),
    select: (res) => res.data.notifications,
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => api.delete(`/notifications/${notificationId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // const removePushToken = useMutation({
  //   mutationFn: () => pushNotificationApi.removePushToken(api),
  //   onError: (error) => console.error("Push token removal failed", error),
  // });

  const deleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };


  return {
    notifications: notificationsData || [],
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteNotification,
  
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
};