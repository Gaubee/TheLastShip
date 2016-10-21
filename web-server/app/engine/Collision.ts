declare const require;
declare const process;

var uuid = 0;

// import TWEEN from "../../class/Tween";
// const Easing = TWEEN.Easing;
import {
    assign,
    _isNode,
} from "../const";

export class P2I extends PIXI.Container {
    _id = "I" + ((uuid++) / 1000000).toFixed(6).substr(2)
    conName: string
    p2_body: p2.Body = new p2.Body({ mass: 1 })
    world: p2.World = null
    config: any = {
        x: 0,
        y: 0,
        density:1,
    }
    static material = new p2.Material();
    constructor(world?: p2.World) {
        super();
        var self = this;
        this.conName = this.constructor["name"];
        this.world = world;
        world && world.addBody(this.p2_body);

        this.on("add-to-world", (new_world: p2.World) => {
            new_world.addBody(this.p2_body);
            this.world = new_world;
        });

        this.on("destroy", () => {
            this.world && this.world.removeBody(this.p2_body);
            this.parent && this.parent.removeChild(this);
            this.destroy();
        });

        // 闪动动画
        this.once("flash",function _flash(){
            var acc_delay = 0;
            var dif_alpha = 0.5;
            var flash_ani = 250;
            var flash_time = 3;
            var total_ani = flash_ani * flash_time;
            function _update(delay) {
                acc_delay += delay;
                var progress = (acc_delay%flash_ani) / flash_ani ;
                if(progress>0.5) {
                    progress = 1 - progress;
                }
                progress *= 2;
                // /\/\/\
                self.alpha = 1 - progress * dif_alpha;
                if(acc_delay>=total_ani) {
                    self.emit("stop-flash");
                }
            }
            self.on("update",_update);
            self.once("stop-flash",function () {
                self.alpha = 1;
                self.off("update", _update);
                self.once("flash", _flash);
            });
        });
    }
    update(delay: number) {
        var p2_body = this.p2_body;
        var config = this.config;
        this.x = config.x = p2_body.interpolatedPosition[0]
        this.y = config.y = p2_body.interpolatedPosition[1]

        this.emit("update",delay);
    }
    changeMass(mass:number){
        this.p2_body.mass = mass;
        this.p2_body.updateMassProperties();
    }
    setConfig(new_config){
        this.p2_body["__changed"] = true;
    }
    toJSON(){
        return {
            id:this._id,
            type:this["constructor"]["name"],
            config:this.config
        }
    }
    setTimeout(cb, time:number){
        var self = this;
        self.on("update", function _(delay) {
            time -= delay;
            if(time <= 0){
                self.off("update", _);
                cb();
            }
        });
    }
} 