// src/app/movies/trending/trending.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../shared/interfaces/movie.interface';

// src/app/movies/trending/trending.component.ts
@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css']
})
export class TrendingComponent implements OnInit {
  movies: Movie[] = [];
  loading = true;
  error: string | null = null;

  constructor(private movieService: MovieService) { }

  // src/app/movies/trending/trending.component.ts
  ngOnInit() {
    this.movieService.getTopTrending().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading trending movies:', err);
        this.error = 'Failed to load trending movies';
        this.loading = false;
      }
    });
  }
}