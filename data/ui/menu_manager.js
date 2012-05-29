define("fireedit/ui/menu_manager", 
       ["require", "exports", "module"],
       function(require, exports, module) {
           var MenuManager = function() {
           };
           
           var addSettingsHandler = function() {
               $('#settings').click(function(event) {
                   var UIManager = require('fireedit/ui/ui_manager').UIManager;
                   var elementSelector = '#dynamic-display';
                   UIManager.openModalDialog('./components/settings.html', elementSelector, "Settings", function(){
                       UIManager.evalNewScript('./components/settings.js');
                   });
               });
           };

           var addAboutHandler = function() {
               $('#aboutFireEdit').click(function(event) {
                   var UIManager = require('fireedit/ui/ui_manager').UIManager;
                   var elementSelector = '#dynamic-display';
                   UIManager.openModalDialog('./components/about.html', elementSelector, "About FireEdit");
               });
           };

           var addReportHandler = function() {
               $("#reportProblem").click(function(event) {
                   window.open("https://github.com/sans-sense/fireedit/issues");
               });
           }

           var addMenuHandler = function() {
               // TODO this is really ugly there has to be a better way of handling this styles
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
               });
           };

           (function(){
               this.addDynamicBehavior = function() {
                   addMenuHandler();
                   addReportHandler();
                   addSettingsHandler();
                   addAboutHandler();
                   return false;
               };
           }).call(MenuManager.prototype);
           
           exports.menuManager = new MenuManager();
       });

