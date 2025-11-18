"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function AppShell({ children }) {
  const pathname = usePathname() || "";
  // Hide footer for admin routes and auth/landing pages
  const hideOnPrefixes = ["/admin", "/login", "/register", "/projects", "/browse", "/request", "/groups",  "/announcements"];
  const hideFooter = pathname === "/" || hideOnPrefixes.some(p => pathname.startsWith(p));

  return (
    <>
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}
