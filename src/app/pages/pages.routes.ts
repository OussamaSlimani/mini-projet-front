import { Routes } from "@angular/router";
import { AuthGuard } from "../pages/guards/auth.guard";
import { UserRole } from "../pages/models/user.model";
import { Dashboard } from "../pages/dashboard/dashboard";
import { AgentsComponent } from "./agents/agents.component";

export default [
  {
    path: "dashboard",
    component: Dashboard,
    canActivate: [AuthGuard],
    data: { role: UserRole.USER },
  },
  {
    path: "agent",
    component: AgentsComponent,
    canActivate: [AuthGuard],
    data: { role: UserRole.USER },
  },
  { path: "**", redirectTo: "/notfound" },
] as Routes;
