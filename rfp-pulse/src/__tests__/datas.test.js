import { describe, it, expect } from 'vitest';
import { calcularDiasRestantes, prazoVencido, somarDias } from '../lib/datas.js';

describe('calcularDiasRestantes', () => {
  const hoje = '2026-09-08';

  it('conta dias futuros', () => {
    expect(calcularDiasRestantes('2026-09-10', hoje)).toBe(2);
    expect(calcularDiasRestantes('2026-11-07', hoje)).toBe(60);
  });

  it('retorna 0 quando vence hoje', () => {
    expect(calcularDiasRestantes('2026-09-08', hoje)).toBe(0);
  });

  it('retorna negativo para prazo vencido', () => {
    expect(calcularDiasRestantes('2026-09-05', hoje)).toBe(-3);
    expect(prazoVencido('2026-09-05', hoje)).toBe(true);
    expect(prazoVencido('2026-09-08', hoje)).toBe(false);
  });

  it('retorna null sem data limite ou data inválida', () => {
    expect(calcularDiasRestantes(null, hoje)).toBeNull();
    expect(calcularDiasRestantes('', hoje)).toBeNull();
    expect(calcularDiasRestantes('abc', hoje)).toBeNull();
    expect(calcularDiasRestantes('2026-09-10', null)).toBeNull();
  });

  it('aceita ISO completo e Date, ignorando horário', () => {
    expect(calcularDiasRestantes('2026-09-10T23:59:00.000Z', hoje)).toBe(2);
    expect(calcularDiasRestantes('2026-09-10', new Date('2026-09-08T03:00:00Z'))).toBe(2);
  });

  it('atravessa virada de ano e mês', () => {
    expect(calcularDiasRestantes('2027-01-01', '2026-12-31')).toBe(1);
    expect(calcularDiasRestantes('2026-03-01', '2026-02-28')).toBe(1);
  });

  it('somarDias é o inverso', () => {
    expect(somarDias(hoje, 2)).toBe('2026-09-10');
    expect(somarDias(hoje, -3)).toBe('2026-09-05');
    expect(calcularDiasRestantes(somarDias(hoje, 60), hoje)).toBe(60);
  });
});
