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
    averageRating?: number; // Optional property for average rating
    totalRatings?: number;  // Optional property for total number of ratings
    comments?: MovieComment[];  // Array of comments
    createdAt?: Date;
    updatedAt?: Date;
    currentRating?: number;
}

