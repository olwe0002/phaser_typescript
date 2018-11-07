module Bachelorarbeit {


    export class Player extends Boat {

        private curserKeys: Phaser.CursorKeys;

        constructor(game: Phaser.Game, gameState: IGame, startPoint: Phaser.Point, infoTextPoint?: Phaser.Point) {

            super(game, gameState, startPoint, Config.BOAT_PLAYER, "Player", infoTextPoint);
            //Tastatur Bindings in einem Objekt (statt allen 4 Tasten einzeln)
            this.curserKeys = game.input.keyboard.createCursorKeys();
            this.deadSpriteFrame = Config.BOAT_PLAYER_DEAD;
        }

        protected fire() {
            //Zielposition ist aktueller Mauszeiger
            super.fire(this.game.input.activePointer.position);
        }

        update() {

            if (this.boatState == BoatState.DEAD) {
                //Verlassen der Methode, damit keine Steuerung (Drehung auf aktueller Position) mehr möglich ist
                return;
            }

            //Kanone des Bootes in Richtung des Mauszeigers ausrichten
            this.cannon.rotation = this.game.physics.arcade.angleToPointer(this.cannon);
            if (this.game.input.activePointer.isDown) {
                this.fire();
            }

            //Bewegung steuern
            //Fahrtrichtung ändern
            if (this.curserKeys.right.isDown) {
                this.angle += this.movementIntensity;
            }
            else if (this.curserKeys.left.isDown) {
                this.angle -= this.movementIntensity;
            }
            //Geschwindigkeit setzen
            if (this.curserKeys.up.isDown) {
                this.currentSpeed = this.maximumSpeed;
            } else { //ausgleiten lassen
                if (this.currentSpeed > 0) {
                    this.currentSpeed -= this.maximumSpeed / 50;
                } else {
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                }
            }
            //bremsen
            if (this.curserKeys.down.isDown) {
                this.break();
            }

            //update() der Basisklasse aufrufen
            super.update();

        }

    }

}