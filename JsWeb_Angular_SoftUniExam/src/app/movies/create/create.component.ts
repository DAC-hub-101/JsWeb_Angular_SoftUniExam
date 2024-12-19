import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MovieService } from '../../core/services/movie.service'; // Import your MovieService

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

export class CreateComponent {
  movieForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private router: Router
  ) {
    const currentYear = new Date().getFullYear();
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      director: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1888), Validators.max(currentYear)]],
      genre: [[], Validators.required],
      poster: ['', [Validators.required, Validators.pattern('^https?://.*')]],
      plot: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  async onSubmit() {
    if (this.movieForm.valid) {
      try {
        await this.movieService.create(this.movieForm.value);
        this.router.navigate(['/movies/catalog']);
      } catch (error: unknown) { // Explicit unknown type
        if (error instanceof Error) {
          this.errorMessage = error.message || 'Failed to create movie discussion. Please try again.';
        } else {
          this.errorMessage = 'An unknown error occurred.'; // Handle non-Error objects
        }
      }
    }
  }
}
