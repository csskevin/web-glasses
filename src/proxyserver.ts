import { WG_WEB_PORT } from "./webserver";
import http, { Server, IncomingMessage, ServerResponse, ClientRequest, RequestOptions } from "http";
import { Socket } from "net";
const net = require("net");

import URL from "url";

const WG_PROXY_PORT = process.env.WEBGLASSES_PROXY_PORT || "7001";

class ProxyServer {
    private proxy_server = <Server>{};

    public is_running: boolean = false;
    public default_port: string = WG_PROXY_PORT

    public listen() {
        this.proxy_server = http.createServer(this.handleHTTPRequest.bind(this)).listen(this.default_port);
        this.proxy_server.on('connect', this.handleHTTPSRequest.bind(this));
        this.is_running = true;
    }

    public close() {
        this.proxy_server.close();
        this.is_running = false;
    }

    private interceptRequestOptions(options: RequestOptions): RequestOptions {
        if (options.hostname?.endsWith("web-glasses.local")) {
            options.hostname = "localhost";
            options.port = WG_WEB_PORT
        }
        return options;
    }

    private handleHTTPRequest(req: IncomingMessage, res: ServerResponse) {
        if (req.url) {
            const parsed_url = URL.parse(req.url);
            // Prepare request configuration
            const options: RequestOptions = {
                hostname: parsed_url.hostname,
                port: parsed_url.port,
                path: parsed_url.path,
                method: req.method,
                headers: req.headers
            };
            const intercepted_options = this.interceptRequestOptions(options);
            // Proxying connection
            const proxy_client: ClientRequest = http.request(options, function (proxy_res: IncomingMessage) {
                if (proxy_res.statusCode) {
                    res.writeHead(proxy_res.statusCode, proxy_res.headers)
                    proxy_res.pipe(res, {
                        end: true
                    });
                }
            });
            req.pipe(proxy_client, {
                end: true
            });
            proxy_client.on("error", (err: Error) => { res.end(); })
        }
    }

    private handleHTTPSRequest(req: IncomingMessage, client_socket: Socket) {
        const { port, hostname } = URL.parse(`//${req.url}`, false, true) // extract destination host and port from CONNECT request
        if (hostname && port) {
            const server_error_handler = (err: any) => {
                if (client_socket) {
                    client_socket.end(`HTTP/1.1 500 ${err.message}\r\n`)
                }
            }
            const server_end_handler = () => {
                if (client_socket) {
                    client_socket.end(`HTTP/1.1 500 External Server End\r\n`)
                }
            }
            const server_socket = net.connect(port, hostname);
            const client_error_handler = (err: any) => {
                if (server_socket) {
                    server_socket.end()
                }
            }
            const client_end_handler = () => {
                if (server_socket) {
                    server_socket.end()
                }
            }
            client_socket.on('error', client_error_handler)
            client_socket.on('end', client_end_handler)
            server_socket.on('error', server_error_handler)
            server_socket.on('end', server_end_handler)
            server_socket.on('connect', () => {
                client_socket.write([
                    'HTTP/1.1 200 Connection Established'
                ].join('\r\n'))
                client_socket.write('\r\n\r\n')
                server_socket.pipe(client_socket, { end: false })
                client_socket.pipe(server_socket, { end: false })
            })
        } else {
            client_socket.end('HTTP/1.1 400 Bad Request\r\n')
            client_socket.destroy()
        }
    }
}

let active_server: ProxyServer;

const run_proxyserver = async () => {
    active_server = new ProxyServer();
    active_server.listen();
};

const stop_proxyserver = () => {
    active_server.close();
};

const restart_proxyserver = async () => {
    if (active_server.is_running) {
        stop_proxyserver();
    }
    run_proxyserver();
}

export { run_proxyserver, stop_proxyserver, restart_proxyserver, WG_PROXY_PORT };