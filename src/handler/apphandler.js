const fs = require("fs");
const apps = require("../helper/apps");
const http_verification = require("../helper/http-verification");
const http_responses = require("../helper/http-responses");

class AppHandler
{
    onAppRequestWithoutPath(req, res)
    {
        const app = http_verification.getAppBySubdomain(req);
        if(!app) { http_responses.appNotFound(res); return; }
        const file_entry = app.entryFile || "index.html";
        res.redirect('/' + file_entry);
        return;
    }
    
    onAppRequest(req, res)
    {
        let app = http_verification.getAppBySubdomain(req);
        if(!app) { http_responses.appNotFound(res); return; }
        const filepath = req.params[0] || app.entryFile || "index.html";
        const app_entry = app.entry || "./";
        const app_fullpath = apps.app_path + '/' + app.package_name + '/' + app_entry + '/' + filepath;
        if(fs.existsSync(app_fullpath))
        {
            const realpath_app_fullpath = fs.realpathSync(app_fullpath);
            res.sendFile(realpath_app_fullpath);
        } 
        else 
        {            
            http_responses.FileNotFound(res);
        }
    }

    onAppInstall(req, res)
    {
        if(!http_verification.hasSubdomainSpecificPermission(req, "apps_control")) {
            http_responses.methodNotAllowed();
            return;
        }
        const request_body = req.body
        if(Object.keys(request_body).includes("path"))
        {
            const app_path = request_body.path;
            apps.installApp(app_path).then(_ => { res.json({status:true}); }).catch(_ => { res.json({status: false}) })
        } 
        else 
        {
            res.json({status: false})
        }
    }
    
    onAppUninstall(req, res)
    {
        if(!http_verification.hasSubdomainSpecificPermission(req, "apps_control")) {
            http_responses.methodNotAllowed();
            return;
        }
        const app_name = req.params.app_name;
        const status = apps.uninstallApp(app_name);
        res.json({status: status});
    }
}

module.exports = new AppHandler();