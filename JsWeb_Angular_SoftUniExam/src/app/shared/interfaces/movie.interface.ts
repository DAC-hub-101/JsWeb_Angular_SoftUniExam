import { MovieComment } from "./movieComment.intercface";

export interface Movie {
    id?: string;
    title: string;
    director: string;
    year: number;
    genre: string[];
    poster: string;
    plot: string;
    userId?: string;
    likes?: string[];  // Array of user IDs who liked the movie
    rating?: number;   // Average rating
    totalRatings?: number;  // Number of ratings
    comments?: MovieComment[];  // Array of comments
    createdAt?: Date;
    updatedAt?: Date;
}

