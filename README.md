mcli
=====

This application allows you to manage your media server setup using one command line tool.

This is a work in progress and is not functional yet. Do not run unless you know what you're doing or until this disclaimer disappears. 

Installation
------------

Install globally like any other node module:

```
git clone https://github.com/evreichard/mcli.git
cd mcli
sudo npm install -g
```

Usage
-----

You first want to configure the globals:

```
mcli configure globals
```

After which you can configure each individual application by substituting 'globals' with the application name.  If you don't configure, it will use the defaults.

Then you can install, start, and stop applications:

```
sudo mcli install | start | stop <application>
```

