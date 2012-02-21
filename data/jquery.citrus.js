define('jquery.citrus',['jquery'],
    (function ($) {
        $.fn.citrus = function () {
            /*
             * Hide all the child tree elements
             */
            var parentLi = this.find('li').has('ul');
            parentLi.children("ul").hide();
            parentLi.addClass('collapsed');

            /*
             * Add a span for expander
             */
            parentLi.prepend('<span class="expander"></span>');


            /*
             * Expand the child tree
             */
            parentLi.children('span.expander').click(function (event) {
                $(this).parent("li").children('ul').toggle();
                $(this).parent("li").toggleClass('collapsed expanded');
                event.stopPropagation();
            });
        };
    })(jQuery)
);