export const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
export const GEMINI_MODEL = 'gemini-flash-lite-latest';
export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
