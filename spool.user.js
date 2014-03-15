// ==UserScript==
// @description Insert speed-reading widget into any page
// @match <all_urls>
// @name spool
// @namespace com.jameselford.scripts
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require https://raw.github.com/jelford/spool/28064b2c8d968d8c842774e3ccd5b13383c664f4/spool.js
// @version 0.1.5_2
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
