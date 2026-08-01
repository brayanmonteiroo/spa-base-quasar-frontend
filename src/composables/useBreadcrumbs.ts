import { computed } from "vue";
import {
  useRoute,
  useRouter,
  type RouteLocationNormalizedLoaded,
  type RouteLocationRaw,
  type RouteRecordName
} from "vue-router";

export type BreadcrumbLabel =
  | string
  | ((route: RouteLocationNormalizedLoaded) => string);

export interface BreadcrumbMeta {
  /** Texto do crumb (ou função para rótulos dinâmicos). */
  label: BreadcrumbLabel;
  /** Nome da rota-pai na trilha (ex.: admin-users). */
  parent?: string;
}

export interface BreadcrumbItem {
  label: string;
  to?: RouteLocationRaw;
}

function resolveLabel(
  meta: BreadcrumbMeta,
  route: RouteLocationNormalizedLoaded
): string {
  return typeof meta.label === "function" ? meta.label(route) : meta.label;
}

/**
 * Monta a trilha a partir de `meta.breadcrumb` (+ `parent`).
 * Manutenção: só declarar meta nas rotas — o layout renderiza sozinho.
 */
export function useBreadcrumbs() {
  const route = useRoute();
  const router = useRouter();

  const items = computed((): BreadcrumbItem[] => {
    const trail: { label: string; name: RouteRecordName }[] = [];
    const visited = new Set<RouteRecordName>();

    let currentName: RouteRecordName | null | undefined = route.name;
    let currentMeta = route.meta.breadcrumb;

    while (currentName && currentMeta && !visited.has(currentName)) {
      visited.add(currentName);
      trail.push({
        label: resolveLabel(currentMeta, route),
        name: currentName
      });

      const parentName = currentMeta.parent;
      if (!parentName) {
        break;
      }

      const parent = router
        .getRoutes()
        .find(record => record.name === parentName);
      if (!parent?.meta.breadcrumb) {
        break;
      }

      currentName = parentName;
      currentMeta = parent.meta.breadcrumb;
    }

    return trail.reverse().map((crumb, index, all) => {
      const isLast = index === all.length - 1;

      return {
        label: crumb.label,
        ...(isLast ? {} : { to: { name: crumb.name } })
      };
    });
  });

  return { items };
}
