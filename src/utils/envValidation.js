// Environment variable validation utility

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

export const validateEnvVars = () => {
  const missingVars = [];
  const envStatus = {};

  requiredEnvVars.forEach((key) => {
    const value = import.meta.env[key];
    if (!value) {
      missingVars.push(key);
      envStatus[key] = { present: false, value: null };
    } else {
      // Mask sensitive values
      envStatus[key] = { 
        present: true, 
        value: key.includes('API_KEY') ? `${value.substring(0, 10)}...` : value 
      };
    }
  });

  const isValid = missingVars.length === 0;

  return {
    isValid,
    missingVars,
    envStatus,
    message: isValid 
      ? 'All environment variables are configured' 
      : `Missing environment variables: ${missingVars.join(', ')}`,
  };
};

export const getFirebaseConfig = () => {
  const { isValid, missingVars } = validateEnvVars();
  
  if (!isValid) {
    console.warn('Firebase configuration incomplete. Missing:', missingVars);
    return null;
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
};

export const isProduction = () => {
  return import.meta.env.PROD;
};

export const isDevelopment = () => {
  return import.meta.env.DEV;
};

export const getEnv = () => {
  return import.meta.env.MODE;
};

export default {
  validateEnvVars,
  getFirebaseConfig,
  isProduction,
  isDevelopment,
  getEnv,
};
