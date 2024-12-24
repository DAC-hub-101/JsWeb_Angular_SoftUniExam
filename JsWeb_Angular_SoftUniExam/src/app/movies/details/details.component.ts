import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../shared/interfaces/movie.interface';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  @ViewChild('commentInput') commentInput!: ElementRef;
  private destroy$ = new Subject<void>();

  movie: Movie | null = null;
  loading = true;
  error: string | null = null;
  newComment: string = '';
  currentRating: number | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    public movieService: MovieService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const movieId = params.get('id');
      if (movieId) {
        this.movieService.getById(movieId).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (movie) => {
            this.movie = movie;
            this.loading = false;
            this.currentRating = this.movieService.getUserRating(movie);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRoundedRating(rating: number | null): string {
    if (rating === null) return 'N/A';
    return rating.toFixed(1);
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
      this.movieService.likeMovie(this.movie.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (updatedMovie) => {
          this.movie = updatedMovie;
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error(error);
          this.error = 'Failed to like movie';
        }
      });
    }
  }

  focusCommentInput(): void {
    this.commentInput?.nativeElement.focus();
  }

  onAddComment(): void {
    if (this.movie?.id && this.newComment.trim()) {
      this.movieService.addComment(this.movie.id, this.newComment).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (updatedMovie) => {
          this.movie = updatedMovie;
          this.newComment = '';
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
    if (!this.movie?.id) {
      this.error = 'Invalid movie data';
      return;
    }

    this.movieService.rateMovie(this.movie.id, star).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedMovie) => {
        this.movie = updatedMovie;
        this.currentRating = star;
        this.error = null;
      },
      error: (error) => {
        this.error = 'Failed to update rating. Please try again.';
        console.error('Rating error:', error);
      }
    });
  }

  isUpdatingRating(star: number): boolean {
    return this.currentRating !== null && this.currentRating !== star;
  }
}