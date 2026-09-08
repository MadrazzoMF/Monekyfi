import { useParams } from 'react-router-dom';

export function DetalheEdital() {
  const { id } = useParams();
  return <p>Detalhe do edital {id} (placeholder — Fase 3)</p>;
}
