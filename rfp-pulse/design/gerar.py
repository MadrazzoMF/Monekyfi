# Gera os artboards .dc.html do canvas de design a partir dos tokens reais do app.
import json, os

T = dict(bg='#080a12', surface='#0e111c', raised='#131725', overlay='#1a1f32', line='#20263c', line2='#343c5a',
         ink='#eaeef8', muted='#96a0bc', faint='#5e6884', accent='#818cf8', accent2='#6366f1',
         go='#34d399', nogo='#fb7185', cond='#fbbf24', info='#60a5fa')

ICON = {
 'painel': 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
 'importar': 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2',
 'busca': 'M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z',
 'filtro': 'M4 5h16l-6 8v5l-4 2v-7z',
 'x': 'M18 6L6 18M6 6l12 12',
 'check': 'M20 6L9 17l-5-5',
 'alerta': 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
 'info': 'M12 16v-4m0-4h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z',
 'relogio': 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z',
 'moeda': 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
 'arquivo': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8m8 4H8m2-8H8',
 'lista': 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
 'escudo': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
 'fluxo': 'M6 3v12m0 0a3 3 0 103 3m-3-3a3 3 0 003 3m9-15a3 3 0 100 6 3 3 0 000-6zm0 6c0 6-6 6-9 9',
 'seta': 'M5 12h14m-7-7l7 7-7 7',
 'voltar': 'M19 12H5m7 7l-7-7 7-7',
 'sol': 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.4-6.4l-.7.7M6.3 17.7l-.7.7m12.8 0l-.7-.7M6.3 6.3l-.7-.7M12 17a5 5 0 100-10 5 5 0 000 10z',
 'usuario': 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m12-14a4 4 0 11-8 0 4 4 0 018 0z',
 'mais': 'M12 5v14m-7-7h14',
 'lixo': 'M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z',
 'olho': 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 100-6 3 3 0 000 6z',
 'faisca': 'M12 2l1.8 5.5L19 9l-5.2 1.5L12 16l-1.8-5.5L5 9l5.2-1.5zM19 16l.9 2.6L22 19.5l-2.1.9L19 23l-.9-2.6L16 19.5l2.1-.9z',
 'predio': 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01',
 'calendario': 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
 'cima': 'M12 19V5m-7 7l7-7 7 7', 'baixo': 'M12 5v14m7-7l-7 7-7-7', 'ordenar': 'M8 9l4-4 4 4M8 15l4 4 4-4',
 'exemplo': 'M4 4h16v16H4zM8 9h8M8 13h6',
}
def ic(n, s=16, cor='currentColor', sw=1.8):
    return (f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{cor}" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="{ICON[n]}"></path></svg>')

CSS = f"""
    body {{ margin: 0; background: {T['bg']}; color: {T['ink']}; font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-size: 14px; -webkit-font-smoothing: antialiased; }}
    a {{ color: {T['accent']}; text-decoration: none; }} a:hover {{ color: {T['ink']}; }}
    .mono {{ font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace; }}
    .tab {{ font-variant-numeric: tabular-nums; }}
"""
FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap">'

def head(w, h, accent_tweak=True):
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  {FONTS}
  <style>{CSS}</style>
</helmet>
<div style="width: {w}px; height: {h}px; display: flex; background: {T['bg']}; overflow: hidden;">"""

def tail(accent_tweak=True):
    if accent_tweak:
        return f"""</div>
</x-dc>
<script data-dc-script data-props='{{"accent":{{"editor":"color","default":"{T['accent']}","options":["{T['accent']}","#60a5fa","#2dd4bf","#f472b6"],"section":"Tema"}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{ accent: this.props.accent ?? '{T['accent']}' }}; }}
}}
</script>
</body>
</html>
"""
    return "</div>\n</x-dc>\n</body>\n</html>\n"

# ---------- peças ----------
def badge(txt, tom='neutral', dot=False):
    cores = {'neutral': (T['raised'], T['line'], T['muted']), 'go': ('rgba(52,211,153,.10)', 'rgba(52,211,153,.25)', T['go']),
             'nogo': ('rgba(251,113,133,.10)', 'rgba(251,113,133,.25)', T['nogo']), 'cond': ('rgba(251,191,36,.10)', 'rgba(251,191,36,.25)', T['cond']),
             'info': ('rgba(96,165,250,.10)', 'rgba(96,165,250,.25)', T['info']), 'accent': ('rgba(129,140,248,.10)', 'rgba(129,140,248,.25)', '{{accent}}'),
             'outline': ('transparent', T['line'], T['muted'])}
    bg, bd, fg = cores[tom]
    peso = 500 if tom == 'outline' else 600
    d = f'<span style="width: 6px; height: 6px; border-radius: 999px; background: {fg};"></span>' if dot else ''
    return (f'<span style="display: inline-flex; align-items: center; gap: 6px; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: {peso}; '
            f'line-height: 16px; white-space: nowrap; border: 1px solid {bd}; background: {bg}; color: {fg};">{d}{txt}</span>')

def btn(txt, tipo='primary', icone=None, sm=False):
    pad = '6px 10px' if sm else '8px 14px'; fs = '12px' if sm else '14px'
    base = f'display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 8px; padding: {pad}; font-size: {fs}; font-weight: 500; white-space: nowrap;'
    if tipo == 'primary':
        st = f'{base} color: #fff; border: 1px solid transparent; background: linear-gradient(180deg, {{{{accent}}}}, {T["accent2"]}); box-shadow: 0 1px 0 0 rgba(255,255,255,.15) inset, 0 6px 16px -6px rgba(0,0,0,.55);'
    elif tipo == 'secondary':
        st = f'{base} color: {T["ink"]}; border: 1px solid {T["line"]}; background: {T["raised"]};'
    elif tipo == 'ghost':
        st = f'{base} color: {T["muted"]}; border: 1px solid transparent; background: transparent;'
    elif tipo == 'danger':
        st = f'{base} color: {T["nogo"]}; border: 1px solid rgba(251,113,133,.3); background: rgba(251,113,133,.10);'
    elif tipo == 'success':
        st = f'{base} color: {T["go"]}; border: 1px solid rgba(52,211,153,.3); background: rgba(52,211,153,.10);'
    i = ic(icone, 15 if not sm else 14) if icone else ''
    return f'<button style="{st}">{i}{txt}</button>'

def input_(placeholder, w='100%', icone=None, extra=''):
    i = f'<span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: {T["faint"]}; display: flex;">{ic(icone)}</span>' if icone else ''
    pl = '36px' if icone else '12px'
    return (f'<div style="position: relative; width: {w};">{i}<div style="height: 36px; box-sizing: border-box; border-radius: 8px; border: 1px solid {T["line"]}; background: {T["raised"]}; '
            f'color: {T["faint"]}; font-size: 14px; padding: 0 12px 0 {pl}; display: flex; align-items: center;">{placeholder}</div>{extra}</div>')

def select(txt, w='auto', sm=False):
    h = '30px' if sm else '36px'; fs = '12px' if sm else '14px'
    return (f'<span style="height: {h}; width: {w}; box-sizing: border-box; border-radius: 8px; border: 1px solid {T["line"]}; background: {T["raised"]}; color: {T["ink"]}; font-size: {fs}; '
            f'padding: 0 10px 0 12px; display: inline-flex; align-items: center; justify-content: space-between; gap: 10px; white-space: nowrap;">{txt}{ic("baixo", 12, T["faint"])}</span>')

def label(txt):
    return f'<span style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; color: {T["faint"]};">{txt}</span>'

def sidebar(ativo):
    def item(nome, icone, rota):
        on = rota == ativo
        bg = 'rgba(129,140,248,.15)' if on else 'transparent'
        cor = T['ink'] if on else T['muted']
        icor = '{{accent}}' if on else T['muted']
        return (f'<a href="#" style="display: flex; align-items: center; gap: 12px; border-radius: 8px; padding: 8px 12px; font-size: 14px; font-weight: 500; color: {cor}; background: {bg};">'
                f'{ic(icone, 16, icor)}{nome}</a>')
    return f"""
  <aside style="width: 232px; box-sizing: border-box; flex-shrink: 0; display: flex; flex-direction: column; gap: 24px; padding: 20px 16px; border-right: 1px solid {T['line']}; background: rgba(14,17,28,.8);">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; color: #fff; background: linear-gradient(135deg, {{{{accent}}}}, {T['accent2']}); box-shadow: 0 0 0 1px rgba(129,140,248,.4), 0 8px 24px -8px rgba(129,140,248,.5);">{ic('faisca', 16, '#fff', 2)}</span>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 15px; font-weight: 600; letter-spacing: -.01em; line-height: 1;">RFP-Pulse</span>
        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: .14em; color: {T['faint']}; line-height: 1;">triagem de editais</span>
      </div>
    </div>
    <nav style="display: flex; flex-direction: column; gap: 4px;">
      {item('Dashboard', 'painel', 'dash')}
      {item('Importar edital', 'importar', 'novo')}
    </nav>
    <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
      <div style="border-radius: 8px; border: 1px solid {T['line']}; background: rgba(19,23,37,.4); padding: 12px; font-size: 11px; line-height: 1.6; color: {T['faint']};">
        <div style="margin-bottom: 4px; font-weight: 500; color: {T['muted']};">Atalhos</div>
        <div style="display: flex; align-items: center; gap: 8px;"><span class="mono" style="display: inline-flex; height: 20px; min-width: 20px; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid {T['line']}; background: {T['raised']}; padding: 0 4px; font-size: 10px;">/</span> buscar</div>
        <div style="display: flex; align-items: center; gap: 8px;"><span class="mono" style="display: inline-flex; height: 20px; min-width: 20px; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid {T['line']}; background: {T['raised']}; padding: 0 4px; font-size: 10px;">n</span> novo edital</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; border-radius: 8px; border: 1px solid {T['line']}; background: rgba(19,23,37,.6); padding: 8px;">
        <span style="display: grid; place-items: center; width: 28px; height: 28px; border-radius: 999px; background: rgba(129,140,248,.15); color: {{{{accent}}}}; font-size: 12px; font-weight: 600;">AR</span>
        <span style="flex: 1; font-size: 12px; color: {T['ink']};">Ana Ribeiro · Analista</span>
        {ic('baixo', 12, T['faint'])}
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: {T['faint']};"><span>dados locais</span>{ic('sol', 16, T['muted'])}</div>
    </div>
  </aside>"""

def card(inner, pad='16px 20px', extra=''):
    return (f'<div style="background: {T["surface"]}; border: 1px solid {T["line"]}; border-radius: 14px; box-shadow: 0 1px 0 0 {T["line"]} inset, 0 8px 24px -12px rgba(0,0,0,.45); padding: {pad}; {extra}">{inner}</div>')

def kpi(rot, val, cor=T['ink'], icone='arquivo', fs='26px'):
    return card(f"""<div style="position: relative; display: flex; flex-direction: column; gap: 8px;">
        <span style="position: absolute; right: 0; top: 0; width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; background: {T['raised']}; color: {cor if cor != T['ink'] else T['faint']};">{ic(icone, 15)}</span>
        <div style="padding-right: 36px;">{label(rot)}</div>
        <span class="tab" style="font-size: {fs}; line-height: 1; font-weight: 600; letter-spacing: -.02em; color: {cor};">{val}</span>
      </div>""", pad='16px')

def score_bar(v):
    cor = T['go'] if v >= 70 else T['cond'] if v >= 40 else T['nogo']
    return (f'<div style="display: flex; align-items: center; gap: 8px; width: 80px;"><span class="tab" style="width: 24px; text-align: right; font-size: 14px; font-weight: 600; color: {cor};">{v}</span>'
            f'<div style="flex: 1; height: 6px; border-radius: 999px; background: {T["line"]}; overflow: hidden;"><div style="height: 100%; width: {v}%; border-radius: 999px; background: {cor};"></div></div></div>')

def prazo(txt, tom):
    cor = {'nogo': T['nogo'], 'cond': T['cond'], 'ink': T['ink']}[tom]
    peso = 600 if tom != 'ink' else 500
    return f'<span class="tab" style="font-size: 14px; font-weight: {peso}; color: {cor};">{txt}</span>'

REC = {'go': ('GO', 'go'), 'no_go': ('NO-GO', 'nogo'), 'condicional': ('Condicional', 'cond'), 'indefinido': ('Indefinido', 'neutral')}
STATUS = {'importado': ('Importado', 'neutral'), 'em_analise': ('Em análise', 'info'), 'triado': ('Triado', 'accent'), 'em_aprovacao': ('Em aprovação', 'cond'),
          'aprovado': ('Aprovado', 'go'), 'proposta_enviada': ('Proposta enviada', 'go'), 'descartado': ('Descartado', 'neutral'), 'reprovado': ('Reprovado', 'nogo')}

LINHAS = [
 ('Fornecimento de merenda escolar para rede estadual', 'Secretaria de Educação do Estado da Bahia', 'PE 302/2026', ['Pregão', '#estadual', '#alimentos'], 'proposta_enviada', 'R$ 12.800.000,00', ('vencido há 15 d', 'nogo', '24/08/2026'), 100, 'go', 'BT', 'Bruno'),
 ('Chamada para parceiro de manutenção predial em campus universitário', 'Fundação Universitária Serra Azul', 'CH 2026-04', ['Outro', '#privado', '#facilities'], 'importado', 'R$ 950.000,00', ('vencido há 3 d', 'nogo', '05/09/2026'), 55, 'condicional', None, None),
 ('Contratação de serviços de suporte técnico em TI', 'Prefeitura Municipal de Campinas/SP', 'PE 045/2026', ['Pregão', '#ti', '#suporte'], 'em_analise', 'R$ 1.850.000,00', ('2 d', 'nogo', '10/09/2026'), 94, 'go', 'AR', 'Ana'),
 ('Aquisição emergencial de licenças de antivírus corporativo', 'Ministério da Gestão e da Inovação', 'DL 23/2026', ['Dispensa', '#federal', '#licencas'], 'importado', 'R$ 180.000,00', ('2 d', 'nogo', '10/09/2026'), 0, 'indefinido', None, None),
 ('Outsourcing de impressão para unidades da Receita Federal', 'Receita Federal do Brasil — SRRF 8ª Região', 'PE 077/2026', ['Pregão', '#federal', '#outsourcing'], 'reprovado', 'R$ 2.100.000,00', ('7 d', 'cond', '15/09/2026'), 58, 'condicional', 'BT', 'Bruno'),
 ('Obras de pavimentação asfáltica em rodovias estaduais', 'DER — Departamento de Estradas de Rodagem de MG', 'CP 012/2026', ['Concorrência', '#obras', '#infraestrutura'], 'em_analise', 'R$ 24.500.000,00', ('18 d', 'ink', '26/09/2026'), 75, 'no_go', 'BT', 'Bruno'),
 ('Fábrica de software para sistemas do SUS', 'DATASUS / Ministério da Saúde', 'PE 118/2026', ['Pregão', '#federal', '#software'], 'em_aprovacao', 'R$ 41.000.000,00', ('30 d', 'ink', '08/10/2026'), 94, 'go', 'BT', 'Bruno'),
]

def linha(l):
    tit, org, num, tags, st, val, (pz, ptom, pdata), sc, rec, ini, nome = l
    tagsh = ''.join(badge(t, 'outline') for t in tags)
    resp = (f'<span style="display: inline-flex; align-items: center; gap: 8px; color: {T["muted"]};"><span style="display: grid; place-items: center; width: 24px; height: 24px; border-radius: 999px; background: {T["raised"]}; border: 1px solid {T["line"]}; font-size: 10px; font-weight: 600; color: {T["ink"]};">{ini}</span>{nome}</span>'
            if ini else f'<span style="color: {T["faint"]};">—</span>')
    td = f'padding: 14px 12px; border-bottom: 1px solid {T["line"]}; vertical-align: middle;'
    return f"""<tr>
          <td style="{td} min-width: 256px; max-width: 416px;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <a href="#" style="font-weight: 500; color: {T['ink']};">{tit}</a>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: {T['muted']};">{ic('predio', 12, T['faint'])}<span>{org}</span><span style="color: {T['faint']};">· {num}</span></div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">{tagsh}</div>
            </div>
          </td>
          <td style="{td}">{badge(*STATUS[st])}</td>
          <td class="tab" style="{td} text-align: right; white-space: nowrap;">{val}</td>
          <td style="{td} white-space: nowrap;"><div style="display: flex; flex-direction: column; gap: 2px;">{prazo(pz, ptom)}<span style="font-size: 11px; color: {T['faint']};">{pdata}</span></div></td>
          <td style="{td}">{score_bar(sc)}</td>
          <td style="{td}">{badge(REC[rec][0], REC[rec][1], dot=True)}</td>
          <td style="{td} white-space: nowrap;">{resp}</td>
        </tr>"""

def th(txt, sort=None, right=False):
    i = ic('cima' if sort == 'asc' else 'ordenar', 12, '{{accent}}' if sort else T['faint'])
    al = 'right' if right else 'left'
    return (f'<th style="text-align: {al}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: {T["faint"]}; padding: 12px; border-bottom: 1px solid {T["line"]}; background: {T["surface"]}; white-space: nowrap;">'
            f'<span style="display: inline-flex; align-items: center; gap: 4px;">{txt}{i}</span></th>')

def chip(txt, on=False, icone=None):
    bg = 'rgba(129,140,248,.15)' if on else 'transparent'; bd = 'rgba(129,140,248,.5)' if on else T['line']; cor = T['ink'] if on else T['muted']
    i = ic(icone, 13) if icone else ''
    return f'<span style="display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; border: 1px solid {bd}; background: {bg}; padding: 4px 10px; font-size: 12px; font-weight: 500; color: {cor};">{i}{txt}</span>'

# ---------- Main: dashboard ----------
def dashboard():
    kpis = ''.join([
        kpi('Editais ativos', '10'), kpi('GO', '5', T['go'], 'check'), kpi('Condicional', '2', T['cond'], 'info'), kpi('NO-GO', '2', T['nogo'], 'x'),
        kpi('Vencem em 7 dias', '3', T['cond'], 'relogio'), kpi('Vencidos', '2', T['nogo'], 'alerta'), kpi('Valor em análise', 'R$ 102,7 mi', T['ink'], 'moeda', '19px'),
    ])
    kbd = f'<span class="mono" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); display: inline-flex; height: 20px; min-width: 20px; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid {T["line"]}; background: {T["raised"]}; padding: 0 4px; font-size: 10px; color: {T["faint"]};">/</span>'
    filtros = card(f"""<div style="display: flex; align-items: center; gap: 12px;">
        {input_('Buscar por título, órgão, processo ou tag', 'auto', 'busca', kbd).replace('width: auto;', 'flex: 1;')}
        {select('Todos os responsáveis', '192px', sm=True)}
        {chip('Prazo aberto', icone='relogio')}
        {btn('Filtros', 'secondary', 'filtro', sm=True)}
      </div>""", pad='12px')
    tabela = f"""<div style="background: {T['surface']}; border: 1px solid {T['line']}; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 0 0 {T['line']} inset, 0 8px 24px -12px rgba(0,0,0,.45);">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead><tr>{th('Edital')}{th('Status')}{th('Valor', right=True)}{th('Prazo', 'asc')}{th('Score')}{th('Recomendação')}{th('Responsável')}</tr></thead>
        <tbody>{''.join(linha(l) for l in LINHAS)}</tbody>
      </table>
    </div>"""
    main = f"""
  <main style="flex: 1; min-width: 0; overflow: hidden; padding: 32px; display: flex; flex-direction: column; gap: 20px;">
    <header style="display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;">
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -.02em; line-height: 1.2;">Editais</h2>
        <p style="margin: 0; font-size: 14px; color: {T['muted']};">Triagem, prazos e recomendação go/no-go em um só lugar.</p>
      </div>
      {btn('Importar edital', 'primary', 'importar')}
    </header>
    <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 12px;">{kpis}</div>
    {filtros}
    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: {T['muted']};"><span>Mostrando <strong style="color: {T['ink']};">7</strong> de 10 editais</span><span>Clique em uma linha para abrir</span></div>
    {tabela}
  </main>"""
    return head(1440, 1220) + sidebar('dash') + main + tail()

# ---------- Importar ----------
def importar():
    def passo(n, t, extra=''):
        return (f'<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px;"><h3 style="margin: 0; display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600;">'
                f'<span style="display: grid; place-items: center; width: 24px; height: 24px; border-radius: 999px; background: rgba(129,140,248,.15); color: {{{{accent}}}}; font-size: 12px; font-weight: 700;">{n}</span>{t}</h3>{extra}</div>')
    def campo(r, ctrl, dica=''):
        d = f'<small style="font-size: 12px; color: {T["muted"]};">{dica}</small>' if dica else ''
        return f'<div style="display: flex; flex-direction: column; gap: 6px;">{label(r)}{ctrl}{d}</div>'
    def val(txt, cor=T['ink']):
        return f'<div style="height: 36px; box-sizing: border-box; border-radius: 8px; border: 1px solid {T["line"]}; background: {T["raised"]}; color: {cor}; font-size: 14px; padding: 0 12px; display: flex; align-items: center;">{txt}</div>'
    texto = """A PREFEITURA MUNICIPAL DE SÃO CARLOS torna público que realizará licitação na modalidade PREGÃO ELETRÔNICO nº 088/2026, para contratação de empresa especializada em manutenção de iluminação pública com fornecimento de luminárias LED. Valor estimado: R$ 4.750.000,00. Abertura das propostas em 15/11/2026. Envio das propostas até 13/11/2026.
