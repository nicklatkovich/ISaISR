
const { ipcRenderer } = require('electron');
ipcRenderer.on('onResize', onResize);

let interval = undefined;
let lastOnStepTime = undefined;

let errorStream;
let acc_m;
let acc_source_alph;
let acc_new_alph;
let acc_answer;
let acc_inverse;

function onLoad() {
    onResize();
    // onStartInterval();
    errorStream = document.getElementById('errorBox');
    acc_source_alph = document.getElementById('acc_source_alph');
    acc_source_alph.innerText = '';
    for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
        acc_source_alph.innerText += String.fromCharCode(i);
    }
    (acc_new_alph = document.getElementById('acc_new_alph')).innerText = acc_source_alph.innerText =
        acc_source_alph.innerText.toUpperCase();
    acc_answer = document.getElementById('acc_answer');
    acc_m = acc_source_alph.innerText.length;
    acc_inverse = document.getElementById('acc_inverse');
}

function onStartInterval() {
    if (interval != undefined) {
        throw 'interval has already started';
    }
    interval = setInterval(onStep, 17);
    lastOnStepTime = Date.now();
}

function onEndInterval() {
    if (interval == undefined) {
        throw 'interval has not started';
    }
    clearInterval(interval);
    interval = undefined;
}

function onResize() {
}

function onStep() {
    let now = Date.now();
    let deltaTime = (now - lastOnStepTime) / 1000;
}

function gcd(a, b) {
    if (b == 0) return Math.abs(a);
    return gcd(b, a % b);
}

function check(request, error) {
    if (request) {
        errorStream.innerText = '';
        errorStream.style.height = '0px';
        errorStream.style.padding = '0px';
    } else {
        errorStream.innerText = error;
        errorStream.style.height = 'max-content';
        errorStream.style.padding = '8px';
        throw error;
    }
}

function mhc_start() {
    let source_message = document.getElementById('mhc_source').value;
    check(source_message.match(/^[01]+$/), 'The message can only contain zeros and ones');
    let k, r, n;
    document.getElementById('mhc_k').innerText = k = source_message.length;
    document.getElementById('mhc_r').innerText = r = Math.ceil(Math.log2(k) + 1);
    document.getElementById('mhc_n').innerText = n = k + r;
}

function acc_start() {
    let a = document.getElementById('acc_a').value;
    check(a.match(/^[0-9]+$/), '"a" must be a number');
    a = parseInt(a);
    let m = acc_m;
    check(gcd(a, m) == 1, '"a" and "m" must be relatively prime');
    let b = document.getElementById('acc_b').value;
    check(b.match(/^[0-9]+$/), '"b" must be a number');
    b = parseInt(b);
    let translator = [];
    acc_new_alph.innerText = '';
    for (let i = 0; i < acc_m; i++) {
        translator.push((i * a + b) % acc_m);
        acc_new_alph.innerText += String.fromCharCode('A'.charCodeAt(0) + translator[i]);
    }
    let source_message = document.getElementById('acc_source').value;
    check(source_message.match(/^[a-zA-Z]*$/), 'The message must be in English letters');
    let answer = '';
    for (let i = 0; i < source_message.length; i++) {
        answer += String.fromCharCode(
            (source_message[i].match(/[a-z]/) ? 'a'.charCodeAt(0) : 'A'.charCodeAt(0))
            + translator[source_message[i].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)]
        );
    }
    acc_answer.innerText = 'Answer: ' + answer;
    let inverse = '';
    for (let i = 0; i < answer.length; i++) {
        let j = acc_new_alph.innerText.indexOf(answer[i].toUpperCase());
        let x = acc_source_alph.innerText[j];
        if (answer[i].match(/[a-z]/)) {
            x = x.toLowerCase();
        }
        inverse += x;
    }
    acc_inverse.innerText = inverse;
}
