
module Bachelorarbeit {

    //export class Bullet extends Phaser.Bullet {
    export class Bullet extends Phaser.Sprite {

        private targets: IStrikeable[] = []; //Alle potentiellen treffbaren Ziele
        private gameState: IGame; //für Kollision mit Festland

        constructor(game: Phaser.Game, targets: IStrikeable[], startPoint: Phaser.Point, gameState: IGame) {

            super(game, startPoint.x, startPoint.y, Config.INGAME.getKey(), Config.BULLET);

            this.targets = targets;
            this.gameState = gameState;

            //ARCADE Physik für Kugel aktivieren
            game.physics.enable(this, Phaser.Physics.ARCADE);

            //Größe der Kugel verkleinern
            this.scale.setTo(0.4);

            //Anker auf den Mittelpunkt setzen
            this.anchor.setTo(0.5, 0.5);

            //Kugel kann Spielwelt verlassen und wird automatisch zuerstört
            this.checkWorldBounds = false;
            this.outOfBoundsKill = true;

            //Kugel zur Welt hinzufügen
            game.add.existing(this);

            //Kugel eine Ebene nach hinten setzen.
            this.moveDown();
        }

        public moveTo(point: Phaser.Point) {
            this.game.physics.arcade.moveToXY(this, point.x, point.y, 500);
        }

        update() {
            //Überschneidungen zwischen Kugel und den beiden Akteuren prüfen und physikalische Kollision auslösen
            this.game.physics.arcade.collide(this, this.targets, this.hitTarget, null, this);
            //Kollision mit Festland
            this.game.physics.arcade.collide(this, this.gameState.getCollisionLayer(), this.hitLand, null, this);
        }

        private hitLand(bullet: Bullet, inGame: IGame) {
            //Kugel entfernen
            this.kill();
        }

        private hitTarget(bullet: Bullet, target: IStrikeable) {
            //Handler im IStrikeable-Objekt aufrufen
            target.hitByBullet();
            //Kugel entfernen
            this.kill();
        }

    }
}