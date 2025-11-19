export {};

declare global {
  interface Window {
    ENV: {
      DEMO_MODE: string;
      WS_PORT: string;
    };
  }
}
