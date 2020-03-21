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
var wg_core_1 = require("wg-core");
var express_1 = __importDefault(require("express"));
var WG_WEB_PORT = process.env.WEBGLASSES_PROXY_PORT || "7000";
exports.WG_WEB_PORT = WG_WEB_PORT;
var WebServer = /** @class */ (function () {
    function WebServer() {
        this.instance = express_1.default();
        this.server = {};
        this.is_running = false;
    }
    WebServer.prototype.sortWebglassesServices = function (services) {
        var express_paths_on_end = ["/", "/*"];
        var top_services = services.filter(function (service) { return !express_paths_on_end.includes(service.path); });
        var end_services = services.filter(function (service) { return express_paths_on_end.includes(service.path); });
        return top_services.concat(end_services);
    };
    WebServer.prototype.useWebglassesServices = function () {
        var _this = this;
        var services = wg_core_1.Services.getServices();
        var ordered_services = this.sortWebglassesServices(services);
        ordered_services.forEach(function (service) {
            if (service.parser) {
                _this.instance[service.method](service.path, service.parser, service.handler);
            }
            else {
                _this.instance[service.method](service.path, service.handler);
            }
        });
    };
    WebServer.prototype.listen = function () {
        this.server = this.instance.listen(WG_WEB_PORT);
        this.is_running = true;
    };
    WebServer.prototype.close = function () {
        this.server.close();
        this.is_running = false;
    };
    return WebServer;
}());
var active_server;
var run_webserver = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        active_server = new WebServer();
        active_server.useWebglassesServices();
        active_server.listen();
        return [2 /*return*/];
    });
}); };
exports.run_webserver = run_webserver;
var stop_webserver = function () {
    active_server.close();
};
exports.stop_webserver = stop_webserver;
var restart_webserver = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (active_server && active_server.is_running) {
            stop_webserver();
        }
        run_webserver();
        return [2 /*return*/];
    });
}); };
exports.restart_webserver = restart_webserver;
wg_core_1.Apps.on('install', restart_webserver);
wg_core_1.Apps.on('uninstall', restart_webserver);
