import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth, UserCredential } from 'firebase/auth';
import { Auth } from '@angular/fire/auth'; // Import Firebase Auth
import { inject } from '@angular/core';
import { IUser } from '../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user$$ = new BehaviorSubject<IUser | undefined>(undefined);
  private user$ = this.user$$.asObservable();
  private auth = inject(Auth); // Inject Firebase Auth service

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
    // Use Firebase Authentication to sign in
    return new Observable((observer) => {
      signInWithEmailAndPassword(this.auth, email, password)
        .then((userCredential: UserCredential) => {
          const userData: IUser = {
            _id: userCredential.user.uid,
            email: userCredential.user.email || '',
            username: userCredential.user.email?.split('@')[0] || ''
          };

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
    // Use Firebase Authentication to register a new user
    return new Observable((observer) => {
      createUserWithEmailAndPassword(this.auth, email, password)
        .then((userCredential: UserCredential) => {
          const userData: IUser = {
            _id: userCredential.user.uid,
            email: userCredential.user.email || '',
            username: userCredential.user.email?.split('@')[0] || ''
          };

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
