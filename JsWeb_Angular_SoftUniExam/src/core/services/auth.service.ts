// src/app/core/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { IUser } from '../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user$$ = new BehaviorSubject<IUser | undefined>(undefined);
  private user$ = this.user$$.asObservable();

  constructor() {
    // Load user from localStorage if exists
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '');
        this.user$$.next(user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  login(email: string, password: string): Observable<any> {
    // Simulate login process
    const userData: IUser = {
      _id: Date.now().toString(),
      email: email,
      username: email.split('@')[0]
    };

    localStorage.setItem('auth_token', userData._id);
    localStorage.setItem('user', JSON.stringify(userData));
    this.user$$.next(userData);

    return from(Promise.resolve({ user: userData, token: userData._id }));
  }

  register(email: string, password: string): Observable<any> {
    // Simulate registration process
    const userData: IUser = {
      _id: Date.now().toString(),
      email: email,
      username: email.split('@')[0]
    };

    localStorage.setItem('auth_token', userData._id);
    localStorage.setItem('user', JSON.stringify(userData));
    this.user$$.next(userData);

    return from(Promise.resolve({ user: userData, token: userData._id }));
  }

  logout(): Observable<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.user$$.next(undefined);

    return from(Promise.resolve());
  }

  isLoggedIn(): boolean {
    return !!this.user$$.value;
  }

  getCurrentUser(): Observable<IUser | undefined> {
    return this.user$;
  }

  getUserId(): string | undefined {
    return this.user$$.value?._id;
  }
}