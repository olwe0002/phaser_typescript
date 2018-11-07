module Bachelorarbeit {


    export class Enemy extends Boat {

        private movementDelay: number = 2; //Sekunden
        private nextMovementTime: number = 0;
        private targetAngle: number;
        private dodgeActive: boolean = false;
        private breakingEnabled: boolean = false;
        private aimPoint: Phaser.Point;

        constructor(game: Phaser.Game, gameState: IGame, startPoint: Phaser.Point, boatName: string, infoTextPoint?: Phaser.Point) {

            super(game, gameState, startPoint, Config.BOAT_ENEMY, boatName, infoTextPoint);

            //Ausrichtung nach Links
            this.angle = -180;

            //Callback für Kollision mit WorldBounds setzen
            this.body.onWorldBounds = new Phaser.Signal();
            this.body.onWorldBounds.add(this.collideWorldBounds, this);

            //Sprite für Boot nach Zerstörung festlegen
            this.deadSpriteFrame = Config.BOAT_ENEMY_DEAD;

            //Verzögerung für erstes schießen zufällig zwischen 0 und einer Sekunde setzen, damit nicht alle Gegner gleichzeitig schießen
            this.nextShotTime = this.game.time.now + Phaser.Math.random(0, Phaser.Timer.SECOND);

            //Punkt zum Zielen auf Gegner erstellen
            this.aimPoint = new Phaser.Point();
        }

        private collideWorldBounds(sprite: Phaser.Sprite) { //Parameter ist notwendig damit die Methode aufgerufen wird, auch wenn er nicht verwendet wird

            if (this.dodgeActive) { //Boot ist im Ausweichmodus erneut kollidiert -> neue zufällige Bewegung ermöglichen
                this.setMovementReady();
            } else {
                //Fahrtrichtung umkehren
                this.rotation = Phaser.Math.reverseAngle(this.rotation);
                //Zielwinkel auf den gleichen Winkel setzen
                this.targetAngle = this.angle;
                //Änderungen der Fahrtrichtung für kurze Zeit deaktivieren
                this.dodgeActive = true;
                this.setDelayForTurning();
            }

        }

        private setDelayForTurning() {
            this.nextMovementTime = this.game.time.now + (this.movementDelay * Phaser.Timer.SECOND);
        }
        private setShortDelayForTurning() {
            this.nextMovementTime = this.game.time.now + ((this.movementDelay * Phaser.Timer.SECOND) / 5);
        }
        private setMovementReady() {
            this.nextMovementTime = 0;
        }

        private isReadyForMoving(): boolean {
            return this.game.time.now >= this.nextMovementTime;
        }


        protected onCollideWithLand(boat: Boat, layer: Phaser.TilemapLayer) {
            //sofortige Drehung um 90 Grad. Der Zufall entscheidet ob rechts- oder linksherum
            if (Phaser.Utils.chanceRoll(50)) {
                this.angle += 90;
                this.targetAngle += 90;
            } else {
                this.angle -= 90;
                this.targetAngle -= 90;
            }
            this.dodgeActive = true;
            this.setShortDelayForTurning();
        }


        public hitByBullet() {
            super.hitByBullet();
            //neue Bewegung ermöglichen, um ausweichen zu können
            this.setMovementReady();
        }



        update() {

            //Wenn Boot noch nicht zerstört ist und schon Gegner existieren, ansonsten verlassen
            if (this.boatState == BoatState.DEAD || this.enemies.length == 0) {
                return;
            }

            //Anhalten eingeleitet, weiter Geschwindigkeit reduzieren
            if (this.breakingEnabled) {
                this.break();
            }

            if (this.isReadyForMoving()) { //Boot ist bereit für Anpassung der Fahrtrichtung und Geschwindigkeit
                //Ausweichmodus nicht mehr aktiv
                this.dodgeActive = false;

                //Entscheidung ob Boot zufällig stoppen soll
                if (Phaser.Utils.chanceRoll(90)) {
                    //Fahren mit voller Geschwindigkeit
                    this.currentSpeed = this.maximumSpeed;
                    this.breakingEnabled = false;

                    //Fahrtrichtung festlegen
                    if (Phaser.Utils.chanceRoll(90)) {
                        //Zielwinkel Richtung Spieler setzen
                        this.targetAngle = Phaser.Math.radToDeg(this.game.physics.arcade.angleBetween(this, this.enemies[0]));
                    } else {
                        //Zufälliger Zielwinkel
                        this.targetAngle = this.game.rnd.angle();
                    }

                } else {
                    //Anhalten
                    this.breakingEnabled = true;
                }

                //Fahrparameter temporär einfrieren
                this.setDelayForTurning();
            }

            //Wenn Boot fährt, Winkel anpassen
            if (this.currentSpeed > 0) {
                //Aktuellen Winkel in Richtung Zielwinkel anpassen
                this.rotation = Phaser.Math.rotateToAngle(this.rotation, Phaser.Math.degToRad(this.targetAngle), Phaser.Math.degToRad(this.movementIntensity));
            }

            //feuern
            this.fire();

            //update() der Basisklasse aufrufen
            super.update();
        }

        protected fire() {

            //Zufällige Ungenauigkeit ergänzen
            let inaccuracy = Phaser.Math.random(-15, 15);
            this.aimPoint.setTo(this.enemies[0].getBodySprite().position.x + inaccuracy, this.enemies[0].getBodySprite().position.y + inaccuracy);

            //Kanone optisch auf Zielpunkt ausrichten
            this.cannon.rotation = this.game.physics.arcade.angleToXY(this, this.aimPoint.x, this.aimPoint.y)
            //Schuss auf Zielpunkt
            super.fire(this.aimPoint);
        }

    }
}