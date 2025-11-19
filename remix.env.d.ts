/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare module "*?worker" {
  const WorkerConstructor: {
    new (): Worker;
  };
  export default WorkerConstructor;
}

interface ImportMetaEnv {
  readonly DATABASE_URL?: string;
  readonly FLOWFORGE_DEMO_MODE?: string;
  readonly FLOWFORGE_WS_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
