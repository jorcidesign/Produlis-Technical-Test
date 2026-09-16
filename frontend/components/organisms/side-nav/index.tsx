"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  UsersIcon,
  PackageIcon,
  ClipboardListIcon,
} from "lucide-react";

const navLinks = [
  { href: "/customers", label: "Clientes", icon: UsersIcon },
  { href: "/products", label: "Productos", icon: PackageIcon },
  { href: "/orders", label: "Órdenes", icon: ClipboardListIcon },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
