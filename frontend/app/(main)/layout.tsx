// app/(main)/layout.tsx — Route group layout with sidebar nav
import { SideNav } from "@/components/organisms/side-nav";
import { Separator } from "@/components/atoms/separator";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border flex flex-col">
        <div className="px-4 py-5">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            OMS Admin
          </p>
        </div>
        <Separator />
        <SideNav />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
