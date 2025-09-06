/// <reference types="vite/client" />

declare module 'vite/client' {
  interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    readonly PROD: boolean;
    readonly DEV: boolean;
    // más variables de entorno aquí si las necesitas
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}




