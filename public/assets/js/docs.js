// --- Init ---
function init() {
    loadDocs('intro');
}

function setEnv(env) {
    currentEnv = env;
    localStorage.setItem('api_env', env);
    updateEnvUI();
    renderRightPane(); // Re-render to update code snippet and button state
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

    if (config.type === 'static') {
        centerPane.innerHTML = `
            <div class="doc-header">
                <div class="doc-title">${config.title}</div>
                <div class="doc-desc">${config.desc}</div>
            </div>
            <div style="margin-top: 2rem;">
                ${config.content}
            </div>
        `;
        // Clear Right Pane for static content
        document.getElementById('rightPane').innerHTML = '';
        return;
    }

    // Headers Table
    let headersHtml = '<div style="color:var(--text-muted); font-style:italic;">No specific headers required.</div>';
    if (config.headers && config.headers.length > 0) {
        headersHtml = config.headers.map(h => `
            <div class="param-row">
                <div class="param-info" style="width: 100%;">
                    <div class="param-header">
                        <span class="param-name">${h.name}</span>
                        <span class="badge" style="background:var(--bg-panel); border:none;">${h.value}</span>
                    </div>
                    <div class="param-desc">${h.desc}</div>
                </div>
            </div>
        `).join('');
    }

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
            <div class="section-title">Headers</div>
            ${headersHtml}
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
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="env-switcher">
                    <button class="env-btn ${currentEnv === 'local' ? 'active' : ''}" onclick="setEnv('local')">Local</button>
                    <button class="env-btn ${currentEnv === 'vercel' ? 'active' : ''}" onclick="setEnv('vercel')">Vercel</button>
                </div>
                <button class="copy-icon-btn" onclick="copyCode()" title="Copy Code">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>
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
    if (config.params) {
        config.params.filter(p => p.type === 'path').forEach(p => {
            url = url.replace(`{${p.name}}`, p.example || p.placeholder);
        });
    }

    // Build Query Params with Examples
    const queryParams = new URLSearchParams();
    if (config.params) {
        config.params.filter(p => p.type === 'query').forEach(p => {
            if (p.example) queryParams.append(p.name, p.example);
        });
    }
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    // Build Body with Examples
    if (config.method === 'POST' && config.params) {
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

function selectLang(lang) {
    currentLang = lang;
    renderRightPane();
}

// Start
init();
