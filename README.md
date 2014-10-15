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

    cgkineo create course {path}
    
    cgkineo create course  
    
    -or-  

    cgkineo create course "dev"  

type - What to create. course  
path - The directory of the new course.
branch - Optional - The branch of the framework to be downloaded.

For example...


This will download the Adapt framework and create an new course in the directory "dev", in your current directory.


Troubleshooting
---------------

##### Sublime Text vs NPM
  
Occasionally npm will throw errors about not being able to access certain directories. It is therefore recommended to close the text editor before running this create course instruction.  

##### No components installed as default - No npm install or cgkineo install was ran
  
Occasionally only the framework is installed and no node_modules, src/extensions, src/menu or src/components folder is created. If this is the case, please:  
  
cgkineo create course "dev"  
cd dev/  
npm install  
cgkineo install  
  
This issue is due to be fixed.

##### Others

Please see issues section or come talk to Ollie @ oliver.foster@kineo.com  


Usage Continued
---------------

##### Searching for an Adapt plugin.

    cgkineo search {name or partial name of plugin to search for}


##### Installing a plugin into your current directory

    cgkineo install {name of plugin}

Additionally you can install a specific version of a plugin.

    cgkineo install {name of plugin}#{version}
  
The default version is {name of plugin}#master  
  
Anywhere that you are required to provide a name of a plugin it can be either fully qualified with 'adapt-' or optionally you can omit the prefix an just use the plugin name.

Therefore these commands are equivalent:

    cgkineo install adapt-my-plugin
    cgkineo install my-plugin

Installed plugins are saved to `adapt.json`. 

##### Installing plugins previously saved in adapt.json

    cgkineo install


##### Uninstalling a plugin from your current directory

    cgkineo uninstall {name of plugin}


##### Creating a plugin

    cgkineo create {type} 
    
type - What to create. component/extension/menu/theme

For example...

    cgkineo create component

This will download the component template into your src/components/ folder.



The Plugin Registry
-------------------

The plugin system is powered by [Bower](http://bower.io/). Each plugin should be a valid bower package and they should be registered in the registry.json file contained in the adapt_framework root folder.

registry.json

```
[
  {
    "name": "plugin-name",
    "url": "https://url"
  }
]
```

See [Developing plugins](https://github.com/adaptlearning/adapt_framework/wiki/Developing-plugins) for more information on defining your plugins package.  
See [Component Template](https://github.com/cgkineo/adapt-template-component)  
See [Extension Template](https://github.com/cgkineo/adapt-template-extension)  

Note: 2014-10-08 Ollie - menu and theme templates need to be created and integrated  
