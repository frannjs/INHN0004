::: practice 1.1 · Which compound propositions agree?
Use the rows $FF,FT,TF,TT$ for $A,B$. Group the expressions that have the same truth column and identify any standard connectives they represent.

| Part | Expression | Part | Expression |
| --- | --- | --- | --- |
| a | $A\leftrightarrow\neg B$ | g | $\neg B\to\neg A$ |
| b | $\neg A\leftrightarrow\neg B$ | h | $\neg(A\land B)$ |
| c | $B\lor\neg A$ | i | $\neg(A\lor B)$ |
| d | $(A\to B)\land(B\to A)$ | j | $(\neg A)\land(\neg B)$ |
| e | $(A\lor B)\land\neg(A\land B)$ | k | $(\neg A)\lor(\neg B)$ |
| f | $\neg(A\leftrightarrow B)$ | | |
::: answer
For each row, evaluate the inner operations first. For example in (e), the disjunction admits the both-true case and the negated conjunction removes it. Exactly one true input remains.

| Parts | FF | FT | TF | TT | Meaning |
| --- | --- | --- | --- | --- | --- |
| a, e, f | F | T | T | F | $A\oplus B$ |
| b, d | T | F | F | T | $A\leftrightarrow B$ |
| c, g | T | T | F | T | $A\to B$ |
| h, k | T | T | T | F | Negated conjunction |
| i, j | T | F | F | F | Negated disjunction |

None has the column $F,F,F,T$ for conjunction or the column $F,T,T,T$ for inclusive disjunction. These five rows of the result table are five different truth columns. De Morgan's laws explain the matches $(h,k)$ and $(i,j)$.
:::

::: practice 1.2 · Prove seven inferences
For each row, prove that the target follows when every premise is true.

| Pattern | Premises | Target |
| --- | --- | --- |
| Modus ponens | $A\to B$ and $A$ | $B$ |
| Modus tollens | $A\to B$ and $\neg B$ | $\neg A$ |
| Disjunctive syllogism | $A\lor B$ and $\neg B$ | $A$ |
| Chaining | $A\to B$ and $B\to C$ | $A\to C$ |
| Cases | $A\lor B$, $A\to C$, $B\to C$ | $C$ |
| Contraposition | $\neg B\to\neg A$ | $A\to B$ |
| Contradiction | $\neg A\to B$ and $\neg A\to\neg B$ | $A$ |
::: answer
Take the chaining row. The conclusion $A\to C$ can fail only with $A$ true and $C$ false. Fix those two values and see what the premises ask of the remaining value $B$. We could check all eight rows, but this is the only case that matters for a counterexample. The table uses the same test for the other inferences. Can the conclusion fail while all the premises hold?

| Premises | Target | Why a violation is impossible |
| --- | --- | --- |
| $A\to B$ and $A$ | $B$ | With $A$ true, the conditional requires $B$ true |
| $A\to B$ and $\neg B$ | $\neg A$ | With $B$ false, the conditional requires $A$ false |
| $A\lor B$ and $\neg B$ | $A$ | The right disjunct fails, so the left must hold |
| $A\to B$ and $B\to C$ | $A\to C$ | A failure needs $A$ true and $C$ false, forcing $B$ both true and false |
| $A\lor B$, $A\to C$, $B\to C$ | $C$ | If $C$ is false, both conditionals force their antecedents false, contradicting the disjunction |
| $\neg B\to\neg A$ | $A\to B$ | The target fails only when $A$ holds and $B$ fails. This is also the failure case for the premise |
| $\neg A\to B$ and $\neg A\to\neg B$ | $A$ | If $A$ is false, both premise conclusions must hold, though $B$ and $\neg B$ cannot both hold |

The point of the shorter proof is to read what each true premise demands in the possible failure case. These are proofs of the argument patterns themselves, independently of the meaning of the individual propositions.
:::

::: practice 1.3 · Read syntax trees and fill the truth table
Evaluate the following formulas on all eight assignments to $A,B,C$. For each, identify the true regions in the three-set Venn diagram and draw its syntax tree.

$$
\begin{aligned}
F_1&=(A\land(B\to C))\lor(C\land\neg A),\\
F_2&=(A\land\neg B)\lor((C\lor B)\land(C\lor\neg B)),\\
F_3&=(\neg A\leftrightarrow B)\land(B\land(A\lor C)),\\
F_4&=((A\leftrightarrow B)\land(B\leftrightarrow C))\to(A\leftrightarrow C),\\
F_5&=(A\leftrightarrow C)\to((A\leftrightarrow B)\land(B\leftrightarrow C)).
\end{aligned}
$$
::: answer
Use one row per possible membership region, with T for inside and F for outside. Try $F_1$ in the $T,F,F$ row. $B\to C$ is true because $B$ is false, so the branch $A\land(B\to C)$ is true. That gives a true root even though the other branch fails. Shade the part of $A$ outside both $B$ and $C$. Each T in the table gives a region in just this way.

