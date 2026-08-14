let toastListener = null;

export function setToastListener(listener) {
  toastListener = listener;
}

export function showToast(message, type = 'info') {
  if (toastListener) {
    toastListener({ id: Date.now(), message, type });
  }
}
