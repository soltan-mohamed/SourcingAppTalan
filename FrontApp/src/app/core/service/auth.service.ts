import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import { Role } from '@core/models/role';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  private users = [
    {
      id: 1,
      img: 'assets/images/user/recruteur.jpg',
      username: 'recruteur@talan.tn',
      password: 'recruteur@123',
      firstName: 'Anouer',
      lastName: 'Khemeja',
      role: Role.Recruteur,
      token: 'recruteur-token',
    },
    {
      id: 2,
      img: 'assets/images/user/evaluateur.jpg',
      username: 'evaluateur@talan.tn',
      password: 'evaluateur@123',
      firstName: 'Mohamed',
      lastName: 'Soltan',
      role: Role.Evaluateur,
      token: 'evaluateur-token',
    },
    {
      id: 3,
      img: 'assets/images/user/manager.jpg',
      username: 'manager@talan.tn',
      password: 'manager@123',
      firstName: 'Safouane',
      lastName: 'Chabchoub',
      role: Role.Manager,
      token: 'manager-token',
    },
  ];

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {

    const user = this.users.find((u) => u.username === username && u.password === password);

    if (!user) {
      return this.error('Username or password is incorrect');
    } else {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return this.ok({
        id: user.id,
        img: user.img,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        token: user.token,
      });
    }
  }
  ok(body?: {
    id: number;
    img: string;
    username: string;
    firstName: string;
    lastName: string;
    token: string;
  }) {
    return of(new HttpResponse({ status: 200, body }));
  }
  error(message: string) {
    return throwError(message);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(this.currentUserValue);
    return of({ success: false });
  }
}
