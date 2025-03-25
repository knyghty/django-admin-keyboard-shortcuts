'use strict';

const inputTextFieldTypes = ['text', 'email', 'tel', 'url'];

/**
 * Checks if the currently focused element is a text field.
 * @returns {boolean} True if a text field is focused, otherwise false.
 */
function isFocusedTextField() {
    const activeElement = document.activeElement;
    return activeElement.nodeName === 'TEXTAREA' || 
           (activeElement.nodeName === 'INPUT' && (!activeElement.type || inputTextFieldTypes.includes(activeElement.type)));
}

const shortcutFunctions = new Map([
    ["g i", () => { window.location.href = "/admin/"; }],
    ["g l", () => {
        window.isModelNative = true;
        showDialog("model-list-dialog");
    }],
    ["g c", () => {
        window.isModelNative = false;
        showModelDialog();
    }],
]);

let previousKey = null;

/**
 * Registers declarative keyboard shortcuts from data attributes.
 */
function registerDeclarativeShortcuts() {
    document.querySelectorAll('[data-keyboard-shortcut]').forEach(element => {
        shortcutFunctions.set(element.getAttribute('data-keyboard-shortcut'), () => element.click());
    });
}

/**
 * Detects if the user is on an Apple device.
 * @returns {boolean} True if Apple device, otherwise false.
 */
function isAppleDevice() {
    return navigator.platform.startsWith("Mac") || navigator.platform === "iPhone";
}

/**
 * Handles keydown events and triggers corresponding shortcut actions.
 * @param {KeyboardEvent} event - The keydown event object.
 */
function handleKeyDown(event) {
    if (isFocusedTextField()) return;
    
    const keyCombo = previousKey ? `${previousKey} ${event.key}` : event.key;
    if (shortcutFunctions.has(keyCombo)) {
        shortcutFunctions.get(keyCombo)();
        previousKey = null;
        return;
    }
    previousKey = event.key;
    setTimeout(() => { if (previousKey === event.key) previousKey = null; }, 5000);
}

/**
 * Shows a modal dialog by its ID.
 * @param {string} id - The ID of the dialog to display.
 */
function showDialog(id) {
    const dialog = document.getElementById(id);
    const searchInput = dialog.querySelector('input[type="search"]');
    if (searchInput) searchInput.value = '';
    filterModelList();
    if (dialog) dialog.showModal();
}

/**
 * Shows the shortcut dialog.
 */
function showShortcutsDialog() {
    showDialog("shortcuts-dialog");
}

/**
 * Initializes event listeners for shortcut modal button.
 */
function initShortcutButton() {
    document.getElementById("open-shortcuts")?.addEventListener("click", showShortcutsDialog);
}

/**
 * Replaces modifier key symbols for Mac users.
 */
function replaceModifiers() {
    if (isAppleDevice()) {
        document.querySelectorAll(".shortcut-keys .alt").forEach(modifier => {
            modifier.innerHTML = "⌥";
        });
    }
}

/**
 * Filters the model list based on user input.
 */
function filterModelList() {
    const searchInput = document.getElementById("model-list-dialog-search");
    const modelListDialog = document.getElementById("model-list-dialog");
    if (!searchInput || !modelListDialog) return;

    const sections = Array.from(modelListDialog.querySelectorAll("section"));

    function updateVisibility(event) {
        let query = event.target.value.toLowerCase().trim();
        if (event.key === "Escape") query = "";
        event.target.value = query;

        sections.forEach(section => {
            const items = Array.from(section.querySelectorAll("li a"));
            let hasMatch = false;
            items.map(item => {
                const match = item.textContent.toLowerCase().includes(query);
                item.parentElement.style.display = match ? "" : "none";
                if (match) {
                    hasMatch = true;
                }
            });
            section.style.display = hasMatch ? "" : "none";
        });
    }

    ["input", "change", "keydown"].forEach(evt => searchInput.addEventListener(evt, updateVisibility));

    // Reset search value and list
    updateVisibility({target: {value: ''}})
}

/**
 * Shows the model selection dialog and resets its state.
 */
function showModelDialog() {
    const modelListDialog = document.getElementById('model-list-dialog');
    if (!modelListDialog) return;
    
    // Clear previous search
    const searchInput = modelListDialog.querySelector('input[type="search"]');
    if (searchInput) {
        searchInput.value = '';
    }
    
    modelListDialog.querySelectorAll('section').forEach(section => {
        section.style.display = ''; // Show all sections
        section.querySelectorAll('li').forEach(item => {
            item.style.display = ''; // Show all items
        });
    });
    
    showDialog("model-list-dialog");
    setupModelListHandlers();
}

/**
 * Sets up event handlers for the model list dialog items.
 */
function setupModelListHandlers() {
    const modelListDialog = document.getElementById('model-list-dialog');
    
    // Remove any existing click handlers
    modelListDialog.querySelectorAll('li a').forEach(link => {
        link.removeEventListener('click', handleModelClick);
    });
    
    // Add new click handlers
    modelListDialog.querySelectorAll('li a').forEach(link => {
        link.addEventListener('click', handleModelClick);
    });
}

