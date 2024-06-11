'use strict';
{
    let previousKey = undefined;
    const shortcutFunctions = new Map([
        ["g i", () => { document.location.href = "/admin/"; }],
        ["g l", () => showDialog("model-list-dialog")]
    ]);
    const inputTextFieldTypes = ['text', 'email', 'tel', 'url'];

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

    function is_focused_text_field() {
      let tag = document.activeElement.nodeName,
          type = document.activeElement.nodeName;
      return tag === 'TEXTAREA' || (tag === 'INPUT' && (!type || inputTextFieldTypes.includes(type)));
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

    function showShortcutsDialog() {
        showDialog("shortcuts-dialog");
    }

    function showDialogOnClick() {
        const dialogButton = document.getElementById("open-shortcuts");
        dialogButton.addEventListener("click", showShortcutsDialog);
    }

    function handleKeyUp(event) {
        if (is_focused_text_field()) return;
        const shortcut = previousKey ? `${previousKey} ${event.key}` : event.key;
        if (shortcutFunctions.has(shortcut)) {
            shortcutFunctions.get(shortcut)();
        } else {
            storePreviousKey(event.key);
        }
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
        nav.addEventListener('keyup', checkValue, false);

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
    document.addEventListener("keyup", handleKeyUp);
}
