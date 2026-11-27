import { findNoteMath } from './noteMath';
import { findNoteShorthand } from './noteShorthand';

export function findNoteNotation(source: string) {
  const explicit = findNoteMath(source);
  const shorthand = findNoteShorthand(source, explicit);
  const expressions = shorthand.length
    ? [...explicit, ...shorthand].sort((left, right) => left.start - right.start)
    : explicit;
  return { explicit, shorthand, expressions };
}