| A | B | C | $F_1$ | $F_2$ | $F_3$ | $F_4$ | $F_5$ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F | F | F | F | F | F | T | T |
| F | F | T | T | T | F | T | T |
| F | T | F | F | F | F | T | F |
| F | T | T | T | T | T | T | T |
| T | F | F | T | T | F | T | T |
| T | F | T | T | T | F | T | F |
| T | T | F | F | F | F | T | T |
| T | T | T | T | T | F | T | T |

To draw the trees, split a formula at its outermost connective. The two branches in the table give its ordered children. Keep splitting at the outer connective of each branch until you reach individual variable occurrences. Give each occurrence its own leaf.

| Formula | Root | Left branch | Right branch |
| --- | --- | --- | --- |
| $F_1$ | $\lor$ | $\land$ joins $A$ and $\to(B,C)$ | $\land$ joins $C$ and $\neg A$ |
| $F_2$ | $\lor$ | $\land$ joins $A$ and $\neg B$ | $\land$ joins $\lor(C,B)$ and $\lor(C,\neg B)$ |
| $F_3$ | $\land$ | $\leftrightarrow$ joins $\neg A$ and $B$ | $\land$ joins $B$ and $\lor(A,C)$ |
| $F_4$ | $\to$ | $\land$ joins $\leftrightarrow(A,B)$ and $\leftrightarrow(B,C)$ | $\leftrightarrow$ joins $A$ and $C$ |
| $F_5$ | $\to$ | $\leftrightarrow$ joins $A$ and $C$ | $\land$ joins $\leftrightarrow(A,B)$ and $\leftrightarrow(B,C)$ |

Here $\lor(C,B)$ denotes a tree node $\lor$ with leaves $C,B$, and similarly for other binary connectives. A negation has one child. In $F_4$ the left subtree checks two equalities of truth values, forcing the equality in the right subtree. Reversing the conditional in $F_5$ leaves the middle value $B$ unconstrained by the premise, which explains its two failure rows.
:::

::: practice 1.4 · Find the witness or use an arbitrary object
For each row decide whether the conclusion follows and explain how the premises constrain the corresponding regions. Each predicate has a nonempty set of witnesses.

| Premise 1 | Premise 2 | Claimed conclusion |
| --- | --- | --- |
| All humans are mortal | Someone who is Aristotle is human | Someone who is Aristotle is mortal |
| All professors are serious | Some lecturers are outside the serious group | Some lecturers are outside the professor group |
| No reptiles have fur | All snakes are reptiles | No snakes have fur |
| All horses have hooves | No humans have hooves | Some humans are outside the horse group |
| No rectangles are circles | All squares are rectangles | No squares are circles |
| No mammals are fish | Some apes are mammals | Some apes are outside the fish group |
::: answer
For humans and mortality, the Aristotle premise supplies a witness $d$ that is both Aristotle and human. The universal premise puts $d$ inside the mortal region. The same $d$ witnesses the conclusion. For professors and lecturers, take a lecturer $d$ known to be outside the serious region. Professors all lie inside that region, so $d$ cannot be a professor.

For reptiles and snakes, fix an arbitrary snake. It belongs to the reptiles and therefore lies outside the fur region. This gives the universal conclusion. The square argument has the same form: an arbitrary square is a rectangle, and all rectangles are outside the circle region.

For horses and humans, all horses are inside the hoof region, and all humans are outside it. Nonemptiness of the human region supplies a witness that is human and outside the horse region. If the human region were empty, the two universal premises could hold with no witness for the conclusion.

For mammals and apes, use a witness that is both an ape and a mammal. Since no mammal lies inside the fish region, that witness is an ape outside the fish region.
:::

::: practice 1.5 · How much does the witness know?
Over $\mathbb N_0$, compare $\forall x\,\exists y\,P(x,y)$ with $\exists y\,\forall x\,P(x,y)$ for $P(x,y)$ given by $x\ge y$. Find a replacement predicate for which only the first is true.
::: answer
Both hold for $x\ge y$. Choosing $y=0$ works for every $x\in\mathbb N_0$, so it even meets the stronger requirement of one fixed witness. Replace $P(x,y)$ with $x<y$. Each $x$ has the witness $x+1$ in the first statement. Any candidate $y$ for the second fails at $x=y$. We may use dependence on $x$ only when the choice of $y$ is inside the scope of $\forall x$.
:::
