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
// import Gun from "../Gun";
import Bullet, { BulletConfig } from "../Bullet";

export default function BulletDrawer(self: Bullet, config: BulletConfig) {
	const body = self.body;

	body.clear();
	body.lineStyle(config.density, 0x5d5d5d, 1);
	body.beginFill(config.body_color);

	if (config.type === "normal") {
		// 绘制外观形状
		body.drawCircle(config.size / 2, config.size / 2, config.size);
		self.pivot.set(config.size / 2, config.size / 2);

		// 绘制物理形状
		self.body_shape = new p2.Circle({
			radius: config.size,
		});
	} else if (config.type === "track-ship") {
		var vertices = [];
		for (let i = 0, N = 3; i < N; i++) {
			var a = 2 * Math.PI / N * i;
			var vertex = [config.size * Math.cos(a), config.size * Math.sin(a)]; // Note: vertices are added counter-clockwise
			vertices.push(vertex);
		}
		// 绘制外观形状
		let first_item = vertices[0];
		body.moveTo(first_item[0], first_item[1]);
		for (let i = 1, item; item = vertices[i]; i += 1) {
			body.lineTo(item[0], item[1]);
		}
		body.lineTo(first_item[0], first_item[1]);
		// 绘制物理形状
		self.body_shape = new p2.Convex({
			vertices: vertices
		});
	}

	// 收尾外观绘制
	body.endFill();
	self.addChild(body);

	// 收尾物理设定D
	self.body_shape.material = self.constructor["material"];
	// self.body_shape.sensor = true;
	self.body_shape["bullet_team_tag"] = config.team_tag;
	// self.p2_body.damping = self.p2_body.angularDamping = 0;// 1/config.penetrate;
	self.p2_body.addShape(self.body_shape);
	self.p2_body.setDensity(config.density);
}