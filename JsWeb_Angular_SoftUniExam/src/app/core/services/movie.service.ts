import { Injectable } from '@angular/core';
import {
  Firestore,
  CollectionReference,
  DocumentData,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
  orderBy,
  docData,
  getDoc,
  limit
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Movie } from '../../shared/interfaces/movie.interface';
import { MovieComment } from '../../shared/interfaces/movieComment.intercface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private moviesCollection: CollectionReference<DocumentData>;

  constructor(
    private firestore: Firestore,
    private authService: AuthService  // Add this
  ) {
    this.moviesCollection = collection(this.firestore, 'movies');
  }

  getAll(): Observable<Movie[]> {
    const moviesQuery = query(
      this.moviesCollection,
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(moviesQuery)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Movie));
      })
    );
  }

  getById(id: string): Observable<Movie> {
    const movieRef = doc(this.firestore, 'movies', id);

    return from(getDoc(movieRef)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) {
          throw new Error('Movie not found');
        }

        const data = docSnap.data(); // Correct access to data()

        // Convert Firestore Timestamp to Date
        const comments = (data?.['comments'] || []).map((comment: any) => ({
          ...comment,
          createdAt: comment.createdAt.toDate(), // Firestore Timestamp to JS Date
        }));

        return {
          id: docSnap.id,
          ...data,
          comments,
        } as Movie;
      })
    );
  }

  // Create a new movie
  async create(movieData: Omit<Movie, 'id'>): Promise<void> {
    const newMovie = {
      ...movieData,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: localStorage.getItem('auth_token')
    };

    return addDoc(this.moviesCollection, newMovie)
      .then(() => void 0); // Ensures void return
  }

  // Update an existing movie by ID
  update(id: string, movieData: Partial<Movie>): Promise<void> {
    const movieRef = doc(this.firestore, 'movies', id);
    return updateDoc(movieRef, {
      ...movieData,
      updatedAt: new Date()
    });
  }

  // Delete a movie by ID
  delete(id: string): Promise<void> {
    const movieRef = doc(this.firestore, `movies/${id}`);
    return deleteDoc(movieRef);
  }

  isOwner(movie: Movie): boolean {
    const currentUserId = localStorage.getItem('auth_token');
    return movie.userId === currentUserId;
  }

  likeMovie(movieId: string): Observable<Movie> {
    const movieRef = doc(this.firestore, 'movies', movieId);
    const userId = localStorage.getItem('auth_token');

    return from(getDoc(movieRef)).pipe(
      map(docSnap => {
        const movie = { id: docSnap.id, ...docSnap.data() } as Movie;
        const likes = movie.likes || [];
        const newLikes = likes.includes(userId!)
          ? likes.filter(id => id !== userId)
          : [...likes, userId!];

        updateDoc(movieRef, { likes: newLikes });
        return { ...movie, likes: newLikes };
      })
    );
  }


  addComment(movieId: string, content: string): Observable<Movie> {
    const movieRef = doc(this.firestore, 'movies', movieId);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Current user data:', user); // Debug log

    const newComment: MovieComment = {
      movieId,
      userId: user._id,
      userEmail: user.email, // Get email from user object
      content,
      createdAt: new Date(),
    };
    console.log('New comment data:', newComment); // Debug log

    return from(getDoc(movieRef)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) {
          throw new Error('Movie not found');
        }
        const movie = { id: docSnap.id, ...docSnap.data() } as Movie;
        const comments = movie.comments || [];
        const updatedComments = [...comments, newComment];

        console.log('Updated comments:', updatedComments); // Debug log

        updateDoc(movieRef, { comments: updatedComments });
        return { ...movie, comments: updatedComments };
      })
    );
  }

  getTopTrending(): Observable<Movie[]> {
    const moviesRef = collection(this.firestore, 'movies');

    // First get all movies because we need to sort by likes array length
    return from(getDocs(moviesRef)).pipe(
      map(snapshot => {
        return snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Movie))
          // Sort by likes array length
          .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
          // Take only top 10
          .slice(0, 10);
      })
    );
  } rateMovie(movieId: string, rating: number): Observable<Movie> {
    const movieRef = doc(this.firestore, 'movies', movieId);
    const userId = localStorage.getItem('auth_token');

    if (!userId) {
      throw new Error('User not authenticated');
    }

    return from(getDoc(movieRef)).pipe(
      map(docSnap => {
        const movie = { id: docSnap.id, ...docSnap.data() } as Movie;
        const userRatings = movie.userRatings || {};
        const oldRating = userRatings[userId];
        const isUpdating = oldRating !== undefined;

        // Calculate new average rating
        let newAverageRating;
        let totalRatings = movie.totalRatings || 0;

        if (isUpdating) {
          // Update existing rating
          const currentTotal = (movie.rating || 0) * totalRatings;
          newAverageRating = (currentTotal - oldRating + rating) / totalRatings;
        } else {
          // Add new rating
          totalRatings += 1;
          const currentTotal = (movie.rating || 0) * (totalRatings - 1);
          newAverageRating = (currentTotal + rating) / totalRatings;
        }

        // Update movie with new rating data
        const updateData = {
          userRatings: { ...userRatings, [userId]: rating },
          rating: newAverageRating,
          totalRatings,
          updatedAt: new Date()
        };

        updateDoc(movieRef, updateData);

        return {
          ...movie,
          ...updateData,
          currentRating: rating
        };
      })
    );
  }

  getUserRating(movie: Movie): number | null {
    const userId = localStorage.getItem('auth_token');
    return userId && movie.userRatings ? (movie.userRatings[userId] || null) : null;
  }
}
