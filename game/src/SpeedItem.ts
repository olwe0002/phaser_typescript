module Bachelorarbeit {
    export class SpeedItem extends Item {
        constructor(game: Phaser.Game, gameState: IGame, collectors: IStrikeable[]) {
            super(game, gameState, Config.ITEM_SPEED, collectors, ItemType.SPEED);
        }
    }
}