#!/usr/bin/env node

var program = require("commander");
var SettingsManager = require("./settingsmanager.js");
var settings = SettingsManager.settings;

// Verify dependencies (docker)

if(process.isPackaged){
        process.argv.unshift(null);
} 

program
    .command("install   <application>", "Install an application")
    .command("configure <application>", "Configure an application")
    .command("update    <application>", "Update an application")
    .command("uninstall <application>", "Uninstall an application")
    .command("start     <application>", "Start an application")
    .command("stop      <application>", "Stop an application")
    .command("restart   <application>", "Restart an application")
    .command("backup    <application>", "Backup an application")
    .command("restore   <application>", "Restore an application from a backup")
    .command("print", "Print configuration")
    .parse(process.argv);
