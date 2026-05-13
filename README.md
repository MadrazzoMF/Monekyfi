# 🐵 MonkeyFi — O Duolingo Financeiro dos Macacos

App gamificado onde jovens (13–25) aprendem finanças pessoais na prática, através de **lições curtas** (estilo Duolingo) e **desafios diários** reais, dentro do universo dos macacos do Madrazzo MF.

> Conhecimento sobre dinheiro existe de sobra. O que falta é um sistema que transforme conhecimento em ação diária — e que seja viciante o suficiente pra pessoa voltar todo dia.

## O que já está implementado neste repositório

App em **React Native + Expo** (roda em iOS, Android e Web com um código só).

- **Onboarding**: escolha de avatar de macaco, nome e nível inicial ("nunca controlei", "já sei o básico", "quero avançar").
- **Trilha personalizada**: 4 módulos com lições curtas (2–3 min) e quiz no final.
  - Módulo 1 — *Controlando a Grana* (10 lições completas, grátis)
  - Módulo 2 — *Fazendo o Dinheiro Trabalhar* (premium)
  - Módulo 3 — *Armadilhas Financeiras* (premium)
  - Módulo 4 — *Mentalidade de Macaco Rico* (premium)
- **Desafios práticos**: 30 desafios reais ("anote seus gastos de hoje", "fique 24h sem gastar", "calcule quanto gastou com delivery"...). Um **desafio do dia** é sorteado de forma determinística.
- **Gamificação**:
  - XP por lição e por desafio (com bônus por gabaritar quiz)
  - **Streak diário** (zera se perder um dia)
  - **Níveis de macaco**: Pobre → Esperto → Investidor → Milionário → Magnata (cada um desbloqueia avatar)
  - **Ranking semanal** (zera toda segunda)
  - **Conquistas** ("7 dias de streak", "completou módulo de investimentos", "30 desafios feitos", "gabaritou um quiz"...)
- **Monetização**: versão grátis (módulo 1 + desafios básicos + ranking) e **Premium R$ 9,90/mês** (todos os módulos, desafios avançados, conquistas e avatar exclusivos). O fluxo de pagamento é um placeholder — basta plugar App Store / Play / Stripe em `src/screens/PremiumScreen.js`.
- **Persistência local** via `AsyncStorage` (`src/storage/storage.js`) — pronto pra ser trocado/estendido por Supabase.

## Stack

- **Expo SDK 51** / React Native 0.74
- **React Navigation** (bottom tabs + native stack)
- **AsyncStorage** para estado local (camada isolada, fácil de migrar pro backend)
- Identidade visual: banana-amarelo + verde-selva, avatares em emoji (placeholders pros personagens do canal)

## Como rodar

```bash
npm install
npm start        # abre o Expo Dev Tools
npm run web      # roda no navegador
npm run ios      # simulador iOS (precisa de Mac)
npm run android  # emulador Android
```

## Estrutura

```
App.js                      # entry: providers + navegação
src/
  theme/                    # cores, tipografia, espaçamentos
  data/
    lessons.js              # módulos + lições + quizzes
    challenges.js           # 30 desafios práticos
    dailyChallenge.js       # sorteio determinístico do desafio do dia
    levels.js               # níveis de macaco e progressão de XP
    achievements.js         # conquistas e suas condições
    avatars.js              # avatares e regras de desbloqueio
    ranking.js              # ranking semanal (mock local)
  state/GameContext.js      # estado do jogo: XP, streak, níveis, conquistas, persistência
  storage/storage.js        # AsyncStorage (ponto de integração com Supabase)
  components/                # UI compartilhada (Button, Card, ProgressBar, StatsHeader...)
  navigation/RootNavigator.js
  screens/                  # Onboarding, Home (trilha), Lesson, Challenges, ChallengeDetail,
                            # Ranking, Profile, Achievements, Premium
```

## Próximos passos (roadmap)

- **Backend Supabase**: auth real, sincronização de progresso entre dispositivos, ranking global de verdade. A camada `src/storage/storage.js` já isola isso.
- **Notificações push** pra lembrar do streak.
- Substituir os avatares emoji pelos personagens ilustrados do Madrazzo MF.
- Mais módulos e desafios; conteúdo sazonal.
- Tela de estatísticas pessoais (gráfico de gastos anotados nos desafios).

## Estratégia de lançamento

Short de teaser → vídeo mostrando o app → beta com Premium grátis no 1º mês pra quem entrar cedo → coletar feedback → lançamento oficial.

---

Madrazzo MF · MonkeyFi v0.1.0 (beta)
