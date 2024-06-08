let previousKey = undefined;
const shortcutFunctions = new Map([
  ["g i", () => { document.location.href = "/admin/"; }],
  ["g l", () => showDialog("model-list-dialog")]
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
  return (
    navigator.platform.indexOf("Mac") === 0 ||
    navigator.platform === "iPhone"
  )
}

function removePreviousKey(key) {
  if (previousKey === key) {
    previousKey = undefined;
  }
}

function storePreviousKey(key) {
  previousKey = key;
  setTimeout(function() { removePreviousKey(key); }, 5000);
}

function showDialog(id) {
  dialog = document.getElementById(id);
  dialog.showModal();
}

function showShortcutsDialog() {
  showDialog("shortcuts-dialog");
}

function showDialogOnClick() {
  dialogButton = document.getElementById("open-shortcuts");
  dialogButton.addEventListener("click", showShortcutsDialog);
}

function handleKeyUp(event) {
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
  const options = [];
  const modelListDialog = document.getElementById('model-list-dialog');
  if (!modelListDialog) {
      return;
  }
  modelListDialog.querySelectorAll('li a').forEach((container) => {
      options.push({title: container.innerHTML, node: container});
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
      for (const option of options) {
          let displayValue = '';
          if (!filterValue || option.title.toLowerCase().indexOf(filterValue) === -1) {
            displayValue = 'none'
          }
          option.node.parentNode.style.display = displayValue;
      }

  }

  const nav = document.getElementById('model-list-dialog-search');
  nav.addEventListener('change', checkValue, false);
  nav.addEventListener('input', checkValue, false);
  nav.addEventListener('keyup', checkValue, false);

  // We don't want to show anything on the list until the user starts typing
  checkValue({ target: { value: ''} , key: ''})
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
