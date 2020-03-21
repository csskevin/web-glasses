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
Object.defineProperty(exports, "__esModule", { value: true });
var proxyserver_1 = require("./proxyserver");
var chromiumBinary = require('chromium-binary');
var execFile = require('child_process').execFile;
process.env.GOOGLE_API_KEY = "no";
process.env.GOOGLE_DEFAULT_CLIENT_ID = "no";
process.env.GOOGLE_DEFAULT_CLIENT_SECRET = "no";
var Chromium = /** @class */ (function () {
    function Chromium() {
        this.is_running = false;
    }
    Chromium.prototype.run = function () {
        var _this = this;
        var default_page = 'http://web-glasses.local';
        var proxy_server = "http://localhost:" + proxyserver_1.WG_PROXY_PORT;
        var args = [
            default_page,
            '--proxy-server=' + proxy_server,
            '--start-fullscreen',
            '-kiosk'
        ];
        this.process = execFile(chromiumBinary.path, args, function (err) {
            if (err) {
                console.log(err);
                return;
            }
            _this.is_running = true;
        });
    };
    Chromium.prototype.close = function () {
        process.kill(this.process.pid);
        this.is_running = false;
    };
    return Chromium;
}());
var active_server;
var run_chromium = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        active_server = new Chromium();
        active_server.run();
        return [2 /*return*/];
    });
}); };
exports.run_chromium = run_chromium;
var stop_chromium = function () {
    active_server.close();
};
exports.stop_chromium = stop_chromium;
var restart_chromium = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (active_server.is_running) {
            stop_chromium();
        }
        run_chromium();
        return [2 /*return*/];
    });
}); };
exports.restart_chromium = restart_chromium;
