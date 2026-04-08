/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PAYLOAD_ENCRYPTION_ENABLED?: 'true' | 'false';
  readonly VITE_PAYLOAD_ENCRYPTION_KEY?: string;
  readonly VITE_PAYLOAD_ENCRYPTION_ALGORITHM?: string;
  readonly VITE_PAYLOAD_ENCRYPTION_IV_LENGTH?: string;
  readonly VITE_PAYLOAD_ENCRYPTION_TAG_LENGTH?: string;
  readonly VITE_ENCRYPTED_PAYLOAD_SEPARATOR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
