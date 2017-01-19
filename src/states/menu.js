let menuState = () => {};

menuState.prototype =  {
    init: function () {
        this.cursors = null;
        this.enterKey = null;
        this.menuEntries = [];
        this.background = null;
        this.selectedMenu = 0;
    },
    preload: function () {
        /** @var game Phaser */
        this.game.load.baseURL = 'assets/';
    },
    create: function () {
        this.cursors = this.input.keyboard.createCursorKeys();
    },
    update: () => {

    }

};

module.exports = menuState;