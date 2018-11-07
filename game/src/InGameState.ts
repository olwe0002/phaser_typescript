module Bachelorarbeit {

    //todo wirklich alle optionen texte usw in config auslagern

    export enum Difficulty { EASY, MEDIUM, DIFFICULT };

    export class InGame extends Phaser.State implements IGame {

        private music: Phaser.Sound;
        private player: Player;
        private enemies: Enemy[] = [];
        private allStrikeableObjects: IStrikeable[] = [];
        private map: Phaser.Tilemap;
        private landLayer: Phaser.TilemapLayer;
        private plantsLayer: Phaser.TilemapLayer;
        private difficulty: Difficulty;
        private enemiesAlive: number;
        private itemFactor: number = 10;
        private newItemRepeatTime: number = 3; //Sekunden

        constructor() {
            super();
        }

        private getMaxTileId(): number {
            //JSON Objekt laden (bewusst ohne konkreten Datentyp, da genaue Struktur unbekannt)
            let json = this.game.cache.getJSON(Config.GAME_MAP.getKey());
            //durch die Layer iterieren
            let layers = json[Config.LAYERS_ATTRIBUTE_JSON];
            //Array anlegen
            let data: number[];
            for (let key in layers) {
                if (layers.hasOwnProperty(key)) {
                    if (layers[key].name == Config.LAYER_NAME_LAND) { //Name des Layers gefunden
                        data = layers[key].data;
                        break;
                    }
                }
            }
            //maximalen Wert zurückgeben
            return Math.max.apply(null, data);
        }


        create() {

            //Tilemap laden
            this.map = this.game.add.tilemap(Config.GAME_MAP.getKey());
            //Tileset Bilder hinzufügen. Erster Parameter muss Name aus Tilemap Json sein
            this.map.addTilesetImage(Config.GAME_MAP_PLANTS.getKey(), Config.GAME_MAP_PLANTS.getKey());
            this.map.addTilesetImage(Config.GAME_MAP_REED.getKey(), Config.GAME_MAP_REED.getKey());
            this.map.addTilesetImage(Config.GAME_MAP_SANDWATER.getKey(), Config.GAME_MAP_SANDWATER.getKey());
            //Hintergrundfarbe statt Layer für Wasser angeben
            this.stage.setBackgroundColor(Config.BACKGROUND_COLOR);

            //Layer für die einzelnen Tilemap Layer verwenden
            this.landLayer = this.map.createLayer(Config.LAYER_NAME_LAND);
            this.plantsLayer = this.map.createLayer(Config.LAYER_NAME_PLANTS);

            //Die IDs angeben, mit welchen in dem Layer kollidiert werden soll. In diesem Fall mit allen, da eigenes Layer dafür
            this.map.setCollisionBetween(1, this.getMaxTileId(), true, this.landLayer);

            //Größe der Welt abhängig von der verwendeten Tilemap (den Layers) setzen
            this.landLayer.resizeWorld();

            //Grenzen für Spielwelt auf aktuelle Größe setzen
            this.world.setBounds(0, 0, this.world.width, this.world.height);

            //Hintergrundmusik in einem Endlos-Loop abspielen
            this.music = this.add.audio(Config.INGAME_SOUND.getKey(), 1, false);
            this.music.loop = true;
            this.music.play();

            //Physik-Engine starten
            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            //Abstände setzen
            let borderDistance: number = 150;
            let infoYPos: number = 100;
            //Spieler erstellen
            this.player = new Player(this.game, this, new Phaser.Point(borderDistance, this.game.world.centerY), new Phaser.Point(borderDistance, infoYPos));
            //Gegner erstellen
            let i: number;
            let x: number;
            this.enemies = [];
            for (i = 0; i <= this.difficulty * 2; i++) {
                //horizontale Startposition und Position für Anzeige festlegen
                x = this.game.world.width - (borderDistance * (i + 1));
                //Gegner erstellen
                this.enemies.push(new Enemy(this.game, this, new Phaser.Point(x, this.game.world.centerY), Config.COMPUTER_NAME_PREFIX + " " + String(i + 1), new Phaser.Point(x, infoYPos)))
                //Gegenspieler festlegen
                this.enemies[i].addEnemy(this.player);
                this.player.addEnemy(this.enemies[i]);
            }
            this.enemiesAlive = this.enemies.length;

            //Gesamtmenge von Objekten, welche Items sammeln können, in Array speichern
            Array.prototype.push.apply(this.allStrikeableObjects, this.enemies);
            this.allStrikeableObjects.push(this.player);

            //initial Items erstellen:
            this.addGameItem();

            //Zyklisch neue Items zum Spiel hinzufügen
            this.game.time.events.loop(Phaser.Timer.SECOND * this.newItemRepeatTime, this.addGameItem, this);
        }


        private addGameItem() {
            //Items zur Spielwelt hinzufügen, mit einer Chance die abhängig von der Anzahl lebender Gegner ist
            if (Phaser.Utils.chanceRoll(this.enemiesAlive * this.itemFactor)) {
                new MediItem(this.game, this, this.allStrikeableObjects);
            }
            if (Phaser.Utils.chanceRoll(this.enemiesAlive * this.itemFactor)) {
                new StarItem(this.game, this, this.allStrikeableObjects);
            }
            if (Phaser.Utils.chanceRoll(this.enemiesAlive * this.itemFactor)) {
                new SpeedItem(this.game, this, this.allStrikeableObjects);
            }
        }

        public getCollisionLayer() {
            return this.landLayer;
        }

        public updateGame(deadBoat: Boat): void {
            let winner: string = "";
            //wenn Spieler zerstört, dann auf jeden Fall verloren
            if (deadBoat instanceof Player) {
                winner = "Computer";
                //Kamera beben lassen, da Spieler zerstört wurde
                this.game.camera.shake();
            } else { //Anzahl lebender Gegner relevant
                this.enemiesAlive--;
                if (this.enemiesAlive == 0) {
                    winner = "Player";
                }
            }
            //Gewinner steht fest
            if (winner.length > 0) {
                winner += " wins";

                //Textelement für Spielergebnis erzeugen und Eigenschaften setzen
                let resultText: Phaser.Text;
                resultText = this.game.add.text(this.game.world.centerX, 0, winner, Config.TEXT_STYLE);
                resultText.anchor.set(0.5);
                resultText.fontWeight = "bold";
                resultText.fontSize = 70;
                resultText.stroke = "#000000";
                resultText.strokeThickness = 4;

                let tween = this.add.tween(resultText).to({ y: this.game.world.centerY }, 2000, Phaser.Easing.Bounce.Out, true);
                //Nach Fertigstellung der Animation das Hauptmenü starten
                tween.onComplete.add(this.startMenu, this);
            }
        }

        private startMenu() {
            //Ingame Sound stoppen
            this.music.stop();
            //Hauptmenü starten
            this.game.state.start(Config.MENU_STATE, true, false);
        }

    }
}