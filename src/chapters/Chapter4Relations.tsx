import React, { useState } from 'react';
import { Tex } from '../components/math/Tex';
import { RelationGraphMatrixLab } from '../components/visuals/RelationGraphMatrixLab';
import { RelationalProductBridge } from '../components/visuals/RelationalProductBridge';
import { TokenWalkAndClosureExplorer } from '../components/visuals/TokenWalkAndClosureExplorer';
import { EndorelationPropertyInspector } from '../components/visuals/EndorelationPropertyInspector';
import { PracticeCheckpoint } from '../components/PracticeCheckpoint';
import { ManimPlayer } from '../components/math/ManimPlayer';

const QuickCheck: React.FC<{
  title: React.ReactNode;
  prompt: React.ReactNode;
  answer: React.ReactNode;
}> = ({ title, prompt, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="quick-check-box">
      <div className="quick-check-header">
        <span className="quick-check-badge">Quick Check</span>
        <button type="button" className="ctrl-btn" onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide Answer' : 'Check Answer'}
        </button>
      </div>
      <div className="quick-check-title">{title}</div>
      <div style={{ fontSize: 17.5 }}>{prompt}</div>
      {open && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid rgba(244, 211, 94, 0.16)',
            fontSize: 16.5,
            color: 'var(--ink-body)',
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
};

const RecognitionCue: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="recognition-cue">
    <div className="recognition-cue-label">What to Recognize Next Time</div>
    <div style={{ fontSize: 17 }}>{children}</div>
  </div>
);

interface GradedProblemProps {
  badge: string;
  question: React.ReactNode;
  options: { label: React.ReactNode; isCorrect: boolean; feedback: React.ReactNode }[];
  hint: React.ReactNode;
  fullSolution: React.ReactNode;
}

const GradedExercise: React.FC<GradedProblemProps> = ({
  badge,
  question,
  options,
  hint,
  fullSolution,
}) => {
  const [picked, setPicked] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSol, setShowSol] = useState(false);

  return (
    <div className="exercise-card">
      <div className="math-block-header">
        <span className="math-block-label">{badge}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="ctrl-btn" onClick={() => setShowHint((v) => !v)}>
            {showHint ? 'Hide Hint' : 'Hint'}
          </button>
          <button type="button" className="ctrl-btn" onClick={() => setShowSol((v) => !v)}>
            {showSol ? 'Hide Solution' : 'Solution'}
          </button>
        </div>
      </div>

      <div>{question}</div>

      <div style={{ marginTop: 10 }}>
        {options.map((opt, idx) => {
          let cls = 'option-row';
          if (picked === idx) cls += opt.isCorrect ? ' correct' : ' wrong';
          return (
            <button
              key={idx}
              type="button"
              className={cls}
              onClick={() => setPicked(idx)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div
          style={{
            marginTop: 12,
            fontSize: 16,
            color: options[picked].isCorrect ? 'var(--m-green)' : 'var(--m-red)',
          }}
        >
          {options[picked].feedback}
        </div>
      )}

      {showHint && (
        <div
          style={{
            marginTop: 12,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(244, 211, 94, 0.06)',
            fontSize: 16,
          }}
        >
          <strong>Hint:</strong> {hint}
        </div>
      )}

      {showSol && (
        <div className="proof-box" style={{ marginTop: 14, marginBottom: 0 }}>
          <div className="proof-header">Complete Solution</div>
          {fullSolution}
        </div>
      )}
    </div>
  );
};

export const Chapter4Relations: React.FC = () => {
  return (
    <article className="chapter-article">
      <div className="chapter-running-head">
        <span>Part I · Foundations</span>
        <span>Chapter 4 · Binary Relations, Composition, and Closures</span>
      </div>

      <div className="chapter-number">Chapter 4</div>
      <h1 className="chapter-title">Binary Relations, Composition, and Closures</h1>

      <p className="chapter-lead">
        Suppose an arrow goes from <Tex math="a" /> to <Tex math="b" />. We can record that same
        fact as a pair <Tex math="(a,b)" />, or put a <Tex math="1" /> in row <Tex math="a" /> and
        column <Tex math="b" /> of a matrix.
      </p>
      <p>
        Now suppose two steps are allowed. In the drawing, we look for a middle vertex where
        the arrows meet. In the matrix, we look for the index where the two entries are both{' '}
        <Tex math="1" />. We can use induction to repeat that same test for any number of steps.
        It gives us a way to calculate where the arrows can take us and, when the graph is too
        big to list, a way to prove that some targets are out of reach.
      </p>

      {/* SYMBOL TABLE */}
      <div className="symbol-box">
        <div className="symbol-box-header">
          <span className="symbol-box-title">Symbols in This Chapter</span>
          <span className="symbol-box-note">
            Conventions: <Tex math="\mathbb{N} = \{1,2,3,\dots\}" />,{' '}
            <Tex math="\mathbb{N}_0 = \{0,1,2,\dots\}" />, <Tex math="[n] = \{1,\dots,n\}" />
          </span>
        </div>
        <table className="symbol-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Notation</th>
              <th style={{ width: '24%' }}>Read aloud</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Tex math="R \subseteq A_1 \times \dots \times A_k" />
              </td>
              <td className="symbol-read">&ldquo;k-ary relation&rdquo;</td>
              <td>
                Set of tuples of arity <Tex math="k" />; if <Tex math="(a_1,\dots,a_k) \in R" />,
                the elements are <Tex math="R" />-related.
              </td>
            </tr>
            <tr>
              <td>
                <Tex math="R \bowtie_{i_0 = j_0} S,\; \pi_{i_1,\dots,i_l}(R)" />
              </td>
              <td className="symbol-read">&ldquo;join&rdquo;, &ldquo;projection&rdquo;</td>
              <td>
                Conditional concatenation of tuples with <Tex math="r_{i_0} = s_{j_0}" />; keeping
                or reordering coordinates <Tex math="i_1,\dots,i_l" />.
              </td>
            </tr>
            <tr>
              <td>
                <Tex math="aRb,\; a \not R b" />
              </td>
              <td className="symbol-read">&ldquo;a relates to b&rdquo;</td>
              <td>
                Infix shorthand for <Tex math="(a,b) \in R" /> and <Tex math="(a,b) \notin R" />.
              </td>
            </tr>
            <tr>
              <td>
                <Tex math="aR,\; Rb,\; XR,\; RY" />
              </td>
              <td className="symbol-read">&ldquo;successors&rdquo;, &ldquo;predecessors&rdquo;</td>
              <td>
                <Tex math="aR \coloneqq \{b \in B \mid (a,b) \in R\}" />;{' '}
                <Tex math="Rb \coloneqq \{a \in A \mid (a,b) \in R\}" />; lifted to{' '}
                <Tex math="X \subseteq A" />, <Tex math="Y \subseteq B" />.
              </td>
            </tr>
            <tr>
              <td>
                <Tex math="\mathrm{Id}_A,\; R^\top,\; M_R" />
              </td>
              <td className="symbol-read">&ldquo;identity&rdquo;, &ldquo;transpose&rdquo;, &ldquo;matrix of R&rdquo;</td>
              <td>
                <Tex math="\mathrm{Id}_A \coloneqq \{(a,a) \mid a \in A\}" />;{' '}
                <Tex math="R^\top \coloneqq R^{-1} \coloneqq \{(b,a) \mid (a,b) \in R\}" />;{' '}
                <Tex math="0/1" /> matrix <Tex math="(r_{i,j})" />.
              </td>
            </tr>
            <tr>
              <td>
                <Tex math="RS" />
              </td>
              <td className="symbol-read">&ldquo;relational product R then S&rdquo;</td>
              <td>
                <Tex math="\{(a,d) \mid \exists x \in B \cap C: (a,x) \in R \land (x,d) \in S\}" />;
                for functions, <Tex math="f \circ g = gf" />.
              </td>
            </tr>
            <tr>
              <td>
                <Tex math="R^k,\; R^{\le k},\; R^{<k}" />
              </td>
              <td className="symbol-read">&ldquo;in k, at most k, fewer than k steps&rdquo;</td>
              <td>
                <Tex math="k" />-fold relational product (<Tex math="R^0 = \mathrm{Id}_A" />),{' '}
                <Tex math="\bigcup_{i=0}^k R^i" />, and <Tex math="\bigcup_{i=0}^{k-1} R^i" />.
              </td>
            </tr>
            <tr>
              <td>
                <Tex math="R^+,\; R^*" />
              </td>
              <td className="symbol-read">&ldquo;transitive&rdquo;, &ldquo;reflexive-transitive closure&rdquo;</td>
              <td>
                <Tex math="R^+ \coloneqq \bigcup_{k \in \mathbb{N}} R^k" /> (<Tex math="\ge 1" /> steps);{' '}
                <Tex math="R^* \coloneqq \mathrm{Id}_A \cup R^+ = \bigcup_{k \in \mathbb{N}_0} R^k" />{' '}
                (<Tex math="\ge 0" /> steps).
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ======================================================================
          SECTION 4.1 — k-ARY RELATIONS, JOINS, AND PROJECTIONS
          ====================================================================== */}
      <section id="sec-4-1" className="section-block">
        <h2 className="section-heading">
          <span className="section-num">4.1</span>
          <span>k-ary Relations, Joins, and Projections</span>
        </h2>

        <p>
          Look at a row of a table with three columns: ID, last name, first name. The Cartesian
          product of the three column sets gives all the tuples we could write down. The relation
          keeps the rows that actually occur. The same idea works with <Tex math="k" /> columns,
          or when we choose the rows by a rule instead of listing them.
        </p>

        <div className="math-block">
          <div className="math-block-header">
            <span className="math-block-label">Definition · k-ary Relation</span>
          </div>
          <p>
            For sets <Tex math="A_1, A_2, \dots, A_k" />, a subset{' '}
            <Tex math="R \subseteq A_1 \times A_2 \times \dots \times A_k" /> is called a{' '}
            <strong><Tex math="k" />-ary relation</strong> (or a relation of{' '}
            <strong>arity <Tex math="k" /></strong>). If <Tex math="(a_1, \dots, a_k) \in R" />, we
            say that <Tex math="a_1, \dots, a_k" /> are <strong><Tex math="R" />-related</strong>.
          </p>
        </div>

        <p>
          We can take the union or intersection of two tables with the same columns by comparing
          whole rows. Suppose one table has names and the other has jobs. We need to look inside
          each row to match the IDs. A <strong>join</strong> puts together the rows that match.
          A <strong>projection</strong> keeps the columns we asked for.
        </p>

        <div className="math-block">
          <div className="math-block-header">
            <span className="math-block-label">Definition · Join and Projection</span>
          </div>
          <p>
            Let <Tex math="R \subseteq A_1 \times \dots \times A_k" /> and{' '}
            <Tex math="S \subseteq B_1 \times \dots \times B_l" />.
          </p>
          <ul>
            <li>
              For coordinates <Tex math="i_0 \in [k]" /> and <Tex math="j_0 \in [l]" />, the{' '}
              <strong>join</strong> concatenates tuples whose <Tex math="i_0" />-th and{' '}
              <Tex math="j_0" />-th entries agree:
              <Tex
                math="R \bowtie_{i_0 = j_0} S \;\coloneqq\; \{(r_1, \dots, r_k, s_1, \dots, s_l) \mid (r_i)_{i \in [k]} \in R,\; (s_j)_{j \in [l]} \in S,\; r_{i_0} = s_{j_0}\}."
                display
              />
            </li>
            <li>
              For any tuple of indices <Tex math="i_1, \dots, i_m \in [k]" />, the{' '}
              <strong>projection</strong> extracts (and optionally reorders or duplicates) those
              entries:
              <Tex
                math="\pi_{i_1, \dots, i_m}(R) \;\coloneqq\; \{(r_{i_1}, \dots, r_{i_m}) \mid (r_i)_{i \in [k]} \in R\}."
                display
              />
            </li>
          </ul>
        </div>

        <p>
          In these tables, the names, matriculation numbers, and jobs are stored separately.
          The ID in the first column tells us which person each row describes.
        </p>

        <div className="clean-table-wrap">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
              gap: 20,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'var(--m-blue)', fontWeight: 600, marginBottom: 6 }}>
                <Tex math="R \subseteq A_{\text{Id}} \times A_{\text{last name}} \times A_{\text{first name}}" />
              </div>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>1: Id</th>
                    <th>2: last</th>
                    <th>3: first</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>Man</td><td>Spider</td></tr>
                  <tr><td>2</td><td>Brot</td><td>Bernd</td></tr>
                  <tr><td>3</td><td>Woman</td><td>Wonder</td></tr>
                  <tr><td>4</td><td>Gaga</td><td>Lady</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-secondary)', fontWeight: 600, marginBottom: 6 }}>
                <Tex math="S \subseteq A_{\text{Id}} \times A_{\text{student id}}" />
              </div>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>1: Id</th>
                    <th>2: matric</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>3141</td></tr>
                  <tr><td>2</td><td>271828</td></tr>
                  <tr><td>3</td><td>1701</td></tr>
                  <tr><td>4</td><td>3694</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--m-green)', fontWeight: 600, marginBottom: 6 }}>
                <Tex math="T \subseteq A_{\text{Id}} \times A_{\text{job}}" />
              </div>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>1: Id</th>
                    <th>2: job</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>h</td></tr>
                  <tr><td>2</td><td>b</td></tr>
                  <tr><td>3</td><td>h</td></tr>
                  <tr><td>4</td><td>a</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p>
          We want the first names attached to job <Tex math="h" />. Start in <Tex math="T" />,
          where the job is listed. IDs <Tex math="1" /> and <Tex math="3" /> survive the first
          match, and those are the IDs we can use to find the names in <Tex math="R" />.
          Read <Tex math="\pi_3\bigl(R \bowtie_{1 = 1} (T \bowtie_{2 = 1} \{(h)\})\bigr)" /> from
          the inside out. The subscript <Tex math="2=1" /> tells us which positions to compare.
          The actual comparison is between the job in the second position of a row of{' '}
          <Tex math="T" /> and the <Tex math="h" /> in the singleton's first position.
        </p>

        <ol>
          <li>
            Joining <Tex math="T" /> with the unary singleton <Tex math="\{(h)\}" /> on{' '}
            <Tex math="2 = 1" /> filters <Tex math="T" /> down to rows whose second entry is{' '}
            <Tex math="h" /> and appends <Tex math="h" />:{' '}
            <Tex math="T \bowtie_{2=1} \{(h)\} = \{(1, h, h),\, (3, h, h)\}" />.
          </li>
          <li>
            Joining <Tex math="R" /> with that result on <Tex math="1 = 1" /> glues matching{' '}
            <Tex math="\text{Id}" /> rows into <Tex math="6" />-tuples:{' '}
            <Tex className="tex-wide" math="\{(1, \text{Man}, \text{Spider}, 1, h, h),\, (3, \text{Woman}, \text{Wonder}, 3, h, h)\}" />.
          </li>
          <li>
            Projecting onto coordinate <Tex math="3" /> discards everything except{' '}
            <Tex math="\text{first name}" />, returning the unary relation{' '}
            <Tex math="\{(\text{Spider}),\, (\text{Wonder})\}" />.
          </li>
        </ol>

        <QuickCheck
          title="Track Tuple Width Under Join"
          prompt={
            <>
              If <Tex math="R" /> has arity <Tex math="3" /> and <Tex math="S" /> has arity{' '}
              <Tex math="2" />, what is the arity of <Tex math="R \bowtie_{1=1} S" />, and which
              projection extracts <Tex math="(\text{first name}, \text{matric})" />?
            </>
          }
          answer={
            <>
              <Tex math="R \bowtie_{1=1} S" /> concatenates the <Tex math="3" />-tuple and{' '}
              <Tex math="2" />-tuple without merging the matched column, so its tuples{' '}
              <Tex math="(r_1, r_2, r_3, s_1, s_2)" /> have arity <Tex math="3 + 2 = 5" />.{' '}
              <Tex math="\text{first name}" /> sits at coordinate <Tex math="3" /> and{' '}
              <Tex math="\text{matric}" /> sits at coordinate <Tex math="5" />, so we apply{' '}
              <Tex math="\pi_{3, 5}(R \bowtie_{1=1} S)" />.
            </>
          }
        />
      </section>

      {/* ======================================================================
          SECTION 4.2 — BINARY RELATIONS, DIRECTED GRAPHS, AND MATRICES
          ====================================================================== */}
      <section id="sec-4-2" className="section-block">
        <h2 className="section-heading">
          <span className="section-num">4.2</span>
          <span>Binary Relations, Directed Graphs, and Matrices</span>
        </h2>

        <p>
          Specializing to arity <Tex math="k = 2" /> gives <strong>binary relations</strong>{' '}
          <Tex math="R \subseteq A \times B" /> (with <Tex math="A \neq \emptyset \neq B" /> unless
          noted otherwise). When <Tex math="A = B" />, <Tex math="R \subseteq A \times A" /> is
          called an <strong>endorelation</strong> (or <strong>homogeneous relation</strong>) on{' '}
          <Tex math="A" />.
        </p>

        <div className="math-block">
          <div className="math-block-header">
            <span className="math-block-label">Definition · Successors, Predecessors, Identity, and Transpose</span>
          </div>
          <p>
            Let <Tex math="R \subseteq A \times B" />, <Tex math="a \in A" />,{' '}
            <Tex math="b \in B" />, <Tex math="X \subseteq A" />, and{' '}
            <Tex math="Y \subseteq B" />.
          </p>
          <Tex
            math="\begin{aligned}
              aR &\coloneqq \{y \in B \mid (a,y) \in R\} && \text{(successors of } a \text{ w.r.t. } R\text{)}, &
              XR &\coloneqq \{y \in B \mid \exists x \in X: (x,y) \in R\}, \\
              Rb &\coloneqq \{x \in A \mid (x,b) \in R\} && \text{(predecessors of } b \text{ w.r.t. } R\text{)}, &
              RY &\coloneqq \{x \in A \mid \exists y \in Y: (x,y) \in R\}, \\
              \mathrm{Id}_A &\coloneqq \{(x,x) \mid x \in A\} && \text{(identity relation on } A\text{)}, &
              R^\top &\coloneqq R^{-1} \coloneqq \{(y,x) \mid (x,y) \in R\}.
            \end{aligned}"
            display
          />
        </div>

        <p>
          Read the position of <Tex math="R" /> in <Tex math="aR" /> and <Tex math="Rb" />.
          In <Tex math="aR" /> we have fixed the start <Tex math="a" /> and collect its possible
          destinations. In <Tex math="Rb" /> we have fixed the destination <Tex math="b" /> and
          collect the possible starts. With <Tex math="XR" />, a destination only needs an arrow
          from one member of <Tex math="X" />. With <Tex math="RY" />, a start only needs an arrow
          to one member of <Tex math="Y" />.
        </p>

        <ul>
          <li>
            <strong>Carrier subscripts matter:</strong> Writing <Tex math="=" /> or{' '}
            <Tex math="\le" /> without naming the set leaves its domain unspecified. When needed, we
            index the relation by its carrier set: <Tex math="=_{\mathbb{N}} = \mathrm{Id}_{\mathbb{N}}" />,{' '}
            <Tex math="\le_{\mathbb{N}_0} \coloneqq \{(a, a+b) \mid a,b \in \mathbb{N}_0\}" />,{' '}
            <Tex math="\le_{\mathbb{Z}} \coloneqq \{(a, a+b) \mid a \in \mathbb{Z}, b \in \mathbb{N}_0\}" />,
            and{' '}
            <Tex math="\le_{\mathbb{Q}} \coloneqq \{(\frac{a}{b}, \frac{c}{d}) \mid a,c \in \mathbb{Z},\, b,d \in \mathbb{N},\, ad \le_{\mathbb{Z}} bc\}" />{' '}
            (notice that unlike <Tex math="\le_{\mathbb{Z}}" />, <Tex math="\le_{\mathbb{Q}}" /> is
            dense: <Tex math="\frac{a}{b} \le \frac{ad+bc}{2bd} \le \frac{c}{d}" />). Transposing
            reverses order: <Tex math="(\le_{\mathbb{R}})^\top = {\ge_{\mathbb{R}}}" />.
          </li>
          <li>
            <strong>Functions as special binary relations:</strong> <Tex math="R \subseteq A \times B" />{' '}
            is a <strong>partial function</strong> <Tex math="\mathord{:}\mathrm{iff}" /> every <Tex math="a \in A" /> has at most
            one successor (<Tex math="|aR| \le 1" />), and a <strong>(total) function</strong>{' '}
            <Tex math="\mathord{:}\mathrm{iff}" /> every <Tex math="a \in A" /> has a unique successor (<Tex math="|aR| = 1" />).
          </li>
        </ul>

        <h3 className="subsection-heading">Graphical Representation, Paths, and Cycles</h3>

        <p>
          For finite <Tex math="A" /> and <Tex math="B" />, a relation <Tex math="E \subseteq A \times B" /> can be drawn as a{' '}
          <strong>directed graph</strong> on vertex set <Tex math="V = A \cup B" />: each{' '}
          <Tex math="v \in V" /> is drawn as a node, each pair <Tex math="(s,t) \in E" /> as a
          directed edge (arrow) from source <Tex math="s" /> to target <Tex math="t" />, and any{' '}
          <Tex math="(s,s) \in E" /> as a <strong>(self-)loop</strong> at <Tex math="s" />. (Note
          that <Tex math="A" /> and <Tex math="B" /> cannot in general be recovered from{' '}
          <Tex math="A \cup B" /> alone unless remembered separately; when <Tex math="V" /> can be{' '}
          <Tex math="2" />-colored so edges only cross between colors, placing one color on the left
          and the other on the right gives a <strong>bipartite</strong> layout.) Geometric positions
          of nodes have no mathematical meaning—only incidence matters.
        </p>

        <div className="math-block">
          <div className="math-block-header">
            <span className="math-block-label">Definition · Path, Cycle, and Reachability</span>
          </div>
          <p>
            Given <Tex math="E \subseteq V \times V" />, a node sequence{' '}
            <Tex math="(v_0, \dots, v_l) \in V^{l+1}" /> (<Tex math="l \in \mathbb{N}_0" />) is:
          </p>
          <ol>
            <li>
              a <strong>path of length <Tex math="l" /></strong> <Tex math="\mathord{:}\mathrm{iff}" />{' '}
              <Tex math="(v_{i-1}, v_i) \in E" /> for all <Tex math="i \in [l]" /> (the length{' '}
              <Tex math="l" /> counts traversed edges, not vertices);
            </li>
            <li>
              a <strong>cycle</strong> <Tex math="\mathord{:}\mathrm{iff}" /> <Tex math="(v_0, \dots, v_l)" /> is a path with{' '}
              <Tex math="v_0 = v_l" /> <strong>and <Tex math="l > 0" /></strong>.
            </li>
          </ol>
          <p>
            We say <Tex math="s" /> <strong>can reach</strong> <Tex math="t" /> <Tex math="\mathord{:}\mathrm{iff}" /> there exists
            a path of finite length from <Tex math="s" /> to <Tex math="t" />.
          </p>
        </div>

        <p>
          In the Graph Example below, the edges are{' '}
          <Tex className="tex-wide" math="E = \{(1,4),(2,4),(2,3),(1,2),(4,4),(4,2),(3,1)\}" />.
          Follow <Tex math="(2,3,1,4)" />. There are four vertices on the list and three arrows
          to check, so its length is <Tex math="3" />. The sequence{' '}
          <Tex math="(1,4,2,3,1)" /> uses four arrows and returns to its start. The loop{' '}
          <Tex math="(4,4)" /> returns in just one step, so it too is a cycle.
        </p>
        <p>
          Now stop before taking the first step. The sequence <Tex math="(1)" /> has no consecutive
          pair to check, so it is a path of length <Tex math="0" />. Its endpoints agree, but a
          cycle requires at least one step. We will use both ways of getting back to a vertex when
          we compare the two closures.
        </p>

        <h3 className="subsection-heading">Matrix Representation Relative to an Enumeration</h3>

        <p>
          For finite sets <Tex math="A = \{a_1, \dots, a_m\}" /> and{' '}
          <Tex math="B = \{b_1, \dots, b_n\}" /> (<Tex math="m = |A|, n = |B|" />), fixing those
          explicit enumerations turns <Tex math="R \subseteq A \times B" /> into an{' '}
          <Tex math="m \times n" /> matrix over <Tex math="\{0,1\}" />:
        </p>

        <Tex
          math="M_R \;=\; (r_{i,j})_{i \in [m],\, j \in [n]}, \qquad r_{i,j} \;\coloneqq\; \begin{cases} 1 & \text{if } (a_i, b_j) \in R, \\ 0 & \text{otherwise.} \end{cases}"
          display
        />

        <p>
          In both matrices below, <Tex math="(2,c)" /> belongs to{' '}
          <Tex math="R = \{(1,a), (1,b), (2,c), (3,a)\}" />. Find its <Tex math="1" /> in row{' '}
          <Tex math="2" />. It moves from the third column to the first because the column label{' '}
          <Tex math="c" /> moved. A matrix records the same relation when we move the labels and
          their entries together.
        </p>

        <Tex
          math="\text{rows } (1,2,3),\text{ cols } (a,b,c):\; \begin{pmatrix} 1 & 1 & 0 \\ 0 & 0 & 1 \\ 1 & 0 & 0 \end{pmatrix}, \qquad \text{rows } (1,2,3),\text{ cols } (c,a,b):\; \begin{pmatrix} 0 & 1 & 1 \\ 1 & 0 & 0 \\ 0 & 1 & 0 \end{pmatrix}."
          display
        />

        <p>
          Unless stated otherwise, we always use the canonical order on <Tex math="[n]" /> or
          alphabetical order on letters. Under any fixed enumeration, transposing the relation is
          ordinary matrix transposition: <Tex math="M_{R^\top} = M_R^\top" />.
        </p>

        <RelationGraphMatrixLab />
      </section>

      {/* ======================================================================
          SECTION 4.3 — RELATIONAL PRODUCT AND BOOLEAN MATRIX MULTIPLICATION
          ====================================================================== */}
      <section id="sec-4-3" className="section-block">
        <h2 className="section-heading">
          <span className="section-num">4.3</span>
          <span>Relational Product and Boolean Matrix Multiplication</span>
        </h2>

        <p>
          We want to connect a starting point <Tex math="a" /> to an endpoint <Tex math="d" /> in
          two steps. Follow an <Tex math="R" /> arrow first. Where it lands has to be a point from
          which an <Tex math="S" /> arrow goes to <Tex math="d" />. With{' '}
          <Tex math="R \subseteq A \times B" /> and <Tex math="S \subseteq C \times D" />, the
          middle point <Tex math="x" /> therefore has to lie in <Tex math="B \cap C" />. Once we
          have found such an <Tex math="x" />, the product keeps the two endpoints.
        </p>

        <div className="math-block">
          <div className="math-block-header">
            <span className="math-block-label">Definition · Relational Product (Composition of Relations)</span>
          </div>
          <p>
            For binary relations <Tex math="R \subseteq A \times B" /> and{' '}
            <Tex math="S \subseteq C \times D" />, their <strong>relational product</strong>{' '}
            <Tex math="RS \subseteq A \times D" /> is defined by
          </p>
          <Tex
            math="RS \;\coloneqq\; \{(a,d) \in A \times D \mid \exists x \in B \cap C:\; (a,x) \in R \land (x,d) \in S\} \;=\; \pi_{1,4}(R \bowtie_{2=1} S)."
            display
          />
        </div>

        <p>
          The join here is the one we used for names and jobs. It gives us four entries{' '}
          <Tex math="(a,x,x,d)" />. The middle entries agree because the join matches column{' '}
          <Tex math="2" /> of <Tex math="R" /> with column <Tex math="1" /> of <Tex math="S" />.
          The projection keeps columns <Tex math="1" /> and <Tex math="4" />, which are precisely
          the start and the destination.
        </p>

        <ul>
          <li>
            <strong>Order of composition:</strong> Here <Tex math="RS" /> reads left-to-right ("first{' '}
            <Tex math="R" />, then <Tex math="S" />", also written <Tex math="R;S" /> or <Tex math="S \circ R" />). When functions are viewed as binary relations and function application is
            written on the left as <Tex math="(f \circ g)(x) = f(g(x))" />, <Tex math="g" /> acts
            first and <Tex math="f" /> acts second—so <strong><Tex math="f \circ g = gf" /></strong>.
          </li>
          <li>
            <strong><Tex math="RS" /> vs. <Tex math="R \times S" />:</strong>{' '}
            <Tex math="R \times S = \{((a,b),(c,d)) \mid (a,b) \in R, (c,d) \in S\}" /> is a set of
            pairs of pairs; <Tex math="RS \subseteq A \times D" /> requires an intermediate match{' '}
            <Tex math="b = c = x" /> and projects <Tex math="x" /> away.
          </li>
        </ul>

        <h3 className="subsection-heading">Computing <Tex math="M_{RS}" /> Explicitly</h3>

        <p>
          Assume the sets are finite and <Tex math="B = C" />. Pick a starting row <Tex math="i" /> and
          a destination column <Tex math="j" />. Keep those fixed. The index <Tex math="k" /> is
          the one we get to try. Use the same enumeration of <Tex math="B" /> for the columns of
          <Tex math="M_R" /> and the rows of <Tex math="M_S" />, so both uses of <Tex math="k" />
          name the same vertex <Tex math="x_k \in B" />.
        </p>
        <p>
          Look at the two entries <Tex math="r_{i,k}" /> and <Tex math="s_{k,j}" />. The first
          checks <Tex math="(a_i, x_k) \in R" /> and the second checks{' '}
          <Tex math="(x_k, d_j) \in S" />. Their product <Tex math="r_{i,k} \cdot s_{k,j}" /> is{' '}
          <Tex math="1" /> exactly when both steps work through that vertex.
        </p>

        <p>
          If exactly two middle vertices work, the ordinary product{' '}
          <Tex math="(M_R M_S)_{i,j} = \sum_k r_{i,k} \cdot s_{k,j}" /> records <Tex math="2" />.
          That answers a counting question. For membership in <Tex math="RS" />, the first witness
          already settles it. We want the entry to stay <Tex math="1" /> even when a second witness
          turns up. That is why the Boolean product uses <Tex math="\max_k" /> (Boolean OR{' '}
          <Tex math="\lor" />) in place of <Tex math="\sum_k" />.
        </p>

        <Tex
          math="M_{RS} \;=\; \Bigl(\max_{k} \bigl(r_{i,k} \cdot s_{k,j}\bigr)\Bigr)_{i,j} \;\eqqcolon\; M_R \cdot M_S."
          display
        />

        <p>
          To find a whole row at once, look at the ones in row <Tex math="i" /> of{' '}
          <Tex math="M_R" />. Those are all the places the first step can land. For each landing
          place, read its row in <Tex math="M_S" /> to get the possible second steps. Take the
          entrywise OR of those rows. Look at the first row below. It has ones at{' '}
          <Tex math="b" /> and <Tex math="d" />, so those are the two rows of <Tex math="M_S" /> we
          need.
        </p>

        <Tex
          math="M_R = \begin{pmatrix} 0 & 1 & 0 & 1 \\ 0 & 0 & 1 & 1 \\ 0 & 0 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}, \qquad M_S = \begin{pmatrix} 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 1 \\ 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \end{pmatrix}, \qquad M_{RS} = \begin{pmatrix} 0 & 1 & 1 & 1 \\ 1 & 1 & 0 & 0 \\ 0 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \end{pmatrix}."
          display
        />

        <ul>
          <li>
            <strong>Row <Tex math="a" /> of <Tex math="M_R" /> is <Tex math="(0, 1, 0, 1)" />:</strong>{' '}
            it selects row <Tex math="b" /> and row <Tex math="d" /> of <Tex math="M_S" />, giving{' '}
            <Tex math="(0,0,1,1) \lor (0,1,0,0) = (0,1,1,1)" />.
          </li>
          <li>
            <strong>Row <Tex math="b" /> of <Tex math="M_R" /> is <Tex math="(0, 0, 1, 1)" />:</strong>{' '}
            it selects row <Tex math="c" /> and row <Tex math="d" /> of <Tex math="M_S" />, giving{' '}
            <Tex math="(1,0,0,0) \lor (0,1,0,0) = (1,1,0,0)" />. Notice <Tex math="(b,b) \in RS" />{' '}
            via <Tex math="b \xrightarrow{R} d \xrightarrow{S} b" />, whereas for <Tex math="M_{SR}" /> row <Tex math="b" /> of <Tex math="M_S" /> is{' '}
            <Tex math="(0,0,1,1)" /> and column <Tex math="b" /> of <Tex math="M_R" /> is{' '}
            <Tex math="(1,0,0,0)^\top" /> (only <Tex math="a \to b" /> in <Tex math="R" />), so{' '}
            <Tex math="(M_{SR})_{b,b} = 0" /> and hence <Tex math="(b,b) \notin SR" />. This is a concrete
            instance of <Tex math="RS \neq SR" />.
          </li>
        </ul>

        <ManimPlayer
          src="/animations/relational_product.mp4"
          title="Animation 4.1 · Boolean Matrix Product of Two Relations"
          subtitle="Row-by-column inner product over {0,1} with max replacing sum"
          caption={
            <>
              Start with the highlighted entry <Tex math="(a,c)" />. Row <Tex math="a" /> of{' '}
              <Tex math="M_R" /> and column <Tex math="c" /> of <Tex math="M_S" /> meet at{' '}
              <Tex math="b" />, where both entries are <Tex math="1" />. Read those two ones
              back as arrows <Tex math="a \xrightarrow{R} b \xrightarrow{S} c" />. That one
              path is enough to write a <Tex math="1" /> in the result.
            </>
          }
        />

        <RelationalProductBridge />

        <div className="math-block theorem">
          <div className="math-block-header">
            <span className="math-block-label">Lemma · Algebraic Properties of the Relational Product</span>
          </div>
          <p>
            For all <Tex math="R, R_1, R_2 \subseteq A \times B" />,{' '}
            <Tex math="S, S_1, S_2 \subseteq B \times C" />, and{' '}
            <Tex math="T \subseteq C \times D" />:
          </p>
          <ol>
            <li>
              <strong>Associativity:</strong> <Tex math="RST \coloneqq R(ST) = (RS)T" />.
            </li>
            <li>
              <strong>Left and right neutral elements:</strong>{' '}
              <Tex math="\mathrm{Id}_A R = R = R \mathrm{Id}_B" />.
            </li>
            <li>
              <strong>Distributivity over <Tex math="\cup" />:</strong>{' '}
              <Tex math="(R_1 \cup R_2)S = (R_1 S) \cup (R_2 S)" /> and{' '}
              <Tex math="R(S_1 \cup S_2) = (R S_1) \cup (R S_2)" />.
            </li>
            <li>
              <strong>Zero (annihilator):</strong> <Tex math="\emptyset R = \emptyset = R \emptyset" />.
            </li>
            <li>
              <strong>Monotonicity:</strong> If <Tex math="R_1 \subseteq R_2" /> and{' '}
              <Tex math="S_1 \subseteq S_2" />, then <Tex math="R_1 S_1 \subseteq R_2 S_2" />.
            </li>
            <li>
              <strong>Converse reversal:</strong> <Tex math="(RS)^\top = S^\top R^\top" />.
            </li>
          </ol>
        </div>

        <p>
          To see where associativity comes from, follow three arrows{' '}
          <Tex math="a \xrightarrow{R} b \xrightarrow{S} c \xrightarrow{T} d" />.
          Grouping the first two arrows tests whether <Tex math="(a,c) \in RS" /> before taking
          the last step. Grouping the last two tests whether <Tex math="(b,d) \in ST" /> after the
          first step. Either way, membership asks for the same two middle vertices.
        </p>

        <div className="math-block trap">
          <div className="math-block-header">
            <span className="math-block-label">Counterexamples · Non-Commutativity and Failure Over Intersection</span>
          </div>
          <ul>
            <li>
              <strong>Not commutative (<Tex math="RS \neq SR" />):</strong> Take{' '}
              <Tex math="R = \{(0,1)\}" /> and <Tex math="S = \{(1,2)\}" />. Then{' '}
              <Tex math="RS = \{(0,2)\}" />, whereas <Tex math="SR = \emptyset" />.
            </li>
            <li>
              <strong>Does NOT distribute over <Tex math="\cap" />:</strong> Monotonicity gives{' '}
              <Tex math="R(S_1 \cap S_2) \subseteq (R S_1) \cap (R S_2)" />, but equality fails in
              general! Why? <Tex math="(a,c) \in R(S_1 \cap S_2)" /> requires <em>one</em> witness{' '}
              <Tex math="b" /> working for both <Tex math="S_1" /> and <Tex math="S_2" />, whereas{' '}
              <Tex math="(R S_1) \cap (R S_2)" /> allows two different witnesses{' '}
              <Tex math="b_1 \neq b_2" />. Concrete counterexample:{' '}
              <Tex math="R = \{(0,1), (0,2)\}" />, <Tex math="S_1 = \{(1,3)\}" />,{' '}
              <Tex math="S_2 = \{(2,3)\}" /> gives{' '}
              <Tex math="R(S_1 \cap S_2) = R\emptyset = \emptyset" />, while{' '}
              <Tex math="(R S_1) \cap (R S_2) = \{(0,3)\}" />.
            </li>
          </ul>
        </div>

        <div className="math-block sheet">
          <div className="math-block-header">
            <span className="math-block-label">Worked Application · Degree Conditions &amp; Consanguinity</span>
          </div>
          <p>
            Look at how <Tex math="RR^\top" /> and <Tex math="R^\top R" /> encode row and column
            cardinalities of <Tex math="R \subseteq A \times B" /> directly:
          </p>
          <ul>
            <li>
              <strong><Tex math="\mathrm{Id}_A \subseteq RR^\top \iff \forall a \in A:\; |aR| \ge 1" />:</strong>{' '}
              For any <Tex math="a \in A" />, <Tex math="(a,a) \in RR^\top" /> iff{' '}
              <Tex math="\exists b \in B: (a,b) \in R \land (b,a) \in R^\top" /> iff{' '}
              <Tex math="aR \neq \emptyset" />.
            </li>
            <li>
              <strong><Tex math="R^\top R \subseteq \mathrm{Id}_B \iff \forall a \in A:\; |aR| \le 1" />:</strong>{' '}
              <Tex math="(b_1, b_2) \in R^\top R" /> means some <Tex math="a \in A" /> satisfies{' '}
              <Tex math="b_1, b_2 \in aR" />. Forcing <Tex math="b_1 = b_2" /> for all such pairs
              says every <Tex math="a \in A" /> has at most one successor.
            </li>
            <li>
              Applying both to <Tex math="R" /> and <Tex math="R^\top" />:{' '}
              <Tex math="RR^\top = \mathrm{Id}_A" /> and <Tex math="R^\top R = \mathrm{Id}_B" /> hold
              iff <Tex math="|aR| = 1" /> for all <Tex math="a \in A" /> and <Tex math="|Rb| = 1" />{' '}
              for all <Tex math="b \in B" />—meaning <Tex math="M_R" /> has a single <Tex math="1" />{' '}
              in every row and every column (a <strong>permutation matrix</strong>).
            </li>
            <li>
              <strong>Consanguinity:</strong> If <Tex math="R \subseteq A \times A" /> is "is a
              child of" (so <Tex math="R^\top" /> is "is a parent of"), then grandchild is{' '}
              <Tex math="R^2" />, grandparent is <Tex math="(R^\top)^2 = (R^2)^\top" />, sibling is{' '}
              <Tex math="(RR^\top) \setminus \mathrm{Id}_A" /> (share a parent, exclude self), and
              first cousin is <Tex math="((R^2 R^\top) \setminus R)\, R^\top" /> (exclude own
              parents before stepping down to a child).
            </li>
          </ul>
        </div>
      </section>

      {/* ======================================================================
          SECTION 4.4 — BOUNDED ITERATION, MATRIX-VECTOR PRODUCTS, AND CLOSURES
          ====================================================================== */}
      <section id="sec-4-4" className="section-block">
        <h2 className="section-heading">
          <span className="section-num">4.4</span>
          <span>Bounded Iteration, Matrix–Vector Products, and Closures</span>
        </h2>

        <p>
          Suppose every step uses the same endorelation{' '}
          <Tex math="R \subseteq A \times A" /> on a nonempty set <Tex math="A" />. We can
          already join two steps. To get three, join those two to one more. For a uniform rule
          we need a starting case too. With zero steps available, each vertex can only stay
          where it is. That is the identity relation.
        </p>

        <div className="math-block">
          <div className="math-block-header">
            <span className="math-block-label">Definition · Powers, Bounded Iteration, and Closures</span>
          </div>
          <p>
            The <Tex math="k" />-fold relational product <Tex math="R^k" /> (<Tex math="k \in \mathbb{N}_0" />)
            is defined inductively by
          </p>
          <Tex
            math="R^0 \;\coloneqq\; \mathrm{Id}_A, \qquad\qquad R^k \;\coloneqq\; R^{k-1} R \;=\; R R^{k-1} \quad (k > 0)."
            display
          />
          <p>From <Tex math="R^k" /> we define bounded iteration and unbounded closures:</p>
          <Tex
            math="\begin{aligned}
              R^{\le k} &\coloneqq \bigcup_{i=0}^{k} R^i = (\mathrm{Id}_A \cup R)^k, &
              R^{< k} &\coloneqq \bigcup_{i=0}^{k-1} R^i, \\[4pt]
              R^+ &\coloneqq \bigcup_{k \in \mathbb{N}} R^k, &
              R^* &\coloneqq \mathrm{Id}_A \cup R^+ = \bigcup_{k \in \mathbb{N}_0} R^k.
            \end{aligned}"
            display
          />
          <p style={{ fontSize: 16, color: 'var(--ink-secondary)' }}>
            Mind the overloaded superscript: <Tex math="A^k" /> is <Tex math="k" />-tuples over a
            set <Tex math="A" />, <Tex math="\Sigma^k" /> and <Tex math="\Sigma^*" /> are words over
            an alphabet <Tex math="\Sigma" />, whereas for a relation <Tex math="R \subseteq A \times A" />,{' '}
            <Tex math="R^k" /> and <Tex math="R^*" /> are subsets of <Tex math="A \times A" />. Note
            also why <Tex math="R^{\le k} = (\mathrm{Id}_A \cup R)^k" /> holds: unioning{' '}
            <Tex math="\mathrm{Id}_A" /> lets a walk "mark time" (stay at the current node) during
            any of the <Tex math="k" /> steps.
          </p>
        </div>

        <div className="math-block theorem">
          <div className="math-block-header">
            <span className="math-block-label">Lemma · Paths and Powers</span>
          </div>
          <p>
            For every <Tex math="R \subseteq A \times A" />, all <Tex math="a,b \in A" />, and all{' '}
            <Tex math="k \in \mathbb{N}_0" />: <Tex math="(a,b) \in R^k" /> iff there is a path of
            length <Tex math="k" /> from <Tex math="a" /> to <Tex math="b" /> w.r.t.{' '}
            <Tex math="R" />.
          </p>
        </div>

        <div className="proof-box">
          <div className="proof-header">Proof by Induction over the Length</div>
          <ul>
            <li>
              <strong>I.B. (<Tex math="k = 0" />):</strong> <Tex math="R^0 = \mathrm{Id}_A = \{(a,a) \mid a \in A\}" />,
              and <Tex math="(a)" /> is a path of length <Tex math="0" /> from <Tex math="a" /> to{' '}
              <Tex math="b" /> iff <Tex math="a = b" />.
            </li>
            <li>
              <strong>I.S.:</strong> Fix <Tex math="k \in \mathbb{N}_0" /> arbitrarily. Assume{' '}
              <strong>I.A.</strong>: <Tex className="tex-wide" math="R^k = \{(a_0, a_k) \mid \text{there is a path } (a_0,\dots,a_k) \text{ of length } k\}" />.
              To show <strong>I.C.</strong> for <Tex math="k + 1" />, fix <Tex math="a_0, a_{k+1} \in A" />.
              Then <Tex math="(a_0, a_{k+1}) \in R^{k+1} = R^k R" /> iff{' '}
              <Tex math="\exists a_k \in A: (a_0, a_k) \in R^k \land (a_k, a_{k+1}) \in R" />, which
              by the <strong>I.A.</strong> holds iff there is a path <Tex math="(a_0, \dots, a_k)" />{' '}
              of length <Tex math="k" /> with <Tex math="(a_k, a_{k+1}) \in R" />, i.e. a path{' '}
              <Tex math="(a_0, \dots, a_k, a_{k+1})" /> of length <Tex math="k + 1" />.{' '}
              <span className="qed">□</span>
            </li>
          </ul>
        </div>

        <p>
          In the Paths Example <Tex math="R = \{(1,3),(2,1),(2,4),(3,1),(3,2)\}" />, follow
          <Tex math="3" /> to <Tex math="2" /> and then to <Tex math="4" />. We can write down the
          whole path <Tex math="(3,2,4)" />. The pair <Tex math="(3,4)" /> in <Tex math="R^2" />
          says there is a path of exactly two steps between these endpoints. The middle vertex
          has done its job and drops out of the pair.
        </p>
        <p>
          The paths of length <Tex math="2" /> are the <Tex math="3" />-tuples{' '}
          <Tex className="tex-wide" math="\{(1,3,1), (1,3,2), (2,1,3), (3,1,3), (3,2,1), (3,2,4)\}" />.
          Keep <Tex math="(v_0, v_2)" /> from each to get{' '}
          <Tex className="tex-wide" math="R^2 = \{(1,1),(1,2),(2,3),(3,3),(3,1),(3,4)\}" />.
        </p>

        <h3 className="subsection-heading">Reachability as Matrix–Vector Products</h3>

        <p>
          What if we start at several vertices at once? For finite <Tex math="A" /> and{' '}
          <Tex math="B" />, mark the members of <Tex math="X \subseteq A" /> with a{' '}
          <Tex math="1" /> and all other positions with a <Tex math="0" />. The resulting row
          vector <Tex math="v_X" /> selects the rows of <Tex math="M_R" /> to combine by OR.
          If we fix the possible destinations <Tex math="Y \subseteq B" /> instead, mark those
          in the column vector <Tex math="v_Y^\top" />. Now each row of <Tex math="M_R" />
          answers whether its start has an arrow to any of those destinations.
        </p>

        <Tex math="v_X M_R \;=\; v_{XR} \qquad\text{and}\qquad M_R v_Y^\top \;=\; v_{RY}^\top." display />

        <p>
          Use the Paths Example again. Starting from <Tex math="X = \{1,3\}" /> selects rows{' '}
          <Tex math="1" /> and <Tex math="3" />. The first row gives <Tex math="\{3\}" /> and the
          third gives <Tex math="\{1,2\}" />. For <Tex math="Y = \{2,4\}" />, look at columns{' '}
          <Tex math="2" /> and <Tex math="4" />. Their ones come from starts{' '}
          <Tex math="3" /> and <Tex math="2" />, respectively.
        </p>

        <Tex
          math="(1, 0, 1, 0) \begin{pmatrix} 0 & 0 & 1 & 0 \\ 1 & 0 & 0 & 1 \\ 1 & 1 & 0 & 0 \\ 0 & 0 & 0 & 0 \end{pmatrix} = (1, 1, 1, 0) = v_{\{1,2,3\}}, \qquad \begin{pmatrix} 0 & 0 & 1 & 0 \\ 1 & 0 & 0 & 1 \\ 1 & 1 & 0 & 0 \\ 0 & 0 & 0 & 0 \end{pmatrix} \begin{pmatrix} 0 \\ 1 \\ 0 \\ 1 \end{pmatrix} = \begin{pmatrix} 0 \\ 1 \\ 1 \\ 0 \end{pmatrix} = v_{\{2,3\}}^\top."
          display
        />

        <p>
          In particular, when <Tex math="A = B" />, <Tex math="v_{\{s\}} M_R^k" /> gives all nodes
          reachable from <Tex math="s" /> in <Tex math="k" /> steps (simply row <Tex math="s" /> of{' '}
          <Tex math="M_R^k" />), and <Tex math="v_{\{s\}} M_R^k v_{\{t\}}^\top = (1)" /> tests
          whether <Tex math="t" /> is reachable from <Tex math="s" /> in <Tex math="k" /> steps
          (replacing <Tex math="\max" /> by <Tex math="\sum" /> counts <Tex math="k" />-step{' '}
          <Tex math="s" />-<Tex math="t" />-paths; replacing <Tex math="0/1" /> entries by transition
          probabilities gives the <Tex math="k" />-step state distribution of a Markov chain).
        </p>

        <ManimPlayer
          src="/animations/closure_wave.mp4"
          title="Animation 4.2 · Building R^+ and R^* on Four Vertices"
          subtitle="Shortcut accumulation across R^1, R^2, R^3, and Id_A"
          caption={
            <>
              Watch vertex <Tex math="4" />. More arrows begin to reach it as we allow longer
              paths, and still no arrow leaves it. That leaves <Tex math="(4,4)" /> out of{' '}
              <Tex math="R^+ = R \cup R^2 \cup R^3" /> in this example. The last frame adds the
              loop from <Tex math="\mathrm{Id}_A" />. It records staying at <Tex math="4" /> for{' '}
              <Tex math="0" /> steps.
            </>
          }
        />

        <TokenWalkAndClosureExplorer />

        <h3 className="subsection-heading">Finite Stabilization (<Tex math="R^{<n} = R^*" />) via No Least Counterexample</h3>

        <p>
          A path can go round a cycle as many times as it likes. When all we need are its endpoints,
          what does that detour give us? Once a vertex appears twice, we can keep its first
          occurrence and take the arrow that followed its second occurrence. That arrow already
          leaves the very same vertex. If the second occurrence was the endpoint, we can stop
          at the first. Either way, we get a shorter path with the same endpoints.
        </p>
        <p>
          If <Tex math="A" /> has <Tex math="n = |A|" /> vertices, a path with more than{' '}
          <Tex math="n" /> positions must give us that repeated vertex. This is how the infinite
          union <Tex math="R^* = \bigcup_{k \in \mathbb{N}_0} R^k" /> becomes finite. In the proof,
          we stop at the first length that could add a new pair, then use the shorter path to
          show the pair was already there.
        </p>

        <div className="math-block theorem">
          <div className="math-block-header">
            <span className="math-block-label">Lemma · Reachability in the Finite Case</span>
          </div>
          <p>
            If <Tex math="A \neq \emptyset" /> is finite with <Tex math="n = |A|" />, then{' '}
            <Tex math="R^{<n} = R^{<k}" /> for all <Tex math="k \ge n" />. Consequently:
          </p>
          <Tex
            math="R^* \;=\; R^{<n} \;=\; (\mathrm{Id}_A \cup R)^{n-1} \qquad\text{and}\qquad R^+ \;=\; R^{<n} R \;=\; \bigcup_{k=1}^{n} R^k."
            display
          />
        </div>

        <div className="proof-box">
          <div className="proof-header">Proof (No Least Counterexample)</div>
          <p>
            Suppose there is a least <Tex math="k_0 \ge n" /> with <Tex math="R^{<n} \neq R^{<k_0}" />.
            Necessarily <Tex math="k_0 > n" />, so <Tex math="n \le k_0 - 1" />, and by minimality of{' '}
            <Tex math="k_0" /> we still have <Tex math="R^{<n} = R^{< k_0 - 1}" />. Hence{' '}
            <Tex math="R^{<n} \subsetneq R^{<k_0} = R^{< k_0 - 1} \cup R^{k_0 - 1} = R^{<n} \cup R^{k_0 - 1}" />.
          </p>
          <p>
            Pick any <Tex math="(a_0, a_{k_0 - 1}) \in R^{k_0 - 1} \setminus R^{<n}" />. There is a
            path <Tex math="(a_0, a_1, \dots, a_{k_0 - 1})" /> of <Tex math="k_0 - 1" /> steps, which
            contains <Tex math="k_0 > n = |A|" /> vertices. By the pigeonhole principle, there exist
            indices <Tex math="0 \le i < j < k_0" /> with <Tex math="a_i = a_j" />. Splice the
            prefix through <Tex math="a_i" /> to the suffix starting at <Tex math="a_j" />,
            keeping their common vertex once. If <Tex math="j=k_0-1" />, the shortened path
            ends at <Tex math="a_i=a_{k_0-1}" />. The result has length{' '}
            <Tex math="< k_0 - 1" /> (since <Tex math="i < j" /> removes at least one step). Thus{' '}
            <Tex math="(a_0, a_{k_0 - 1}) \in R^{< k_0 - 1} = R^{<n}" />, a contradiction.{' '}
            <span className="qed">□</span>
          </p>
        </div>

        <p>
          Pay close attention to two consequences that show up repeatedly in exercises:
        </p>

        <ul>
          <li>
            <strong><Tex math="n - 1" /> vs. <Tex math="n" />:</strong> <Tex math="R^*" /> needs
            powers only up to <Tex math="R^{n-1}" /> because <Tex math="\mathrm{Id}_A" /> is included
            at <Tex math="k = 0" />, whereas <Tex math="R^+ = R^{<n} R" /> can genuinely require{' '}
            <Tex math="R^n" />: on the <Tex math="4" />-cycle{' '}
            <Tex math="R = \{(1,2),(2,3),(3,4),(4,1)\}" /> in Figure 4.3, the loops{' '}
            <Tex math="(a,a)" /> only enter <Tex math="R^+" /> at <Tex math="R^4 = \mathrm{Id}_{[4]}" />!
            To compute <Tex math="R^*" /> quickly for larger <Tex math="n" />, use repeated squaring:{' '}
            <Tex math="((\mathrm{Id}_A \cup R)^2)^2 = \mathrm{Id}_A \cup R \cup R^2 \cup R^3 \cup R^4 = R^*" />{' '}
            on <Tex math="|A| \le 5" />.
          </li>
          <li>
            <strong>Finiteness is essential:</strong> On the infinite set{' '}
            <Tex math="\mathbb{N}_0" />, <Tex math="R \coloneqq \{(m, m+1) \mid m \in \mathbb{N}_0\}" />{' '}
            satisfies <Tex math="R^{\le n} \subsetneq R^*" /> for <em>every</em>{' '}
            <Tex math="n \in \mathbb{N}_0" />, since <Tex math="(0, n+1) \in R^* \setminus R^{\le n}" />.
          </li>
        </ul>

        <div className="math-block theorem">
          <div className="math-block-header">
            <span className="math-block-label">Lemma · Closure Minimality and Kleene Identities</span>
          </div>
          <p>For all <Tex math="R, S, X \subseteq A \times A" />:</p>
          <ol>
            <li>
              If <Tex math="\mathrm{Id}_A \subseteq X" />, <Tex math="XX \subseteq X" />, and{' '}
              <Tex math="R \subseteq X" />, then <Tex math="R^* \subseteq X" />. Thus{' '}
              <Tex math="R^* = \bigcap \{X \subseteq A \times A \mid \mathrm{Id}_A \subseteq X,\, XX \subseteq X,\, R \subseteq X\}" />{' '}
              (least reflexive and transitive relation containing <Tex math="R" />).
            </li>
            <li>
              If <Tex math="XX \subseteq X" /> and <Tex math="R \subseteq X" />, then{' '}
              <Tex math="R^+ = R R^* \subseteq X" />. Thus{' '}
              <Tex math="R^+ = \bigcap \{X \subseteq A \times A \mid XX \subseteq X,\, R \subseteq X\}" />.
            </li>
            <li>
              <Tex math="(R^\top)^* = (R^*)^\top" /> and <Tex math="(R^+)^\top = (R^\top)^+" />;{' '}
              <Tex math="(\mathrm{Id}_A \cup R)^+ = (\mathrm{Id}_A \cup R)^* = R^*" />.
            </li>
            <li>
              <Tex math="R^* = R^* R^* = (R^*)^* = (R^+)^* = (R^*)^+" />, and{' '}
              <Tex math="R^+ = R R^* = R^* R = R^* R^+ = R^+ R^* = (R^+)^+" />.
            </li>
            <li>
              If <Tex math="R \subseteq S" />, then <Tex math="R^* \subseteq S^*" /> and{' '}
              <Tex math="R^+ \subseteq S^+" />. More generally: if{' '}
              <Tex math="RX \subseteq XS" /> then <Tex math="R^* X \subseteq X S^*" /> (with equality
              when <Tex math="RX = XS" />); if <Tex math="S \cup RX \subseteq X" /> then{' '}
              <Tex math="R^* S \subseteq X" />; and{' '}
              <Tex math="(R \cup S)^* = R^*(S R^*)^* = (R^* S)^* R^*" />.
            </li>
          </ol>
        </div>

        <p>
          The first clause of this lemma is the one we need for impossibility proofs. Here is
          why it works. The identity in <Tex math="X" /> covers paths of length zero, and{' '}
          <Tex math="R \subseteq X" /> covers each single step. If a path so far gives a pair
          in <Tex math="X" />, appending another step composes two pairs in <Tex math="X" />.
          Transitivity keeps the result in <Tex math="X" />. By induction, this holds at every
          length, so all of <Tex math="R^*" /> lies inside <Tex math="X" />.
        </p>
        <p>
          Look at what changes when both factors insist on positive length. A pair in{' '}
          <Tex math="R^+ R^+" /> needs a path that we can split into two nonempty pieces.
          If the graph has just <Tex math="a\to b" />, that arrow belongs to{' '}
          <Tex math="R^+" /> and there is nowhere to split it. This is why{' '}
          <Tex math="R^+ R^+ \subseteq R^+" /> can be strict.
        </p>

        <QuickCheck
          title={<>Prove <Tex math="R^* R^* \subseteq R^*" /> without unpacking unions</>}
          prompt={
            <>
              Using the rule "if <Tex math="S \cup RX \subseteq X" />, then{' '}
              <Tex math="R^* S \subseteq X" />", which choice of <Tex math="S" /> and{' '}
              <Tex math="X" /> proves <Tex math="R^* R^* \subseteq R^*" /> in one line?
            </>
          }
          answer={
            <>
              Set <Tex math="S \coloneqq R^*" /> and <Tex math="X \coloneqq R^*" />. Then we only have to check{' '}
              <Tex math="R^* \cup R R^* \subseteq R^*" />. Since{' '}
              <Tex math="R R^* = R^+ \subseteq \mathrm{Id}_A \cup R^+ = R^*" />, the left-hand side
              is <Tex math="R^* \cup R^+ = R^*" />, so the rule immediately yields{' '}
              <Tex math="R^* R^* \subseteq R^*" />! (And the reverse inclusion{' '}
              <Tex math="R^* = \mathrm{Id}_A R^* \subseteq R^* R^*" /> is immediate from{' '}
              <Tex math="\mathrm{Id}_A \subseteq R^*" />.)
            </>
          }
        />

        <h3 className="subsection-heading">Two Ways to Group Reachable Vertices</h3>
        <p>
          Consider <Tex math="1\to2\leftrightarrow3" />. Vertex <Tex math="1" /> can reach
          both other vertices, but they cannot get back to it. To group vertices that can
          reach each other, ask for both paths. A pair belongs to <Tex math="R^*" /> if the
          forward path exists and to <Tex math="(R^\top)^*" /> if the return path exists.
          Their intersection <Tex math="R^*\cap(R^\top)^*" /> gives the strongly connected
          components <Tex math="\{1\}" /> and <Tex math="\{2,3\}" />.
        </p>
        <p>
          For connectivity with directions ignored, make both directions available first.
          Now <Tex math="2\to1" /> is legal, so all three vertices belong to one component.
          That is why the formula is <Tex math="(R\cup R^\top)^*" />. The union changes the
          available edges before any paths are composed.
        </p>
      </section>

      {/* ======================================================================
          SECTION 4.5 — PROPERTIES OF ENDORELATIONS, ORDERS, AND EQUIVALENCES
          ====================================================================== */}
      <PracticeCheckpoint chapterId="ch04" sectionId="sec-4-4" showSolutions />

      <section id="sec-4-5" className="section-block">
        <h2 className="section-heading">
          <span className="section-num">4.5</span>
          <span>Properties of Endorelations, Orders, and Equivalences</span>
        </h2>

        <p>
          To see whether an endorelation <Tex math="R \subseteq A \times A" /> is reflexive,
          look at the diagonal of <Tex math="M_R" />. A zero there gives you a specific vertex
          missing its loop. To test transitivity, look for a different kind of missing arrow.
          The product <Tex math="RR" /> tells you which arrows two steps would require, so
          compare their positions with <Tex math="R" />. The table gives the same tests in
          three forms.
        </p>

        <div className="clean-table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Element-wise quantifier</th>
                <th>Relational algebra</th>
                <th>Matrix M_R characterization</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Reflexive</strong></td>
                <td><Tex math="\forall a \in A:\; (a,a) \in R" /></td>
                <td><Tex math="\mathrm{Id}_A \subseteq R" /></td>
                <td>Main diagonal all <Tex math="1" />s (<Tex math="\forall i:\; r_{i,i} = 1" />).</td>
              </tr>
              <tr>
                <td><strong>Irreflexive</strong></td>
                <td><Tex math="\forall a \in A:\; (a,a) \notin R" /></td>
                <td><Tex math="\mathrm{Id}_A \cap R = \emptyset" /></td>
                <td>Main diagonal all <Tex math="0" />s (<Tex math="\forall i:\; r_{i,i} = 0" />).</td>
              </tr>
              <tr>
                <td><strong>Symmetric</strong></td>
                <td><Tex math="\forall (s,t) \in R:\; (t,s) \in R" /></td>
                <td><Tex math="R^\top = R" /> (iff <Tex math="R^\top \subseteq R" />)</td>
                <td><Tex math="M_R = M_R^\top" /> (<Tex math="\forall i,j:\; r_{i,j} = r_{j,i}" />).</td>
              </tr>
              <tr>
                <td><strong>Antisymmetric</strong></td>
                <td><Tex math="\forall (s,t) \in R:\; (t,s) \in R \Rightarrow s = t" /></td>
                <td><Tex math="R \cap R^\top \subseteq \mathrm{Id}_A" /></td>
                <td>For <Tex math="i \neq j" />, never <Tex math="r_{i,j} = r_{j,i} = 1" />.</td>
              </tr>
              <tr>
                <td><strong>Asymmetric</strong></td>
                <td><Tex math="\forall (s,t) \in R:\; (t,s) \notin R" /></td>
                <td><Tex math="R \cap R^\top = \emptyset" /></td>
                <td>Irreflexive and antisymmetric (<Tex math="\forall i,j:\; r_{i,j} \cdot r_{j,i} = 0" />).</td>
              </tr>
              <tr>
                <td><strong>Transitive</strong></td>
                <td><Tex math="\forall (s,t),(t,u) \in R:\; (s,u) \in R" /></td>
                <td><Tex math="RR \subseteq R" /></td>
                <td>Wherever <Tex math="M_R \cdot M_R" /> has <Tex math="1" />, <Tex math="M_R" /> has <Tex math="1" />.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <EndorelationPropertyInspector />

        <p>
          Try the <strong>3-Cycle + Loop</strong> preset. Follow <Tex math="1\to2\to3" /> and
          find the entry in row <Tex math="1" />, column <Tex math="3" />. It is zero in{' '}
          <Tex math="M_R" /> even though the two arrows give a one there in its Boolean square.
          Now we have the whole counterexample. We can name both arrows that exist and the
          one that transitivity would have required.
        </p>

        <div className="math-block trap">
          <div className="math-block-header">
            <span className="math-block-label">Boundary Cases &amp; Non-Opposites to Keep Sharp</span>
          </div>
          <ul>
            <li>
              <strong>Neither reflexive nor irreflexive:</strong> If some diagonal entries of{' '}
              <Tex math="M_R" /> are <Tex math="1" /> and others are <Tex math="0" /> (as in{' '}
              <strong>3-Cycle + Loop</strong> above), <Tex math="R" /> is neither.
            </li>
            <li>
              <strong>Symmetric and antisymmetric at the same time:</strong> If{' '}
              <Tex math="R^\top = R" /> and <Tex math="R \cap R^\top \subseteq \mathrm{Id}_A" />,
              then <Tex math="R = R \cap R^\top \subseteq \mathrm{Id}_A" />. Every subset of{' '}
              <Tex math="\mathrm{Id}_A" /> is <em>both</em> symmetric and antisymmetric!
            </li>
            <li>
              <strong>Transitivity on <Tex math="2" />-cycles:</strong> In{' '}
              <strong>Sym. + Loop</strong>, <Tex math="(1,2) \in R" /> and <Tex math="(2,1) \in R" />{' '}
              compose to <Tex math="(1,1) \in RR" />—so transitivity fails unless the loops{' '}
              <Tex math="(1,1)" /> and <Tex math="(2,2)" /> are also in <Tex math="R" />.
            </li>
            <li>
              <strong>Empty relation <Tex math="\emptyset" /> on <Tex math="A \neq \emptyset" />:</strong>{' '}
              Pick a vertex. It has no loop, so it witnesses the failure of reflexivity. Every
              vertex has that same absence of a loop, which gives irreflexivity. The other four
              tests need at least one arrow to produce a counterexample. With no arrows,
              symmetry, antisymmetry, asymmetry, and transitivity all hold.
            </li>
          </ul>
        </div>

        <h3 className="subsection-heading">Standard Endorelations on Numbers, Sets, and Words</h3>

        <div className="clean-table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Relation</th>
                <th>Properties</th>
                <th>Key check / distinction</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Tex math="=_{\mathbb{Z}}" /> on <Tex math="\mathbb{Z}" /></td>
                <td>Refl., sym., antisym., trans.</td>
                <td>Equals <Tex math="\mathrm{Id}_{\mathbb{Z}}" /> (both equivalence and partial order).</td>
              </tr>
              <tr>
                <td><Tex math="\le_{\mathbb{Z}}" /> on <Tex math="\mathbb{Z}" />; <Tex math="\subseteq" /> on <Tex math="\mathcal{P}(\mathbb{Z})" /></td>
                <td>Refl., antisym., trans.</td>
                <td>Archetypal partial orders (<Tex math="\le_{\mathbb{Z}}" /> is total; <Tex math="\subseteq" /> is not).</td>
              </tr>
              <tr>
                <td><Tex math="<_{\mathbb{Z}}" /> on <Tex math="\mathbb{Z}" /></td>
                <td>Asymmetric (irrefl. + antisym.), trans.</td>
                <td>Archetypal strict order.</td>
              </tr>
              <tr>
                <td><Tex math="\neq_{\mathbb{Z}}" /> on <Tex math="\mathbb{Z}" /></td>
                <td>Irreflexive, symmetric</td>
                <td>Not transitive: <Tex math="1 \neq 2" /> and <Tex math="2 \neq 1" />, but <Tex math="1 = 1" />.</td>
              </tr>
              <tr>
                <td><Tex math="a \mid_{\mathbb{Z}} b \;:\text{iff}\; \frac{b}{a} \in \mathbb{Z}" /></td>
                <td>Only transitive</td>
                <td><Tex math="\frac{0}{0}" /> undefined <Tex math="\Rightarrow (0,0) \notin {\mid_{\mathbb{Z}}}" />; <Tex math="2 \mid -2 \mid 2" /> breaks antisymmetry.</td>
              </tr>
              <tr>
                <td><Tex math="a \mid_{\mathbb{Z}} b \;:\text{iff}\; \exists k \in \mathbb{Z}: b = ka" /></td>
                <td>Reflexive, transitive</td>
                <td>Now <Tex math="0 = 0 \cdot 0 \Rightarrow 0 \mid 0" />; still not antisymmetric on <Tex math="\mathbb{Z}" /> (<Tex math="\pm 2" />).</td>
              </tr>
              <tr>
                <td><Tex math="\mid_{\mathbb{N}}" /> on <Tex math="\mathbb{N} = \{1,2,\dots\}" /></td>
                <td>Refl., antisym., trans. (partial order)</td>
                <td>Both definitions coincide on <Tex math="\mathbb{N}" />, and positive signs restore antisymmetry.</td>
              </tr>
              <tr>
                <td><Tex math="a \equiv_m b \;:\text{iff}\; m \mid (a - b)" /> on <Tex math="\mathbb{Z}" /> (<Tex math="m \in \mathbb{N}" />)</td>
                <td>Refl., sym., trans. (equivalence)</td>
                <td>Same remainder mod <Tex math="m" />; partitions <Tex math="\mathbb{Z}" /> into <Tex math="\{a + m\mathbb{Z} \mid a \in \mathbb{Z}_m\}" />.</td>
              </tr>
              <tr>
                <td>Prefix <Tex math="\preceq_p" />, suffix <Tex math="\preceq_s" />, infix <Tex math="\preceq_i" /> on <Tex math="\Sigma^*" /></td>
                <td>Refl., antisym., trans. (partial orders)</td>
                <td><Tex math="uw = v" />, <Tex math="wu = v" />, <Tex math="wuw' = v" />; mutual inclusion forces <Tex math="|u| = |v|" />, so <Tex math="u = v" />.</td>
              </tr>
              <tr>
                <td>Conjugacy <Tex math="u \cong_c v \;:\text{iff}\; \exists w,w': u=ww' \land v=w'w" /></td>
                <td>Refl., sym., trans. (equivalence)</td>
                <td>Cyclic shift of words (transitivity: split the shared middle word where the two cuts cross).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="subsection-heading">Orders vs. Equivalences, Set Operations, and Component Closures</h3>

        <p>
          Start with a relation that has every loop and contains every shortcut required by
          transitivity. Now look at two distinct vertices. In an equivalence relation, any
          arrow between them must come with its reverse, so the two vertices can be grouped.
          In a partial order, an arrow between them rules out its reverse, so the pair has a
          definite direction. Those are the two ways we will use the property table in Chapter 5.
        </p>

        <ul>
          <li>
            <strong>(Partial) order:</strong> reflexive, transitive, and antisymmetric ("<Tex math="a" />{' '}
            comes before <Tex math="b" />").
          </li>
          <li>
            <strong>Equivalence relation:</strong> reflexive, transitive, and symmetric.
            For instance, congruence modulo <Tex math="3" /> groups <Tex math="1" /> and{' '}
            <Tex math="4" /> because both have remainder <Tex math="1" />.
          </li>
          <li>
            <strong>Intersection vs. union:</strong> Intersecting two relations{' '}
            <Tex math="R \cap S" /> preserves all six properties—so the intersection of two
            equivalence relations (or two partial orders) is again one, and intersecting an
            equivalence relation with a partial order yields a partial order! Union{' '}
            <Tex math="R \cup S" /> preserves reflexivity and symmetry, but in general destroys both
            transitivity and antisymmetry.
          </li>
          <li>
            <strong>Component equivalence relations:</strong> For any{' '}
            <Tex math="R \subseteq A \times A" />,
            <ul>
              <li>
                <Tex math="(R \cup R^\top)^*" /> is the <em>least</em> equivalence relation
                containing <Tex math="R" />; its equivalence classes are the undirected{' '}
                <strong>connected components (CCs)</strong>.
              </li>
              <li>
                <Tex math="R^* \cap (R^*)^\top = R^* \cap (R^\top)^*" /> is an equivalence relation
                contained in <Tex math="R^*" />; two nodes lie in the same class iff each can reach
                the other, giving the <strong>strongly connected components (SCCs)</strong>.
              </li>
            </ul>
          </li>
        </ul>

        <h3 className="subsection-heading">Checking a Strict Weak Ordering</h3>
        <p>
          Suppose <Tex math="R" /> is a strict order, so it is asymmetric and transitive.
          Declare two vertices incomparable when neither direction holds. The incomparability
          relation is{' '}
          <Tex math="(A\times A)\setminus(R\cup R^\top)" />. It already has every loop and
          is symmetric. For a <strong>strict weak ordering</strong>, incomparability must be
          an equivalence relation, so the remaining test is transitivity. If the first and second
          vertices are incomparable, and so are the second and third, must the first and
          third also be incomparable? On <Tex math="\{1,2,3\}" />, with just the edge
          <Tex math="1\to3" />, the answer is no. The middle vertex <Tex math="2" /> is
          incomparable with both ends, but the ends are comparable. This is a strict partial
          order that fails the extra test.
        </p>
      </section>

      {/* ======================================================================
          SECTION 4.6 — REACHABILITY INVARIANTS (MU SYSTEM) AND EXERCISES
          ====================================================================== */}
      <PracticeCheckpoint chapterId="ch04" sectionId="sec-4-5" showSolutions />

      <section id="sec-4-6" className="section-block">
        <h2 className="section-heading">
          <span className="section-num">4.6</span>
          <span>Reachability Invariants (MU System) and Exercises</span>
        </h2>

        <p>
          Suppose the vertices are words in <Tex math="\Sigma^*" />. If a search through{' '}
          <Tex math="N" /> steps misses a target <Tex math="t" />, a longer derivation might
          still reach it. We need a reason that covers every length at once. The closure
          lemma gives us a way to do that. Find a reflexive and transitive relation{' '}
          <Tex math="X" /> that contains each rewrite <Tex math="R" />. Then{' '}
          <Tex math="R^* \subseteq X" />. To rule out a derivation from <Tex math="s" /> to{' '}
          <Tex math="t" />, it is enough to show <Tex math="(s,t) \notin X" />.
        </p>

        <div className="math-block example">
          <div className="math-block-header">
            <span className="math-block-label">Worked Example · Hofstadter&apos;s MU Puzzle (Semi-Thue System)</span>
          </div>
          <p>
            Let <Tex math="\Sigma = \{I, M, U\}" />, <Tex math="A = \Sigma^*" />, and define the
            string-rewriting relation <Tex math="R \subseteq \Sigma^* \times \Sigma^*" /> by
          </p>
          <Tex
            math="R \;\coloneqq\; \bigl\{\underbrace{(xI,\, xIU)}_{(1)},\;\; \underbrace{(Mx,\, Mxx)}_{(2)},\;\; \underbrace{(xIIIy,\, xUy)}_{(3)},\;\; \underbrace{(xUUy,\, xy)}_{(4)} \;\big|\; x, y \in \Sigma^*\bigr\}."
            display
          />
          <p>
            A formal derivation is a path in <Tex math="R" />; for instance,{' '}
            <Tex math="MI \xrightarrow{(2)} MII \xrightarrow{(2)} MIIII \xrightarrow{(1)} MIIIIU \xrightarrow{(3)} MIUU \xrightarrow{(4)} MI" />{' '}
            witnesses <Tex math="(MI, MI) \in R^+" />. Can we ever derive <Tex math="MU" /> from{' '}
            <Tex math="MI" />, i.e. does <Tex math="(MI, MU) \in R^*" /> hold?
          </p>
        </div>

        <div className="proof-box">
          <div className="proof-header">Proof That MI Cannot Be Rewritten to MU</div>
          <p>
            Start with something we can measure after each move. For <Tex math="w \in \Sigma^*" />,
            let <Tex math="|w|_I" /> count its occurrences of <Tex math="I" />. Already the move
            from <Tex math="MI" /> to <Tex math="MII" /> shows that the count itself can change.
            Look at the two rules that change it. One doubles the count and the other takes away
            three. Those two operations give us a question worth testing on every move. Is the
            count divisible by three? Let{' '}
            <Tex math="X" /> relate words whose answers agree.
          </p>
          <Tex
            math="X \;\coloneqq\; \bigl\{(u, v) \in \Sigma^* \times \Sigma^* \;\big|\; 3 \mid |u|_I \iff 3 \mid |v|_I\bigr\}."
            display
          />
          <ol>
            <li>
              <strong><Tex math="\mathrm{Id}_{\Sigma^*} \subseteq X" /> and <Tex math="XX \subseteq X" />:</strong>{' '}
              Logical equivalence <Tex math="\iff" /> is reflexive and transitive, so{' '}
              <Tex math="X" /> is an equivalence relation (hence reflexive and transitive).
            </li>
            <li>
              <strong><Tex math="R \subseteq X" />:</strong> Let <Tex math="(u,v) \in R" /> with{' '}
              <Tex math="n \coloneqq |u|_I" />. Under rules (1) and (4), <Tex math="|v|_I = n" />; under
              rule (2), <Tex math="|v|_I = 2n" />, and <Tex math="3 \mid 2n \iff 3 \mid n" /> since{' '}
              <Tex math="\gcd(2,3) = 1" />; under rule (3), <Tex math="|v|_I = n - 3" />, and{' '}
              <Tex math="3 \mid (n - 3) \iff 3 \mid n" />. Thus <Tex math="(u,v) \in X" /> in all
              four cases.
            </li>
            <li>
              By closure minimality, <Tex math="R^* \subseteq X" />. Since{' '}
              <Tex math="|MI|_I = 1 \notin 3\mathbb{Z}" /> while{' '}
              <Tex math="|MU|_I = 0 \in 3\mathbb{Z}" />, we have <Tex math="(MI, MU) \notin X" />,
              and therefore <Tex math="(MI, MU) \notin R^*" />. <span className="qed">□</span>
            </li>
          </ol>
        </div>

        {/* CHAPTER EXERCISES */}
        <h3 className="subsection-heading" style={{ marginTop: 44 }}>
          Chapter Exercises
        </h3>

        <GradedExercise
          badge="Exercise 4.1 · Finite Stabilization Bounds"
          question={
            <p>
              Let <Tex math="A = [5]" /> and <Tex math="R = \{(1,2),(2,3),(3,4),(4,5),(5,1)\}" />.
              What are the minimal integers <Tex math="k, m" /> such that{' '}
              <Tex math="\bigcup_{i=0}^k R^i = R^*" /> and <Tex math="\bigcup_{i=1}^m R^i = R^+" />?
            </p>
          }
          options={[
            {
              label: <Tex math="k = 4 \text{ and } m = 4" />,
              isCorrect: false,
              feedback: (
                <>Check whether <Tex math="(1,1) \in R^1 \cup R^2 \cup R^3 \cup R^4" />: a closed walk of positive length around a <Tex math="5" />-cycle has length at least <Tex math="5" />.</>
              ),
            },
            {
              label: <Tex math="k = 4 \text{ and } m = 5" />,
              isCorrect: true,
              feedback: (
                <>Correct: <Tex math="R^0 = \mathrm{Id}_{[5]}" /> supplies the diagonal of <Tex math="R^*" />, so <Tex math="k = n - 1 = 4" /> suffices; <Tex math="R^+" /> excludes <Tex math="i = 0" /> and needs <Tex math="R^5 = \mathrm{Id}_{[5]}" />.</>
              ),
            },
            {
              label: <Tex math="k = 5 \text{ and } m = 5" />,
              isCorrect: false,
              feedback: (
                <>For <Tex math="R^*" />, the finite stabilization lemma gives <Tex math="R^* = R^{<5} = R^{\le 4}" />, so <Tex math="k = 4" /> already covers all <Tex math="25" /> pairs.</>
              ),
            },
          ]}
          hint={
            <>
              Compare when <Tex math="\mathrm{Id}_{[5]}" /> enters{' '}
              <Tex math="\bigcup_{i=0}^k R^i" /> versus <Tex math="\bigcup_{i=1}^m R^i" />.
            </>
          }
          fullSolution={
            <p>
              Every off-diagonal pair <Tex math="(a,b)" /> (<Tex math="a \neq b" />) is connected by
              a directed path along the <Tex math="5" />-cycle of length <Tex math="1, 2, 3," /> or{' '}
              <Tex math="4" /> (with <Tex math="(1,5)" /> requiring <Tex math="4" /> steps). In{' '}
              <Tex math="R^*" />, <Tex math="R^0 = \mathrm{Id}_{[5]}" /> already contributes the
              diagonal, so <Tex math="k = 4" /> is minimal. In <Tex math="R^+" />, returning to the
              starting vertex requires traversing all <Tex math="5" /> edges, so{' '}
              <Tex math="\mathrm{Id}_{[5]} = R^5" /> first appears at <Tex math="m = 5" />.
            </p>
          }
        />

        <GradedExercise
          badge="Exercise 4.2 · Symmetric Closure Trap"
          question={
            <p>
              On <Tex math="A = [5]" />, let{' '}
              <Tex className="tex-wide" math="S = \{(1,3),(3,1),(2,2),(2,4),(4,2),(4,4),(4,5),(5,4)\}" />. Which
              classification of <Tex math="S" /> and <Tex math="S^+" /> is exact?
            </p>
          }
          options={[
            {
              label: (
                <>
                  <Tex math="S" /> is symmetric, neither reflexive nor transitive; <Tex math="S^+" />{' '}
                  is already an equivalence relation (<Tex math="S^+ = S^*" />).
                </>
              ),
              isCorrect: true,
              feedback: (
                <>Correct: every node of <Tex math="[5]" /> has at least one neighbour in the symmetric relation <Tex math="S" />, so <Tex math="u \to v \to u" /> puts every <Tex math="(u,u)" /> into <Tex math="S^2 \subseteq S^+" />.</>
              ),
            },
            {
              label: (
                <>
                  <Tex math="S^+" /> is symmetric and transitive, but not reflexive because{' '}
                  <Tex math="(1,1), (3,3), (5,5) \notin S" />.
                </>
              ),
              isCorrect: false,
              feedback: (
                <>Check <Tex math="S^2" />: <Tex math="(1,3), (3,1) \in S" /> give <Tex math="(1,1), (3,3) \in S^2 \subseteq S^+" />, and <Tex math="(5,4), (4,5) \in S" /> give <Tex math="(5,5) \in S^2" />.</>
              ),
            },
            {
              label: (
                <>
                  Every symmetric relation <Tex math="T" /> on <Tex math="[5]" /> satisfies{' '}
                  <Tex math="T^+ = T^*" />.
                </>
              ),
              isCorrect: false,
              feedback: (
                <>False whenever <Tex math="T" /> has an isolated vertex: <Tex math="T = \emptyset" /> gives <Tex math="T^+ = \emptyset \neq \mathrm{Id}_{[5]} = T^*" />. Here <Tex math="S" /> has no isolated vertex.</>
              ),
            },
          ]}
          hint={
            <>
              Check whether any vertex of <Tex math="[5]" /> has empty successor set{' '}
              <Tex math="uS" />, and compute <Tex math="\mathrm{Id}_{[5]} \cap S^2" />.
            </>
          }
          fullSolution={
            <>
              <p>
                Every listed arrow has its reverse, so <Tex math="S" /> is symmetric. The missing
                loop at <Tex math="1" /> refutes reflexivity. The path <Tex math="2\to4\to5" /> and
                the missing shortcut <Tex math="2\to5" /> refute transitivity.
              </p>
              <p>
                In <Tex math="S^+" />, we can go out and back. Every vertex has an arrow it
                can follow, and reversing that arrow adds its loop in two steps. Reversing a
                whole path gives symmetry, and joining two positive-length paths gives
                transitivity. So <Tex math="S^+=S^*" /> is an equivalence relation. Vertices{' '}
                <Tex math="1" /> and <Tex math="3" /> can reach one another and have no arrow
                out of their group. The other three can all reach one another through{' '}
                <Tex math="4" />. The classes are{' '}
                <Tex math="\{1,3\}" /> and <Tex math="\{2,4,5\}" />.
              </p>
            </>
          }
        />

        <GradedExercise
          badge="Exercise 4.3 · Bounded Stabilization on the Natural Numbers"
          question={
            <p>
              Fix <Tex math="n \in \mathbb{N}" />. Which relation <Tex math="S_n" /> on the infinite
              set <Tex math="\mathbb{N}_0" /> satisfies{' '}
              <Tex math="S_n^{\le n-1} \subsetneq S_n^{\le n} = S_n^*" />?
            </p>
          }
          options={[
            {
              label: <Tex math="S_n \coloneqq \{(i, i+1) \mid i \in \mathbb{N}_0\}" />,
              isCorrect: false,
              feedback: (
                <>The infinite successor chain never stabilizes at <Tex math="n" />: <Tex math="(0, n+1) \in S_n^{n+1} \setminus S_n^{\le n}" />.</>
              ),
            },
            {
              label: <Tex math="S_n \coloneqq \{(i, i+1) \mid i \in \mathbb{Z}_n\} = \{(0,1),(1,2),\dots,(n-1,n)\}" />,
              isCorrect: true,
              feedback: (
                <>Exact: <Tex math="(0,n)" /> needs all <Tex math="n" /> edges, so <Tex math="S_n^{\le n-1} \subsetneq S_n^{\le n}" />, while <Tex math="S_n^{n+1} = \emptyset" /> gives <Tex math="S_n^{\le n} = S_n^*" />.</>
              ),
            },
            {
              label: <Tex math="S_n \coloneqq \{(i, (i+1) \bmod n) \mid i \in \mathbb{Z}_n\}" />,
              isCorrect: false,
              feedback: (
                <>On a cycle of length <Tex math="n" />, every pair of distinct cycle vertices is reachable in at most <Tex math="n - 1" /> steps and <Tex math="\mathrm{Id}" /> is already contained in <Tex math="S_n^0" />, so <Tex math="S_n^{\le n-1} = S_n^*" />.</>
              ),
            },
          ]}
          hint={
            <>
              Watch out for option 3: remember <Tex math="S_n^0 = \mathrm{Id}_{\mathbb{N}_0}" /> is
              already inside <Tex math="S_n^{\le n-1}" />, so an <Tex math="n" />-cycle stabilizes{' '}
              <Tex math="S_n^*" /> at <Tex math="n - 1" />, not <Tex math="n" />! It takes{' '}
              <Tex math="n + 1" /> distinct vertices along an acyclic path.
            </>
          }
          fullSolution={
            <p>
              Define <Tex math="S_n \coloneqq \{(i, i+1) \mid i \in \mathbb{Z}_n\}" /> on{' '}
              <Tex math="\mathbb{N}_0" />. For <Tex math="0 \le i \le j \le n" />, there is a unique
              path from <Tex math="i" /> to <Tex math="j" /> of length <Tex math="j - i" />, while
              every <Tex math="m > n" /> is isolated (reaching only itself in <Tex math="0" />{' '}
              steps). In particular, <Tex math="(0,n) \in S_n^n \setminus S_n^{\le n-1}" />, and{' '}
              <Tex math="S_n^k = \emptyset" /> for all <Tex math="k > n" />, so{' '}
              <Tex math="S_n^{\le n-1} \subsetneq S_n^{\le n} = S_n^*" />.
            </p>
          }
        />

        <RecognitionCue>
          In Exercise 4.2, just a few arrows gave us the classes <Tex math="\{1,3\}" /> and{' '}
          <Tex math="\{2,4,5\}" />. Chapter 5 starts with the same question on the integers.
          If we group by remainder modulo three, which class contains <Tex math="1" />?
          Then we will use a different relation, divisibility, to read an order from its arrows.
        </RecognitionCue>
      </section>
    </article>
  );
};
