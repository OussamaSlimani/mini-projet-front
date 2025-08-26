import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, map, tap } from "rxjs";
import { User, UserRole } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly REMEMBER_ME_KEY = "rememberMe";
  private readonly REMEMBERED_EMAIL_KEY = "rememberedEmail";

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if remember me was enabled
    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === "true";
    let storedUser = null;

    if (rememberMe) {
      // If remember me is true, try to get user from localStorage
      storedUser = localStorage.getItem("currentUser");
    } else {
      // If remember me is false, try to get user from sessionStorage
      storedUser = sessionStorage.getItem("currentUser");
    }

    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAdmin(): boolean {
    return this.currentUserValue?.role === UserRole.ADMIN;
  }

  login(
    email: string,
    password: string,
    rememberMe: boolean
  ): Observable<User> {
    return this.http
      .post<User>(
        "https://api-talend-engines-manage.onrender.com/api/users/login",
        { email, password }
      )
      .pipe(
        tap((user) => {
          // Store the remember me preference
          localStorage.setItem(this.REMEMBER_ME_KEY, rememberMe.toString());

          if (rememberMe) {
            // Store user in localStorage for persistent login
            localStorage.setItem("currentUser", JSON.stringify(user));
            // Store email for remember me functionality
            localStorage.setItem(this.REMEMBERED_EMAIL_KEY, email);
          } else {
            // Store user in sessionStorage for session-only login
            sessionStorage.setItem("currentUser", JSON.stringify(user));
            // Remove remembered email if remember me is not checked
            localStorage.removeItem(this.REMEMBERED_EMAIL_KEY);
          }

          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    // Clear both storage locations
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
    this.router.navigate(["/auth/login"]);
  }

  getRememberedEmail(): string | null {
    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === "true";
    return rememberMe ? localStorage.getItem(this.REMEMBERED_EMAIL_KEY) : null;
  }

  checkUserAccess(requiredRole: UserRole): boolean {
    const currentUser = this.currentUserValue;
    if (!currentUser) {
      this.router.navigate(["/auth/login"]);
      return false;
    }
    // Admins have access to everything
    if (currentUser.role === UserRole.ADMIN) {
      return true;
    }
    // Normal check for other users
    if (currentUser.role !== requiredRole) {
      this.router.navigate(["/auth/access"]);
      return false;
    }
    return true;
  }
}
