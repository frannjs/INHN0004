::: practice Build the truth table and the KV map
Compute a truth table for $F=((w\leftrightarrow(y\leftrightarrow z))\leftrightarrow(w\lor(w\land y)))$. Compute a KV map for $G=((w\leftrightarrow(y\leftrightarrow z))\oplus((y\land w)\lor w))$.
::: answer
The inner conjunction $w\land y$ is absorbed by the disjunct $w$. Now look at the two columns for $w$ and $w\leftrightarrow(y\leftrightarrow z)$. When $y=z$, the inner biconditional gives $1$, so these columns agree. When $y\ne z$, it gives $0$, so the second column has the opposite value. The outer biconditional of $F$ checks exactly that agreement.

| $w$ | $y$ | $z$ | $y\leftrightarrow z$ | $w\leftrightarrow(y\leftrightarrow z)$ | $w\land y$ | $w\lor(w\land y)$ | $F$ |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |
| 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 |
| 0 | 1 | 1 | 1 | 0 | 0 | 0 | 1 |
| 1 | 0 | 0 | 1 | 1 | 0 | 1 | 1 |
| 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 |
| 1 | 1 | 0 | 0 | 0 | 1 | 1 | 0 |
| 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

In $G$ the right child is again equivalent to $w$, but now the root is exclusive-or. So $G$ has exactly the opposite values and depends only on whether $y,z$ differ. Put $(w,z)$ in Gray order and $y$ on the rows:

| $y$ and $(w,z)$ | 00 | 10 | 11 | 01 |
|---|---|---|---|---|
| 0 | 0 | 0 | 1 | 1 |
| 1 | 1 | 1 | 0 | 0 |

In each pair of columns differing in $w$ alone, the values agree. That is a useful check on a KV map for a formula that simplifies away one of its variables.
:::

::: practice DNF and an equisatisfiable CNF from the same formula
For $H=(\neg t\to\neg q)\land\neg(x\to u)$, find an equivalent DNF by rewriting. Then annotate every inner syntax node of the original formula with a fresh variable and construct the Tseytin CNF.
::: answer
First eliminate the conditionals. The underlined occurrence in each row is where the next identity applies.
$$
\begin{aligned}
(\underline{\neg t\to\neg q})\land\neg(x\to u)
&\equiv(\neg\neg t\lor\neg q)\land\neg(\underline{x\to u})\\
&\equiv(\underline{\neg\neg t}\lor\neg q)\land\neg(\neg x\lor u)\\
&\equiv(t\lor\neg q)\land\underline{\neg(\neg x\lor u)}\\
&\equiv(t\lor\neg q)\land(\underline{\neg\neg x}\land\neg u)\\
&\equiv\underline{(t\lor\neg q)\land(x\land\neg u)}\\
&\equiv(t\land(x\land\neg u))\lor(\neg q\land(x\land\neg u)).
\end{aligned}
$$
The second equivalence reaches the standard basis, the fifth reaches NNF, and the distributive step reaches DNF.

For the encoding, go back to the formula as given. We need the addresses in that tree. Consider the right-hand negation at $1$. Its child is the conditional at $10$, which takes leaves $x,u$. Read each row of the table the same way, from a node to its immediate children.

| Address | Node label and child inputs | Clauses for its constraint |
|---|---|---|
| $\varepsilon$ | $T_\varepsilon\leftrightarrow(T_0\land T_1)$ | $\{T_\varepsilon,\neg T_0,\neg T_1\}$, $\{\neg T_\varepsilon,T_0\}$, $\{\neg T_\varepsilon,T_1\}$ |
| $0$ | $T_0\leftrightarrow(T_{00}\to T_{01})$ | $\{\neg T_0,\neg T_{00},T_{01}\}$, $\{T_0,T_{00}\}$, $\{T_0,\neg T_{01}\}$ |
| $00$ | $T_{00}\leftrightarrow\neg t$ | $\{T_{00},t\}$, $\{\neg T_{00},\neg t\}$ |
| $01$ | $T_{01}\leftrightarrow\neg q$ | $\{T_{01},q\}$, $\{\neg T_{01},\neg q\}$ |
| $1$ | $T_1\leftrightarrow\neg T_{10}$ | $\{T_1,T_{10}\}$, $\{\neg T_1,\neg T_{10}\}$ |
| $10$ | $T_{10}\leftrightarrow(x\to u)$ | $\{\neg T_{10},\neg x,u\}$, $\{T_{10},x\}$, $\{T_{10},\neg u\}$ |

