import Ship from "./Ship";
import Flyer from "./Flyer";
import TWEEN from "../../class/Tween";
import {
	L_ANI_TIME,
	B_ANI_TIME,
	M_ANI_TIME,
	S_ANI_TIME,
	pt2px,
	mix_options
} from "../const";

export default class HP extends PIXI.Graphics {
	owner: Ship|Flyer;
	ani: TWEEN;
	source_width:number
	constructor(owner,ani:TWEEN) {
		super();
		this.owner = owner;
		this.ani = ani;
		this.source_width = owner.config.size*2||owner.width||pt2px(40);
		const owner_config = owner.config;

		this.setHP(owner_config.cur_hp/owner_config.max_hp);
	}
	show_ani = null
	setHP(percentage?) {
		this.clear();
		if(!isFinite(percentage)) {
			var owner_config = this.owner.config;
			percentage = owner_config.cur_hp/owner_config.max_hp
		}
		percentage = Math.min(Math.max(parseFloat(percentage), 0), 1);
		const width = this.source_width;
		const height = Math.min(width/8, pt2px(4));
		const borderWidth = height/5;

		this.lineStyle(borderWidth, 0x000000, 1);
		this.beginFill(0xEEEEEE);
		this.drawRoundedRect(0, 0, width + borderWidth, height + borderWidth, height / 4);
		this.endFill();

		this.lineStyle(0, 0x000000, 1);
		this.beginFill(0x33EE33);
		this.drawRoundedRect(borderWidth / 2, borderWidth / 2, width * percentage, height, height / 4);
		this.endFill();

		if(this.alpha !==1) {
			this.ani.Tween(this)
				.to({
					alpha:1
				},B_ANI_TIME)
				.easing(TWEEN.Easing.Quartic.Out)
				.start();
		}

		clearTimeout(this.show_ani);
		if(percentage === 1) {// 非满血不隐藏
			this.show_ani = setTimeout(() => {
				this.ani.Tween(this)
					.to({
						alpha:0
					},L_ANI_TIME)
					.easing(TWEEN.Easing.Quartic.In)
					.start();
			}, 5000);
		}
	}
	update(delay: number) {
		const owner_config = this.owner.config;
		this.x = owner_config.x - owner_config.size;
		this.y = owner_config.y + owner_config.size + this.height / 2;
	}
}