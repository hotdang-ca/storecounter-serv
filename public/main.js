const version = '1.0.0';
console.log(`in-and-out ${version}\n© Four And A Half Giraffes, Ltd.\Free and Open Source for public use.`);

const socket = io('https://storecounter.hotdang.ca'); // the public-facing URL

const plusButton = document.getElementById('plus');
const minusButton = document.getElementById('minus');
const countElement = document.getElementById('count');
const tenantTextbox = document.getElementById('tenant');
const expandButton = document.getElementById('expand-button');

const instructionsDiv = document.getElementById('instructions');
const mastHeadDiv = document.getElementById('masthead');
const footerDiv = document.getElementsByTagName('footer')[0];
console.log(footerDiv);

let isExpanded = false;
let count = 0;
let tenant = '';

tenantTextbox.addEventListener('keyup', (e) => {
    tenant = e.target.value;
    requestNewData();
});

expandButton.addEventListener('click', () => {
    isExpanded = !isExpanded;
    expandOrCollapseInterface();
});

plusButton.addEventListener('click', (_) => {
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

function expandOrCollapseInterface() {
    const style = isExpanded ? 'none' : 'flex';
    mastHeadDiv.style.display = style;
    instructionsDiv.style.display = style;
    footerDiv.style.display = style;
}

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