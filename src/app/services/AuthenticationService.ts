import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root'})
export class AuthenticationService {
    constructor(private http: HttpClient) { }

    login(userName: string, hostUrl: string, accessKey: string): Promise<boolean> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        const opts = { headers };
        const content = `access_key=${encodeURIComponent(accessKey)}&username=${userName}&grant_type=password`;
        return this.http
            .post(`${hostUrl}/api/v1/token`, content, opts).toPromise()
            .then((res: ITokenResult) => {
                if (res && res.access_token) {
                    this.setToken(res.access_token)
                    return true;
                }
                return false;
            }).catch(er => false);
    }

    setToken(token: string): void {
        localStorage.setItem('user-token', token);
    }

    getToken(): string {
        return localStorage.getItem('user-token');
    }
}

export interface ITokenResult {
    access_token: string;
    token_type: string;
    expires_in: number;
}