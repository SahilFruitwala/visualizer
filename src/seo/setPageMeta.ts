import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE_PATH,
  absoluteUrl,
} from "./config";

export interface PageMeta {
  title: string;
  description: string;
  /** Pathname used for canonical and og:url (defaults to current pathname). */
  path?: string;
  /** When true, ask crawlers not to index this page. */
  noindex?: boolean;
}

function upsertMeta(
  selector: string,
  create: () => HTMLElement,
  attr: string,
  value: string,
) {
  let el = document.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setMeta(name: string, content: string) {
  upsertMeta(
    `meta[name="${name}"]`,
    () => {
      const el = document.createElement("meta");
      el.setAttribute("name", name);
      return el;
    },
    "content",
    content,
  );
}

function setProperty(property: string, content: string) {
  upsertMeta(
    `meta[property="${property}"]`,
    () => {
      const el = document.createElement("meta");
      el.setAttribute("property", property);
      return el;
    },
    "content",
    content,
  );
}

function setLink(rel: string, href: string) {
  upsertMeta(
    `link[rel="${rel}"]`,
    () => {
      const el = document.createElement("link");
      el.setAttribute("rel", rel);
      return el;
    },
    "href",
    href,
  );
}

export function setPageMeta({ title, description, path, noindex }: PageMeta) {
  const pathname = path ?? window.location.pathname;
  const pageUrl = absoluteUrl(pathname);
  const imageUrl = absoluteUrl(OG_IMAGE_PATH);

  document.title = title;

  setMeta("description", description);
  setMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

  setProperty("og:title", title);
  setProperty("og:description", description);
  setProperty("og:type", "website");
  setProperty("og:url", pageUrl);
  setProperty("og:image", imageUrl);
  setProperty("og:image:alt", title);

  setMeta("twitter:card", "summary");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", imageUrl);

  setLink("canonical", pageUrl);
}

export function resetPageMeta() {
  setPageMeta({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  });
}
