declare const WeakMap;

import {
    P2I
} from "../../../../web-server/app/engine/Collision";
import Bullet from "../../../../web-server/app/class/Bullet";

const world: p2.World = new p2.World({
    gravity: [0, 0]
});
const worldStep = 1 / 60;

var planeShape = new p2.Plane();
var planeBody = new p2.Body({
    position: [0, 0]
});
planeBody.addShape(planeShape);
world.addBody(planeBody);
const _runNarrowphase = world.runNarrowphase;
world.runNarrowphase = function(np, bi, si, xi, ai, bj, sj, xj, aj, cm, glen) {
    // 如果si是飞船，无视同组的 普通子弹
    if (si["ship_team_tag"] &&
        si["ship_team_tag"] === sj["bullet_team_tag"]) {
        return;
    }
    // 同理sj
    if (sj["ship_team_tag"] &&
        sj["ship_team_tag"] === si["bullet_team_tag"]) {
        return;
    }
    // 如果si、sj都是子弹，无视同组的 普通子弹
    if (si["bullet_team_tag"] &&
        si["bullet_team_tag"] === sj["bullet_team_tag"]) {
        return;
    }
    return _runNarrowphase.call(this, np, bi, si, xi, ai, bj, sj, xj, aj, cm, glen);
};

var All_bullets = new WeakMap();
world.on("impact", function(evt) {
    if (All_bullets.has(evt.bodyA)) {
        var bullet = All_bullets.get(evt.bodyA);
        All_bullets.remove(evt.bodyA);
        bullet.emit("explode");
    } else if (All_bullets.has(evt.bodyB)) {
        bullet = All_bullets.get(evt.bodyB);
        All_bullets.remove(evt.bodyB);
        bullet.emit("explode");
    }
});

const p2is = [];
export const engine = {
    world: world,
    add(item: P2I) {
        if (item instanceof Bullet) {
            All_bullets.set(item.p2_body, item);
        }
        p2is.push(item);
        item.emit("add-to-world", world);
    },
    update(delay: number) {
        world.step(worldStep, delay / 100);
        p2is.forEach(p2i => p2i.update(delay));
    }
}