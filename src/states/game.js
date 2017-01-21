let gameState = (game) => {};

gameState.prototype = {
    init: function () {
        this.player = null;
        this.ennemies = null;
        this.bullets = null;
        this.bulletTime = 0;
        this.cursors = null;
        this.mainGunButton = null;
        this.explosions = null;
        this.background = null;
        this.score = 0;
        this.scoreString = '';
        this.scoreText = null;
        this.lives = null;
        this.enemyBullet = null;
        this.firingTimer = 0;
        this.livingEnemies = [];
    },

    preload: function () {
        this.game.load.image('bullet', 'assets/example/bullet.png');
        this.game.load.image('enemyBullet', 'assets/example/enemy-bullet.png');
        this.game.load.spritesheet('invader', 'assets/example/invader32x32x4.png', 32, 32);
        this.game.load.image('lion', 'assets/prod/characters/lion.png');
        this.game.load.spritesheet('kaboom', 'assets/example/explode.png', 128, 128);
        this.game.load.image('background', 'assets/prod/background.jpg');
    },

    create: function () {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.backgroundGroup = this.game.add.group();

        // background image
        this.background = this.backgroundGroup.create(0, 0, 'background');

        //  Our bullet group
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 1);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);

        // The enemy's bullets
        let enemyBullets = this.game.add.group();
        this.enemyBullets = this.backgroundGroup.add(enemyBullets);
        this.enemyBullets.enableBody = true;
        this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyBullets.createMultiple(300, 'enemyBullet');
        this.enemyBullets.setAll('anchor.x', 0.5);
        this.enemyBullets.setAll('anchor.y', 1);
        this.enemyBullets.setAll('outOfBoundsKill', true);
        this.enemyBullets.setAll('checkWorldBounds', true);

        this.player = this.createPlayer();
        this.game.camera.follow(this.player);

        //  The baddies!
        let ennemies = this.game.add.group();
        this.ennemies = this.backgroundGroup.add(ennemies);

        this.ennemies.enableBody = true;
        this.ennemies.physicsBodyType = Phaser.Physics.ARCADE;

        this.createEnemies();

        //  The score
        this.scoreString = 'Score : ';
        this.scoreText = this.game.add.text(10, 10, this.scoreString + this.score, {font: '34px Arial', fill: '#fff'});

        //  Lives
        this.lives = this.game.add.group();
        this.game.add.text(this.game.world.width - 100, 10, 'Lives : ', {font: '34px Arial', fill: '#fff'});

        for (let i = 0; i < 3; i++) {
            let lion = this.lives.create(this.game.world.width - 100 + (30 * i), 60, 'lion');
            lion.anchor.setTo(0.5, 0.5);
            lion.angle = 90;
            lion.alpha = 0.4;
        }

        //  An explosion pool
        this.explosions = this.game.add.group();
        this.explosions.createMultiple(30, 'kaboom');
        this.explosions.forEach(this.setupInvader, this);

        //  And some controls to play the game with
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.mainGunButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.shockWaveButton = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
        this.waveGunButton = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.threeShotButton = this.game.input.keyboard.addKey(Phaser.Keyboard.E);

        this.mainGunButton.cooldown = 0;
        this.shockWaveButton.cooldown = 0;
        this.waveGunButton.cooldown = 0;
        this.threeShotButton.cooldown = 0;

        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.input.onDown.add(this.goFullScreen, this);
    },

    createPlayer: function () {
        let player = this.game.add.sprite(400, 500, 'lion');
        this.game.physics.enable(player, Phaser.Physics.ARCADE);
        player.physicsBodyType = Phaser.Physics.ARCADE;
        player.enableBody = true;
        player.anchor.setTo(0.5, 0.5);
        player.body.collideWorldBounds = true;
        player.deathCooldown = 0;

        return player;
    },

    createHunter: function(x, y) {
        let hunter = this.ennemies.create(x, y, 'invader');
        hunter.checkWorldBounds = true;

        hunter.events.onEnterBounds.add((h) => {
            console.log("HUNTER: entered bounds");

            hunter.events.onOutOfBounds.add((h) => {
                console.log("HUNTER: exiting bounds");
                h.kill();
            }, this);

            hunter.behaviour = (h) => {
                if (!h.cooldown) {
                    h.cooldown = 0;
                }

                if (this.game.time.now > h.cooldown) {
                    h.cooldown = this.game.time.now + 300;
                    h.fired = true;
                    let bullet = this.enemyBullets.getFirstExists(false);
                    if (bullet) {
                        let vx = this.player.body.x - h.body.x;
                        let vy = this.player.body.y - h.body.y;

                        let angle = Math.atan2(vy, vx);

                        vx = Math.cos(angle) * 400;
                        vy = Math.sin(angle) * 400;

                        bullet.reset(h.x, h.y);

                        bullet.body.velocity.x = vx;
                        bullet.body.velocity.y = vy;
                    }
                }
            };
        }, this);
    },

    createChopper: function (x, y) {
        let chopper = this.ennemies.create(x, y, 'invader');
        chopper.checkWorldBounds = true;

        chopper.events.onEnterBounds.add((h) => {
            console.log("CHOPPER: entered bounds");

            chopper.events.onOutOfBounds.add((h) => {
                console.log("CHOPPER: exiting bounds");
                h.kill();
            }, this);

            chopper.behaviour = (c) => {
                c.body.velocity.x = -100;
                c.body.velocity.y = Math.sin((this.game.time.now / 1000) * 2 * Math.PI * 1) * 600;

                if (!c.cooldown) {
                    c.cooldown = 0;
                }

                if (this.game.time.now > c.cooldown) {
                    c.cooldown = this.game.time.now + 300;
                    c.fired = true;
                    let bullet = this.enemyBullets.getFirstExists(false);
                    if (bullet) {
                        bullet.reset(c.x, c.y);
                        bullet.body.velocity.x = -300;
                    }
                }
            };
        }, this);
    },

    createEnemies: function () {
        //this.createHunter(1300, 700);
        this.createChopper(1300, 300);
    },

    setupInvader: function (invader) {
        invader.anchor.x = 0.5;
        invader.anchor.y = 0.5;
        invader.animations.add('kaboom');
    },

    moveLeft: function () {
        this.ennemies.x -= 10;
    },

    update: function () {
        this.backgroundGroup.x -= 2;

        this.bullets.forEachAlive(function (bullet) {
            if (bullet.bulletUpdate) {
                bullet.bulletUpdate(bullet);
            }
        }, this);

        this.ennemies.forEachAlive(function (ennemy) {
            if (ennemy.behaviour) {
                ennemy.behaviour(ennemy);
            }
        }, this);

        if (this.player.alive) {
            //  Reset the player, then check for movement keys
            this.player.body.velocity.setTo(0, 0);

            let max_speed = 500;

            if (this.cursors.left.isDown) {
                this.player.body.velocity.x = -max_speed;
            } else if (this.cursors.right.isDown) {
                this.player.body.velocity.x = max_speed;
            }

            if (this.cursors.up.isDown) {
                this.player.body.velocity.y = -max_speed;
            } else if (this.cursors.down.isDown) {
                this.player.body.velocity.y = max_speed;
            }

            if (this.mainGunButton.isDown) {
                if (this.game.time.now > this.mainGunButton.cooldown) {
                    this.fireBullet(null);
                    this.mainGunButton.cooldown = this.game.time.now + 200;
                }
            }

            if (this.waveGunButton.isDown) {
                if (this.game.time.now > this.waveGunButton.cooldown) {
                    this.fireBullet((b) => {
                        let angle = 2 * 1 * Math.PI * (this.game.time.now - b.fireTime) / 1000;
                        let vel = 500 * Math.sin(angle);
                        b.body.velocity.y = vel;
                    });
                    this.waveGunButton.cooldown = this.game.time.now + 200;
                }
            }

            if (this.shockWaveButton.isDown) {
                if (this.game.time.now > this.shockWaveButton.cooldown) {
                    this.fireBullet((b) => {
                        b.scale.setTo(1, 1 + 10 * (this.game.time.now - b.fireTime) / 1000);
                    });
                    this.shockWaveButton.cooldown = this.game.time.now + 200;
                }
            }

            if (this.threeShotButton.isDown) {
                if (this.game.time.now > this.threeShotButton.cooldown) {
                    this.fireBullet(null, 45);
                    this.fireBullet(null, 0);
                    this.fireBullet(null, -45);
                    this.threeShotButton.cooldown = this.game.time.now + 200;
                }
            }

            //  Run collision
            this.game.physics.arcade.overlap(this.bullets, this.ennemies, this.collisionHandler, null, this);
            this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.hitPlayer, null, this);
            this.game.physics.arcade.overlap(this.player, this.ennemies, this.hitPlayer, null, this);
        }
    },

    collisionHandler: function (bullet, alien) {
        //  When a bullet hits an alien we kill them both
        bullet.kill();
        alien.kill();

        //  Increase the score
        this.score += 20;
        this.scoreText.text = this.scoreString + this.score;

        //  And create an explosion :)
        let explosion = this.explosions.getFirstExists(false);
        explosion.reset(alien.body.x, alien.body.y);
        explosion.play('kaboom', 30, false, true);

        if (this.ennemies.countLiving() == 0) {
            this.score += 1000;
            this.scoreText.text = this.scoreString + this.score;

            this.enemyBullets.callAll('kill', this);
        }
    },

    hitPlayer: function (player, enemy) {
        if (this.game.time.now < player.deathCooldown) {
            return;
        }

        enemy.kill();

        this.live = this.lives.getFirstAlive();

        if (this.live) {
            this.live.kill();
        }

        //  And create an explosion :)
        let explosion = this.explosions.getFirstExists(false);
        explosion.reset(player.body.x, player.body.y);
        explosion.play('kaboom', 30, false, true);

        // When the player dies
        if (this.lives.countLiving() < 1) {
            this.game.state.start("Menu");
        }

        player.deathCooldown = this.game.time.now + 1000;
    },

    fireBullet: function (update, angle) {
        if (!angle) {
            angle = 0;
        }
        angle = angle * Math.PI / 180;

        //  Grab the first bullet we can from the pool
        this.bullet = this.bullets.getFirstExists(false);

        if (this.bullet) {
            this.bullet.scale.setTo(1, 1);
            //  And fire it
            this.bullet.reset(this.player.x, this.player.y + 8);
            this.bullet.body.velocity.x = Math.cos(angle) * 400;
            this.bullet.body.velocity.y = Math.sin(angle) * 400;
            this.bulletTime = this.game.time.now + 100;
            this.bullet.fireTime = this.game.time.now;
            this.bullet.bulletUpdate = update;
        }

    },


    resetBullet: function (bullet) {
        //  Called if the bullet goes out of the screen
        bullet.kill();
    },

    goFullScreen: function () {
        if (this.game.scale.isFullScreen) {
            this.game.scale.stopFullScreen();
        } else {
            this.game.scale.startFullScreen(true);
        }
    }
}

module.exports = gameState;
