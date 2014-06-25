Adapt Command Line Interface
============================

[![Build Status](https://travis-ci.org/adaptlearning/adapt-cli.png?branch=master)](https://travis-ci.org/adaptlearning/adapt-cli)

Installation
------------

To install the CGKineo CLI, first be sure to install [NodeJS](http://nodejs.org) and [git](http://git-scm.com/downloads), then from the command line run:-


        npm install -g cgkineo-cli


Usage
-----

##### Creating an Adapt course

    cgkineo create {type} {path} [{branch}]

type - What to create. Only the value "course" is currently supported. 
path - The directory of the new course.
branch - Optional - The branch of the framework to be downlaoded.

For example...

    cgkineo create course "My Course"

This will download the Adapt framework and create an new course in the directory "My Course", in your current directory.

##### Searching for an Adapt plugin.

    cgkineo search {name or partial name of plugin to search for}


##### Installing a plugin into your current directory

    cgkineo install {name of plugin}

Additionally you can install a specific version of a plugin.

    cgkineo install {name of plugin}#{version}

Anywhere that you are required to provide a name of a plugin it can be either fully qualified with 'adapt-' or optionally you can omit the prefix an just use the plugin name.

Therefore these commands are equivalent:

    cgkineo install adapt-my-plugin
    cgkineo install my-plugin

Installed plugins are saved to `adapt.json`. 

##### Installing plugins previously saved in adapt.json

    cgkineo install


##### Uninstalling a plugin from your current directory

    cgkineo uninstall {name of plugin}


The Plugin Registry (oliverfoster - To Be Continued.... for cgkineo)
-------------------

The plugin system is powered by [Bower](http://bower.io/). Each plugin should be a valid bower package and they should be registered with the Adapt registry.

    http://adapt-bower-repository.herokuapp.com/packages/

See [Developing plugins](https://github.com/adaptlearning/adapt_framework/wiki/Developing-plugins) for more information on defining your plugins package.

##### Registering a plugin

From within a plugin directory

    adapt register

`name` and `repository` will be read from `bower.json` in the current directory.

The package will be registered with the registry on a first come first serve basis.

Release History
===============

- 0.0.14 - fixed Issue #15
- 0.0.13 - Added support for versions of plugins (#14) and --version command
- 0.0.12 - fixed Issue #13
- 0.0.11 - fixed Issue #12
- 0.0.10 - fixed Issue #2 & #8
- 0.0.9  - fixed Issue #7
- 0.0.8  - Added 'create' command, fixed Issue #6
- 0.0.7  - fixed Issue #3
- 0.0.6  - Added 'register' command
- 0.0.5  - Added adapt.json (dependency list)
- 0.0.3  - Added uninstall command
...
