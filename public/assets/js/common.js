// --- Config & State ---
const ENV_CONFIG = {
    local: 'http://localhost:3000/api/v1',
    vercel: 'https://postal-pincode-api.vercel.app/api/v1'
};

// Global State
let currentEnv = localStorage.getItem('api_env') || 'local';
let currentLang = 'curl'; // curl, python, js

// --- Endpoint Definitions ---
const ENDPOINTS = {
    intro: {
        title: 'Introduction',
        desc: 'Welcome to the Indian Postal Pincode API.',
        type: 'static',
        content: `
            <div class="doc-section">
                <h3>Purpose</h3>
                <p>
                    The <strong>Indian Postal Pincode API</strong> is designed to provide developers with a reliable, fast, and easy-to-use interface for accessing comprehensive data about the Indian Postal network. 
                    With over 150,000 post offices across India, navigating this data can be complex. This API simplifies the process by offering:
                </p>
                <ul style="margin-left: 1.5rem; margin-top: 1rem; line-height: 1.8; color: var(--text-muted);">
                    <li><strong>Pincode Lookups:</strong> Instantly retrieve details like district, state, and office name for any 6-digit pincode.</li>
                    <li><strong>Location Search:</strong> Find post offices by name, district, or state with fuzzy search capabilities.</li>
                    <li><strong>Geospatial Data:</strong> Locate the nearest post offices based on latitude and longitude coordinates.</li>
                    <li><strong>Validation:</strong> Verify the existence and correctness of pincodes in real-time.</li>
                </ul>
                <p style="margin-top: 1.5rem;">
                    Whether you are building an e-commerce platform, a logistics application, or a simple address auto-fill feature, this API provides the essential data infrastructure to enhance your user experience.
                </p>
            </div>
        `
    },
    pincode: {
        title: 'Get Pincode Details',
        desc: 'Retrieve detailed information about a specific Pincode. This includes the post office name, district, state, and other related data.',
        method: 'GET',
        path: '/pincode/{code}',
        headers: [],
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
        headers: [
            { name: 'Content-Type', value: 'application/json', desc: 'Required for sending JSON body.' }
        ],
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
        headers: [],
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
        headers: [],
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
        headers: [],
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
        headers: [],
        autoTrigger: true,
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
        headers: [],
        params: [
            { name: 'lat', type: 'query', dataType: 'float', desc: 'Latitude of the location.', placeholder: '23.0225', required: true, example: '23.0225', hasAction: true },
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
        headers: [],
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
        headers: [],
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
        headers: [],
        params: [
            { name: 'district', type: 'path', dataType: 'string', desc: 'Name of the district.', placeholder: 'Ahmedabad', required: true, example: 'Ahmedabad' }
        ],
        responseParams: [
            { name: 'offices', type: 'array', desc: 'List of post office names.' }
        ]
    }
};

// --- Shared Helper Functions ---

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function getLangLabel(lang) {
    if (lang === 'curl') return 'cURL';
    if (lang === 'python') return 'Python';
    if (lang === 'js') return 'JavaScript';
    return lang;
}

function toggleLangDropdown() {
    const menu = document.getElementById("langMenu");
    if (menu) menu.classList.toggle("show");
}

function updateEnvUI() {
    document.querySelectorAll('.env-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === currentEnv);
    });
}

function copyCode() {
    const codeDisplay = document.getElementById('codeDisplay');
    if (!codeDisplay) return;

    const text = codeDisplay.textContent;
    navigator.clipboard.writeText(text).then(() => {
        // Try to find the button in different contexts
        let btn = document.querySelector('.code-header .copy-icon-btn'); // Playground
        if (!btn) btn = document.querySelector('.pane-header .copy-icon-btn'); // Docs

        if (btn) {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            setTimeout(() => btn.innerHTML = originalHtml, 2000);
        }
    });
}

// Close dropdown when clicking outside (Shared)
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
};
