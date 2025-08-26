import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../service/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DarkModeToggleComponent } from '../../layout/component/app.mode.toggle';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        FormsModule,
        RippleModule,
        AppFloatingConfigurator,
        ToastModule,
        DarkModeToggleComponent
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <app-floating-configurator />

        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden relative">
            <!-- Dark mode toggle button at top right -->
            <div class="absolute top-4 right-4 p-4">
                <app-dark-mode-toggle></app-dark-mode-toggle>
            </div>

            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                       <div class="flex flex-col items-center text-center mb-8">
                            <img src="assets/images/logo-icon.png" class="w-12 h-auto mb-2" />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">OliveSoft</div>
                            <span class="text-muted-color font-medium">Log in to continue</span>
                        </div>
                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="rememberMe" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Remember me</label>
                                </div>
                            </div>
                            <p-button label="Log In" styleClass="w-full" (onClick)="login()"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    email: string = '';
    password: string = '';
    rememberMe: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {
        // Check if a remembered email exists
        const rememberedEmail = this.authService.getRememberedEmail();
        if (rememberedEmail) {
            this.email = rememberedEmail;
            this.rememberMe = true;
        }
    }

    login(): void {
        if (!this.email || !this.password) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter both email and password'
            });
            return;
        }

        this.authService.login(this.email, this.password, this.rememberMe).subscribe({
            next: (user) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Login successful'
                });
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Invalid email or password'
                });
            }
        });
    }
}
