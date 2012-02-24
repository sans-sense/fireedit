var UIManager = require('fireedit/ui/ui_manager').UIManager;

UIManager.getFirstElement('#settings-dialog-close').onclick = function(event) {
    UIManager.getElement('#dynamic-display').dialog('close');
    return false;
}
