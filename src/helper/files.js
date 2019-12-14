const fs = require("fs");
const workfolder = require("./workfolder");

class Files {
    writeFile(app_name, filepath, content)
    {
        var legit_path = this.getLegitPath(app_name, filepath);
        if(legit_path)
        {
            return this.__handleError(function(legit_path, content) {
                fs.writeFileSync(legit_path, content);
            }.bind(this, legit_path, content))
        }
        return false;
    }

    readFile(app_name, filepath)
    {
        var legit_path = this.getLegitPath(app_name, filepath);
        if(legit_path)
        {
            try {
                return legit_path;
            } catch(e)
            {
                return null;
            }
        }
        return false;
    }

    unlinkFile(app_name, filepath)
    {
        var legit_path = this.getLegitPath(app_name, filepath);
        if(legit_path && fs.existsSync(legit_path))
        {
            return this.__handleError(function(legit_path) {
                fs.unlinkSync(legit_path);
            }.bind(this, legit_path))
        }
        return false;
    }

    mkdir(app_name, filepath)
    {
        var legit_path = this.getLegitPath(app_name, filepath);
        if(legit_path)
        {
            return this.__handleError(function(legit_path) {
                fs.mkdirSync(legit_path);
            }.bind(this, legit_path));
        }
        return false;
    }

    rmdir(app_name, filepath)
    {
        var legit_path = this.getLegitPath(app_name, filepath);
        if(legit_path)
        {
            return this.__handleError(function(legit_path) {
                fs.rmdirSync(legit_path);
            }.bind(this, legit_path));
        }
        return false;
    }

    getLegitPath(app_name, relative_filepath)
    {
        var filepath = workfolder.app_path + "/" + app_name + "/" + relative_filepath;
        var filepath_parts = filepath.split("/");
        var last_filepath_element = filepath_parts.pop();
        var filepath_without_last_element = filepath_parts.join('/');
        var app_path = workfolder.app_path + "/" + app_name
        if(fs.existsSync(app_path) && fs.existsSync(filepath_without_last_element))
        {
            var real_app_path = fs.realpathSync(app_path);
            var real_filepath_without_last_element = fs.realpathSync(filepath_without_last_element);
            if(real_filepath_without_last_element.includes(real_app_path))
            {
                return real_filepath_without_last_element + "/" + last_filepath_element;
            }
        }
    }

    __handleError(cb)
    {
        try
        {
            cb();
            return true;
        } catch(e)
        {
            return e.message;
        }
    }
}

module.exports = new Files();