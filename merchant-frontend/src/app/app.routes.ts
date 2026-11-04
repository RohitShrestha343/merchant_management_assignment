import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { roleGuard } from "./core/guards/role.guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login").then((m) => m.Login),
  },
  {
    path: "",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./core/layout/main-layout/main-layout").then((m) => m.MainLayout),
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/dashboard/dashboard").then((m) => m.Dashboard),
      },
      {
        path: "applications",
        loadComponent: () =>
          import("./features/applications/application-list/application-list").then(
            (m) => m.ApplicationList,
          ),
      },
      {
        path: "applications/new",
        canActivate: [roleGuard],
        data: { roles: ["SALES", "ADMIN"] },
        loadComponent: () =>
          import("./features/applications/application-wizard/application-wizard").then(
            (m) => m.ApplicationWizard,
          ),
      },
      {
        path: "applications/:id",
        loadComponent: () =>
          import("./features/applications/application-detail/application-detail").then(
            (m) => m.ApplicationDetail,
          ),
      },
      {
        path: "review",
        canActivate: [roleGuard],
        data: { roles: ["REVIEWER", "ADMIN"] },
        loadComponent: () =>
          import("./features/review/review-panel/review-panel").then(
            (m) => m.ReviewPanel,
          ),
      },
      {
        path: "admin/assignments",
        canActivate: [roleGuard],
        data: { roles: ["ADMIN"] },
        loadComponent: () =>
          import("./features/admin/assignment-management/assignment-management").then(
            (m) => m.AssignmentManagement,
          ),
      },
      { path: "", pathMatch: "full", redirectTo: "dashboard" },
    ],
  },
  { path: "**", redirectTo: "dashboard" },
];
