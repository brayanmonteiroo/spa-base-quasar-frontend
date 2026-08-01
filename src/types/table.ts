export type SortDirection = "asc" | "desc";

export interface TableListParams {
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: SortDirection;
}

export function sortDirectionFromDescending(
  descending: boolean
): SortDirection {
  return descending ? "desc" : "asc";
}
