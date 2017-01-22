#GGJ17 Project

## Apocalypse Miaou!

Project for the 2017 Global Game Jam

A working demo is available here : COMING SOON

## The team
- A.Chappuis, Music
- C.Sengelen, Visuals (http://nectartstudio.ch)
- L.Melchiorre, Visuals (http://lionel-melchiorre.ch)
- A.Albertelli, Programming ([@antoinealb](https://github.com/antoinealb))
- E.Dupertuis, Programming ([@EricDupertuis](https://github.com/EricDupertuis))

#How to
 
 To run and build this package, you'll need node.js 6.9 or higher
 
 first install the gulp-cli
 
     npm install -g gulp-cli
 
 To install all the needed packages, run :
     
     npm install
     
to watch and rebuild on change
 
     gulp
     
You can run a server with gulp using
    
    gulp serve
    
Then just go to [http://localhost:9000](http://localhost:9000)
     
To run a dev server using Docker (disables every cache), run the following commands:
 
     docker built -t phaser docker/
 
 If you're using bash
 
     docker run -v $(pwd):/data -p 80:80 phaser
 
 If you're using fish

         docker run -v (pwd):/data -p 80:80 phaser
 
 Tadaa, it will be available under localhost if you use docker or your `docker-machine ip` if you use Docker Machine.

