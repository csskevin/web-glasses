const fs = require("fs");
class WorkFolder
{
    constructor()
    {
        this.homedir = require('os').homedir() + '/.web-glasses';
        this.app_path = this.homedir + '/apps';
        this.app_config_file = this.homedir + '/apps.json';
        this.client_config = this.homedir + '/client.json';
        this.on_first_install = false;

        if(!fs.existsSync(this.homedir)) { 
            fs.mkdirSync(this.homedir); 
            this.on_first_install = true;
        }
        if(!fs.existsSync(this.app_path)) { fs.mkdirSync(this.app_path); }
        if(!fs.existsSync(this.app_config_file)) { fs.writeFileSync(this.app_config_file, JSON.stringify([])); }
        if(!fs.existsSync(this.client_config)) { fs.writeFileSync(this.client_config, JSON.stringify({})); }
    }
}

module.exports = new WorkFolder();