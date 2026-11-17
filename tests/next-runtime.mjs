// Next's request stores use this runtime global; Node's test runner needs it explicitly.
import { AsyncLocalStorage } from "node:async_hooks";
globalThis.AsyncLocalStorage ??= AsyncLocalStorage;
