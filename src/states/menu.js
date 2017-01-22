let menuState = (game) => {
};

menuState.prototype = {
    init: function () {
        this.cursors = null;
        this.goKey = null;
        this.menuEntries = [];
        this.background = null;
        this.menuEntries[0] = null;
        this.menuEntries[1] = null;
        this.selectedMenu = 0;
        this.fadeExit = null;
        this.menuTitle = null;

        this.keysText = [];
        this.textConfig = null;

        this.textConfig = {
            font: "40px Arial",
            fill: "#ecf0f1",
            align: "center",
            wordWrap: true,
            wordWrapWidth: 600
        };

        this.textConfigInstructions = {
            font: "25px Arial",
            fill: "#ecf0f1",
            align: "center",
            wordWrap: false,
            wordWrapWidth: 600
        };
    },

    preload: function () {
        this.game.load.image('background', 'assets/prod/menu.png');
        this.game.load.audio('music', 'music/lost_frontier.ogg');
    },

    create: function () {
        this.goKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.cursors = this.input.keyboard.createCursorKeys();

        this.background = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');

        this.background.scale.setTo(1, 1);
        this.background.alpha = 0.8;

        this.menuEntries[0] = this.game.add.text(
            this.game.world.centerX,
            500,
            'New Game',
            this.textConfig
        );

        this.menuEntries[1] = this.game.add.text(
            this.game.world.centerX,
            550,
            'Credits',
            this.textConfig
        );

        this.menuEntries.forEach((m) => {
            m.anchor.setTo(0.5, 0.5);
        }, this);

        this.menuMusic = this.game.add.audio('music');
        this.menuMusic.loop = true;
        this.menuMusic.play();

        this.fadeIn = this.game.add.tween(this.game.world).to( { alpha: 1 }, 500, "Linear", true );

        let keysText = "Move: Arrow keys          Fire: Q/W          Character swap: E";
        this.game.add.text(
            this.game.world.centerX,
            650,
            keysText,
            this.textConfigInstructions
        ).anchor.setTo(0.5, 0.);

        this.game.input.onDown.add(this.goFullScreen, this);
    },

    goFullScreen: function () {
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        if (this.game.scale.isFullScreen) {
            this.game.scale.stopFullScreen();
        } else {
            this.game.scale.startFullScreen(true);
        }
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
                entry.alpha = 0.8;
            }
        }, this);

        if (this.goKey.justDown) {
            this.menuMusic.fadeOut(500);

            this.fadeExit = this.game.add.tween(this.game.world)
                .to( { alpha: 0 }, 500, "Linear", true )
                .onComplete.add(() => {
                    let next_state = ["Game", "Credits"];
                    this.game.state.start(next_state[this.selectedMenu]);
                }, this);
        }
    }
};

module.exports = menuState;
