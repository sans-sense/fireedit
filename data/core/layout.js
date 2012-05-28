$(function () {

    var application = require('fireedit/core/application').application;

    var history = null;
    var initHistory = function(){
        if(application.localModeRun()){
            history = require('fireedit/history/file_open_history');
            history.bind(function(path){
                if(!path.length){
                    document.defaultView.location.reload()
                }else{
                    loadURL(path);
                }
            });
        }
    };

    var layout = function () {
        setupEditorHeight();
        //$('.main-area').css(hei)

        $('#nav-collapser').click(function () {
            $('#nav-collapser > i').toggleClass("icon-eye-close icon-eye-open");
            if ($('#main-nav').hasClass("fullwide")) {
                $('.nav-collapse').hide('slide', 500);
                $('#main-nav .navbar-inner').animate({
                    width:'20%'
                }, 500, function () {
                    $('#main-nav').toggleClass('fullwide');
                    $('#edit-area').toggleClass('edit-area-top');
                    //TODO: Resize the Editor
                });
            } else {
                $('#edit-area').toggleClass('edit-area-top');
                $('.nav-collapse').show('slide', 500);
                $('#main-nav .navbar-inner').animate({
                    width:'100%'
                }, 500, function () {
                    $('#main-nav').toggleClass('fullwide');
                    //TODO: Resize the Editor
                });
            }
            return false;
        });

        setupEditor();
        initHistory();
    }

    var setupEditor = function () {
        var editor = ace.edit("editor-file001");
        editor.setTheme("ace/theme/twilight");
        application.setCurrentEditor(editor);

        var JavaScriptMode = require("fireedit/mode/enh_javascript").Mode;
        var jsMode = new JavaScriptMode();
        editor.getSession().setMode(jsMode);

        // TODO we need a way to listen on change and rebuild my AST
        jsMode.enhanceWorker(editor.getSession());

        var OutlineView = require("fireedit/view/outline_view").View;
        var outlineView = new OutlineView(jsMode, document.getElementById("sidebar-outline"));

        jsMode.emitAST(editor.getSession().getDocument().getValue());
        editor.focus();

        require("fireedit/shell-commands").commands.register();
        var commandLineView = require("fireedit/command-line-view").view;
        var commandLineController = require("fireedit/command-line-controller").controller;
        commandLineView.bindTo($('#command-line'));
        commandLineController.bindTo(commandLineView);
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
    var localModeRun = function() {
        return document.location.toString().match(/^file:/);
    }

    if (application.localModeRun()) {
        $('#openFile').click(function(event) {
            var urlVal = prompt("Enter File Name", document.location.toString());
            if (urlVal && urlVal.length > 0) {
                history.pushFileToHistory(urlVal)
                loadURL(urlVal);
            }
        });
    }

    var loadURL = function(urlVal){
        require('fireedit/ui/ui_manager').UIManager.openUrl(urlVal,  function(responseText) {
            application.setCurrentEditorUrl(urlVal);
            application.setCurrentEditorContent(responseText);
        });
    }
    // AN: end of hack

    $('#settings').click(function(event) {
        var UIManager = require('fireedit/ui/ui_manager').UIManager;
        var elementSelector = '#dynamic-display';
        UIManager.openModalDialog('./components/settings.html', elementSelector, "Settings", function(){
            UIManager.evalNewScript('./components/settings.js');
        });
    });

    $('#aboutFireEdit').click(function(event) {
        var UIManager = require('fireedit/ui/ui_manager').UIManager;
        var elementSelector = '#dynamic-display';
        UIManager.openModalDialog('./components/about.html', elementSelector, "About FireEdit");
    });

    $("#reportProblem").click(function(event) {
        window.open("https://github.com/sans-sense/fireedit/issues");
    });

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

