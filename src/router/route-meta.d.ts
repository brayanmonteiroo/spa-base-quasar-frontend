import "vue-router";
import type { BreadcrumbMeta } from "@/composables/useBreadcrumbs";

declare module "vue-router" {
  interface RouteMeta {
    guest?: boolean;
    requiresAuth?: boolean;
    permission?: string;
    breadcrumb?: BreadcrumbMeta;
  }
}

export {};
