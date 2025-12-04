// --- Config & State ---
const ENV_CONFIG = {
    local: 'http://localhost:3000/api/v1',
    vercel: 'https://postal-pincode-api.vercel.app/api/v1'
};
let currentEnv = localStorage.getItem('api_env') || 'local';
let currentEndpoint = 'pincode';
let currentLang = 'curl'; // curl, python, js

// --- Endpoint Definitions (Extended for Docs) ---
const ENDPOINTS = {
    pincode: {
        title: 'Get Pincode Details',
        desc: 'Retrieve detailed information about a specific Pincode. This includes the post office name, district, state, and other related data.',
        method: 'GET',
        path: '/pincode/{code}',
        params: [
            { name: 'code', type: 'path', dataType: 'string', desc: 'The 6-digit Pincode of the area.', placeholder: '110001', required: true, example: '110001' }
        ],
        responseParams: [
            { name: 'pincode', type: 'string', desc: 'The 6-digit pincode.' },
            { name: 'office', type: 'string', desc: 'Name of the post office.' },
            { name: 'district', type: 'string', desc: 'District name.' },
            { name: 'state', type: 'string', desc: 'State name.' },
            { name: 'circle', type: 'string', desc: 'Postal circle.' }
        ]
    },
    batch: {
        title: 'Batch Lookup',
        desc: 'Retrieve details for multiple pincodes in a single request. Useful for bulk processing.',
        method: 'POST',
        path: '/pincode/batch',
        params: [
            { name: 'pincodes', type: 'body', dataType: 'array', desc: 'Comma separated list of pincodes.', placeholder: '110001, 380001', required: true, example: '["110001", "380001"]' }
        ],
        responseParams: [
            { name: 'results', type: 'array', desc: 'List of pincode details objects.' },
            { name: 'count', type: 'integer', desc: 'Total number of results returned.' }
        ]
    },
    validate: {
        title: 'Validate Pincode',
        desc: 'Check if a Pincode is valid and exists in the database.',
        method: 'GET',
        path: '/validate/{code}',
        params: [
            { name: 'code', type: 'path', dataType: 'string', desc: 'The 6-digit Pincode to validate.', placeholder: '560001', required: true, example: '560001' }
        ],
        responseParams: [
            { name: 'valid', type: 'boolean', desc: 'True if pincode exists, false otherwise.' },
            { name: 'message', type: 'string', desc: 'Validation message.' }
        ]
    },
    lookup: {
        title: 'Address Lookup',
        desc: 'Get the State and District for a given Pincode. Useful for auto-filling address forms.',
        method: 'GET',
        path: '/pincode/{code}/lookup',
        params: [
            { name: 'code', type: 'path', dataType: 'string', desc: 'The 6-digit Pincode.', placeholder: '110001', required: true, example: '110001' }
        ],
        responseParams: [
            { name: 'state', type: 'string', desc: 'State name.' },
            { name: 'district', type: 'string', desc: 'District name.' }
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
        ],
        responseParams: [
            { name: 'results', type: 'array', desc: 'List of matching post offices.' },
            { name: 'total', type: 'integer', desc: 'Total matches found.' }
        ]
    },
    autocomplete: {
        title: 'Autocomplete',
        desc: 'Get pincode suggestions as you type. Optimized for fast lookups.',
        method: 'GET',
        path: '/autocomplete/{prefix}',
        params: [
            { name: 'prefix', type: 'path', dataType: 'string', desc: 'Starting digits (min 2).', placeholder: '380', required: true, example: '380' },
            { name: 'limit', type: 'query', dataType: 'integer', desc: 'Maximum number of results.', placeholder: '10', example: '5' }
        ],
        responseParams: [
            { name: 'suggestions', type: 'array', desc: 'List of suggested pincodes.' }
        ]
    },
    nearest: {
        title: 'Nearest Post Office',
        desc: 'Find post offices near a specific geographic location using latitude and longitude.',
        method: 'GET',
        path: '/nearest',
        params: [
            { name: 'lat', type: 'query', dataType: 'float', desc: 'Latitude of the location.', placeholder: '23.0225', required: true, example: '23.0225' },
            { name: 'long', type: 'query', dataType: 'float', desc: 'Longitude of the location.', placeholder: '72.5714', required: true, example: '72.5714' },
            { name: 'radius', type: 'query', dataType: 'integer', desc: 'Search radius in kilometers (max 20).', placeholder: '10', example: '10' },
            { name: 'limit', type: 'query', dataType: 'integer', desc: 'Maximum number of results.', placeholder: '10', example: '5' }
        ],
        responseParams: [
            { name: 'offices', type: 'array', desc: 'List of nearest post offices.' },
            { name: 'distance', type: 'float', desc: 'Distance in km (included in office object).' }
        ]
    },
    states: {
        title: 'Get States',
        desc: 'Retrieve a list of all available states in the database.',
        method: 'GET',
        path: '/states',
        params: [],
        responseParams: [
            { name: 'states', type: 'array', desc: 'List of state names.' }
        ]
    },
    districts: {
        title: 'Get Districts',
        desc: 'Retrieve all districts within a specific state.',
        method: 'GET',
        path: '/districts/{state}',
        params: [
            { name: 'state', type: 'path', dataType: 'string', desc: 'Name of the state.', placeholder: 'Gujarat', required: true, example: 'Gujarat' }
        ],
        responseParams: [
            { name: 'districts', type: 'array', desc: 'List of district names.' }
        ]
    },
    offices: {
        title: 'Get Offices',
        desc: 'Retrieve all post offices within a specific district.',
        method: 'GET',
        path: '/offices/{district}',
        params: [
            { name: 'district', type: 'path', dataType: 'string', desc: 'Name of the district.', placeholder: 'Ahmedabad', required: true, example: 'Ahmedabad' }
        ],
        responseParams: [
            { name: 'offices', type: 'array', desc: 'List of post office names.' }
        ]
    }
};

