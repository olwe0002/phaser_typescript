module Bachelorarbeit {

    export enum BoatState { IDLE, DRIVING, DEAD };

    export abstract class Boat extends Phaser.Sprite implements IStrikeable {

        protected gameState: IGame;
        protected inGame: InGame;

        protected boatState: BoatState = BoatState.IDLE;
        protected waves: Phaser.Sprite;
        protected cannon: Phaser.Sprite;
        protected explosion: Phaser.Sprite;
        protected tweenIn: Phaser.Tween;
        protected tweenOut: Phaser.Tween;

        //Gegner des Bootes
        protected enemies: IStrikeable[] = [];

        //Kanone
        protected reloadTime: number = 1; //Sekunden
        protected nextShotTime: number = 0;
        protected shotSound: Phaser.Sound;

        //Bewegung
        protected currentSpeed: number = 0;
        protected maximumSpeed: number = 200;
        protected doubledSpeed: boolean = false;
        protected itemDuration: number = 5; //Sekunden
        protected movementIntensity: number = 3; //Grad pro Frame

        //Lebenspunkte und Name sowie Anzeigeposition
        protected hitcount: number = 0;
        protected deadcount: number = 4;
        protected isInvulnerable: boolean = false;


        //Anzeigetext
        protected boatName: string;
        protected infoText: Phaser.Text;
        protected infoTextPoint: Phaser.Point = null;

        protected explosionAnimation: Phaser.Animation;
        protected deadSpriteFrame: string;
        protected explosionSound: Phaser.Sound;

        protected collectSound: Phaser.Sound;

        getBodySprite() {
            return this;
        }

        constructor(game: Phaser.Game, gameState: IGame, startPoint: Phaser.Point, boatImage: string, boatName: string, infoTextPoint: Phaser.Point) {
            super(game, startPoint.x, startPoint.y, Config.INGAME.getKey(), boatImage);

            this.boatName = boatName;
            this.gameState = gameState;
            this.infoTextPoint = infoTextPoint;

            //Größe des Boots halbieren
            this.scale.setTo(0.5);
            //Anker auf den Mittelpunkt des Bootes setzen
            this.anchor.setTo(0.5, 0.5);

            //ARCADE Physik für Boot aktivieren
            game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.collideWorldBounds = true;

            //wellen für Animation beim Fahren erstellen
            this.waves = this.game.add.sprite(this.x, this.y, Config.INGAME.getKey());
            //Eigenschaften von Boot übernehmen
            this.waves.anchor.setTo(0.6, this.anchor.y);
            this.waves.scale.setTo(this.scale.x, this.scale.y);
            this.waves.animations.add(Config.INGAME.getKey(), Config.BOAT_WAVES, 30);

            //Kanone erstellen
            this.cannon = this.game.add.sprite(this.x, this.y, Config.INGAME.getKey(), Config.BOAT_CANON);
            this.cannon.anchor.setTo(this.anchor.x, this.anchor.y);
            this.cannon.scale.setTo(this.scale.x * 1.5, this.scale.y * 1.5);

            //Boot zur Welt hinzufügen
            game.add.existing(this);

            //sicherstellen dass die Sprites in der richtigen Reihenfolge angezeigt werden
            this.waves.bringToTop();
            this.bringToTop();
            this.cannon.bringToTop();

            //Anzeigetext initialisieren und aktualisieren
            this.initText();
            this.updateText();

            //Soundobjekte hinzufügen
            this.shotSound = this.game.add.audio(Config.SHOT_SOUND.getKey(), 0.1, false);
            this.explosionSound = this.game.add.audio(Config.EXPLOSION_SOUND.getKey(), 1, false);
            this.collectSound = this.game.add.audio(Config.ITEM_SOUND.getKey(), 1, false);

            //Sprite und Animation für Explosion
            this.explosion = this.game.add.sprite(this.x, this.y, Config.EXPLOSION.getKey());
            this.explosion.visible = false;
            this.explosion.anchor.set(0.5);
            this.explosionAnimation = this.explosion.animations.add(Config.EXPLOSION.getKey(), Phaser.ArrayUtils.numberArray(1, Config.EXPLOSION_FRAME_COUNT), 15);
            this.explosionAnimation.onComplete.add(this.setExplosionInvisible, this);
        }

        private setExplosionInvisible() {
            //ist notwendig, da in wenigen Fällen der letzte Frame der Animation ansonsten weiterhin sichtbar bleibt
            this.explosion.visible = false;
        }

        protected initText() {
            if (this.infoTextPoint == null) {
                return;
            }
            this.infoText = this.game.add.text(this.infoTextPoint.x, this.infoTextPoint.y, "", Config.TEXT_STYLE);
            this.infoText.lineSpacing = 20;
            //text horizontal zentrieren
            this.infoText.anchor.set(0.5);
            this.infoText.fontWeight = "bold";
            this.infoText.align = "center";
            this.infoText.stroke = "#000000";
            this.infoText.strokeThickness = 3;
        }

        public addEnemy(enemy: IStrikeable) {
            this.enemies.push(enemy);
        }

        protected fire(point: Phaser.Point) {
            //Wenn Kanone geladen ist, feuern
            if (this.isReadyForShooting()) {
                let bullet = new Bullet(this.game, this.enemies, this.cannon.position, this.gameState);
                bullet.moveTo(point);
                this.shotSound.play();
            }
        }



        protected updateText() {
            if (this.infoTextPoint == null) {
                return;
            }

            let healthPoints = 100;
            let hitPoints = 33;
            healthPoints -= this.hitcount * hitPoints;
            if (healthPoints < 0) {
                healthPoints = 0;
            }
            let text: string;
            text = this.boatName + "\n";
            let startPos: number;
            startPos = text.length - 1;
            text += String(healthPoints) + " %";
            this.infoText.setText(text);
            let color: string;
            switch (this.hitcount) {
                case 0: {
                    color = "#00ff00"; //Grün
                    break;
                }
                case 1: {
                    color = "#ff9900"; //Orange
                    break;
                }
                case 2: {
                    color = "#ff0000"; //Rot
                    break;
                }
                case 3: {
                    color = "#990000"; //DunkelRot
                    break;
                }
                default: {
                    color = "#000000"; //Schwarz;
                }
            }
            this.infoText.addColor(color, startPos);
        }

        private resetVulnerable() {
            this.isInvulnerable = false;
        }
        private resetSpeed() {
            this.doubledSpeed = false;
            this.maximumSpeed = this.maximumSpeed / 2;
        }

        protected break() {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= this.maximumSpeed / 20;
            }
        }

        public hitByBullet() {

            //Verlassen der Methode, wenn Boot unverwundbar oder bereits zerstört ist
            if ((this.boatState == BoatState.DEAD) || (this.isInvulnerable)) {
                return;
            }

            this.hitcount++;

            if (this.hitcount >= this.deadcount) {
                //Status aktualisieren
                this.boatState = BoatState.DEAD;
                this.stopWaveAnimation();
                //Boot bewegungsunfähig setzen
                this.currentSpeed = 0;
                this.body.immovable = true;
                this.body.moves = false;
                //Nach Beenden der Animation Spiel beenden
                this.explosionAnimation.onComplete.add(this.callGameUpdate, this);
                //Schießen deaktivieren: Zeitpunkt auf das Maximum setzen
                this.nextShotTime = Number.MAX_VALUE;
                //Grafik durch zerstörtes Boot ersetzten
                this.frameName = this.deadSpriteFrame;
            }
            this.hitAnimation();
            this.updateText();
        }

        protected hitAnimation() {
            //Position der Explosion auf die aktuelle Position des Bootes setzen und sichtbar machen
            this.explosion.x = this.x;
            this.explosion.y = this.y;
            this.explosion.bringToTop();
            this.explosion.visible = true;
            //Sound abspielen
            this.explosionSound.play();
            //Animation abspielen
            this.explosionAnimation.play();
        }

        protected callGameUpdate() {
            //An den übergeordneten GameState die Zerstörung zurückmelden
            this.gameState.updateGame(this);
        }

        protected isReadyForShooting(): boolean {
            //Prüfen ob aktuelle Zeit größer als die festgelegte Zielzeit ist
            if (this.game.time.now > this.nextShotTime) {
                //Zielzeit für den nächsten Schuss festlegen
                this.nextShotTime = this.game.time.now + (this.reloadTime * Phaser.Timer.SECOND);
                return true;
            } else {
                return false;
            }
        }

        protected updateSpritesPositions() {
            this.updateSpritePosition(this.waves, false);
            this.updateSpritePosition(this.cannon, true);
        }

        protected updateSpritePosition(sprite: Phaser.Sprite, cannon: boolean) {
            //Position übernehmen
            sprite.x = this.x;
            sprite.y = this.y;
            if (!cannon) {
                //Winkel übernehmen
                sprite.rotation = this.rotation;
            }
        }



        public itemCollected(itemType: ItemType) {
            this.collectSound.play();

            if (itemType == ItemType.MEDI) {
                //Lebenspunkte zurücksetzen
                this.hitcount = 0;
                this.updateText();
            } else if (itemType == ItemType.SPEED) {
                //Geschwindigkeit erhöhen
                if (!this.doubledSpeed) {
                    this.maximumSpeed *= 2;
                    this.doubledSpeed = true;
                }
                //Time-Event zum zurücksetzen setzen
                this.game.time.events.add(Phaser.Timer.SECOND * this.itemDuration, this.resetSpeed, this);
            } else if (itemType == ItemType.STAR) {
                //Unverwundbar setzen
                this.isInvulnerable = true;
                //Time-Event zum zurücksetzen setzen
                this.game.time.events.add(Phaser.Timer.SECOND * this.itemDuration, this.resetVulnerable, this);
            }


        }

        protected onCollideWithLand(boat: Boat, layer: Phaser.TilemapLayer) {
            //Boot soll immer kollidieren, eine Aktion wird aber nur bei Enemy eingeleitet, daher hier leere Implementierung
        }

        private stopWaveAnimation(): void {
            //Wellenanimation stoppen
            this.waves.animations.stop(Config.INGAME.getKey());
            //Wellen ausblenden
            this.tweenOut = this.game.add.tween(this.waves).to({ alpha: 0 }, 50, Phaser.Easing.Linear.None, true);
        }

        update() {
            //Infotext soll immer im Vordergrund angezeigt werden
            this.infoText.bringToTop();

            //Kollision mit Festland herbeiführen
            this.game.physics.arcade.collide(this, this.gameState.getCollisionLayer(), this.onCollideWithLand, null, this);

            //Bei Kollision mit Gegner Physik beachten (rammen wird dadurch aktiv)
            this.game.physics.arcade.collide(this, this.enemies);

            //Postion der mit dem Boot verbundenen Sprites mit dem Boot synchronisieren
            this.updateSpritesPositions();

            //feststellen ob Boot am fahren ist
            if (this.currentSpeed > 0) {
                this.boatState = BoatState.DRIVING;
                //Wellen einblenden
                this.tweenIn = this.game.add.tween(this.waves).to({ alpha: 1 }, 20, Phaser.Easing.Linear.None, true);
                //Wellenanimation starten
                this.waves.animations.play(Config.INGAME.getKey(), 15, true);

                //Sprite in Richtung bewegen, abhängig vom Winkel (1. Param in Grad) in der Geschwindigkeit (2. Param) und in den Zielpunkt (3. Param)
                this.game.physics.arcade.velocityFromAngle(this.angle, this.currentSpeed, this.body.velocity);
            } else {
                this.stopWaveAnimation();

                //Bewegung stoppen
                this.body.velocity.x = 0;
                this.body.velocity.y = 0;
            }



        }





    }
}
