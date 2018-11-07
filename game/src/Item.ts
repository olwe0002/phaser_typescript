module Bachelorarbeit {

    export enum ItemType { MEDI, SPEED, STAR };

    export abstract class Item extends Phaser.Sprite {
        protected gameState: IGame;
        protected collectors: IStrikeable[];
        protected itemType: ItemType;

        constructor(game: Phaser.Game, gameState: IGame, itemImage: string, collectors: IStrikeable[], itemType: ItemType) {
            //Zufällige Postion übergeben, welche innerhalb der Teilmap liegt
            super(game, Phaser.Math.random(0, gameState.getCollisionLayer().map.width) * gameState.getCollisionLayer().map.tileWidth, Phaser.Math.random(0, gameState.getCollisionLayer().map.height) * gameState.getCollisionLayer().map.tileHeight, Config.INGAME.getKey(), itemImage);

            this.gameState = gameState;
            this.collectors = collectors;
            this.itemType = itemType;

            //ARCADE Physik für Item aktivieren
            game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.collideWorldBounds = true;

            //Item unsichtbar erstellen, um es später mit Tween einzublenden
            this.scale.setTo(0);

            //Item zur Welt hinzufügen
            game.add.existing(this);

            //Item einblenden
            this.game.add.tween(this.scale).to({ x: 1, y: 1 }, 2000, Phaser.Easing.Elastic.Out, true);
        }



        update() {

            //Prüfen ob die darunterliegende Kachel für Kollision vorgesehen ist
            //physics.arcade.overlap/collide sind nicht möglich, da diese nur über Bewegungen der Physik Engine getriggert werden
            if (this.gameState.getCollisionLayer().map.getTile(this.gameState.getCollisionLayer().getTileX(this.x), this.gameState.getCollisionLayer().getTileY(this.y), this.gameState.getCollisionLayer(), true).collides) {
                this.setNewRandomPosition();
            }

            //über Overlap prüfen ob Überschneidung zwischen Item und Sammlern vorliegt
            this.game.physics.arcade.overlap(this, this.collectors, this.collected, null, this);
        }

        private setNewRandomPosition() {
            //neue zufällige Position setzen
            this.x = Phaser.Math.random(0, this.gameState.getCollisionLayer().map.width) * this.gameState.getCollisionLayer().map.tileWidth;
            this.y = Phaser.Math.random(0, this.gameState.getCollisionLayer().map.height) * this.gameState.getCollisionLayer().map.tileHeight;
        }


        private collected(item: Item, collector: IStrikeable) {
            //Handler im IStrikeable-Objekt aufrufen
            collector.itemCollected(this.itemType);
            //Item entfernen
            this.kill();
        }
    }

}
