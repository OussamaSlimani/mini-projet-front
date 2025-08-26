import { Component } from '@angular/core';
import { LayoutService } from '../service/layout.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <button 
      type="button" 
      class="layout-topbar-action" 
      (click)="toggleDarkMode()"
      [attr.aria-label]="layoutService.isDarkTheme() ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <i [ngClass]="{ 
        'pi': true, 
        'pi-moon': layoutService.isDarkTheme(), 
        'pi-sun': !layoutService.isDarkTheme() 
      }"></i>
    </button>
  `
})
export class DarkModeToggleComponent {
  constructor(public layoutService: LayoutService) {}

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => {
      const newThemeState = !state.darkTheme;
      localStorage.setItem('themePreference', newThemeState ? 'dark' : 'light');
      return { ...state, darkTheme: newThemeState };
    });
  }
}
