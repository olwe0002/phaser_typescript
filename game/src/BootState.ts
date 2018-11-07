module Bachelorarbeit {

    export class Boot extends Phaser.State {

        constructor() {
            super();
        }

        preload() {
            //Lade-Grafik für Preloader laden
            this.game.load.atlasJSONArray(Config.LOADER.getKey(), Config.LOADER.getImage(), Config.LOADER.getJSON());
            //beim Resizen des Browser Fensters alle Inhalte des Spiels anpassen
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            //Boden des Browserfensters als Grenze betrachten, damit beim Resize immer das Ganze Spiel sichtbar bleibt.
            this.game.scale.windowConstraints.bottom = "visual";
            //Spiel horizontal und vertikal zentriert anzeigen
            this.game.scale.pageAlignHorizontally = true;
            this.game.scale.pageAlignVertically = true;
            this.game.scale.refresh();
        }

        create() {
            //Anzahl Mauszeiger auf 1 limitieren (kein Multitouch notwendig)
            this.input.maxPointers = 1;

            //Preloader aufrufen
            this.game.state.start(Config.PRELOAD_STATE, true, false);
        }



    }
}