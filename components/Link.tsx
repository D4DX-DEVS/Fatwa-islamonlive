import NextLink from "next/link";
import type { ComponentProps } from "react";

// Next prefetches every link in view, and each prefetch is a server request that renders a page. Pages here are
// cached whole, so clicking is already fast and prefetching only adds requests.
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
