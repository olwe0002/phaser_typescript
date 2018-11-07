module Bachelorarbeit {

	export class Pirates extends Phaser.Game {

		constructor() {
			super(1280, 960, Phaser.AUTO, Config.HTML_DIV_ID, null); //Seitenverhältnis 4:3, weil Spielekarte dieses Verhältnis auch hat
			//Gamestates anlegen ohne Autostart 
			this.state.add(Config.BOOT_STATE, Boot, false);
			this.state.add(Config.PRELOAD_STATE, Preloader, false);
			this.state.add(Config.MENU_STATE, Menu, false);
			this.state.add(Config.INGAME_STATE, InGame, false);
			//ersten Gamestate starten
			this.state.start(Config.BOOT_STATE);
		}

		public getHtmlDivId(): string {
			return Config.HTML_DIV_ID;
		}
	}

}

// anonyme Funktion zur Erstellung des Spiel-Objektes bei onLoad der Seite
window.onload = () => {
	let game = new Bachelorarbeit.Pirates();
	//Fokus auf das Spiel setzen
	document.getElementById(game.getHtmlDivId()).focus();
}

