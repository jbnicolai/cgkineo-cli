var bower = require('bower-file'),
    chalk = require('chalk'),
    path = require('path'),
    uuid = require('uuid'),
    prompt = require('prompt'),
    Q = require('q'),
    fs = require('q-io/fs'),
    RepositoryDownloader = require('../RepositoryDownloader'),
    Constants = require('../Constants'),
    Plugin = require('../Plugin'),
    installNodeDependencies = require('../promise/installNodeDependencies'),
    installAdaptDependencies = require('../promise/installAdaptDependencies'),
    fsOrig = require('fs'),
    rimraf = require('rimraf'),
    exec = require('../promise/exec'),
    replace = require('replace'),
    ptr = new (require('../PluginTypeResolver'))();

module.exports = {
    create: function (renderer) {
        var type = arguments.length >= 3 ? arguments[1] : Constants.DefaultCreateType,
            localDir = arguments.length >= 4 ? arguments[2] : Constants.DefaultCourseName,
            branch = arguments.length >= 5 ? arguments[3] : Constants.DefaultBranch,
            done = arguments[arguments.length-1];

        confirmType({
            type: type
        }).then(function(properties) {
            switch (properties.type) {
            case "course":
                properties.localDir = localDir;
                properties.branch = branch;
                properties.renderer = renderer;
                return confirmCourse(properties)
                .then(deleteExistingCourse)
                .then(function (properties) {
                    renderer.write(chalk.cyan('downloading framework to', properties.localDir, '\t'));
                    return properties;
                })
                .then(getRepository)
                .progress(function (properties) {
                    renderer.write(chalk.grey('.'));
                    return properties;
                })
                .then(function (properties) {
                    renderer.log(' ', 'done!');
                    return properties;
                })
                .then(function (properties) {
                    return fs.removeTree(properties.tmp)
                    .then(function () {
                        return properties;
                    });
                })
                .then(installNodeDependencies)
                .then(installAdaptDependencies)
                .then(function (properties) {
                    renderer.log('\nremoving .gitignore files.\n');
                    var to  = path.join(process.cwd(), properties.localDir);
                    replace({
                        regex: "\.gitignore",
                        replacement: ".gitignr.bak",
                        paths: [to],
                        recursive: true,
                        silent: true,
                    });
                    renderer.log('\n'+chalk.green(properties.localDir), 'has been created.\n');
                    
                    renderer.log(chalk.grey('To build the course, run:') +
                        '\n\tcd ' + properties.localDir + 
                        '\n\tgrunt build\n');

                    renderer.log(chalk.grey('Then to view the course, run:') +
                        '\n\tgrunt server\n');
                })
                .then(function () {
                    done();
                })
                .fail(function (err) {
                    renderer.log(chalk.red("Oh dear, something went wrong. I'm terribly sorry."), err.message);
                    done(err);
                });
            case "component": case "extension": case "theme": case "menu":
                renderer.log(chalk.yellow('--Create Adapt Learning plugins--'));
                properties.name = '';
                properties.repo = 'cgkineo';
                properties.version = '0.0.0';
                properties.description = '';
                properties.maintainer = '';
                properties.email = '';
                properties.initial = 'y';
                properties.renderer = renderer

                return confirmPlugin(properties)
                .then(function(properties) {
                    renderer.log(chalk.yellow('--Readme/License--'));
                    return confirmPlugin2(properties);
                })
                .then(function(properties) {
                    renderer.log(chalk.yellow('--Maintainer--'));
                    return confirmPlugin3(properties);
                })
                .then(function(properties) {
                    renderer.log(chalk.yellow('--Location--'));
                    properties.src = "./src/" + ptr.resolve(properties.type).belongsTo + "/adapt-"+properties.name;
                    return confirmPlugin4(properties);
                })
                .then(function (properties) {
                    return cloneRepo(properties);
                })
                .then(function (properties) {
                    return renameStuff(properties);
                })
                .then(function (properties) {
                    renderer.log(chalk.yellow('--Git--'));
                    return confirmPlugin5(properties);
                })
                .then(function(properties) {
                    if (properties.initial) {
                        renderer.log(chalk.green('5. git init performed'));
                        return initRepo(properties);
                        
                        addOrigin(properties);
                        var ro ="https://github.com/" + properties.repo + "/adapt-" + properties.name + ".git";
                        renderer.log(chalk.green('6. git add remote origin ' + ro + ' performed'));
                    } else {
                        renderer.log(chalk.yellow('--All Done!--'));
                        done();
                    }
                })
                .then(function(properties) {
                    if (properties.initial) {
                        var ro ="https://github.com/" + properties.repo + "/adapt-" + properties.name + ".git";
                        renderer.log(chalk.green('6. git add remote origin ' + ro + ' performed'));
                        return addOrigin(properties);
                    } else {
                        renderer.log(chalk.yellow('--All Done!--'));
                        done();
                    }
                })
                .then(function(properties) {
                    if (properties.initial) {
                        renderer.log(chalk.green('7. git checkout -b develop performed'));
                        return checkout(properties);
                    } else {
                        renderer.log(chalk.yellow('--All Done!--'));
                        done();
                    }
                })
                .then(function() {
                    renderer.log(chalk.yellow('--All Done!--'));
                    done();
                })
                .fail(function (err) {
                    renderer.log(chalk.red("Oh dear, something went wrong. I'm terribly sorry."), err.message);
                    done(err);
                });
            }
        })
        

    }
};

