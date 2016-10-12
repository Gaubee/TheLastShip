import {renderer, VIEW, stageManager} from "./common";
import {current_stage_wrap as g_stage} from "./game2";
import {current_stage_wrap as e_stage} from "./editor";
import {current_stage_wrap as ol_stage} from "./game-oline";
import {current_stage_wrap as l_stage} from "./loader";
import {current_stage_wrap as t_stage} from "./test-quadtree-world";

import {pomelo} from "./engine/Pomelo";

stageManager.add(l_stage, g_stage);

stageManager.set(l_stage);
if(location.hash==="#test") {
    stageManager.set(t_stage);
}else if(location.hash==="#game") {
    stageManager.set(g_stage);
}else if(location.hash==="#editor") {
    stageManager.set(e_stage);
}else{
    var host = location.hostname;
    var port = "3051";
    pomelo.init({
        host: host,
        port: port,
        log: true
    }, function () {
        // 随机选择服务器
        pomelo.request("gate.gateHandler.queryEntry", "hello pomelo", function (data) {
            if (data.code === 200) {
                pomelo.init({
                    host: data.host,
                    port: data.port,
                    log: true
                }, function () {
                    l_stage.emit("connected",function _(username) {
                        ol_stage.emit("enter",username,function (err,game_info) {
                            if(err) {
                                l_stage.emit("connected",_,err);
                            }else{
                                ol_stage.emit("before-active", game_info);
                                stageManager.set(ol_stage);
                            }
                        })
                    });
                });
            } else {
                alert("服务异常！请尝试刷新浏览器")
                console.error(data);
            }
        },{
            time_out: 1000,
            is_once: true
        });
    });
}


function animate() {
    renderer.render(stageManager.get());
    requestAnimationFrame(animate);
}

animate();