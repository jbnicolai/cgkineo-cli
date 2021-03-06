var chalk = require('chalk'),
    Q = require('q'),
    npm  = require('npm'),
    Constants = require('../Constants');

module.exports = function installNodeDependencies (properties /* { renderer, localDir } */) {            
    var deferred = Q.defer(),
        cwd = process.cwd();

    properties.renderer.log(chalk.cyan('installing node dependencies'));

    process.chdir(properties.localDir);
    npm.load(function (err) {
        if(err) deferred.reject(err);

        npm.commands.install(function () {
            if(err) deferred.reject(err);

            process.chdir(cwd);
            deferred.resolve(properties);
        });
    });
    return deferred.promise;
};