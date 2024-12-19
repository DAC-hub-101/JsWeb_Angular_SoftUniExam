import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../shared/interfaces/movie.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  @ViewChild('commentInput') commentInput!: ElementRef;
  movie: Movie | null = null;
  loading = true;
  error: string | null = null;
  newComment: string = '';
  isLiked: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    public movieService: MovieService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Accessing the 'id' from the current route's paramMap
    this.activatedRoute.paramMap.subscribe(params => {
      const movieId = params.get('id'); // Get the ID from the current route params
      console.log('Movie ID from route:', movieId);  // Check the movie ID

      if (movieId) {
        // Fetch movie details by ID
        this.movieService.getById(movieId).subscribe({
          next: (movie) => {
            this.movie = movie;  // Assign movie data to the component
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load movie details'; // Handle error
            this.loading = false;
            console.error('Error loading movie details:', err); // Log error
          }
        });
      } else {
        this.error = 'Invalid movie ID'; // If no ID is found
        this.loading = false;
      }
    });
  }
  onEdit(): void {
    if (this.movie?.id) {
      this.router.navigate(['/movies', this.movie.id, 'edit']);
    }
  }

  onDelete(): void {
    if (this.movie?.id && confirm('Are you sure you want to delete this movie?')) {
      this.movieService.delete(this.movie.id)
        .then(() => {
          this.router.navigate(['/movies/catalog']);
        })
        .catch(error => {
          console.error('Error deleting movie:', error);
          this.error = 'Failed to delete movie';
        });
    }
  }

  onLike(): void {
    if (this.movie?.id) {
      this.movieService.likeMovie(this.movie.id).subscribe({
        next: (updatedMovie) => {
          this.movie = updatedMovie;
          this.isLiked = !this.isLiked;
        },
        error: (error) => {
          console.error('Error liking movie:', error);
          // Handle error
        }
      });
    }
  }

  focusCommentInput(): void {
    this.commentInput?.nativeElement.focus();
  }

  onAddComment(): void {
    if (this.movie?.id && this.newComment.trim()) {
      // Add debug log
      console.log('Adding comment with user:', localStorage.getItem('user'));

      this.movieService.addComment(this.movie.id, this.newComment).subscribe({
        next: (updatedMovie) => {
          console.log('Comment added successfully:', updatedMovie);
          this.movie = updatedMovie;
          this.newComment = '';
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.error = 'Failed to add comment. Please try again.';
        }
      });
    }
  }
}
