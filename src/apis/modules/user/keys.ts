import { ReqPage } from "@/apis/interface";

export const USER_QUERY_KEYS = {
  LIST: (params: ReqPage) => ["user", "list", params] as const,
  DETAIL: (id: string) => ["user", "detail", id] as const
} as const;
