type TargetElement = HTMLInputElement | HTMLTextAreaElement;

export function insertTextAtCursor(element: TargetElement, text: string) {
  if (document.activeElement !== element) {
    element.focus();
  }

  const start = element.selectionStart!;
  const end = element.selectionEnd!;

  element.setRangeText(text, start, end, 'end');
}
