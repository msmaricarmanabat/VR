import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from './AuthenticationService';
import { Subscription, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VRApiService {
    constructor(private http: HttpClient, private authService: AuthenticationService) { }

    getFields(): Observable<Object> {
        const headers = this.getDefaultHeader();
        const url = `${this.getBaseUrl()}/api/comparetool/getfields`;
        return this.http.get(url, { headers });
    }

    private getDefaultHeader(): HttpHeaders {
        const token = `Bearer ${this.authService.getToken()}`;
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': token
        });
    }

    private getBaseUrl(): string {
        return this.authService.getHostUrl();
    }
}   