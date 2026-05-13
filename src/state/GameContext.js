import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { loadState, saveState, clearState } from '../storage/storage';
import { todayKey, daysBetween } from '../data/dailyChallenge';
import { levelForXp, nextLevelForXp, levelProgress } from '../data/levels';
import { evaluateAchievements } from '../data/achievements';
import { moduleCompleted, MODULES, getLessonById } from '../data/lessons';
import { getChallengeById } from '../data/challenges';

const GameContext = createContext(null);

function mondayKey(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - day);
  return todayKey(d);
}

const INITIAL_STATE = {
  onboarded: false,
  profile: { name: '', avatarId: 'classic', startLevel: 'never', isPremium: false },
  xp: 0,
  weeklyXp: 0,
  weekKey: mondayKey(),
  streak: 0,
  lastActiveDay: null,
  completedLessons: [],
  perfectQuizzes: [],
  completedModules: [],
  completedChallenges: [],
  challengeLog: {}, // { 'YYYY-MM-DD': challengeId }
  unlockedAchievements: [],
};

// Garante que estados antigos/parciais ganhem as chaves novas.
function normalize(s) {
  return { ...INITIAL_STATE, ...(s || {}), profile: { ...INITIAL_STATE.profile, ...((s && s.profile) || {}) } };
}

// Atualiza streak / semana ao registrar uma atividade (lição ou desafio).
function withActivity(state) {
  const today = todayKey();
  let streak = state.streak;
  if (state.lastActiveDay === today) {
    // já contou hoje
  } else if (state.lastActiveDay && daysBetween(state.lastActiveDay, today) === 1) {
    streak = state.streak + 1;
  } else {
    streak = 1;
  }
  let { weeklyXp, weekKey } = state;
  const thisWeek = mondayKey();
  if (weekKey !== thisWeek) {
    weeklyXp = 0;
    weekKey = thisWeek;
  }
  return { ...state, streak, lastActiveDay: today, weeklyXp, weekKey };
}

function addXp(state, amount) {
  return { ...state, xp: state.xp + amount, weeklyXp: state.weeklyXp + amount };
}

function recomputeDerived(state) {
  // Módulos concluídos
  const completedModules = MODULES.filter((m) => moduleCompleted(m.id, state.completedLessons)).map((m) => m.id);
  // Conquistas
  const unlockedAchievements = evaluateAchievements({ ...state, completedModules });
  return { ...state, completedModules, unlockedAchievements };
}

export function GameProvider({ children }) {
  const [state, setState] = useState(normalize(null));
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    (async () => {
      const loaded = await loadState();
      if (loaded) setState(normalize(loaded));
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  // Aplica uma transformação ao estado e devolve o estado resultante (síncrono).
  const apply = useCallback((fn) => {
    const next = recomputeDerived(fn(stateRef.current));
    stateRef.current = next;
    setState(next);
    return next;
  }, []);

  const completeOnboarding = useCallback(({ name, avatarId, startLevel }) => {
    apply((s) => withActivity({
      ...s,
      onboarded: true,
      profile: { ...s.profile, name: name?.trim() || 'Macaco Anônimo', avatarId, startLevel },
      // streak começa em 1 no dia da criação da conta
      streak: 0,
      lastActiveDay: null,
    }));
  }, [apply]);

  const setPremium = useCallback((value) => {
    apply((s) => ({ ...s, profile: { ...s.profile, isPremium: !!value } }));
  }, [apply]);

  const setAvatar = useCallback((avatarId) => {
    apply((s) => ({ ...s, profile: { ...s.profile, avatarId } }));
  }, [apply]);

  // Conclui uma lição. `result` = { correct, total }.
  const completeLesson = useCallback((lessonId, result = { correct: 0, total: 0 }) => {
    const before = stateRef.current;
    const lesson = getLessonById(lessonId);
    if (!lesson) return { xpGained: 0, newAchievements: [], leveledUp: false, alreadyDone: false };
    const alreadyDone = before.completedLessons.includes(lessonId);
    const baseXp = lesson.xp;
    const perfect = result.total > 0 && result.correct === result.total;
    const bonus = perfect ? 10 : 0;
    // Repetir lição já feita rende XP reduzido (incentiva avançar, sem punir revisão).
    const xpGained = alreadyDone ? Math.round(baseXp * 0.25) : baseXp + bonus;

    const beforeLevel = levelForXp(before.xp);
    const after = apply((s) => {
      let ns = withActivity(s);
      ns = addXp(ns, xpGained);
      ns = {
        ...ns,
        completedLessons: ns.completedLessons.includes(lessonId)
          ? ns.completedLessons
          : [...ns.completedLessons, lessonId],
        perfectQuizzes: perfect && !ns.perfectQuizzes.includes(lessonId)
          ? [...ns.perfectQuizzes, lessonId]
          : ns.perfectQuizzes,
      };
      return ns;
    });
    const afterLevel = levelForXp(after.xp);
    const newAchievements = after.unlockedAchievements.filter((a) => !before.unlockedAchievements.includes(a));
    return {
      xpGained,
      perfect,
      newAchievements,
      leveledUp: afterLevel.id !== beforeLevel.id,
      newLevel: afterLevel.id !== beforeLevel.id ? afterLevel : null,
      alreadyDone,
    };
  }, [apply]);

  // Conclui um desafio (do dia ou da lista). `dayKey` opcional registra como o desafio daquele dia.
  const completeChallenge = useCallback((challengeId, opts = {}) => {
    const before = stateRef.current;
    const challenge = getChallengeById(challengeId);
    if (!challenge) return { xpGained: 0, newAchievements: [], leveledUp: false, alreadyDone: false };
    const alreadyDone = before.completedChallenges.includes(challengeId);
    const xpGained = alreadyDone ? 0 : challenge.xp;

    const beforeLevel = levelForXp(before.xp);
    const after = apply((s) => {
      let ns = withActivity(s);
      if (!alreadyDone) ns = addXp(ns, xpGained);
      ns = {
        ...ns,
        completedChallenges: ns.completedChallenges.includes(challengeId)
          ? ns.completedChallenges
          : [...ns.completedChallenges, challengeId],
      };
      if (opts.dayKey) {
        ns = { ...ns, challengeLog: { ...ns.challengeLog, [opts.dayKey]: challengeId } };
      }
      return ns;
    });
    const afterLevel = levelForXp(after.xp);
    const newAchievements = after.unlockedAchievements.filter((a) => !before.unlockedAchievements.includes(a));
    return {
      xpGained,
      newAchievements,
      leveledUp: afterLevel.id !== beforeLevel.id,
      newLevel: afterLevel.id !== beforeLevel.id ? afterLevel : null,
      alreadyDone,
    };
  }, [apply]);

  const resetProgress = useCallback(async () => {
    await clearState();
    const fresh = normalize(null);
    stateRef.current = fresh;
    setState(fresh);
  }, []);

  const derived = useMemo(() => {
    const level = levelForXp(state.xp);
    const next = nextLevelForXp(state.xp);
    return {
      level,
      nextLevel: next,
      progressToNext: levelProgress(state.xp),
      xpToNext: next ? next.minXp - state.xp : 0,
      isPremium: !!state.profile.isPremium,
    };
  }, [state]);

  const value = useMemo(() => ({
    ...state,
    ...derived,
    hydrated,
    completeOnboarding,
    setPremium,
    setAvatar,
    completeLesson,
    completeChallenge,
    resetProgress,
  }), [state, derived, hydrated, completeOnboarding, setPremium, setAvatar, completeLesson, completeChallenge, resetProgress]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame deve ser usado dentro de <GameProvider>');
  return ctx;
}
