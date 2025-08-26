import { Component } from "@angular/core";

@Component({
  standalone: true,
  selector: "app-footer",
  template: `<div class="layout-footer">&copy; {{ currentYear }}</div>`,
})
export class AppFooter {
  currentYear: number = new Date().getFullYear();
}
