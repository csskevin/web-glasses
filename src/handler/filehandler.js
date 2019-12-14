const apps = require("../helper/apps");
const files = require("../helper/files");
const http_verification = require("../helper/http-verification");
const http_responses = require("../helper/http-responses");

class FileHandler
{
    onWriteFile(req, res)
    {
        this.__onRequest(req, res, function(app_name, filepath) {
            const body = req.body;
            const status = files.writeFile(app_name, filepath, body);
            res.json({
                status: status
            })
        })
    }

    onUnlinkFile(req, res)
    {
        this.__onRequest(req, res, function(app_name, filepath) {
            const status = files.unlinkFile(app_name, filepath);
            res.json({
                status: status
            })
        });
    }

    onMkdir(req, res)
    {
        this.__onRequest(req, res, function(app_name, filepath) {
            const status = files.mkdir(app_name, filepath);
            res.json({
                status: status
            })
        });
    }

    onRmdir(req, res)
    {
        this.__onRequest(req, res, function(app_name, filepath) {
            const status = files.rmdir(app_name, filepath);
            res.json({
                status: status
            })
        });
    }

    onReadFile(req, res)
    {
        this.__onRequest(req, res, function(app_name, filepath) {
            const path = files.readFile(app_name, filepath);
            if(path)
            {
                res.sendFile(path);
            }
            else if(path === null)
            {
                http_responses.FileNotFound(res);
            }
            else if(path === false)
            {
                http_responses.FileNotAccessible(res);
            }
        });
    }

    __onRequest(req, res, cb)
    {
        const app_id = http_verification.getSubdomain(req);
        const app = apps.getAppByProperty("id", app_id);
        let app_name = app ? app.package_name : false;
        if(app_name)
        {
            const filepath = req.query.filepath;
            cb(app_name, filepath);  
        }
        else 
        {
            http_responses.appNotFound(res);
        }
    }
}

module.exports = new FileHandler();