Include the root unit $\{T_\varepsilon\}$. Each row forces its node to reflect the values of its children, so the root unit asks for the original formula to be true. For a concrete check, $t=x=1$ and $q=u=0$ give node values $T_{00}=0$, $T_{01}=1$, $T_0=1$, $T_{10}=0$, $T_1=T_\varepsilon=1$. This is one extension to a satisfying assignment.
:::

::: practice Two semantic rewrites
Classify the formulas on both sides as NNF, CNF or DNF. Apply one identity at a time and mark which occurrence changes.
$$
(A\lor(B\lor C))\land(C\lor\neg A)\equiv(B\land\neg A)\lor C
$$
$$
(A\lor\neg(B\land A))\land(C\lor(D\lor C))\equiv C\lor D
$$
::: answer
In the first pair the left is in NNF and CNF, and the right is in NNF and DNF. The useful feature is that both clauses on the left contain $C$. Rearrange them to put $C$ last in each clause. Then reverse distribution to pull out the common disjunct. Each row underlines the occurrence to rewrite next.

| Formula and next occurrence | Apply |
|---|---|
| $(\underline{A\lor(B\lor C)})\land(C\lor\neg A)$ | Associativity |
| $((A\lor B)\lor C)\land(\underline{C\lor\neg A})$ | Commutativity |
| $\underline{((A\lor B)\lor C)\land(\neg A\lor C)}$ | Distributivity in reverse |
| $(\underline{(A\lor B)\land\neg A})\lor C$ | Distributivity |
| $((\underline{A\land\neg A})\lor(B\land\neg A))\lor C$ | Complementarity |
| $(\underline{\bot\lor(B\land\neg A)})\lor C$ | Neutral element for $\lor$ |
| $(B\land\neg A)\lor C$ | |

The second left side is in none of these forms because negation stands above a conjunction. Its right side $C\lor D$ is in all three. It is one clause with two literals and also a disjunction of two one-literal terms.

| Formula and next occurrence | Apply |
|---|---|
| $(A\lor\underline{\neg(B\land A)})\land(C\lor(D\lor C))$ | De Morgan |
| $(A\lor(\underline{\neg B\lor\neg A}))\land(C\lor(D\lor C))$ | Commutativity |
| $(\underline{A\lor(\neg A\lor\neg B)})\land(C\lor(D\lor C))$ | Associativity |
| $((\underline{A\lor\neg A})\lor\neg B)\land(C\lor(D\lor C))$ | Complementarity |
| $(\underline{\top\lor\neg B})\land(C\lor(D\lor C))$ | Domination |
| $\underline{\top\land(C\lor(D\lor C))}$ | Neutral element for $\land$ |
| $C\lor(\underline{D\lor C})$ | Commutativity |
| $\underline{C\lor(C\lor D)}$ | Associativity |
| $(\underline{C\lor C})\lor D$ | Idempotence |
| $C\lor D$ | |
:::

::: practice 13.1(c) & 13.5 · Minimal CNF from KV maps and equisatisfiability witnesses
1. Read a minimal CNF (at most $3$ clauses) from the $4\times 4$ KV map with rows $(s,x)\in\{00,10,11,01\}$ and columns $(r,t)\in\{00,10,11,01\}$:

| $(s,x)$ and $(r,t)$ | 00 | 10 | 11 | 01 |
|---|---|---|---|---|
| 00 | 1 | 0 | 0 | 0 |
| 10 | 1 | 1 | 1 | 1 |
| 11 | 1 | 1 | 1 | 1 |
| 01 | 0 | 1 | 1 | 1 |

2. For $F=\neg((\neg A\to B)\land((A\land\neg C)\to B))$, find its canonical DNF/CNF, its KV-minimal DNF/CNF, its Tseytin CNF $G$, and an assignment satisfying $F$ that falsifies $G$.
::: answer
**1. Reading $0$-blocks into minimal CNF.** Remember to invert fixed signs ($0\mapsto$ positive literal, $1\mapsto$ negated literal):
- Cell $(s,x;r,t)=(01;00)$ has four torus neighbors $(11;00),(00;00),(01;10),(01;01)$, all equal to $1$. Its maximal $0$-block has size $1$ at $(r,s,t,x)=(0,0,0,1)$, producing $\{r,s,t,\neg x\}$.
- In row $(s,x)=00$, cover the three $0$-cells at $(r,t)=10,11,01$ with two maximal $2$-cell blocks: $\{(00;10),(00;11)\}$ fixes $(r,s,x)=(1,0,0)\mapsto\{\neg r,s,x\}$, and $\{(00;11),(00;01)\}$ fixes $(s,t,x)=(0,1,0)\mapsto\{s,\neg t,x\}$.
Result: $(r\lor s\lor t\lor\neg x)\land(\neg r\lor s\lor x)\land(s\lor\neg t\lor x)$.

