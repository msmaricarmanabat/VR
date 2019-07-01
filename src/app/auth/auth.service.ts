import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  constructor() { }

  get isLoggedIn() {
    return localStorage.getItem('user-token') !== null;
  }
}