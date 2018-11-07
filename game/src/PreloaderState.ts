module Bachelorarbeit {

    export class Preloader extends Phaser.State {

        private group: Phaser.Group;
        private text: Phaser.Text;
        private loader: Phaser.Sprite;

        constructor() {
            super();
        }

        preload() {
            //Callback für Lade-Start setzen
            this.game.load.onLoadStart.add(this.startLoad, this);

            //Assets laden
            this.game.load.image(Config.LOGO.getKey(), Config.LOGO.getImage());
            this.game.load.spritesheet(Config.EXPLOSION.getKey(), Config.EXPLOSION.getImage(), Config.EXPLOSION_FRAME_SIZE, Config.EXPLOSION_FRAME_SIZE, Config.EXPLOSION_FRAME_COUNT);
            this.game.load.audio(Config.INGAME_SOUND.getKey(), Config.INGAME_SOUND.getAudio(), true);
            this.game.load.audio(Config.SHOT_SOUND.getKey(), Config.SHOT_SOUND.getAudio(), true);
            this.game.load.audio(Config.EXPLOSION_SOUND.getKey(), Config.EXPLOSION_SOUND.getAudio(), true);
            this.game.load.audio(Config.ITEM_SOUND.getKey(), Config.ITEM_SOUND.getAudio(), true);

            this.game.load.tilemap(Config.GAME_MAP.getKey(), Config.GAME_MAP.getJSON(), null, Phaser.Tilemap.TILED_JSON);
            //Tilmap zusätzlich als JSON laden, um den JSON Text zu erhalten
            this.game.load.json(Config.GAME_MAP.getKey(), Config.GAME_MAP.getJSON());
            this.game.load.image(Config.GAME_MAP_PLANTS.getKey(), Config.GAME_MAP_PLANTS.getImage());
            this.game.load.image(Config.GAME_MAP_REED.getKey(), Config.GAME_MAP_REED.getImage());
            this.game.load.image(Config.GAME_MAP_SANDWATER.getKey(), Config.GAME_MAP_SANDWATER.getImage());

            //Debug für künstliche Verzögerung:
            //this.load.audio(Config.BIGFILE_SOUND.getKey(), Config.BIGFILE_SOUND.getAudio(), true);
            this.game.load.atlasJSONArray(Config.INGAME.getKey(), Config.INGAME.getImage(), Config.INGAME.getJSON());
        }

        startLoad() {
            //Callback für Fertigstellung des Ladevorgangs setzen
            this.game.load.onLoadComplete.add(this.loadComplete, this);

            //Text erstellen
            this.text = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 70, Config.LOADING_TEXT, Config.TEXT_STYLE);
            //Text horizontal zentrieren
            this.text.anchor.set(0.5);
            //Lade-spinner erstellen
            this.loader = this.add.sprite(this.game.world.centerX, this.game.world.centerY, Config.LOADER.getKey());
            //Lade-spinner zentrieren
            this.loader.anchor.set(0.5);
            //Animation hinzufügen und starten
            this.loader.animations.add(Config.LOADER.getKey(), Config.LOADER_IMAGES);
            this.loader.animations.play(Config.LOADER.getKey(), 15, true);  //halbe Geschwindigkeit 

            //Gruppe für Tween erstellen und Text und Lade-spinner hinzufügen
            this.group = this.game.add.group();
            this.group.add(this.text);
            this.group.add(this.loader);
        }


        loadComplete() {
            //Animation stoppen
            this.loader.animations.stop(Config.LOADER.getKey());
            //Text ändern
            this.text.setText(Config.LOADING_COMPLETE_TEXT);
            //Text neu zentrieren, da breite sich geändert hat
            this.text.anchor.set(0.5);
            //Tween zum fade-out erstellen, alpha = opacity (Deckkraft)
            let tween = this.add.tween(this.group).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
            //Callback für Fertigstellung der Tween-Änderung setzen
            tween.onComplete.add(this.startMenu, this);
        }

        private startMenu() {
            this.game.state.start(Config.MENU_STATE, true, false);
        }

    }

}