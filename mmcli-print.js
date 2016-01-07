#!/usr/bin/env node

var SettingsManager = require("./settingsmanager.js");
var settings = SettingsManager.settings;

// Format Pretty
console.log(settings);
