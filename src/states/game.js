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
        this.backgroundTween = null;
    },

    preload: function () {
        this.game.load.audio('music', 'sounds/Feline_Freedom_Force.ogg');
        this.game.load.spritesheet('fireball', 'assets/prod/effects/fireball.png', 53, 32);
        this.game.load.spritesheet('ice', 'assets/prod/effects/ice.png', 45, 45);
        this.game.load.spritesheet('missile', 'assets/prod/effects/missile.png', 84, 36);
        this.game.load.spritesheet('hunter', 'assets/prod/enemies/hunter.png', 128, 128, 8);
        this.game.load.spritesheet('kaboom', 'assets/prod/effects/explosion.png', 512, 512, 8);
        this.game.load.spritesheet('lumberjack', 'assets/prod/enemies/bucheron.png', 100, 100, 12);
        this.game.load.spritesheet('meteor', 'assets/prod/enemies/meteor.png', 72, 150, 4);
        this.game.load.spritesheet('excavator', 'assets/prod/enemies/excavator.png', 260, 327);
        this.game.load.spritesheet('arm', 'assets/prod/enemies/sprite_bras.png', 520, 426, 16);

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

        this.backgroundTween = this.game.add.tween(this.game.world)
            .to( { alpha: 1 }, 1000, "Linear", true );

        // background image
        for (let i=1; i<5; i++) {
            this.backgroundGroup.create(5333 * (i - 1), 0, 'background' + i);
        }

        //  Our bullet group
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
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
        this.remainingLives = 3;
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
        this.shieldText = this.game.add.text(this.game.world.width - 400, 10, 'Shield: ', {font: '34px Arial', fill: '#fff'});

        //  An explosion pool
        this.explosions = this.game.add.group();
        this.explosions.createMultiple(30, 'kaboom');
        this.explosions.forEach(this.setupInvader, this);

        //  And some controls to play the game with
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.slowDownButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.mainGunButton = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
        this.secondGunButton = this.game.input.keyboard.addKey(Phaser.Keyboard.W);

        this.swapButton = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
        this.swapButton.onDown.add(this.swapCharacter, this);

        this.missileCooldown = 0;
        this.waveCooldown = 0;
        this.flameCooldown = 0;

        this.music = this.game.add.audio('music');
        this.music.loop = true;
        this.music.play();

        this.game.camera.onShakeComplete.add(() => {
            this.game.camera.position.setTo(0, 0);
        }, this);
    },

    createPlayer: function () {
        let player = this.game.add.sprite(400, 500, 'characters');
        player.moving = false;
        player.alternateCharacter = false;
        player.shieldEnabled = false;
        player.shieldEnergyMax = 100;
        player.shieldEnergy = player.shieldEnergyMax;
        player.shooting = false;
        this.game.physics.enable(player, Phaser.Physics.ARCADE);

        let updateAnimation = (sprite, animation) => {
            let animation_name = animation.name
                .replace("alternate_", "")
                .replace("_shoot", "");
            let next_animation = animation_name;

            if (sprite.alternateCharacter == false) {
                if (animation_name == 'halt') {
                    if (sprite.moving) {
                        next_animation = 'accelerate';
                    }
                } else if (animation_name == 'accelerate') {
                    if (sprite.moving) {
                        next_animation = 'fly';
                    } else {
                        next_animation = 'break';
                    }
                } else if (animation_name == 'fly') {
                    if (!sprite.moving) {
                        next_animation = 'break';
                    }
                } else if (animation_name == 'break') {
                   if (sprite.moving) {
                        next_animation = 'accelerate';
                    } else {
                        next_animation = 'halt';
                    }
                }

            } else {
                next_animation = 'alternate_fly';
            }

            if (next_animation && sprite.shooting) {
                next_animation = next_animation + "_shoot";
            }

            if (next_animation) {
                sprite.animations.play(next_animation);
            }
        };

        player.animations.add('fly', [3, 4], 16, true).onLoop.add(updateAnimation);
        player.animations.add('halt', [0], 16, true).onLoop.add(updateAnimation);
        player.animations.add('accelerate', [0, 1, 2, 3, 4], 16, false).onComplete.add(updateAnimation);
        player.animations.add('break', [4, 3, 2, 1, 0], 16, false).onComplete.add(updateAnimation);

        player.animations.add('fly_shoot', [8, 9], 16, true).onLoop.add(updateAnimation);
        player.animations.add('halt_shoot', [5], 16, true).onLoop.add(updateAnimation);
        player.animations.add('accelerate_shoot', [5, 6, 7, 8, 9], 16, false).onComplete.add(updateAnimation);
        player.animations.add('break_shoot', [9, 8, 7, 6, 5], 16, false).onComplete.add(updateAnimation);

        player.animations.add('alternate_fly', [10, 11, 12, 13, 14, 13, 12, 11], 16, true).onLoop.add(updateAnimation);;
        player.animations.add('alternate_fly_shoot', [15, 16, 17, 18, 19, 18, 17, 16], 16, true).onLoop.add(updateAnimation);;

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
        let hunter = this.ennemies.create(x, y, 'hunter');
        hunter.animations.add('hunt', [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1], 6, true);
        hunter.animations.play('hunt');
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
        lumberjack.animations.add('chop', [0, 1, 2, 3, 4, 5, 4, 3, 2, 1], 10, true);
        lumberjack.animations.play('chop');

        // Avoid having  all lumberjacks stay in sync
        lumberjack.animations.currentAnim.setFrame(Math.floor(Math.random()*5), true);
    },

    createMeteor: function (x, y) {
        let meteor = this.ennemies.create(x, 0, 'meteor');
        meteor.anchor.setTo(0.5, 1);
        meteor.animations.add('meteor');
        meteor.animations.play('meteor', 10, true);

        meteor.behaviour = (m) => {
            if (m.body.x < this.player.x) {
                meteor.body.velocity.y = 800;
            }
        }
    },

    createExcavator: function (x, y) {
        let arm = this.ennemies.create(x, y, 'arm');
        let excavator = this.ennemies.create(x, y, 'excavator');

        excavator.base_y = y;
        
        excavator.anchor.setTo(0.5, 1);

        excavator.animations.add('excavator');
        excavator.animations.play('excavator', 10, true);

        excavator.arm = arm;
        excavator.arm.anchor.setTo(1., 1);
        excavator.arm.armor = 10000;

        excavator.arm.animations.add('arm');
        excavator.arm.animations.play('arm', 5, true);

        excavator.checkWorldBounds = true;
        excavator.armor = 50000;
        excavator.armorTouchCooldown = 0;

        excavator.body.setSize(30, 100, 100, 100);

        excavator.events.onEnterBounds.add((e) => {
            console.log("EXCAVATOR: entered bounds");

            e.arm.armor = 25;
            e.armor = 50;
            e.base_y = e.body.position.y;

            excavator.behaviour = (e) => {
                let freq = 0.25;
                let amplitude = 200;

                if (e.body.x < 1000) {
                    e.body.velocity.x = 400;
                } else {
                    e.body.velocity.x = 100;
                }

                e.body.position.y = e.base_y + Math.sin((this.game.time.now / 1000) * 2 * Math.PI * freq) * amplitude;

                e.arm.position = e.position;

                if (!e.cooldown) {
                    e.cooldown = 0;
                }

                if (this.game.time.now > e.cooldown) {
                    e.cooldown = this.game.time.now + 100;

                    let bullet = this.enemyBullets.getFirstExists(false);

                    if (bullet) {
                        bullet.reset(e.x, e.y);
                        let freq = 0.4;
                        let amplitude = 200;

                        bullet.body.velocity.y = Math.sin((this.game.time.now / 1000) * 2 * Math.PI * freq) * amplitude;
                        bullet.body.velocity.x = -Math.abs(Math.cos((this.game.time.now / 1000) * 2 * Math.PI * freq) * amplitude);
                    }
                }
            }
        }, this);
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
        const debugBoss = false;
        let y = 60;
        let x = 666;

        if (debugBoss) {
            this.createExcavator(3 * x, 8 * y);
        } else {
            for (let i = 4; i <= 30; i++) {
                this.createLumberjack(i * x, 6 * y);
                this.createLumberjack((i + 0.2) * x, 7 * y);
            }

            this.createHunter(2 * x, 10 * y);
            this.createHunter(4 * x, 10 * y);
            this.createHunter(6 * x, 10 * y);
            this.createHunter(8 * x, 10 * y);
            this.createHunter(10 * x, 10 * y);
            this.createHunter(12 * x, 10 * y);
            this.createHunter(14 * x, 10 * y);

            /* TODO: camion */

            this.createMeteor(1 * x, -2.5 * y);
            this.createMeteor(4 * x, -2.5 * y);
            this.createMeteor(7 * x, -2.5 * y);
            this.createMeteor(10 * x, -2.5 * y);
            this.createMeteor(13 * x, -2.5 * y);

            this.createChopper(3 * x, 5 * y);
            this.createChopper(4 * x, 5 * y);
            this.createChopper(5 * x, 5 * y);
            this.createChopper(6 * x, 5 * y);
            this.createChopper(7 * x, 5 * y);
            this.createChopper(8 * x, 5 * y);
            this.createChopper(9 * x, 5 * y);
            this.createChopper(10 * x, 5 * y);
            this.createChopper(11 * x, 5 * y);
            this.createChopper(12 * x, 5 * y);
            this.createChopper(13 * x, 5 * y);

            this.createExcavator(14 * x, 8 * y);
        }
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
            // Will be re-enabled in control handler if necessary
            this.player.shieldEnabled = false;


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

            if (this.player.alternateCharacter == false) {
                if (this.mainGunButton.isDown) {
                    if (this.game.time.now > this.missileCooldown) {
                        this.fireBullet(null, 0, 'missile');
                        this.missileCooldown = this.game.time.now + 500;
                    }
                } else if (this.secondGunButton.isDown) {
                    if (this.game.time.now > this.flameCooldown) {
                        this.fireBullet((b) => {
                            b.scale.setTo(1, 1 + 10 * (this.game.time.now - b.fireTime) / 1000);
                        }, 0, 'fireball');
                        this.flameCooldown = this.game.time.now + 3000;
                    }
                }
            } else {
                if (this.mainGunButton.isDown) {
                    if (this.game.time.now > this.waveCooldown) {
                        this.fireBullet((b) => {
                            let angle = 2 * 1 * Math.PI * (this.game.time.now - b.fireTime) / 1000;
                            let vel = 500 * Math.sin(angle);
                            b.body.velocity.y = vel;
                        }, 0, 'ice');
                        this.waveCooldown = this.game.time.now + 200;
                    }
                } else if (this.secondGunButton.isDown) {
                    if (this.player.shieldEnergy >= 0) {
                        this.player.shieldEnabled = true;
                        this.player.shieldEnergy--;
                    }
                } else if (this.secondGunButton.isUp) {
                    if (this.player.shieldEnergy < this.player.shieldEnergyMax) {
                        this.player.shieldEnergy++;
                    }
                }
            }

            this.player.shooting = this.mainGunButton.isDown || this.secondGunButton.isDown;

            /* Apply tint if we recently got hit. */
            if (this.game.time.now < this.player.deathCooldown) {
                this.player.tint = 0xff0000;
            } else if (this.player.shieldEnabled) {
                this.player.tint = 0x0000ff;
            } else {
                this.player.tint = 0xffffff;
            }

            // Update shield text
            this.shieldText.text = "Shield: " + this.player.shieldEnergy;

            //  Run collision
            this.game.physics.arcade.overlap(this.bullets, this.ennemies, this.collisionHandler, null, this);
            this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.hitPlayer, null, this);
            this.game.physics.arcade.overlap(this.player, this.ennemies, this.hitEnemy, null, this);
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

    hitEnemy: function (player) {
        if (this.game.time.now < player.deathCooldown) {
            return;
        }

        let explosion = this.explosions.getFirstExists(false);
        explosion.reset(player.body.x, player.body.y);
        explosion.play('kaboom', 16, false, true);

        if (this.player.shieldEnabled == false) {
            this.remainingLives--;
            if (this.remainingLives == 0) {
                this.game.state.start("Credits");
            }

            player.deathCooldown = this.game.time.now + 1000;
            this.game.camera.shake(0.02, 100);

            /* Remove all enemy bullets. */
            this.enemyBullets.callAll('kill');
        }
    },

    hitPlayer: function (player, enemy) {
        if (this.game.time.now < player.deathCooldown) {
            return;
        }

        enemy.kill();

        //  And create an explosion :)
        let explosion = this.explosions.getFirstExists(false);
        explosion.reset(player.body.x, player.body.y);
        explosion.play('kaboom', 16, false, true);

        if (this.player.shieldEnabled == false) {
            this.remainingLives--;
            if (this.remainingLives == 0) {
                this.music.fadeOut(500);
                this.game.add.tween(this.game.world)
                    .to( { alpha: 0 }, 500, "Linear", true )
                    .onComplete.add(() => {
                        this.game.state.start("Credits");
                    }, this);
            }

            player.deathCooldown = this.game.time.now + 1000;
        }
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
            bullet.outOfBoundsKill = true;
            bullet.checkWorldBounds = true;

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

}

module.exports = gameState;
