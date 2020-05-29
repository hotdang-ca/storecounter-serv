const version = '1.0.0-ADMIN';
console.log(`in-and-out ${version}\n© Four And A Half Giraffes, Ltd.\Free and Open Source for public use.`);

const socket = io('https://storecounter.hotdang.ca'); // the public-facing URL

const plusButton = document.getElementById('plus');
const minusButton = document.getElementById('minus');
const countElement = document.getElementById('count');
const tenantTextbox = document.getElementById('tenant');
let tenants = [];

function displayCount(forElementId, count) {
    const element = document.getElementById(`${forElementId}-count`);
    const container = document.getElementById('tenant-container');

    if (element) {
        element.innerHTML = count;
        return;
    }

    const newElement = document.createElement('div');
    newElement.className = 'tenant-card';

    // tenant name
    const tenantNameElement = document.createElement('input');
    tenantNameElement.disabled = 'disabled';
    tenantNameElement.setAttribute('type', 'text');
    tenantNameElement.value = forElementId;
    tenantNameElement.title = forElementId;
    newElement.appendChild(tenantNameElement);

    // tenant count
    const countDiv = document.createElement('div');
    countDiv.id = `${forElementId}-count`;
    countDiv.className = 'count';
    countDiv.innerHTML = count;
    newElement.appendChild(countDiv);

    container.appendChild(newElement);
}

function requestNewData() {
    // TODO: iterate over all tenants
    socket.emit('getCount', { tenant });
}

/** 
 * Socket Events
 */
socket.on('connect', () => {
    fetch('/stats', { headers: { 'Accept': 'application/json' }})
        .then((result) => result.json())
        .then((results) => {
            console.log('results', results);
            if (!results.length) {
                throw ('no results');
            }

            tenants = Object.keys(results);;
            for (tenant of tenants) {
                console.log('getting count for ', tenant);
                socket.emit('getCount', { tenant }); 
            }
        }).catch((err) => {
            console.log('error', err);
            const mockTenants = {
                "123": 30,
                "ca.hotdang.retailstore": 18,
                "james": 10,
                "": 0,
                "t,e": 2,
                "Used ice and *33_to q. x xx 6": 0,
                "kiccbcccoxfk": 0,
                "kiccbcccoxfksd": 1,
                "t,e to": 1,
                "Used ice and *33_to q. x x g2x xx xx xx 6": 1,
                "ccccc  mk,p": 1,
                "gud eats": 2,
                "home": 16,
                "dewdney": 4,
                "test": 3,
                "Levi": 0,
                "Regina": 3
            }

            tenants = Object.keys(mockTenants);

            for (tenant of tenants) {
                socket.emit('getCount', { tenant }); 
            }
        });
});

socket.on('count', (data) => {
    const { tenant, count } = data;
        displayCount(tenant, count);
});