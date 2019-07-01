import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material'
import { AuthenticationService } from '../services/AuthenticationService';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    constructor(private router: Router, private authService: AuthenticationService,  private _snackBar: MatSnackBar) { }
    username: string = 'sa';
    hostUrl: string = 'http://localhost';
    accessKey: string = 'Default'; 
    isLoading: boolean = false;

    ngOnInit() {
    }

    login(): void {
        this.isLoading = true;
        const canRequest = this.username && this.hostUrl && this.accessKey;
        if (!canRequest) {
            return;
        }
        
        this.authService
            .login(this.username, this.hostUrl, this.accessKey)
            .then((canLogin) => {
                if (canLogin) {
                    this.isLoading = false;
                    this.router.navigate(["user"]);
                } else {
                    this._snackBar.open('There was an error with your credentials combination. Please try again.','', {
                        duration: 2000,
                      });
                    this.isLoading = false;
                }
            });
    }
}