module Bachelorarbeit {

    export interface IStrikeable {
        getBodySprite(): Phaser.Sprite;
        hitByBullet(): void;
        itemCollected(itemType: ItemType): void;
    }

    export interface IGame {
        updateGame(deadBoat: Boat): void;
        getCollisionLayer(): Phaser.TilemapLayer;
    }

}