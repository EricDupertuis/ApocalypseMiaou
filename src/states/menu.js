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
        },

    create: function () {
        this.goKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.cursors = this.input.keyboard.createCursorKeys();

        this.menuEntries[0] = this.game.add.text(
            this.game.world.centerX,
            350,
            'New Game',
            {font: "35px Arial", fill: "#ecf0f1", align: "center"}
        );
        this.menuEntries[0].anchor.set(0.5);

        this.menuEntries[1] = this.game.add.text(
            this.game.world.centerX,
            400,
            'Game instructions',
            {font: "35px Arial", fill: "#ecf0f1", align: "center"}
        );
        this.menuEntries[1].anchor.setTo(0.5);
    },

    update: function () {
        if (this.cursors.up.justDown && this.selectedMenu > 0) {
            this.selectedMenu -= 1;
        } else if (this.cursors.down.justDown && this.selectedMenu < this.menuEntries.length - 1) {
            this.selectedMenu += 1;
        }

        this.menuEntries.forEach(function (entry, i) {
            entry.alpha = 1;
            if (i != this.selectedMenu) {
                entry.alpha = 0.8;
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