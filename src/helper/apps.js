const fs = require("fs");
const fetch = require("node-fetch");
const workfolder = require("../helper/workfolder");
const adm_zip = require("adm-zip");
const crypto = require("crypto");

class Apps
{
    constructor()
    {
        this.app_path = workfolder.app_path;
        this.app_config_file = workfolder.app_config_file;
    }

    getApps()
    {
        if(fs.existsSync(this.app_config_file))
        {
            const content = fs.readFileSync(this.app_config_file);
            try
            {
                const apps = JSON.parse(content);
                return apps;
            } catch(e) {}
        }
        return {};
    }

    getAppByProperty(property_name, property_value)
    {
        const apps = this.getApps();
        const filtered_app = apps.filter(app => app[property_name] === property_value);
        if(filtered_app.length === 1)
        {
            return filtered_app[0];
        }
        return false;
    }

    updateApp(property_name, property_value, updated_app)
    {
        if(fs.existsSync(this.app_config_file))
        {
            const apps = this.getApps();
            const updated_apps = apps.map(function(app) {
                if(app[property_name] === property_value)
                {
                    return updated_app;
                }
                return app;
            });
            return fs.writeFileSync(this.app_config_file, JSON.stringify(updated_apps, null, 3));
        }
        return false;
    }

    installApp(filename)
    {
        return new Promise(function(resolve, reject) {
            if(fs.existsSync(filename)) { 
                const content = fs.readFileSync(filename);
                var id = this.__installAppByBuffer(content);
                resolve(id);   
            }
            else if(filename.includes("http://") || filename.includes("https://")) {
                fetch(filename).then(res => res.buffer()).then(buffer => { 
                    var id = this.__installAppByBuffer(buffer);
                    resolve(id);    
                 })
            } 
            else 
            {
                reject()
            }
        }.bind(this));
    }


    getUniqueId()
    {
        const app_ids = this.getApps().map(app => app.id);
        let unique_id = "";
        do {
            unique_id = crypto.randomBytes(20).toString('hex');
        } while(app_ids.includes(unique_id))
        return unique_id;
    }

    __installAppByBuffer(buffer)
    {
        const zip = new adm_zip(buffer);
        const zip_entries = zip.getEntries();
        let app_config = false;
        for(let i = 0; i < zip_entries.length; i++)
        {
            let zip_entry = zip_entries[i];
            if (zip_entry.entryName == "wg-app.json") {
                app_config = JSON.parse(zip_entry.getData().toString('utf8')); 
            }
        }
        if(app_config)
        {
            if(this.getAppByProperty("package_name", app_config.package_name) === false)
            {
                app_config.id = this.getUniqueId();
                app_config.permissions = [];

                zip.deleteFile("wg-app.json");
                zip.extractAllTo(this.app_path + "/" + app_config.package_name);
                const apps = this.getApps();
                apps.push(app_config);
                try
                {
                    fs.writeFileSync(this.app_config_file, JSON.stringify(apps, null, 3));
                    return app_config.id;
                } catch(e) {
                    return false;
                }
            }
        }
        return false;
    }

    uninstallApp(app_name)
    {
        const app_path = this.app_path + '/' + app_name;
        if(fs.existsSync(app_path))
        {
            const full_app_path = fs.realpathSync(app_path);
            fs.rmdirSync(full_app_path, { recursive: true });
            const apps = this.getApps();
            const new_apps = [];
            for(var index = 0; index < apps.length; index++)
            {
                if(apps[index].package_name !== app_name)
                {
                    new_apps.push(apps[index]);
                }
            }
            fs.writeFileSync(this.app_config_file, JSON.stringify(new_apps, null, 3));
            return true;
        }
        return false;
    }
}

module.exports = new Apps();