import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import '@/lib/env';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
