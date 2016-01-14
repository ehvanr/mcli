#!/usr/bin/env node

var program = require("commander");
var SettingsManager = require("./settingsmanager.js");
var settings = SettingsManager.settings;

// Arg shift if we're in a self containing package
if(process.isPackaged){
        process.argv.unshift(null);
} 

program
    .command("configure <application>", "Configuration wizard.")
    .command("install   <application>", "Install an application")
    .command("update    <application>", "Update an application")
    .command("uninstall <application>", "Uninstall an application")
    .command("disable   <application>", "Disable an application")
    .command("start     <application>", "Start an application")
    .command("stop      <application>", "Stop an application")
    .command("restart   <application>", "Restart an application")
    .command("backup    <application>", "Backup an application")
    .command("restore   <application>", "Restore an application from a backup")
    .command("print", "Print configuration")
    .parse(process.argv);

    /*
function verifyConfiguration(){
GENERIC VERIFY (VERIFY ALL PATHS)
    app_settings.global.all_downloads
    app_settings.global.incomplete_downloads
    app_settings.global.movie_downloads
    app_settings.global.tv_downloads
    app_settings.global.movie_library
    app_settings.global.tv_library

ALL APP 
    app_settings.*.app_data - VERIFY PATH
    app_settings.*.uid - VERIFY EXISTANCE
    app_settings.*.gid - VERIFY EXISTANCE
    app_settings.*.http_port - VERIFY NUMBER
    app_settings.*.https_port - VERIFY NUMBER

SPECIFIC APP
    app_settings.plexpy.logs - VERIFY PATH
    app_settings.sabnzbd.transcode_folder - VERIFY PATH
    app_settings.plex.channel - VERIFY EITHER "plexpass" or "latest"

    var globalSettings = settings.app_settings.global;

    try{
        if( globalSettings.all_downloads == "" || 
            globalSettings.incomplete_downloads == "" ||
            globalSettings.movie_downloads == "" ||
            globalSettings.movie_downloads == "" ||
            globalSettings.tv_downloads == "" ||
            globaleSettings.movie_library == "" || 
            globaleSettings.tv_library == ""){
                
                console.log("Please completely fill out global settings.\nDid you run the setup wizard?");
                process.exit(1);
        }else{
            // So far so good, verify values
        }
    }catch(e){
        console.log("Configuration file malformed.");
        process.exit(1);
    }

}
    */
