let menuState = (game) => {
    "use strict";
    let textConfig = {
        font: "16px Arial",
        fill: "#E8EAF6",
        align: "center",
        wordWrap: true,
        wordWrapWidth: 600
    };
};

menuState.prototype = {
    init: function () {
        this.goKey = null;
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
        this.goKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.cursors = this.input.keyboard.createCursorKeys();
    },

    update: function () {
        if (this.cursors.up.justDown) {
            if (this.selectedMenu > 0) {
                this.selectedMenu -= 1;
            }
        } else if (this.cursors.down.justDown) {
            if (this.selectedMenu < this.menuEntries.length - 1) {
                this.selectedMenu += 1;
            }
        }

        this.menuEntries.forEach(function (entry, i) {
            entry.alpha = 1;
            if (i != this.selectedMenu) {
                entry.alpha = DARKEN_ALPHA;
            }
        }, this);

        if (this.goKey.justDown) {
            if (this.selectedMenu == 0) {
                this.game.state.start("Game");
            } else {
                console.log('Index matches nothing bro :/ ');
            }
        }
    }
}

module.exports = menuState;