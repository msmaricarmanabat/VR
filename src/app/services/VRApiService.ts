import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from './AuthenticationService';
import { Subscription, Observable } from 'rxjs';
import { ICompareSettings } from '../models/CompareSettings';

@Injectable({ providedIn: 'root' })
export class VRApiService {
    constructor(private http: HttpClient, private authService: AuthenticationService) { }

    getFields(): Observable<Object> {
        const headers = this.getDefaultHeader();
        const url = `${this.getBaseUrl()}/api/reconciliationtool/getfields`;
        return this.http.get(url, { headers });
    }

    exportDeals(settings: ICompareSettings):void{
        const headers = this.getDefaultHeader();
        const url = `${this.getBaseUrl()}/api/reconciliationtool/getexcelfile`;
        this.http.post(url, settings, { headers });
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