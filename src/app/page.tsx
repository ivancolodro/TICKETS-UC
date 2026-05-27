import Link from "next/link";
import { appConfig } from "@/config/app";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <p className="text-sm text-muted-foreground">UC CHRISTUS</p>
      <h1 className="text-2xl font-semibold">{appConfig.name}</h1>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/portal/new">Portal cliente</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/agent/tickets">Panel agente</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </div>
    </main>
  );
}
