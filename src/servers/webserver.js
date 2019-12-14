// Webserver Tools
const express = require("express");
const body_parser = require('body-parser')
const app = express();
const json_parser = body_parser.json()
const raw_parser = body_parser.raw();

// Libraries
const permission = require("../helper/permission");
const apps = require("../helper/apps");
const workfolder = require("../helper/workfolder");

// Request Handler
const app_handler = require("../handler/apphandler");
const file_handler = require("../handler/filehandler");
const permission_handler = require("../handler/permissionhandler");

if(workfolder.on_first_install)
{
    apps.installApp("https://store.web-glasses.net/apps/webglasses/default.zip").then(function(app_id) {
        permission.allowPermission(app_id, "apps_control");
    });
}

// Permission handler
app.post("/api/permission", json_parser, permission_handler.onAllowPermission.bind(permission_handler));
app.delete("/api/permission", json_parser, permission_handler.onRevokePermission.bind(permission_handler));

// Apps handler
app.post("/api/install_app", json_parser, app_handler.onAppInstall.bind(app_handler));
app.delete("/api/uninstall_app/:app_name", app_handler.onAppUninstall.bind(app_handler));

// Storage handler
app.post("/api/internal_storage/write_file", raw_parser, file_handler.onWriteFile.bind(file_handler));
app.get("/api/internal_storage/read_file", file_handler.onReadFile.bind(file_handler));
app.post("/api/internal_storage/mkdir", file_handler.onMkdir.bind(file_handler));
app.delete("/api/internal_storage/rmdir", file_handler.onRmdir.bind(file_handler));
app.delete("/api/internal_storage/unlink_file", file_handler.onUnlinkFile.bind(file_handler));

// View handler
app.get("/", app_handler.onAppRequestWithoutPath.bind(app_handler));
app.get("/*", app_handler.onAppRequest.bind(app_handler));

app.listen(process.env.WEBGLASSES_WEB_PORT || 6000);