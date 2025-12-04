// --- Config & State ---
const ENV_CONFIG = {
    local: 'http://localhost:3000/api/v1',
    vercel: 'https://postal-pincode-api.vercel.app/api/v1'
};
let currentEnv = localStorage.getItem('api_env') || 'local';
let currentEndpoint = 'pincode';
let currentLang = 'curl'; // curl, python, js

// --- Endpoint Definitions ---
const ENDPOINTS = {
    pincode: {
        title: 'Get Pincode Details',
        desc: 'Retrieve detailed information about a specific Pincode. This includes the post office name, district, state, and other related data.',
        method: 'GET',
        path: '/pincode/{code}',
        params: [
            { name: 'code', type: 'path', dataType: 'string', desc: 'The 6-digit Pincode of the area.', placeholder: '110001', required: true, example: '110001' }
        ]
    },
    batch: {
        title: 'Batch Lookup',
        desc: 'Retrieve details for multiple pincodes in a single request. Useful for bulk processing.',
        method: 'POST',
        path: '/pincode/batch',
        params: [
            { name: 'pincodes', type: 'body', dataType: 'array', desc: 'Comma separated list of pincodes.', placeholder: '110001, 380001', required: true, example: '["110001", "380001"]' }
        ]
    },
    validate: {
        title: 'Validate Pincode',
        desc: 'Check if a Pincode is valid and exists in the database.',
        method: 'GET',
        path: '/validate/{code}',
        params: [
            { name: 'code', type: 'path', dataType: 'string', desc: 'The 6-digit Pincode to validate.', placeholder: '560001', required: true, example: '560001' }
        ]
    },
    lookup: {
        title: 'Address Lookup',
        desc: 'Get the State and District for a given Pincode. Useful for auto-filling address forms.',
        method: 'GET',
        path: '/pincode/{code}/lookup',
        params: [
            { name: 'code', type: 'path', dataType: 'string', desc: 'The 6-digit Pincode.', placeholder: '110001', required: true, example: '110001' }
        ]
    },
    search: {
        title: 'Search Locations',
        desc: 'Search for post offices by name, district, or state. Supports fuzzy matching for approximate results.',
        method: 'GET',
        path: '/search',
        params: [
            { name: 'q', type: 'query', dataType: 'string', desc: 'General search term (e.g., office name).', placeholder: 'Ahmedabad', example: 'Ahmedabad' },
            { name: 'district', type: 'query', dataType: 'string', desc: 'Filter results by District.', placeholder: '', example: 'Ahmedabad' },
            { name: 'office', type: 'query', dataType: 'string', desc: 'Filter results by Office Name.', placeholder: '', example: 'GPO' },
            { name: 'fuzzy', type: 'query', dataType: 'boolean', desc: 'Enable fuzzy search for approximate matches.', placeholder: 'false', isSelect: true, options: ['false', 'true'], example: 'true' }
        ]
    },
    autocomplete: {
        title: 'Autocomplete',
        desc: 'Get pincode suggestions as you type. Optimized for fast lookups.',
        method: 'GET',
        path: '/autocomplete/{prefix}',
        autoTrigger: true,
        params: [
            { name: 'prefix', type: 'path', dataType: 'string', desc: 'Starting digits (min 2).', placeholder: '380', required: true, example: '380' },
            { name: 'limit', type: 'query', dataType: 'integer', desc: 'Maximum number of results.', placeholder: '10', example: '5' }
        ]
    },
    nearest: {
        title: 'Nearest Post Office',
        desc: 'Find post offices near a specific geographic location using latitude and longitude.',
        method: 'GET',
        path: '/nearest',
        params: [
            { name: 'lat', type: 'query', dataType: 'float', desc: 'Latitude of the location.', placeholder: '23.0225', required: true, hasAction: true, example: '23.0225' },
            { name: 'long', type: 'query', dataType: 'float', desc: 'Longitude of the location.', placeholder: '72.5714', required: true, example: '72.5714' },
            { name: 'radius', type: 'query', dataType: 'integer', desc: 'Search radius in kilometers (max 20).', placeholder: '10', example: '10' },
            { name: 'limit', type: 'query', dataType: 'integer', desc: 'Maximum number of results.', placeholder: '10', example: '5' }
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
            { name: 'state', type: 'path', dataType: 'string', desc: 'Name of the state.', placeholder: 'Gujarat', required: true, example: 'Gujarat' }
        ]
    },
    offices: {
        title: 'Get Offices',
        desc: 'Retrieve all post offices within a specific district.',
        method: 'GET',
        path: '/offices/{district}',
        params: [
            { name: 'district', type: 'path', dataType: 'string', desc: 'Name of the district.', placeholder: 'Ahmedabad', required: true, example: 'Ahmedabad' }
        ]
    }
};

