let creditsState = (game) => {
};

creditsState.prototype = {
    init: function() {
        this.credits = ["Visuals:\nChloé Sengelen\nLionel Melchiorre", "Sound design:\nAnthony Chappuis", "Code:\nAntoine Albertelli\nEric Dupertuis"];

        this.goKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    preload: function() {
        this.game.load.image('background', 'assets/prod/credits.png');
    },

    create: function() {

        let textConfig = {
            font: "20px Arial",
            fill: "#85A949",
            align: "center",
            wordWrap: false,
        };

        let headerConfig = {
            font: "50px Arial",
            fill: "#85A949",
            stroke: "#85A949",
            fontStyle: "bold",
            align: "center",
            wordWrap: false,
        };

        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');

        this.titleText = this.game.add.text(
            this.game.world.width / 2,
            this.game.world.height / 2,
            "Apocalypse Miaou!",
            headerConfig
        );

        this.titleText.anchor.setTo(0.5, 0.5);

        this.creditText = this.game.add.text(
            this.game.world.centerX - 300,
            this.game.world.centerY + 120,
            this.credits[0],
            textConfig
        );
        this.creditText.anchor.set(0.5);

        this.creditText = this.game.add.text(
            this.game.world.centerX,
            this.game.world.centerY + 120,
            this.credits[1],
            textConfig
        );
        this.creditText.anchor.set(0.5);

        this.creditText = this.game.add.text(
            this.game.world.centerX + 300,
            this.game.world.centerY + 120,
            this.credits[2],
            textConfig
        );

        this.creditText.anchor.set(0.5);
        this.game.world.alpha = 0;

        /* Fade in, display, fade out. */
        this.game.add.tween(this.game.world)
            .to( { alpha: 1 }, 1000, "Linear", true);
    },

    update: function() {
        if (this.goKey.isDown) {
            this.game.add.tween(this.game.world)
                .to({ alpha: 0 }, 500, "Linear", true)
                .onComplete.add(() => {
                    this.game.state.start("Menu");
                }, this);
        }
    }
};

module.exports = creditsState;
