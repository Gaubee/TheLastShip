import {renderer, VIEW, stageManager} from "./common";
import {current_stage_wrap as g_stage} from "./game2";
import {current_stage_wrap as ol_stage} from "./game-oline";
import {current_stage_wrap as l_stage} from "./loader";
import {pomelo} from "./engine/Pomelo";

stageManager.add(l_stage, g_stage);

stageManager.set(l_stage);

var host = location.hostname;
var port = "3051";
pomelo.init({
    host: host,
    port: port,
    log: true
}, function () {
// 初始化本机ID
    var mac_ship_id = localStorage.getItem("MAC-SHIP-ID");
    if(!mac_ship_id){
        mac_ship_id = (Math.random()*Date.now()).toString().replace(".","");
        localStorage.setItem("MAC-SHIP-ID", mac_ship_id);
    }

    // 随机选择服务器
    pomelo.request("gate.gateHandler.queryEntry", "hello pomelo", function (data) {
        if (data.code === 200) {
            pomelo.init({
                host: data.host,
                port: data.port,
                log: true
            }, function () {
                l_stage.emit("connected",function _(username) {
                    // 发送名字，初始化角色
                    pomelo.request("connector.entryHandler.enter", {
                        username: username,
                        mac_ship_id: mac_ship_id,
                        width: document.body.clientWidth,
                        height: document.body.clientHeight,
                    }, function (game_info) {
                        if(game_info.code===500) {
                            console.log(game_info);
                            if( game_info.error == "重复登录") {
                                l_stage.emit("connected",_,"名字已被使用，请重新输入");
                            }
                        }else{
                            ol_stage.emit("before-active", game_info);
                            stageManager.set(ol_stage);
                        }
                    });
                });
            });
        } else {
            console.error(data);
        }
    });
});
// stageManager.set(g_stage);


function animate() {
    renderer.render(stageManager.get());
    requestAnimationFrame(animate);
}

animate();