// --- Init ---
function init() {
    loadDocs('pincode');

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

function loadDocs(key) {
    currentEndpoint = key;
    const config = ENDPOINTS[key];

    // Update Sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    const activeItem = Array.from(document.querySelectorAll('.sidebar-item')).find(el => el.getAttribute('onclick')?.includes(`'${key}'`));
    if (activeItem) activeItem.classList.add('active');

    // --- Render Center Pane (Docs) ---
    const centerPane = document.getElementById('centerPane');

    // Input Params Table
    let paramsHtml = '<div style="color:var(--text-muted); font-style:italic;">No parameters required.</div>';
    if (config.params && config.params.length > 0) {
        paramsHtml = config.params.map(p => `
            <div class="param-row">
                <div class="param-info" style="width: 100%;">
                    <div class="param-header">
                        <span class="param-name">${p.name}</span>
                        <span class="badge">${p.dataType || 'string'}</span>
                        <span class="badge" style="background:var(--bg-panel); border:none;">${p.type}</span>
                        ${p.required ? '<span class="badge required">required</span>' : '<span class="badge" style="color:var(--text-dim)">optional</span>'}
                    </div>
                    <div class="param-desc">${p.desc}</div>
                    ${p.isSelect ? `<div class="param-options">Options: ${p.options.join(', ')}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Output Params Table
    let responseHtml = '<div style="color:var(--text-muted); font-style:italic;">Dynamic response structure.</div>';
    if (config.responseParams && config.responseParams.length > 0) {
        responseHtml = config.responseParams.map(p => `
            <div class="param-row">
                <div class="param-info" style="width: 100%;">
                    <div class="param-header">
                        <span class="param-name">${p.name}</span>
                        <span class="badge">${p.type}</span>
                    </div>
                    <div class="param-desc">${p.desc}</div>
                </div>
            </div>
        `).join('');
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
            </div>
        </div>

        <div style="margin-top: 3rem;">
            <div class="section-title">Request Parameters</div>
            ${paramsHtml}
        </div>

        <div style="margin-top: 3rem;">
            <div class="section-title">Response Structure</div>
            ${responseHtml}
        </div>
    `;

    // --- Render Right Pane (Code) ---
    renderRightPane();
}

function renderRightPane() {
    const rightPane = document.getElementById('rightPane');
    const config = ENDPOINTS[currentEndpoint];

    // Generate Code
    const code = generateCode(config, currentLang);

    rightPane.innerHTML = `
        <div class="pane-header">
            <span>Code Snippet</span>
        </div>
        <div class="code-section" style="margin: 0; border: none; border-radius: 0; height: 100%; display: flex; flex-direction: column;">
            <div class="code-header" style="border-top: none;">
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
            <div class="code-block" id="codeDisplay" style="flex: 1;">${escapeHtml(code)}</div>
        </div>
    `;
}

function generateCode(config, lang) {
    const baseUrl = ENV_CONFIG[currentEnv];
    let url = `${baseUrl}${config.path}`;
    let body = null;

    // Replace Path Params with Examples
    config.params.filter(p => p.type === 'path').forEach(p => {
        url = url.replace(`{${p.name}}`, p.example || p.placeholder);
    });

    // Build Query Params with Examples
    const queryParams = new URLSearchParams();
    config.params.filter(p => p.type === 'query').forEach(p => {
        if (p.example) queryParams.append(p.name, p.example);
    });
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    // Build Body with Examples
    if (config.method === 'POST') {
        const bodyParam = config.params.find(p => p.type === 'body');
        if (bodyParam && bodyParam.example) {
            try {
                const exampleVal = JSON.parse(bodyParam.example);
                body = { [bodyParam.name]: exampleVal };
            } catch (e) {
                // Fallback if example isn't valid JSON
                body = { [bodyParam.name]: bodyParam.example };
            }
        }
    }

    if (lang === 'curl') {
        let c = `curl --request ${config.method} \\\n  --url '${fullUrl}'`;
        if (body) {
            c += ` \\\n  --header 'Content-Type: application/json' \\\n  --data '${JSON.stringify(body, null, 2)}'`;
        }
        return c;
    } else if (lang === 'python') {
        let c = `import requests\n\nurl = "${fullUrl}"\n`;
        if (body) {
            c += `payload = ${JSON.stringify(body, null, 2)}\nheaders = {"Content-Type": "application/json"}\n\nresponse = requests.request("${config.method}", url, json=payload, headers=headers)`;
        } else {
            c += `\nresponse = requests.request("${config.method}", url)`;
        }
        c += `\n\nprint(response.text)`;
        return c;
    } else if (lang === 'js') {
        let c = `const options = {method: '${config.method}'`;
        if (body) {
            c += `, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(${JSON.stringify(body)})`;
        }
        c += `};\n\nfetch('${fullUrl}', options)\n  .then(response => response.json())\n  .then(response => console.log(response))\n  .catch(err => console.error(err));`;
        return c;
    }
    return '';
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
    renderRightPane();
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

// Start
init();
