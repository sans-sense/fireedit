define("fireedit/ui/menu_manager", 
       ["require", "exports", "module"],
       function(require, exports, module) {
           var MenuManager = function() {
           };
           
           (function(){
               this.addClickBehavior = function() {
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
               }
           }).call(MenuManager.prototype);
           
           exports.menuManager = new MenuManager();
       });

