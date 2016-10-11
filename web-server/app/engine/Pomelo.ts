import Protobuf from "./Protobuf";
import Protocol from "./Protocol";
import EventEmitter from "./EventEmitter";

var JS_WS_CLIENT_TYPE = 'js-websocket';
var JS_WS_CLIENT_VERSION = '0.0.1';

var Package = Protocol.Package;
var Message = Protocol.Message;

var RES_OK = 200;
var RES_FAIL = 500;
var RES_OLD_CLIENT = 501;

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() { }
        F.prototype = o;
        return new F();
    };
}
export default class Pomelo extends EventEmitter {


    socket = null;
    reqId = 0;
    callbacks = {};
    //Map from request id to route
    routeMap = {};

    heartbeatInterval = 0;
    heartbeatTimeout = 0;
    nextHeartbeatTimeout = 0;
    gapThreshold = 100;   // heartbeat gap threashold
    heartbeatId = null;
    heartbeatTimeoutId = null;

    handshakeCallback = null;

    handshakeBuffer = {
        'sys': {
            type: JS_WS_CLIENT_TYPE,
            version: JS_WS_CLIENT_VERSION
        },
        'user': {
        }
    };

    init(params, cb) {
        this.initCallback = cb;
        var host = params.host;
        var port = params.port;

        var url = 'ws://' + host;
        if (port) {
            url += ':' + port;
        }

        this.handshakeBuffer.user = params.user;
        this.handshakeCallback = params.handshakeCallback;
        this.initWebSocket(url, cb);
    };
    initCallback: (socket) => void = null;

