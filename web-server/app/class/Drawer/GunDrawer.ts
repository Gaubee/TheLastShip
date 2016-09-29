import {
	L_ANI_TIME,
	B_ANI_TIME,
	M_ANI_TIME,
	S_ANI_TIME,
	pt2px,
	mix_options,
	_isBorwser,
	_isNode,
} from "../../const";
import Victor from "../../engine/Victor";
import Gun from "../Gun";

export default function GunDrawer(self: Gun, config, typeInfo) {
	const ship = self.owner;
	const body = self.gun;
	const typeInfoArgs = typeInfo.args || {};
	if (typeInfoArgs.lineStyle instanceof Array) {
		body.lineStyle.apply(body, typeInfoArgs.lineStyle);
	} else {
		body.lineStyle(pt2px(1.5), 0x000000, 1);
	}
	if (isFinite(typeInfoArgs.fill)) {
		body.beginFill(+typeInfoArgs.fill);
	} else {
		body.beginFill(0x666666);
	}

	if (typeInfo.type === "rect") {
		// 绘制外观形状
		const gun_height = typeInfoArgs.height;
		const gun_width = typeInfoArgs.width;

		body.drawRect(0, 0, gun_width, gun_height);

		var dir = new Victor(ship.config.size,0);
		var offset = new Victor(isFinite(typeInfoArgs.x) ? +typeInfoArgs.x : 0,isFinite(typeInfoArgs.y) ? +typeInfoArgs.y : 0);
		// self.x = ship.config.size * 2 + (isFinite(typeInfoArgs.x) ? +typeInfoArgs.x : 0);
		// self.y = ship.config.size * 1 - gun_height / 2 + (isFinite(typeInfoArgs.y) ? +typeInfoArgs.y : 0);
		// self.pivot.set(-gun_width / 2, gun_height / 2);
		// self.rotation = config.rotation;
        self.pivot.set(0, gun_height/2);
        self.rotation = config.rotation;
        
		dir.rotate(config.rotation);
		offset.rotate(config.rotation);
		self.x = dir.x+offset.x+ship.config.size;
		self.y = dir.y+offset.y+ship.config.size;
	}
	// 收尾外观绘制
	body.endFill();
	self.addChild(body);
}