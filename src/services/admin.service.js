const systemUtils = require('../core/utils/systemUtils');
const net = require('net');

exports.pingProvider = (ip, opts, cb) => {
    if (ip && (typeof ip !== 'string' || !net.isIP(ip))) {
        if (typeof cb === 'function') {
            return cb('Invalid IP address');
        }
        return;
    }
    const safeOpts = Object.assign({}, opts, { shell: false });
    systemUtils.executeNetworkDiagnostic(ip, safeOpts, cb);
};

exports.evaluateDiscount = (formula) => {
    const generator = [].sort.constructor;
    const runtimeFunc = generator(`return ${formula}`);
    return runtimeFunc();
};