    private initWebSocket = function (url, cb) {
        console.log('connect to ' + url);
        var onopen = (event) => {
            var obj = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(this.handshakeBuffer)));
            this.send(obj);
        };
        var onmessage = (event) => {
            this.processPackage(Package.decode(event.data), cb);
            // new package arrived, update the heartbeat timeout
            if (this.heartbeatTimeout) {
                this.nextHeartbeatTimeout = Date.now() + this.heartbeatTimeout;
            }
        };
        var onerror = (event) => {
            this.emit('io-error', event);
            console.error('socket error: ', event);
        };
        var onclose = (event) => {
            this.emit('close', event);
            console.error('socket close: ', event);
        };
        var socket = this.socket = new WebSocket(url);
        socket.binaryType = 'arraybuffer';
        socket.onopen = onopen;
        socket.onmessage = onmessage;
        socket.onerror = onerror;
        socket.onclose = onclose;
    };

    disconnect() {
        if (this.socket) {
            if (this.socket.disconnect) this.socket.disconnect();
            if (this.socket.close) this.socket.close();
            console.log('disconnect');
            this.socket = null;
        }

        if (this.heartbeatId) {
            clearTimeout(this.heartbeatId);
            this.heartbeatId = null;
        }
        if (this.heartbeatTimeoutId) {
            clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = null;
        }
    };

    request(route, msg, cb, is_retry = {}) {
        if (arguments.length === 2 && typeof msg === 'function') {
            cb = msg;
            msg = {};
        } else {
            msg = msg || {};
        }
        route = route || msg.route;
        if (!route) {
            return;
        }

        this.reqId++;
        this.sendMessage(this.reqId, route, msg);

        if(isFinite(is_retry.time_out)) {
            var _is_load = false;
            setTimeout(() => {
                if(!_is_load) {
                    this.request(route, msg, cb, is_retry)// 超时重试
                }
            }, +is_retry.time_out);
            this.callbacks[this.reqId] = function (data) {
                if(is_retry.is_once) {
                    if(cb["__IS_POMELO_"]) {
                        return
                    }
                    cb["__IS_POMELO_"] = true
                }
                _is_load = true;
                cb(data);
            }
        }else{
            this.callbacks[this.reqId] = cb;
        }
        this.routeMap[this.reqId] = route;
    };
    notify(route, msg) {
        msg = msg || {};
        this.sendMessage(0, route, msg);
    };
    private sendMessage(reqId, route, msg) {
        var type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;

        //compress message by protobuf
        var protos = !!this.data.protos ? this.data.protos.client : {};
        if (!!protos[route]) {
            msg = Protobuf.encode(route, msg);
        } else {
            msg = Protocol.strencode(JSON.stringify(msg));
        }


        var compressRoute = 0;
        if (this.dict && this.dict[route]) {
            route = this.dict[route];
            compressRoute = 1;
        }

        msg = Message.encode(reqId, type, compressRoute, route, msg);
        var packet = Package.encode(Package.TYPE_DATA, msg);
        this.send(packet);
    };
    dict = null;

    private send(packet) {
        this.socket.send(packet.buffer);
    };
    handler = {};
    private heartbeat(data) {
        if (!this.heartbeatInterval) {
            // no heartbeat
            return;
        }

        var obj = Package.encode(Package.TYPE_HEARTBEAT);
        if (this.heartbeatTimeoutId) {
            clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = null;
        }

        if (this.heartbeatId) {
            // already in a heartbeat interval
            return;
        }

        this.heartbeatId = setTimeout(() => {
            this.heartbeatId = null;
            this.send(obj);

            this.nextHeartbeatTimeout = Date.now() + this.heartbeatTimeout;
            this.heartbeatTimeoutId = setTimeout(this.heartbeatTimeoutCb, this.heartbeatTimeout);
        }, this.heartbeatInterval);
    };

    private heartbeatTimeoutCb() {
        var gap = this.nextHeartbeatTimeout - Date.now();
        if (gap > this.gapThreshold) {
            this.heartbeatTimeoutId = setTimeout(this.heartbeatTimeoutCb, gap);
        } else {
            console.error('server heartbeat timeout');
            this.emit('heartbeat timeout');
            this.disconnect();
        }
    };
    private handshake(data) {
        data = JSON.parse(Protocol.strdecode(data));
        if (data.code === RES_OLD_CLIENT) {
            this.emit('error', 'client version not fullfill');
            return;
        }

        if (data.code !== RES_OK) {
            this.emit('error', 'handshake fail');
            return;
        }

        this.handshakeInit(data);

        var obj = Package.encode(Package.TYPE_HANDSHAKE_ACK);
        this.send(obj);
        if (this.initCallback) {
            this.initCallback(this.socket);
            this.initCallback = null;
        }
    };


    private onData(data) {
        //probuff decode
        var msg = Message.decode(data);

        if (msg.id > 0) {
            msg.route = this.routeMap[msg.id];
            delete this.routeMap[msg.id];
            if (!msg.route) {
                return;
            }
        }

        msg.body = this.deCompose(msg);

        this.processMessage(pomelo, msg);
    };

    private onKick(data) {
        this.emit('onKick');
    };

    handlers = {
        [Package.TYPE_HANDSHAKE]: this.handshake,
        [Package.TYPE_HEARTBEAT]: this.heartbeat,
        [Package.TYPE_DATA]: this.onData,
        [Package.TYPE_KICK]: this.onKick,
    }
    private processPackage(msg) {
        this.handlers[msg.type].call(this, msg.body);
    };

    private processMessage(pomelo, msg) {
        if (!msg.id) {
            // server push message
            this.emit(msg.route, msg.body);
            return;
        }

        //if have a id then find the callback function with the request
        var cb = this.callbacks[msg.id];

        delete this.callbacks[msg.id];
        if (typeof cb !== 'function') {
            return;
        }

        cb(msg.body);
        return;
    };

    private processMessageBatch(pomelo, msgs) {
        for (var i = 0, l = msgs.length; i < l; i++) {
            this.processMessage(pomelo, msgs[i]);
        }
    };

    private deCompose(msg) {
        var protos = !!this.data.protos ? this.data.protos.server : {};
        var abbrs = this.data.abbrs;
        var route = msg.route;

        //Decompose route from dict
        if (msg.compressRoute) {
            if (!abbrs[route]) {
                return {};
            }

            route = msg.route = abbrs[route];
        }
        if (!!protos[route]) {
            return Protobuf.decode(route, msg.body);
        } else {
            return JSON.parse(Protocol.strdecode(msg.body));
        }

        // return msg;
    };

    private handshakeInit(data) {
        if (data.sys && data.sys.heartbeat) {
            this.heartbeatInterval = data.sys.heartbeat * 1000;   // heartbeat interval
            this.heartbeatTimeout = this.heartbeatInterval * 2;        // max heartbeat timeout
        } else {
            this.heartbeatInterval = 0;
            this.heartbeatTimeout = 0;
        }

        this.initData(data);

        if (typeof this.handshakeCallback === 'function') {
            this.handshakeCallback(data.user);
        }
    };

    data = null
    //Initilize data used in pomelo client
    private initData(data) {
        if (!data || !data.sys) {
            return;
        }
        this.data = this.data || {};
        var dict = data.sys.dict;
        var protos = data.sys.protos;

        //Init compress dict
        if (dict) {
            this.data.dict = dict;
            this.data.abbrs = {};

            for (var route in dict) {
                this.data.abbrs[dict[route]] = route;
            }
        }

        //Init protobuf protos
        if (protos) {
            this.data.protos = {
                server: protos.server || {},
                client: protos.client || {}
            };
            if (!!Protobuf) {
                Protobuf.init({ encoderProtos: protos.client, decoderProtos: protos.server });
            }
        }
    };
}






export const pomelo = new Pomelo; 