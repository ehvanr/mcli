#!/usr/bin/env node

var program = require("commander");
var async = require("async");
var exec = require("child_process").exec;
var SettingsManager = require("./settingsmanager.js");
var settings = SettingsManager.settings;

program
    .option("<application>", "The application you wish to start")
    .action(function(application){

        // Verify that we're root.  Quit if we're not. Technically user only has to be a part of the docker group. 
        if(process.getuid() != 0){
            console.log("You need to be root to perform this command.");
            process.exit(1);
        }

        application = application.toLowerCase();

        // Checks whether the application we're referencing is supported
        if(settings.supported_applications.indexOf(application) > -1){
            // Checks whether the application we're referencing is installed
            if(settings.installed_applications.indexOf(application)> -1){
                stopGeneric(application)
            }else{
                console.log("Application not installed");
            }
        }else{
            console.log("No such application");
        }
    })
    .parse(process.argv);

// DOCKER START CONTAINERID
function stopGeneric(application){
    var docker_start = 'docker stop mcli_' + application;

    async.series([
        async.apply(exec, docker_start),
    ], 
    function(err, results){
        if(err){
            console.log(err);
            process.exit(1);
        }else{
            console.log("Successfully stopped " + application);
        }
    });
}
