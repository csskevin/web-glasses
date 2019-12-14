const apps = require("./apps");
const permission = require("./permission");

class Verification
{
    getSubdomain(request)
    {
        const subdomains = request.subdomains;
        if(subdomains.length === 1)
        {
            const subdomain = subdomains[0];
            return subdomain;
        }
        if(subdomains.length === 0)
        {
            const app = apps.getAppByProperty("package_name", "default");
            if(app)
            {
                return app.id;
            }
        }
        return false;
    }

    getAppBySubdomain(request)
    {
        var identifier = this.getSubdomain(request);
        if(identifier)
        {
            return apps.getAppByProperty("id", identifier);
        }
        return false;
    }

    hasSubdomainSpecificPermission(request, permission_name)
    {
        var app = this.getAppBySubdomain(request);
        if(app)
        {
            return permission.hasSpecificPermission(app.id, permission_name);
        }
    }
}

module.exports = new Verification();