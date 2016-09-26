import Ship from "./Ship";
import {
	L_ANI_TIME,
	B_ANI_TIME,
	M_ANI_TIME,
	S_ANI_TIME,
	pt2px,
	mix_options
} from "../const";

export default class HP extends PIXI.Graphics {
	ship: Ship;
	constructor(ship) {
		super();
		this.ship = ship;
		this.setHP(1);
	}
	setHP(percentage) {
		this.clear();

		percentage = Math.min(Math.max(parseFloat(percentage), 0), 1);
		const width = pt2px(40);
		const height = pt2px(5);
		const borderWidth = pt2px(1);

		this.lineStyle(borderWidth, 0x000000, 1);
		this.beginFill(0xEEEEEE);
		this.drawRoundedRect(0, 0, width + borderWidth, height + borderWidth, height / 4);
		this.endFill();

		this.lineStyle(0, 0x000000, 1);
		this.beginFill(0x33EE33);
		this.drawRoundedRect(borderWidth / 2, borderWidth / 2, width * percentage, height, height / 4);
		this.endFill();

	}
	update(delay: number) {
		const ship_config = this.ship.config;
		this.x = ship_config.x - ship_config.size;
		this.y = ship_config.y + ship_config.size + this.height / 2;
	}
}