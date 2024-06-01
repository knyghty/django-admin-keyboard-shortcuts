var checkboxes = null;
var currentCheckbox = null;

function setUpShortcuts() {
  checkboxes = document.querySelectorAll("#action-toggle, .action-select");
  console.log(checkboxes);
}

function focusPreviousCheckbox() {
  console.log(checkboxes);
  if (!currentCheckbox) {
    currentCheckbox = checkboxes.length - 1;
  } else {
    currentCheckbox = checkboxes[Array.prototype.indexOf.call(checkboxes, currentCheckbox) - 1];
  }
  currentCheckbox.focus();
}

function focusNextCheckbox() {
  if (!currentCheckbox) {
    currentCheckbox = checkboxes[0];
  } else {
    currentCheckbox = checkboxes[Array.prototype.indexOf.call(checkboxes, currentCheckbox) + 1];
  }
  currentCheckbox.focus();
}

function selectCheckbox() {
  if (currentCheckbox) {
    currentCheckbox.click();
  }
}

function handleKeyUp(event) {
  switch (event.key) {
    case "j":
      focusPreviousCheckbox();
      break;
    case "k":
      focusNextCheckbox();
      break;
    case "x":
      selectCheckbox();
      break;
  }
}


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setUpShortcuts);
} else {
  setUpShortcuts();
}
document.addEventListener("keyup", handleKeyUp);