Exige-se atestado de capacidade técnica compatível com 40% do objeto.
Certidões negativas de débitos federais, estaduais, municipais e trabalhistas (CNDT).
Patrimônio líquido mínimo de 10% do valor estimado.
Certificação ISO 9001 será considerada diferencial na pontuação técnica.
O pagamento será efetuado em 45 dias após a medição mensal.
Multa de 20% sobre o valor do contrato em caso de rescisão por culpa da contratada.
Garantia de proposta de 1% do valor estimado.
A visita técnica é obrigatória e deverá ser agendada com a Secretaria de Obras."""
    def sug(tit, icone, itens, n):
        lis = ''.join(f'<div style="display: flex; align-items: flex-start; gap: 12px; border-radius: 8px; border: 1px solid rgba(129,140,248,.4); background: rgba(129,140,248,.05); padding: 10px; font-size: 14px;">'
                      f'<span style="width: 16px; height: 16px; border-radius: 4px; background: {T["accent2"]}; display: grid; place-items: center; margin-top: 2px;">{ic("check", 12, "#fff", 2.5)}</span>'
                      f'<div style="display: flex; flex-direction: column; gap: 6px;"><span style="line-height: 1.35;">{d}</span><div style="display: flex; gap: 4px;">{b}</div></div></div>' for d, b in itens)
        return (f'<div style="display: flex; flex-direction: column; gap: 8px; min-width: 0;"><div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">'
                f'<span style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600;">{ic(icone, 15, T["faint"])}{tit} <span style="color: {T["faint"]}; font-weight: 400;">{n}</span></span>'
                f'<a href="#" style="font-size: 12px; font-weight: 500;">desmarcar</a></div>{lis}</div>')
    crit = [('Qualificação técnica: Exige-se atestado de capacidade técnica compatível com 40% do objeto', badge('Técnica','outline')+badge('obrigatório','outline')),
            ('Regularidade fiscal: Certidões negativas de débitos federais, estaduais, municipais e trabalhistas (CNDT)', badge('Fiscal','outline')+badge('obrigatório','outline')),
            ('Qualificação econômico-financeira: Patrimônio líquido mínimo de 10% do valor estimado', badge('Econômico-financeira','outline')+badge('obrigatório','outline')),
            ('Qualificação técnica: Certificação ISO 9001 será considerada diferencial', badge('Técnica','outline'))]
    risc = [('Prazo de pagamento de 45 dias', badge('Financeiro','outline')+badge('Médio','info',True)),
            ('Multa ou penalidade contratual', badge('Contratual','outline')+badge('Alto','cond',True))]
    chk = [('Providenciar garantia de 1%', badge('Garantia','outline')+badge('Alta','cond')),
           ('Realizar visita técnica', badge('Visita técnica','outline')+badge('Bloqueante','nogo')),
           ('Reunir: Certidões negativas de débitos…', badge('Documento','outline')+badge('Bloqueante','nogo')),
           ('Enviar proposta dentro do prazo', badge('Prazo','outline')+badge('Bloqueante','nogo'))]
    main = f"""
  <main style="flex: 1; min-width: 0; overflow: hidden; padding: 32px; display: flex; flex-direction: column; gap: 20px;">
    <header style="display: flex; flex-direction: column; gap: 4px;">
      <h2 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -.02em; line-height: 1.2;">Importar edital</h2>
      <p style="margin: 0; font-size: 14px; color: {T['muted']};">Cole ou arraste o texto. O motor de análise extrai os dados e sugere critérios, riscos e checklist.</p>
    </header>
    <div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 20px;">
      {card(passo('1', 'Texto bruto', f'<div style="display: flex; gap: 8px;">{btn("Usar exemplo", "ghost", "exemplo", True)}{btn("Abrir .txt", "secondary", "arquivo", True)}</div>')
            + f'<div class="mono" style="white-space: pre-wrap; border-radius: 8px; border: 1px solid {T["line"]}; background: {T["raised"]}; padding: 12px; font-size: 12.5px; line-height: 1.7; color: {T["ink"]}; min-height: 300px;">{texto}</div>'
            + f'<div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px;"><span style="font-size: 12px; color: {T["faint"]};">812 caracteres</span>{btn("Analisar texto", "primary", "faisca")}</div>'
            + f'<div style="display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; border-radius: 8px; border: 1px solid rgba(52,211,153,.3); background: rgba(52,211,153,.10); padding: 10px 12px; font-size: 14px; line-height: 1.4; color: {T["go"]};">{ic("check", 16, T["go"])}<span>4 critérios, 2 riscos e 4 itens de checklist sugeridos. Os campos vazios ao lado foram preenchidos automaticamente; revise antes de importar.</span></div>',
            extra='grid-column: span 3; display: flex; flex-direction: column;')}
      {card(passo('2', 'Dados do edital')
            + '<div style="display: flex; flex-direction: column; gap: 12px;">'
            + campo('Título', val('Contratação de empresa especializada em manutenção de iluminação pública'))
            + campo('Órgão / empresa', val('PREFEITURA MUNICIPAL DE SÃO CARLOS'))
            + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;">{campo("Modalidade", select("Pregão", "100%"))}{campo("Nº do processo", val("088/2026"))}</div>'
            + campo('Valor estimado (R$)', val('4.750.000,00'), 'R$ 4.750.000,00')
            + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;">{campo("Abertura das propostas", val("15/11/2026"))}{campo("Limite de envio", val("13/11/2026"))}</div>'
            + campo('Responsável', select('Ana Ribeiro', '100%'))
            + campo('Tags (separadas por vírgula)', val('iluminacao, municipal, led', T['faint']))
            + '</div>', extra='grid-column: span 2;')}
      {card(passo('3', 'Sugestões da análise', badge('10 selecionadas', 'accent'))
            + f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px;">{sug("Critérios", "escudo", crit, "4/4")}{sug("Riscos", "alerta", risc, "2/2")}{sug("Checklist", "lista", chk, "4/4")}</div>',
            extra='grid-column: span 5;')}
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid {T['line']}; padding-top: 12px;">{btn('Cancelar', 'secondary')}{btn('Importar edital', 'primary', 'check')}</div>
  </main>"""
    return head(1440, 1560) + sidebar('novo') + main + tail()

# ---------- Detalhe ----------
def detalhe():
    def fato(icone, r, v):
        return (f'<div style="display: flex; align-items: flex-start; gap: 10px;"><span style="display: grid; place-items: center; width: 28px; height: 28px; border-radius: 6px; background: {T["raised"]}; color: {T["faint"]}; margin-top: 2px;">{ic(icone, 14)}</span>'
                f'<div style="display: flex; flex-direction: column; gap: 3px;">{label(r)}<span style="font-size: 14px;">{v}</span></div></div>')
    anel = f"""<div style="position: relative; width: 68px; height: 68px; display: grid; place-items: center;">
          <svg width="68" height="68" style="transform: rotate(-90deg);"><circle cx="34" cy="34" r="31" fill="none" stroke="{T['line']}" stroke-width="6"></circle><circle cx="34" cy="34" r="31" fill="none" stroke="{T['go']}" stroke-width="6" stroke-linecap="round" stroke-dasharray="194.8" stroke-dashoffset="11.7"></circle></svg>
          <span class="tab" style="position: absolute; font-size: 20px; font-weight: 600; color: {T['go']};">94</span>
        </div>"""
    pill = f'<span style="display: inline-flex; align-items: center; gap: 8px; border-radius: 12px; padding: 8px 14px; font-size: 14px; font-weight: 700; letter-spacing: .02em; border: 1px solid rgba(52,211,153,.4); background: rgba(52,211,153,.12); color: {T["go"]};"><span style="width: 8px; height: 8px; border-radius: 999px; background: {T["go"]};"></span>GO</span>'
    def tab(t, icone, n, on=False):
        cor = T['ink'] if on else T['muted']; bb = '{{accent}}' if on else 'transparent'
        cbg = 'rgba(129,140,248,.15)' if on else T['raised']; cbd = 'rgba(129,140,248,.3)' if on else T['line']; ccor = '{{accent}}' if on else T['muted']
        return (f'<span style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 12px; font-size: 14px; font-weight: 500; color: {cor}; border-bottom: 2px solid {bb}; margin-bottom: -1px;">{ic(icone, 15)}{t}'
                f'<span style="border-radius: 999px; background: {cbg}; border: 1px solid {cbd}; padding: 0 6px; font-size: 10px; line-height: 16px; color: {ccor};">{n}</span></span>')
    def seg(opcoes, ativo, tom):
        cores = {'go': T['go'], 'cond': T['cond'], 'nogo': T['nogo'], None: T['ink']}
        bs = ''.join(f'<span style="border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 500; color: {cores[tom] if o == ativo else T["muted"]}; background: {T["overlay"] if o == ativo else "transparent"}; '
                     f'box-shadow: {"0 1px 0 0 rgba(255,255,255,.06) inset, 0 1px 2px rgba(0,0,0,.3)" if o == ativo else "none"};">{o}</span>' for o in opcoes)
        return f'<div style="display: inline-flex; gap: 2px; border-radius: 8px; border: 1px solid {T["line"]}; background: {T["raised"]}; padding: 2px;">{bs}</div>'
    def crit(cat, peso, desc, sit, tom, elim=False):
        bd = 'rgba(251,113,133,.4)' if elim else T['line']; bg = 'rgba(251,113,133,.05)' if elim else 'rgba(19,23,37,.6)'
        av = (f'<div style="display: flex; align-items: flex-start; gap: 10px; border-radius: 8px; border: 1px solid rgba(251,113,133,.3); background: rgba(251,113,133,.10); padding: 6px 12px; font-size: 12px; color: {T["nogo"]};">{ic("alerta", 14, T["nogo"])}Critério eliminatório: força NO-GO independentemente do score.</div>' if elim else '')
        return f"""<div style="border-radius: 12px; border: 1px solid {bd}; background: {bg}; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">{badge(cat, 'outline')}{badge('obrigatório', 'outline')}{badge(f'peso {peso}', 'outline')}<a href="#" style="margin-left: auto; display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500;">{ic('olho', 13)} no texto</a>{ic('baixo', 14, T['muted'])}</div>
            <p style="margin: 0; font-size: 14px; font-weight: 500; line-height: 1.4;">{desc}</p>{av}
            <div style="display: flex; align-items: center; gap: 12px;">{seg(['Atende', 'Parcial', 'Não atende', 'N/A'], sit, tom)}
              <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: {T['muted']};">Peso {select(str(peso), 'auto', sm=True)}</span>
              <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: {T['muted']};"><span style="width: 16px; height: 16px; border-radius: 4px; background: {T['accent2']}; display: grid; place-items: center;">{ic('check', 12, '#fff', 2.5)}</span>Obrigatório</span>
              <span style="margin-left: auto; display: inline-flex;">{ic('lixo', 14, T['muted'])}</span></div>
          </div>"""
    texto = ('Pregão eletrônico para contratação de fábrica de software com métrica em pontos de função, para evolução e sustentação de sistemas do SUS. '
             f'Exige <mark style="background: rgba(129,140,248,.2); color: {T["ink"]}; border-radius: 3px; padding: 0 2px;">atestado de 10.000 PF entregues nos últimos 3 anos</mark> e '
             f'<mark style="background: rgba(129,140,248,.45); color: {T["ink"]}; border-radius: 3px; padding: 0 2px; box-shadow: 0 0 0 2px rgba(129,140,248,.6);">certificação CMMI nível 3 ou MPS.BR nível C</mark>. '
             f'<mark style="background: rgba(251,191,36,.2); color: {T["ink"]}; border-radius: 3px; padding: 0 2px;">Glosa de pontos de função na contagem final</mark> conforme anexo III.')
    main = f"""
  <main style="flex: 1; min-width: 0; overflow: hidden; padding: 32px; display: flex; flex-direction: column; gap: 20px;">
    <a href="#" style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: {T['muted']};">{ic('voltar', 14)} Dashboard</a>
    {card(f'''<div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;">
        <div style="display: flex; flex-direction: column; gap: 8px; min-width: 0;">
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">{badge('Em aprovação', 'cond')}{badge('Pregão', 'outline')}{badge('PE 118/2026', 'outline')}{badge('#federal', 'outline')}{badge('#software', 'outline')}{badge('#saude', 'outline')}</div>
          <h2 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -.02em; line-height: 1.2;">Fábrica de software para sistemas do SUS</h2>
          <p style="margin: 0; display: flex; align-items: center; gap: 6px; font-size: 14px; color: {T['muted']};">{ic('predio', 14, T['faint'])}DATASUS / Ministério da Saúde</p>
        </div>
        <div style="display: flex; align-items: center; gap: 20px; border-radius: 12px; border: 1px solid {T['line']}; background: rgba(19,23,37,.6); padding: 12px 20px; flex-shrink: 0;">{anel}<div style="display: flex; flex-direction: column; gap: 6px;">{label('Recomendação')}{pill}</div></div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px;">
        {fato('relogio', 'Prazo de envio', f'08/10/2026 · <span class="tab" style="font-weight: 500;">30 d</span>')}{fato('calendario', 'Abertura', '10/10/2026')}{fato('moeda', 'Valor estimado', '<span class="tab">R$ 41.000.000,00</span>')}{fato('importar', 'Importado em', '30/07/2026')}{fato('usuario', 'Responsável', select('Bruno Tavares', 'auto', sm=True))}
      </div></div>''')}
    <div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 20px; align-items: start;">
      {card(f'''<div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: baseline; justify-content: space-between;"><h3 style="margin: 0; font-size: 16px; font-weight: 600;">Texto do edital</h3><span style="font-size: 12px; color: {T['faint']};">clique num trecho marcado</span></div>
        <div class="mono" style="border-radius: 8px; border: 1px solid {T['line']}; background: rgba(8,10,18,.6); padding: 16px; font-size: 12.5px; line-height: 1.7; color: {T['muted']};">{texto}</div>
        <div style="display: flex; gap: 12px; font-size: 11px; color: {T['faint']};"><span style="display: inline-flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; border-radius: 2px; background: rgba(129,140,248,.4);"></span>critério</span><span style="display: inline-flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; border-radius: 2px; background: rgba(251,191,36,.4);"></span>risco</span></div>
      </div>''', extra='grid-column: span 2;')}
      {card(f'''<div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 4px; border-bottom: 1px solid {T['line']};">{tab('Critérios', 'escudo', 4, True)}{tab('Checklist', 'lista', 3)}{tab('Riscos', 'alerta', 2)}{tab('Aprovação', 'fluxo', 3)}</div>
        <div style="display: flex; align-items: baseline; justify-content: space-between;"><h3 style="margin: 0; font-size: 16px; font-weight: 600;">Critérios de elegibilidade</h3><span style="font-size: 12px; color: {T['muted']};">4/4 avaliados</span></div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          {crit('Técnica', 5, 'Atestado de 10.000 PF em 3 anos', 'Atende', 'go')}
          {crit('Técnica', 5, 'CMMI nível 3 ou MPS.BR nível C', 'Atende', 'go')}
          {crit('Fiscal', 4, 'Regularidade SICAF', 'Atende', 'go')}
          {crit('Econômico-financeira', 4, 'Patrimônio líquido ≥ 10% do valor', 'Parcial', 'cond')}
        </div>
        <div style="border-radius: 12px; border: 1px dashed rgba(52,60,90,.7); padding: 14px; display: grid; grid-template-columns: auto 1fr auto auto; gap: 8px; align-items: end;">
          <div style="display: flex; flex-direction: column; gap: 6px;">{label('Categoria')}{select('Técnica', 'auto', sm=True)}</div>
          <div style="display: flex; flex-direction: column; gap: 6px;">{label('Novo critério')}<div style="height: 30px; box-sizing: border-box; border-radius: 8px; border: 1px solid {T['line']}; background: {T['raised']}; color: {T['faint']}; font-size: 12px; padding: 0 12px; display: flex; align-items: center;">descreva a exigência</div></div>
          <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: {T['muted']}; padding-bottom: 6px;"><span style="width: 16px; height: 16px; border-radius: 4px; background: {T['accent2']}; display: grid; place-items: center;">{ic('check', 12, '#fff', 2.5)}</span>Obrigatório</span>
          {btn('Adicionar', 'secondary', 'mais', True)}
        </div>
      </div>''', extra='grid-column: span 3;')}
    </div>
  </main>"""
    return head(1440, 1240) + sidebar('dash') + main + tail()

# ---------- Componentes ----------
def componentes():
    def sec(t, inner):
        return f'<div style="display: flex; flex-direction: column; gap: 12px;"><h3 style="margin: 0; font-size: 14px; font-weight: 600; color: {T["muted"]}; text-transform: uppercase; letter-spacing: .08em;">{t}</h3>{inner}</div>'
    def sw(nome, cor):
        rot = nome if cor.startswith('{{') else f'{nome}<br>{cor}'
        return f'<div style="display: flex; flex-direction: column; gap: 6px;"><div style="height: 44px; border-radius: 8px; background: {cor}; border: 1px solid {T["line2"]};"></div><span class="mono" style="font-size: 11px; color: {T["muted"]};">{rot}</span></div>'
    cores = ''.join(sw(k, v) for k, v in [('bg', T['bg']), ('surface', T['surface']), ('raised', T['raised']), ('overlay', T['overlay']), ('line', T['line']), ('line-strong', T['line2']), ('ink', T['ink']), ('ink-muted', T['muted']), ('ink-faint', T['faint']), ('accent', '{{accent}}'), ('accent-strong', T['accent2']), ('go', T['go']), ('nogo', T['nogo']), ('cond', T['cond']), ('info', T['info'])])
    inner = f"""
  <div style="width: 100%; padding: 40px; box-sizing: border-box; display: flex; flex-direction: column; gap: 32px;">
    <div style="display: flex; flex-direction: column; gap: 4px;"><h2 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -.02em;">Componentes</h2><p style="margin: 0; font-size: 14px; color: {T['muted']};">Tokens e peças do RFP-Pulse, lidos de tailwind.config.js e index.css. Inter 14px, raio 14px em cards, 8px em controles, 6px em badges.</p></div>
    {sec('Cores', f'<div style="display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 12px;">{cores}</div>')}
    {sec('Botões', f'<div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">{btn("Primário", "primary", "importar")}{btn("Secundário", "secondary", "filtro")}{btn("Fantasma", "ghost", "x")}{btn("Aprovar", "success", "check")}{btn("Reprovar", "danger", "x")}{btn("Pequeno", "secondary", "mais", True)}</div>')}
    {sec('Badges', f'<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">{badge("GO", "go", True)}{badge("NO-GO", "nogo", True)}{badge("Condicional", "cond", True)}{badge("Indefinido", "neutral", True)}{badge("Importado", "neutral")}{badge("Em análise", "info")}{badge("Triado", "accent")}{badge("Em aprovação", "cond")}{badge("Aprovado", "go")}{badge("Reprovado", "nogo")}{badge("Pregão", "outline")}{badge("#tag", "outline")}</div>')}
    {sec('Controles', f'<div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">{input_("Buscar por título, órgão, processo ou tag", "360px", "busca")}{select("Todos os responsáveis", "200px")}{chip("Prazo aberto", True, "relogio")}{chip("Pregão")}{chip("Concorrência", True)}</div>')}
    {sec('Score e prazo', f'<div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: center;">{score_bar(94)}{score_bar(58)}{score_bar(20)}{prazo("vencido há 3 d", "nogo")}{prazo("2 d", "nogo")}{prazo("7 d", "cond")}{prazo("30 d", "ink")}</div>')}
    {sec('KPI', f'<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;">{kpi("Editais ativos", "10")}{kpi("GO", "5", T["go"], "check")}{kpi("NO-GO", "2", T["nogo"], "x")}{kpi("Valor em análise", "R$ 102,7 mi", T["ink"], "moeda", "19px")}</div>')}
  </div>"""
    return head(1200, 900, False).replace('display: flex; background', 'display: block; background') + inner + tail()

open('Main.dc.html', 'w').write(dashboard())
open('Importar.dc.html', 'w').write(importar())
open('Detalhe.dc.html', 'w').write(detalhe())
open('Componentes.dc.html', 'w').write(componentes())

canvas = {
  "pages": [{"id": "page-1", "name": "Telas"}, {"id": "page-2", "name": "Componentes"}],
  "artboards": [
    {"file": "Main.dc.html", "title": "Dashboard", "x": 0, "y": 0, "w": 1440, "h": 1220, "page": "page-1"},
    {"file": "Importar.dc.html", "title": "Importar edital", "x": 1560, "y": 0, "w": 1440, "h": 1560, "page": "page-1"},
    {"file": "Detalhe.dc.html", "title": "Detalhe do edital", "x": 3120, "y": 0, "w": 1440, "h": 1240, "page": "page-1"},
    {"file": "Componentes.dc.html", "title": "Componentes e tokens", "x": 0, "y": 0, "w": 1200, "h": 900, "page": "page-2"}
  ],
  "annotations": [
    {"id": "nota-tokens", "x": 0, "y": -170, "w": 420, "page": "page-1", "text": "Fiel ao app: tokens de tailwind.config.js e index.css (fundo #080a12, acento #818cf8, Inter/JetBrains Mono). O chip Accent acima de cada tela troca a cor de destaque para experimentar."},
    {"id": "nota-fluxo", "x": 3120, "y": -170, "w": 420, "page": "page-1", "text": "Visão dividida: texto à esquerda com trechos marcados (azul = critério, âmbar = risco), painéis à direita. Controles segmentados substituem selects para a situação do critério."}
  ],
  "launch": {"view": "canvas", "page": "page-1"}
}
json.dump(canvas, open('canvas.json', 'w'), ensure_ascii=False, indent=2)
print('ok', [os.path.getsize(f) for f in ['Main.dc.html', 'Importar.dc.html', 'Detalhe.dc.html', 'Componentes.dc.html']])
