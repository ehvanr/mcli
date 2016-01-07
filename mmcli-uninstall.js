#!/usr/bin/env node

var program = require("commander");
var SettingsManager = require("./settingsmanager.js");
var settings = SettingsManager.settings;

program
    .arguments("<application>", "The application you wish to uninstall")
    .action(function(application){
        application = application.toLowerCase();
        // Checks whether the application we're referencing is supported
        if(settings.supported_applications.indexOf(application) > -1){
            switch(application){
                case "plexrequests": uninstallPlexRequests(); break;
                case "couchpotato": uninstallCouchPotato(); break;
                case "sabnzbd": uninstallSABnzbd(); break;
                case "nzbget": uninstallNZBGet(); break;
                case "plexpy": uninstallPlexPy(); break;
                case "sonarr": uninstallSonarr(); break;
                case "plex": uninstallPlex(); break;
            }
        }
    })
    .parse(process.argv);

function uninstallCouchPotato(){
    // COMMANDS:
    //  - delete stored container id
    //  - delete couchpotato user -> Store UID in config
    //  - delete couchpotato group -> Store GID in config
    //  - delete /opt/mmcli/app-data/couchpotato/
    
    removeInstalledApplication("couchpotato");
}

function uninstallSABnzbd(){
    // COMMANDS:
    //  - delete stored container id
    //  - delete sabnzbd user -> Store UID in config
    //  - delete sabnzbd group -> Store GID in config
    //  - delete /opt/mmcli/app-data/sabnzbd/
    
    removeInstalledApplication("sabnzbdplus");
}

function uninstallNZBGet(){
    // COMMANDS:
    //  - delete stored container id
    //  - delete nzbget user -> Store UID in config
    //  - delete nzbget group -> Store GID in config
    //  - delete /opt/mmcli/app-data/nzbget/
    
    removeInstalledApplication("nzbget");
}

function uninstallPlexPy(){
    // COMMANDS:
    //  - delete stored container id
    //  - delete plexpy user -> Store UID in config
    //  - delete plexpy group -> Store GID in config
    //  - delete /opt/mmcli/app-data/plexpy/
    
    removeInstalledApplication("plexpy");
}

function uninstallPlexRequests(){
    //
    // NOTE: THIS DOES NOT HAVE GID / UID
    //
    // COMMANDS:
    //  - delete stored container id
    //  - delete plexrequests user -> Store UID in config
    //  - delete plexrequests group -> Store GID in config
    //  - delete /opt/mmcli/app-data/plexrequests/
    
    removeInstalledApplication("plexrequests");
}

function uninstallPlex(){
    // COMMANDS:
    //  - delete stored container id
    //  - delete plex user -> Store UID in config
    //  - delete plex  group -> Store GID in config
    //  - delete /opt/mmcli/app-data/plex/
    
    removeInstalledApplication("plex");
}

function uninstallSonarr(){
    // COMMANDS:
    //  - delete stored container id
    //  - delete sonarr user -> Store UID in config
    //  - delete sonarr group -> Store GID in config
    //  - delete /opt/mmcli/app-data/sonarr/
    
    removeInstalledApplication("sonarr");
}

function uninstallGlances(){
    // BACK BURNER
    removeInstalledApplication("glances");
}

function removeInstalledApplication(application){
    var index = settings.installed_applications.indexOf(application);

    if(index > -1){
        settings.installed_applications.splice(index, 1);
        SettingsManager.save(settings);
    }
}
