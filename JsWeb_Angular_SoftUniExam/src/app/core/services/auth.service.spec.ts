// src/app/core/services/auth/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';

describe('AuthService', () => {
  let service: AuthService;
  // Define a custom type for our mock Auth
  let mockAuth: jasmine.SpyObj<Auth> & {
    signInWithEmailAndPassword: jasmine.Spy;
    createUserWithEmailAndPassword: jasmine.Spy;
  };

  const mockUserCredential = {
    user: {
      uid: 'test-uid',
      email: 'test@example.com'
    }
  };

  beforeEach(() => {
    // Create the mock Auth object with all required methods
    mockAuth = jasmine.createSpyObj('Auth', [
      'signOut',
      'signInWithEmailAndPassword',
      'createUserWithEmailAndPassword'
    ]);

    // Set up default spy return values
    mockAuth.signInWithEmailAndPassword.and.returnValue(Promise.resolve(mockUserCredential));
    mockAuth.createUserWithEmailAndPassword.and.returnValue(Promise.resolve(mockUserCredential));
    mockAuth.signOut.and.returnValue(Promise.resolve());

    // Mock localStorage
    const store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake(key => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => store[key] = value);
    spyOn(localStorage, 'removeItem').and.callFake(key => delete store[key]);

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: mockAuth }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should log in user and store data', (done) => {
      service.login('test@example.com', 'password').subscribe({
        next: (result) => {
          expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-uid');
          expect(result.user.email).toBe('test@example.com');
          done();
        }
      });
    });

    it('should handle login error', (done) => {
      mockAuth.signInWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Invalid credentials'))
      );

      service.login('test@example.com', 'wrong').subscribe({
        error: (error) => {
          expect(error.message).toBe('Invalid credentials');
          done();
        }
      });
    });
  });

  describe('register', () => {
    it('should register new user and store data', (done) => {
      service.register('new@example.com', 'password').subscribe({
        next: (result) => {
          expect(localStorage.setItem).toHaveBeenCalled();
          expect(result.user.email).toBe('test@example.com');
          done();
        }
      });
    });

    it('should handle registration error', (done) => {
      mockAuth.createUserWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Email already in use'))
      );

      service.register('existing@example.com', 'password').subscribe({
        error: (error) => {
          expect(error.message).toBe('Email already in use');
          done();
        }
      });
    });
  });

  describe('logout', () => {
    it('should clear user data and sign out', (done) => {
      service.logout().subscribe({
        next: () => {
          expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
          expect(localStorage.removeItem).toHaveBeenCalledWith('user');
          expect(mockAuth.signOut).toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle logout error', (done) => {
      mockAuth.signOut.and.returnValue(Promise.reject(new Error('Logout failed')));

      service.logout().subscribe({
        error: (error) => {
          expect(error.message).toBe('Logout failed');
          done();
        }
      });
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when user is logged in', () => {
      service['user$$'].next({
        _id: 'test-uid',
        email: 'test@example.com',
        username: 'test'
      });
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should return false when user is not logged in', () => {
      service['user$$'].next(undefined);
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user observable', (done) => {
      const mockUser = {
        _id: 'test-uid',
        email: 'test@example.com',
        username: 'test'
      };

      service['user$$'].next(mockUser);

      service.getCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });
  });

  describe('validateToken', () => {
    it('should validate and set user from localStorage', () => {
      const mockUser = {
        _id: 'test-uid',
        email: 'test@example.com',
        username: 'test'
      };

      localStorage.setItem('auth_token', mockUser._id);
      localStorage.setItem('user', JSON.stringify(mockUser));

      expect(service.validateToken()).toBeTrue();
      service.getCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should handle invalid user data', () => {
      localStorage.setItem('auth_token', 'token');
      localStorage.setItem('user', 'invalid-json');

      expect(service.validateToken()).toBeFalse();
    });

    it('should handle missing token', () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      expect(service.validateToken()).toBeFalse();
    });
  });

  describe('getUserEmail', () => {
    it('should return user email when logged in', () => {
      const mockUser = {
        _id: 'test-uid',
        email: 'test@example.com',
        username: 'test'
      };

      service['user$$'].next(mockUser);
      expect(service.getUserEmail()).toBe('test@example.com');
    });

    it('should return undefined when not logged in', () => {
      service['user$$'].next(undefined);
      expect(service.getUserEmail()).toBeUndefined();
    });
  });
});