module Bachelorarbeit {
    export class MediItem extends Item {
        constructor(game: Phaser.Game, gameState: IGame, collectors: IStrikeable[]) {
            super(game, gameState, Config.ITEM_MEDI, collectors, ItemType.MEDI);
        }
    }
}