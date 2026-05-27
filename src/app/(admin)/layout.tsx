import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { canAccessAdminPanel } from "@/lib/rbac/check";
import { appConfig } from "@/config/app";

const nav = [
  { href: "/admin/agents", label: "Agentes" },
  { href: "/admin/departments", label: "Departamentos" },
  { href: "/admin/teams", label: "Equipos" },
  { href: "/admin/customers", label: "Clientes" },
  { href: "/agent/tickets", label: "← Panel tickets" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessAdminPanel(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-primary">
              {appConfig.name} — Admin
            </span>
            <nav className="flex flex-wrap gap-3 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="text-sm text-muted-foreground">
            {session.user.name ?? session.user.email}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
