module Bachelorarbeit {

    export abstract class Asset {
        protected assetName: string;
        constructor(assetName: string) {
            this.assetName = assetName;
        }
        public getKey(): string {
            let index: number = this.assetName.lastIndexOf("/");
            if (index != -1) {
                return this.assetName.substring(index+1);
            } else {
                return this.assetName;
            }
        }
    }
    export class ImageAsset extends Asset {
        constructor(assetName: string) {
            super(assetName);
        }
        public getImage(): string {
            return this.assetName + ".png";
        }
    }
    export class JSONSpritesheetAsset extends ImageAsset {
        constructor(assetName: string) {
            super(assetName);
        }
        public getJSON(): string {
            return this.assetName + ".json";
        }
    }
    export class AudioAsset extends Asset {
        constructor(assetName: string) {
            super(assetName);
        }
        public getAudio(): string {
            return this.assetName + ".mp3";
        }
    }

    export class Config {
        //Verzeichnisse
        public static ASSETS_DIR: string = "assets/";
        public static SOUNDS_DIR: string = Config.ASSETS_DIR + "sounds/";
        public static IMAGES_DIR: string = Config.ASSETS_DIR + "images/";

        //Spritesheets
        public static LOADER = new JSONSpritesheetAsset(Config.IMAGES_DIR + "loader"); 
        public static LOADER_IMAGES: string[] = ["Android_style_loader_frame_0001.png", "Android_style_loader_frame_0002.png", "Android_style_loader_frame_0003.png", "Android_style_loader_frame_0004.png", "Android_style_loader_frame_0005.png", "Android_style_loader_frame_0006.png", "Android_style_loader_frame_0007.png", "Android_style_loader_frame_0008.png",];
        public static INGAME = new JSONSpritesheetAsset(Config.IMAGES_DIR + "ingame"); 
        public static EXPLOSION = new ImageAsset(Config.IMAGES_DIR + "explosion");
        public static EXPLOSION_FRAME_SIZE: number = 64;
        public static EXPLOSION_FRAME_COUNT: number = 16;

        //TileMap
        public static GAME_MAP = new JSONSpritesheetAsset(Config.IMAGES_DIR + "gamemap"); 
        public static GAME_MAP_PLANTS = new ImageAsset(Config.IMAGES_DIR + "plants"); 
        public static GAME_MAP_REED = new ImageAsset(Config.IMAGES_DIR + "reed"); 
        public static GAME_MAP_SANDWATER = new ImageAsset(Config.IMAGES_DIR + "sandwater"); 
        public static LAYER_NAME_LAND: string = "festland";
        public static LAYER_NAME_PLANTS: string = "pflanzen";
        public static LAYERS_ATTRIBUTE_JSON: string = "layers";

        //Hintergrundfarbe
        public static BACKGROUND_COLOR: string = "#156c99"; //Blau

        //Images
        public static LOGO = new ImageAsset(Config.IMAGES_DIR + "logo");

        //Sounds
        public static INGAME_SOUND = new AudioAsset(Config.SOUNDS_DIR + "ingame");
        public static SHOT_SOUND = new AudioAsset(Config.SOUNDS_DIR + "shot");
        public static EXPLOSION_SOUND = new AudioAsset(Config.SOUNDS_DIR + "explosion");
        public static ITEM_SOUND = new AudioAsset(Config.SOUNDS_DIR + "levelup");
        //Debug
        public static BIGFILE_SOUND = new AudioAsset(Config.SOUNDS_DIR + "bigfile");

        //Sprite Namen
        public static BOAT_PLAYER: string = "ship_small_body.png";
        public static BOAT_PLAYER_DEAD: string = "ship_small_body_destroyed.png";
        public static BOAT_ENEMY: string = "ship_small_b_body.png";
        public static BOAT_ENEMY_DEAD: string = "ship_small_body_b_destroyed.png";
        public static BOAT_WAVES: string[] = ["water_ripple_small_000.png", "water_ripple_small_001.png", "water_ripple_small_002.png", "water_ripple_small_003.png", "water_ripple_small_004.png"];
        public static BOAT_CANON: string = "ship_gun_gray.png";
        public static BULLET: string = "bullet.png";
        public static ITEM_MEDI: string = "medi.png";
        public static ITEM_SPEED: string = "speed.png";
        public static ITEM_STAR: string = "star.png";

        //Text-Styles
        public static TEXT_STYLE = { fill: "#ffffff" };
        public static TEXT_STYLE_MENU = { fill: "#f21515" };

        //GameState Keys
        public static BOOT_STATE: string = "Boot";
        public static PRELOAD_STATE: string = "Preload";
        public static MENU_STATE: string = "Menu";
        public static INGAME_STATE: string = "InGame";
        public static HTML_DIV_ID: string = "content";

        //Texte für GUI
        public static LOADING_TEXT: string = "Loading...";
        public static LOADING_COMPLETE_TEXT: string = "Loading complete";
        public static GAME_TITLE: string = "Pirates";
        public static MENU_OPTIONS: string[] = ["easy","medium","difficult"];
        public static COMPUTER_NAME_PREFIX: string = "Enemy";

    }
}