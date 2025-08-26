import { Component, OnInit } from "@angular/core";
import { MenuItem } from "primeng/api";
import { RouterModule } from "@angular/router";
import { CommonModule, NgIf } from "@angular/common";
import { StyleClassModule } from "primeng/styleclass";
import { LayoutService } from "../service/layout.service";
import { AuthService } from "../../pages/service/auth.service";
import { AvatarModule } from "primeng/avatar";
import { MenuModule } from "primeng/menu";
import { ButtonModule } from "primeng/button";
import { BadgeModule } from "primeng/badge";
import { DarkModeToggleComponent } from "./app.mode.toggle";

@Component({
  selector: "app-topbar",
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    AvatarModule,
    MenuModule,
    ButtonModule,
    BadgeModule,
    NgIf,
    DarkModeToggleComponent,
  ],
  template: `
    <div class="layout-topbar">
      <div class="layout-topbar-logo-container">
        <button
          class="layout-menu-button layout-topbar-action"
          (click)="layoutService.onMenuToggle()"
        >
          <i class="pi pi-bars"></i>
        </button>
      </div>

      <div class="layout-topbar-actions">
        <div class="layout-config-menu">
          <app-dark-mode-toggle></app-dark-mode-toggle>
        </div>

        <div
          *ngIf="authService.currentUserValue"
          class="flex items-center gap-3"
        >
          <button
            type="button"
            pButton
            icon="pi pi-sign-out"
            class="p-button-text p-button-plain p-button-danger"
            (click)="logout()"
            tooltip="Logout"
            label="Logout"
          ></button>
        </div>

        <div
          *ngIf="!authService.currentUserValue"
          class="flex items-center gap-2"
        >
          <a
            routerLink="/login"
            pButton
            label="Login"
            class="p-button-text"
          ></a>
          <a
            routerLink="/register"
            pButton
            label="Register"
            class="p-button-outlined"
          ></a>
        </div>

        <button
          class="layout-topbar-menu-button layout-topbar-action"
          pStyleClass="@next"
          enterFromClass="hidden"
          enterActiveClass="animate-scalein"
          leaveToClass="hidden"
          leaveActiveClass="animate-fadeout"
          [hideOnOutsideClick]="true"
        >
          <i class="pi pi-ellipsis-v"></i>
        </button>
      </div>
    </div>
  `,
})
export class AppTopbar implements OnInit {
  userMenuItems: MenuItem[] = [];

  constructor(
    public layoutService: LayoutService,
    public authService: AuthService
  ) {
    this.userMenuItems = [
      {
        label: "Profile",
        icon: "pi pi-user",
        routerLink: ["/profile"],
      },
      {
        label: "Settings",
        icon: "pi pi-cog",
        routerLink: ["/settings"],
      },
      {
        separator: true,
      },
      {
        label: "Logout",
        icon: "pi pi-sign-out",
        command: () => this.logout(),
      },
    ];
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem("themePreference");
    if (savedTheme) {
      const isDark = savedTheme === "dark";
      this.layoutService.layoutConfig.update((state) => ({
        ...state,
        darkTheme: isDark,
      }));
    }
  }

  getLogoPath(): string {
    const isDark = this.layoutService.isDarkTheme();
    return isDark
      ? "assets/images/olivesoft-logo-white.png"
      : "assets/images/olivesoft-logo-full-color.png";
  }

  logout() {
    this.authService.logout();
  }
}
