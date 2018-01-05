
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
    dhp_g = document.getElementById('dhp_g');
    dhp_p = document.getElementById('dhp_p');
    dhp_a = document.getElementById('dhp_a');
    dhp_b = document.getElementById('dhp_b');
    dhp_A = document.getElementById('dhp_A');
    dhp_B = document.getElementById('dhp_B');
    dhp_k1 = document.getElementById('dhp_k1');
    dhp_k2 = document.getElementById('dhp_k2');
    egs_p = document.getElementById('egs_p');
    egs_g = document.getElementById('egs_g');
    egs_x = document.getElementById('egs_x');
    egs_M = document.getElementById('egs_M');
    egs_y = document.getElementById('egs_y');
    egs_k = document.getElementById('egs_k');
    egs_a = document.getElementById('egs_a');
    egs_b = document.getElementById('egs_b');
    egs_reverse = document.getElementById('egs_reverse');
    des_key = document.getElementById('des_key');
    des_vector = document.getElementById('des_vector');
    des_source = document.getElementById('des_source');
    des_result = document.getElementById('des_result');
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

function dhp_start() {
    check(dhp_g.value.match(/^[0-9]+$/), '"g" must be a number');
    let g = parseInt(dhp_g.value);
    check(dhp_p.value.match(/^[0-9]+$/), '"p" must be a number');
    let p = parseInt(dhp_p.value);
    check(dhp_a.value.match(/^[0-9]+$/), '"a" must be a number');
    let a = parseInt(dhp_a.value);
    check(dhp_b.value.match(/^[0-9]+$/), '"b" must be a number');
    let b = parseInt(dhp_b.value);
    let A = pow_by_mod(g, a, p);
    let B = pow_by_mod(g, b, p);
    dhp_A.innerText = A;
    dhp_B.innerText = B;
    let k1 = pow_by_mod(B, a, p);
    let k2 = pow_by_mod(A, b, p);
    dhp_k1.innerText = k1;
    dhp_k2.innerText = k2;
    check(k1 == k2, 'Hmm ... Something went wrong. The keys do not match');
}

function egs_start() {
    check(egs_p.value.match(/^[0-9]+$/), '"p" must be a number');
    let p = parseInt(egs_p.value);
    check(egs_g.value.match(/^[0-9]+$/), '"g" must be a number');
    let g = parseInt(egs_g.value);
    check(egs_x.value.match(/^[0-9]+$/), '"x" must be a number');
    let x = parseInt(egs_x.value);
    check(egs_M.value.match(/^[0-9]+$/), '"M" must be a number');
    let M = parseInt(egs_M.value);
    check(M < p, '"M must be less then "p"');
    let y = pow_by_mod(g, x, p);
    egs_y.innerText = y;
    let k = Math.floor(Math.random() * (p - 1 - 2) + 2);
    egs_k.innerText = k;
    let a = pow_by_mod(g, k, p);
    egs_a.innerText = a;
    let b = pow_by_mod(y, k, p) * M % p;
    egs_b.innerText = b;
    let reverse = pow_by_mod(a, p - 1 - x, p) * b % p;
    egs_reverse.innerText = reverse;
    check(reverse == M, 'Error! Only simple numbers should be used as keys');
}

function des_gen() {
    let key = genkey();
    des_key.value = key.key;
    des_vector.value = key.vector;
}

function des_start() {
    des_result.value = encrypt_string(des_source.value, des_key.value, des_vector.value);
}

function des_swap() {
    des_source.value = des_result.value;
    des_result.value = '';
}

function des_decrypt() {
    des_result.value = decrypt_string(des_source.value, des_key.value, des_vector.value);
}
