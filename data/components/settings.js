var UIManager = require('fireedit/ui/ui_manager').UIManager;
var commandManager = require("fireedit/core/command_manager").commandManager;
var application = require('fireedit/core/application').application;
var customizer = require('fireedit/ext/customizer').customizer;

var dialogSelector = '#dynamic-display';
var browserOverridesKey = application.preferenceKeys.browserOverrides;
var settingsUrlKey = application.preferenceKeys.settingsUrlKey;

function modifyBrowserOverrides(add) {
    var existingOverride = application.getSettingValue(browserOverridesKey) || false;
    if (add != existingOverride) {
        if (add) {
            commandManager.addBrowserOverrides();
            application.setSettingValue(browserOverridesKey, true);
        } else {
            commandManager.removeBrowserOverrides();
            application.removeSettingValue(browserOverridesKey);
        }
    }
}

function applySettingsFile(mustEval) {
    var settingsFileUrl, existingSettingsFileUrl;

    existingSettingsFileUrl = application.getSettingValue(settingsUrlKey);
    settingsFileUrl = $('#settings-file').attr('value');
    if (settingsFileUrl.length > 0) {
        if ((settingsFileUrl != existingSettingsFileUrl) || mustEval) {
            application.setSettingValue(settingsUrlKey, settingsFileUrl);
            customizer.runSettingsFile(settingsFileUrl);
        }
    } else {
        application.removeSettingValue(settingsUrlKey);
        if (existingSettingsFileUrl && existingSettingsFileUrl.length > 0) {
            alert("Settings file changes would apply only after restart of the editor");
        }
    }
}

document.getElementById('settings-dialog-save').onclick = function() {
    var overrideBrowserKeys;
    overrideBrowserKeys = $('#overrideBrowserKeys').is(":checked");
    modifyBrowserOverrides(overrideBrowserKeys);
    applySettingsFile(false);
    application.storeSettings();
    $(dialogSelector).modal('hide');
};

document.getElementById('settings-dialog-apply').onclick = function() {
    applySettingsFile(true);
    $(dialogSelector).modal('hide');
};

$(dialogSelector).on('shown', function() {
    if (application.getSettingValue(browserOverridesKey)) {
        // not using jquery as checked is better than attr or property
        document.getElementById('overrideBrowserKeys').checked = true;
    }
    if (application.getSettingValue(settingsUrlKey)) {
        // not using jquery as value is better than attr or property
        document.getElementById('settings-file').value = application.getSettingValue(settingsUrlKey);
    }
});