// --- Config & State ---
const ENV_CONFIG = {
    local: 'http://localhost:3000/api/v1',
    vercel: 'https://postal-pincode-api.vercel.app/api/v1'
};
let currentEnv = localStorage.getItem('api_env') || 'local';
let currentEndpoint = 'pincode';

// --- Endpoint Definitions ---
const ENDPOINTS = {
    pincode: {
        title: 'Get Pincode Details',
        desc: 'Retrieve detailed information about a specific Pincode. This includes the post office name, district, state, and other related data.',
        method: 'GET',
        path: '/pincode/{code}',
        params: [
            { name: 'code', type: 'path', desc: 'The 6-digit Pincode of the area.', placeholder: '110001', required: true }
        ]
    },
    batch: {
        title: 'Batch Lookup',
        desc: 'Retrieve details for multiple pincodes in a single request. Useful for bulk processing.',
        method: 'POST',
        path: '/pincode/batch',
        params: [
            { name: 'pincodes', type: 'body', desc: 'Comma separated list of pincodes.', placeholder: '110001, 380001', required: true }
        ]
    },
    validate: {
        title: 'Validate Pincode',
        desc: 'Check if a Pincode is valid and exists in the database.',
        method: 'GET',
        path: '/validate/{code}',
        params: [
            { name: 'code', type: 'path', desc: 'The 6-digit Pincode to validate.', placeholder: '560001', required: true }
        ]
    },
    lookup: {
        title: 'Address Lookup',
        desc: 'Get the State and District for a given Pincode. Useful for auto-filling address forms.',
        method: 'GET',
        path: '/pincode/{code}/lookup',
        params: [
            { name: 'code', type: 'path', desc: 'The 6-digit Pincode.', placeholder: '110001', required: true }
        ]
    },
    search: {
        title: 'Search Locations',
        desc: 'Search for post offices by name, district, or state. Supports fuzzy matching for approximate results.',
        method: 'GET',
        path: '/search',
        params: [
            { name: 'q', type: 'query', desc: 'General search term (e.g., office name).', placeholder: 'Ahmedabad' },
            { name: 'district', type: 'query', desc: 'Filter results by District.', placeholder: '' },
            { name: 'office', type: 'query', desc: 'Filter results by Office Name.', placeholder: '' },
            { name: 'fuzzy', type: 'query', desc: 'Enable fuzzy search for approximate matches.', placeholder: 'false', isSelect: true, options: ['false', 'true'] }
        ]
    },
    autocomplete: {
        title: 'Autocomplete',
        desc: 'Get pincode suggestions as you type. Optimized for fast lookups.',
        method: 'GET',
        path: '/autocomplete/{prefix}',
        autoTrigger: true,
        params: [
            { name: 'prefix', type: 'path', desc: 'Starting digits (min 2).', placeholder: '380', required: true },
            { name: 'limit', type: 'query', desc: 'Maximum number of results.', placeholder: '10' }
        ]
    },
    nearest: {
        title: 'Nearest Post Office',
        desc: 'Find post offices near a specific geographic location using latitude and longitude.',
        method: 'GET',
        path: '/nearest',
        params: [
            { name: 'lat', type: 'query', desc: 'Latitude of the location.', placeholder: '23.0225', required: true, hasAction: true },
            { name: 'long', type: 'query', desc: 'Longitude of the location.', placeholder: '72.5714', required: true },
            { name: 'radius', type: 'query', desc: 'Search radius in kilometers (max 20).', placeholder: '10' },
            { name: 'limit', type: 'query', desc: 'Maximum number of results.', placeholder: '10' }
        ]
    },
    states: {
        title: 'Get States',
        desc: 'Retrieve a list of all available states in the database.',
        method: 'GET',
        path: '/states',
        params: []
    },
    districts: {
        title: 'Get Districts',
        desc: 'Retrieve all districts within a specific state.',
        method: 'GET',
        path: '/districts/{state}',
        params: [
            { name: 'state', type: 'path', desc: 'Name of the state.', placeholder: 'Gujarat', required: true }
        ]
    },
    offices: {
        title: 'Get Offices',
        desc: 'Retrieve all post offices within a specific district.',
        method: 'GET',
        path: '/offices/{district}',
        params: [
            { name: 'district', type: 'path', desc: 'Name of the district.', placeholder: 'Ahmedabad', required: true }
        ]
    }
};

