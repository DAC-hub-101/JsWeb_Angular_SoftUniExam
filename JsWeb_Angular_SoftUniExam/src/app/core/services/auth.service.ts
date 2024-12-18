// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { IUser } from '../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user$$ = new BehaviorSubject<IUser | undefined>(undefined);
  private user$ = this.user$$.asObservable();
  private auth = inject(Auth);

  constructor() {
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
    return new Observable((observer) => {
      signInWithEmailAndPassword(this.auth, email, password)
        .then((userCredential: UserCredential) => {
          const userData: IUser = {
            _id: userCredential.user.uid,
            email: userCredential.user.email || '',
            username: userCredential.user.email?.split('@')[0] || ''
          };
          // Store both token and user data including email
          localStorage.setItem('auth_token', userData._id);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('email', userData.email);  // Store email separately
          this.user$$.next(userData);
          observer.next({ user: userData, token: userData._id });
          observer.complete();
        })
        .catch((error) => {
          console.error('Login error:', error);
          observer.error(error);
        });
    });
  }

  register(email: string, password: string): Observable<any> {
    return new Observable((observer) => {
      createUserWithEmailAndPassword(this.auth, email, password)
        .then((userCredential: UserCredential) => {
          const userData: IUser = {
            _id: userCredential.user.uid,
            email: userCredential.user.email || '',
            username: userCredential.user.email?.split('@')[0] || ''
          };
          // Store both token and user data including email
          localStorage.setItem('auth_token', userData._id);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('email', userData.email);  // Store email separately
          this.user$$.next(userData);
          observer.next({ user: userData, token: userData._id });
          observer.complete();
        })
        .catch((error) => {
          console.error('Registration error:', error);
          observer.error(error);
        });
    });
  }

  logout(): Observable<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('email');  // Remove email on logout
    this.user$$.next(undefined);
    return from(this.auth.signOut());
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

  getUserEmail(): string | undefined {
    return this.user$$.value?.email;
  }

  // Helper method to get current user data
  getCurrentUserData(): IUser | undefined {
    return this.user$$.value;
  }
}