// Factories das entidades. Validam enums e campos obrigatórios.
// IMPORTANTE: Edital NÃO tem scoreAderencia nem recomendacao gravados.
// Esses campos são derivados em lib/derivados.js.

import {
  Modalidade,
  StatusEdital,
  CategoriaCriterio,
  SituacaoCriterio,
  TipoChecklist,
  Criticidade,
  TipoRisco,
  Severidade,
  Probabilidade,
  PapelUsuario,
} from './enums.js';
import { gerarId } from '../lib/ids.js';

function exigir(valor, nome) {
  if (valor === undefined || valor === null || valor === '') {
    throw new Error(`Campo obrigatório ausente: ${nome}`);
  }
  return valor;
}

function validarEnum(enumObj, valor, nome) {
  if (!enumObj.contem(valor)) {
    throw new Error(`Valor inválido para ${nome}: ${valor}`);
  }
  return valor;
}

/** Campos derivados que jamais podem ser gravados em um Edital. */
export const CAMPOS_DERIVADOS_EDITAL = Object.freeze([
  'scoreAderencia',
  'recomendacao',
  'diasRestantes',
]);

export function removerDerivados(edital) {
  const copia = { ...edital };
  for (const campo of CAMPOS_DERIVADOS_EDITAL) delete copia[campo];
  return copia;
}

/**
 * @typedef {Object} Edital
 * @property {string} id
 * @property {string} titulo
 * @property {string} orgao
 * @property {string} modalidade  Modalidade
 * @property {string} numeroProcesso
 * @property {number} valorEstimado  em centavos (inteiro)
 * @property {string} textoBruto
 * @property {string} dataImportacao  ISO
 * @property {string|null} dataAberturaPropostas  YYYY-MM-DD
 * @property {string|null} dataLimiteEnvio  YYYY-MM-DD
 * @property {string} status  StatusEdital
 * @property {string[]} criterioIds
 * @property {string[]} checklistIds
 * @property {string[]} riscoIds
 * @property {string|null} responsavelId
 * @property {string[]} tags
 */
export function criarEdital(dados) {
  const d = removerDerivados(dados);
  const valorEstimado = d.valorEstimado ?? 0;
  if (!Number.isInteger(valorEstimado) || valorEstimado < 0) {
    throw new Error('valorEstimado deve ser inteiro em centavos, >= 0');
  }
  return {
    id: d.id ?? gerarId('ed'),
    titulo: exigir(d.titulo, 'titulo'),
    orgao: exigir(d.orgao, 'orgao'),
    modalidade: validarEnum(Modalidade, d.modalidade ?? Modalidade.OUTRO, 'modalidade'),
    numeroProcesso: d.numeroProcesso ?? '',
    valorEstimado,
    textoBruto: d.textoBruto ?? '',
    dataImportacao: d.dataImportacao ?? new Date().toISOString(),
    dataAberturaPropostas: d.dataAberturaPropostas ?? null,
    dataLimiteEnvio: d.dataLimiteEnvio ?? null,
    status: validarEnum(StatusEdital, d.status ?? StatusEdital.IMPORTADO, 'status'),
    criterioIds: [...(d.criterioIds ?? [])],
    checklistIds: [...(d.checklistIds ?? [])],
    riscoIds: [...(d.riscoIds ?? [])],
    responsavelId: d.responsavelId ?? null,
    tags: [...(d.tags ?? [])],
  };
}

/**
 * @typedef {Object} CriterioElegibilidade
 * @property {string} id
 * @property {string} editalId
 * @property {string} categoria  CategoriaCriterio
 * @property {string} descricao
 * @property {string} trechoOrigem
 * @property {boolean} obrigatorio
 * @property {string} situacao  SituacaoCriterio
 * @property {number} peso  1-5
 * @property {string} evidencia
 * @property {string} notaInterna
 */
