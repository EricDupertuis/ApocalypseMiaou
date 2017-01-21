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
    },

    preload: function () {
        this.game.load.spritesheet('fireball', 'assets/prod/effects/fireball.png', 53, 32);
        this.game.load.spritesheet('ice', 'assets/prod/effects/ice.png', 45, 45);
        this.game.load.spritesheet('missile', 'assets/prod/effects/missile.png', 84, 36);
        this.game.load.spritesheet('invader', 'assets/example/invader32x32x4.png', 64, 64);
        this.game.load.spritesheet('kaboom', 'assets/prod/effects/explosion.png', 512, 512, 8);
        this.game.load.spritesheet('lumberjack', 'assets/prod/enemies/bucheron.png', 100, 100, 12);
        this.game.load.spritesheet('meteor', 'assets/prod/enemies/meteor.png', 72, 150, 4);

        this.game.load.image('enemyBullet', 'assets/example/enemy-bullet.png');
        this.game.load.image('chopper', 'assets/prod/enemies/helicopter.png');
        this.game.load.spritesheet('characters', 'assets/prod/characters/combined.png', 139, 100, 20);

        for (let i=1;i<=5; i++) {
            this.game.load.image('background' + i, 'assets/prod/background' + i + '.png');
        }
    },

    create: function () {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.backgroundGroup = this.game.add.group();

        // background image
        for (let i=1; i<5; i++) {
            this.backgroundGroup.create(5333 * (i - 1), 0, 'background' + i);
        }

        //  Our bullet group
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

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

        this.createLevel();

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
        this.slowDownButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);

        this.swapButton = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.swapButton.onDown.add(this.swapCharacter, this);

        this.mainGunButton.cooldown = 0;
        this.shockWaveButton.cooldown = 0;
        this.waveGunButton.cooldown = 0;
        this.threeShotButton.cooldown = 0;

        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.input.onDown.add(this.goFullScreen, this);
    },

    createPlayer: function () {
        let player = this.game.add.sprite(400, 500, 'characters');
        player.moving = false;
        player.alternateCharacter = false;
        this.game.physics.enable(player, Phaser.Physics.ARCADE);

        let updateAnimation = (sprite, animation) => {
            if (sprite.alternateCharacter == false) {
                let animation_name = animation.name.replace("alternate_", "");

                if (animation_name == 'halt') {
                    if (sprite.moving) {
                        sprite.animations.play('accelerate');
                    }
                } else if (animation_name == 'accelerate') {
                    if (sprite.moving) {
                        sprite.animations.play('fly');
                    } else {
                        sprite.animations.play('break');
                    }
                } else if (animation_name == 'fly') {
                    if (!sprite.moving) {
                        sprite.animations.play('break');
                    }
                } else if (animation_name == 'break') {
                   if (sprite.moving) {
                        sprite.animations.play('accelerate');
                    } else {
                        sprite.animations.play('halt');
                    }
                }
            } else {
                sprite.animations.play('alternate_fly');
            }
        };

        player.animations.add('fly', [3, 4], 16, true).onLoop.add(updateAnimation);
        player.animations.add('halt', [0], 16, true).onLoop.add(updateAnimation);
        player.animations.add('accelerate', [0, 1, 2, 3, 4], 16, false).onComplete.add(updateAnimation);
        player.animations.add('break', [4, 3, 2, 1, 0], 16, false).onComplete.add(updateAnimation);
        player.animations.add('alternate_fly', [10, 11, 12, 13, 14, 13, 12, 11], 16, true).onLoop.add(updateAnimation);;

        /* Now do the same for the alternate skin. */
        player.animations.play('alternate_fly');

        player.physicsBodyType = Phaser.Physics.ARCADE;
        player.enableBody = true;
        player.anchor.setTo(0.5, 0.5);
        player.body.collideWorldBounds = true;
        player.deathCooldown = 0;
        player.body.setSize(30, 30, 100, 16);

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

    createLumberjack: function (x, y) {
        let lumberjack = this.ennemies.create(x, y, 'lumberjack');
        lumberjack.animations.add('lumberjack');
        lumberjack.animations.play('lumberjack', 10, true);
    },

    createMeteor: function (x, y) {
        let meteor = this.ennemies.create(x, 0, 'meteor');
        meteor.anchor.setTo(0.5, 1.);
        meteor.animations.add('meteor');
        meteor.animations.play('meteor', 10, true);

        meteor.behaviour = (m) => {
            if (this.player.x >= m.body.x) {
                meteor.body.velocity.y = 1000;
            }
        };
    },

    createChopper: function (x, y) {
        let chopper = this.ennemies.create(x, y, 'chopper');
        chopper.checkWorldBounds = true;
        chopper.armor = 3;
        chopper.armorTouchCooldown = 0;

        chopper.events.onEnterBounds.add((c) => {
            console.log("CHOPPER: entered bounds");
            c.roundsLeft = 0;

            chopper.events.onOutOfBounds.add((c) => {
                console.log("CHOPPER: exiting bounds");
                c.kill();
            }, this);

            chopper.behaviour = (c) => {
                let freq = 0.25;
                let amplitude = 200;

                c.body.velocity.x = -100;
                c.body.velocity.y = Math.sin((this.game.time.now / 1000) * 2 * Math.PI * freq) * amplitude;

                if (!c.cooldown) {
                    c.cooldown = 0;
                }

                if (!c.burstCooldown) {
                    c.burstCooldown = this.game.time.now;
                }

                if (this.game.time.now > c.burstCooldown && c.roundsLeft == 0) {
                    console.log("Reloaded");
                    c.burstCooldown = this.game.time.now + 800;
                    c.roundsLeft = 3;
                }

                if (this.game.time.now > c.cooldown && c.roundsLeft > 0) {
                    c.cooldown = this.game.time.now + 100;
                    c.fired = true;

                    let bullet = this.enemyBullets.getFirstExists(false);

                    if (bullet) {
                        bullet.reset(c.x, c.y);
                        bullet.body.velocity.x = -1000;
                    }
                    c.roundsLeft--;
                }
            };
        }, this);
    },

    createLevel: function () {
        let y = 60;
        let x = 666;

        this.createLumberjack(1 * x, 5 * y);
        this.createLumberjack(1.2 * x, 5 * y);
        this.createLumberjack(3 * x, 6 * y);
        this.createLumberjack(3 * x, 7 * y);
        this.createLumberjack(4 * x, 6 * y);
        this.createLumberjack(4 * x, 7 * y);
/*
        this.createHunter(2 * x, 2 * y);
        this.createHunter(2 * x, 10 * y);

        this.createHunter(3 * x, 11 * y);

        this.createHunter(4 * x, 6 * y);
        this.createHunter(4 * x, 11 * y);
*/
        /* TODO: camion */

        this.createMeteor(1.5 * x, -2.5 * y);

        this.createChopper(3 * x, 5 * y);
        this.createChopper(4 * x, 5 * y);
        this.createChopper(5 * x, 5 * y);
        this.createChopper(6 * x, 5 * y);
        this.createChopper(7 * x, 5 * y);
    },

    setupInvader: function (invader) {
        invader.anchor.x = 0.5;
        invader.anchor.y = 0.5;
        invader.animations.add('kaboom');
    },

    moveLeft: function () {
        this.ennemies.x -= 10;
    },

    swapCharacter: function() {
        this.player.alternateCharacter = !this.player.alternateCharacter;
    },

    update: function () {
        this.backgroundGroup.x -= 2;

        this.bullets.forEachAlive(function (bullet) {
            if (bullet.bulletUpdate) {
                bullet.bulletUpdate(bullet);
            }
        }, this);

        this.ennemies.forEachAlive(function (enemy) {
            if (enemy.behaviour) {
                enemy.behaviour(enemy);
            }

            if (enemy.armorTouchCooldown && this.game.time.now < enemy.armorTouchCooldown) {
                enemy.tint = 0xff00000;
            } else {
                enemy.tint = 0xffffff;
            }
        }, this);

        if (this.player.alive) {
            //  Reset the player, then check for movement keys
            this.player.body.velocity.setTo(0, 0);
            this.player.moving = false;

            /* Apply tint if we recently got hit. */
            if (this.game.time.now < this.player.deathCooldown) {
                this.player.tint = 0xff00000;
            } else {
                this.player.tint = 0xffffff;
            }

            let max_speed = 500;

            if (this.slowDownButton.isDown) {
            }

            if (this.cursors.left.isDown) {
                if (this.slowDownButton.isDown) {
                    this.player.body.velocity.x = -max_speed / 2;
                } else {
                    this.player.body.velocity.x = -max_speed;
                }
            } else if (this.cursors.right.isDown) {
                this.player.moving = true;

                if (this.slowDownButton.isDown) {
                    this.player.body.velocity.x = max_speed / 2;
                } else {
                    this.player.body.velocity.x = max_speed;
                }
            }

            if (this.cursors.up.isDown) {
                if (this.slowDownButton.isDown) {
                    this.player.body.velocity.y = -max_speed / 2;
                } else {
                    this.player.body.velocity.y = -max_speed;
                }
            } else if (this.cursors.down.isDown) {
                if (this.slowDownButton.isDown) {
                    this.player.body.velocity.y = max_speed / 2;
                } else {
                    this.player.body.velocity.y = max_speed;
                }
            }

            if (this.mainGunButton.isDown) {
                if (this.game.time.now > this.mainGunButton.cooldown) {
                    this.fireBullet(null, 0, 'missile');
                    this.mainGunButton.cooldown = this.game.time.now + 200;
                }
            }

            if (this.waveGunButton.isDown) {
                if (this.game.time.now > this.waveGunButton.cooldown) {
                    this.fireBullet((b) => {
                        let angle = 2 * 1 * Math.PI * (this.game.time.now - b.fireTime) / 1000;
                        let vel = 500 * Math.sin(angle);
                        b.body.velocity.y = vel;
                    }, 0, 'ice');
                    this.waveGunButton.cooldown = this.game.time.now + 200;
                }
            }

            if (this.shockWaveButton.isDown) {
                if (this.game.time.now > this.shockWaveButton.cooldown) {
                    this.fireBullet((b) => {
                        b.scale.setTo(1, 1 + 10 * (this.game.time.now - b.fireTime) / 1000);
                    }, 0, 'fireball');
                    this.shockWaveButton.cooldown = this.game.time.now + 200;
                }
            }

            if (this.threeShotButton.isDown) {
                if (this.game.time.now > this.threeShotButton.cooldown) {
                    this.fireBullet(null, 45, 'fireball');
                    this.fireBullet(null, 0, 'fireball');
                    this.fireBullet(null, -45, 'fireball');
                    this.threeShotButton.cooldown = this.game.time.now + 200;
                }
            }

            //  Run collision
            this.game.physics.arcade.overlap(this.bullets, this.ennemies, this.collisionHandler, null, this);
            this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.hitPlayer, null, this);
            this.game.physics.arcade.overlap(this.player, this.ennemies, this.hitPlayer, null, this);
        }
    },

    collisionHandler: function (bullet, enemy) {
        if (enemy.armor && enemy.armor > 0) {
            enemy.armor--;
            enemy.armorTouchCooldown = this.game.time.now + 200;
            bullet.kill();
            return;
        }

        bullet.kill();
        enemy.kill();

        //  Increase the score
        this.score += 20;
        this.scoreText.text = this.scoreString + this.score;

        //  And create an explosion :)
        let explosion = this.explosions.getFirstExists(false);
        explosion.reset(enemy.body.x, enemy.body.y);
        explosion.play('kaboom', 10, false, true);

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

    fireBullet: function (update, angle, animation) {
        if (!angle) {
            angle = 0;
        }
        angle = angle * Math.PI / 180;

        //  Grab the first bullet we can from the pool
        let bullet = this.bullets.create(0, 0, animation);

        if (bullet) {
            bullet.animations.add(animation);
            bullet.scale.setTo(1, 1);
            //  And fire it
            bullet.reset(this.player.x, this.player.y + 8);
            bullet.animations.play(animation, 10, true, false);
            bullet.body.velocity.x = Math.cos(angle) * 400;
            bullet.body.velocity.y = Math.sin(angle) * 400;
            this.bulletTime = this.game.time.now + 100;
            bullet.fireTime = this.game.time.now;
            bullet.bulletUpdate = update;
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
