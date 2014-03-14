// ==UserScript==
// @description Insert speed-reading widget into any page
// @match <all_urls>
// @name spool
// @namespace com.jameselford.scripts
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require https://raw.github.com/jelford/spool/master/spool.js?0143
// @version 0.1.4_3
// @grant none
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

$(document.body).click((function(spool) {
    return function(event) {
        var target = $(event.target);
        spool.read(target);
    };
})(spool())
);
