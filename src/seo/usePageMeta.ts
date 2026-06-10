import { useEffect } from "react";
import type { PageMeta } from "./setPageMeta";
import { resetPageMeta, setPageMeta } from "./setPageMeta";

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    setPageMeta(meta);
    return resetPageMeta;
  }, [meta.title, meta.description, meta.path, meta.noindex]);
}
