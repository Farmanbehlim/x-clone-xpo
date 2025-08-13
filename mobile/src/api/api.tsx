// import axios, { AxiosInstance } from "axios";
// import { useAuth } from "@clerk/clerk-expo";
// import { template } from "@babel/core";

// // const API_BASE_URL =  "https://x-clone-xpos.vercel.app/api"
// // ! 🔥 localhost api would not work on your actual physical device
// const API_BASE_URL = "http://192.168.220.37:5001/api";

// // console.log(API_BASE_URL,"apibase")
// // this will basically create an authenticated api, pass the token into our headers
// export const createApiClient = (getToken: () => Promise<string | null>): AxiosInstance => {
//   const api = axios.create({ baseURL: API_BASE_URL });

//   api.interceptors.request.use(async (config) => {
//     const token = await getToken();
//     console.log("🔑 Clerk token:", token); // <-- Add this
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   });

//   return api;
// };

// export const useApiClient = (): AxiosInstance => {
//   const { getToken } = useAuth();
//   console.log("wow")
//   return createApiClient(getToken);
// }; 

// export const userApi = {

//   syncUser: (api: AxiosInstance) => api.post("/users/sync"),
//   getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
//   updateProfile: (api: AxiosInstance, data: any) => api.put("/users/profile", data),
// };





import axios, { AxiosInstance } from "axios";
import { useAuth } from "@clerk/clerk-expo";
import { Platform } from "react-native";


// ✅ Local network IP for physical device testing

const API_BASE_URL="http://10.98.109.37:5001/api"
// // console.log(API_BASE_URL,"hydytvdytvtdvtv")https://x-clone-xpo.vercel.app/
// const API_BASE_URL = "https://x-clone-xpo.vercel.app/api"
// ✅ This creates an Axios instance that auto-adds the Clerk token
export const createApiClient = (
    getToken: (opts?: { template?: string }) => Promise<string | null>
): AxiosInstance => {
    const api = axios.create({ baseURL: API_BASE_URL });

    api.interceptors.request.use(async (config) => {
        const token = await getToken({ template: "mobile" }); // ✅ Use correct template
        console.log("🔑 Clerk token:", token);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    return api;
};

export const useApiClient = (): AxiosInstance => {
    const { getToken } = useAuth(); // from Clerk
    return createApiClient(getToken);
};

// ✅ Define API endpoints with Axios instance
export const userApi = {
    syncUser: (api: AxiosInstance) => api.post("/users/sync"),
    getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
    updateProfile: (api: AxiosInstance, data: any) => api.put("/users/profile", data),
    getAllUser:(api:AxiosInstance,search:string,pageparam:number)=>api.get(`/users/all-user-details?search=${search}&page=${pageparam}`)
};



export const postApi = {
    createPost: (api: AxiosInstance, data: { content: string; image?: string }) =>
        api.post("/posts", data),
    getPosts: (api: AxiosInstance) => api.get("/posts"),
    getUserPosts: (api: AxiosInstance, username: string) => api.get(`/posts/user/${username}`),
    likePost: (api: AxiosInstance, postId: string) => api.post(`/posts/${postId}/like`),
    deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
    getAllUserPost:(api:AxiosInstance,pageparam:number)=>api.get(`/posts?page=${pageparam}`),
    getMainUserPost:(api:AxiosInstance,pageparam:number,userId:string)=>api.get(`/posts/getSingleUserAllPost?user=${userId}&page=${pageparam}`),
};

export const commentApi = {
    createComment: (api: AxiosInstance, postId: string, content: string) =>
        api.post(`/comments/post/${postId}`, { content }),
    getPostComment: (api: AxiosInstance, pageparam: number, postId: string) =>
        api.get(`comments/getPostCommnet?page=${pageparam}&postId=${postId}`),
};


export const pushNotificationApi = {
    sendTokenToBackend: (api: AxiosInstance, token: string) =>
        api.put("users/push-token", {
            token: token,
            platform: Platform.OS
        }),
    
}

