let pressedKeys = new Set();

function isApple() {
  return (
    navigator.platform.indexOf("Mac") === 0 ||
    navigator.platform === "iPhone"
  )
}

function removePressedKey(key) {
  pressedKeys.delete(key);
}

function storeKeyCombo(key) {
  pressedKeys.add(key);
  console.log(pressedKeys);
  setTimeout(function() { removePressedKey(key); }, 5000);
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
  if (event.key === "?") {
    showDialog("shortcuts-dialog");
  } else if (event.key === "g") {
    storeKeyCombo("g");
  } else if (event.key === "i" && pressedKeys.has("g")) {
    document.location.href = "/admin/";
  } else if (event.key === "l" && pressedKeys.has("g")) {
    showDialog("model-list-dialog");
  }
}

function replaceModifiers() {
  if (isApple()) {
    document.querySelectorAll(".shortcut-keys .alt").forEach(function(modifier) {
      modifier.innerHTML = "⌥";
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", showDialogOnClick);
  document.addEventListener("DOMContentLoaded", replaceModifiers);
} else {
  showDialogOnClick();
  replaceModifiers();
}
document.addEventListener("keyup", handleKeyUp);
