"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wg_core_1 = require("wg-core");
function wg_setup() {
    return new Promise(function (resolve, reject) {
        if (wg_core_1.Workfolder.on_first_install) {
            wg_core_1.Apps.installApp("https://store.web-glasses.net/apps/webglasses/net.web-glasses.app.frame.zip").then(function (app_id) {
                if (app_id) {
                    wg_core_1.Permission.grantSpecialPermission(app_id, "default");
                    wg_core_1.Permission.grantSpecialPermission(app_id, "modify_apps");
                    wg_core_1.Permission.grantSpecialPermission(app_id, "modify_permissions");
                    resolve();
                }
                reject();
            });
        }
        else {
            resolve();
        }
    });
}
exports.wg_setup = wg_setup;
