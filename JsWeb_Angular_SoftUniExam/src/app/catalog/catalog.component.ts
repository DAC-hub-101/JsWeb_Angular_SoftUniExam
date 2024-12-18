// src/app/catalog/catalog.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../core/services/movie.service';
import { Movie } from '../shared/interfaces/movie.interface';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  movies: Movie[] = [];
  loading = true;
  error: string | null = null;

  constructor(private movieService: MovieService) { }

  ngOnInit() {
    this.movieService.getAll().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load movies';
        this.loading = false;
        console.error('Error loading movies:', err);
      }
    });
  }
}