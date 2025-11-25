import { EventEmitter } from "node:events";
import type { ExecutionEvent } from "~/services/execution/workflow-engine.server";

const emitter = new EventEmitter();
const eventBuffers = new Map<string, ExecutionEvent[]>();
const BUFFER_SIZE = 50;
const BUFFER_TTL = 60000; // 1 minute

export function publishExecutionEvent(executionId: string, event: ExecutionEvent) {
  const listenerCount = emitter.listenerCount(executionId);
  console.log(`📡 Publishing event to ${executionId} (${listenerCount} subscribers):`, event.type);

  // Buffer the event for late subscribers
  if (!eventBuffers.has(executionId)) {
    eventBuffers.set(executionId, []);
    // Clean up buffer after TTL
    setTimeout(() => {
      eventBuffers.delete(executionId);
      console.log(`🗑️ Cleaned up buffer for ${executionId}`);
    }, BUFFER_TTL);
  }

  const buffer = eventBuffers.get(executionId)!;
  buffer.push(event);
  if (buffer.length > BUFFER_SIZE) {
    buffer.shift(); // Keep only last BUFFER_SIZE events
  }

  emitter.emit(executionId, event);
}

export function subscribeToExecution(
  executionId: string,
  callback: (event: ExecutionEvent) => void
) {
  console.log(`🎧 New subscriber for execution: ${executionId}`);

  // Send buffered events to new subscriber
  const buffer = eventBuffers.get(executionId);
  if (buffer && buffer.length > 0) {
    console.log(`📦 Sending ${buffer.length} buffered events to new subscriber`);
    // Send buffered events asynchronously
    setTimeout(() => {
      buffer.forEach(event => callback(event));
    }, 0);
  }

  emitter.on(executionId, callback);
  return () => {
    console.log(`👋 Unsubscribed from execution: ${executionId}`);
    emitter.off(executionId, callback);
  };
}
