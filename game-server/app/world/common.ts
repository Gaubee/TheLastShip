import * as _const from "../../../web-server/app/const";
import * as worldConfig from "../../config/world.json";
console.log(worldConfig)
export const VIEW = {
    WIDTH: worldConfig["width"]||1000,
    HEIGHT:  worldConfig["height"]||600,
    CENTER: {
        get x() {
            return VIEW.WIDTH / 2
        },
        get y() {
            return VIEW.HEIGHT / 2
        }
    }
}
const common = Object.assign({VIEW},_const)
export default common;
