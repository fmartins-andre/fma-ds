import { useLocation } from "@tanstack/react-router";
import { ArrowUpRightIcon } from "lucide-react";
import { Link } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { DOCS_NAV, type NavLink } from "./nav";

function NavItem({ link, onNavigate }: { link: NavLink; onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { page, guide } = link;
  const title = page ? t(($) => $.nav[page]) : guide ? t(($) => $.guides[guide]) : link.title;
  const className =
    "flex h-8 items-center gap-1 rounded-md px-2 text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground";
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {title}
        <ArrowUpRightIcon className="size-3 text-muted-foreground" aria-hidden="true" />
      </a>
    );
  }
  const active = pathname === link.href;
  return (
    <Link
      href={link.href}
      className={className}
      data-active={active}
      aria-current={active ? "page" : undefined}
      onPress={onNavigate}
    >
      {title}
    </Link>
  );
}

/** The docs sidebar's sections; also the body of the mobile menu. */
export function DocsNav({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t(($) => $.nav.docs)} className={cn("flex flex-col gap-6", className)}>
      {DOCS_NAV.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <h4 className="px-2 text-xs font-medium text-muted-foreground">
            {t(($) => $.nav[section.title])}
          </h4>
          <ul className="flex flex-col gap-0.5">
            {section.links.map((link) => (
              <li key={link.href}>
                <NavItem link={link} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
