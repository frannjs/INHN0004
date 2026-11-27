import React, { useMemo } from 'react';
import katex from 'katex';
import { copySelectionWithMath } from '../notes/noteEditableSelection';

interface TexProps {
  math: string;
  display?: boolean;
  className?: string;
  fallback?: string;
  as?: 'span' | 'div';
  dataSource?: string;
}

export const Tex: React.FC<TexProps> = ({ math, display = false, className, fallback, as, dataSource }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        output: 'htmlAndMathml',
        throwOnError: fallback !== undefined,
        strict: false,
        trust: false,
        maxSize: fallback === undefined ? Infinity : 20,
      });
    } catch (error) {
      if (fallback === undefined) throw error;
      return null;
    }
  }, [math, display, fallback]);

  if (html === null) return <span className={className} data-note-math-source={dataSource}>{fallback}</span>;

  const Element = as ?? (display ? 'div' : 'span');
  return (
    <Element
      className={className}
      data-note-math-source={dataSource}
      onCopy={(event) => {
        const root = event.currentTarget.closest<HTMLElement>('.note-editor-input,.note-body,.note-markdown,.chapter-article')
          ?? event.currentTarget.parentElement ?? event.currentTarget;
        copySelectionWithMath(event.nativeEvent, root);
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
