interface CaretPoint { path: number[]; offset: number }

interface EditorState {
  html: string;
  body: string;
  markdown: boolean;
  anchor: CaretPoint | null;
  focus: CaretPoint | null;
}

export function captureNoteEditor(editor: HTMLElement, body: string, markdown: boolean, html = editor.innerHTML): EditorState {
  const selection = editor.ownerDocument.getSelection();
  const point = (node: Node | null | undefined, offset: number): CaretPoint | null => {
    if (!node || !editor.contains(node)) return null;
    const path: number[] = [];
    while (node !== editor && node.parentNode) {
      const parent: Node = node.parentNode;
      path.unshift(Array.from(parent.childNodes).findIndex((child) => child === node));
      node = parent;
    }
    return { path, offset };
  };
  return {
    html, body, markdown,
    anchor: point(selection?.anchorNode, selection?.anchorOffset ?? 0),
    focus: point(selection?.focusNode, selection?.focusOffset ?? 0),
  };
}

export function restoreNoteEditor(editor: HTMLElement, state: EditorState) {
  editor.innerHTML = state.html;
  editor.focus({ preventScroll: true });
  const selection = editor.ownerDocument.getSelection();
  const resolve = (point: CaretPoint | null) => {
    const node = point?.path.reduce<Node | null>((element, index) => element?.childNodes[index] ?? null, editor);
    if (!point || !node) return null;
    const limit = node instanceof Text ? node.length : node.childNodes.length;
    return { node, offset: Math.min(limit, point.offset) };
  };
  const anchor = resolve(state.anchor);
  const focus = resolve(state.focus);
  if (anchor && focus) selection?.setBaseAndExtent(anchor.node, anchor.offset, focus.node, focus.offset);
  else selection?.collapse(editor, editor.childNodes.length);
}

export class NoteEditorHistory {
  private states: EditorState[] = [];
  private index = 0;
  private lastTyping = 0;

  reset(state: EditorState) {
    this.states = [state];
    this.index = 0;
    this.lastTyping = 0;
  }

  pauseTyping() {
    this.lastTyping = 0;
  }

  record(state: EditorState, typing: boolean) {
    const current = this.states[this.index];
    if (current && current.html === state.html && current.body === state.body) return;
    const now = Date.now();
    const atLatest = this.index === this.states.length - 1;
    if (typing && atLatest && this.index > 0 && now - this.lastTyping < 500) this.states[this.index] = state;
    else {
      this.states.splice(this.index + 1, this.states.length, state);
    }
    let total = this.states.reduce((size, entry) => size + entry.html.length + entry.body.length, 0);
    while (this.states.length > 2 && (this.states.length > 40 || total > 2_000_000)) {
      const oldest = this.states.shift()!;
      total -= oldest.html.length + oldest.body.length;
    }
    this.index = this.states.length - 1;
    this.lastTyping = typing ? now : 0;
  }

  step(direction: -1 | 1) {
    const index = this.index + direction;
    const state = this.states[index];
    if (state) {
      this.index = index;
      this.lastTyping = 0;
    }
    return state;
  }
}
