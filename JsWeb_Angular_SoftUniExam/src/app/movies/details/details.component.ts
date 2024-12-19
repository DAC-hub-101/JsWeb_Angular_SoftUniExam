import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
  currentRating: number | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    public movieService: MovieService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef // To manually trigger change detection if needed
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const movieId = params.get('id');
      if (movieId) {
        this.movieService.getById(movieId).subscribe({
          next: (movie) => {
            this.movie = movie;
            this.loading = false;
            this.currentRating = movie.currentRating ?? null;
          },
          error: (err) => {
            this.error = 'Failed to load movie details';
            this.loading = false;
            console.error(err);
          }
        });
      } else {
        this.error = 'Invalid movie ID';
        this.loading = false;
      }
    });
  }

  getRoundedRating(rating: number | null): string {
    if (rating === null) return 'N/A';  // Handle null ratings gracefully
    return rating.toFixed(1);  // Round to 1 decimal place
  }

  onEdit(): void {
    if (this.movie?.id) {
      this.router.navigate(['/movies', this.movie.id, 'edit']);
    }
  }

  onDelete(): void {
    if (this.movie?.id && confirm('Are you sure you want to delete this movie?')) {
      this.movieService.delete(this.movie.id)
        .then(() => this.router.navigate(['/movies/catalog']))
        .catch(error => {
          console.error(error);
          this.error = 'Failed to delete movie';
        });
    }
  }

  onLike(): void {
    if (this.movie?.id) {
      this.movieService.likeMovie(this.movie.id).subscribe({
        next: (updatedMovie) => {
          this.movie = updatedMovie; // The movie object will now reflect the new like status
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }

  focusCommentInput(): void {
    this.commentInput?.nativeElement.focus();
  }

  onAddComment(): void {
    if (this.movie?.id && this.newComment.trim()) {
      this.movieService.addComment(this.movie.id, this.newComment).subscribe({
        next: (updatedMovie) => {
          this.movie = updatedMovie;
          this.newComment = ''; // Reset comment input
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error(error);
          this.error = 'Failed to add comment. Please try again.';
        }
      });
    }
  }

  onRate(star: number): void {
    if (this.movie?.id) {
      // Prevent rating if the user has already rated the movie
      if (this.currentRating !== null) {
        this.error = 'You have already rated this movie.';
        return; // Do not proceed if the user already has a rating
      }

      this.movieService.rateMovie(this.movie.id, star).subscribe({
        next: (updatedMovie) => {
          this.movie = updatedMovie;
          this.currentRating = star;  // Update current rating
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error('Error rating movie:', error);
        }
      });
    }
  }
}

