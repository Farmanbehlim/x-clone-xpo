




export interface User{
  _id:string;
  firstName:string;
  lastName:string;
  username:string;
   profilePicture?: string;
}
export interface Comment{
  _id:string;
  post:string;
  content:string;
  createdAt: string;
  likes: unknown[];
  updatedAt:string
  user:User;
   __v: number;
}



interface Pagination {
  totalUsers: number;
  totalPages: number;
  currentPage: string;
  usersPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}



export interface CommentResPonse{
  comments:Comment[];
  pagination:Pagination|undefined
}