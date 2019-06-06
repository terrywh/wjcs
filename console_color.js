"use strict";

const debug = function (app, module, action) {
    let argv = Array.from(arguments);
    
    argv.splice(0, 2, "%c[%c" + app + "%c] [%c" + module + "%c/%c" + action +"%c]",
        "color: #999", "color: #CC6666", "color: #999",
        "color: #6666CC", "color: #999", "color: #6666CC", "color: #999");
    console.debug.apply(console, argv);
};
