import { useQuery } from "@tanstack/react-query";
import { useApiClient, userApi } from "../api/api";

export const useCurrentUser = () => {
  const api = useApiClient();

  const {
    data: currentUser,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: () => userApi.getCurrentUser(api),
    select: (response) => response.data.user,
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
  // console.log(currentUser,"bduybub")
  return { currentUser, isLoading, error, refetch };
};