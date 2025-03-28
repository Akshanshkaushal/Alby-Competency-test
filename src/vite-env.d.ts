/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALBY_CLIENT_ID: string;
  readonly VITE_ALBY_REDIRECT_URI: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 