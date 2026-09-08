// Seed com 10 editais fictícios do contexto brasileiro.
// Datas relativas a `hoje` para que "vence em 2 dias" continue verdadeiro.
// IDs fixos (ed_01, cr_01_1...) para facilitar uso pelo console e testes.

import { criarEstadoInicial } from '../../state/estadoInicial.js';
import {
  criarEdital,
  criarCriterio,
  criarItemChecklist,
  criarRisco,
  criarRegistroAprovacao,
  criarUsuario,
} from '../entidades.js';
import { somarDias } from '../../lib/datas.js';

const R$ = (reais) => Math.round(reais * 100); // -> centavos

function inserir(colecao, ent) {
  colecao.porId[ent.id] = ent;
  colecao.ids.push(ent.id);
  return ent;
}

export function criarSeed(hoje = new Date().toISOString().slice(0, 10)) {
  const s = criarEstadoInicial();
  const d = (dias) => somarDias(hoje, dias);
  const iso = (dias) => `${d(dias)}T10:00:00.000Z`;

  // ---------- usuários ----------
  inserir(s.usuarios, criarUsuario({ id: 'us_ana', nome: 'Ana Ribeiro', papel: 'analista' }));
  inserir(s.usuarios, criarUsuario({ id: 'us_bruno', nome: 'Bruno Tavares', papel: 'analista' }));
  inserir(s.usuarios, criarUsuario({ id: 'us_carla', nome: 'Carla Mendes', papel: 'aprovador' }));
  inserir(s.usuarios, criarUsuario({ id: 'us_admin', nome: 'Diego Nunes', papel: 'admin' }));
  s.usuarioAtualId = 'us_ana';

  // ---------- helper para montar um edital com filhos ----------
  let nCr = 0, nCk = 0, nRs = 0, nAp = 0;
  function edital(dados, { criterios = [], checklist = [], riscos = [], historico = [] }) {
    const ed = criarEdital(dados);
    for (const c of criterios) {
      nCr += 1;
      const ent = inserir(s.criterios, criarCriterio({ id: `cr_${String(nCr).padStart(2, '0')}`, editalId: ed.id, ...c }));
      ed.criterioIds.push(ent.id);
    }
    for (const c of checklist) {
      nCk += 1;
      const ent = inserir(s.checklist, criarItemChecklist({ id: `ck_${String(nCk).padStart(2, '0')}`, editalId: ed.id, ...c }));
      ed.checklistIds.push(ent.id);
    }
    for (const r of riscos) {
      nRs += 1;
      const ent = inserir(s.riscos, criarRisco({ id: `rs_${String(nRs).padStart(2, '0')}`, editalId: ed.id, ...r }));
      ed.riscoIds.push(ent.id);
    }
    for (const h of historico) {
      nAp += 1;
      inserir(s.aprovacoes, criarRegistroAprovacao({ id: `ap_${String(nAp).padStart(2, '0')}`, editalId: ed.id, ...h }));
    }
    inserir(s.editais, ed);
    return ed;
  }

  // 1. Pregão municipal — em análise, vence em 2 dias, GO provável
  edital(
    {
      id: 'ed_01',
      titulo: 'Contratação de serviços de suporte técnico em TI',
      orgao: 'Prefeitura Municipal de Campinas/SP',
      modalidade: 'pregao',
      numeroProcesso: 'PE 045/2026',
      valorEstimado: R$(1_850_000),
      textoBruto: 'O MUNICÍPIO DE CAMPINAS torna público que realizará licitação na modalidade PREGÃO ELETRÔNICO para contratação de empresa especializada em suporte técnico de TI, help desk níveis 1 e 2, pelo período de 12 meses. Exige-se atestado de capacidade técnica compatível com 50% do objeto e certidões negativas federais, estaduais e municipais.',
      dataImportacao: iso(-5),
      dataAberturaPropostas: d(3),
      dataLimiteEnvio: d(2),
      status: 'em_analise',
      responsavelId: 'us_ana',
      tags: ['ti', 'suporte', 'municipal'],
    },
    {
      criterios: [
        { categoria: 'juridica', descricao: 'Contrato social e alterações registradas', trechoOrigem: 'item 9.1.a', obrigatorio: true, situacao: 'atende', peso: 3, evidencia: 'Contrato social consolidado 2025' },
        { categoria: 'fiscal', descricao: 'Certidão negativa de débitos federais', trechoOrigem: 'item 9.2.b', obrigatorio: true, situacao: 'atende', peso: 4, evidencia: 'CND válida até ' + d(40) },
        { categoria: 'tecnica', descricao: 'Atestado de capacidade técnica de 50% do objeto', trechoOrigem: 'item 9.3', obrigatorio: true, situacao: 'atende', peso: 5, evidencia: 'Atestado Prefeitura de Jundiaí' },
        { categoria: 'economico_financeira', descricao: 'Índice de liquidez geral >= 1,0', trechoOrigem: 'item 9.4', obrigatorio: true, situacao: 'atende', peso: 3 },
        { categoria: 'tecnica', descricao: 'Certificação ITIL da equipe', trechoOrigem: 'item 9.3.2', obrigatorio: false, situacao: 'parcial', peso: 2, notaInterna: '2 de 4 analistas certificados' },
      ],
      checklist: [
        { titulo: 'Emitir CND estadual', tipo: 'documento', dataLimite: d(1), criticidade: 'bloqueante', concluido: true, responsavelId: 'us_ana' },
        { titulo: 'Assinar declaração de ME/EPP', tipo: 'assinatura', dataLimite: d(2), criticidade: 'alta', concluido: false, responsavelId: 'us_bruno' },
        { titulo: 'Enviar proposta no Comprasnet', tipo: 'prazo', dataLimite: d(2), criticidade: 'bloqueante', concluido: false, responsavelId: 'us_ana' },
      ],
      riscos: [
        { tipo: 'prazo', titulo: 'Prazo de envio muito curto', trechoOrigem: 'item 4', severidade: 'alto', probabilidade: 'alta', impactoEstimado: R$(0), mitigacao: 'Priorizar equipe nas próximas 48h', aceito: true },
        { tipo: 'financeiro', titulo: 'Pagamento em 60 dias após medição', trechoOrigem: 'cláusula 12', severidade: 'medio', probabilidade: 'alta', impactoEstimado: R$(90_000), mitigacao: 'Provisionar capital de giro', aceito: false },
      ],
      historico: [
        { deStatus: 'importado', paraStatus: 'em_analise', usuarioId: 'us_ana', timestamp: iso(-4), comentario: 'Início da triagem' },
      ],
    },
  );

  // 2. Concorrência estadual — NO_GO por critério eliminatório (fiscal)
  edital(
    {
      id: 'ed_02',
      titulo: 'Obras de pavimentação asfáltica em rodovias estaduais',
      orgao: 'DER — Departamento de Estradas de Rodagem do Estado de Minas Gerais',
      modalidade: 'concorrencia',
      numeroProcesso: 'CP 012/2026',
      valorEstimado: R$(24_500_000),
      textoBruto: 'Concorrência pública para execução de obras de pavimentação asfáltica, drenagem e sinalização em trecho de 38 km da MG-424. Habilitação exige regularidade fiscal plena, registro no CREA e capital social mínimo de 10% do valor estimado.',
      dataImportacao: iso(-12),
      dataAberturaPropostas: d(20),
      dataLimiteEnvio: d(18),
      status: 'em_analise',
      responsavelId: 'us_bruno',
      tags: ['obras', 'infraestrutura', 'estadual'],
    },
    {
      criterios: [
        { categoria: 'fiscal', descricao: 'Certidão negativa de débitos estaduais de MG', trechoOrigem: 'item 7.2.c', obrigatorio: true, situacao: 'nao_atende', peso: 5, evidencia: 'Débito de ICMS em discussão administrativa', notaInterna: 'ELIMINATÓRIO. Regularização leva ~30 dias.' },
        { categoria: 'tecnica', descricao: 'Registro da empresa e do RT no CREA', trechoOrigem: 'item 7.3.a', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'tecnica', descricao: 'Atestado de pavimentação >= 20 km', trechoOrigem: 'item 7.3.b', obrigatorio: true, situacao: 'atende', peso: 5 },
        { categoria: 'economico_financeira', descricao: 'Capital social >= 10% do valor estimado', trechoOrigem: 'item 7.4', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'documental', descricao: 'Declaração de visita técnica', trechoOrigem: 'item 7.5', obrigatorio: true, situacao: 'atende', peso: 2 },
      ],
      checklist: [
        { titulo: 'Visita técnica ao trecho MG-424', tipo: 'visita_tecnica', dataLimite: d(10), criticidade: 'bloqueante', concluido: true, responsavelId: 'us_bruno' },
        { titulo: 'Regularizar débito de ICMS', tipo: 'documento', dataLimite: d(15), criticidade: 'bloqueante', concluido: false, responsavelId: 'us_admin' },
        { titulo: 'Garantia de proposta 1%', tipo: 'garantia', dataLimite: d(17), criticidade: 'alta', concluido: false },
      ],
      riscos: [
        { tipo: 'juridico', titulo: 'Inabilitação por pendência fiscal', trechoOrigem: 'item 7.2', severidade: 'critico', probabilidade: 'alta', impactoEstimado: R$(0), mitigacao: 'Parcelar débito antes do prazo', aceito: false },
        { tipo: 'operacional', titulo: 'Mobilização de usina de asfalto a 120 km', severidade: 'alto', probabilidade: 'media', impactoEstimado: R$(800_000), mitigacao: 'Locar usina móvel', aceito: false },
      ],
      historico: [
        { deStatus: 'importado', paraStatus: 'em_analise', usuarioId: 'us_bruno', timestamp: iso(-11) },
      ],
    },
  );

  // 3. RFP privada de banco — triado, 60 dias, GO
  edital(
    {
      id: 'ed_03',
      titulo: 'RFP — Plataforma de onboarding digital de clientes PJ',
      orgao: 'Banco Horizonte S.A.',
      modalidade: 'rfp_privada',
      numeroProcesso: 'RFP-2026-0091',
      valorEstimado: R$(6_200_000),
      textoBruto: 'O Banco Horizonte convida fornecedores a apresentar proposta para desenvolvimento e operação de plataforma de onboarding digital para clientes pessoa jurídica, com integração a bureaus de crédito, KYC e assinatura eletrônica. Exige certificação ISO 27001 e SLA de 99,9%.',
      dataImportacao: iso(-20),
      dataAberturaPropostas: null,
      dataLimiteEnvio: d(60),
      status: 'triado',
      responsavelId: 'us_ana',
      tags: ['privado', 'financeiro', 'software'],
    },
    {
      criterios: [
        { categoria: 'tecnica', descricao: 'Certificação ISO 27001 vigente', trechoOrigem: 'seção 3.1', obrigatorio: true, situacao: 'atende', peso: 5, evidencia: 'Certificado nº BR-27001-4471' },
        { categoria: 'tecnica', descricao: 'Case de onboarding em instituição financeira', trechoOrigem: 'seção 3.2', obrigatorio: true, situacao: 'atende', peso: 5 },
        { categoria: 'economico_financeira', descricao: 'Faturamento anual >= R$ 20 mi', trechoOrigem: 'seção 4', obrigatorio: true, situacao: 'atende', peso: 3 },
        { categoria: 'tecnica', descricao: 'Equipe com certificação AWS', trechoOrigem: 'seção 3.4', obrigatorio: false, situacao: 'atende', peso: 2 },
        { categoria: 'juridica', descricao: 'Aceite integral do MSA padrão do banco', trechoOrigem: 'anexo B', obrigatorio: false, situacao: 'parcial', peso: 3, notaInterna: 'Cláusula de multa 30% precisa negociação' },
      ],
      checklist: [
        { titulo: 'Assinar NDA', tipo: 'assinatura', dataLimite: d(-10), criticidade: 'bloqueante', concluido: true, responsavelId: 'us_ana' },
        { titulo: 'Preparar demo do produto', tipo: 'prazo', dataLimite: d(45), criticidade: 'alta', concluido: false, responsavelId: 'us_bruno' },
        { titulo: 'Enviar proposta técnica e comercial', tipo: 'prazo', dataLimite: d(60), criticidade: 'bloqueante', concluido: false },
      ],
      riscos: [
        { tipo: 'contratual', titulo: 'Multa de 30% por descumprimento de SLA', trechoOrigem: 'anexo B, cl. 14', severidade: 'alto', probabilidade: 'baixa', impactoEstimado: R$(1_860_000), mitigacao: 'Negociar teto de 10%', aceito: false },
        { tipo: 'escopo_aberto', titulo: 'Integrações com bureaus não especificadas', trechoOrigem: 'seção 2.3', severidade: 'medio', probabilidade: 'alta', impactoEstimado: R$(400_000), mitigacao: 'Limitar a 3 bureaus na proposta', aceito: true },
      ],
      historico: [
        { deStatus: 'importado', paraStatus: 'em_analise', usuarioId: 'us_ana', timestamp: iso(-19) },
        { deStatus: 'em_analise', paraStatus: 'triado', usuarioId: 'us_ana', timestamp: iso(-8), comentario: 'Aderência alta, seguir para aprovação' },
      ],
    },
  );

  // 4. Dispensa federal — importado, vence em 2 dias, nada avaliado (indefinido)
  edital(
    {
      id: 'ed_04',
      titulo: 'Aquisição emergencial de licenças de antivírus corporativo',
      orgao: 'Ministério da Gestão e da Inovação em Serviços Públicos',
      modalidade: 'dispensa',
      numeroProcesso: 'DL 23/2026',
      valorEstimado: R$(180_000),
      textoBruto: 'Dispensa de licitação com base no art. 75, II da Lei 14.133/2021 para aquisição de 1.200 licenças de antivírus corporativo por 12 meses. Propostas pelo sistema Compras.gov.br.',
      dataImportacao: iso(0),
      dataAberturaPropostas: d(2),
      dataLimiteEnvio: d(2),
      status: 'importado',
      responsavelId: null,
      tags: ['federal', 'licencas', 'dispensa'],
    },
    {
      criterios: [
        { categoria: 'fiscal', descricao: 'SICAF regular', trechoOrigem: 'item 3', obrigatorio: true, situacao: 'nao_avaliado', peso: 4 },
        { categoria: 'tecnica', descricao: 'Ser revenda autorizada do fabricante', trechoOrigem: 'item 4.1', obrigatorio: true, situacao: 'nao_avaliado', peso: 5 },
      ],
      checklist: [
        { titulo: 'Confirmar cadastro SICAF', tipo: 'documento', dataLimite: d(1), criticidade: 'bloqueante', concluido: false },
      ],
      riscos: [
        { tipo: 'prazo', titulo: 'Menos de 48h para resposta', severidade: 'alto', probabilidade: 'alta', impactoEstimado: R$(0), aceito: false },
      ],
    },
  );

  // 5. Pregão federal — em aprovação, 30 dias, GO com risco crítico aceito
  edital(
    {
      id: 'ed_05',
      titulo: 'Fábrica de software para sistemas do SUS',
      orgao: 'DATASUS / Ministério da Saúde',
      modalidade: 'pregao',
      numeroProcesso: 'PE 118/2026',
      valorEstimado: R$(41_000_000),
      textoBruto: 'Pregão eletrônico para contratação de fábrica de software com métrica em pontos de função, para evolução e sustentação de sistemas do SUS. Exige atestado de 10.000 PF entregues nos últimos 3 anos e certificação CMMI nível 3 ou MPS.BR nível C.',
      dataImportacao: iso(-40),
      dataAberturaPropostas: d(32),
      dataLimiteEnvio: d(30),
      status: 'em_aprovacao',
      responsavelId: 'us_bruno',
      tags: ['federal', 'software', 'saude', 'estrategico'],
    },
    {
      criterios: [
        { categoria: 'tecnica', descricao: 'Atestado de 10.000 PF em 3 anos', trechoOrigem: 'item 10.4.1', obrigatorio: true, situacao: 'atende', peso: 5, evidencia: 'Atestados MEC e INSS somam 14.300 PF' },
        { categoria: 'tecnica', descricao: 'CMMI nível 3 ou MPS.BR nível C', trechoOrigem: 'item 10.4.2', obrigatorio: true, situacao: 'atende', peso: 5, evidencia: 'MPS.BR nível C válido' },
        { categoria: 'fiscal', descricao: 'Regularidade SICAF', trechoOrigem: 'item 10.2', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'economico_financeira', descricao: 'Patrimônio líquido >= 10% do valor', trechoOrigem: 'item 10.5', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'juridica', descricao: 'Não constar no CEIS/CNEP', trechoOrigem: 'item 10.1.3', obrigatorio: true, situacao: 'atende', peso: 3 },
        { categoria: 'tecnica', descricao: 'Experiência com interoperabilidade RNDS', trechoOrigem: 'item 10.4.5', obrigatorio: false, situacao: 'parcial', peso: 3 },
      ],
      checklist: [
        { titulo: 'Aprovação da diretoria', tipo: 'assinatura', dataLimite: d(5), criticidade: 'bloqueante', concluido: false, responsavelId: 'us_carla' },
        { titulo: 'Garantia de proposta 1% (seguro)', tipo: 'garantia', dataLimite: d(25), criticidade: 'alta', concluido: false },
        { titulo: 'Enviar proposta', tipo: 'prazo', dataLimite: d(30), criticidade: 'bloqueante', concluido: false },
      ],
      riscos: [
        { tipo: 'financeiro', titulo: 'Glosa de pontos de função na contagem final', trechoOrigem: 'anexo III', severidade: 'critico', probabilidade: 'media', impactoEstimado: R$(4_000_000), mitigacao: 'Contagem detalhada validada por CFPS', aceito: true },
        { tipo: 'operacional', titulo: 'Escalar 60 devs em 90 dias', severidade: 'alto', probabilidade: 'media', impactoEstimado: R$(1_200_000), mitigacao: 'Parceria com 2 consultorias', aceito: false },
      ],
      historico: [
        { deStatus: 'importado', paraStatus: 'em_analise', usuarioId: 'us_bruno', timestamp: iso(-39) },
        { deStatus: 'em_analise', paraStatus: 'triado', usuarioId: 'us_bruno', timestamp: iso(-20) },
        { deStatus: 'triado', paraStatus: 'em_aprovacao', usuarioId: 'us_bruno', timestamp: iso(-3), comentario: 'Encaminhado à diretoria' },
      ],
    },
  );

  // 6. RFP privada varejo — aprovado, 15 dias, GO
  edital(
    {
      id: 'ed_06',
      titulo: 'RFP — Implantação de WMS para centros de distribuição',
      orgao: 'Supermercados Bom Preço Ltda.',
      modalidade: 'rfp_privada',
      numeroProcesso: 'RFP-LOG-2026-07',
      valorEstimado: R$(3_400_000),
      textoBruto: 'Solicitação de proposta para implantação de sistema de gestão de armazém (WMS) em 3 centros de distribuição no Nordeste, incluindo integração com ERP SAP e coletores de dados.',
      dataImportacao: iso(-50),
      dataAberturaPropostas: null,
      dataLimiteEnvio: d(15),
      status: 'aprovado',
      responsavelId: 'us_ana',
      tags: ['privado', 'varejo', 'logistica'],
    },
    {
      criterios: [
        { categoria: 'tecnica', descricao: 'Parceria oficial com fabricante do WMS', trechoOrigem: 'seção 2', obrigatorio: true, situacao: 'atende', peso: 5 },
        { categoria: 'tecnica', descricao: 'Mínimo 3 implantações com integração SAP', trechoOrigem: 'seção 2.2', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'documental', descricao: 'Apresentar cronograma detalhado', trechoOrigem: 'seção 5', obrigatorio: false, situacao: 'atende', peso: 2 },
        { categoria: 'economico_financeira', descricao: 'Aceitar pagamento por marcos', trechoOrigem: 'seção 6', obrigatorio: false, situacao: 'atende', peso: 2 },
      ],
      checklist: [
        { titulo: 'Visita técnica ao CD de Recife', tipo: 'visita_tecnica', dataLimite: d(-20), criticidade: 'alta', concluido: true, responsavelId: 'us_ana' },
        { titulo: 'Proposta comercial assinada pela diretoria', tipo: 'assinatura', dataLimite: d(12), criticidade: 'bloqueante', concluido: false, responsavelId: 'us_carla' },
      ],
      riscos: [
        { tipo: 'escopo_aberto', titulo: 'Quantidade de coletores não definida', trechoOrigem: 'seção 3.4', severidade: 'medio', probabilidade: 'media', impactoEstimado: R$(150_000), mitigacao: 'Precificar por unidade', aceito: true },
      ],
      historico: [
        { deStatus: 'importado', paraStatus: 'em_analise', usuarioId: 'us_ana', timestamp: iso(-49) },
        { deStatus: 'em_analise', paraStatus: 'triado', usuarioId: 'us_ana', timestamp: iso(-35) },
        { deStatus: 'triado', paraStatus: 'em_aprovacao', usuarioId: 'us_ana', timestamp: iso(-30) },
        { deStatus: 'em_aprovacao', paraStatus: 'aprovado', usuarioId: 'us_carla', timestamp: iso(-25), comentario: 'Aprovado com margem mínima de 18%' },
      ],
    },
  );

  // 7. Pregão estadual — proposta enviada, prazo já vencido (histórico)
  edital(
    {
      id: 'ed_07',
      titulo: 'Fornecimento de merenda escolar para rede estadual',
      orgao: 'Secretaria de Educação do Estado da Bahia',
      modalidade: 'pregao',
      numeroProcesso: 'PE 302/2026',
      valorEstimado: R$(12_800_000),
      textoBruto: 'Pregão eletrônico por registro de preços para fornecimento de gêneros alimentícios para merenda escolar em 180 unidades da rede estadual, com entregas semanais.',
      dataImportacao: iso(-70),
      dataAberturaPropostas: d(-14),
      dataLimiteEnvio: d(-15),
      status: 'proposta_enviada',
      responsavelId: 'us_bruno',
      tags: ['estadual', 'alimentos', 'registro_precos'],
    },
    {
      criterios: [
        { categoria: 'documental', descricao: 'Alvará sanitário vigente', trechoOrigem: 'item 8.3', obrigatorio: true, situacao: 'atende', peso: 5 },
        { categoria: 'tecnica', descricao: 'Frota refrigerada própria ou locada', trechoOrigem: 'item 8.4', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'fiscal', descricao: 'Certidões negativas', trechoOrigem: 'item 8.2', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'tecnica', descricao: 'Nutricionista responsável técnico', trechoOrigem: 'item 8.5', obrigatorio: false, situacao: 'atende', peso: 2 },
      ],
      checklist: [
        { titulo: 'Enviar proposta', tipo: 'prazo', dataLimite: d(-15), criticidade: 'bloqueante', concluido: true, responsavelId: 'us_bruno' },
        { titulo: 'Amostras dos produtos', tipo: 'documento', dataLimite: d(-16), criticidade: 'alta', concluido: true },
      ],
      riscos: [
        { tipo: 'operacional', titulo: 'Entregas semanais em 180 pontos', severidade: 'alto', probabilidade: 'media', impactoEstimado: R$(500_000), mitigacao: 'Roteirização com transportadora parceira', aceito: true },
        { tipo: 'financeiro', titulo: 'Reajuste anual abaixo da inflação de alimentos', severidade: 'medio', probabilidade: 'alta', impactoEstimado: R$(600_000), aceito: true },
      ],
      historico: [
        { deStatus: 'importado', paraStatus: 'em_analise', usuarioId: 'us_bruno', timestamp: iso(-69) },
        { deStatus: 'em_analise', paraStatus: 'triado', usuarioId: 'us_bruno', timestamp: iso(-55) },
        { deStatus: 'triado', paraStatus: 'em_aprovacao', usuarioId: 'us_bruno', timestamp: iso(-45) },
        { deStatus: 'em_aprovacao', paraStatus: 'aprovado', usuarioId: 'us_carla', timestamp: iso(-30) },
        { deStatus: 'aprovado', paraStatus: 'proposta_enviada', usuarioId: 'us_bruno', timestamp: iso(-15), comentario: 'Enviada no Licitações-e' },
      ],
    },
  );

  // 8. Concorrência municipal — descartado, NO_GO por atestado técnico (eliminatório)
  edital(
    {
      id: 'ed_08',
      titulo: 'Construção de Unidade de Pronto Atendimento (UPA 24h)',
      orgao: 'Prefeitura Municipal de Sorocaba/SP',
      modalidade: 'concorrencia',
      numeroProcesso: 'CP 003/2026',
      valorEstimado: R$(9_700_000),
      textoBruto: 'Concorrência pública para construção de UPA porte II com área construída de 1.500 m². Exige atestado de execução de obra hospitalar com área mínima de 1.000 m² e responsável técnico com acervo compatível.',
      dataImportacao: iso(-30),
      dataAberturaPropostas: d(25),
      dataLimiteEnvio: d(24),
      status: 'descartado',
      responsavelId: 'us_ana',
      tags: ['obras', 'saude', 'municipal'],
    },
    {
      criterios: [
        { categoria: 'tecnica', descricao: 'Atestado de obra hospitalar >= 1.000 m²', trechoOrigem: 'item 11.3.1', obrigatorio: true, situacao: 'nao_atende', peso: 5, notaInterna: 'Maior obra de saúde executada: 620 m². Eliminatório.' },
        { categoria: 'tecnica', descricao: 'RT com acervo em obras de saúde', trechoOrigem: 'item 11.3.2', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'fiscal', descricao: 'Regularidade fiscal', trechoOrigem: 'item 11.2', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'economico_financeira', descricao: 'Garantia de proposta 1%', trechoOrigem: 'item 11.4', obrigatorio: true, situacao: 'atende', peso: 3 },
      ],
      checklist: [
        { titulo: 'Buscar consórcio com construtora hospitalar', tipo: 'documento', dataLimite: d(10), criticidade: 'bloqueante', concluido: false },
      ],
      riscos: [
        { tipo: 'juridico', titulo: 'Inabilitação técnica certa sem consórcio', severidade: 'critico', probabilidade: 'alta', impactoEstimado: R$(0), aceito: false },
      ],
      historico: [
        { deStatus: 'importado', paraStatus: 'em_analise', usuarioId: 'us_ana', timestamp: iso(-29) },
        { deStatus: 'em_analise', paraStatus: 'descartado', usuarioId: 'us_ana', timestamp: iso(-22), comentario: 'Critério técnico eliminatório sem alternativa de consórcio' },
      ],
    },
  );

  // 9. Pregão federal — reprovado na aprovação, score baixo (condicional -> reprovado)
  edital(
    {
      id: 'ed_09',
      titulo: 'Outsourcing de impressão para unidades da Receita Federal',
      orgao: 'Receita Federal do Brasil — SRRF 8ª Região',
      modalidade: 'pregao',
      numeroProcesso: 'PE 077/2026',
      valorEstimado: R$(2_100_000),
      textoBruto: 'Pregão eletrônico para outsourcing de impressão com fornecimento de 350 equipamentos multifuncionais, insumos e manutenção em 42 unidades no Estado de São Paulo.',
      dataImportacao: iso(-35),
      dataAberturaPropostas: d(8),
      dataLimiteEnvio: d(7),
      status: 'reprovado',
      responsavelId: 'us_bruno',
      tags: ['federal', 'outsourcing', 'impressao'],
    },
    {
      criterios: [
        { categoria: 'fiscal', descricao: 'SICAF regular', trechoOrigem: 'item 9.1', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'tecnica', descricao: 'Atestado de 200 equipamentos em contrato único', trechoOrigem: 'item 9.3', obrigatorio: true, situacao: 'parcial', peso: 5, notaInterna: 'Maior contrato: 140 equipamentos. Somatório aceito? Dúvida no edital.' },
        { categoria: 'tecnica', descricao: 'Assistência técnica em até 4h em todas as unidades', trechoOrigem: 'item 9.4', obrigatorio: false, situacao: 'nao_atende', peso: 4 },
        { categoria: 'economico_financeira', descricao: 'Índices contábeis', trechoOrigem: 'item 9.5', obrigatorio: true, situacao: 'atende', peso: 3 },
        { categoria: 'tecnica', descricao: 'Equipamentos com certificação Energy Star', trechoOrigem: 'item 9.6', obrigatorio: false, situacao: 'parcial', peso: 2 },
      ],
      checklist: [
        { titulo: 'Pedido de esclarecimento sobre somatório de atestados', tipo: 'prazo', dataLimite: d(-5), criticidade: 'alta', concluido: true },
      ],
      riscos: [
        { tipo: 'operacional', titulo: 'SLA de 4h em 42 unidades no interior', severidade: 'alto', probabilidade: 'alta', impactoEstimado: R$(300_000), aceito: false },
        { tipo: 'financeiro', titulo: 'Margem projetada de 6%', severidade: 'alto', probabilidade: 'alta', impactoEstimado: R$(0), aceito: false },
      ],
      historico: [
        { deStatus: 'importado', paraStatus: 'em_analise', usuarioId: 'us_bruno', timestamp: iso(-34) },
        { deStatus: 'em_analise', paraStatus: 'triado', usuarioId: 'us_bruno', timestamp: iso(-20) },
        { deStatus: 'triado', paraStatus: 'em_aprovacao', usuarioId: 'us_bruno', timestamp: iso(-12) },
        { deStatus: 'em_aprovacao', paraStatus: 'reprovado', usuarioId: 'us_carla', timestamp: iso(-6), comentario: 'Margem insuficiente e risco de SLA' },
      ],
    },
  );

  // 10. RFP privada (outro) — importado, vencido há 3 dias, condicional
  edital(
    {
      id: 'ed_10',
      titulo: 'Chamada para parceiro de manutenção predial em campus universitário',
      orgao: 'Fundação Universitária Serra Azul',
      modalidade: 'outro',
      numeroProcesso: 'CH 2026-04',
      valorEstimado: R$(950_000),
      textoBruto: 'Chamada pública para seleção de empresa de manutenção predial preventiva e corretiva em campus de 40.000 m², com equipe residente e atendimento 24h.',
      dataImportacao: iso(-10),
      dataAberturaPropostas: null,
      dataLimiteEnvio: d(-3),
      status: 'importado',
      responsavelId: null,
      tags: ['privado', 'facilities'],
    },
    {
      criterios: [
        { categoria: 'tecnica', descricao: 'Equipe residente mínima de 6 pessoas', trechoOrigem: 'item 5', obrigatorio: true, situacao: 'atende', peso: 4 },
        { categoria: 'tecnica', descricao: 'Experiência em campus universitário', trechoOrigem: 'item 5.2', obrigatorio: false, situacao: 'nao_atende', peso: 3 },
        { categoria: 'documental', descricao: 'PCMSO e PGR atualizados', trechoOrigem: 'item 6', obrigatorio: true, situacao: 'parcial', peso: 3 },
        { categoria: 'juridica', descricao: 'Seguro de responsabilidade civil', trechoOrigem: 'item 7', obrigatorio: false, situacao: 'nao_avaliado', peso: 2 },
      ],
      checklist: [
        { titulo: 'Confirmar se prazo foi prorrogado', tipo: 'prazo', dataLimite: d(-3), criticidade: 'bloqueante', concluido: false },
      ],
      riscos: [
        { tipo: 'prazo', titulo: 'Prazo de envio já expirado', severidade: 'critico', probabilidade: 'alta', impactoEstimado: R$(0), mitigacao: 'Verificar prorrogação com a fundação', aceito: false },
      ],
    },
  );

  return s;
}
