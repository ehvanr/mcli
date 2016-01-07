#!/usr/bin/env node

var program = require("commander");
var SettingsManager = require("./settingsmanager.js");
var settings = SettingsManager.settings;

program
    .option("<application>", "The application you wish to install")
    .option("-d, --defaults", "Install the application and don't configure.")
    .action(function(application){
        application = application.toLowerCase();
        // Checks whether the application we're referencing is supported
        if(settings.supported_applications.indexOf(application) > -1){
            // Do a switch on the application for the appropriate install sequence
            switch(application){
                case "plexrequests": installPlexRequests(); break;
                case "couchpotato": installCouchPotato(); break;
                case "sabnzbd": installSABnzbd(); break;
                case "nzbget": installNZBGet(); break;
                case "plexpy": installPlexPy(); break;
                case "sonarr": installSonarr(); break;
                case "plex": installPlex(); break;
            }
        }
    })
    .parse(process.argv);


function installCouchPotato(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create couchpotato user -> Store UID in config
    //  - create couchpotato group -> Store GID in config
    //  - create /opt/mmcli/app-data/couchpotato/
    //  - docker pull linuxserver/couchpotato -> Store container id
    //
    // VARS:
    //  MOVIE_FOLDER
    //  MOVIE_DOWNLOADS
    //  COUCHPOTATO_APP_DATA
    //  COUCHPOTATO_UID
    //  COUCHPOTATO_GID
    //  COUCHPOTATO_HTTP_PORT
    //
    // docker create \
    //     --name=couchpotato \
    //     -v /etc/localtime:/etc/localtime:ro \
    //     -v <path to data>:/config \
    //     -v <path to data>:/downloads \
    //     -v <path to data>:/movies \
    //     -e PGID=<gid> -e PUID=<uid>  \
    //     -p 5050:5050 \
    //     linuxserver/couchpotato 
    //
    addInstalledApplication("couchpotato");
}

function installSABnzbd(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create sabnzbd user -> Store UID in config
    //  - create sabnzbd group -> Store GID in config
    //  - create /opt/mmcli/app-data/sabnzbd/
    //  - docker pull linuxserver/sabnzbd -> Store container id
    //
    // VARS:
    //  ALL_DOWNLOADS
    //  INCOMPLETE_DOWNLOADS = ALL_DOWNLOADS/incomplete
    //  SABNZBD_APP_DATA
    //  SABNZBD_UID
    //  SABNZBD_GID
    //  SABNZBD_HTTP_PORT
    //  SABNZBD_HTTPS_PORT
    //
    // docker create \
    //      --name=sabnzbd \
    //      -v /etc/localtime:/etc/localtime:ro \
    //      -v <path to data>:/config \
    //      -v <path to downloads>:/downloads \
    //      -v <path to incomplete downloads>:/incomplete-downloads \
    //      -e PGID=<gid> -e PUID=<uid> \
    //      -p 8080:8080 \
    //      -p 9090:9090 \
    //      linuxserver/sabnzbd
    //
    addInstalledApplication("sabnzbdplus");
}

function installNZBGet(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create nzbget user -> Store UID in config
    //  - create nzbget group -> Store GID in config
    //  - create /opt/mmcli/app-data/nzbget/
    //  - docker pull linuxserver/nzbget -> Store container id
    //
    // VARS:
    //  ALL_DOWNLOADS
    //  NZBGET_APP_DATA
    //  NZBGET_UID
    //  NZBGET_GID
    //  NZBGET_HTTP_PORT
    //
    // docker create \
    //      --name nzbget \
    //      -p 6789:6789 \
    //      -e PUID=<UID> -e PGID=<GID> \
    //      -v </path/to/appdata>:/config \
    //      -v <path/to/downloads>:/downloads \
    //      linuxserver/nzbget

    addInstalledApplication("nzbget");
}

function installPlexPy(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create plexpy user -> Store UID in config
    //  - create plexpy  group -> Store GID in config
    //  - create /opt/mmcli/app-data/plexpy/
    //  - docker pull linuxserver/plexpy -> Store container id
    //
    // VARS:
    //  PLEXPY_LOGS
    //  PLEXPY_APP_DATA
    //  PLEXPY_UID
    //  PLEXPY_GID
    //  PLEXPY_HTTP_PORT
    //
    // docker create \ 
    //      --name=plexpy \
    //      -v /etc/localtime:/etc/localtime:ro \
    //      -v <path to data>:/config \
    //      -v <path to plexlogs>:/logs:ro \
    //      -e PGID=<gid> -e PUID=<uid>  \
    //      -p 8181:8181 \
    //      linuxserver/plexpy

    addInstalledApplication("plexpy");
}

function installPlexRequests(){
    //
    // NOTE: THIS DOES NOT HAVE GID / UID
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create plexrequests user -> Store UID in config
    //  - create plexrequests  group -> Store GID in config
    //  - create /opt/mmcli/app-data/plexrequests/
    //  - docker pull linuxserver/plexpy -> Store container id
    //
    // VARS:
    //  PLEXREQUESTS_APP_DATA
    //  PLEXREQUESTS_HTTP_PORT
    //
    // docker create \
    //      --name=plexrequests \
    //      -v /etc/localtime:/etc/localtime:ro \
    //      -v <path to data>:/config \
    //      -e BRANCH="master" \
    //      -p 3000:3000 \
    //      aptalca/docker-plexrequests
    //

    addInstalledApplication("plexrequests");
}

function installSonarr(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create sonarr user -> Store UID in config
    //  - create sonarr group -> Store GID in config
    //  - create /opt/mmcli/app-data/sonarr/
    //  - docker pull linuxserver/sonarr -> Store container id
    //
    // VARS:
    //  TV_FOLDER
    //  TV_DOWNLOADS
    //  SONARR_APP_DATA
    //  SONARR_UID
    //  SONARR_GID
    //  SONARR_HTTP_PORT
    //
    // docker create \
    //     --name sonarr \
    //     -p 8989:8989 \
    //     -e PUID=<UID> -e PGID=<GID> \
    //     -v /dev/rtc:/dev/rtc:ro \
    //     -v </path/to/appdata>:/config \
    //     -v <path/to/tvseries>:/tv \
    //     -v <path/to/downloadclient-downloads>:/downloads \
    //     linuxserver/sonarr

    addInstalledApplication("sonarr");
}

function installPlex(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create plex user -> Store UID in config
    //  - create plex  group -> Store GID in config
    //  - create /opt/mmcli/app-data/plex/
    //  - docker pull linuxserver/plex -> Store container id
    //
    // VARS:
    //  TV_FOLDER
    //  MOVIE_FOLDER
    //  TRANSCODE_FOLDER
    //  PLEX_APP_DATA
    //  PLEX_UID
    //  PLEX_GID
    //  PLEX_CHANNEL (plexpass or latest)
    //
    // docker create \
    //      --name=plex \ 
    //      --net=host \
    //      -e VERSION="plexpass" \
    //      -e PUID=<UID> -e PGID=<GID> \
    //      -v </path/to/transcode>:/transcode \
    //      -v </path/to/library>:/config \
    //      -v <path/to/tvseries>:/data/tvshows \
    //      -v </path/to/movies>:/data/movies \
    //      linuxserver/plex
    //

    addInstalledApplication("plex");
}

function installGlances(){
    // BACK BURNER
    addInstalledApplication("glances");
}

function addInstalledApplication(application){
    settings.installed_applications.push(application);
    SettingsManager.save(settings);
}
