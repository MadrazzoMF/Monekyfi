// Conteúdo das lições — estilo Duolingo: cards curtos + quiz no final.
// `tier`: 'free' (todo mundo) ou 'premium' (assinantes).
// Cada lição: { id, moduleId, title, minutes, xp, cards: [{type:'text'|'tip', title?, body}], quiz: [{q, options, answer}] }

export const MODULES = [
  {
    id: 'm1',
    title: 'Controlando a Grana',
    emoji: '🍌',
    blurb: 'Registrar gastos, entender pra onde vai o dinheiro e montar um orçamento que funciona.',
    tier: 'free',
  },
  {
    id: 'm2',
    title: 'Fazendo o Dinheiro Trabalhar',
    emoji: '📈',
    blurb: 'O que é investir, renda fixa x variável e como começar com pouco.',
    tier: 'premium',
  },
  {
    id: 'm3',
    title: 'Armadilhas Financeiras',
    emoji: '⚠️',
    blurb: 'Apostas, pirâmides, parcelamento infinito e lifestyle inflation.',
    tier: 'premium',
  },
  {
    id: 'm4',
    title: 'Mentalidade de Macaco Rico',
    emoji: '👑',
    blurb: 'Como pensar sobre dinheiro, ativo x passivo e hábitos que constroem riqueza.',
    tier: 'premium',
  },
];

