import { Services, Service, Apps } from "wg-core";
import express, { Express } from "express";
import { Server } from "http";

const WG_WEB_PORT = process.env.WEBGLASSES_PROXY_PORT || "7000";

class WebServer {
    private instance: Express = express();
    private server: Server = <Server>{};

    public is_running: boolean = false;

    sortWebglassesServices(services: Array<Service>): Array<Service> {
        const express_paths_on_end = ["/", "/*"];
        const top_services = services.filter(service => !express_paths_on_end.includes(service.path));
        const end_services = services.filter(service => express_paths_on_end.includes(service.path));
        return top_services.concat(end_services);
    }

    useWebglassesServices() {
        const services: Array<Service> = Services.getServices();
        const ordered_services: Array<Service> = this.sortWebglassesServices(services);
        ordered_services.forEach(service => {
            if (service.parser) {
                this.instance[service.method](service.path, service.parser, service.handler);
            } else {
                this.instance[service.method](service.path, service.handler);
            }
        });
    }

    listen() {
        this.server = this.instance.listen(WG_WEB_PORT);
        this.is_running = true;
    }

    close() {
        this.server.close();
        this.is_running = false;
    }
}

let active_server: WebServer;

const run_webserver = async () => {
    active_server = new WebServer();
    active_server.useWebglassesServices();
    active_server.listen();
};

const stop_webserver = () => {
    active_server.close();
};

const restart_webserver = async () => {
    if (active_server && active_server.is_running) {
        stop_webserver();
    }
    run_webserver();
}

Apps.on('install', restart_webserver);
Apps.on('uninstall', restart_webserver);

export { run_webserver, stop_webserver, restart_webserver, WG_WEB_PORT };