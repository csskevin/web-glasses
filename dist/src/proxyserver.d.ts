declare const WG_PROXY_PORT: string;
declare const run_proxyserver: () => Promise<void>;
declare const stop_proxyserver: () => void;
declare const restart_proxyserver: () => Promise<void>;
export { run_proxyserver, stop_proxyserver, restart_proxyserver, WG_PROXY_PORT };
