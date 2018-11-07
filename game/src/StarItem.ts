module Bachelorarbeit {
    export class StarItem extends Item {
        constructor(game: Phaser.Game, gameState: IGame, collectors: IStrikeable[]) {
            super(game, gameState, Config.ITEM_STAR, collectors, ItemType.STAR);
        }
    }
}