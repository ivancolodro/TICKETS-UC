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
  tickets: Ticket[];
};

const prioridadClass: Record<string, string> = {
  baja: "badge-baja",
  media: "badge-media",
  alta: "badge-alta",
  urgente: "badge-urgente",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function TicketList({ tickets }: Props) {
  if (tickets.length === 0) {
    return (
      <section className="list">
        <h2>Tickets registrados</h2>
        <p className="empty">Aún no hay tickets. Usa el formulario para crear uno.</p>
      </section>
    );
  }

  return (
    <section className="list">
      <h2>Tickets registrados ({tickets.length})</h2>
      <ul className="ticket-cards">
        {tickets.map((t) => (
          <li key={t.id} className="ticket-card">
            <header>
              <span className="ticket-id">#{t.id}</span>
              <span className={`badge ${prioridadClass[t.prioridad] ?? ""}`}>
                {t.prioridad}
              </span>
            </header>
            <h3>{t.titulo}</h3>
            <p className="ticket-desc">{t.descripcion}</p>
            <footer>
              <span>{t.solicitante}</span>
              <span>{t.categoria}</span>
              <span>{formatDate(t.createdAt)}</span>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}
