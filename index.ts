import { wg_setup } from "./src/setup";
import { run_webserver } from "./src/webserver";
import { run_proxyserver } from "./src/proxyserver";
import { run_chromium } from "./src/chromium";

wg_setup().then(function() {
    run_webserver().catch(console.error);
    run_proxyserver().catch(console.error);
    run_chromium().catch(console.error);
});