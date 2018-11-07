var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var Pirates = /** @class */ (function (_super) {
        __extends(Pirates, _super);
        function Pirates() {
            var _this = _super.call(this, 1280, 960, Phaser.AUTO, Bachelorarbeit.Config.HTML_DIV_ID, null) || this;
            //Gamestates anlegen ohne Autostart 
            _this.state.add(Bachelorarbeit.Config.BOOT_STATE, Bachelorarbeit.Boot, false);
            _this.state.add(Bachelorarbeit.Config.PRELOAD_STATE, Bachelorarbeit.Preloader, false);
            _this.state.add(Bachelorarbeit.Config.MENU_STATE, Bachelorarbeit.Menu, false);
            _this.state.add(Bachelorarbeit.Config.INGAME_STATE, Bachelorarbeit.InGame, false);
            //ersten Gamestate starten
            _this.state.start(Bachelorarbeit.Config.BOOT_STATE);
            return _this;
        }
        Pirates.prototype.getHtmlDivId = function () {
            return Bachelorarbeit.Config.HTML_DIV_ID;
        };
        return Pirates;
    }(Phaser.Game));
    Bachelorarbeit.Pirates = Pirates;
})(Bachelorarbeit || (Bachelorarbeit = {}));
// anonyme Funktion zur Erstellung des Spiel-Objektes bei onLoad der Seite
window.onload = function () {
    var game = new Bachelorarbeit.Pirates();
    //Fokus auf das Spiel setzen
    document.getElementById(game.getHtmlDivId()).focus();
};
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var BoatState;
    (function (BoatState) {
        BoatState[BoatState["IDLE"] = 0] = "IDLE";
        BoatState[BoatState["DRIVING"] = 1] = "DRIVING";
        BoatState[BoatState["DEAD"] = 2] = "DEAD";
    })(BoatState = Bachelorarbeit.BoatState || (Bachelorarbeit.BoatState = {}));
    ;
    var Boat = /** @class */ (function (_super) {
        __extends(Boat, _super);
        function Boat(game, gameState, startPoint, boatImage, boatName, infoTextPoint) {
            var _this = _super.call(this, game, startPoint.x, startPoint.y, Bachelorarbeit.Config.INGAME.getKey(), boatImage) || this;
            _this.boatState = BoatState.IDLE;
            //Gegner des Bootes
            _this.enemies = [];
            //Kanone
            _this.reloadTime = 1; //Sekunden
            _this.nextShotTime = 0;
            //Bewegung
            _this.currentSpeed = 0;
            _this.maximumSpeed = 200;
            _this.doubledSpeed = false;
            _this.itemDuration = 5; //Sekunden
            _this.movementIntensity = 3; //Grad pro Frame
            //Lebenspunkte und Name sowie Anzeigeposition
            _this.hitcount = 0;
            _this.deadcount = 4;
            _this.isInvulnerable = false;
            _this.infoTextPoint = null;
            _this.boatName = boatName;
            _this.gameState = gameState;
            _this.infoTextPoint = infoTextPoint;
            //Größe des Boots halbieren
            _this.scale.setTo(0.5);
            //Anker auf den Mittelpunkt des Bootes setzen
            _this.anchor.setTo(0.5, 0.5);
            //ARCADE Physik für Boot aktivieren
            game.physics.enable(_this, Phaser.Physics.ARCADE);
            _this.body.collideWorldBounds = true;
            //wellen für Animation beim Fahren erstellen
            _this.waves = _this.game.add.sprite(_this.x, _this.y, Bachelorarbeit.Config.INGAME.getKey());
            //Eigenschaften von Boot übernehmen
            _this.waves.anchor.setTo(0.6, _this.anchor.y);
            _this.waves.scale.setTo(_this.scale.x, _this.scale.y);
            _this.waves.animations.add(Bachelorarbeit.Config.INGAME.getKey(), Bachelorarbeit.Config.BOAT_WAVES, 30);
            //Kanone erstellen
            _this.cannon = _this.game.add.sprite(_this.x, _this.y, Bachelorarbeit.Config.INGAME.getKey(), Bachelorarbeit.Config.BOAT_CANON);
            _this.cannon.anchor.setTo(_this.anchor.x, _this.anchor.y);
            _this.cannon.scale.setTo(_this.scale.x * 1.5, _this.scale.y * 1.5);
            //Boot zur Welt hinzufügen
            game.add.existing(_this);
            //sicherstellen dass die Sprites in der richtigen Reihenfolge angezeigt werden
            _this.waves.bringToTop();
            _this.bringToTop();
            _this.cannon.bringToTop();
            //Anzeigetext initialisieren und aktualisieren
            _this.initText();
            _this.updateText();
            //Soundobjekte hinzufügen
            _this.shotSound = _this.game.add.audio(Bachelorarbeit.Config.SHOT_SOUND.getKey(), 0.1, false);
            _this.explosionSound = _this.game.add.audio(Bachelorarbeit.Config.EXPLOSION_SOUND.getKey(), 1, false);
            _this.collectSound = _this.game.add.audio(Bachelorarbeit.Config.ITEM_SOUND.getKey(), 1, false);
            //Sprite und Animation für Explosion
            _this.explosion = _this.game.add.sprite(_this.x, _this.y, Bachelorarbeit.Config.EXPLOSION.getKey());
            _this.explosion.visible = false;
            _this.explosion.anchor.set(0.5);
            _this.explosionAnimation = _this.explosion.animations.add(Bachelorarbeit.Config.EXPLOSION.getKey(), Phaser.ArrayUtils.numberArray(1, Bachelorarbeit.Config.EXPLOSION_FRAME_COUNT), 15);
            _this.explosionAnimation.onComplete.add(_this.setExplosionInvisible, _this);
            return _this;
        }
        Boat.prototype.getBodySprite = function () {
            return this;
        };
        Boat.prototype.setExplosionInvisible = function () {
            //ist notwendig, da in wenigen Fällen der letzte Frame der Animation ansonsten weiterhin sichtbar bleibt
            this.explosion.visible = false;
        };
        Boat.prototype.initText = function () {
            if (this.infoTextPoint == null) {
                return;
            }
            this.infoText = this.game.add.text(this.infoTextPoint.x, this.infoTextPoint.y, "", Bachelorarbeit.Config.TEXT_STYLE);
            this.infoText.lineSpacing = 20;
            //text horizontal zentrieren
            this.infoText.anchor.set(0.5);
            this.infoText.fontWeight = "bold";
            this.infoText.align = "center";
            this.infoText.stroke = "#000000";
            this.infoText.strokeThickness = 3;
        };
        Boat.prototype.addEnemy = function (enemy) {
            this.enemies.push(enemy);
        };
        Boat.prototype.fire = function (point) {
            //Wenn Kanone geladen ist, feuern
            if (this.isReadyForShooting()) {
                var bullet = new Bachelorarbeit.Bullet(this.game, this.enemies, this.cannon.position, this.gameState);
                bullet.moveTo(point);
                this.shotSound.play();
            }
        };
        Boat.prototype.updateText = function () {
            if (this.infoTextPoint == null) {
                return;
            }
            var healthPoints = 100;
            var hitPoints = 33;
            healthPoints -= this.hitcount * hitPoints;
            if (healthPoints < 0) {
                healthPoints = 0;
            }
            var text;
            text = this.boatName + "\n";
            var startPos;
            startPos = text.length - 1;
            text += String(healthPoints) + " %";
            this.infoText.setText(text);
            var color;
            switch (this.hitcount) {
                case 0: {
                    color = "#00ff00"; //Grün
                    break;
                }
                case 1: {
                    color = "#ff9900"; //Orange
                    break;
                }
                case 2: {
                    color = "#ff0000"; //Rot
                    break;
                }
                case 3: {
                    color = "#990000"; //DunkelRot
                    break;
                }
                default: {
                    color = "#000000"; //Schwarz;
                }
            }
            this.infoText.addColor(color, startPos);
        };
        Boat.prototype.resetVulnerable = function () {
            this.isInvulnerable = false;
        };
        Boat.prototype.resetSpeed = function () {
            this.doubledSpeed = false;
            this.maximumSpeed = this.maximumSpeed / 2;
        };
        Boat.prototype.break = function () {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= this.maximumSpeed / 20;
            }
        };
        Boat.prototype.hitByBullet = function () {
            //Verlassen der Methode, wenn Boot unverwundbar oder bereits zerstört ist
            if ((this.boatState == BoatState.DEAD) || (this.isInvulnerable)) {
                return;
            }
            this.hitcount++;
            if (this.hitcount >= this.deadcount) {
                //Status aktualisieren
                this.boatState = BoatState.DEAD;
                this.stopWaveAnimation();
                //Boot bewegungsunfähig setzen
                this.currentSpeed = 0;
                this.body.immovable = true;
                this.body.moves = false;
                //Nach Beenden der Animation Spiel beenden
                this.explosionAnimation.onComplete.add(this.callGameUpdate, this);
                //Schießen deaktivieren: Zeitpunkt auf das Maximum setzen
                this.nextShotTime = Number.MAX_VALUE;
                //Grafik durch zerstörtes Boot ersetzten
                this.frameName = this.deadSpriteFrame;
            }
            this.hitAnimation();
            this.updateText();
        };
        Boat.prototype.hitAnimation = function () {
            //Position der Explosion auf die aktuelle Position des Bootes setzen und sichtbar machen
            this.explosion.x = this.x;
            this.explosion.y = this.y;
            this.explosion.bringToTop();
            this.explosion.visible = true;
            //Sound abspielen
            this.explosionSound.play();
            //Animation abspielen
            this.explosionAnimation.play();
        };
        Boat.prototype.callGameUpdate = function () {
            //An den übergeordneten GameState die Zerstörung zurückmelden
            this.gameState.updateGame(this);
        };
        Boat.prototype.isReadyForShooting = function () {
            //Prüfen ob aktuelle Zeit größer als die festgelegte Zielzeit ist
            if (this.game.time.now > this.nextShotTime) {
                //Zielzeit für den nächsten Schuss festlegen
                this.nextShotTime = this.game.time.now + (this.reloadTime * Phaser.Timer.SECOND);
                return true;
            }
            else {
                return false;
            }
        };
        Boat.prototype.updateSpritesPositions = function () {
            this.updateSpritePosition(this.waves, false);
            this.updateSpritePosition(this.cannon, true);
        };
        Boat.prototype.updateSpritePosition = function (sprite, cannon) {
            //Position übernehmen
            sprite.x = this.x;
            sprite.y = this.y;
            if (!cannon) {
                //Winkel übernehmen
                sprite.rotation = this.rotation;
            }
        };
        Boat.prototype.itemCollected = function (itemType) {
            this.collectSound.play();
            if (itemType == Bachelorarbeit.ItemType.MEDI) {
                //Lebenspunkte zurücksetzen
                this.hitcount = 0;
                this.updateText();
            }
            else if (itemType == Bachelorarbeit.ItemType.SPEED) {
                //Geschwindigkeit erhöhen
                if (!this.doubledSpeed) {
                    this.maximumSpeed *= 2;
                    this.doubledSpeed = true;
                }
                //Time-Event zum zurücksetzen setzen
                this.game.time.events.add(Phaser.Timer.SECOND * this.itemDuration, this.resetSpeed, this);
            }
            else if (itemType == Bachelorarbeit.ItemType.STAR) {
                //Unverwundbar setzen
                this.isInvulnerable = true;
                //Time-Event zum zurücksetzen setzen
                this.game.time.events.add(Phaser.Timer.SECOND * this.itemDuration, this.resetVulnerable, this);
            }
        };
        Boat.prototype.onCollideWithLand = function (boat, layer) {
            //Boot soll immer kollidieren, eine Aktion wird aber nur bei Enemy eingeleitet, daher hier leere Implementierung
        };
        Boat.prototype.stopWaveAnimation = function () {
            //Wellenanimation stoppen
            this.waves.animations.stop(Bachelorarbeit.Config.INGAME.getKey());
            //Wellen ausblenden
            this.tweenOut = this.game.add.tween(this.waves).to({ alpha: 0 }, 50, Phaser.Easing.Linear.None, true);
        };
        Boat.prototype.update = function () {
            //Infotext soll immer im Vordergrund angezeigt werden
            this.infoText.bringToTop();
            //Kollision mit Festland herbeiführen
            this.game.physics.arcade.collide(this, this.gameState.getCollisionLayer(), this.onCollideWithLand, null, this);
            //Bei Kollision mit Gegner Physik beachten (rammen wird dadurch aktiv)
            this.game.physics.arcade.collide(this, this.enemies);
            //Postion der mit dem Boot verbundenen Sprites mit dem Boot synchronisieren
            this.updateSpritesPositions();
            //feststellen ob Boot am fahren ist
            if (this.currentSpeed > 0) {
                this.boatState = BoatState.DRIVING;
                //Wellen einblenden
                this.tweenIn = this.game.add.tween(this.waves).to({ alpha: 1 }, 20, Phaser.Easing.Linear.None, true);
                //Wellenanimation starten
                this.waves.animations.play(Bachelorarbeit.Config.INGAME.getKey(), 15, true);
                //Sprite in Richtung bewegen, abhängig vom Winkel (1. Param in Grad) in der Geschwindigkeit (2. Param) und in den Zielpunkt (3. Param)
                this.game.physics.arcade.velocityFromAngle(this.angle, this.currentSpeed, this.body.velocity);
            }
            else {
                this.stopWaveAnimation();
                //Bewegung stoppen
                this.body.velocity.x = 0;
                this.body.velocity.y = 0;
            }
        };
        return Boat;
    }(Phaser.Sprite));
    Bachelorarbeit.Boat = Boat;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var Boot = /** @class */ (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            return _super.call(this) || this;
        }
        Boot.prototype.preload = function () {
            //Lade-Grafik für Preloader laden
            this.game.load.atlasJSONArray(Bachelorarbeit.Config.LOADER.getKey(), Bachelorarbeit.Config.LOADER.getImage(), Bachelorarbeit.Config.LOADER.getJSON());
            //beim Resizen des Browser Fensters alle Inhalte des Spiels anpassen
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            //Boden des Browserfensters als Grenze betrachten, damit beim Resize immer das Ganze Spiel sichtbar bleibt.
            this.game.scale.windowConstraints.bottom = "visual";
            //Spiel horizontal und vertikal zentriert anzeigen
            this.game.scale.pageAlignHorizontally = true;
            this.game.scale.pageAlignVertically = true;
            this.game.scale.refresh();
        };
        Boot.prototype.create = function () {
            //Anzahl Mauszeiger auf 1 limitieren (kein Multitouch notwendig)
            this.input.maxPointers = 1;
            //Preloader aufrufen
            this.game.state.start(Bachelorarbeit.Config.PRELOAD_STATE, true, false);
        };
        return Boot;
    }(Phaser.State));
    Bachelorarbeit.Boot = Boot;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    //export class Bullet extends Phaser.Bullet {
    var Bullet = /** @class */ (function (_super) {
        __extends(Bullet, _super);
        function Bullet(game, targets, startPoint, gameState) {
            var _this = _super.call(this, game, startPoint.x, startPoint.y, Bachelorarbeit.Config.INGAME.getKey(), Bachelorarbeit.Config.BULLET) || this;
            _this.targets = []; //Alle potentiellen treffbaren Ziele
            _this.targets = targets;
            _this.gameState = gameState;
            //ARCADE Physik für Kugel aktivieren
            game.physics.enable(_this, Phaser.Physics.ARCADE);
            //Größe der Kugel verkleinern
            _this.scale.setTo(0.4);
            //Anker auf den Mittelpunkt setzen
            _this.anchor.setTo(0.5, 0.5);
            //Kugel kann Spielwelt verlassen und wird automatisch zuerstört
            _this.checkWorldBounds = false;
            _this.outOfBoundsKill = true;
            //Kugel zur Welt hinzufügen
            game.add.existing(_this);
            //Kugel eine Ebene nach hinten setzen.
            _this.moveDown();
            return _this;
        }
        Bullet.prototype.moveTo = function (point) {
            this.game.physics.arcade.moveToXY(this, point.x, point.y, 500);
        };
        Bullet.prototype.update = function () {
            //Überschneidungen zwischen Kugel und den beiden Akteuren prüfen und physikalische Kollision auslösen
            this.game.physics.arcade.collide(this, this.targets, this.hitTarget, null, this);
            //Kollision mit Festland
            this.game.physics.arcade.collide(this, this.gameState.getCollisionLayer(), this.hitLand, null, this);
        };
        Bullet.prototype.hitLand = function (bullet, inGame) {
            //Kugel entfernen
            this.kill();
        };
        Bullet.prototype.hitTarget = function (bullet, target) {
            //Handler im IStrikeable-Objekt aufrufen
            target.hitByBullet();
            //Kugel entfernen
            this.kill();
        };
        return Bullet;
    }(Phaser.Sprite));
    Bachelorarbeit.Bullet = Bullet;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var Asset = /** @class */ (function () {
        function Asset(assetName) {
            this.assetName = assetName;
        }
        Asset.prototype.getKey = function () {
            var index = this.assetName.lastIndexOf("/");
            if (index != -1) {
                return this.assetName.substring(index + 1);
            }
            else {
                return this.assetName;
            }
        };
        return Asset;
    }());
    Bachelorarbeit.Asset = Asset;
    var ImageAsset = /** @class */ (function (_super) {
        __extends(ImageAsset, _super);
        function ImageAsset(assetName) {
            return _super.call(this, assetName) || this;
        }
        ImageAsset.prototype.getImage = function () {
            return this.assetName + ".png";
        };
        return ImageAsset;
    }(Asset));
    Bachelorarbeit.ImageAsset = ImageAsset;
    var JSONSpritesheetAsset = /** @class */ (function (_super) {
        __extends(JSONSpritesheetAsset, _super);
        function JSONSpritesheetAsset(assetName) {
            return _super.call(this, assetName) || this;
        }
        JSONSpritesheetAsset.prototype.getJSON = function () {
            return this.assetName + ".json";
        };
        return JSONSpritesheetAsset;
    }(ImageAsset));
    Bachelorarbeit.JSONSpritesheetAsset = JSONSpritesheetAsset;
    var AudioAsset = /** @class */ (function (_super) {
        __extends(AudioAsset, _super);
        function AudioAsset(assetName) {
            return _super.call(this, assetName) || this;
        }
        AudioAsset.prototype.getAudio = function () {
            return this.assetName + ".mp3";
        };
        return AudioAsset;
    }(Asset));
    Bachelorarbeit.AudioAsset = AudioAsset;
    var Config = /** @class */ (function () {
        function Config() {
        }
        //Verzeichnisse
        Config.ASSETS_DIR = "assets/";
        Config.SOUNDS_DIR = Config.ASSETS_DIR + "sounds/";
        Config.IMAGES_DIR = Config.ASSETS_DIR + "images/";
        //Spritesheets
        Config.LOADER = new JSONSpritesheetAsset(Config.IMAGES_DIR + "loader");
        Config.LOADER_IMAGES = ["Android_style_loader_frame_0001.png", "Android_style_loader_frame_0002.png", "Android_style_loader_frame_0003.png", "Android_style_loader_frame_0004.png", "Android_style_loader_frame_0005.png", "Android_style_loader_frame_0006.png", "Android_style_loader_frame_0007.png", "Android_style_loader_frame_0008.png",];
        Config.INGAME = new JSONSpritesheetAsset(Config.IMAGES_DIR + "ingame");
        Config.EXPLOSION = new ImageAsset(Config.IMAGES_DIR + "explosion");
        Config.EXPLOSION_FRAME_SIZE = 64;
        Config.EXPLOSION_FRAME_COUNT = 16;
        //TileMap
        Config.GAME_MAP = new JSONSpritesheetAsset(Config.IMAGES_DIR + "gamemap");
        Config.GAME_MAP_PLANTS = new ImageAsset(Config.IMAGES_DIR + "plants");
        Config.GAME_MAP_REED = new ImageAsset(Config.IMAGES_DIR + "reed");
        Config.GAME_MAP_SANDWATER = new ImageAsset(Config.IMAGES_DIR + "sandwater");
        Config.LAYER_NAME_LAND = "festland";
        Config.LAYER_NAME_PLANTS = "pflanzen";
        Config.LAYERS_ATTRIBUTE_JSON = "layers";
        //Hintergrundfarbe
        Config.BACKGROUND_COLOR = "#156c99"; //Blau
        //Images
        Config.LOGO = new ImageAsset(Config.IMAGES_DIR + "logo");
        //Sounds
        Config.INGAME_SOUND = new AudioAsset(Config.SOUNDS_DIR + "ingame");
        Config.SHOT_SOUND = new AudioAsset(Config.SOUNDS_DIR + "shot");
        Config.EXPLOSION_SOUND = new AudioAsset(Config.SOUNDS_DIR + "explosion");
        Config.ITEM_SOUND = new AudioAsset(Config.SOUNDS_DIR + "levelup");
        //Debug
        Config.BIGFILE_SOUND = new AudioAsset(Config.SOUNDS_DIR + "bigfile");
        //Sprite Namen
        Config.BOAT_PLAYER = "ship_small_body.png";
        Config.BOAT_PLAYER_DEAD = "ship_small_body_destroyed.png";
        Config.BOAT_ENEMY = "ship_small_b_body.png";
        Config.BOAT_ENEMY_DEAD = "ship_small_body_b_destroyed.png";
        Config.BOAT_WAVES = ["water_ripple_small_000.png", "water_ripple_small_001.png", "water_ripple_small_002.png", "water_ripple_small_003.png", "water_ripple_small_004.png"];
        Config.BOAT_CANON = "ship_gun_gray.png";
        Config.BULLET = "bullet.png";
        Config.ITEM_MEDI = "medi.png";
        Config.ITEM_SPEED = "speed.png";
        Config.ITEM_STAR = "star.png";
        //Text-Styles
        Config.TEXT_STYLE = { fill: "#ffffff" };
        Config.TEXT_STYLE_MENU = { fill: "#f21515" };
        //GameState Keys
        Config.BOOT_STATE = "Boot";
        Config.PRELOAD_STATE = "Preload";
        Config.MENU_STATE = "Menu";
        Config.INGAME_STATE = "InGame";
        Config.HTML_DIV_ID = "content";
        //Texte für GUI
        Config.LOADING_TEXT = "Loading...";
        Config.LOADING_COMPLETE_TEXT = "Loading complete";
        Config.GAME_TITLE = "Pirates";
        Config.MENU_OPTIONS = ["easy", "medium", "difficult"];
        Config.COMPUTER_NAME_PREFIX = "Enemy";
        return Config;
    }());
    Bachelorarbeit.Config = Config;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var Enemy = /** @class */ (function (_super) {
        __extends(Enemy, _super);
        function Enemy(game, gameState, startPoint, boatName, infoTextPoint) {
            var _this = _super.call(this, game, gameState, startPoint, Bachelorarbeit.Config.BOAT_ENEMY, boatName, infoTextPoint) || this;
            _this.movementDelay = 2; //Sekunden
            _this.nextMovementTime = 0;
            _this.dodgeActive = false;
            _this.breakingEnabled = false;
            //Ausrichtung nach Links
            _this.angle = -180;
            //Callback für Kollision mit WorldBounds setzen
            _this.body.onWorldBounds = new Phaser.Signal();
            _this.body.onWorldBounds.add(_this.collideWorldBounds, _this);
            //Sprite für Boot nach Zerstörung festlegen
            _this.deadSpriteFrame = Bachelorarbeit.Config.BOAT_ENEMY_DEAD;
            //Verzögerung für erstes schießen zufällig zwischen 0 und einer Sekunde setzen, damit nicht alle Gegner gleichzeitig schießen
            _this.nextShotTime = _this.game.time.now + Phaser.Math.random(0, Phaser.Timer.SECOND);
            //Punkt zum Zielen auf Gegner erstellen
            _this.aimPoint = new Phaser.Point();
            return _this;
        }
        Enemy.prototype.collideWorldBounds = function (sprite) {
            if (this.dodgeActive) {
                this.setMovementReady();
            }
            else {
                //Fahrtrichtung umkehren
                this.rotation = Phaser.Math.reverseAngle(this.rotation);
                //Zielwinkel auf den gleichen Winkel setzen
                this.targetAngle = this.angle;
                //Änderungen der Fahrtrichtung für kurze Zeit deaktivieren
                this.dodgeActive = true;
                this.setDelayForTurning();
            }
        };
        Enemy.prototype.setDelayForTurning = function () {
            this.nextMovementTime = this.game.time.now + (this.movementDelay * Phaser.Timer.SECOND);
        };
        Enemy.prototype.setShortDelayForTurning = function () {
            this.nextMovementTime = this.game.time.now + ((this.movementDelay * Phaser.Timer.SECOND) / 5);
        };
        Enemy.prototype.setMovementReady = function () {
            this.nextMovementTime = 0;
        };
        Enemy.prototype.isReadyForMoving = function () {
            return this.game.time.now >= this.nextMovementTime;
        };
        Enemy.prototype.onCollideWithLand = function (boat, layer) {
            //sofortige Drehung um 90 Grad. Der Zufall entscheidet ob rechts- oder linksherum
            if (Phaser.Utils.chanceRoll(50)) {
                this.angle += 90;
                this.targetAngle += 90;
            }
            else {
                this.angle -= 90;
                this.targetAngle -= 90;
            }
            this.dodgeActive = true;
            this.setShortDelayForTurning();
        };
        Enemy.prototype.hitByBullet = function () {
            _super.prototype.hitByBullet.call(this);
            //neue Bewegung ermöglichen, um ausweichen zu können
            this.setMovementReady();
        };
        Enemy.prototype.update = function () {
            //Wenn Boot noch nicht zerstört ist und schon Gegner existieren, ansonsten verlassen
            if (this.boatState == Bachelorarbeit.BoatState.DEAD || this.enemies.length == 0) {
                return;
            }
            //Anhalten eingeleitet, weiter Geschwindigkeit reduzieren
            if (this.breakingEnabled) {
                this.break();
            }
            if (this.isReadyForMoving()) {
                //Ausweichmodus nicht mehr aktiv
                this.dodgeActive = false;
                //Entscheidung ob Boot zufällig stoppen soll
                if (Phaser.Utils.chanceRoll(90)) {
                    //Fahren mit voller Geschwindigkeit
                    this.currentSpeed = this.maximumSpeed;
                    this.breakingEnabled = false;
                    //Fahrtrichtung festlegen
                    if (Phaser.Utils.chanceRoll(90)) {
                        //Zielwinkel Richtung Spieler setzen
                        this.targetAngle = Phaser.Math.radToDeg(this.game.physics.arcade.angleBetween(this, this.enemies[0]));
                    }
                    else {
                        //Zufälliger Zielwinkel
                        this.targetAngle = this.game.rnd.angle();
                    }
                }
                else {
                    //Anhalten
                    this.breakingEnabled = true;
                }
                //Fahrparameter temporär einfrieren
                this.setDelayForTurning();
            }
            //Wenn Boot fährt, Winkel anpassen
            if (this.currentSpeed > 0) {
                //Aktuellen Winkel in Richtung Zielwinkel anpassen
                this.rotation = Phaser.Math.rotateToAngle(this.rotation, Phaser.Math.degToRad(this.targetAngle), Phaser.Math.degToRad(this.movementIntensity));
            }
            //feuern
            this.fire();
            //update() der Basisklasse aufrufen
            _super.prototype.update.call(this);
        };
        Enemy.prototype.fire = function () {
            //Zufällige Ungenauigkeit ergänzen
            var inaccuracy = Phaser.Math.random(-15, 15);
            this.aimPoint.setTo(this.enemies[0].getBodySprite().position.x + inaccuracy, this.enemies[0].getBodySprite().position.y + inaccuracy);
            //Kanone optisch auf Zielpunkt ausrichten
            this.cannon.rotation = this.game.physics.arcade.angleToXY(this, this.aimPoint.x, this.aimPoint.y);
            //Schuss auf Zielpunkt
            _super.prototype.fire.call(this, this.aimPoint);
        };
        return Enemy;
    }(Bachelorarbeit.Boat));
    Bachelorarbeit.Enemy = Enemy;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    //todo wirklich alle optionen texte usw in config auslagern
    var Difficulty;
    (function (Difficulty) {
        Difficulty[Difficulty["EASY"] = 0] = "EASY";
        Difficulty[Difficulty["MEDIUM"] = 1] = "MEDIUM";
        Difficulty[Difficulty["DIFFICULT"] = 2] = "DIFFICULT";
    })(Difficulty = Bachelorarbeit.Difficulty || (Bachelorarbeit.Difficulty = {}));
    ;
    var InGame = /** @class */ (function (_super) {
        __extends(InGame, _super);
        function InGame() {
            var _this = _super.call(this) || this;
            _this.enemies = [];
            _this.allStrikeableObjects = [];
            _this.itemFactor = 10;
            _this.newItemRepeatTime = 3; //Sekunden
            return _this;
        }
        InGame.prototype.getMaxTileId = function () {
            //JSON Objekt laden (bewusst ohne konkreten Datentyp, da genaue Struktur unbekannt)
            var json = this.game.cache.getJSON(Bachelorarbeit.Config.GAME_MAP.getKey());
            //durch die Layer iterieren
            var layers = json[Bachelorarbeit.Config.LAYERS_ATTRIBUTE_JSON];
            //Array anlegen
            var data;
            for (var key in layers) {
                if (layers.hasOwnProperty(key)) {
                    if (layers[key].name == Bachelorarbeit.Config.LAYER_NAME_LAND) {
                        data = layers[key].data;
                        break;
                    }
                }
            }
            //maximalen Wert zurückgeben
            return Math.max.apply(null, data);
        };
        InGame.prototype.create = function () {
            //Tilemap laden
            this.map = this.game.add.tilemap(Bachelorarbeit.Config.GAME_MAP.getKey());
            //Tileset Bilder hinzufügen. Erster Parameter muss Name aus Tilemap Json sein
            this.map.addTilesetImage(Bachelorarbeit.Config.GAME_MAP_PLANTS.getKey(), Bachelorarbeit.Config.GAME_MAP_PLANTS.getKey());
            this.map.addTilesetImage(Bachelorarbeit.Config.GAME_MAP_REED.getKey(), Bachelorarbeit.Config.GAME_MAP_REED.getKey());
            this.map.addTilesetImage(Bachelorarbeit.Config.GAME_MAP_SANDWATER.getKey(), Bachelorarbeit.Config.GAME_MAP_SANDWATER.getKey());
            //Hintergrundfarbe statt Layer für Wasser angeben
            this.stage.setBackgroundColor(Bachelorarbeit.Config.BACKGROUND_COLOR);
            //Layer für die einzelnen Tilemap Layer verwenden
            this.landLayer = this.map.createLayer(Bachelorarbeit.Config.LAYER_NAME_LAND);
            this.plantsLayer = this.map.createLayer(Bachelorarbeit.Config.LAYER_NAME_PLANTS);
            //Die IDs angeben, mit welchen in dem Layer kollidiert werden soll. In diesem Fall mit allen, da eigenes Layer dafür
            this.map.setCollisionBetween(1, this.getMaxTileId(), true, this.landLayer);
            //Größe der Welt abhängig von der verwendeten Tilemap (den Layers) setzen
            this.landLayer.resizeWorld();
            //Grenzen für Spielwelt auf aktuelle Größe setzen
            this.world.setBounds(0, 0, this.world.width, this.world.height);
            //Hintergrundmusik in einem Endlos-Loop abspielen
            this.music = this.add.audio(Bachelorarbeit.Config.INGAME_SOUND.getKey(), 1, false);
            this.music.loop = true;
            this.music.play();
            //Physik-Engine starten
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            //Abstände setzen
            var borderDistance = 150;
            var infoYPos = 100;
            //Spieler erstellen
            this.player = new Bachelorarbeit.Player(this.game, this, new Phaser.Point(borderDistance, this.game.world.centerY), new Phaser.Point(borderDistance, infoYPos));
            //Gegner erstellen
            var i;
            var x;
            this.enemies = [];
            for (i = 0; i <= this.difficulty * 2; i++) {
                //horizontale Startposition und Position für Anzeige festlegen
                x = this.game.world.width - (borderDistance * (i + 1));
                //Gegner erstellen
                this.enemies.push(new Bachelorarbeit.Enemy(this.game, this, new Phaser.Point(x, this.game.world.centerY), Bachelorarbeit.Config.COMPUTER_NAME_PREFIX + " " + String(i + 1), new Phaser.Point(x, infoYPos)));
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
        };
        InGame.prototype.addGameItem = function () {
            //Items zur Spielwelt hinzufügen, mit einer Chance die abhängig von der Anzahl lebender Gegner ist
            if (Phaser.Utils.chanceRoll(this.enemiesAlive * this.itemFactor)) {
                new Bachelorarbeit.MediItem(this.game, this, this.allStrikeableObjects);
            }
            if (Phaser.Utils.chanceRoll(this.enemiesAlive * this.itemFactor)) {
                new Bachelorarbeit.StarItem(this.game, this, this.allStrikeableObjects);
            }
            if (Phaser.Utils.chanceRoll(this.enemiesAlive * this.itemFactor)) {
                new Bachelorarbeit.SpeedItem(this.game, this, this.allStrikeableObjects);
            }
        };
        InGame.prototype.getCollisionLayer = function () {
            return this.landLayer;
        };
        InGame.prototype.updateGame = function (deadBoat) {
            var winner = "";
            //wenn Spieler zerstört, dann auf jeden Fall verloren
            if (deadBoat instanceof Bachelorarbeit.Player) {
                winner = "Computer";
                //Kamera beben lassen, da Spieler zerstört wurde
                this.game.camera.shake();
            }
            else {
                this.enemiesAlive--;
                if (this.enemiesAlive == 0) {
                    winner = "Player";
                }
            }
            //Gewinner steht fest
            if (winner.length > 0) {
                winner += " wins";
                //Textelement für Spielergebnis erzeugen und Eigenschaften setzen
                var resultText = void 0;
                resultText = this.game.add.text(this.game.world.centerX, 0, winner, Bachelorarbeit.Config.TEXT_STYLE);
                resultText.anchor.set(0.5);
                resultText.fontWeight = "bold";
                resultText.fontSize = 70;
                resultText.stroke = "#000000";
                resultText.strokeThickness = 4;
                var tween = this.add.tween(resultText).to({ y: this.game.world.centerY }, 2000, Phaser.Easing.Bounce.Out, true);
                //Nach Fertigstellung der Animation das Hauptmenü starten
                tween.onComplete.add(this.startMenu, this);
            }
        };
        InGame.prototype.startMenu = function () {
            //Ingame Sound stoppen
            this.music.stop();
            //Hauptmenü starten
            this.game.state.start(Bachelorarbeit.Config.MENU_STATE, true, false);
        };
        return InGame;
    }(Phaser.State));
    Bachelorarbeit.InGame = InGame;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var ItemType;
    (function (ItemType) {
        ItemType[ItemType["MEDI"] = 0] = "MEDI";
        ItemType[ItemType["SPEED"] = 1] = "SPEED";
        ItemType[ItemType["STAR"] = 2] = "STAR";
    })(ItemType = Bachelorarbeit.ItemType || (Bachelorarbeit.ItemType = {}));
    ;
    var Item = /** @class */ (function (_super) {
        __extends(Item, _super);
        function Item(game, gameState, itemImage, collectors, itemType) {
            var _this = 
            //Zufällige Postion übergeben, welche innerhalb der Teilmap liegt
            _super.call(this, game, Phaser.Math.random(0, gameState.getCollisionLayer().map.width) * gameState.getCollisionLayer().map.tileWidth, Phaser.Math.random(0, gameState.getCollisionLayer().map.height) * gameState.getCollisionLayer().map.tileHeight, Bachelorarbeit.Config.INGAME.getKey(), itemImage) || this;
            _this.gameState = gameState;
            _this.collectors = collectors;
            _this.itemType = itemType;
            //ARCADE Physik für Item aktivieren
            game.physics.enable(_this, Phaser.Physics.ARCADE);
            _this.body.collideWorldBounds = true;
            //Item unsichtbar erstellen, um es später mit Tween einzublenden
            _this.scale.setTo(0);
            //Item zur Welt hinzufügen
            game.add.existing(_this);
            //Item einblenden
            _this.game.add.tween(_this.scale).to({ x: 1, y: 1 }, 2000, Phaser.Easing.Elastic.Out, true);
            return _this;
        }
        Item.prototype.update = function () {
            //Prüfen ob die darunterliegende Kachel für Kollision vorgesehen ist
            //physics.arcade.overlap/collide sind nicht möglich, da diese nur über Bewegungen der Physik Engine getriggert werden
            if (this.gameState.getCollisionLayer().map.getTile(this.gameState.getCollisionLayer().getTileX(this.x), this.gameState.getCollisionLayer().getTileY(this.y), this.gameState.getCollisionLayer(), true).collides) {
                this.setNewRandomPosition();
            }
            //über Overlap prüfen ob Überschneidung zwischen Item und Sammlern vorliegt
            this.game.physics.arcade.overlap(this, this.collectors, this.collected, null, this);
        };
        Item.prototype.setNewRandomPosition = function () {
            //neue zufällige Position setzen
            this.x = Phaser.Math.random(0, this.gameState.getCollisionLayer().map.width) * this.gameState.getCollisionLayer().map.tileWidth;
            this.y = Phaser.Math.random(0, this.gameState.getCollisionLayer().map.height) * this.gameState.getCollisionLayer().map.tileHeight;
        };
        Item.prototype.collected = function (item, collector) {
            //Handler im IStrikeable-Objekt aufrufen
            collector.itemCollected(this.itemType);
            //Item entfernen
            this.kill();
        };
        return Item;
    }(Phaser.Sprite));
    Bachelorarbeit.Item = Item;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var MediItem = /** @class */ (function (_super) {
        __extends(MediItem, _super);
        function MediItem(game, gameState, collectors) {
            return _super.call(this, game, gameState, Bachelorarbeit.Config.ITEM_MEDI, collectors, Bachelorarbeit.ItemType.MEDI) || this;
        }
        return MediItem;
    }(Bachelorarbeit.Item));
    Bachelorarbeit.MediItem = MediItem;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var Menu = /** @class */ (function (_super) {
        __extends(Menu, _super);
        function Menu() {
            return _super.call(this) || this;
        }
        //Ersatzfunktion da Standard-Modulo Funktion in JS auch negative Werte liefern kann
        Menu.prototype.posModulo = function (a, b) {
            return ((a % b) + b) % b;
        };
        Menu.prototype.create = function () {
            //Default Schwierigkeit setzen
            this.difficulty = Bachelorarbeit.Difficulty.MEDIUM;
            //Hintergrundfarbe setzen
            this.stage.setBackgroundColor(Bachelorarbeit.Config.BACKGROUND_COLOR);
            //Logografik hinzufügen
            this.logo = this.add.sprite(this.world.centerX, this.world.centerY - 200, Bachelorarbeit.Config.LOGO.getKey());
            //alpha = opacity (Deckkraft) auf 0 setzen
            this.logo.alpha = 0;
            this.logo.anchor.setTo(0.5, 0.5);
            //Grafik verkleinern
            this.logo.scale.setTo(0.8);
            //Text für Titel erstellen
            this.title = this.game.add.text(this.game.world.centerX, 100, Bachelorarbeit.Config.GAME_TITLE, Bachelorarbeit.Config.TEXT_STYLE_MENU);
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
            this.options = this.game.add.text(this.game.world.centerX, this.game.world.centerY + 250, "", Bachelorarbeit.Config.TEXT_STYLE);
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
        };
        Menu.prototype.changeSelected = function (key) {
            if (key == this.upKey) {
                this.difficulty--;
            }
            else if (key == this.downKey) {
                this.difficulty++;
            }
            //Die Auswahl auf einen Bereich von 0-2 bringen
            this.difficulty = this.posModulo(this.difficulty, 3);
            //Text setzen
            this.options.text = Bachelorarbeit.Config.MENU_OPTIONS.join("\n");
            //Aktuelle Auswahl markieren mit einem > Zeichen
            this.options.text = this.options.text.replace(Bachelorarbeit.Config.MENU_OPTIONS[this.difficulty], "> " + Bachelorarbeit.Config.MENU_OPTIONS[this.difficulty]);
        };
        Menu.prototype.startGame = function () {
            //Übergabe der ausgewählten Schwierigkeit an den Ingame Gamestate
            this.game.state.states[Bachelorarbeit.Config.INGAME_STATE].difficulty = this.difficulty;
            //Starten des InGame States
            this.game.state.start(Bachelorarbeit.Config.INGAME_STATE, true, false);
        };
        return Menu;
    }(Phaser.State));
    Bachelorarbeit.Menu = Menu;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var Player = /** @class */ (function (_super) {
        __extends(Player, _super);
        function Player(game, gameState, startPoint, infoTextPoint) {
            var _this = _super.call(this, game, gameState, startPoint, Bachelorarbeit.Config.BOAT_PLAYER, "Player", infoTextPoint) || this;
            //Tastatur Bindings in einem Objekt (statt allen 4 Tasten einzeln)
            _this.curserKeys = game.input.keyboard.createCursorKeys();
            _this.deadSpriteFrame = Bachelorarbeit.Config.BOAT_PLAYER_DEAD;
            return _this;
        }
        Player.prototype.fire = function () {
            //Zielposition ist aktueller Mauszeiger
            _super.prototype.fire.call(this, this.game.input.activePointer.position);
        };
        Player.prototype.update = function () {
            if (this.boatState == Bachelorarbeit.BoatState.DEAD) {
                //Verlassen der Methode, damit keine Steuerung (Drehung auf aktueller Position) mehr möglich ist
                return;
            }
            //Kanone des Bootes in Richtung des Mauszeigers ausrichten
            this.cannon.rotation = this.game.physics.arcade.angleToPointer(this.cannon);
            if (this.game.input.activePointer.isDown) {
                this.fire();
            }
            //Bewegung steuern
            //Fahrtrichtung ändern
            if (this.curserKeys.right.isDown) {
                this.angle += this.movementIntensity;
            }
            else if (this.curserKeys.left.isDown) {
                this.angle -= this.movementIntensity;
            }
            //Geschwindigkeit setzen
            if (this.curserKeys.up.isDown) {
                this.currentSpeed = this.maximumSpeed;
            }
            else {
                if (this.currentSpeed > 0) {
                    this.currentSpeed -= this.maximumSpeed / 50;
                }
                else {
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                }
            }
            //bremsen
            if (this.curserKeys.down.isDown) {
                this.break();
            }
            //update() der Basisklasse aufrufen
            _super.prototype.update.call(this);
        };
        return Player;
    }(Bachelorarbeit.Boat));
    Bachelorarbeit.Player = Player;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var Preloader = /** @class */ (function (_super) {
        __extends(Preloader, _super);
        function Preloader() {
            return _super.call(this) || this;
        }
        Preloader.prototype.preload = function () {
            //Callback für Lade-Start setzen
            this.game.load.onLoadStart.add(this.startLoad, this);
            //Assets laden
            this.game.load.image(Bachelorarbeit.Config.LOGO.getKey(), Bachelorarbeit.Config.LOGO.getImage());
            this.game.load.spritesheet(Bachelorarbeit.Config.EXPLOSION.getKey(), Bachelorarbeit.Config.EXPLOSION.getImage(), Bachelorarbeit.Config.EXPLOSION_FRAME_SIZE, Bachelorarbeit.Config.EXPLOSION_FRAME_SIZE, Bachelorarbeit.Config.EXPLOSION_FRAME_COUNT);
            this.game.load.audio(Bachelorarbeit.Config.INGAME_SOUND.getKey(), Bachelorarbeit.Config.INGAME_SOUND.getAudio(), true);
            this.game.load.audio(Bachelorarbeit.Config.SHOT_SOUND.getKey(), Bachelorarbeit.Config.SHOT_SOUND.getAudio(), true);
            this.game.load.audio(Bachelorarbeit.Config.EXPLOSION_SOUND.getKey(), Bachelorarbeit.Config.EXPLOSION_SOUND.getAudio(), true);
            this.game.load.audio(Bachelorarbeit.Config.ITEM_SOUND.getKey(), Bachelorarbeit.Config.ITEM_SOUND.getAudio(), true);
            this.game.load.tilemap(Bachelorarbeit.Config.GAME_MAP.getKey(), Bachelorarbeit.Config.GAME_MAP.getJSON(), null, Phaser.Tilemap.TILED_JSON);
            //Tilmap zusätzlich als JSON laden, um den JSON Text zu erhalten
            this.game.load.json(Bachelorarbeit.Config.GAME_MAP.getKey(), Bachelorarbeit.Config.GAME_MAP.getJSON());
            this.game.load.image(Bachelorarbeit.Config.GAME_MAP_PLANTS.getKey(), Bachelorarbeit.Config.GAME_MAP_PLANTS.getImage());
            this.game.load.image(Bachelorarbeit.Config.GAME_MAP_REED.getKey(), Bachelorarbeit.Config.GAME_MAP_REED.getImage());
            this.game.load.image(Bachelorarbeit.Config.GAME_MAP_SANDWATER.getKey(), Bachelorarbeit.Config.GAME_MAP_SANDWATER.getImage());
            //Debug für künstliche Verzögerung:
            //this.load.audio(Config.BIGFILE_SOUND.getKey(), Config.BIGFILE_SOUND.getAudio(), true);
            this.game.load.atlasJSONArray(Bachelorarbeit.Config.INGAME.getKey(), Bachelorarbeit.Config.INGAME.getImage(), Bachelorarbeit.Config.INGAME.getJSON());
        };
        Preloader.prototype.startLoad = function () {
            //Callback für Fertigstellung des Ladevorgangs setzen
            this.game.load.onLoadComplete.add(this.loadComplete, this);
            //Text erstellen
            this.text = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 70, Bachelorarbeit.Config.LOADING_TEXT, Bachelorarbeit.Config.TEXT_STYLE);
            //Text horizontal zentrieren
            this.text.anchor.set(0.5);
            //Lade-spinner erstellen
            this.loader = this.add.sprite(this.game.world.centerX, this.game.world.centerY, Bachelorarbeit.Config.LOADER.getKey());
            //Lade-spinner zentrieren
            this.loader.anchor.set(0.5);
            //Animation hinzufügen und starten
            this.loader.animations.add(Bachelorarbeit.Config.LOADER.getKey(), Bachelorarbeit.Config.LOADER_IMAGES);
            this.loader.animations.play(Bachelorarbeit.Config.LOADER.getKey(), 15, true); //halbe Geschwindigkeit 
            //Gruppe für Tween erstellen und Text und Lade-spinner hinzufügen
            this.group = this.game.add.group();
            this.group.add(this.text);
            this.group.add(this.loader);
        };
        Preloader.prototype.loadComplete = function () {
            //Animation stoppen
            this.loader.animations.stop(Bachelorarbeit.Config.LOADER.getKey());
            //Text ändern
            this.text.setText(Bachelorarbeit.Config.LOADING_COMPLETE_TEXT);
            //Text neu zentrieren, da breite sich geändert hat
            this.text.anchor.set(0.5);
            //Tween zum fade-out erstellen, alpha = opacity (Deckkraft)
            var tween = this.add.tween(this.group).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
            //Callback für Fertigstellung der Tween-Änderung setzen
            tween.onComplete.add(this.startMenu, this);
        };
        Preloader.prototype.startMenu = function () {
            this.game.state.start(Bachelorarbeit.Config.MENU_STATE, true, false);
        };
        return Preloader;
    }(Phaser.State));
    Bachelorarbeit.Preloader = Preloader;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var SpeedItem = /** @class */ (function (_super) {
        __extends(SpeedItem, _super);
        function SpeedItem(game, gameState, collectors) {
            return _super.call(this, game, gameState, Bachelorarbeit.Config.ITEM_SPEED, collectors, Bachelorarbeit.ItemType.SPEED) || this;
        }
        return SpeedItem;
    }(Bachelorarbeit.Item));
    Bachelorarbeit.SpeedItem = SpeedItem;
})(Bachelorarbeit || (Bachelorarbeit = {}));
var Bachelorarbeit;
(function (Bachelorarbeit) {
    var StarItem = /** @class */ (function (_super) {
        __extends(StarItem, _super);
        function StarItem(game, gameState, collectors) {
            return _super.call(this, game, gameState, Bachelorarbeit.Config.ITEM_STAR, collectors, Bachelorarbeit.ItemType.STAR) || this;
        }
        return StarItem;
    }(Bachelorarbeit.Item));
    Bachelorarbeit.StarItem = StarItem;
})(Bachelorarbeit || (Bachelorarbeit = {}));
//# sourceMappingURL=app.js.map