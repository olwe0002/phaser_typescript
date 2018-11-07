module Bachelorarbeit {

    export class Menu extends Phaser.State {


        private logo: Phaser.Sprite;
        private tween: Phaser.Tween;
        private title: Phaser.Text;
        private options: Phaser.Text;
        private difficulty: Difficulty;
        private enterKey: Phaser.Key;
        private upKey: Phaser.Key;
        private downKey: Phaser.Key;

        constructor() {
            super();
        }

        //Ersatzfunktion da Standard-Modulo Funktion in JS auch negative Werte liefern kann
        private posModulo(a, b: number): number {
            return ((a % b) + b) % b;
        }

        create() {
            //Default Schwierigkeit setzen
            this.difficulty = Difficulty.MEDIUM;

            //Hintergrundfarbe setzen
            this.stage.setBackgroundColor(Config.BACKGROUND_COLOR);

            //Logografik hinzufügen
            this.logo = this.add.sprite(this.world.centerX, this.world.centerY - 200, Config.LOGO.getKey());
            //alpha = opacity (Deckkraft) auf 0 setzen
            this.logo.alpha = 0;
            this.logo.anchor.setTo(0.5, 0.5);
            //Grafik verkleinern
            this.logo.scale.setTo(0.8);

            //Text für Titel erstellen
            this.title = this.game.add.text(this.game.world.centerX, 100, Config.GAME_TITLE, Config.TEXT_STYLE_MENU);
            //Schriftattribute setzen
            this.title.fontWeight = "bold";
            this.title.fontSize = 150;
            this.title.stroke = "#000000";
            this.title.strokeThickness = 4;
            //Text horizontal zentrieren
            this.title.anchor.set(0.5);
            //Logo einblenden über Tween
            this.tween = this.game.add.tween(this.logo).to({ alpha: 1 }, 2000, Phaser.Easing.Linear.None, true);

            //Text für Auswahlmenü erstellen
            this.options = this.game.add.text(this.game.world.centerX, this.game.world.centerY + 250, "", Config.TEXT_STYLE);
            //Schriftattribute setzen
            this.options.fontSize = 50;
            //Text horizontal zentrieren
            this.options.anchor.set(0.5);
            this.options.align = "center";

            //Tastatur Bindings
            this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
            this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            //Callback Funktionen setzen
            this.enterKey.onDown.add(this.startGame, this);
            this.upKey.onDown.add(this.changeSelected, this);
            this.downKey.onDown.add(this.changeSelected, this);

            //initial aufrufen um default-Auswahl anzuzeigen
            this.changeSelected(null);
        }

        private changeSelected(key: Phaser.Key) {
            if (key == this.upKey) {
                this.difficulty--;
            } else if (key == this.downKey) {
                this.difficulty++;
            }
            //Die Auswahl auf einen Bereich von 0-2 bringen
            this.difficulty = this.posModulo(this.difficulty, 3);
            //Text setzen
            this.options.text = Config.MENU_OPTIONS.join("\n");
            //Aktuelle Auswahl markieren mit einem > Zeichen
            this.options.text = this.options.text.replace(Config.MENU_OPTIONS[this.difficulty], "> " + Config.MENU_OPTIONS[this.difficulty]);
        }

        private startGame() {
            //Übergabe der ausgewählten Schwierigkeit an den Ingame Gamestate
            this.game.state.states[Config.INGAME_STATE].difficulty = this.difficulty;
            //Starten des InGame States
            this.game.state.start(Config.INGAME_STATE, true, false);

        }

    }

}