export function criarCriterio(d) {
  const peso = d.peso ?? 3;
  if (!Number.isInteger(peso) || peso < 1 || peso > 5) {
    throw new Error('peso deve ser inteiro entre 1 e 5');
  }
  return {
    id: d.id ?? gerarId('cr'),
    editalId: exigir(d.editalId, 'editalId'),
    categoria: validarEnum(CategoriaCriterio, d.categoria, 'categoria'),
    descricao: exigir(d.descricao, 'descricao'),
    trechoOrigem: d.trechoOrigem ?? '',
    obrigatorio: Boolean(d.obrigatorio),
    situacao: validarEnum(
      SituacaoCriterio,
      d.situacao ?? SituacaoCriterio.NAO_AVALIADO,
      'situacao',
    ),
    peso,
    evidencia: d.evidencia ?? '',
    notaInterna: d.notaInterna ?? '',
  };
}

/**
 * @typedef {Object} ItemChecklist
 * @property {string} id
 * @property {string} editalId
 * @property {string} titulo
 * @property {string} tipo  TipoChecklist
 * @property {string|null} dataLimite  YYYY-MM-DD
 * @property {string} criticidade  Criticidade
 * @property {boolean} concluido
 * @property {string|null} responsavelId
 */
export function criarItemChecklist(d) {
  return {
    id: d.id ?? gerarId('ck'),
    editalId: exigir(d.editalId, 'editalId'),
    titulo: exigir(d.titulo, 'titulo'),
    tipo: validarEnum(TipoChecklist, d.tipo, 'tipo'),
    dataLimite: d.dataLimite ?? null,
    criticidade: validarEnum(Criticidade, d.criticidade ?? Criticidade.MEDIA, 'criticidade'),
    concluido: Boolean(d.concluido),
    responsavelId: d.responsavelId ?? null,
  };
}

/**
 * @typedef {Object} Risco
 * @property {string} id
 * @property {string} editalId
 * @property {string} tipo  TipoRisco
 * @property {string} titulo
 * @property {string} trechoOrigem
 * @property {string} severidade  Severidade
 * @property {string} probabilidade  Probabilidade
 * @property {number} impactoEstimado  em centavos
 * @property {string} mitigacao
 * @property {boolean} aceito
 */
export function criarRisco(d) {
  return {
    id: d.id ?? gerarId('rs'),
    editalId: exigir(d.editalId, 'editalId'),
    tipo: validarEnum(TipoRisco, d.tipo, 'tipo'),
    titulo: exigir(d.titulo, 'titulo'),
    trechoOrigem: d.trechoOrigem ?? '',
    severidade: validarEnum(Severidade, d.severidade ?? Severidade.MEDIO, 'severidade'),
    probabilidade: validarEnum(
      Probabilidade,
      d.probabilidade ?? Probabilidade.MEDIA,
      'probabilidade',
    ),
    impactoEstimado: d.impactoEstimado ?? 0,
    mitigacao: d.mitigacao ?? '',
    aceito: Boolean(d.aceito),
  };
}

/**
 * @typedef {Object} RegistroAprovacao  (append-only)
 * @property {string} id
 * @property {string} editalId
 * @property {string} deStatus
 * @property {string} paraStatus
 * @property {string} usuarioId
 * @property {string} timestamp  ISO
 * @property {string} comentario
 */
export function criarRegistroAprovacao(d) {
  return Object.freeze({
    id: d.id ?? gerarId('ap'),
    editalId: exigir(d.editalId, 'editalId'),
    deStatus: validarEnum(StatusEdital, d.deStatus, 'deStatus'),
    paraStatus: validarEnum(StatusEdital, d.paraStatus, 'paraStatus'),
    usuarioId: exigir(d.usuarioId, 'usuarioId'),
    timestamp: d.timestamp ?? new Date().toISOString(),
    comentario: d.comentario ?? '',
  });
}

/**
 * @typedef {Object} Usuario
 * @property {string} id
 * @property {string} nome
 * @property {string} papel  PapelUsuario
 */
export function criarUsuario(d) {
  return {
    id: d.id ?? gerarId('us'),
    nome: exigir(d.nome, 'nome'),
    papel: validarEnum(PapelUsuario, d.papel ?? PapelUsuario.ANALISTA, 'papel'),
  };
}
