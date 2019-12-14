const apps = require("./apps");

class Permission
{
    getPermissions(app_id)
    {
        const app = apps.getAppByProperty("id", app_id);
        if(app)
        {
            if(Object.keys(app).includes("permissions"))
            {
                return app.permissions;
            }
        }
        return [];
    }

    hasSpecificPermission(app_name, permission)
    {
        const permissions = this.getPermissions(app_name);
        return permissions.includes(permission);
    }

    allowPermission(app_id, permission)
    {
        const app = apps.getAppByProperty("id", app_id);
        if(app)
        {
            if(!Object.keys(app).includes("permissions")) { app.permissions = []; }
            if(!app.permissions.includes(permission))
            {
                app.permissions.push(permission);
                apps.updateApp("id", app_id, app);
            }
            return true;
        }
    }

    revokePermission(app_id, permission)
    {
        const app = apps.getAppByProperty("id", app_id);
        if(app)
        {
            if(!Object.keys(app).includes("permissions")) { app.permissions = []; }
            if(app.permissions.includes(permission))
            {
                app.permissions.splice(app.permissions.indexOf(permission), 1);
                apps.updateApp("id", app_id, app);
            }
            return true;
        }
    }
}

module.exports = new Permission();