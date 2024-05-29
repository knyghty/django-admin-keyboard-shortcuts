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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", showDialogOnClick);
} else {
  showDialogOnClick();
}
document.addEventListener("keyup", handleKeyUp, false);
