//Utility methods format and trim added to string
(function() {
    if (typeof String.prototype.format !== 'function') {
        String.prototype.format = function () {
            var formatted = this,
                i;
            for (i = 0; i < arguments.length; i++) {
                formatted = formatted.replace("[" + i + "]", arguments[i]);
            }
            return formatted;
        };
    }

    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function () {
            var str = this;
            // AN typeof recipe for disaster in IE8
            // if (!str || typeof str !== 'string') {
            if (!str) {
                return "";
            } else {
                str = str.toString();
                return str.replace(/^[\s]+/, '').replace(/[\s]+$/, '').replace(/[\s]{2,}/, ' ');
            }
        };
    }
}());