::: practice Classify relations by looking for witnesses
On $[5]$, take

$$
\begin{aligned}
R&=\{(2,1),(2,3),(4,1),(4,2),(5,2)\},\\
S&=\{(1,3),(3,1),(2,2),(2,4),\\
 &\phantom{=\{}(4,2),(4,4),(4,5),(5,4)\}.
\end{aligned}
$$

For each $X\in\{R,S\}$, compute $X^+$, $X^*$, $X^*\cap(X^*)^\top$, $(X\cup X^\top)^*$, and $X\setminus XX$. Classify each of the resulting relations and the originals.

Find one missing shortcut in $R$, one two-way edge in $S$, and the missing self-loops in $S$. These three observations will settle much of the table.
::: answer
Each column gives the successor set of its starting vertex. For example, a set $\{1,2,3\}$ under “From 4” lists the pairs $(4,1),(4,2),(4,3)$. For $S$, all four closures coincide because its edges are symmetric and every vertex belongs to a positive-length cycle.

| Relation | From 1 | From 2 | From 3 | From 4 | From 5 |
| --- | --- | --- | --- | --- | --- |
| $R$ | $\varnothing$ | $\{1,3\}$ | $\varnothing$ | $\{1,2\}$ | $\{2\}$ |
| $R^+$ | $\varnothing$ | $\{1,3\}$ | $\varnothing$ | $\{1,2,3\}$ | $\{1,2,3\}$ |
| $R^*$ | $\{1\}$ | $\{1,2,3\}$ | $\{3\}$ | $\{1,2,3,4\}$ | $\{1,2,3,5\}$ |
| $R^*\cap(R^*)^\top$ | $\{1\}$ | $\{2\}$ | $\{3\}$ | $\{4\}$ | $\{5\}$ |
| $(R\cup R^\top)^*$ | $[5]$ | $[5]$ | $[5]$ | $[5]$ | $[5]$ |
| $R\setminus RR$ | $\varnothing$ | $\{1,3\}$ | $\varnothing$ | $\{2\}$ | $\{2\}$ |
| $S$ | $\{3\}$ | $\{2,4\}$ | $\{1\}$ | $\{2,4,5\}$ | $\{4\}$ |
| All four closures of $S$ | $\{1,3\}$ | $\{2,4,5\}$ | $\{1,3\}$ | $\{2,4,5\}$ | $\{2,4,5\}$ |
| $S\setminus SS$ | $\{3\}$ | $\varnothing$ | $\{1\}$ | $\varnothing$ | $\varnothing$ |

In $R$, the path $4\to2\to3$ explains the new pair $(4,3)$ in $R^+$. There is no positive-length cycle in $R$, so adding $\operatorname{Id}_{[5]}$ is exactly what takes us from $R^+$ to $R^*$. The only edge of $R$ also produced in two steps is $(4,1)$. For $S$, the block $\{1,3\}$ has no edges to $\{2,4,5\}$. On the second block every original pair has a two-step witness: loops at $2$ and $4$ witness their own pairs, and each edge touching $5$ can use the loop at $4$. The two cross-edges of the first block have no two-step witness, so those are the survivors of $S\setminus SS$.

| Relation | Reflexive | Irreflexive | Symmetric | Antisymmetric | Asymmetric | Transitive |
| --- | --- | --- | --- | --- | --- | --- |
| $R$ | No | Yes | No | Yes | Yes | No |
| $R^+$ | No | Yes | No | Yes | Yes | Yes |
| $R^*$ | Yes | No | No | Yes | No | Yes |
| $R^*\cap(R^*)^\top$ | Yes | No | Yes | Yes | No | Yes |
| $(R\cup R^\top)^*$ | Yes | No | Yes | No | No | Yes |
| $R\setminus RR$ | No | Yes | No | Yes | Yes | No |
| $S$ | No | No | Yes | No | No | No |
| All four closures of $S$ | Yes | No | Yes | No | No | Yes |
| $S\setminus SS$ | No | Yes | Yes | No | No | No |

For every nonreflexive row, $(1,1)$ is absent. For negative irreflexivity and asymmetry tests on a reflexive relation, use its loop at $1$. The original $S$ already has the loop at $2$. Every nonsymmetric row contains $(2,1)$ and omits $(1,2)$. The pair in both directions giving failure of antisymmetry is $1\leftrightarrow2$ in the full relation and $1\leftrightarrow3$ in each applicable $S$ row. The failures of transitivity have explicit witnesses: $4\to2\to3$ in $R$, $4\to2\to1$ in $R\setminus RR$, and $1\to3\to1$ in $S$ and $S\setminus SS$. Check the missing shortcuts against the first table.

The equivalence relations are the identity and full relations from $R$ and the four closures of $S$. The partial orders are $R^*$ and the identity. Neither is total because $1$ and $3$ are incomparable in both. Every other total-order candidate is already ruled out by a failed partial-order condition.

Only $R^+$ is a strict weak ordering. Its incomparable blocks are $\{4,5\}$, $\{2\}$ and $\{1,3\}$; all edges go from earlier to later blocks and include every pair across blocks in that direction. Every other candidate fails asymmetry or transitivity. Grouping the incomparable elements is the extra check after verifying both of those properties.
:::

::: practice Five short steps with closures and transpose
Prove the following for endorelations on $A\ne\emptyset$.

1. If $|A|=n$ then $(\operatorname{Id}_A\cup R)^n=R^*$.
2. $R^\top=R$ iff $R^\top\subseteq R$.
3. $(R^*)^\top=(R^\top)^*$.
4. Transpose preserves union and intersection.
5. Symmetry and antisymmetry together imply $R\subseteq\operatorname{Id}_A$.
::: answer
1. Read an $n$-step path using $\operatorname{Id}_A\cup R$. Each genuine edge lies in $R$ and each stay may be deleted. This gives membership in $R^*$. In the other direction, repeatedly remove segments between repeated vertices from an $R$-path. Its endpoints are unchanged and it now has at most $n-1$ edges. Pad it to length $n$ with identity steps at the target. This explains why the identity is inside the power.
2. Equality implies inclusion. For the converse, transposing $R^\top\subseteq R$ preserves inclusion and gives $R=(R^\top)^\top\subseteq R^\top$. The two inclusions give equality.
3. A pair $(a,b)$ is in $(R^*)^\top$ exactly when an $R$-path goes from $b$ to $a$. Read the entire sequence backwards. Every reversed edge belongs to $R^\top$, so the new path goes from $a$ to $b$ using $R^\top$. If the path has zero edges, it stays at the same vertex after reversal. Reversing again proves the other direction.
4. Membership in $(R\cup S)^\top$ says $(b,a)\in R$ **or** $(b,a)\in S$ for the queried pair $(a,b)$. Translate each clause into transpose membership to get $R^\top\cup S^\top$. For the intersection, repeat with **and**.
5. Fix $(a,b)\in R$. Symmetry gives $(b,a)\in R$. Antisymmetry now forces $a=b$. Every pair therefore lies in the identity.
:::

::: practice Compare congruences by testing divisibility
For $m,n\in\{3,5,9,15\}$, decide whether $\equiv_m\subseteq\equiv_n$. Remember that $a\equiv_m b$ means $m\mid(a-b)$.
::: answer
What single difference would tell us whether the inclusion has a chance? Use $m$ itself. Choosing $a=m$ and $b=0$ puts the pair in $\equiv_m$. If the inclusion holds, the same pair has to pass the test for $\equiv_n$, so $n\mid m$. Now check that this condition is enough. If $n\mid m$, every multiple of $m$ is a multiple of $n$. For any $a\equiv_m b$, we therefore have $n\mid(a-b)$ and $a\equiv_n b$.

| $m$ | Values of $n$ giving inclusion |
| --- | --- |
| $3$ | $3$ |
| $5$ | $5$ |
| $9$ | $3,9$ |
| $15$ | $3,5,15$ |

A larger modulus can define a **smaller** relation. For instance $9$ divides fewer differences than $3$ does. The pair $(3,0)$ shows that the reverse inclusion fails.
:::

::: practice Unbounded and exact-$n$ stabilization on $\mathbb N_0$
1. Define a binary relation $R$ on $\mathbb N_0$ such that $R^{\le n}\subsetneq R^*$ for every $n\in\mathbb N_0$.
2. For each fixed $n\in\mathbb N$, define $S_n$ on $\mathbb N_0$ such that $S_n^{\le n-1}\subsetneq S_n^{\le n}=S_n^*$.
::: answer
1. Take the successor relation $R=\{(k,k+1)\mid k\in\mathbb N_0\}$. An $m$-step walk advances by $m$, so $R^{\le n}=\{(k,k+m)\mid k\in\mathbb N_0,\ 0\le m\le n\}$, whereas $(0,n+1)\in R^{n+1}\subseteq R^*\setminus R^{\le n}$ for every $n\in\mathbb N_0$.
2. Restrict the chain to the first $n+1$ numbers: $S_n=\{(k,k+1)\mid 0\le k<n\}$. The longest directed path $0\to 1\to\cdots\to n$ has length $n$, so $(0,n)\in S_n^{\le n}\setminus S_n^{\le n-1}$, and no path has length above $n$, giving $S_n^{\le n}=S_n^*$.
:::

::: practice Myhill–Nerode representatives, separating words, and quotient graph
Over $\Sigma=\{a,b,c\}$, let $L=\{w\in\Sigma^*\mid\text{both }a\text{ and }b\text{ occur in }w\}$ and define $u\sim_L v\iff\forall z\in\Sigma^*\,(uz\in L\leftrightarrow vz\in L)$.
1. Prove that $\sim_L$ is an equivalence relation on $\Sigma^*$.
2. Prove that $R=\{\varepsilon,a,b,ab\}$ is a complete system of representatives of $\Sigma^*/{\sim_L}$ with no two distinct representatives equivalent.
3. Specify all directed edges of the transition graph $\{([u]_{\sim_L},[ux]_{\sim_L})\mid u\in\Sigma^*,\ x\in\Sigma\}$.
::: answer
**1. Equivalence relation.** Fix $z\in\Sigma^*$. Logical equivalence $\leftrightarrow$ on truth values is reflexive, symmetric, and transitive, so $uz\in L\leftrightarrow uz\in L$, $(uz\in L\leftrightarrow vz\in L)\implies(vz\in L\leftrightarrow uz\in L)$, and agreement of $u,v$ and $v,w$ at $z$ gives agreement of $u,w$ at $z$. Quantifying universally over $z\in\Sigma^*$ preserves all three properties.

**2. Pairwise inequivalence and exhaustiveness.** To prove $u\not\sim_L v$ for distinct $u,v\in R$, exhibit one separating suffix $z_{u,v}$ putting exactly one of $uz_{u,v},vz_{u,v}$ into $L$:

| $z_{u,v}$ | $a$ | $b$ | $ab$ |
| --- | --- | --- | --- |
| $\varepsilon$ | $b$ ($ab\in L,\ b\notin L$) | $a$ ($ba\in L,\ a\notin L$) | $\varepsilon$ ($ab\in L,\ \varepsilon\notin L$) |
| $a$ | — | $a$ ($aa\notin L,\ ba\in L$) | $\varepsilon$ ($a\notin L,\ ab\in L$) |
| $b$ | — | — | $\varepsilon$ ($b\notin L,\ ab\in L$) |

For exhaustiveness, a left-to-right scan of $w\in\{a,b,c\}^*$ only needs to remember which subset of $\{a,b\}$ has appeared so far:
- Neither $a$ nor $b$ in $w$ ($w\in\{c\}^*$): $wz\in L\iff z$ contains both $a$ and $b\iff\varepsilon z\in L$, so $w\sim_L\varepsilon$.
- $a$ occurs in $w$, $b$ does not: $wz\in L\iff z$ contains $b\iff az\in L$, so $w\sim_L a$.
- $b$ occurs in $w$, $a$ does not: $wz\in L\iff z$ contains $a\iff bz\in L$, so $w\sim_L b$.
- Both $a$ and $b$ occur in $w$: $wz\in L$ holds for all $z$, just like $abz\in L$, so $w\sim_L ab$.

**3. Quotient transition graph.** Appending $c$ never changes which of $a,b$ has appeared, so every class has a $c$-loop:
- From $[\varepsilon]$: $c\mapsto[\varepsilon]$, $a\mapsto[a]$, $b\mapsto[b]$.
- From $[a]$: $a,c\mapsto[a]$, $b\mapsto[ab]$.
- From $[b]$: $b,c\mapsto[b]$, $a\mapsto[ab]$.
- From $[ab]$: $a,b,c\mapsto[ab]$.
:::

::: practice Intersecting congruences to solve six remainder conditions
Prove ${\equiv_m}\cap{\equiv_n}={\equiv_{\operatorname{lcm}(m,n)}}$, and find the smallest positive integer $x\in\mathbb N$ satisfying $x\equiv_2 1$, $x\equiv_3 1$, $x\equiv_4 1$, $x\equiv_5 1$, $x\equiv_6 1$, and $x\equiv_7 0$.
::: answer
For any $a,b\in\mathbb Z$, $(a,b)\in({\equiv_m}\cap{\equiv_n})\iff m\mid(a-b)\land n\mid(a-b)\iff\operatorname{lcm}(m,n)\mid(a-b)\iff a\equiv_{\operatorname{lcm}(m,n)}b$.

Applying this iteratively to the first five conditions merges them into $x\equiv_{\operatorname{lcm}(2,3,4,5,6)}1$, i.e. $x\equiv_{60}1$, so $x=1+60k$ for $k\in\mathbb N_0$. Testing $1+60k\equiv_7 0$ gives $1+4k\equiv_7 0\iff 4k\equiv_7 6\iff k\equiv_7 5$ (since $4\cdot 2\equiv_7 1$). The least nonnegative choice $k=5$ yields $x=1+60\cdot 5=301$.
:::
