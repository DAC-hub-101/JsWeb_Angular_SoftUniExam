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
    // Validate the token during initialization
    if (!this.validateToken()) {
      console.warn('Error loading user.');
      this.logout();
    }
  }

  login(email: string, password: string): Observable<any> {
    return new Observable((observer) => {
      signInWithEmailAndPassword(this.auth, email, password)
        .then((userCredential: UserCredential) => {
          const userData: IUser = {
            _id: userCredential.user.uid,
            email: userCredential.user.email || '',
            username: userCredential.user.email?.split('@')[0] || '',
          };
          // Store token and user data
          localStorage.setItem('auth_token', userData._id);
          localStorage.setItem('user', JSON.stringify(userData));
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
            username: userCredential.user.email?.split('@')[0] || '',
          };
          // Store token and user data
          localStorage.setItem('auth_token', userData._id);
          localStorage.setItem('user', JSON.stringify(userData));
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

  // Validate the token and initialize the user state
  validateToken(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user) as IUser;
        this.user$$.next(parsedUser);
        return true;
      } catch (error) {
        console.error('Invalid user data in localStorage:', error);
        this.logout(); // Clear invalid data
      }
    }
    return false;
  }
}
