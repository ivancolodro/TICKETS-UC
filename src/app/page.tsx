"use client";

import { useCallback, useEffect, useState } from "react";
import TicketForm from "@/components/TicketForm";
import TicketList from "@/components/TicketList";

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

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        setTickets(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  function handleCreated(ticket: Ticket) {
    setTickets((prev) => [ticket, ...prev]);
  }

  return (
    <main className="page">
      <header className="hero">
        <h1>Tickets UC</h1>
        <p>Registra solicitudes de soporte en la base de datos.</p>
      </header>

      <div className="layout">
        <TicketForm onCreated={handleCreated} />
        {loading ? (
          <p className="loading">Cargando tickets...</p>
        ) : (
          <TicketList tickets={tickets} />
        )}
      </div>
    </main>
  );
}