**2. Full comparison on $F=\neg((\neg A\to B)\land((A\land\neg C)\to B))$.** $F=1$ iff $B=0$ and ($\neg A=1$ or $(A=1\land C=0)$), so the $1$-rows of $(A,B,C)$ are $(0,0,0),(0,0,1),(1,0,0)$:
- **Canonical DNF:** $(\neg A\land\neg B\land\neg C)\lor(\neg A\land\neg B\land C)\lor(A\land\neg B\land\neg C)$.
- **Canonical CNF** (from the five $0$-rows): $(A\lor\neg B\lor C)\land(A\lor\neg B\lor\neg C)\land(\neg A\lor B\lor\neg C)\land(\neg A\lor\neg B\lor C)\land(\neg A\lor\neg B\lor\neg C)$.
- **KV-minimal DNF** (two $2$-cell $1$-blocks): $(\neg A\land\neg B)\lor(\neg B\land\neg C)$.
- **KV-minimal CNF** (the $4$-cell $0$-block $B=1$ plus the $2$-cell $0$-block $A=C=1$): $\neg B\land(\neg A\lor\neg C)$.
- **Tseytin CNF $G$:** With internal labels $T_\varepsilon\leftrightarrow\neg T_0$, $T_0\leftrightarrow(T_{00}\land T_{01})$, $T_{00}\leftrightarrow(T_{000}\to B)$, $T_{000}\leftrightarrow\neg A$, $T_{01}\leftrightarrow(T_{010}\to B)$, $T_{010}\leftrightarrow(A\land T_{0101})$, $T_{0101}\leftrightarrow\neg C$, and unit $\{T_\varepsilon\}$. To witness $F\not\equiv G$, start from the model $(A,B,C)=(0,0,0)$ of $F$ and set $T_\varepsilon=0$: $\llbracket F\rrbracket=1$ (since $F$ ignores $T_\varepsilon$) while $\llbracket G\rrbracket=0$.
:::

::: practice 13.4 · Full five-variable DPLL search graph with backtracking
Apply DPLL (OLR before PLR before case split; lexicographically smallest variable $p<q<s<w<x$; positive literal tried first) to
$$
\mathcal K=\{\{p,\neg w,x\},\{p,\neg w,\neg x\},\{\neg p,q,s,\neg w\},\{\neg p,\neg q,\neg x\},\{\neg p,\neg s,\neg x\},\{\neg p,x\},\{q,s,\neg w,\neg x\},\{w,x\},\{w,\neg x\}\}.
$$
List every node's clause set and every edge label, and decide satisfiability.
::: answer
Initially there are no unit clauses and every variable $p,q,s,w,x$ occurs with both signs ($q,s$ appear negatively in $\{\neg p,\neg q,\neg x\},\{\neg p,\neg s,\neg x\}$), so DPLL branches on $p$:

- **Node (0):** $\mathcal K$.
- **Edge (0) $\to$ (1), Case $[\top/p]$:** $\{\{q,s,\neg w\},\{\neg q,\neg x\},\{\neg s,\neg x\},\{x\},\{q,s,\neg w,\neg x\},\{w,x\},\{w,\neg x\}\}$.
  - **(1) $\to$ (2), OLR $[\top/x]$:** $\{\{\neg q\},\{\neg s\},\{q,s,\neg w\},\{w\}\}$.
  - **(2) $\to$ (3), OLR $[\bot/q]$** ($q<s<w$ among units $\{\neg q\},\{\neg s\},\{w\}$): $\{\{\neg s\},\{s,\neg w\},\{w\}\}$.
  - **(3) $\to$ (4), OLR $[\bot/s]$:** $\{\{\neg w\},\{w\}\}$.
  - **(4) $\to$ (5), OLR $[\top/w]$** (positive literal of $w$ chosen first): $\{\varnothing\}$ — conflict, backtrack to (0)!
