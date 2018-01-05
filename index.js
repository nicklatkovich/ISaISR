
const { ipcRenderer } = require('electron');
ipcRenderer.on('onResize', onResize);

let interval = undefined;
let lastOnStepTime = undefined;

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
    rsa_p = document.getElementById('rsa_p');
    rsa_q = document.getElementById('rsa_q');
    rsa_n = document.getElementById('rsa_n');
    rsa_phi_n = document.getElementById('rsa_phi_n');
    rsa_c = document.getElementById('rsa_c');
    rsa_source_m = document.getElementById('rsa_source_m');
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

function pow_by_mod(a, b, mod) {
    let res = 1;
    for (let i = 0; i < b; i++) {
        res = (res * a) % mod;
    }
    return res;
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

function rsa(full = true) {
    rsa_d.innerText = '';
    check(rsa_p.value.match(/^[0-9]+$/), '"p" must be a number');
    let p = parseInt(rsa_p.value);
    check(rsa_q.value.match(/^[0-9]+$/), '"q" must be a number');
    let q = parseInt(rsa_q.value);
    // TODO: p and q must be prime
    let n = p * q;
    rsa_n.innerText = n;
    let phi_n = (p - 1) * (q - 1);
    rsa_phi_n.innerText = phi_n;
    if (!full) return;
    check(rsa_e.value.match(/^[0-9]+$/), '"e" must be a number');
    let e = parseInt(rsa_e.value);
    check(rsa_m.value.match(/^[0-9]+$/), '"m" must be a number');
    let m = parseInt(rsa_m.value);
    check(m < n, '"m" must be less than "n"');
    let d = 0;
    let temp = 0;
    while (temp != 1) {
        d++;
        temp += e;
        while (temp > phi_n) {
            temp -= phi_n;
        }
    }
    rsa_d.innerText = d;
    let c = pow_by_mod(m, e, n);
    rsa_c.innerText = c;
    rsa_source_m.innerText = pow_by_mod(c, d, n);
}
