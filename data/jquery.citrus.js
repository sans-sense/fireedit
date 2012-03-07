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

                if (options.controller) {

                    this.data('controller', options.controller);

                    var controller = $(options.controller);

                    if (controller.children(".expand-control").length == 0) {
                        $('<span class="icon-resize-full icon-white expand-control" title="expand all"></span>').appendTo(controller);
                    }

                    controller.children(".expand-control").click(function (event) {
                        treeRoot.citrus("expandAll");
                        event.stopPropagation();
                    });

                    if (controller.children(".collapse-control").length == 0) {
                        $('<span class="icon-resize-small icon-white collapse-control" title="collapse all"></span>').appendTo(controller);
                    }

                    controller.children(".collapse-control").click(function (event) {
                        treeRoot.citrus("collapseAll");
                        event.stopPropagation();
                    });
                }

                return this;
            },
            addToControls:function (html, actionFunction) {
                if (this.data('controller').length > 0) {
                    var controller = this.data('controller');
                    var tree = this;
                    $(html).appendTo(controller).click(function(event){
                        actionFunction.call(tree,event);
                    });
                }
            },
            expandAll:function () {
                var collapsed = this.find('li.collapsed');
                collapsed.each(function () {
                    var node = $(this);
                    node.children('ul').show();
                    node.removeClass('collapsed');
                    node.addClass('expanded');
                });
                return this;
            },
            collapseAll:function () {
                var expanded = this.find('li.expanded');
                expanded.each(function () {
                    var node = $(this);
                    node.children('ul').hide();
                    node.removeClass('expanded');
                    node.addClass('collapsed');
                });
                return this;
            },
            expandLevel:function (level) {
                //TODO: Implement exand to level
                return this;

            },
            highlightNode:function (dataType, value) {
                var query = 'li[data-' + dataType + '="' + value + '"]';
                var nodeToHighlight = this.find(query);
                var collapsed = nodeToHighlight.parentsUntil(this, 'li.collapsed');
                collapsed.each(function () {
                    var node = $(this);
                    node.children('ul').show();
                    node.removeClass('collapsed');
                    node.addClass('expanded');
                });
                nodeToHighlight.effect("highlight", {}, 'slow');
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