- **Edge (0) $\to$ (6), Case $[\bot/p]$:** $\{\{\neg w,x\},\{\neg w,\neg x\},\{q,s,\neg w,\neg x\},\{w,x\},\{w,\neg x\}\}$.
  - **(6) $\to$ (7), PLR $[\top/q]$** (no units; $q$ and $s$ are both pure positive, $q<s$): $\{\{\neg w,x\},\{\neg w,\neg x\},\{w,x\},\{w,\neg x\}\}$ ($s$ vanished with the clause!).
  - **(7) $\to$ (8), Case $[\top/w]$** ($w,x$ occur in both signs, $w<x$): $\{\{x\},\{\neg x\}\}$.
    - **(8) $\to$ (9), OLR $[\top/x]$:** $\{\varnothing\}$ — conflict, backtrack to (7)!
  - **(7) $\to$ (10), Case $[\bot/w]$:** $\{\{x\},\{\neg x\}\}$.
    - **(10) $\to$ (11), OLR $[\top/x]$:** $\{\varnothing\}$ — conflict!

Both branches fail, so $\mathcal K$ is **unsatisfiable**.
:::

::: practice 13.6 · Horn DPLL tie-breaking and the inductive no-backtracking proof
Let $\mathcal H=\{\{\neg A,B\},\{\neg B,C\},\{\neg C,A\},\{\neg A,\neg C\}\}$.
1. Run DPLL (OLR before PLR) on $\mathcal H$, first trying the **positive** literal on ties, and then trying the **negative** literal on ties.
2. Prove by induction on the number of variables $n\in\mathbb N_0$ that DPLL (with OLR and PLR) **never backtracks** on any Horn clause set when ties always select the **negative** literal first.
::: answer
**1. Positive-first versus negative-first on $\mathcal H$.** Neither OLR nor PLR applies initially ($A,B,C$ all occur with both signs), so DPLL splits on $A$:
- **Positive-first:** Case $[\top/A]\to\{\{B\},\{\neg B,C\},\{\neg C\}\}\xrightarrow{\text{OLR }[\top/B]}\{\{C\},\{\neg C\}\}\xrightarrow{\text{OLR }[\top/C]}\{\varnothing\}$ (backtracks!); then Case $[\bot/A]\to\{\{\neg B,C\},\{\neg C\}\}\xrightarrow{\text{PLR }[\bot/B]}\{\{\neg C\}\}\xrightarrow{\text{OLR }[\bot/C]}\varnothing$, yielding model $A=B=C=0$.
- **Negative-first:** Case $[\bot/A]$ runs immediately without backtracking: $\{\{\neg B,C\},\{\neg C\}\}\xrightarrow{\text{PLR }[\bot/B]}\{\{\neg C\}\}\xrightarrow{\text{OLR }[\bot/C]}\varnothing$.

**2. Induction on the number of variables $n$.** Note first that removing clauses or literals from a Horn clause set never adds positive literals, so every simplified child remains Horn.
- **I.B. ($n=0$).** A $0$-variable clause set is either $\varnothing$ or $\{\varnothing\}$, and DPLL terminates immediately without backtracking.
- **I.S.** Fix $n\in\mathbb N_0$. **I.A.:** Negative-first DPLL never backtracks on Horn sets with at most $n$ variables. **I.C.:** The same holds for Horn sets $\mathcal K$ with $n+1$ variables.
- **Proof of I.C.** If $\mathcal K=\varnothing$ or $\varnothing\in\mathcal K$, DPLL stops at once. If OLR or PLR applies, DPLL makes a single unbranched transition to a Horn set $\mathcal K'$ on at most $n$ variables, which does not backtrack by **I.A.** Otherwise neither OLR nor PLR applies. Because OLR is inapplicable, every clause in $\mathcal K$ has size at least $2$; because $\mathcal K$ is Horn (at most one positive literal per clause), **every clause contains at least one negative literal**. Setting all variables to $0$ therefore satisfies $\mathcal K$. When negative-first DPLL branches on the chosen variable $A$ with $[\bot/A]$ first, the resulting Horn set $\mathcal K'$ on at most $n$ variables is still satisfied by the all-$0$ assignment! Because DPLL is sound and complete, the $[\bot/A]$ call succeeds (and by **I.A.** does so without backtracking), so DPLL never visits the $[\top/A]$ branch.
:::
