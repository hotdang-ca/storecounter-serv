const version = '1.0.0';
console.log(`in-and-out ${version}\n© Four And A Half Giraffes, Ltd.\Free and Open Source for public use.`);

const socket = io('https://storecounter.hotdang.ca'); // the public-facing URL

const plusButton = document.getElementById('plus');
const minusButton = document.getElementById('minus');
const countElement = document.getElementById('count');
const tenantTextbox = document.getElementById('tenant');

let count = 0;
let tenant = '';

tenantTextbox.addEventListener('keyup', (e) => {
    tenant = e.target.value;
    requestNewData();
});

plusButton.addEventListener('click', (e) => {
    if (!tenant || tenant === '') {
        alert('Set your location first!');
        return;
    }
    count += 1;
    socket.emit('count', { tenant, count });
});

minusButton.addEventListener('click', (e) => {
    if (!tenant || tenant === '') {
        alert('Set your location first!');
        return;
    }

    count = Math.max(count - 1, 0);
    socket.emit('count', { tenant, count });
});

function displayCount() {
    countElement.innerHTML = count;
}

function requestNewData() {
    socket.emit('getCount', { tenant });
}

/** 
 * Socket Events
 */
socket.on('connect', () => { 
    socket.emit('getCount', {tenant}); 
});

socket.on('count', (data) => {
    const { tenant: whichTenant, count: newCount } = data;
    if (whichTenant === tenant) {
        count = newCount;
        displayCount();
    }
});