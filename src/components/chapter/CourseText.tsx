import React, { useState } from 'react';
import { splitCourseInline, type TextBlock } from '../../lib/courseText';
import { ManimPlayer } from '../math/ManimPlayer';
import { Tex } from '../math/Tex';
import { Ch01TruthAndEulerLab } from '../visuals/Ch01TruthAndEulerLab';
import { Ch09GraphProductsAndIsoLab } from '../visuals/Ch09GraphProductsAndIsoLab';
import { Ch12EeaAndModularLab } from '../visuals/Ch12EeaAndModularLab';

const labs: Record<string, React.ComponentType> = {
  ch01: Ch01TruthAndEulerLab,
  ch09: Ch09GraphProductsAndIsoLab,
  ch12: Ch12EeaAndModularLab,
};

export function CourseInline({ text }: { text: string }) {
  return <>{splitCourseInline(text).map((token, index) => {
    if (index % 2 === 0) return token.replace(/\\\$/g, '$');
    if (token.startsWith('$')) return <Tex key={index} math={token.slice(1, -1)} />;
    if (token.startsWith('`')) return <code key={index}>{token.slice(1, -1)}</code>;
    if (token.startsWith('**')) return <strong key={index}><CourseInline text={token.slice(2, -2)} /></strong>;
    return <em key={index}><CourseInline text={token.slice(1, -1)} /></em>;
  })}</>;
}

function PracticeProblem({ block }: { block: Extract<TextBlock, { kind: 'practice' }> }) {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="course-practice">
      <h4><CourseInline text={block.title} /></h4>
      <CourseText blocks={block.prompt} />
      <button className="ctrl-btn" type="button" aria-expanded={showAnswer} onClick={() => setShowAnswer((open) => !open)}>
        {showAnswer ? 'Hide solution' : 'Show solution'}
      </button>
      {showAnswer && <div className="course-solution"><CourseText blocks={block.answer} /></div>}
    </div>
  );
}

export function CourseText({ blocks }: { blocks: TextBlock[] }) {
  return <>{blocks.map((block, index) => {
    switch (block.kind) {
      case 'paragraph': return <p key={index}><CourseInline text={block.text} /></p>;
      case 'quote': return <blockquote key={index} className="course-callout"><CourseInline text={block.text} /></blockquote>;
      case 'math': return <Tex key={index} math={block.text} display />;
      case 'code': return <pre key={index} className="course-code"><code>{block.text}</code></pre>;
      case 'heading': {
        const Tag = block.level === 4 ? 'h4' : 'h3';
        return <Tag key={index} className="course-subheading"><CourseInline text={block.text} /></Tag>;
      }
      case 'list': {
        const Tag = block.ordered ? 'ol' : 'ul';
        return <Tag key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}><CourseInline text={item} /></li>)}</Tag>;
      }
      case 'table': {
        const [headings, ...rows] = block.rows;
        return <div key={index} className="clean-table-wrap"><table className="clean-table">
          <thead><tr>{headings.map((cell, i) => <th scope="col" key={i}><CourseInline text={cell} /></th>)}</tr></thead>
          <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}><CourseInline text={cell} /></td>)}</tr>)}</tbody>
        </table></div>;
      }
      case 'practice': return <PracticeProblem key={index} block={block} />;
      case 'manim': return <ManimPlayer key={index} src={`animations/${block.file}`} title={block.title} subtitle="" caption={<CourseText blocks={block.caption} />} />;
      case 'lab': {
        const Lab = labs[block.name];
        if (!Lab) throw new Error(`Unknown course lab ${block.name}`);
        return <Lab key={index} />;
      }
    }
  })}</>;
}
