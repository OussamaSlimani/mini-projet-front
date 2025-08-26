import { Routes } from "@angular/router";
import { Dashboard } from "../pages/dashboard/dashboard";
import { AgentsComponent } from "./agents/agents.component";

export default [
  {
    path: "dashboard",
    component: Dashboard,
  },
  {
    path: "agent",
    component: AgentsComponent,
  },
  { path: "**", redirectTo: "/notfound" },
] as Routes;
