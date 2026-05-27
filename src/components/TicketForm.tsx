"use client";

import { FormEvent, useState } from "react";

type Ticket = {
  id: number;
  titulo: string;
  descripcion: string;
  solicitante: string;
  email: string;
  categoria: string;
  prioridad: string;
  estado: string;
  createdAt: string;
};

type Props = {
  onCreated: (ticket: Ticket) => void;
};

const initialForm = {
  titulo: "",
  descripcion: "",
  solicitante: "",
  email: "",
  categoria: "soporte",
  prioridad: "media",
};

export default function TicketForm({ onCreated }: Props) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrar el ticket.");
        return;
      }

      onCreated(data);
      setForm(initialForm);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Nuevo ticket</h2>

      {error && <p className="alert alert-error">{error}</p>}
      {success && (
        <p className="alert alert-success">Ticket registrado correctamente.</p>
      )}

      <label>
        Título
        <input
          type="text"
          value={form.titulo}
          onChange={(e) => update("titulo", e.target.value)}
          placeholder="Ej: No puedo acceder al portal"
          required
          maxLength={120}
        />
      </label>

      <label>
        Descripción
        <textarea
          value={form.descripcion}
          onChange={(e) => update("descripcion", e.target.value)}
          placeholder="Describe el problema con detalle..."
          required
          rows={4}
        />
      </label>

      <div className="form-row">
        <label>
          Solicitante
          <input
            type="text"
            value={form.solicitante}
            onChange={(e) => update("solicitante", e.target.value)}
            placeholder="Nombre completo"
            required
          />
        </label>

        <label>
          Correo
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="correo@uc.cl"
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Categoría
          <select
            value={form.categoria}
            onChange={(e) => update("categoria", e.target.value)}
          >
            <option value="soporte">Soporte técnico</option>
            <option value="acceso">Acceso / permisos</option>
            <option value="infraestructura">Infraestructura</option>
            <option value="software">Software</option>
            <option value="general">General</option>
          </select>
        </label>

        <label>
          Prioridad
          <select
            value={form.prioridad}
            onChange={(e) => update("prioridad", e.target.value)}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </label>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Guardando..." : "Registrar ticket"}
      </button>
    </form>
  );
}
