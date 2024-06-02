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

function showDialog() {
  dialog = document.getElementById("shortcuts-dialog");
  dialog.showModal();
}

function showDialogOnClick() {
  dialogButton = document.getElementById("open-shortcuts");
  dialogButton.addEventListener("click", showDialog);
}

function handleKeyUp(event) {
  if (event.key === "?") {
    showDialog();
  } else if (event.key === "g") {
    console.log(event.key)
    storeKeyCombo("g");
  } else if (event.key === "i" && pressedKeys.has("g")) {
    console.log(event.key);
    document.location.href = "/admin/";
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
