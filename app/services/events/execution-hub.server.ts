import { EventEmitter } from "node:events";
import type { ExecutionEvent } from "~/services/execution/workflow-engine.server";

const emitter = new EventEmitter();

export function publishExecutionEvent(executionId: string, event: ExecutionEvent) {
  emitter.emit(executionId, event);
}

export function subscribeToExecution(
  executionId: string,
  callback: (event: ExecutionEvent) => void
) {
  emitter.on(executionId, callback);
  return () => emitter.off(executionId, callback);
}
