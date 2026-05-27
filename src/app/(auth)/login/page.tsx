"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validateRes = await fetch("/api/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, totp: needs2FA ? totp : undefined }),
    });
    const validate = await validateRes.json();

    if (!validate.ok) {
      setLoading(false);
      if (validate.error === "2FA_REQUIRED") {
        setNeeds2FA(true);
        setError("Ingresa el código de tu aplicación autenticadora");
        return;
      }
      setError(validate.error ?? "Credenciales incorrectas");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      totp: needs2FA ? totp : "",
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Error al iniciar sesión");
      return;
    }

    router.push("/agent/tickets");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar sesión — UC CHRISTUS</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={needs2FA}
              />
            </div>

            {!needs2FA && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {needs2FA && (
              <div className="space-y-2">
                <Label htmlFor="totp">Código 2FA (6 dígitos)</Label>
                <Input
                  id="totp"
                  inputMode="numeric"
                  maxLength={6}
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : needs2FA ? "Verificar" : "Entrar"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/agent/tickets" })}
            >
              Continuar con Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
