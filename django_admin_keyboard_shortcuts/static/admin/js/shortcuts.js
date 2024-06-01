function isApple() {
  return (
    navigator.platform.indexOf("Mac") === 0 ||
    navigator.platform === "iPhone"
  )
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
