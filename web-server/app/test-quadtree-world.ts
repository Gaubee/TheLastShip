/// <reference path="../typings/pixi.js/pixi.js.d.ts" />
import BackgroundGaussianBlur from "../class/BackgroundGaussianBlur";
import SVGGraphics from "../class/SVGGraphics";
import TWEEN, {
	Tween
} from "../class/Tween";
import When from "../class/When";

// import Dialog from "./Dialog";
// import {Mask, MaskFactory} from "./Mask";
import Flyer from "./class/Flyer";
import Ship from "./class/Ship";
import Wall from "./class/Wall";
import Bullet from "./class/Bullet";

import {
	P2I
} from "./engine/Collision";
import Victor from "./engine/Victor";
import {
	engine
} from "./engine/world";
import QuadTreeWorld from "./engine/QuadTreeWorld";
// import {pomelo} from "./engine/Pomelo";

import {
	VIEW,
	on,
	square,
	stageManager,
	renderer,
	emitReisze,
	touchManager,
} from "./common";

import {
	L_ANI_TIME,
	B_ANI_TIME,
	M_ANI_TIME,
	S_ANI_TIME,
	pt2px,
	mix_options,
	_isBorwser,
	_isNode,
	_isMobile,
} from "./const";
import * as UX from "./ux";

const ani_ticker = new PIXI.ticker.Ticker();
const ani_tween = new TWEEN();
const jump_tween = new TWEEN();
const FPS_ticker = new PIXI.ticker.Ticker();

export const current_stage_wrap = new PIXI.Graphics();
export const current_stage = new PIXI.Container();
current_stage_wrap.addChild(current_stage);
//加载图片资源
export const loader = new PIXI.loaders.Loader();

loader.add("button", "./res/game_res.png")

loader.load();

const loading_text = new PIXI.Text("游戏加载中……", {
	font: pt2px(25) + "px 微软雅黑",
	fill: "#FFF"
});
current_stage.addChild(loading_text);

function renderInit(loader: PIXI.loaders.Loader, resource: PIXI.loaders.ResourceDictionary) {
	for (var i = 0, len = current_stage.children.length; i < len; i += 1) {
		current_stage.removeChildAt(0)
	}
	/**素材加载
	 * 初始化场景
	 */
	function drawPlan() {
		current_stage_wrap.clear();
		current_stage_wrap.beginFill(0xd5d5d5, 1);
		current_stage_wrap.drawRect(0, 0, VIEW.WIDTH, VIEW.HEIGHT);
		current_stage_wrap.endFill();
	}
	current_stage_wrap.on("resize", drawPlan);
	drawPlan();

	var qtw = new QuadTreeWorld({
		width:4400,
		height:4400,
		x:0,
		y:0
	});
	var unit_size = 200;
	for (var i = 0; i <= qtw.WIDTH; i += unit_size) {
		for (var j = 0; j <= qtw.WIDTH; j += unit_size) {
			var fly = new Flyer({
				x: i,
				y: j
			});
			((fly, i, j)=>{
				var ani_time = 1000;
				var ani_size = 200;
				var acc_time = 0;
				ani_ticker.add(function(delay){
					fly.x = i + ani_size*Math.cos(Math.PI*2*acc_time/ani_time)
					fly.y = j + ani_size*Math.sin(Math.PI*2*acc_time/ani_time)
					acc_time += delay;
				});
			})(fly, i, j)
			qtw.insert(fly);
			fly.cacheAsBitmap = true;
			current_stage.addChild(fly);
		}
	}

	ani_ticker.add(function(){
		qtw.refresh();
		var len = current_stage.children.length;
		while(len>0){
			len -= 1;
			current_stage.children[len].alpha = 0.2;
		}
		qtw.getRectViewItems(view.x,view.y,view_width,view_height).forEach(fly=>{
			fly.alpha = 1;
		});
		current_stage.position.set(-view.x+VIEW.CENTER.x-view_width/2,-view.y+VIEW.CENTER.y-view_height/2);
	});

	var qtw_mash = new PIXI.Graphics();
	current_stage.addChild(qtw_mash);
	function drawNode(node){
		var node_bounds = node._bounds;
		qtw_mash.lineStyle(2,0x0033ff,1);
		qtw_mash.drawRect(node_bounds.x,node_bounds.y,node_bounds.width,node_bounds.height);
		node.nodes.forEach(c_node => drawNode(c_node));
	}
	ani_ticker.add(function(){
		qtw_mash.clear();
		drawNode(qtw.root);
	});


	on(current_stage_wrap,"keydown",(e)=>{
		if(e.keyCode===37) {
			view.x -= 10;
		}else if(e.keyCode === 39){
			view.x += 10;
		}else if(e.keyCode === 38){
			view.y -= 10;
		}else if(e.keyCode === 40){
			view.y += 10;
		}
	});

	var view_x = qtw.WIDTH/2;
	var view_y = qtw.HEIGHT/2;
	var view_width = 2500;
	var view_height = 2500;
	var view = new PIXI.Graphics();
	view.position.set(view_x,view_y)
	view.lineStyle(4,0xff0000,0.87);
	view.drawRect(0,0,view_width,view_height);
	current_stage.addChild(view);
    current_stage.pivot.set(-qtw.WIDTH ,-qtw.HEIGHT)
    current_stage.scale.set(0.4,0.4)

	// 触发布局计算
	emitReisze(current_stage_wrap);

	ani_tween.start();
	jump_tween.start();
	ani_ticker.start();
	FPS_ticker.start();



    /**帧率
     * 
     */
    var pre_ti
    var FPS_Text = new PIXI.Text("FPS:0", {
        font: '24px Arial',
        fill: 0x00ffff33,
        align: "left"
    });
    current_stage_wrap.addChild(FPS_Text);
    FPS_ticker.add(function () {
        FPS_Text.text = `FPS:${FPS_ticker.FPS.toFixed(0)} W:${VIEW.WIDTH} H:${VIEW.HEIGHT} 
        VIEW-X:${view.x}
        VIEW-Y:${view.y}`;
    });
}

loader.once("complete", function() {
	init_w.ok(2, []);
});

current_stage_wrap.on("init", function() {
	init_w.ok(1, []);
});
current_stage_wrap.on("active", function() {
	init_w.ok(0, []);
});
current_stage_wrap["_has_custom_resize"] = true;
current_stage_wrap.on("resize", function() {
	jump_tween.clear();
	ani_tween.clear();
	emitReisze(this);
});

const init_w = new When(3, () => {
	renderInit(loader, loader.resources);
});