// --- Init ---
function init() {
    updateEnvUI();
    loadEndpoint('pincode');
}

function setEnv(env) {
    currentEnv = env;
    localStorage.setItem('api_env', env);
    updateEnvUI();
    updateCurl();
}

function updateEnvUI() {
    document.querySelectorAll('.env-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === currentEnv);
    });
}

function loadEndpoint(key) {
    currentEndpoint = key;
    const config = ENDPOINTS[key];

    // Update Sidebar Active State
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    const activeItem = Array.from(document.querySelectorAll('.sidebar-item')).find(el => el.getAttribute('onclick')?.includes(`'${key}'`));
    if (activeItem) activeItem.classList.add('active');

    // Render Center Pane
    const centerPane = document.getElementById('centerPane');

    let paramsHtml = '';
    if (config.params && config.params.length > 0) {
        paramsHtml = `<div class="section-title">Parameters</div>`;
        config.params.forEach(p => {
            let inputHtml = '';
            if (p.isSelect) {
                const options = p.options.map(o => `<option value="${o}">${o}</option>`).join('');
                inputHtml = `<select id="input-${p.name}" onchange="handleAutoTrigger()">${options}</select>`;
            } else {
                inputHtml = `<input type="text" id="input-${p.name}" placeholder="${p.placeholder}" oninput="handleAutoTrigger()">`;
            }

            let actionHtml = '';
            if (p.hasAction && p.name === 'lat') {
                actionHtml = `<button class="btn-location" onclick="useMyLocation()">📍 Locate Me</button>`;
            }

            paramsHtml += `
                <div class="param-row">
                    <div class="param-meta">
                        <div class="param-name">${p.name}</div>
                        <div class="param-badges">
                            <span class="badge">${p.type === 'path' ? 'string' : 'query'}</span>
                            ${p.required ? '<span class="badge required">required</span>' : ''}
                        </div>
                    </div>
                    <div class="input-wrapper">
                        ${inputHtml}
                        ${actionHtml}
                        <div class="param-desc">${p.desc}</div>
                    </div>
                </div>
            `;
        });
    }

    // cURL Section (Back in Center Pane)
    let curlSectionHtml = '';
    if (!config.autoTrigger) {
        curlSectionHtml = `
            <div class="curl-section" id="curlSection">
                <div class="curl-header">
                    <span>cURL Request</span>
                    <button class="copy-btn" onclick="copyCurl()">COPY</button>
                </div>
                <div class="curl-code" id="curlDisplay">
                    // cURL will appear here...
                </div>
            </div>
        `;
    }

    centerPane.innerHTML = `
        <div class="doc-header">
            <div class="doc-title">${config.title}</div>
            <div class="doc-desc">${config.desc}</div>
            
            <div class="endpoint-box">
                <div class="endpoint-method">${config.method}</div>
                <div class="endpoint-url-wrapper">
                    <span class="endpoint-url">${config.path}</span>
                </div>
                <button class="try-btn" onclick="executeRequest()">Try it</button>
            </div>
        </div>
        <div style="margin-top: 2rem;">
            ${paramsHtml}
        </div>
        ${curlSectionHtml}
    `;

    updateCurl();
}

function useMyLocation() {
    if (!navigator.geolocation) return alert('Geolocation not supported');

    const btn = document.querySelector('.btn-location');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Finding...';

    navigator.geolocation.getCurrentPosition(pos => {
        document.getElementById('input-lat').value = pos.coords.latitude.toFixed(4);
        document.getElementById('input-long').value = pos.coords.longitude.toFixed(4);
        updateCurl();
        btn.innerHTML = originalText;
    }, () => {
        alert('Unable to retrieve location');
        btn.innerHTML = originalText;
    });
}

let debounceTimer;
function handleAutoTrigger() {
    updateCurl();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(executeRequest, 300);
}

