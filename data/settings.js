var UIManager = require('fireedit/ui/ui_manager').UIManager;
var commandManager = require("fireedit/core/command_manager").commandManager;
var application = require('fireedit/core/application').application;

var dialogSelector = '#dynamic-display';
var settingKey = "added-browser-overrides";
var settingsUrlKey = 'settings-url';

function modifyBrowserOverrides(add) {
    var existingOverride = application.getSettingValue(settingKey) || false;
    if (add != existingOverride) {
        if (add) {
            commandManager.addBrowserOverrides();
            application.setSettingValue(settingKey, true);
        } else {
            commandManager.removeBrowserOverrides();
            application.removeSettingValue(settingKey);
        }
    }
}

document.getElementById('settings-dialog-save').onclick = function() {
    var settingsFileUrl, overrideBrowserKeys, existingSettringsFileUrl;
    overrideBrowserKeys = $('#overrideBrowserKeys').is(":checked");
    modifyBrowserOverrides(overrideBrowserKeys);
    settingsFileUrl = $('#settings-file');
    $(dialogSelector).modal('hide');
    existingSettingsFileUrl = application.getSettingValue(settingsUrlKey);
    settingsFileUrl = $('#settings-file').attr('value');
    if (settingsFileUrl.length > 0) {
        if (settingsFileUrl != existingSettingsFileUrl) {
            application.setSettingValue(settingsUrlKey, settingsFileUrl);
            UIManager.evalNewScript(settingsFileUrl);
        }
    } else {
        application.removeSettingValue(settingsUrlKey);
        if (existingSettingsFileUrl && existingSettingsFileUrl.length > 0) {
            alert("Settings file changes would apply only after restart of the editor");
        }
    }
};

$(dialogSelector).on('shown', function() {
    if (application.getSettingValue(settingKey)) {
        // not using jquery as checked is better than attr or property
        document.getElementById('overrideBrowserKeys').checked = true;
    }
    if (application.getSettingValue(settingsUrlKey)) {
        // not using jquery as checked is better than attr or property
        document.getElementById('settings-file').value = application.getSettingValue(settingKey);
    }
});