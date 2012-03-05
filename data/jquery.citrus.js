define('jquery.citrus', ['jquery'],
    (function ($) {

        var methods = {
            init:function (options) {

                var treeRoot = this;
                /*
                 * Hide all the child tree elements
                 */
                var parentLi = treeRoot.find('li').has('ul');
                parentLi.children("ul").hide();
                parentLi.addClass('collapsed');

                /*
                 * Add a span for expander
                 */
                parentLi.prepend('<span class="expander"></span>');


                /*
                 * Add expand child tree listener
                 */
                parentLi.children('span.expander').click(function (event) {
                    $(this).parent("li").children('ul').toggle();
                    $(this).parent("li").toggleClass('collapsed expanded');
                    event.stopPropagation();
                });

                if(options.controller){

                    var controller = options.controller;
                    controller.children(".expand-control").click(function(event){
                        treeRoot.citrus("expandAll");
                        event.stopPropagation();
                    });

                    controller.children(".collapse-control").click(function(event){
                        treeRoot.citrus("collapseAll");
                        event.stopPropagation();
                    });
                }

                return this;
            },
            expandAll:function () {
                var collapsed = this.find('li.collapsed');
                collapsed.each(function () {
                    $(this).children('ul').show();
                    $(this).toggleClass('collapsed expanded');
                });
                return this;
            },
            collapseAll:function () {
                var expanded = this.find('li.expanded');
                expanded.each(function () {
                    $(this).children('ul').hide();
                    $(this).toggleClass('collapsed expanded');
                });
                return this;
            },
            expandLevel:function (level) {
                //TODO: Implement exand to level
                return this;

            }
        };

        $.fn.citrus = function (method) {
            if (methods[method]) {
                return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.tooltip');
            }
        };
    })(jQuery)
);