import AsyncStorage from '@react-native-async-storage/async-storage';

// Camada fina sobre o AsyncStorage. Quando o backend (Supabase) entrar,
// basta trocar a implementação destas três funções por chamadas remotas
// (e manter o AsyncStorage como cache offline).
const KEY = 'monkeyfi:state:v1';

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('MonkeyFi: falha ao carregar estado', e);
    return null;
  }
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('MonkeyFi: falha ao salvar estado', e);
  }
}

export async function clearState() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.warn('MonkeyFi: falha ao limpar estado', e);
  }
}
