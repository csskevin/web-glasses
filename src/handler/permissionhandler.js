const permission = require("../helper/permission");
const http_verification = require("../helper/http-verification");
const http_responses = require("../helper/http-responses");

class PermissionHandler
{
    constructor()
    {
        this.disallowed_permissions = ["apps_control"];
    }

    __onFunctionPermission(fn, req, res)
    {
        if(!http_verification.hasSubdomainSpecificPermission(req, "apps_control")) {
            http_responses.methodNotAllowed(res);
            return;
        }
        const request_body = req.body;
        if(typeof request_body !== "object") {  http_responses.invalidRequestBody(res); return; }
        if(Object.keys(request_body).includes("app_id") && Object.keys(request_body).includes("permission"))
        {
            const app_id = request_body.app_id;
            const requested_permission = request_body.permission;
            if(this.disallowed_permissions.includes(requested_permission)) { http_responses.methodNotAllowed(res); return; }
            if(permission[fn](app_id, requested_permission))
            {
                res.json({status: true})
                return;
            }
            else
            {
                http_responses.permissionNotGranted(res);
                return;
            }
        }
        else
        {
            http_responses.invalidRequestBody(res);
        } 
    }

    onAllowPermission(req, res)
    {
        this.__onFunctionPermission("allowPermission", req, res);
    }

    onRevokePermission(req, res)
    {
        this.__onFunctionPermission("revokePermission", req, res);
    }
}

module.exports = new PermissionHandler();