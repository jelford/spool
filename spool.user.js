// ==UserScript==
// @description Insert speed-reading widget into any page
// @match <all_urls>
// @name spool
// @namespace com.jameselford.scripts
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require https://raw.github.com/jelford/spool/c2b2e73ef3b36cf424d910106daa2ba7dbc61488/spool.js
// @version 0.1.6_0
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
