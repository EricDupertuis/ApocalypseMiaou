#Phaser-Boilerplate

This runs the [Invaders game example](http://phaser.io/examples/v2/games/invaders) from the official phaser doc.

This package uses browserify to package everything using gulp and babel (allowing es6 features). it also runs browserSync
and reload the page eveytime a change in the source code is made.

This package need node.js 6.9 or higher

first install the gulp-cli

    npm install -g gulp-cli

To install all the needed packages, run :

    npm install

To package everything use the default Gulp task:

    gulp

To run a dev server (disables every cache), runs the following commands:

    docker built -t phaser docker/
    docker run -v $(pwd):/data -p 80:80 phaser

Tadaa, it will be available under localhost if you use docker or your `docker-machine ip` if you use Docker Machine.