function updateCurl() {
    const curlDisplay = document.getElementById('curlDisplay');
    if (!curlDisplay) return;

    try {
        const config = ENDPOINTS[currentEndpoint];
        const baseUrl = ENV_CONFIG[currentEnv];
        let url = `${baseUrl}${config.path}`;
        let body = null;

        config.params.filter(p => p.type === 'path').forEach(p => {
            const el = document.getElementById(`input-${p.name}`);
            const val = el ? el.value : p.placeholder;
            url = url.replace(`{${p.name}}`, val || p.placeholder);
        });

        const queryParams = new URLSearchParams();
        config.params.filter(p => p.type === 'query').forEach(p => {
            const el = document.getElementById(`input-${p.name}`);
            const val = el && el.value ? el.value : (p.placeholder || '');
            if (val) queryParams.append(p.name, val);
        });
        if (queryParams.toString()) url += `?${queryParams.toString()}`;

        if (config.method === 'POST') {
            const bodyParam = config.params.find(p => p.type === 'body');
            if (bodyParam) {
                const el = document.getElementById(`input-${bodyParam.name}`);
                const val = el ? el.value : bodyParam.placeholder;
                if (bodyParam.name === 'pincodes') {
                    const list = val.split(',').map(s => s.trim()).filter(s => s);
                    body = JSON.stringify({ pincodes: list }, null, 2);
                }
            }
        }

        let curl = `curl --request ${config.method} \\\n  --url '${url}'`;
        if (body) {
            curl += ` \\\n  --header 'Content-Type: application/json' \\\n  --data '${body}'`;
        }

        // Syntax highlighting for cURL (simple)
        curlDisplay.innerHTML = `<span style="color:var(--text-muted)">${curl}</span>`;
    } catch (e) {
        console.error(e);
        curlDisplay.textContent = 'Error generating cURL: ' + e.message;
    }
}

function copyCurl() {
    const text = document.getElementById('curlDisplay').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = 'COPIED!';
        setTimeout(() => btn.textContent = 'COPY', 2000);
    });
}

async function executeRequest() {
    const config = ENDPOINTS[currentEndpoint];
    const baseUrl = ENV_CONFIG[currentEnv];
    let url = `${baseUrl}${config.path}`;
    let body = null;

    config.params.filter(p => p.type === 'path').forEach(p => {
        const el = document.getElementById(`input-${p.name}`);
        const val = el ? el.value : '';
        if (config.autoTrigger && !val) return;
        url = url.replace(`{${p.name}}`, val || p.placeholder);
    });

    if (config.autoTrigger && url.includes('{')) return;

    const queryParams = new URLSearchParams();
    config.params.filter(p => p.type === 'query').forEach(p => {
        const el = document.getElementById(`input-${p.name}`);
        const val = el && el.value ? el.value : (p.placeholder || '');
        if (val) queryParams.append(p.name, val);
    });
    if (queryParams.toString()) url += `?${queryParams.toString()}`;

    if (config.method === 'POST') {
        const bodyParam = config.params.find(p => p.type === 'body');
        if (bodyParam) {
            const el = document.getElementById(`input-${bodyParam.name}`);
            const val = el ? el.value : bodyParam.placeholder;
            if (bodyParam.name === 'pincodes') {
                const list = val.split(',').map(s => s.trim()).filter(s => s);
                body = JSON.stringify({ pincodes: list });
            }
        }
    }

    const responseDisplay = document.getElementById('responseDisplay');
    const statusDisplay = document.getElementById('statusCode');

    responseDisplay.innerHTML = '<span style="color: var(--text-dim)">Loading...</span>';

    try {
        const options = { method: config.method, headers: { 'Content-Type': 'application/json' } };
        if (body) options.body = body;

        const start = performance.now();
        const res = await fetch(url, options);
        const data = await res.json();
        const time = (performance.now() - start).toFixed(0);

        statusDisplay.textContent = `${res.status} ${res.statusText} (${time}ms)`;
        statusDisplay.style.color = res.ok ? 'var(--primary)' : '#ef4444';

        responseDisplay.innerHTML = syntaxHighlight(data);
    } catch (err) {
        statusDisplay.textContent = 'ERROR';
        statusDisplay.style.color = '#ef4444';
        responseDisplay.textContent = err.message;
    }
}

function syntaxHighlight(json) {
    if (typeof json != 'string') json = JSON.stringify(json, undefined, 2);
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// Start
init();
