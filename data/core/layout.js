$(function () {

    var application = require('fireedit/core/application').application;

    var layout = function () {
        setupEditorHeight();
        // TODO we should not need to call this
        require('fireedit/ui/menu_manager').menuManager.addDynamicBehavior();
        setupEditor();
    }

    var setupEditor = function () {
        application.uiInitialized();
    }

    var setupEditorHeight = function(){
      var fullHeight = $(window).innerHeight();
      $('body').css({
        height: fullHeight
      });

      //TODO we need to remove the hard coded height buffer below.
      $('.main-area > div').css("height", fullHeight-95);
    }

    // AN : Hack to make local mode a bit more functional
    if (application.localModeRun()) {
        $('#openFile').click(function(event) {
            var urlVal = prompt("Enter File Name", document.location.toString());
            if (urlVal && urlVal.length > 0) {
                application.openUrlInEditor(urlVal);
            }
        });
    }

    // AN: end of hack


    window.addEventListener("message", function (event) {
        try {
            var hiddenValueCarrier = document.getElementById('ff-int-field');
            if (event.data == "readNew") {
                console.log("got the readNew message");
                application.setCurrentEditorUrl();
                application.setCurrentEditorContent();
            } else if (event.data == "copyOld") {
                console.log("got the copyOld message");
                hiddenValueCarrier.value = application.getCurrentEditor().getSession().doc.getAllLines().join("\n");
                document.defaultView.postMessage("readOld", "*");
            }
        } catch (error) {
            console.log(error);
        }
    }, false);

    /*Listen for the window resize and reset the editor height*/
    window.addEventListener('resize', function(){
      setupEditorHeight();
    })

    layout();
});

