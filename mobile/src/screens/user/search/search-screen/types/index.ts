interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture: string;
  bannerImage: string;
  bio: string;
  location: string;
  followers: any[];
  following: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

interface Pagination{
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  usersPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export interface APIResponse{
  users: User[];
  pagination: Pagination;
  
};
