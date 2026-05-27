import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { canAccessAgentPanel } from "@/lib/rbac/check";
import { appConfig } from "@/config/app";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !canAccessAgentPanel(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/agent/tickets" className="font-semibold text-primary">
              {appConfig.name}
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/agent/tickets" className="hover:text-primary">
                Tickets
              </Link>
              <Link href="/agent/tickets/new" className="hover:text-primary">
                Nuevo
              </Link>
              {(session.user.role === "ADMIN" ||
                session.user.role === "SUPERVISOR") && (
                <Link href="/admin/agents" className="hover:text-primary">
                  Administración
                </Link>
              )}
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
