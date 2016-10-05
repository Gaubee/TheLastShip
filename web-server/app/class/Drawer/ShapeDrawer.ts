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

export default function ShapeDrawer(self, config, typeInfo) {
	const body = self.body;
	const typeInfoArgs = typeInfo.args||{};

	// 清空原有的绘制与物理设定
	if(self.body_shape) {
		self.p2_body.removeShape(self.body_shape);
		body.clear();
	}

	if(typeInfoArgs.lineStyle instanceof Array) {
		body.lineStyle.apply(body, typeInfoArgs.lineStyle);
	}else{
		body.lineStyle(pt2px(1.5), 0x000000, 1);
	}
	if(isFinite(typeInfoArgs.fill)) {
		body.beginFill(+typeInfoArgs.fill);
	}else{
		body.beginFill(config.body_color);
	}
	if (typeInfo.type === "Circle") {
		// 绘制外观形状
		body.drawCircle(config.size, config.size, config.size);
		self.pivot.set(config.size, config.size);
		// 绘制物理形状
		self.body_shape = new p2.Circle({
			radius: config.size,
		});
	} else if (typeInfo.type === "Box") {
		// 绘制外观形状
		body.drawRect(0, 0, config.size * 2, config.size * 2);
		self.pivot.set(config.size, config.size);
		// 绘制物理形状
		self.body_shape = new p2.Box({
			width: config.size * 2,
			height: config.size * 2,
		});
	} else if (typeInfo.type === "Convex") {
		var vertices = [];
		for (let i = 0, N = typeInfoArgs.vertices_length; i < N; i++) {
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
	// 收尾物理设定
	self.body_shape.material = self.constructor.material;
	self.p2_body.addShape(self.body_shape);
	self.p2_body.setDensity(config.density);
}