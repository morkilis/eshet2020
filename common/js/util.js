const $BP0 = 1535;
const $BP1 = 1340;
const $BP4 = 500;
const W0 = 1200;
const W1 = 984;
const BLUE = '#3b82f0';
let MOBILE = undefined;
const FILEDATA = {};
function float(str) {
    return parseFloat(str);
}
function int(x, base) {
    return parseInt(x, base);
}
function bool(val) {
    if (val === null)
        return false;
    const typeofval = typeof val;
    if (typeofval !== 'object') {
        if (typeofval === 'function')
            return true;
        else
            return !!val;
    }
    return Object.keys(val).length !== 0;
}
class Dict {
    constructor(obj) {
        Object.assign(this, obj);
    }
    items() {
        const proxy = this;
        const kvpairs = [];
        for (let k in proxy) {
            kvpairs.push([k, proxy[k]]);
        }
        return kvpairs;
    }
    keys() {
        const proxy = this;
        const keys = [];
        for (let k in proxy) {
            keys.push(k);
        }
        return keys;
    }
    values() {
        const proxy = this;
        const values = [];
        for (let k in proxy) {
            values.push(proxy[k]);
        }
        return values;
    }
}
function dict(obj) {
    return new Dict(obj);
}
class Str extends String {
    constructor(value) {
        super(value);
    }
    isdigit() {
        return !isNaN(int(this));
    }
    upper() {
        return this.toUpperCase();
    }
    lower() {
        return this.toLowerCase();
    }
}
function str(val) {
    return new Str(val);
}
async function concurrent(...promises) {
    return await Promise.all(promises);
}
const ajax = (() => {
    function _tryResolveResponse(xhr, resolve, reject) {
        if (xhr.status != 200) {
            return reject(xhr);
        }
        try {
            return resolve(JSON.parse(xhr.responseText));
        }
        catch (e) {
            if (e instanceof SyntaxError) {
                console.warn("failed JSON parsing xhr responseText. returning raw", { xhr });
                return resolve(xhr.responseText);
            }
            else {
                console.error({ xhr });
                return reject("Got bad xhr.responseText. Logged above", xhr);
            }
        }
    }
    function _baseRequest(type, url, data) {
        const xhr = new XMLHttpRequest();
        return new Promise(async (resolve, reject) => {
            await xhr.open(str(type).upper(), url, true);
            xhr.onload = () => _tryResolveResponse(xhr, resolve, reject);
            if (type === "get")
                xhr.send();
            else if (type === "post")
                xhr.send(JSON.stringify(data));
            else
                throw new Error(`util.ajax._baseRequest, receivd bad 'type': "${type}". should be either "get" or "post". url: ${url}`);
        });
    }
    function get(url) {
        return _baseRequest("get", url);
    }
    function post(url, data) {
        return _baseRequest("post", url, data);
    }
    return { post, get };
})();
const TL = Object.assign({}, TweenLite, { toAsync: (target, duration, vars) => new Promise(resolve => TL.to(target, duration, Object.assign({}, vars, { onComplete: resolve }))) });
function round(n, d = 0) {
    const fr = 10 ** d;
    return int(n * fr) / fr;
}
async function _fetch(path, cache = "default", fmt) {
    let req = new Request(path, { cache });
    return (await fetch(req))[fmt]();
}
async function fetchArray(path, cache = "default") {
    let fetched = await _fetch(path, cache, "json");
    return fetched;
}
async function fetchDict(path, cache = "default") {
    let fetched = await _fetch(path, cache, "json");
    return dict(fetched);
}
async function fetchText(path, cache = "default") {
    return _fetch(path, cache, "text");
}
function windowStats() {
    console.log(window.clientInformation.userAgent);
    return `
window.outerHeight: ${window.outerHeight}
window.innerHeight: ${window.innerHeight}
window.outerWidth: ${window.outerWidth}
window.innerWidth: ${window.innerWidth}
html.clientHeight: ${document.documentElement.clientHeight}
html.clientWidth: ${document.documentElement.clientWidth}
body.clientHeight: ${document.body.clientHeight}
body.clientWidth: ${document.body.clientWidth}
iPhone: ${isIphone}
`;
}
function copyToClipboard(val) {
    const copyText = elem({ tag: 'input' });
    copyText.e.value = val;
    elem({ htmlElement: document.body }).append(copyText);
    copyText.e.select();
    document.execCommand("copy");
    copyText.remove();
}
function calcCssValue(h1, h2) {
    const x = (100 * (h1[1] - h2[1])) / (h1[0] - h2[0]);
    const y = (h1[0] * h2[1] - h2[0] * h1[1]) / (h1[0] - h2[0]);
    const isYPositive = y >= 0;
    const expression = `calc(${round(x, 2)}vw ${isYPositive ? '+' : '-'} ${round(Math.abs(y), 2)}px)`;
    copyToClipboard(expression);
    return expression;
}
function calcAbsValue(cssStr, width) {
    const vh = cssStr.substring(cssStr.indexOf('(') + 1, cssStr.indexOf('vh'));
    const px = cssStr.substring(cssStr.lastIndexOf(' ') + 1, cssStr.lastIndexOf('px'));
    const ispositive = cssStr.includes('+');
    const format = (w) => {
        let n = w * float(vh) / 100;
        if (ispositive)
            n += float(px);
        else
            n -= float(px);
        return `${round(n, 2)}px`;
    };
    const expression = format(width);
    copyToClipboard(expression);
    return expression;
}
function less(val) {
    return [`%c${val}`, 'font-size: 10px; color: rgb(150,150,150)'];
}
function logFn(bold = false) {
    return function _log(target, name, descriptor, ...outargs) {
        const orig = descriptor.value;
        descriptor.value = function (...args) {
            console.log(`%c${name}`, `color: #ffc66d${bold ? '; font-weight: bold' : ''}`);
            return orig.apply(this, args);
        };
    };
}
function isinstance(obj, ...ctors) {
    for (let ctor of ctors)
        if (obj instanceof ctor)
            return true;
    return false;
}
JSON.parstr = (value) => {
    function nodeToObj(node) {
        const domObj = {};
        for (let prop in node) {
            let val = node[prop];
            if (bool(val)) {
                if (isinstance(val, HTMLCollection, Window, NamedNodeMap, NodeList))
                    continue;
                domObj[prop] = val;
            }
        }
        return Object.assign({ localName: node.localName }, domObj);
    }
    let stringified = JSON.stringify(value, (__thisArg, __key) => {
        if (__key instanceof Node) {
            return nodeToObj(__key);
        }
        else if (__key instanceof BetterHTMLElement) {
            __key.type = __key.__proto__.constructor.name;
            return __key;
        }
        else {
            return __key;
        }
    });
    let parsed = JSON.parse(stringified);
    return parsed;
};
function showArrowOnHover(anchors) {
    anchors.forEach((anch) => {
        anch
            .mouseover(() => anch.addClass('arrow'))
            .mouseout(async () => {
            anch.replaceClass('arrow', 'arrow-trans');
            await wait(200);
            anch.removeClass('arrow-trans');
        });
    });
}
function extend(sup, child) {
    if (bool(sup.prototype))
        child.prototype = sup.prototype;
    else if (bool(sup.__proto__))
        child.prototype = sup.__proto__;
    else {
        child.prototype = sup;
        console.warn('Both bool(sup.prototype) and bool(sup.__proto__) failed => child.prototype is set to sup.');
    }
    const handler = {
        construct
    };
    function construct(_, argArray) {
        const obj = new child;
        sup.apply(obj, argArray);
        child.apply(obj, argArray);
        return obj;
    }
    const proxy = new Proxy(child, handler);
    return proxy;
}
function getStackTrace() {
    let stack;
    try {
        throw new Error('');
    }
    catch (error) {
        stack = error.stack || '';
    }
    stack = stack.split('\n').map(line => line.trim().replace('at ', ''));
    return stack[3];
}
async function log(message, ...args) {
    const colors = {
        t: '#64FFDA',
        grn: '#4CAF50',
        lg: '#76FF03',
        l: '#CDDC39',
        y: '#FFFF00',
        a: '#FFCA28',
        o: '#FF6D00',
        do: '#D84315',
        b: '#795548',
        gry: '#9e9e9e',
        bg: '#607d8b'
    };
    const stack = getStackTrace();
    let splitstack = stack.split(window.location.href)[1].split(':');
    let jspath = splitstack[0];
    let jsdata;
    if (jspath in FILEDATA) {
        jsdata = FILEDATA[jspath];
    }
    else {
        let _blob = await fetch(new Request(jspath));
        jsdata = (await _blob.text()).split('\n');
        FILEDATA[jspath] = jsdata;
    }
    let jslineno = parseInt(splitstack[1]) - 1;
    if (jslineno === -1)
        throw new Error('jslineno is -1');
    let jsline = jsdata[jslineno].trim();
    let tspath = jspath.split(".")[0] + '.ts';
    let tsdata;
    if (tspath in FILEDATA) {
        tsdata = FILEDATA[tspath];
    }
    else {
        let _blob = await fetch(new Request(tspath));
        tsdata = (await _blob.text()).split('\n');
        FILEDATA[tspath] = tsdata;
    }
    const weakTsLineNos = [];
    const strongTsLineNos = [];
    tsdata.forEach((line, index) => {
        if (line.includes(jsline))
            strongTsLineNos.push(index);
        else if (line.split(' ').join('').includes(jsline.split(' ').join('')))
            weakTsLineNos.push(index);
    });
    let tslineno;
    if (strongTsLineNos.length === 1) {
        if (weakTsLineNos.length === 0)
            tslineno = strongTsLineNos[0];
        else {
            debugger;
        }
    }
    else {
        if (weakTsLineNos.length === 1)
            tslineno = weakTsLineNos[0];
        else {
            debugger;
        }
    }
    if (args[args.length - 1] in colors)
        console.log(`%c${message}`, `color: ${colors[args[args.length - 1]]}`, ...args.slice(0, args.length - 1), `${tspath}:${tslineno + 1}`);
    else
        console.log(message, ...args, `${tspath}:${tslineno + 1}`);
}
