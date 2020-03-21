"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var webserver_1 = require("./webserver");
var http_1 = __importDefault(require("http"));
var net = require("net");
var url_1 = __importDefault(require("url"));
var WG_PROXY_PORT = process.env.WEBGLASSES_PROXY_PORT || "7001";
exports.WG_PROXY_PORT = WG_PROXY_PORT;
var ProxyServer = /** @class */ (function () {
    function ProxyServer() {
        this.proxy_server = {};
        this.is_running = false;
        this.default_port = WG_PROXY_PORT;
    }
    ProxyServer.prototype.listen = function () {
        this.proxy_server = http_1.default.createServer(this.handleHTTPRequest.bind(this)).listen(this.default_port);
        this.proxy_server.on('connect', this.handleHTTPSRequest.bind(this));
        this.is_running = true;
    };
    ProxyServer.prototype.close = function () {
        this.proxy_server.close();
        this.is_running = false;
    };
    ProxyServer.prototype.interceptRequestOptions = function (options) {
        var _a;
        if ((_a = options.hostname) === null || _a === void 0 ? void 0 : _a.endsWith("web-glasses.local")) {
            options.hostname = "localhost";
            options.port = webserver_1.WG_WEB_PORT;
        }
        return options;
    };
    ProxyServer.prototype.handleHTTPRequest = function (req, res) {
        if (req.url) {
            var parsed_url = url_1.default.parse(req.url);
            // Prepare request configuration
            var options = {
                hostname: parsed_url.hostname,
                port: parsed_url.port,
                path: parsed_url.path,
                method: req.method,
                headers: req.headers
            };
            var intercepted_options = this.interceptRequestOptions(options);
            // Proxying connection
            var proxy_client = http_1.default.request(options, function (proxy_res) {
                if (proxy_res.statusCode) {
                    res.writeHead(proxy_res.statusCode, proxy_res.headers);
                    proxy_res.pipe(res, {
                        end: true
                    });
                }
            });
            req.pipe(proxy_client, {
                end: true
            });
            proxy_client.on("error", function (err) { res.end(); });
        }
    };
    ProxyServer.prototype.handleHTTPSRequest = function (req, client_socket) {
        var _a = url_1.default.parse("//" + req.url, false, true), port = _a.port, hostname = _a.hostname; // extract destination host and port from CONNECT request
        if (hostname && port) {
            var server_error_handler = function (err) {
                if (client_socket) {
                    client_socket.end("HTTP/1.1 500 " + err.message + "\r\n");
                }
            };
            var server_end_handler = function () {
                if (client_socket) {
                    client_socket.end("HTTP/1.1 500 External Server End\r\n");
                }
            };
            var server_socket_1 = net.connect(port, hostname);
            var client_error_handler = function (err) {
                if (server_socket_1) {
                    server_socket_1.end();
                }
            };
            var client_end_handler = function () {
                if (server_socket_1) {
                    server_socket_1.end();
                }
            };
            client_socket.on('error', client_error_handler);
            client_socket.on('end', client_end_handler);
            server_socket_1.on('error', server_error_handler);
            server_socket_1.on('end', server_end_handler);
            server_socket_1.on('connect', function () {
                client_socket.write([
                    'HTTP/1.1 200 Connection Established'
                ].join('\r\n'));
                client_socket.write('\r\n\r\n');
                server_socket_1.pipe(client_socket, { end: false });
                client_socket.pipe(server_socket_1, { end: false });
            });
        }
        else {
            client_socket.end('HTTP/1.1 400 Bad Request\r\n');
            client_socket.destroy();
        }
    };
    return ProxyServer;
}());
var active_server;
var run_proxyserver = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        active_server = new ProxyServer();
        active_server.listen();
        return [2 /*return*/];
    });
}); };
exports.run_proxyserver = run_proxyserver;
var stop_proxyserver = function () {
    active_server.close();
};
exports.stop_proxyserver = stop_proxyserver;
var restart_proxyserver = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (active_server.is_running) {
            stop_proxyserver();
        }
        run_proxyserver();
        return [2 /*return*/];
    });
}); };
exports.restart_proxyserver = restart_proxyserver;