function confirmType(properties) {
     var deferred = Q.defer(),
        renderer = properties.renderer;

    var schema = {
            properties: {
                type: {
                    description: 'type',
                    pattern: /^course$|^extension$|^component$|^menu$|^theme$/,
                    type: 'string',
                    default: properties.type,
                    required: true
                }
            }
        };
    prompt.message = chalk.cyan('Confirm');
    prompt.delimiter = ' ';
    prompt.start();
    prompt.get(schema, function (err, properties) {
        if(err) return deferred.reject(err);
        properties.renderer = renderer;
        deferred.resolve(properties);
    });
    return deferred.promise;
}

function confirmCourse(properties) {
    var deferred = Q.defer(),
        renderer = properties.renderer;

    var schema = {
            properties: {
                localDir: {
                    description: 'name',
                    pattern: /\w/,
                    type: 'string',
                    default: properties.localDir,
                    required: true
                },
                branch: {
                    description: 'branch',
                    pattern: /\w/,
                    type: 'string',
                    default: properties.branch || 'not specified',
                    required: true
                },
                ready: {
                    description: 'create now?',
                    message: 'Please specify (y)es or (n)o',
                    pattern: /^y$|^n$/i,
                    type: 'string',
                    default: 'y',
                    required: true,
                    before: function(value) { return /^y$/i.test(value); }
                }
            }
        };
    prompt.message = chalk.cyan('Confirm');
    prompt.delimiter = ' ';
    prompt.start();
    prompt.get(schema, function (err, properties) {
        if(err) return deferred.reject(err);
        if(!properties.ready) deferred.reject(new Error('Aborted. Nothing has been created.'));

        properties.renderer = renderer;
        deferred.resolve(properties);
    });
    return deferred.promise;
}

function deleteExistingCourse(properties) {
    return fs.exists(properties.localDir)
    .then(function (exists) {
        if(exists) {
            var deferred = Q.defer();
            
            prompt.start();
            prompt.get([{
                name: 'overwrite existing course?',
                message: 'Please specify (y)es or (n)o',
                pattern: /^y$|^n$/i,
                type: 'string',
                default: 'n',
                required: true,
                before: function(value) { return /^y$/i.test(value); }
            }],
            function (err, results) {
                if(err) deferred.reject(err);

                if(results['overwrite existing course?']) {
                    fs.removeTree(properties.localDir)
                      .then(function (){
                        deferred.resolve(properties);
                      })
                      .fail(function (err) {
                        deferred.reject(err);
                      });
                } else {
                    deferred.reject(new Error('Course already exists and cannot overwrite.'));
                }
            });

            return deferred.promise;
        }
    })
    .then(function () {
        return properties;
    });
}

