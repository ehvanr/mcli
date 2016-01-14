#!/usr/bin/env node

var program = require("commander");
var readlineSync = require("readline-sync");
var SettingsManager = require("./settingsmanager.js");
var settings = SettingsManager.settings;

program
    .option("<application>", "The application you wish to configure")
    .action(function(application){

        application = application.toLowerCase();

        // Do a switch on the application for the appropriate setup sequence
        switch(application){
            case "globals": configureGlobals(); break;
            case "restore": restoreDefaults(); break;
            case "couchpotato": configureGeneric(settings.app_settings.couchpotato); break;
            case "nzbget": configureGeneric(settings.app_settings.nzbget); break;
            case "plex": configureGeneric(settings.app_settings.plex); break;
            case "plexpy": configureGeneric(settings.app_settings.plexpy); break;
            case "plexrequests": configureGeneric(settings.app_settings.plexrequests); break;
            case "sabnzbd": configureGeneric(settings.app_settings.sabnzbd); break;
            case "sonarr": configireGeneric(settings.app_settings.sonarr); break;
            default: printAvailableCommands(); break;
        }
    })
    .parse(process.argv);

function promptChangeObject(object, exclusion){
    var changed = false;

    // Prompt for all but uid and gid, return modified object
    for(item in object){

        if(exclusion == null || exclusion.indexOf(item) === -1){
            var answer = readlineSync.question("\t" + item + " [" + object[item] + "]: ");

            if(answer.trim() !== ""){
                object[item] = answer.trim();
                changed = true;
            }
        }
    }

    if(changed){
        return object;
    }else{
        return false;
    }
}

function promptSaveObject(object, exclusion){
    console.log("\nCurrent Values:");

    for(item in object){
        if(exclusion == null || exclusion.indexOf(item) === -1){
            console.log("\t" + item + ": " + object[item]);
        }
    }

    console.log();

    while(true){
        var answer = readlineSync.question("Save? [Y/n]: ");

        if(answer === 'Y' || answer === 'Yes'){
            SettingsManager.save(settings);
            break;
        }else if(answer === 'n' || answer === "no"){
            break;
        }
    }
}

function printAvailableCommands(){
    // all supported apps and globals
    var supportedApplications = settings.supported_applications;
    
    console.log("Available configuration objects are:");
    console.log("\tglobals");
    console.log("\trestore");

    for(item in supportedApplications){
        console.log("\t" + supportedApplications[item]);
    }
}

function restoreDefaults(){
    console.log("Are you sure you want to restore the default configuration?");
    var answer = readlineSync.question("THIS WILL COMPLETELY WIPE EVERYTHING AWAY [Y/n]: ");

    while(true){
        if(answer === 'Y' || answer === 'Yes'){
            // Wipe everything away
            SettingsManager.restoreConfiguration();
            console.log("Configuration restored");
            break;
        }else if(answer === 'n' || answer === "no"){
            console.log("Aborting");
            break;
        }
    }
}

function configureGlobals(){
    var globalSettings = settings.app_settings.global;
    var changed = false;

    // Prompt user for var changes
    console.log("\nPlease verify or update the following folder locations:");

    var response = promptChangeObject(globalSettings);

    if(response !== false){
        // TODO: Verify response dirs, THEN save if valid - else, prompt again
        promptSaveObject(response);
    }else{
        console.log("\nNothing changed.");
    }
}

function configureGeneric(indv_app_settings){

    var changed = false;

    // Prompt user for var changes
    console.log("\nPlease verify or update the following variables:");

    var response = promptChangeObject(indv_app_settings, ["gid", "uid"]);

    if(response !== false){
        promptSaveObject(response);
    }else{
        console.log("\nNothing changed.");
    }
}
