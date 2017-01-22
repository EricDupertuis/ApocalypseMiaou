window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');
let menuState = require('./states/menu');
let gameState = require('./states/game');
let creditsState = require('./states/credits');

const game = new Phaser.Game(1280, 720, Phaser.AUTO, 'ggj17');

game.state.add("Menu", menuState);
game.state.add("Game", gameState);
game.state.add("Credits", creditsState);

//TODO: Turn this back to "Menu"
game.state.start("Game");
