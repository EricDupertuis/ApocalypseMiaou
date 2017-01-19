window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
const Phaser = require('phaser/build/custom/phaser-split');
let menuState = require('./states/menu');

const game = new Phaser.Game(800, 600, Phaser.AUTO, 'ggj17');

game.state.add("Menu", menuState);
game.state.start("Menu");
