::: practice 2.1 · Brackets decide which expressions are equal
List the possible bracketings of $\neg A\land\neg B\lor C$ with no binding rules. Compare their truth columns. Then keep only the bracketings consistent with negation binding more strongly than either binary connective.
::: answer
If negation is ignored momentarily, there are two binary trees, with either $\lor$ or $\land$ at the root. Put the two negations back on subtrees that start at $A$ and $B$ respectively. A negation cannot move across a connective to a subtree beginning at a different leaf. The seven results are

$$
\begin{aligned}
F_1&=\neg((A\land\neg B)\lor C),\quad
F_2=(\neg(A\land\neg B))\lor C,\quad
F_3=((\neg A)\land(\neg B))\lor C,\\
F_4&=\neg(A\land\neg(B\lor C)),\quad
F_5=\neg(A\land((\neg B)\lor C)),\\
F_6&=(\neg A)\land\neg(B\lor C),\quad
F_7=(\neg A)\land((\neg B)\lor C).
\end{aligned}
$$

| A | B | C | $F_1$ | $F_2$ | $F_3$ | $F_4$ | $F_5$ | $F_6$ | $F_7$ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F | F | F | T | T | T | T | T | T | T |
| F | F | T | F | T | T | T | T | F | T |
| F | T | F | T | T | F | T | T | F | F |
| F | T | T | F | T | T | T | T | F | T |
| T | F | F | F | F | F | F | F | F | F |
| T | F | T | F | T | T | T | F | F | F |
| T | T | F | T | T | F | T | T | F | F |
| T | T | T | F | T | T | T | F | F | F |

Only $F_2$ and $F_4$ agree. By De Morgan's laws, $F_2$ simplifies to $\neg A\lor B\lor C$ and $F_4$ to $\neg A\lor(B\lor C)$. For the strongest-negation rule, keep only the trees where each negation is directly above its own leaf. This leaves $F_3,F_7$. Set $A$ and $C$ true and $B$ false. The outer “or” in $F_3$ lets the true $C$ decide the result, while the outer “and” in $F_7$ needs $\neg A$, which is false. Python also gives higher precedence to conjunction than disjunction and therefore chooses $F_3$.
:::

::: practice 2.2 · Translate the set operation into a filter
Take $A=\{1,3,5,7,9\}$, $B=\{2,4,6,8,10\}$, and $D=\{5,6,7,8,9,10\}$. Compute $A\cup B$, $A\cap B$, $A\setminus B$, $A\setminus D$, $B\setminus D$, $D\setminus A$, $D\setminus B$, $D\setminus(A\cup B)$, and $D\setminus(A\cap B)$.
::: answer
First observe that $A,B$ split $[10]$ into odd and even entries. For $A\setminus D$ we keep only elements of $A$ that are below $5$. Reversing the difference starts from $D$ instead, which keeps its even members.

| Expression | Result |
| --- | --- |
| $A\cup B$ | $[10]$ |
| $A\cap B$ | $\varnothing$ |
| $A\setminus B$ | $\{1,3,5,7,9\}$ |
| $A\setminus D$ | $\{1,3\}$ |
| $B\setminus D$ | $\{2,4\}$ |
| $D\setminus A$ | $\{6,8,10\}$ |
| $D\setminus B$ | $\{5,7,9\}$ |
| $D\setminus(A\cup B)$ | $\varnothing$ |
| $D\setminus(A\cap B)$ | $\{5,6,7,8,9,10\}$ |
:::

::: practice 2.3 · Find all subsets shared by the family
Take the family

$$
\begin{aligned}
\mathcal M=\{&\{0,1,3\},\{0,2,3,5\},\\
 &\{0,2,3\},\{0,3,4,5\}\}.
\end{aligned}
$$

Compute its union and intersection. Then find the family $\mathcal N$ of all subsets of $\bigcup\mathcal M$ that are contained in every member of $\mathcal M$, and find $\bigcup\mathcal N$.
::: answer
The union contains every observed element, so it is $\{0,1,2,3,4,5\}$. The first block leaves only $0,1,3$ as possible common elements. The next block rules out $1$, and all blocks contain $0,3$. Hence $\bigcap\mathcal M=\{0,3\}$.

Now we're choosing whole sets $X$ to put in $\mathcal N$. If an element goes into $X$, it must be available in every block, so it has to come from $\{0,3\}$. Conversely, each element of $\{0,3\}$ already passes every block's test. We can freely include or omit either of them when we form $X$.

$$
\mathcal N=2^{\bigcap\mathcal M}=\{\varnothing,\{0\},\{3\},\{0,3\}\},\qquad
\bigcup\mathcal N=\{0,3\}.
$$
:::

::: practice 2.4 · List products and complements by rows
Work over $\Omega=[6]$, with $A=\{1,2,3\}$ and $B=\{2,4,6\}$. Compare the four products obtained by choosing $A$ or $\overline A$ for each coordinate and the complement of $A\times A$. Then compute $A\times(A\cup B)$, $(A\cup B)\times A$ and the complement of $A\times(A\cup B)$. Compare the three ways of grouping three coordinates from $A$.
::: answer
We can list the pairs compactly as rows. A first-coordinate entry “$1,2,3$” with second coordinates “$4,5,6$” means that each of the three rows lists precisely those three pairs, for example $(1,4),(1,5),(1,6)$ in the first row.

| Set | First coordinates | Second coordinates for each indicated row | Cardinality |
| --- | --- | --- | --- |
| $A\times A$ | $1,2,3$ | $1,2,3$ | 9 |
| $A\times\overline A$ | $1,2,3$ | $4,5,6$ | 9 |
| $\overline A\times A$ | $4,5,6$ | $1,2,3$ | 9 |
| $\overline A\times\overline A$ | $4,5,6$ | $4,5,6$ | 9 |
| $\overline{A\times A}$ | $1,2,3$ and $4,5,6$ | $4,5,6$ for the first group and $1,2,3,4,5,6$ for the second | 27 |
| $A\times(A\cup B)$ | $1,2,3$ | $1,2,3,4,6$ | 15 |
| $(A\cup B)\times A$ | $1,2,3,4,6$ | $1,2,3$ | 15 |
| $\overline{A\times(A\cup B)}$ | $1,2,3$ and $4,5,6$ | $5$ for the first group and $1,2,3,4,5,6$ for the second | 21 |

The first complement counts $36-9$ and the second $36-15$. Look at $(2,4)$ to distinguish $\overline{A\times A}$ from $\overline A\times\overline A$. Its second coordinate makes it fail membership in $A\times A$, so it belongs to the complement of that product. Its first coordinate still belongs to $A$, so it cannot be in the product of the two complements.

For the last part, use the nine pairs in the first row of the table in order:

$$
(1,1),(1,2),(1,3),(2,1),(2,2),(2,3),(3,1),(3,2),(3,3).
$$

For $A\times(A\times A)$ each of the outer entries $1,2,3$ is paired with that entire nine-entry list as a second coordinate. For $(A\times A)\times A$ each of the nine pairs is followed by each of $1,2,3$ as one second coordinate. For $A\times A\times A$, append each of $1,2,3$ to each pair to make a flat triple. Each procedure lists $27$ distinct objects, but $(1,(2,3))$, $((1,2),3)$ and $(1,2,3)$ have different structures.
:::
