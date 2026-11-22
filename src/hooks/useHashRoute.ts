import { useCallback, useEffect, useState } from "react";

/**
 * Tiny hash router (works when the built app is served as a single static
 * file, no server rewrites needed).
 *   #/            → home
 *   #/about       → about
 *   #/contact     → contact
 *   #/movie/<id>  → movie clips page
 */
export type Route =
  | { name: "home" }
  | { name: "about" }
  | { name: "contact" }
  | { name: "movie"; id: string };

function parse(hash: string): Route {
  const path = hash.replace(/^#/, "") || "/";
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "about") return { name: "about" };
  if (parts[0] === "contact") return { name: "contact" };
  if (parts[0] === "movie" && parts[1]) return { name: "movie", id: parts[1] };
  return { name: "home" };
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  const onChange = useCallback(() => {
    setRoute(parse(window.location.hash));
    window.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, [onChange]);
  return route;
}
