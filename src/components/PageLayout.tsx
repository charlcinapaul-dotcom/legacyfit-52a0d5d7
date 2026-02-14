import { ReactNode } from "react";
import { SiteNavigation } from "./SiteNavigation";
import { SiteFooter } from "./SiteFooter";

interface PageLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export const PageLayout = ({ children, hideFooter }: PageLayoutProps) => (
  <div className="min-h-screen bg-background flex flex-col">
    <SiteNavigation />
    <main className="flex-1 pt-16">{children}</main>
    {!hideFooter && <SiteFooter />}
  </div>
);
