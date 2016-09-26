var uuid = 0;

export class P2I extends PIXI.Container {
    _id = "ID_" + ((uuid++) / 1000000).toFixed(6).substr(2)
    conName: string
    p2_body: p2.Body = new p2.Body({ mass: 1 })
    world: p2.World = null
    config: any = {
        x: 0,
        y: 0
    }
    constructor(world?: p2.World) {
        super();
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

    }
    update(delay: number) {
        var p2_body = this.p2_body;
        var config = this.config;
        this.x = config.x = p2_body.position[0]
        this.y = config.y = p2_body.position[1]
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
} 