function getRepository(properties) {
    var downloader = new RepositoryDownloader({
            repository: Constants.FrameworkRepository,
            branch : properties.branch
        }),
        tmp = properties.tmp = path.join(Constants.HomeDirectory, '.adapt', 'tmp', uuid.v1()),
        downloadedSource = path.join(tmp, Constants.FrameworkRepositoryName + '-' + properties.branch);

    return downloader.fetch(tmp).then(function () {
        return fs.copyTree(downloadedSource, properties.localDir)
                 .then(function () {
                    return properties;
                 });
    });
}

function confirmPlugin(properties) {
    var deferred = Q.defer(),
        renderer = properties.renderer;

    var schema = {
            properties: {
                name: {
                    description: 'name, adapt-*',
                    pattern: /\w/,
                    type: 'string',
                    default: properties.name,
                    required: true
                },
                description: {
                    description: 'description',
                    pattern: /\w/,
                    type: 'string',
                    default: "",
                    required: true
                }
            }
        };
    prompt.message = chalk.cyan('Confirm');
    prompt.delimiter = ' ';
    prompt.start();
    prompt.get(schema, function (err, props) {
        if(err) return deferred.reject(err);
        props.type = properties.type;
        props.repo = properties.repo;
        props.version = properties.version;
        props.maintainer = properties.maintainer;
        props.email = properties.email;
        props.src = properties.src;
        props.renderer = properties.renderer;
        deferred.resolve(props);
    });
    return deferred.promise;
}

function confirmPlugin2(properties) {
    var deferred = Q.defer(),
        renderer = properties.renderer;
    var schema = {
            properties: {
                repo: {
                    description: 'repo, http://github.com/*/',
                    pattern: /\w/,
                    type: 'string',
                    default: properties.repo,
                    required: true
                },
                version: {
                    description: 'version',
                    pattern: /\d\.\d\.\d/,
                    type: 'string',
                    default: "0.0.0",
                    required: true
                }
            }
        };
    prompt.message = chalk.cyan('Confirm');
    prompt.delimiter = ' ';
    prompt.start();
    prompt.get(schema, function (err, props) {
        if(err) return deferred.reject(err);

        props.name = properties.name;
        props.type = properties.type;
        props.description = properties.description;
        props.maintainer = properties.maintainer;
        props.email = properties.email;
        props.renderer =  properties.renderer;
        deferred.resolve(props);
    });
    return deferred.promise;
}

function confirmPlugin3(properties) {
    var deferred = Q.defer(),
        renderer = properties.renderer;

    var schema = {
            properties: {
                maintainer: {
                    description: 'name',
                    pattern: /\w/,
                    type: 'string',
                    default: "",
                    required: true
                },
                email: {
                    description: 'email',
                    pattern: /\w/,
                    type: 'string',
                    default: "",
                    required: true
                }
            }
        };
    prompt.message = chalk.cyan('Confirm');
    prompt.delimiter = ' ';
    prompt.start();
    prompt.get(schema, function (err, props) {
        if(err) return deferred.reject(err);

        props.name = properties.name;
        props.type = properties.type;
        props.description = properties.description;
        props.repo = properties.repo;
        props.version = properties.version;
        props.renderer =  properties.renderer;
        deferred.resolve(props);
    });
    return deferred.promise;
}

function confirmPlugin4(properties) {
    var deferred = Q.defer(),
        renderer = properties.renderer;

    var schema = {
            properties: {
                src: {
                    description: 'create in',
                    pattern: /\w/,
                    type: 'string',
                    default: properties.src,
                    required: true
                },
                ready: {
                    description: 'create now?',
                    message: 'Please specify (y)es or (n)o',
                    pattern: /^y$|^n$/i,
                    type: 'string',
                    default: 'y',
                    required: true,
                    before: function(value) { return /^y$/i.test(value); }
                }
            }
        };
    prompt.message = chalk.cyan('Confirm');
    prompt.delimiter = ' ';
    prompt.start();
    prompt.get(schema, function (err, props) {
        if(err) return deferred.reject(err);
        if(!props.ready) deferred.reject(new Error('Aborted. Nothing has been created.'));

        props.name = properties.name;
        props.type = properties.type;
        props.repo = properties.repo;
        props.version = properties.version;
        props.description = properties.description;
        props.maintainer = properties.maintainer;
        props.email = properties.email;
        props.renderer =  properties.renderer;

        deferred.resolve(props);
    });
    return deferred.promise;
}



