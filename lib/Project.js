var Plugin = require('./Plugin'),
    fs = require('fs'),
    _ = require('lodash'),
    JsonLoader = require('./JsonLoader'),
    EmptyProject = {
        dependencies: {}
    };

var Project = function (path) {
    this.manifestFilePath = path;
    Object.defineProperty(this, 'plugins', {
        get: function () {
            var manifest = parse(this.manifestFilePath);
            return _.pairs(manifest.dependencies)
                    .map(function (pair) {
                        return new Plugin(pair[0], pair[1]);
                    });
        }.bind(this)
    });
};

Project.prototype.add = function (plugin) {
    if(typeof Plugin !== 'object' && plugin.constructor !== Plugin) {
        plugin = new Plugin(plugin);
    }
    var manifest = parse(this.manifestFilePath);
    manifest.dependencies[plugin.packageName] = plugin.version;
    save(this.manifestFilePath, manifest);
};

Project.prototype.remove = function (plugin) {
    if(typeof Plugin !== 'object' && plugin.constructor !== Plugin) {
        plugin = new Plugin(plugin);
    }
    var manifest = parse(this.manifestFilePath);
    delete manifest.dependencies[plugin.packageName];
    save(this.manifestFilePath, manifest);
};

function parse(manifestFilePath) {
    if(!manifestFilePath) return EmptyProject;

    try {
        var obj = JsonLoader.readJSONSync(manifestFilePath);
        delete obj.dependencies._;
        return obj;
    }
    catch (ex) {
        return EmptyProject;
    }
}

function save(manifestFilePath, manifest) {
    if(manifestFilePath) {
        fs.writeFileSync(manifestFilePath, JSON.stringify(sortObjectAttributes(manifest), null, 4));
    }
}

var sortObjectAttributes = function(obj){
    var object = obj.dependencies
    var keys = Object.keys(object);
    keys.sort();
    var rtn = { "_" : "sorting placeholder" };
    for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        rtn[key]= object[key];
    }
    delete rtn['_'];
    return { dependencies: rtn };
};

module.exports = Project;