// --- Init ---
function init() {
    updateEnvUI();
    loadEndpoint('pincode');

    // Close dropdown when clicking outside
    window.onclick = function (event) {
        if (!event.target.matches('.dropdown-btn') && !event.target.closest('.dropdown-btn')) {
            const dropdowns = document.getElementsByClassName("dropdown-menu");
            for (let i = 0; i < dropdowns.length; i++) {
                const openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }
}

function setEnv(env) {
    currentEnv = env;
    localStorage.setItem('api_env', env);
    updateEnvUI();
    updateCodeSnippet();
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
                    <div class="param-info">
                        <div class="param-header">
                            <span class="param-name">${p.name}</span>
                            <span class="badge">${p.dataType || 'string'}</span>
                            ${p.required ? '<span class="badge required">required</span>' : ''}
                        </div>
                        <div class="param-desc">${p.desc}</div>
                        ${p.isSelect ? `<div class="param-options">Options: ${p.options.join(', ')}</div>` : ''}
                    </div>
                    <div class="input-wrapper">
                        ${inputHtml}
                        ${actionHtml}
                    </div>
                </div>
            `;
        });
    }

    // Code Snippet Section
    let codeSectionHtml = '';
    if (!config.autoTrigger) {
        codeSectionHtml = `
            <div class="code-section" id="codeSection">
                <div class="code-header">
                    <div class="custom-dropdown">
                        <button class="dropdown-btn" onclick="toggleLangDropdown()">
                            <span id="currentLangLabel">${getLangLabel(currentLang)}</span>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <div class="dropdown-menu" id="langMenu">
                            <div class="dropdown-item ${currentLang === 'curl' ? 'active' : ''}" onclick="selectLang('curl')">
                                <span>cURL</span>
                                ${currentLang === 'curl' ? '<span>✓</span>' : ''}
                            </div>
                            <div class="dropdown-item ${currentLang === 'python' ? 'active' : ''}" onclick="selectLang('python')">
                                <span>Python</span>
                                ${currentLang === 'python' ? '<span>✓</span>' : ''}
                            </div>
                            <div class="dropdown-item ${currentLang === 'js' ? 'active' : ''}" onclick="selectLang('js')">
                                <span>JavaScript</span>
                                ${currentLang === 'js' ? '<span>✓</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <button class="copy-icon-btn" onclick="copyCode()" title="Copy Code">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
                <div class="code-block" id="codeDisplay">
                    // Code will appear here...
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
        ${codeSectionHtml}
    `;

    updateCodeSnippet();
}

function getLangLabel(lang) {
    if (lang === 'curl') return 'cURL';
    if (lang === 'python') return 'Python';
    if (lang === 'js') return 'JavaScript';
    return lang;
}

function toggleLangDropdown() {
    document.getElementById("langMenu").classList.toggle("show");
}

function selectLang(lang) {
    currentLang = lang;

    // Update Label
    document.getElementById('currentLangLabel').textContent = getLangLabel(lang);

    // Update Menu Items (for checkmark)
    const menu = document.getElementById('langMenu');
    menu.innerHTML = `
        <div class="dropdown-item ${currentLang === 'curl' ? 'active' : ''}" onclick="selectLang('curl')">
            <span>cURL</span>
            ${currentLang === 'curl' ? '<span>✓</span>' : ''}
        </div>
        <div class="dropdown-item ${currentLang === 'python' ? 'active' : ''}" onclick="selectLang('python')">
            <span>Python</span>
            ${currentLang === 'python' ? '<span>✓</span>' : ''}
        </div>
        <div class="dropdown-item ${currentLang === 'js' ? 'active' : ''}" onclick="selectLang('js')">
            <span>JavaScript</span>
            ${currentLang === 'js' ? '<span>✓</span>' : ''}
        </div>
    `;

    // Close Dropdown
    menu.classList.remove('show');

    updateCodeSnippet();
}

function useMyLocation() {
    if (!navigator.geolocation) return alert('Geolocation not supported');

    const btn = document.querySelector('.btn-location');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Finding...';

    navigator.geolocation.getCurrentPosition(pos => {
        document.getElementById('input-lat').value = pos.coords.latitude.toFixed(4);
        document.getElementById('input-long').value = pos.coords.longitude.toFixed(4);
        updateCodeSnippet();
        btn.innerHTML = originalText;
    }, () => {
        alert('Unable to retrieve location');
        btn.innerHTML = originalText;
    });
}

let debounceTimer;
function handleAutoTrigger() {
    updateCodeSnippet();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(executeRequest, 300);
}

function updateCodeSnippet() {
    const codeDisplay = document.getElementById('codeDisplay');
    if (!codeDisplay) return;

    try {
        const config = ENDPOINTS[currentEndpoint];
        const baseUrl = ENV_CONFIG[currentEnv];
        let url = `${baseUrl}${config.path}`;
        let body = null;

        // Replace Path Params
        config.params.filter(p => p.type === 'path').forEach(p => {
            const el = document.getElementById(`input-${p.name}`);
            const val = el ? el.value : p.placeholder;
            url = url.replace(`{${p.name}}`, val || p.placeholder);
        });

        // Build Query Params
        const queryParams = new URLSearchParams();
        config.params.filter(p => p.type === 'query').forEach(p => {
            const el = document.getElementById(`input-${p.name}`);
            const val = el && el.value ? el.value : (p.placeholder || '');
            if (val) queryParams.append(p.name, val);
        });
        const queryString = queryParams.toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        // Build Body
        if (config.method === 'POST') {
            const bodyParam = config.params.find(p => p.type === 'body');
            if (bodyParam) {
                const el = document.getElementById(`input-${bodyParam.name}`);
                const val = el ? el.value : bodyParam.placeholder;
                if (bodyParam.name === 'pincodes') {
                    const list = val.split(',').map(s => s.trim()).filter(s => s);
                    body = { pincodes: list };
                }
            }
        }

        let code = '';

        if (currentLang === 'curl') {
            code = `curl --request ${config.method} \\\n  --url '${fullUrl}'`;
            if (body) {
                code += ` \\\n  --header 'Content-Type: application/json' \\\n  --data '${JSON.stringify(body, null, 2)}'`;
            }
        } else if (currentLang === 'python') {
            code = `import requests\n\nurl = "${fullUrl}"\n`;
            if (body) {
                code += `payload = ${JSON.stringify(body, null, 2)}\nheaders = {"Content-Type": "application/json"}\n\nresponse = requests.request("${config.method}", url, json=payload, headers=headers)`;
            } else {
                code += `\nresponse = requests.request("${config.method}", url)`;
            }
            code += `\n\nprint(response.text)`;
        } else if (currentLang === 'js') {
            code = `const options = {method: '${config.method}'`;
            if (body) {
                code += `, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(${JSON.stringify(body)})`;
            }
            code += `};\n\nfetch('${fullUrl}', options)\n  .then(response => response.json())\n  .then(response => console.log(response))\n  .catch(err => console.error(err));`;
        }

        codeDisplay.innerHTML = `<span style="color:var(--text-muted)">${escapeHtml(code)}</span>`;
    } catch (e) {
        console.error(e);
        codeDisplay.textContent = 'Error generating code: ' + e.message;
    }
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function copyCode() {
    const text = document.getElementById('codeDisplay').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.code-header .copy-icon-btn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => btn.innerHTML = originalHtml, 2000);
    });
}

function copyResponse() {
    const text = document.getElementById('responseDisplay').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyResponseBtn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => btn.innerHTML = originalHtml, 2000);
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
