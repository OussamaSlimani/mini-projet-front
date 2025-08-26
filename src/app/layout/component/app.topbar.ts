import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { StyleClassModule } from "primeng/styleclass";
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
    DarkModeToggleComponent,
  ],
  template: `
    <div class="layout-topbar">
      <div class="layout-topbar-logo-container">
        <button class="layout-menu-button layout-topbar-action">
          <i class="pi pi-bars"></i>
        </button>
      </div>

      <div class="layout-topbar-actions">
        <!-- Dark mode toggle -->
        <div class="layout-config-menu">
          <app-dark-mode-toggle></app-dark-mode-toggle>
        </div>

        <!-- Logout button -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            pButton
            icon="pi pi-sign-out"
            class="p-button-text p-button-plain p-button-danger"
            label="Logout"
          ></button>
        </div>

        <!-- Auth links -->
        <div class="flex items-center gap-2">
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

        <!-- Topbar ellipsis menu button -->
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
export class AppTopbar {}
