$(function () {

    var layout = function () {
        var fullHeight = $(document).height();
        $('body').css({
            height:fullHeight
        });

        $('.main-area > div').css("height", "-=60")

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
    }

    var setupEditor = function () {
        window.editor = ace.edit("editor-file001");
        editor.setTheme("ace/theme/twilight");

        var JavaScriptMode = require("fireedit/mode/enh_javascript").Mode;
        var jsMode = new JavaScriptMode();
        editor.getSession().setMode(jsMode);

        // TODO we need a way to listen on change and rebuild my AST
        jsMode.enhanceWorker(editor.getSession());

        var OutlineView = require("fireedit/view/outline_view").View;
        var outlineView = new OutlineView(jsMode, document.getElementById("sidebar-outline"));

        jsMode.emitAST(editor.getSession().getDocument().getValue());
    }

    window.addEventListener("message", function (event) {
        try {
            var hiddenValueCarrier = document.getElementById('ff-int-field');
            if (event.data == "readNew") {
                console.log("got the readNew message");
                editor.getSession().setValue(hiddenValueCarrier.value);
            } else if (event.data == "copyOld") {
                console.log("got the copyOld message");
                hiddenValueCarrier.value = editor.getSession().doc.getAllLines().join("\n");
                document.defaultView.postMessage("readOld", "*");
            }
        } catch (error) {
            console.log(error);
        }
    }, false);

    layout();
});

