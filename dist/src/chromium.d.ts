declare const run_chromium: () => Promise<void>;
declare const stop_chromium: () => void;
declare const restart_chromium: () => Promise<void>;
export { run_chromium, stop_chromium, restart_chromium };
