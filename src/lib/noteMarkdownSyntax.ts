const blocks = /^(?: {0,3}(?:#{1,6}(?:[ \t]|\r?$)|>|(?:[-+*]|\d{1,9}[.)])[ \t]+\S|`{3,}|~{3,}|(?:[-*_][ \t]*){3,}\r?$)|(?: {4}|\t)\S)/m;
const emphasis = /(?<![\\\w])(?:\*{1,3}(?=\S)[^*\r\n]+?\*{1,3}|_{1,3}(?=\S)[^_\r\n]+?_{1,3}(?!\w)|~~(?=\S)[^~\r\n]+~~)/u;
const links = /(?<!\\)(?:\[[^\[\]\r\n]+\]\([^)]+\)|<(?:https?:\/\/|mailto:)[^>]+>)|(?:^|[\s(])(?:https?:\/\/|www\.)(?=\S)/u;
const references = /^ {0,3}\[[^\]\r\n]+\]:[ \t]*\S/m;
const code = /(?<![\\`])(`+)(?!`)[^\r\n]+?\1(?!`)/u;
const table = /^[ \t]*(?:\|[ \t]*)?:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)+(?:\|[ \t]*)?\r?$/m;
const setext = /^[ \t]*\S[^\r\n]*\r?\n {0,3}(?:=+|-+)[ \t]*\r?$/m;

export function hasNoteMarkdown(source: string) {
  return blocks.test(source) || emphasis.test(source) || links.test(source) || references.test(source)
    || code.test(source) || table.test(source) || setext.test(source);
}
