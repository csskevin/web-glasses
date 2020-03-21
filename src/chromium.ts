import { WG_PROXY_PORT } from "./proxyserver";
const chromiumBinary = require('chromium-binary');
const { execFile } = require('child_process');
process.env.GOOGLE_API_KEY="no"
process.env.GOOGLE_DEFAULT_CLIENT_ID="no"
process.env.GOOGLE_DEFAULT_CLIENT_SECRET="no"

class Chromium {
    private process: any;
    public is_running: boolean = false;

    run(): void {
        const default_page = 'http://web-glasses.local';
        const proxy_server = `http://localhost:${WG_PROXY_PORT}`
        const args: Array<string> = [
            default_page,
            '--proxy-server=' + proxy_server,
            '--start-fullscreen',
            '-kiosk'
        ];
        this.process = execFile(chromiumBinary.path, args, (err: any) => {
            if(err) {
                console.log(err); return;
            }
            this.is_running = true;
        });
    }

    close(): void {
        process.kill(this.process.pid);
        this.is_running = false;
    }
}

let active_server: Chromium;

const run_chromium = async () => {
    active_server = new Chromium();
    active_server.run();
};

const stop_chromium = () => {
    active_server.close();
};

const restart_chromium = async () => {
    if (active_server.is_running) {
        stop_chromium();
    }
    run_chromium();
}

export { run_chromium, stop_chromium, restart_chromium };