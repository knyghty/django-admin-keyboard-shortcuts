'use strict';
{
    let checkboxes = null;
    let currentCheckboxIndex = null;

    function setUpShortcuts() {
        checkboxes = document.querySelectorAll("#action-toggle, .action-select");
    }

    function focusPreviousCheckbox() {
        if (!checkboxes.length) {
            return;
        }
        if (currentCheckboxIndex === null) {
            currentCheckboxIndex = checkboxes.length - 1;
        } else {
            currentCheckboxIndex = (currentCheckboxIndex - 1 + checkboxes.length) % checkboxes.length;
        }
        checkboxes[currentCheckboxIndex].focus();
    }

    function focusNextCheckbox() {
        if (!checkboxes.length) {
            return;
        }
        if (currentCheckboxIndex === null) {
            currentCheckboxIndex = 0;
        } else {
            currentCheckboxIndex = (currentCheckboxIndex + 1) % checkboxes.length;
        }
        checkboxes[currentCheckboxIndex].focus();
    }

    function selectCheckbox() {
        checkboxes[currentCheckboxIndex].click();
    }

    function selectActionsSelect() {
        const actionsSelect = document.querySelector("select[name=action]");
        actionsSelect.focus();
    }

    function handleKeyDown(event) {
        if (isFocusedTextField()) { return; }
        switch (event.code) {
        case "KeyK":
            focusPreviousCheckbox();
            break;
        case "KeyJ":
            focusNextCheckbox();
            break;
        case "KeyX":
            selectCheckbox();
            break;
        case "KeyA":
            selectActionsSelect();
            break;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setUpShortcuts);
    } else {
        setUpShortcuts();
    }
    document.addEventListener("keydown", handleKeyDown);
}