/**
 * Makes 1st letter capital and adds 's' at the end
 * @param {String} string - The string input
 * @returns {String} The modified string
 */
function capitalize(string) {
    const str = string.trim();
    return str.slice(0, 1).toUpperCase() + str.slice(1) + 's';
}

/**
 * Lists instances for a selected model, optionally filtered by a search query.
 * @param {string|null} query - Search query to filter instances
 * @param {AbortSignal|null} signal - AbortController signal for cancelling requests
 */
async function listInstances(query=null, signal=null) {
    const instanceDialog = document.getElementById('instance-list-dialog');
    if (!instanceDialog) return;
    const modelName = window.selectedModelName;
    
    // Set the selected model chip
    const chipContainer = instanceDialog.querySelector('.selected-model-chip');
    if (chipContainer) {
        chipContainer.textContent = modelName;
        chipContainer.style.display = 'inline-block';
    }

    try {
        const url = window.selectedModelUrl
            .replace(/\/$/, '')
            .replace('admin', 'api/instances');

        // eg. /en-gb/api/instances/demo/artist?q=fre
        const response = await fetch(`${url}${query ? '?q='+query : ''}`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            signal
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const instances = await response.json();
        
        // Update instance list
        instanceDialog.querySelector('h3').textContent = capitalize(modelName);
        const instanceList = instanceDialog.querySelector('ul');
        instanceList.innerHTML = instances.map(instance => `
            <li >
                <a href="${window.selectedModelUrl}${instance.id}/change/">
                    ${instance.title}
                </a>
            </li>
        `).join('');
        
    } catch (error) {
        console.error('Error loading instances:', error);
    }
}

/**
 * Handles click events on model items in the model list dialog.
 * @param {Event} event - The click event object
 */
function handleModelClick(event) {
    if (window.isModelNative) {
        return;
    }
    event.preventDefault();
    const modelName = event.target.getAttribute('data-model-name');
    const modelUrl = event.target.getAttribute('href');

    // if (window.isModelNative) {
    //     window.location.href = 
    // }
    
    // Store the model URL for later use
    window.selectedModelUrl = modelUrl;
    window.selectedModelName = modelName;
    
    // Close model dialog and open instance dialog
    document.getElementById('model-list-dialog').close();
    listInstances();

    showDialog('instance-list-dialog');
    setupInstanceListHandlers();
}

/**
 * Sets up event handlers for instance list items and search functionality.
 */
function setupInstanceListHandlers() {
    const instanceListDialog = document.getElementById('instance-list-dialog');
    if (!instanceListDialog) return;

    // Setup search functionality
    const searchInput = instanceListDialog.querySelector('input[type="search"]');
    if (searchInput) {
        searchInput.value = ''; // Clear previous search
        searchInput.focus();
    }

    // Setup instance click handlers
    instanceListDialog.querySelectorAll('li a').forEach(link => {
        link.removeEventListener('click', handleInstanceClick);
        link.addEventListener('click', handleInstanceClick);
    });
}

/**
 * Handles click events on instance items in the instance list dialog.
 * @param {Event} event - The click event object
 */
function handleInstanceClick(event) {
    event.preventDefault();
    const instanceUrl = event.target.getAttribute('href');
    document.getElementById('instance-list-dialog').close();
    window.location.href = instanceUrl;
}

/**
 * Sets up search functionality for the instance list with debouncing.
 */
function filterInstanceList() {
    const searchInput = document.getElementById("instance-list-search");
    const instanceListDialog = document.getElementById("instance-list-dialog");
    if (!searchInput || !instanceListDialog) return;

    let debounceTimer;
    let currentController = null;

    async function updateList(event) {
        if (event.type === 'keydown' && event.key !== 'Escape') return;

        let query = event.target.value.toLowerCase().trim();
        
        if (event.key === "Escape") {
            query = "";
            event.target.value = query;
            return;
        }

        // Clear any existing timeout
        clearTimeout(debounceTimer);
        
        // Avoid short queries
        if (query.length < 2) return;

        // Abort any pending requests
        if (currentController) {
            currentController.abort();
        }

        // Create new controller for this request
        currentController = new AbortController();
    
        // Set a new timeout
        debounceTimer = setTimeout(async () => {
            try {
                await listInstances(query, currentController.signal);
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Search request cancelled');
                } else {
                    console.error('Search error:', error);
                }
            }
        }, 500); // Wait 500ms after user stops typing
    }

    ["input", "keydown"].forEach(evt => 
        searchInput.addEventListener(evt, updateList));
}

/**
 * Removes the currently selected model and returns to model selection dialog.
 */
function removeCurrentModel() {
    window.selectedModelUrl = null;
    window.selectedModelName = null;
    document.getElementById("instance-list-dialog").close();
    showModelDialog();
}

/**
 * Initializes all shortcut-related functionalities.
 */
function initShortcuts() {
    initShortcutButton();
    replaceModifiers();
    filterModelList();
    filterInstanceList();
    registerDeclarativeShortcuts();
    document.addEventListener("keydown", handleKeyDown);
}

document.readyState === "loading" 
    ? document.addEventListener("DOMContentLoaded", initShortcuts)
    : initShortcuts();