function cloneRepo(properties) {
    var rend = properties.renderer
    return exec("git", [ "clone", "http://github.com/cgkineo/adapt-template-" + properties.type, properties.src ], process.cwd(), properties);
}

function renameStuff(properties) {
    var rend = properties.renderer;
    var cwd  = path.join(path.dirname(fsOrig.realpathSync(__filename)), '../../bin');
    var to  = path.join(process.cwd(), properties.src);

   rend.log(chalk.green("1. Git repository cloned"));


    replace({
        regex: "%nameshort%",
        replacement: properties.name,
        paths: [to],
        recursive: true,
        silent: true,
    });
    replace({
        regex: "%name%",
        replacement: "adapt-"+properties.name,
        paths: [to],
        recursive: true,
        silent: true,
    });
    replace({
        regex: "%version%",
        replacement: properties.version,
        paths: [to],
        recursive: true,
        silent: true,
    });
    replace({
        regex: "%repo%",
        replacement: properties.repo,
        paths: [to],
        recursive: true,
        silent: true,
    });
    replace({
        regex: "%description%",
        replacement: properties.description,
        paths: [to],
        recursive: true,
        silent: true,
    });
    replace({
        regex: "%maintainer%",
        replacement: properties.maintainer,
        paths: [to],
        recursive: true,
        silent: true,
    });
    replace({
        regex: "%email%",
        replacement: properties.email,
        paths: [to],
        recursive: true,
        silent: true,
    });

    rend.log(chalk.green("2. Variables replaced"));


    var files = [
        {
            from: "/js/name.js",
            to: "/js/adapt-" + properties.name + ".js"
        },
        {
            from: "/less/nameshort.less",
            to: "/less/" + properties.name + ".less"
        },
        {
            from: "/templates/nameshort.hbs",
            to: "/templates/" + properties.name + ".hbs"
        }
    ];

    for (var i = 0; i < files.length; i++) {
        fsOrig.renameSync( path.join(to, files[i]['from'] ), path.join(to, files[i]['to'] ) )    
    }

    var deferred = Q.defer(),
        renderer = properties.renderer;

    function rename() {
        deferred.resolve(properties);
    }
    
    rend.log(chalk.green("3. Files renamed"));

    rimraf( path.join(to, ".git" ), rename );

    rend.log(chalk.green("4. Git repository removed"));
    
    return deferred.promise;
}

function confirmPlugin5(properties) {
    var deferred = Q.defer(),
        renderer = properties.renderer;

    var schema = {
            properties: {
                initial: {
                    description: 'perform git init and git add remote origin?',
                    message: 'Please specify (y)es or (n)o',
                    pattern: /^y$|^n$/i,
                    type: 'string',
                    default: 'y',
                    required: true,
                    before: function(value) { return /^y$/i.test(value); }
                }
            }
        };
    prompt.message = chalk.cyan('Confirm');
    prompt.delimiter = ' ';
    prompt.start();
    prompt.get(schema, function (err, props) {
        if(err) return deferred.reject(err);

        props.name = properties.name;
        props.type = properties.type;
        props.repo = properties.repo;
        props.version = properties.version;
        props.description = properties.description;
        props.maintainer = properties.maintainer;
        props.email = properties.email;
        props.src = properties.src;
        props.renderer =  properties.renderer;
        deferred.resolve(props);
    });
    return deferred.promise;
}


function initRepo(properties) {
    var rend = properties.renderer
    return exec("git", [ "init" ], path.join(process.cwd(), properties.src), properties);
}

function addOrigin(properties) {
    var rend = properties.renderer
    return exec("git", [ "remote", "add", "origin", "https://github.com/" + properties.repo + "/adapt-" + properties.name + ".git" ], path.join(process.cwd(), properties.src), properties);
}

function checkout(properties) {
    var rend = properties.renderer
    return exec("git", [ "checkout", "-b", "develop" ], path.join(process.cwd(), properties.src), properties);
}