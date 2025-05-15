'use strict';

const inputNonTextFieldTypes = ['submit', 'reset', 'checkbox', 'radio', 'file', 'button'];

function isFocusedTextField() {
    const tag = document.activeElement.nodeName;
    const type = document.activeElement.type;
    const isContentEditable = document.activeElement.isContentEditable;
    return (
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (tag === 'INPUT' && !inputNonTextFieldTypes.includes(type)) ||
        isContentEditable
    );
}

{
    let previousKey = undefined;
    const shortcutFunctions = new Map([
        ["g i", () => { document.location.href = "/admin/"; }],
        ["g l", () => showDialog("model-list-dialog")],
        ["g c", () => showInstanceListDialog()]
    ]);

    function registerDeclarativeShortcuts() {
        const elements = document.querySelectorAll('[data-keyboard-shortcut]');
        for (const element of elements) {
            shortcutFunctions.set(element.getAttribute('data-keyboard-shortcut'), () => {
                element.click();
            });
        }
    }

    function isApple() {
        return (navigator.platform.indexOf("Mac") === 0 || navigator.platform === "iPhone");
    }

    function removePreviousKey(key) {
        if (previousKey === key) {
            previousKey = undefined;
        }
    }

    function storePreviousKey(key) {
        previousKey = key;
        setTimeout(function() {
            removePreviousKey(key);
        }, 5000);
    }

    function showDialog(id) {
        const dialog = document.getElementById(id);
        dialog.showModal();
    }
    function showInstanceListDialog() {
        const dialog = document.getElementById("instance-list-dialog");
        dialog.showModal();
        django.SelectBoxUtils.show("#shortcuts-model-select");
        django.SelectBoxUtils.open("#shortcuts-model-select");
        django.SelectBoxUtils.hide("#shortcuts-instance-select");
    }
    function showShortcutsDialog() {
        showDialog("shortcuts-dialog");
    }

    function showDialogOnClick() {
        const dialogButton = document.getElementById("open-shortcuts");
        dialogButton.addEventListener("click", showShortcutsDialog);
    }

    function handleKeyDown(event) {
        // If we're in a focused text field, don't apply keyboard shortcuts
        if (isFocusedTextField()) {
            return;
        }

        // If there's a previous key, we first check whether the combination of the
        // previous key followed by the current key are a shortcut
        const shortcutWithPreviousKey = previousKey ? `${previousKey} ${event.key}` : null;
        if (shortcutWithPreviousKey && shortcutFunctions.has(shortcutWithPreviousKey)) {
            shortcutFunctions.get(shortcutWithPreviousKey)();
            return;
        }

        // Otherwise, check if the new key has a shortcut, e.g `?`
        if (shortcutFunctions.has(event.key)) {
            shortcutFunctions.get(event.key)();
            return;
        }

        // Simply store the key for the next keyDown
        storePreviousKey(event.key);

    }

    function replaceModifiers() {
        if (isApple()) {
            document.querySelectorAll(".shortcut-keys .alt").forEach(function(modifier) {
                modifier.innerHTML = "⌥";
            });
        }
    }

    // This overlaps a lot with the initSidebarQuickFilter function
    // defined in django/contrib/admin/static/admin/js/nav_sidebar.js
    // If/when merged into core, we could try to reuse some parts
    function filterModelList() {
        const modelListDialog = document.getElementById('model-list-dialog');
        if (!modelListDialog) {
            return;
        }

        const appSections = [];

        modelListDialog.querySelectorAll('section').forEach(section => {
            const options = [];
            section.querySelectorAll('li a').forEach(container => options.push({
                title: container.innerHTML, node: container
            }));

            appSections.push({
                node: section, options,
            });
        });

        function checkValue(event) {
            let filterValue = event.target.value;
            if (filterValue) {
                filterValue = filterValue.toLowerCase();
            }
            if (event.key === 'Escape') {
                filterValue = '';
                event.target.value = ''; // clear input
            }

            appSections.forEach(section => {
                let matched = false;
                // Check if any of the app models match the filter text
                section.options.forEach((option) => {
                    let optionDisplay = '';
                    if (option.title.toLowerCase().indexOf(filterValue) === -1) {
                        optionDisplay = 'none';
                    } else {
                        matched = true;
                    }
                    // Set display in parent <li> element
                    option.node.parentNode.style.display = optionDisplay;
                });

                let sectionDisplay = '';
                // If there's no filter value or no matched models
                // for the section, we hide the section entirely
                if (!filterValue || !matched) {
                    sectionDisplay = 'none';
                }
                // Set display for the app section
                section.node.style.display = sectionDisplay;
            });
        }

        const nav = document.getElementById('model-list-dialog-search');
        nav.addEventListener('change', checkValue, false);
        nav.addEventListener('input', checkValue, false);
        nav.addEventListener('keydown', checkValue, false);

        // We don't want to show anything on the list until the user starts typing
        checkValue({target: {value: ''}, key: ''});
    }


    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", showDialogOnClick);
        document.addEventListener("DOMContentLoaded", replaceModifiers);
        document.addEventListener("DOMContentLoaded", filterModelList);
        document.addEventListener("DOMContentLoaded", registerDeclarativeShortcuts);
    } else {
        showDialogOnClick();
        replaceModifiers();
        filterModelList();
        registerDeclarativeShortcuts();
    }
    document.addEventListener("keydown", handleKeyDown);
}
