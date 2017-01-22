let creditsState = (game) => {
};

creditsState.prototype = {
    init: function() {
        this.credits = "Visuals:\nChloé Sengelen\nLionel Melchiorre\n\nSound design:\nAnthony Chappuis\n\nCode:\nAntoine Albertelli\nEric Dupertuis";

        this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    preload: function() {
        this.game.load.baseURL = 'assets/prod/';
        this.game.load.image('background', 'credits.png');
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
            this.game.world.centerX,
            this.game.world.centerY + 180,
            this.credits,
            textConfig
        );

        this.creditText.anchor.set(0.5);
        this.game.world.alpha = 0;

        /* Fade in, display, fade out. */
        this.game.add.tween(this.game.world)
                     .to( { alpha: 1 }, 1000, "Linear", true);
    },

    update: function() {
    }
}

module.exports = creditsState;
