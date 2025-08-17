
import { useInfiniteQuery, QueryFunctionContext, UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
// import { APIResponse } from '../types';
import { postApi, useApiClient, userApi } from '@/src/api/api';
import { PostsResponse } from '../../home/home-screen/types';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';


export const useMainUserAllPost = (


): UseInfiniteQueryResult<InfiniteData<PostsResponse>, Error> => {
    const api = useApiClient();
    const {currentUser } = useCurrentUser();
    const userId=currentUser?._id;
    // console.log(currentUser?._id)
    const fetchUsers =
        async (context: QueryFunctionContext<['AllMainUserPost',string ], number>): Promise<PostsResponse> => {
            const { pageParam = 1 } = context;
            if(!userId){
                throw new Error('UserId is required')
            }

            try {
                // Add explicit type casting to number if needed
                const pageNumber = pageParam as number;
                const response = await postApi?.getMainUserPost(api, pageNumber,userId);
                console.log( response?.data?.posts,"liulibvf")
                return {
                    posts: response?.data?.posts,
                    pagination: response?.data?.pagination
                };
            } catch (error: any) {
                const message = error?.response?.data?.message ||
                    error?.message ||
                    'Unknown error occurred';
                throw new Error(message);
            }
        }


    return useInfiniteQuery<
        PostsResponse,
        Error,
        InfiniteData<PostsResponse>,
        ["AllMainUserPost",string],
        number

    >({
        queryKey: ['AllMainUserPost',userId],
        queryFn: fetchUsers,
        // enabled:!!userId,
        //  staleTime: 60 * 1000 ,// 1 minute
        // refetchOnWindowFocus:true,
        // refetchOnReconnect:true,
        initialPageParam: 1,
        getNextPageParam: (lastPage: PostsResponse) =>
            lastPage?.pagination?.hasNextPage ? parseInt(lastPage?.pagination?.currentPage) + 1 : undefined

    });
};