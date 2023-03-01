declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // All

      // Develop or Production
      NEXT_PUBLIC_AUTH_HOST: string;
    }
  }
}
export {};
