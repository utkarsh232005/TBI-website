import { getFirebaseDb } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { EvaluationFilterSettings } from '@/types/FilterSettings';

const USERS_COLLECTION = 'users';
const FILTER_SETTINGS_SUBCOLLECTION = 'filterSettings';

export async function saveEvaluationFilterSettings(
  userId: string,
  settings: EvaluationFilterSettings
): Promise<{ status: 'success' | 'error'; message?: string }> {
  try {
    const settingsRef = doc(getFirebaseDb(), USERS_COLLECTION, userId, FILTER_SETTINGS_SUBCOLLECTION, 'evaluationSubmissions');
    await setDoc(settingsRef, settings, { merge: true });
    return { status: 'success' };
  } catch (error: any) {
    console.error("Error saving filter settings:", error);
    return { status: 'error', message: error.message };
  }
}

export async function loadEvaluationFilterSettings(
  userId: string
): Promise<{ status: 'success' | 'error'; settings?: EvaluationFilterSettings; message?: string }> {
  try {
    const settingsRef = doc(getFirebaseDb(), USERS_COLLECTION, userId, FILTER_SETTINGS_SUBCOLLECTION, 'evaluationSubmissions');
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Initialize with default values that match the interface
      const loadedSettings: EvaluationFilterSettings = {
        status: data.status || 'all',
        legalStatus: data.legalStatus || 'all',
        developmentStage: data.developmentStage || 'all',
        customFilters: data.customFilters || []
      };
      return { status: 'success', settings: loadedSettings };
    } else {
      // Return default settings when none exist
      const defaultSettings: EvaluationFilterSettings = {
        status: 'all',
        legalStatus: 'all',
        developmentStage: 'all',
        customFilters: []
      };
      return { status: 'success', settings: defaultSettings };
    }
  } catch (error: any) {
    console.error("Error loading filter settings:", error);
    return { status: 'error', message: error.message };
  }
} 