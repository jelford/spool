// ==UserScript==
// @description Insert speed-reading widget into any page
// @match <all_urls>
// @name spool
// @namespace com.jameselford.scripts
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require https://raw.github.com/jelford/spool/706aae2110bbe41eac7ac7e3ce9ef03a71a0533e/spool.js
// @version 0.1.7_1
// @grant none
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

$(document.body).click((function(spool) {
    return function(event) {
        if (event.altKey) {
            var target = $(event.target);
            spool.read(target);
        }
    };
})(spool())
);
