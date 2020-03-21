"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var setup_1 = require("./src/setup");
var webserver_1 = require("./src/webserver");
var proxyserver_1 = require("./src/proxyserver");
setup_1.wg_setup().then(function () {
    webserver_1.run_webserver().catch(console.error);
    proxyserver_1.run_proxyserver().catch(console.error);
});
