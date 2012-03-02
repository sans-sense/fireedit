var UIManager = require('fireedit/ui/ui_manager').UIManager;

document.getElementById('settings-dialog-close').onclick = function() {
    UIManager.getElement('#dynamic-display').dialog('close');
    return false;
};
