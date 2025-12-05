// --- Init ---
function init() {
    updateEnvUI();
    loadEndpoint('pincode');
}

function setEnv(env) {
    currentEnv = env;
    localStorage.setItem('api_env', env);
    updateEnvUI();
    updateCodeSnippet();
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
