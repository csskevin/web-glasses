declare const WG_WEB_PORT: string;
declare const run_webserver: () => Promise<void>;
declare const stop_webserver: () => void;
declare const restart_webserver: () => Promise<void>;
export { run_webserver, stop_webserver, restart_webserver, WG_WEB_PORT };
