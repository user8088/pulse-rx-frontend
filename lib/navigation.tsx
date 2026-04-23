"use client";

import { usePathname, useRouter as useNextRouter } from "next/navigation";
import NextLink from "next/link";

/**
 * When the browser URL starts with /test (e.g. /test/products),
 * all internal links and router navigations should keep the /test prefix
 * so users stay inside the test route.
 */
function usePrefix(): string {
  const pathname = usePathname();
  return pathname?.startsWith("/test") ? "/test" : "";
}

function prefixPath(href: string, prefix: string): string {
  if (!prefix || !href.startsWith("/")) return href;
  return prefix + href;
}

/** Drop-in replacement for next/link that auto-prepends /test when needed. */
export default function Link({
  href,
  ...rest
}: React.ComponentProps<typeof NextLink>) {
  const prefix = usePrefix();

  let prefixedHref: typeof href;
  if (typeof href === "string") {
    prefixedHref = prefixPath(href, prefix);
  } else if (href && typeof href === "object" && "pathname" in href && href.pathname) {
    prefixedHref = { ...href, pathname: prefixPath(href.pathname!, prefix) };
  } else {
    prefixedHref = href;
  }

  return <NextLink href={prefixedHref} {...rest} />;
}

/** Drop-in replacement for next/navigation's useRouter that auto-prepends /test. */
export function useRouter() {
  const router = useNextRouter();
  const prefix = usePrefix();

  return {
    ...router,
    push: (url: string, opts?: Parameters<typeof router.push>[1]) =>
      router.push(prefixPath(url, prefix), opts),
    replace: (url: string, opts?: Parameters<typeof router.replace>[1]) =>
      router.replace(prefixPath(url, prefix), opts),
    prefetch: (url: string, opts?: Parameters<typeof router.prefetch>[1]) =>
      router.prefetch(prefixPath(url, prefix), opts),
  };
}
