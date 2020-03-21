"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = require('http');
var url_1 = __importDefault(require("url"));
var net = require("net");
var server = http.createServer(onRequest).listen(7001);
function onRequest(client_req, client_res) {
    var _a;
    var parsed_url = url_1.default.parse(client_req.url);
    if ((_a = parsed_url.hostname) === null || _a === void 0 ? void 0 : _a.endsWith("web-glasses.local")) {
        parsed_url.hostname = "localhost";
        parsed_url.port = "7000";
    }
    var options = {
        hostname: parsed_url.hostname,
        port: parsed_url.port,
        path: parsed_url.path,
        method: client_req.method,
        headers: client_req.headers
    };
    var proxy = http.request(options, function (res) {
        client_res.writeHead(res.statusCode, res.headers);
        res.pipe(client_res, {
            end: true
        });
    });
    client_req.pipe(proxy, {
        end: true
    });
}
server.on('connect', function (req, clientSocket, head) {
    console.log(clientSocket.remoteAddress, clientSocket.remotePort, req.method, req.url);
    var _a = url_1.default.parse("//" + req.url, false, true), port = _a.port, hostname = _a.hostname; // extract destination host and port from CONNECT request
    if (hostname && port) {
        var serverErrorHandler = function (err) {
            console.error(err.message);
            if (clientSocket) {
                clientSocket.end("HTTP/1.1 500 " + err.message + "\r\n");
            }
        };
        var serverEndHandler = function () {
            if (clientSocket) {
                clientSocket.end("HTTP/1.1 500 External Server End\r\n");
            }
        };
        var serverSocket_1 = net.connect(port, hostname); // connect to destination host and port
        var clientErrorHandler = function (err) {
            console.error(err.message);
            if (serverSocket_1) {
                serverSocket_1.end();
            }
        };
        var clientEndHandler = function () {
            if (serverSocket_1) {
                serverSocket_1.end();
            }
        };
        clientSocket.on('error', clientErrorHandler);
        clientSocket.on('end', clientEndHandler);
        serverSocket_1.on('error', serverErrorHandler);
        serverSocket_1.on('end', serverEndHandler);
        serverSocket_1.on('connect', function () {
            clientSocket.write([
                'HTTP/1.1 200 Connection Established'
            ].join('\r\n'));
            clientSocket.write('\r\n\r\n'); // empty body
            // "blindly" (for performance) pipe client socket and destination socket between each other
            serverSocket_1.pipe(clientSocket, { end: false });
            clientSocket.pipe(serverSocket_1, { end: false });
        });
    }
    else {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n');
        clientSocket.destroy();
    }
});
