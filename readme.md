#Phaser-Boilerplate

This runs the [Invaders game example](http://phaser.io/examples/v2/games/invaders) from the official phaser doc.

This package uses browserify to package everything using gulp and babel (allowing es6 features). it also runs browserSync
and reload the page eveytime a change in the source code is made.

This package need node.js 6.9 or higher

first install the gulp-cli

    npm install -g gulp-cli

To install all the needed packages, run :
    
    npm install
    
To package everything and run browserSync, use the default Gulp task

    gulp
