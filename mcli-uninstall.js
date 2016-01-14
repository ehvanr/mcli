#!/usr/bin/env node

var program = require("commander");
var async = require("async");
var exec = require("child_process").exec;
var SettingsManager = require("./settingsmanager.js");
var settings = SettingsManager.settings;

program
    .arguments("<application>", "The application you wish to uninstall")
    .action(function(application){
        application = application.toLowerCase();

        // Verifies that the application we're referencing is supported
        if(settings.supported_applications.indexOf(application) > -1){
            // Checks whether the application we're referencing is installed
            if(settings.installed_applications.indexOf(application)> -1){
                uninstallGeneric(application);
            }else{
                console.log("Application not installed");
            }
        }
    })
    .parse(process.argv);

function uninstallGeneric(application){
    console.log("Uninstalling " + application + "...");
    var docker_remove = 'docker rm -f mcli_' + application;

    async.series([
        async.apply(exec, docker_remove),
    ], 
    function(err, results){
        if(err){
            console.log(err);
            process.exit(1);
        }else{
            var defaultAppConfig = SettingsManager.getDefaultAppConfiguration(application);
            settings.app_settings[application] = defaultAppConfig;
            SettingsManager.save(settings);
            removeInstalledApplication(application);

            console.log("Successfully uninstalled " + application);
        }
    });
}

function removeInstalledApplication(application){
    var index = settings.installed_applications.indexOf(application);

    if(index > -1){
        settings.installed_applications.splice(index, 1);
        SettingsManager.save(settings);
    }
}
