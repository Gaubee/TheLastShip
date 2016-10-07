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
            if (value instanceof Object && typeof value !== "function") {
                assign(to_obj[key] || (to_obj[key] = new value.constructor()), value)
            } else {
                to_obj[key] = value
            }
        }
    }
    return to_obj
}
export function transformJSON(JSON_str) {
    var root;
    return JSON.parse(JSON_str, function(s_key, s_value) {
        root||(root = this);
        // 处理key-value的引用继承等关系
        var {key,value} = transformKey(s_key, s_value, root);
        // 对配置文件中的数量进行基本的单位换算以及动态运算
        var res = transformValue(value);
        if(key !== s_key) {
            delete this[s_key];
            this[key] = res;
        }else{
            return res;
        }
    });
}
const _EXTEND_KEY_REG = /(.+?)\<EXTENDS\@(.+?)\>/;
export function transformKey(key, value, root) {
    var key_info = key.match(_EXTEND_KEY_REG);
    if(key_info) {
        key = key_info[1];
        var extend_key_list = key_info[2].split(".");
        var extend_value = root;
        extend_key_list.forEach(key=>{
            extend_value = extend_value[key]
        });
        value = assign(assign({}, extend_value), value);
    }
    return {key,value}
}
export function transformValue(value, pre_value?) {
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
        if(value.indexOf("eval!") === 0) {
            return new Function("info",value.substr(5));
        }
        // 简单表达式模式，需要两数字值
        if(value.indexOf("exp!") === 0) {
            pre_value = parseFloat(pre_value)||0;
            value = value.substr(4);
            var exp_type = value.charAt(0);
            var nex_value = +value.substr(1);
            if(exp_type === "*") {
                return pre_value*nex_value
            }
            if(exp_type === "/") {
                return pre_value/nex_value
            }
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
            return parseFloat(transformValue(value, parent_config[owner_key]));
        }
        return value;
    });
}
