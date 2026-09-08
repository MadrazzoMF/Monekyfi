import { describe, it, expect, vi, afterEach } from 'vitest';
import { serializar, desserializar, salvarEstado, carregarEstado, SCHEMA_VERSION, CHAVE_STORAGE } from '../state/persistencia.js';
import { criarSeed } from '../domain/seed/editais.seed.js';

function storageFake() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

afterEach(() => vi.restoreAllMocks());

describe('persistência', () => {
  it('roundtrip com versão', () => {
    const s = criarSeed('2026-09-08');
    const texto = serializar(s);
    expect(JSON.parse(texto).schemaVersion).toBe(SCHEMA_VERSION);
    expect(desserializar(texto)).toEqual(s);
  });

  it('salva e carrega do storage', () => {
    const st = storageFake();
    const s = criarSeed('2026-09-08');
    expect(salvarEstado(s, st)).toBe(true);
    expect(st.getItem(CHAVE_STORAGE)).toBeTruthy();
    expect(carregarEstado(st)).toEqual(s);
  });

  it('descarta JSON corrompido, sem envelope ou versão futura', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(desserializar('{nope')).toBeNull();
    expect(desserializar(JSON.stringify({ editais: {} }))).toBeNull();
    expect(desserializar(JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, state: {} }))).toBeNull();
    expect(desserializar(JSON.stringify({ schemaVersion: SCHEMA_VERSION, state: { editais: 'x' } }))).toBeNull();
    expect(desserializar(null)).toBeNull();
  });

  it('sem storage disponível retorna null/false', () => {
    expect(carregarEstado(undefined)).toBeNull();
    expect(salvarEstado({}, undefined)).toBe(false);
  });
});
