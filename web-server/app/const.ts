declare const process
export const _isNode = typeof process === "object";
export const _isBorwser = !_isNode;
export const _isMobile = this._isMobile;
const devicePixelRatio = typeof _isMobile === "boolean" && _isMobile ? 1 : 1;
const __pt2px = devicePixelRatio * 2;
export const pt2px = (pt) => pt * __pt2px;

export const L_ANI_TIME = 1225;
export const B_ANI_TIME = 375;
export const M_ANI_TIME = 225;
export const S_ANI_TIME = 195;

export function mix_options(tmp_options, new_options) {
    for (var key in new_options) {
        if (tmp_options.hasOwnProperty(key)) {
            if (tmp_options[key] instanceof Object) {
                mix_options(tmp_options[key], new_options[key])
            } else {
                tmp_options[key] = new_options[key]
            }
        }
    }
}
export function assign(to_obj, from_obj) {
    for (var key in from_obj) {
        if (from_obj.hasOwnProperty(key)) {
            var value = from_obj[key];
            if (from_obj[key] instanceof Object) {
                assign(to_obj[key] || (to_obj[key] = new value.constructor()), value)
            } else {
                to_obj[key] = value
            }
        }
    }
    return to_obj
}
export function transformJSON(JSON_str) {
    return JSON.parse(JSON_str, function(key, value) {
        // 对配置文件中的数量进行基本的单位换算
        return transformValue(value);
    });
}
export function transformValue(value) {
    if (typeof value === "string") {
        if (value.indexOf("pt2px!") === 0) {
            return pt2px(+value.substr(6));
        }
        if (value.indexOf("0x") === 0) {
            return parseInt(value, 16);
        }
        if (value.indexOf("PI!") === 0) {
            return Math.PI * (+value.substr(3));
        }
    }
    return value;
}

export function transformMix(parent_config,cur_config) {
    return JSON.parse(JSON.stringify(cur_config),function (key,value) {
        if(typeof value === "string"&&value.indexOf("mix@")===0) {
            value = value.substr(4);
            var owner_key = key;
            if(value.charAt(0) === "(") {//指定特定属性名
                var value_info = value.match(/\((.+)\)(.+)/);
                if(value_info) {
                    owner_key = value_info[1];
                    value = value_info[2];
                }
            }
            if(!parent_config.hasOwnProperty(owner_key)) {
                throw new SyntaxError(`属性：${owner_key} 不可用`);
            }
            return parent_config[owner_key] + parseFloat(transformValue(value));
        }
        return value;
    });
}
