import { Workfolder, Apps, Permission } from "wg-core";

function wg_setup(): Promise<string> {
    return new Promise(function(resolve, reject) {
        if(Workfolder.on_first_install) {
            Apps.installApp("https://store.web-glasses.net/apps/webglasses/net.web-glasses.app.frame.zip").then((app_id: any) => {
                if(app_id) {
                    Permission.grantSpecialPermission(app_id, "default");
                    Permission.grantSpecialPermission(app_id, "modify_apps");
                    Permission.grantSpecialPermission(app_id, "modify_permissions");
                    resolve();
                }
                reject();
            })
        } else {
            resolve();
        }
    });
}

export { wg_setup }