(function ($, undefined) {
    $.widget("ui.citrus", {
        options: {
            nodes: [],
            controllerId: '__random_controller_id__',
            listId: '__random_list_id__',
            showTreeController: true
        },
        _EVENTS: {
            ON_BEFORE_EXPAND: '_before_expand',
            ON_EXPAND: '_expand',
            ON_NODE_CLICK: '_node_click'
        },
        _create: function () {
            this.element.addClass('ui-widget');
            this._initController();
            this._initTree();
        },
        _initController: function(){
            if(!this.options.showTreeController){
                this.element.find('.citrus-control').remove();
                return;
            }
            var controller = $('<div>').addClass("citrus-control ui-widget-header").attr('id', this.options.controllerId);
            this.element.append(controller);
            this.controller = controller;

            var citrus = this;
            $('<span>')
                .addClass('icon-resize-full icon-white expand-control')
                .attr('title', 'Expand All')
                .click(function (event) {
                    citrus.expandAll();
                    return false;
                })
                .appendTo(controller);

            $('<span>')
                .addClass('icon-resize-small icon-white collapse-control')
                .attr('title', 'Collapse All')
                .click(function (event) {
                    citrus.collapseAll();
                    return false;
                })
                .appendTo(controller);
        },
        _initTree: function () {
            var options = this.options;
            if(options.data){
                this._buildTree();
            }
            return this;
        },
        addToControls:function (node, actionFunction) {
            if (this.controller) {
                var controller = this.controller;
                var tree = this;
                $(node).appendTo(controller).click(function (event) {
                    actionFunction.call(tree, event);
                    return false;
                });
            }
        },
        expandAll:function () {
            $(this.element).find('.folder').removeClass('collapsed').addClass('expanded');
        },
        collapseAll:function () {
            $(this.element).find('.folder').addClass('collapsed').removeClass('expanded');
        },
        expandLevel:function (level) {
            $(this.element).find('.folder:eq('+level+')').removeClass('collapsed').addClass('expanded');
        },
        collapseLevel:function (level) {
            $(this.element).find('.folder:eq('+level+')').addClass('collapsed').removeClass('expanded');
        },
        highlightNodeForData:function (dataType, value) {
            var query = 'li[data-' + dataType + '="' + value + '"]';
            this.citrus("highlightNode", query);
        },
        highlightNode:function (query) {
            $('.highlight').removeClass("highlight");
            var element = this.element;
            var nodeToHighlight = element.find(query);
            var collapsed = nodeToHighlight.parentsUntil(element, 'li.collapsed');
            collapsed.each(function () {
                var node = $(this);
                node.children('ul').show();
                node.removeClass('collapsed');
                node.addClass('expanded');
            });
            nodeToHighlight.closest("li").addClass("  highlight");
            return this;
        },
        refresh: function(data){
            this.options.data = data;
            this._buildTree();
        },
        _buildTree: function(){
            if(this.list){
                this.list.html('');
            }else{
                list = $('<ul>').addClass('citrus ui-widget-content').attr('id', 'outline-tree');
            }
            for (var i = 0; i < sortedFunctions.length; i++) {
                list.append(this._nodeToUI(sortedFunctions[i]));
            }

            this.list = list;
            this.element.append(list)
        },
        _nodeToUI: function (decoratedNode) {
            var fun = decoratedNode.originalFunction;
            var nodeChildren = decoratedNode.getChildren();
            var base = this;

            var li = $("<li>");
            var nodeText = $("<span>").text(fun.name).addClass('nodeText').click(function(event){
                base._trigger(base._EVENTS.ON_NODE_CLICK, event, {
                    target: li
                });
                $(this).fadeTo('fast', 0.8).fadeTo('slow', 1.0);
            });

            if (nodeChildren.length > 0) {
                li.addClass('collapsed folder');
                var wrapper = $("<span>").addClass('node-title-wrapper ui-state-active');

                var expander = $('<span>').addClass('expander');
                wrapper.append(expander, nodeText);
                li.append(wrapper);

                expander.click(function (event) {
                    var passThrough = base._trigger(base._EVENTS.ON_BEFORE_EXPAND, event, {
                        target: li
                    });
                    if(passThrough == false){
                        return;
                    }

                    $(this).closest("li.folder").toggleClass('collapsed expanded');

                    base._trigger(base._EVENTS.ON_EXPAND, event, {
                        target: li
                    });

                    event.stopPropagation();
                });

                var childUL = $("<ul>");
                li.append(childUL);

                for (var i = 0; i < nodeChildren.length; i++) {
                    var deepNode = this._nodeToUI(nodeChildren[i]);
                    childUL.append(deepNode);
                }
            }else{
                li.append(nodeText).addClass('leaf-node');
            }

            li.attr('data-lineno', fun.lineNo);

            return li;
        }
    });

    // AN : used by outline view and other guys for actuallyContains
    $.extend($.expr[':'], {
        actuallyContains:function (elem, i, match, array) {
            var filtered = $(elem).contents().filter(function(i){
                return (this.textContent.indexOf(match[3]) >= 0)
            });
            return filtered.length > 0;
        }
    });
})(jQuery);