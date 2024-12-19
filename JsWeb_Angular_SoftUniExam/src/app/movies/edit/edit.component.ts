import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit.component.html', // Can reuse same template as create
  styleUrls: ['./edit.component.scss']   // Can reuse same styles as create
})
export class EditComponent implements OnInit {
  movieForm: FormGroup;
  errorMessage = '';
  movieId: string = '';

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const currentYear = new Date().getFullYear();
    this.movieForm = this.fb.group({
      title: ['', [Validators.required]],
      director: ['', [Validators.required]],
      year: ['', [Validators.required, Validators.min(1888), Validators.max(currentYear)]],
      genre: [[], [Validators.required]],
      poster: ['', [Validators.required, Validators.pattern('^https?://.*')]],
      plot: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  ngOnInit() {
    // Get movie ID from route parameters
    this.route.params.subscribe(params => {
      this.movieId = params['id'];
      // Fetch movie details and populate form
      this.movieService.getById(this.movieId).subscribe({
        next: (movie) => {
          this.movieForm.patchValue({
            title: movie.title,
            director: movie.director,
            year: movie.year,
            genre: movie.genre,
            poster: movie.poster,
            plot: movie.plot
          });
        },
        error: (error) => {
          console.error('Error loading movie:', error);
          this.errorMessage = 'Failed to load movie details';
        }
      });
    });
  }

  async onSubmit() {
    if (this.movieForm.valid) {
      try {
        await this.movieService.update(this.movieId, this.movieForm.value);
        this.router.navigate(['/movies', this.movieId]); // Navigate back to details
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Failed to update movie';
        }
      }
    }
  }

  onCancel() {
    this.router.navigate(['/movies', this.movieId]); // Navigate back to movie details
  }
}