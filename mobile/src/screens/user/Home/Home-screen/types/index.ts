
// export interface User {
//   _id: string;
//   username: string;
//   firstName: string;
//   lastName: string;
//   profilePicture?: string;
// }


// export interface Post {
//   _id: string;
//   content: string;
//   image?: string;
//   createdAt: string;
//   user: User;
//   likes: string[];
//   comments: Comment[];
//   pagination:Pagination;
//   posts:User
// }
// interface Pagination{
//   totalUsers: number;
//   totalPages: number;
//   currentPage: number;
//   usersPerPage: number;
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
// };
// export interface PostsResponse {
//   posts: Post[];      // Array of actual post items
//   pagination: Pagination; // Pagination metadata
// }
















// types.ts
export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}
export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  user: User;
}
// Renamed to PostItem for single post
export interface PostItem {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
  user: User;
  likes: string[];
  comments: Comment[];
 
}

export interface PostsResponse {
  posts: PostItem[];      // Array of actual post items
  pagination: Pagination; // Pagination metadata
 
}

interface Pagination {
  totalUsers: number;
  totalPages: number;
  currentPage: string;
  usersPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}