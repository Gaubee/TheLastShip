import pixelCollision from "../class/pixelCollision";
export const current_stage = new PIXI.Container();

import {
    VIEW,
    L_ANI_TIME,
    B_ANI_TIME,
    M_ANI_TIME,
    S_ANI_TIME,
    on,
    square,
    stageManager,
    renderer,
    pt2px,
    emitReisze
} from "./common";

export const loader = new PIXI.loaders.Loader();
loader.add("人物", "res/game_0009_人物.png");
loader.add("道具：钱", "res/game_0005_道具：钱.png");
loader.load();
loader.once("complete", renderInit);
function renderInit(loader: PIXI.loaders.Loader, resource: PIXI.loaders.ResourceDictionary) {
    var info = new PIXI.Text("zz", { font: "25px 微软雅黑", fill: "#000" });
    info.position.y = VIEW.HEIGHT - info.height;
    current_stage.addChild(info);

    var man = new PIXI.Sprite(resource["人物"].texture);
    man.scale.set(-1.2, 1);
    var _s = 0;
    var _a = 0;
    setInterval(function () {
        man.scale.set(Math.sin(_s), 1);
        man.anchor.set(Math.sin(_a), 0);
        _s += 0.01;
        _a += 0.001;
    });
    // man.anchor.set(0.5, 0.5);
    man.position = VIEW.CENTER;
    current_stage.addChild(man);

    var prop = new PIXI.Sprite(resource["道具：钱"].texture);
    prop.anchor.set(0.5, 0.5);
    on(current_stage, "mousemove", function (e) {
        prop.position.set(e.data.global.x, e.data.global.y);
        if (pixelCollision(man, prop)) {
            info.text = "!!"
        } else {
            info.text = "zz"
        }
    });
    current_stage.addChild(prop);

    var FPS_Text = new PIXI.Text("FPS:0", { font: '24px Arial', fill: 0x00ffff33, align: "left" });
    const FPS_ticker = new PIXI.ticker.Ticker();

    current_stage.addChild(FPS_Text);
    FPS_ticker.add(function () {
        FPS_Text.text = "FPS:" + FPS_ticker.FPS.toFixed(2) + " S:" + man.scale.x.toFixed(2) + " A:" + man.anchor.x.toFixed(2)
            + "\n B:" + JSON.stringify(man.getBounds())
            + "\n P:" + [man.x, man.y, man.width, man.height];
    });

    FPS_ticker.start();

}
