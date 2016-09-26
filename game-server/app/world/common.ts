import * as _const from "../../../web-server/app/const";
export const VIEW = {
    WIDTH: 1000,
    HEIGHT: 600,
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