export const LESSONS = [
  // ───────────────────────── MÓDULO 1 — CONTROLANDO A GRANA ─────────────────────────
  {
    id: 'l1-1',
    moduleId: 'm1',
    title: 'Pra onde vai o seu dinheiro?',
    minutes: 2,
    xp: 20,
    tier: 'free',
    cards: [
      {
        type: 'text',
        title: 'O buraco é mais embaixo',
        body: 'Quase ninguém sabe de cabeça quanto gastou no último mês. O dinheiro some em pequenas decisões: um lanche aqui, um app ali, um Uber porque tava com preguiça. Sozinhos são baratos. Juntos, comem metade da sua grana.',
      },
      {
        type: 'text',
        title: 'A regra de ouro',
        body: 'Você não controla o que não enxerga. Antes de cortar qualquer coisa, você precisa VER pra onde o dinheiro está indo. Registrar gastos é o primeiro passo — e o mais poderoso.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Não comece tentando cortar tudo. Comece só anotando, sem julgar. A consciência muda seu comportamento sozinha.',
      },
    ],
    quiz: [
      {
        q: 'Qual é o primeiro passo pra controlar o dinheiro?',
        options: ['Cortar todos os gastos de uma vez', 'Registrar e enxergar pra onde ele vai', 'Pegar um empréstimo', 'Esperar ganhar mais'],
        answer: 1,
      },
      {
        q: 'Por que pequenos gastos são perigosos?',
        options: ['Porque são caros individualmente', 'Porque somados representam muito e passam despercebidos', 'Porque o banco cobra taxa neles', 'Eles não são perigosos'],
        answer: 1,
      },
      {
        q: 'O que acontece quando você começa a anotar gastos sem julgar?',
        options: ['Nada muda', 'A consciência já tende a mudar seu comportamento', 'Você gasta mais', 'Você precisa de um contador'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l1-2',
    moduleId: 'm1',
    title: 'Como registrar gastos sem enlouquecer',
    minutes: 3,
    xp: 20,
    tier: 'free',
    cards: [
      {
        type: 'text',
        title: 'Escolha UM jeito',
        body: 'Pode ser um app, uma planilha ou as notas do celular. O melhor método é o que você realmente vai usar. Complicou, abandonou. Simplicidade ganha.',
      },
      {
        type: 'text',
        title: 'Anote na hora',
        body: 'Gastou? Anota em até 1 minuto. Se deixar pro fim do dia, você esquece os pequenos — e os pequenos são o problema. Crie o gatilho: pagou → anotou.',
      },
      {
        type: 'text',
        title: 'Categorize de forma simples',
        body: 'Comida, transporte, moradia, lazer, assinaturas, outros. Seis categorias bastam pra começar. Detalhe demais cansa e não ajuda.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Faça isso por 7 dias seguidos antes de tirar conclusões. Uma semana já revela seus padrões.',
      },
    ],
    quiz: [
      {
        q: 'Qual é o melhor método pra registrar gastos?',
        options: ['O app mais completo do mercado', 'Aquele que você realmente vai usar', 'Sempre uma planilha', 'Decorar de cabeça'],
        answer: 1,
      },
      {
        q: 'Quando você deve anotar um gasto?',
        options: ['No fim do mês', 'No fim do dia', 'Logo depois de gastar', 'Só os gastos grandes'],
        answer: 2,
      },
      {
        q: 'Quantas categorias bastam pra começar?',
        options: ['Umas 6 categorias simples', 'No mínimo 20', 'Uma só', 'Nenhuma, não precisa categorizar'],
        answer: 0,
      },
    ],
  },
  {
    id: 'l1-3',
    moduleId: 'm1',
    title: 'Gastos fixos x gastos variáveis',
    minutes: 2,
    xp: 20,
    tier: 'free',
    cards: [
      {
        type: 'text',
        title: 'Fixos: chegam todo mês',
        body: 'Aluguel, internet, transporte, assinaturas, plano de celular. Mudam pouco e são previsíveis. São a "base" do seu custo de vida.',
      },
      {
        type: 'text',
        title: 'Variáveis: você decide na hora',
        body: 'Lazer, delivery, roupas, presentes, aquele rolê. Mudam bastante mês a mês. É aqui que mora a maior parte da sua liberdade de ajuste.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Quer cortar gastos rápido? Olhe primeiro os fixos invisíveis (assinaturas esquecidas). Depois ataque os variáveis recorrentes (delivery).',
      },
    ],
    quiz: [
      {
        q: 'Qual destes é um gasto fixo?',
        options: ['Um lanche no shopping', 'A assinatura do streaming', 'Um presente de aniversário', 'Uma roupa nova'],
        answer: 1,
      },
      {
        q: 'Onde costuma estar sua maior liberdade pra ajustar gastos?',
        options: ['Nos gastos fixos', 'Nos gastos variáveis', 'Não dá pra ajustar nada', 'Só ganhando mais'],
        answer: 1,
      },
      {
        q: 'Por onde vale começar a cortar?',
        options: ['Por lugar nenhum', 'Pelos fixos invisíveis, como assinaturas esquecidas', 'Cortando comida', 'Pelo aluguel sempre'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l1-4',
    moduleId: 'm1',
    title: 'O que é um orçamento (de verdade)',
    minutes: 3,
    xp: 25,
    tier: 'free',
    cards: [
      {
        type: 'text',
        title: 'Orçamento não é prisão',
        body: 'Muita gente acha que orçamento é "não pode nada". Errado. Orçamento é dar um trabalho pra cada real ANTES do mês começar — inclusive pro lazer. É liberdade com plano.',
      },
      {
        type: 'text',
        title: 'A conta básica',
        body: 'Quanto entra (renda) − quanto sai (gastos) = o que sobra. Se sobra, ótimo: direcione pra reserva/investimento. Se falta, o orçamento te mostra exatamente onde apertar.',
      },
      {
        type: 'text',
        title: 'Faça mensal, revise toda semana',
        body: 'Planeje o mês inteiro, mas dê uma olhada rápida uma vez por semana pra ver se está no rumo. 5 minutos por semana evitam o susto no fim do mês.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Inclua uma categoria "diversão" no orçamento. Plano sem prazer não dura. O segredo é o limite, não a proibição.',
      },
    ],
    quiz: [
      {
        q: 'O que é um orçamento?',
        options: ['Proibir todo gasto com lazer', 'Dar um destino pra cada real antes do mês começar', 'Anotar gastos só depois que acontecem', 'Um app de banco'],
        answer: 1,
      },
      {
        q: 'A conta básica do orçamento é:',
        options: ['Renda × gastos', 'Renda − gastos = o que sobra (ou falta)', 'Gastos − renda = lucro', 'Renda + dívidas'],
        answer: 1,
      },
      {
        q: 'Com que frequência vale revisar o orçamento?',
        options: ['Nunca', 'Uma vez por ano', 'Uma olhada rápida por semana', 'A cada 5 anos'],
        answer: 2,
      },
    ],
  },
  {
    id: 'l1-5',
    moduleId: 'm1',
    title: 'O método 50/30/20',
    minutes: 3,
    xp: 25,
    tier: 'free',
    cards: [
      {
        type: 'text',
        title: 'Um molde pra sua renda',
        body: '50% pra necessidades (moradia, comida, transporte), 30% pra desejos (lazer, rolê, supérfluos) e 20% pra poupar/investir/quitar dívidas. É um ponto de partida, não uma lei sagrada.',
      },
      {
        type: 'text',
        title: 'Por que funciona',
        body: 'Garante que você sempre guarda algo (os 20%) e ainda tem espaço pra viver (os 30%). Sem isso, ou você se sufoca, ou nunca sobra nada.',
      },
      {
        type: 'text',
        title: 'Ajuste à sua realidade',
        body: 'Mora com os pais e gasta pouco com necessidades? Aumenta os 20%. Renda apertada? Talvez seja 60/20/20 por um tempo. O importante é ter os três baldes.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Separe os 20% logo que o dinheiro cai — antes de gastar. Isso se chama "pagar-se primeiro". O resto você se vira com o que sobrou.',
      },
    ],
    quiz: [
      {
        q: 'No método 50/30/20, os 20% são pra quê?',
        options: ['Lazer', 'Necessidades', 'Poupar, investir ou quitar dívidas', 'Impostos'],
        answer: 2,
      },
      {
        q: 'O que significa "pagar-se primeiro"?',
        options: ['Gastar com você antes dos boletos', 'Separar a parte de poupança assim que o dinheiro entra', 'Pedir adiantamento de salário', 'Pagar o cartão antes do aluguel'],
        answer: 1,
      },
      {
        q: 'O 50/30/20 é:',
        options: ['Uma regra fixa e imutável', 'Um ponto de partida que você ajusta à sua realidade', 'Só pra quem é rico', 'Uma forma de investir'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l1-6',
    moduleId: 'm1',
    title: 'Reserva de emergência: seu colchão',
    minutes: 3,
    xp: 25,
    tier: 'free',
    cards: [
      {
        type: 'text',
        title: 'Pra que serve',
        body: 'É o dinheiro que te segura quando a vida vira de cabeça pra baixo: perdeu o emprego, quebrou o celular que você usa pra trabalhar, uma emergência de saúde. Sem reserva, qualquer susto vira dívida.',
      },
      {
        type: 'text',
        title: 'Quanto guardar',
        body: 'A meta clássica é de 3 a 6 meses dos seus gastos essenciais. Se seus custos fixos são R$ 1.000/mês, a reserva alvo é R$ 3.000 a R$ 6.000. Começou? Já está ganhando.',
      },
      {
        type: 'text',
        title: 'Onde deixar',
        body: 'Num lugar seguro e de fácil resgate — tipo Tesouro Selic ou um CDB de liquidez diária que renda perto de 100% do CDI. Nada de deixar parado na conta sem render, nem preso em algo arriscado.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Antes de investir em coisas mais ousadas, monte a reserva. Ela é o que te dá coragem pra investir sem pânico depois.',
      },
    ],
    quiz: [
      {
        q: 'Pra que serve a reserva de emergência?',
        options: ['Comprar o que você quiser', 'Te segurar em imprevistos sem virar dívida', 'Investir em ações arriscadas', 'Pagar viagens'],
        answer: 1,
      },
      {
        q: 'Quanto é a meta clássica de reserva?',
        options: ['1 semana de gastos', '3 a 6 meses dos gastos essenciais', '10 anos de salário', 'R$ 100 fixos'],
        answer: 1,
      },
      {
        q: 'Onde a reserva NÃO deve ficar?',
        options: ['Tesouro Selic', 'CDB de liquidez diária perto de 100% do CDI', 'Presa em um investimento arriscado e difícil de resgatar', 'Num lugar seguro e líquido'],
        answer: 2,
      },
    ],
  },
  {
    id: 'l1-7',
    moduleId: 'm1',
    title: 'O perigo do cartão de crédito',
    minutes: 3,
    xp: 25,
    tier: 'free',
    cards: [
      {
        type: 'text',
        title: 'O cartão não é dinheiro extra',
        body: 'Ele só adia o pagamento. Tudo que você passa hoje, você paga depois — e tem que ter o dinheiro. Tratar o limite como "renda" é a porta de entrada pra bola de neve.',
      },
      {
        type: 'text',
        title: 'O rotativo é o vilão',
        body: 'Não pagou a fatura inteira? O resto entra no "rotativo", com os juros mais altos do mercado (pode passar de 400% ao ano). É a dívida que mais rápido sai do controle no Brasil.',
      },
      {
        type: 'text',
        title: 'Como usar a favor',
        body: 'Pague SEMPRE a fatura integral. Use pra organizar gastos num lugar só, talvez juntar pontos. Se você não confia em si pra isso, use débito ou pré-pago. Sem culpa.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Regra de ouro: se você não tem o dinheiro pra pagar à vista, você não pode pagar parcelado também. O parcelado só esconde que você não pode.',
      },
    ],
    quiz: [
      {
        q: 'O limite do cartão de crédito é:',
        options: ['Renda extra', 'Um adiamento de pagamento — você vai pagar depois', 'Dinheiro do banco que é seu', 'Um investimento'],
        answer: 1,
      },
      {
        q: 'O que é o "rotativo" do cartão?',
        options: ['Um programa de pontos', 'A parte não paga da fatura, com juros altíssimos', 'Um tipo de investimento', 'Um desconto'],
        answer: 1,
      },
      {
        q: 'Qual é a regra de ouro pra parcelar?',
        options: ['Parcelar tudo sempre', 'Só parcelar se você teria como pagar à vista', 'Nunca pagar a fatura inteira', 'Usar só o rotativo'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l1-8',
    moduleId: 'm1',
    title: 'Metas que você cumpre',
    minutes: 2,
    xp: 25,
    tier: 'free',
    cards: [
      {
        type: 'text',
        title: 'Meta vaga não acontece',
        body: '"Quero juntar dinheiro" não funciona. "Quero juntar R$ 1.200 até dezembro pra trocar de celular" funciona — tem valor, prazo e motivo. Específico vira ação.',
      },
      {
        type: 'text',
        title: 'Quebre em pedaços pequenos',
        body: 'R$ 1.200 em 6 meses = R$ 200/mês = R$ 50/semana. De repente vira algo que você consegue olhar e dizer "isso eu faço". Metas grandes assustam; pedaços pequenos motivam.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Dê um nome e, se puder, uma imagem pra meta. "Conta da viagem", "Cofrinho do notebook". O cérebro se conecta com coisas concretas — e desiste menos.',
      },
    ],
    quiz: [
      {
        q: 'Por que "quero juntar dinheiro" não funciona como meta?',
        options: ['Porque é muito ambiciosa', 'Porque não tem valor, prazo nem motivo claros', 'Porque dinheiro não se junta', 'Funciona perfeitamente'],
        answer: 1,
      },
      {
        q: 'Qual a vantagem de quebrar uma meta em pedaços?',
        options: ['Fica mais difícil', 'Some o valor total', 'Vira algo realizável e motivador', 'Não tem vantagem'],
        answer: 2,
      },
      {
        q: 'Juntar R$ 1.200 em 6 meses equivale a quanto por mês?',
        options: ['R$ 100', 'R$ 200', 'R$ 600', 'R$ 1.200'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l1-9',
    moduleId: 'm1',
    title: 'Inflação na prática',
    minutes: 3,
    xp: 25,
    tier: 'free',
    cards: [
      {
        type: 'text',
        title: 'O dinheiro encolhe parado',
        body: 'Inflação é o aumento geral dos preços com o tempo. O pão que custava R$ 5 passa a custar R$ 5,50. Resultado: o mesmo dinheiro compra menos. Se ele fica parado, ele perde valor sozinho.',
      },
      {
        type: 'text',
        title: 'Por isso "guardar embaixo do colchão" é ruim',
        body: 'R$ 1.000 hoje, parados, valem menos daqui a um ano em poder de compra. Pra não perder, seu dinheiro precisa render pelo menos a inflação. Render acima dela é onde a riqueza começa.',
      },
      {
        type: 'text',
        title: 'O outro lado',
        body: 'Inflação também corrói dívidas com juros fixos baixos — mas no Brasil os juros das dívidas costumam ser MUITO maiores que a inflação, então não conte com isso. A lição prática: não deixe dinheiro parado.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'No Brasil, acompanhe o IPCA (índice oficial de inflação) e o CDI (referência de rendimento). Você quer que seus investimentos rendam acima do IPCA.',
      },
    ],
    quiz: [
      {
        q: 'O que a inflação faz com o dinheiro parado?',
        options: ['Aumenta o poder de compra', 'Reduz o poder de compra com o tempo', 'Não muda nada', 'Multiplica o valor'],
        answer: 1,
      },
      {
        q: 'Pra não perder pra inflação, seu dinheiro precisa:',
        options: ['Ficar parado na conta', 'Render pelo menos a inflação', 'Ser gasto rapidamente', 'Ser convertido em dólar sempre'],
        answer: 1,
      },
      {
        q: 'Qual índice mede a inflação oficial no Brasil?',
        options: ['CDI', 'IPCA', 'Selic', 'Ibovespa'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l1-10',
    moduleId: 'm1',
    title: 'Juntando tudo: seu plano de controle',
    minutes: 3,
    xp: 30,
    tier: 'free',
    cards: [
      {
        type: 'text',
        title: 'O ciclo de quem domina a grana',
        body: '1) Registra os gastos. 2) Separa em fixos e variáveis. 3) Monta um orçamento (tipo 50/30/20). 4) Paga-se primeiro pra reserva. 5) Revisa toda semana. 6) Ajusta. Repete. Simples assim — difícil é a constância.',
      },
      {
        type: 'text',
        title: 'Comece pequeno, mas comece hoje',
        body: 'Não precisa fazer tudo perfeito. Anote os gastos de hoje. Veja uma assinatura pra cancelar. Separe R$ 10 pra reserva. Um passo por dia vira um sistema em um mês.',
      },
      {
        type: 'text',
        title: 'Próximo nível',
        body: 'Quando o controle virar hábito, o dinheiro que sobra precisa de destino. Aí entra o módulo "Fazendo o Dinheiro Trabalhar" — onde a grana parada vira grana que cresce.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Use os desafios diários do app pra praticar cada peça desse ciclo. Saber é metade; fazer é a outra metade — e é onde a maioria desiste.',
      },
    ],
    quiz: [
      {
        q: 'Qual é a primeira etapa do ciclo de controle?',
        options: ['Investir em ações', 'Registrar os gastos', 'Pegar um empréstimo', 'Cancelar o cartão'],
        answer: 1,
      },
      {
        q: 'Qual a melhor forma de começar?',
        options: ['Esperar ter mais dinheiro', 'Fazer tudo perfeito de uma vez', 'Dar um passo pequeno hoje mesmo', 'Não começar até estudar tudo'],
        answer: 2,
      },
      {
        q: 'O que vem depois de dominar o controle da grana?',
        options: ['Parar de poupar', 'Dar um destino ao dinheiro que sobra — investir', 'Gastar tudo', 'Fechar a conta no banco'],
        answer: 1,
      },
    ],
  },

  // ───────────────────────── MÓDULO 2 — FAZENDO O DINHEIRO TRABALHAR (premium) ─────────────────────────
  {
    id: 'l2-1',
    moduleId: 'm2',
    title: 'O que é investir, afinal',
    minutes: 3,
    xp: 25,
    tier: 'premium',
    cards: [
      {
        type: 'text',
        title: 'Dinheiro que gera dinheiro',
        body: 'Investir é colocar seu dinheiro pra trabalhar: você empresta ou compra algo que, com o tempo, te devolve mais do que você pôs. É a diferença entre carregar baldes de água a vida toda e construir um encanamento.',
      },
      {
        type: 'text',
        title: 'Risco x retorno',
        body: 'Em geral: quanto mais você pode ganhar, mais você pode perder. Não existe "render muito sem risco nenhum" — quem promete isso está mentindo. A arte é equilibrar segurança e crescimento.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Primeiro a reserva de emergência (seguro), depois investimentos de longo prazo (crescimento). Nessa ordem.',
      },
    ],
    quiz: [
      {
        q: 'Investir é:',
        options: ['Guardar dinheiro parado', 'Colocar o dinheiro pra trabalhar e render mais', 'Gastar com inteligência', 'Pegar empréstimo barato'],
        answer: 1,
      },
      {
        q: 'Sobre risco e retorno:',
        options: ['Mais retorno geralmente vem com mais risco', 'Dá pra ter retorno alto sem risco nenhum', 'Risco não existe', 'Quanto menor o risco, maior o retorno'],
        answer: 0,
      },
      {
        q: 'O que vem primeiro?',
        options: ['Investir em ações arriscadas', 'A reserva de emergência', 'Comprar cripto', 'Day trade'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l2-2',
    moduleId: 'm2',
    title: 'Juros compostos: a 8ª maravilha',
    minutes: 3,
    xp: 30,
    tier: 'premium',
    cards: [
      {
        type: 'text',
        title: 'Juros sobre juros',
        body: 'Você investe R$ 100 e rende R$ 10 → agora tem R$ 110. No próximo período, o rendimento incide sobre R$ 110, não sobre R$ 100. O bolo de neve cresce sobre si mesmo. No começo é devagar; com o tempo, explode.',
      },
      {
        type: 'text',
        title: 'O ingrediente secreto é o tempo',
        body: 'R$ 100/mês por 30 anos a juros razoáveis vira muito mais do que R$ 300/mês por 10 anos — mesmo aportando bem menos no total. Quem começa cedo ganha do quem aporta mais. Tempo > valor.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'O melhor dia pra começar a investir foi há 10 anos. O segundo melhor é hoje. Comece com qualquer valor — o hábito vale mais que a quantia.',
      },
    ],
    quiz: [
      {
        q: 'Juros compostos significam:',
        options: ['Juros só sobre o valor inicial', 'Juros incidindo também sobre os juros já acumulados', 'Um tipo de imposto', 'Juros que diminuem com o tempo'],
        answer: 1,
      },
      {
        q: 'Qual é o "ingrediente secreto" dos juros compostos?',
        options: ['O valor aportado', 'O tempo', 'O banco', 'A sorte'],
        answer: 1,
      },
      {
        q: 'Entre começar cedo com pouco ou tarde com muito, o que tende a render mais?',
        options: ['Tarde com muito', 'Começar cedo, mesmo com pouco', 'Dá no mesmo', 'Nenhum dos dois rende'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l2-3',
    moduleId: 'm2',
    title: 'Renda fixa x renda variável',
    minutes: 3,
    xp: 30,
    tier: 'premium',
    cards: [
      {
        type: 'text',
        title: 'Renda fixa: você empresta',
        body: 'Tesouro Direto, CDB, LCI/LCA. Você empresta dinheiro (pro governo, pro banco) e recebe de volta com juros combinados. Mais previsível, mais seguro, retorno geralmente menor. Ótimo pra reserva e metas de curto/médio prazo.',
      },
      {
        type: 'text',
        title: 'Renda variável: você vira sócio',
        body: 'Ações, fundos imobiliários, ETFs. Você compra um pedacinho de empresas. Pode subir muito, pode cair. Mais oscilação, mais risco, mais potencial no longo prazo. Bom pra objetivos distantes (aposentadoria, por ex.).',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Iniciante? Comece pela renda fixa pra entender o jogo. Depois, com calma, adicione um pouco de variável via fundos de índice — diversificados e baratos.',
      },
    ],
    quiz: [
      {
        q: 'Na renda fixa, você basicamente:',
        options: ['Vira sócio de empresas', 'Empresta dinheiro e recebe de volta com juros', 'Aposta no cassino', 'Compra imóveis físicos'],
        answer: 1,
      },
      {
        q: 'Ações são um exemplo de:',
        options: ['Renda fixa', 'Renda variável', 'Poupança', 'Conta corrente'],
        answer: 1,
      },
      {
        q: 'Pra reserva de emergência, o ideal é:',
        options: ['Ações', 'Renda fixa segura e líquida', 'Cripto', 'Fundos imobiliários'],
        answer: 1,
      },
    ],
  },

  // ───────────────────────── MÓDULO 3 — ARMADILHAS FINANCEIRAS (premium) ─────────────────────────
  {
    id: 'l3-1',
    moduleId: 'm3',
    title: 'Apostas: a casa sempre ganha',
    minutes: 3,
    xp: 25,
    tier: 'premium',
    cards: [
      {
        type: 'text',
        title: 'A matemática é contra você',
        body: 'Bets, raspadinhas, cassino: todos têm uma "margem da casa" embutida. No longo prazo, em média, o jogador SEMPRE perde — é assim que essas empresas faturam bilhões. Ganhar de vez em quando faz parte do desenho pra te manter jogando.',
      },
      {
        type: 'text',
        title: 'O gatilho psicológico',
        body: 'Quase ganhar ativa seu cérebro quase como ganhar. Por isso vicia. Não é falta de "força de vontade" — é um produto desenhado pra fisgar. Reconhecer isso já te protege.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Se quiser "apostar", aposte em você: o dinheiro da bet vira aporte mensal num investimento. Em 10 anos a diferença é absurda — e a favor.',
      },
    ],
    quiz: [
      {
        q: 'No longo prazo, em apostas, o jogador médio:',
        options: ['Sempre ganha', 'Sempre perde — por causa da margem da casa', 'Empata', 'Depende da sorte do dia'],
        answer: 1,
      },
      {
        q: 'Por que "quase ganhar" é perigoso?',
        options: ['Não é perigoso', 'Ativa o cérebro quase como ganhar, o que vicia', 'Significa que você vai ganhar logo', 'Reduz a margem da casa'],
        answer: 1,
      },
      {
        q: 'Uma alternativa saudável ao dinheiro de apostas é:',
        options: ['Apostar o dobro', 'Transformar em aporte mensal em investimento', 'Emprestar pra amigos', 'Comprar mais raspadinhas'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l3-2',
    moduleId: 'm3',
    title: 'Pirâmides e "renda garantida"',
    minutes: 3,
    xp: 25,
    tier: 'premium',
    cards: [
      {
        type: 'text',
        title: 'Como reconhecer uma pirâmide',
        body: 'Promete retorno alto, rápido e "garantido". O ganho vem principalmente de recrutar novos participantes, não de um produto real. Pressão pra entrar logo. Quando param de entrar pessoas novas, desaba — e quem entrou por último perde tudo.',
      },
      {
        type: 'text',
        title: 'Os disfarces',
        body: 'Cripto "exclusiva", robôs de trading milagrosos, "consórcio premiado", grupos fechados de mentoria que só vendem mais mentoria. O nome muda, o golpe é o mesmo: dinheiro de novatos pagando os antigos.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Regra simples: "garantido" + "muito acima do mercado" = mentira. Investimento sério tem risco, não tem pressa e é registrado/regulamentado. Na dúvida, não entre.',
      },
    ],
    quiz: [
      {
        q: 'Um sinal claro de pirâmide é:',
        options: ['Retorno alto, rápido e "garantido", com foco em recrutar gente', 'Risco bem explicado', 'Ser regulamentada', 'Render perto do CDI'],
        answer: 0,
      },
      {
        q: 'De onde vem o dinheiro pago aos participantes de uma pirâmide?',
        options: ['De um produto lucrativo', 'Principalmente dos novos participantes que entram', 'Do governo', 'De juros de banco'],
        answer: 1,
      },
      {
        q: 'A combinação que denuncia golpe é:',
        options: ['"Tem risco" + "longo prazo"', '"Garantido" + "muito acima do mercado"', '"Regulamentado" + "diversificado"', '"Renda fixa" + "liquidez diária"'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l3-3',
    moduleId: 'm3',
    title: 'Lifestyle inflation e o parcelado infinito',
    minutes: 3,
    xp: 25,
    tier: 'premium',
    cards: [
      {
        type: 'text',
        title: 'Ganhou mais, gastou mais',
        body: 'Lifestyle inflation: cada aumento de renda vira aumento de gasto. Salário sobe, vem o carro melhor, o apê maior, o plano mais caro — e você continua sem sobrar nada. A esteira nunca para.',
      },
      {
        type: 'text',
        title: 'O parcelado que nunca acaba',
        body: 'Parcela em 12x aqui, 10x ali, 18x acolá. Sozinha cada parcela "cabe". Somadas, comprometem seu salário meses à frente. Você passa a trabalhar pro passado. É a versão lenta da bola de neve.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'A cada aumento de renda, mande metade do aumento direto pra investimento ANTES de se acostumar com ele. E some todas as parcelas ativas uma vez por mês — o número assusta e protege.',
      },
    ],
    quiz: [
      {
        q: 'Lifestyle inflation é quando:',
        options: ['Os preços sobem na economia', 'Cada aumento de renda vira aumento de gasto', 'Você corta gastos ao ganhar mais', 'O cartão aumenta o limite'],
        answer: 1,
      },
      {
        q: 'Qual o perigo de muitas compras parceladas ao mesmo tempo?',
        options: ['Nenhum, se cada parcela "cabe"', 'Somadas, comprometem sua renda futura', 'Aumentam sua reserva', 'Reduzem os juros'],
        answer: 1,
      },
      {
        q: 'O que fazer ao receber um aumento de salário?',
        options: ['Aumentar todos os gastos na mesma hora', 'Direcionar parte do aumento pra investimento antes de se acostumar', 'Parcelar mais coisas', 'Ignorar e gastar tudo'],
        answer: 1,
      },
    ],
  },

  // ───────────────────────── MÓDULO 4 — MENTALIDADE DE MACACO RICO (premium) ─────────────────────────
  {
    id: 'l4-1',
    moduleId: 'm4',
    title: 'Ativo x passivo',
    minutes: 3,
    xp: 25,
    tier: 'premium',
    cards: [
      {
        type: 'text',
        title: 'A definição que importa',
        body: 'Ativo é o que põe dinheiro no seu bolso (investimentos, um negócio, aluguel recebido). Passivo é o que tira (financiamento, dívida do cartão, aquele carro que só dá custo). Ricos acumulam ativos; o resto acumula passivos achando que são ativos.',
      },
      {
        type: 'text',
        title: 'O carro novo é o exemplo clássico',
        body: 'Parece símbolo de sucesso, mas só drena: desvaloriza, consome combustível, seguro, manutenção. Não te paga nada. A pergunta certa antes de comprar algo grande: "isso vai me dar dinheiro ou tirar?"',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'A meta de longo prazo: ter ativos suficientes pra que o que eles geram cubra seus custos de vida. Aí o trabalho vira opção, não obrigação. Isso é liberdade financeira.',
      },
    ],
    quiz: [
      {
        q: 'Um ativo é:',
        options: ['Tudo que você possui', 'O que põe dinheiro no seu bolso', 'O que tira dinheiro do bolso', 'Sempre um imóvel'],
        answer: 1,
      },
      {
        q: 'Por que um carro novo costuma ser um passivo?',
        options: ['Porque é caro', 'Porque só gera custos (desvaloriza, combustível, seguro) sem te pagar', 'Porque todo mundo tem', 'Não é, é sempre um ativo'],
        answer: 1,
      },
      {
        q: 'A liberdade financeira acontece quando:',
        options: ['Você ganha um salário alto', 'Seus ativos geram o suficiente pra cobrir seus custos de vida', 'Você quita o cartão', 'Você compra uma casa'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l4-2',
    moduleId: 'm4',
    title: 'Pagar-se primeiro e automatizar',
    minutes: 2,
    xp: 25,
    tier: 'premium',
    cards: [
      {
        type: 'text',
        title: 'O dinheiro que você não vê, você não gasta',
        body: 'Se a parte da poupança/investimento sai automaticamente no dia que sua renda cai, você nem sente falta. Sobra o que sobrou — e você se vira com isso. Disciplina no piloto automático bate força de vontade todo dia.',
      },
      {
        type: 'text',
        title: 'Pequeno e constante > grande e raro',
        body: 'R$ 50 todo mês, sempre, vale mais que R$ 1.000 "quando der" (que nunca dá). A regularidade é o que faz os juros compostos trabalharem. O hábito é o ativo.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Configure hoje uma transferência ou aporte automático, mesmo que mínimo. Você pode aumentar depois. O importante é a engrenagem começar a girar.',
      },
    ],
    quiz: [
      {
        q: '"Pagar-se primeiro" funciona porque:',
        options: ['Você gasta o dinheiro antes dos boletos', 'O dinheiro que sai automático você nem sente falta', 'O banco paga pra você', 'Reduz seus impostos'],
        answer: 1,
      },
      {
        q: 'O que rende mais a longo prazo?',
        options: ['Aportes grandes e raros, "quando der"', 'Aportes pequenos e constantes, sempre', 'Não aportar', 'Aportar só uma vez'],
        answer: 1,
      },
      {
        q: 'Qual a vantagem de automatizar os aportes?',
        options: ['Nenhuma', 'Tira a decisão do dia a dia — a disciplina vira automática', 'Aumenta os juros do cartão', 'Diminui o rendimento'],
        answer: 1,
      },
    ],
  },
  {
    id: 'l4-3',
    moduleId: 'm4',
    title: 'Hábitos de macaco rico',
    minutes: 3,
    xp: 30,
    tier: 'premium',
    cards: [
      {
        type: 'text',
        title: 'Riqueza é resultado de rotina, não de sorte',
        body: 'Quem constrói patrimônio costuma: gastar menos do que ganha, investir a diferença com regularidade, evitar dívidas caras, e pensar em anos — não em semanas. Nada de mágico. É chato e funciona.',
      },
      {
        type: 'text',
        title: 'Aprenda e ajuste sempre',
        body: 'O jogo muda: novas regras, novos produtos, novos golpes. Quem continua aprendendo se protege e aproveita oportunidades. Uma lição por dia, um desafio por dia — é assim que se mantém afiado.',
      },
      {
        type: 'text',
        title: 'A constância vence o talento',
        body: 'Você não precisa ser gênio das finanças. Precisa fazer o básico, todo dia, por anos. O macaco que volta toda manhã pra cuidar das bananas, no fim, tem mais bananas. Streak importa — na vida real também.',
      },
      {
        type: 'tip',
        title: 'Dica de macaco esperto',
        body: 'Escolha 1 hábito financeiro pra firmar este mês (anotar gastos, aportar todo dia 5, revisar orçamento no domingo). Só 1. Quando virar automático, adicione outro.',
      },
    ],
    quiz: [
      {
        q: 'Construir riqueza é principalmente resultado de:',
        options: ['Sorte e oportunidades raras', 'Hábitos repetidos por muito tempo', 'Um golpe de mestre', 'Herança'],
        answer: 1,
      },
      {
        q: 'Por que continuar aprendendo sobre finanças?',
        options: ['Não precisa, depois que aprendeu acabou', 'O jogo muda: novos produtos, regras e golpes aparecem sempre', 'Só pra impressionar os outros', 'Pra pagar mais imposto'],
        answer: 1,
      },
      {
        q: 'A melhor estratégia pra firmar hábitos financeiros é:',
        options: ['Mudar tudo de uma vez', 'Escolher 1 hábito por vez até virar automático', 'Não ter hábitos', 'Esperar o ano novo'],
        answer: 1,
      },
    ],
  },
];

export function lessonsForModule(moduleId) {
  return LESSONS.filter((l) => l.moduleId === moduleId);
}

export function getLessonById(id) {
  return LESSONS.find((l) => l.id === id) || null;
}

export function getModuleById(id) {
  return MODULES.find((m) => m.id === id) || null;
}

// Um módulo é considerado concluído quando todas as suas lições foram completadas.
export function moduleCompleted(moduleId, completedLessonIds) {
  const ids = lessonsForModule(moduleId).map((l) => l.id);
  return ids.length > 0 && ids.every((id) => completedLessonIds.includes(id));
}
