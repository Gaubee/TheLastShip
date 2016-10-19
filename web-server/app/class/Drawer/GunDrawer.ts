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
	const ship = self.owner;// 注意，因为Gun对象不是在网络中传输过来的，而是直接通过Ship的type绘制出来的，所以这里能直接引用ship对象
	const body = self.gun;
	body.clear();
	const typeInfoArgs = typeInfo.args || {};
	var lineStyle = typeInfoArgs.lineStyle;
	if (!(lineStyle instanceof Array)) {
		lineStyle = [pt2px(1.5), 0x5d5d5d, 1];
	}
	var fill = typeInfoArgs.fill;
	if (!isFinite(typeInfoArgs.fill)) {
		fill = config.is_ctrl_by_AI ? 0x99aaff : 0x999999;
	}
	body.lineStyle.apply(body, lineStyle);
	body.beginFill(fill);

	// 绘制外观形状
	if (typeInfo.type === "rect") {
		const gun_height = typeInfoArgs.height;
		const gun_width = typeInfoArgs.width;

		body.drawRect(0, 0, gun_width, gun_height);

		let dir = new Victor(ship.config.size, 0);
		let offset = new Victor(isFinite(typeInfoArgs.x) ? +typeInfoArgs.x : 0, isFinite(typeInfoArgs.y) ? +typeInfoArgs.y : 0);

		self.pivot.set(0, gun_height / 2);
		self.rotation = config.rotation;

		dir.rotate(config.rotation);
		offset.rotate(config.rotation);
		self.x = dir.x + offset.x + ship.config.size;
		self.y = dir.y + offset.y + ship.config.size;
	} else if (typeInfo.type === "trapezoid") {
		const gun_height = typeInfoArgs.height;
		const gun_width = typeInfoArgs.width;
		const gun_end_height = typeInfoArgs.endHeight;
		const gun_dif_height = (gun_height - gun_end_height) / 2;

		body.drawPolygon([
			0, 0,
			gun_width, gun_dif_height,
			gun_width, gun_dif_height + gun_end_height,
			0, gun_height
		]);

		let dir = new Victor(ship.config.size, 0);
		let offset = new Victor(isFinite(typeInfoArgs.x) ? +typeInfoArgs.x : 0, isFinite(typeInfoArgs.y) ? +typeInfoArgs.y : 0);

		self.pivot.set(0, gun_height / 2);
		self.rotation = config.rotation;

		dir.rotate(config.rotation);
		offset.rotate(config.rotation);
		self.x = dir.x + offset.x + ship.config.size;
		self.y = dir.y + offset.y + ship.config.size;
	} else if (typeInfo.type === "circle+rect") {
		const rect_width = typeInfoArgs.rect_width;
		const rect_height = typeInfoArgs.rect_height;
		const rect_x = typeInfoArgs.rect_x;
		const rect_y = typeInfoArgs.rect_y;
		const circle_radius = typeInfoArgs.circle_radius;
		const circle_x = typeInfoArgs.circle_x;
		const circle_y = typeInfoArgs.circle_y;
		const circle_config_rotation = typeInfoArgs.circle_config_rotation;

		let circle_dir = new Victor(ship.config.size, 0);
		let circle_offset = new Victor(circle_x, circle_y);

		circle_dir.rotate(circle_config_rotation);
		circle_offset.rotate(circle_config_rotation);

		if (!body["__gun_helper"]) {
			body["__gun_helper"] = new PIXI.Graphics();
			// 紧跟body下面
			ship.addChildAt(body["__gun_helper"], ship.children.indexOf(ship.body));
			body.on("destroy", function() {
				ship.removeChild(body["__gun_helper"]);
				body["__gun_helper"].destroy();
			});
		}
		const ship_gun_helper: PIXI.Graphics = body["__gun_helper"];
		ship_gun_helper.clear();
		ship_gun_helper.lineStyle.apply(ship_gun_helper, lineStyle);
		ship_gun_helper.beginFill(fill);
		ship_gun_helper.drawCircle(0, 0, circle_radius);
		ship_gun_helper.endFill();
		ship_gun_helper.x = circle_dir.x + circle_offset.x + ship.config.size;
		ship_gun_helper.y = circle_dir.y + circle_offset.y + ship.config.size;

		body.drawRect(0, 0, rect_width, rect_height);
		let rect_dir = new Victor(ship.config.size, 0);
		let rect_offset = new Victor(rect_x, rect_y);
		rect_dir.rotate(config.rotation);
		rect_offset.rotate(config.rotation);
		body.pivot.set(0, rect_height / 2);
		self.rotation = config.rotation;
		self.x = rect_dir.x + rect_offset.x + ship.config.size;
		self.y = rect_dir.y + rect_offset.y + ship.config.size;
		// setInterval(function() {
		// 	self.setConfig({
		// 		rotation: self.config.rotation + Math.PI * 0.001
		// 	})
		// })
	} else if (typeInfo.type === "rect+trapezoid") {
		const rect_x = typeInfoArgs.rect_x;
		const rect_y = typeInfoArgs.rect_y;
		const rect_width = typeInfoArgs.rect_width;
		const rect_height = typeInfoArgs.rect_height;
		const trapezoid_width = typeInfoArgs.trapezoid_width;
		const trapezoid_endHeight = typeInfoArgs.trapezoid_endHeight;
		const trapezoid_dif_height = (rect_height - trapezoid_endHeight) / 2;

		body.drawPolygon([
			0, 0
			, rect_width, 0
			, rect_width + trapezoid_width, trapezoid_dif_height
			, rect_width + trapezoid_width, trapezoid_dif_height + trapezoid_endHeight
			, rect_width, rect_height
			, 0, rect_height
		]);
		body.pivot.set(0, rect_height / 2);
		let rect_dir = new Victor(ship.config.size, 0);
		let rect_offset = new Victor(rect_x, rect_y);
		rect_dir.rotate(config.rotation);
		rect_offset.rotate(config.rotation);
		self.rotation = config.rotation;
		self.x = rect_dir.x + rect_offset.x + ship.config.size;
		self.y = rect_dir.y + rect_offset.y + ship.config.size;
	}
	// 收尾外观绘制
	body.endFill();
	self.addChild(body);
}