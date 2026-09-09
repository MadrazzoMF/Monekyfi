import { describe, it, expect } from 'vitest';
import { TRANSICOES, podeTransicionar, transicoesPossiveis, STATUS_TERMINAIS } from '../domain/maquinaEstados.js';
import { StatusEdital } from '../domain/enums.js';

describe('máquina de estados do Edital', () => {
  it('cobre todos os status do enum', () => {
    expect(Object.keys(TRANSICOES).sort()).toEqual([...StatusEdital.valores].sort());
  });

  it('fluxo feliz completo', () => {
    const fluxo = ['importado', 'em_analise', 'triado', 'em_aprovacao', 'aprovado', 'proposta_enviada'];
    for (let i = 0; i < fluxo.length - 1; i++) {
      expect(podeTransicionar(fluxo[i], fluxo[i + 1])).toBe(true);
    }
  });

  it('desvios permitidos', () => {
    expect(podeTransicionar('em_analise', 'descartado')).toBe(true);
    expect(podeTransicionar('em_aprovacao', 'reprovado')).toBe(true);
  });

  it('rejeita pular etapas e voltar', () => {
    expect(podeTransicionar('importado', 'triado')).toBe(false);
    expect(podeTransicionar('importado', 'aprovado')).toBe(false);
    expect(podeTransicionar('triado', 'em_analise')).toBe(false);
    expect(podeTransicionar('aprovado', 'em_aprovacao')).toBe(false);
  });

  it('rejeita descartar/reprovar fora do ponto certo', () => {
    expect(podeTransicionar('importado', 'descartado')).toBe(false);
    expect(podeTransicionar('triado', 'descartado')).toBe(false);
    expect(podeTransicionar('em_analise', 'reprovado')).toBe(false);
    expect(podeTransicionar('aprovado', 'reprovado')).toBe(false);
  });

  it('status terminais não saem', () => {
    expect([...STATUS_TERMINAIS].sort()).toEqual(['descartado', 'proposta_enviada', 'reprovado']);
    for (const s of STATUS_TERMINAIS) {
      for (const destino of StatusEdital.valores) {
        expect(podeTransicionar(s, destino)).toBe(false);
      }
    }
  });

  it('auto-transição e status desconhecido são inválidos', () => {
    expect(podeTransicionar('em_analise', 'em_analise')).toBe(false);
    expect(podeTransicionar('inexistente', 'em_analise')).toBe(false);
    expect(podeTransicionar('em_analise', 'inexistente')).toBe(false);
    expect(podeTransicionar(undefined, 'em_analise')).toBe(false);
  });

  it('transicoesPossiveis', () => {
    expect(transicoesPossiveis('em_analise')).toEqual(['triado', 'descartado']);
    expect(transicoesPossiveis('nada')).toEqual([]);
  });
});
