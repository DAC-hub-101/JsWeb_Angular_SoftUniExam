export interface MovieComment {
    id?: string;
    movieId: string;
    userId: string;
    userEmail: string;
    content: string;
    createdAt: Date;
}