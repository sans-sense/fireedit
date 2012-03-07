var UIManager = require('fireedit/ui/ui_manager').UIManager;
var commandManager = require("fireedit/core/command_manager").commandManager;
var dialogSelector = '#dynamic-display';
var settingKey = "addedBrowserOverrides";
var application = require('fireedit/core/application').application;

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
    var settingsFileUrl, overrideBrowserKeys;
    overrideBrowserKeys = $('#overrideBrowserKeys').is(":checked");
    modifyBrowserOverrides(overrideBrowserKeys);
    settingsFileUrl = $('#settings-file');
    $(dialogSelector).modal('hide');
};

$(dialogSelector).on('shown', function() {
    if (application.getSettingValue(settingKey)) {
        document.getElementById('overrideBrowserKeys').checked = true;
    }
});