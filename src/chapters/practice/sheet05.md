::: practice 5.1(a) · Read a bipartite function graph
Use the common codomain $B=\{a,b,c,d,e\}$. Read each pair of lists as aligned input and output rows. Find the domain, image, and whether each map is injective, surjective, or bijective.

| Map | Inputs | Outputs |
| --- | --- | --- |
| $f$ | $1,2,3,4,5$ | $a,c,b,c,d$ |
| $g$ | $1,3,4,5,7$ | $a,b,e,c,d$ |
| $h$ | $1,3,5,7,9,11$ | $a,e,c,d,b,a$ |
::: answer
The first row for each map lists all its input vertices. Draw one arrow from each to its aligned output vertex and include all five codomain vertices. A collision and a missing target are different failures.

| Map | Domain | Image | Injective? | Surjective? |
| --- | --- | --- | --- | --- |
| $f$ | $\{1,2,3,4,5\}$ | $\{a,b,c,d\}$ | No, $2,4$ both map to $c$ | No, $e$ has no preimage |
| $g$ | $\{1,3,4,5,7\}$ | $B$ | Yes, each displayed output is distinct | Yes, all five occur |
| $h$ | $\{1,3,5,7,9,11\}$ | $B$ | No, $1,11$ both map to $a$ | Yes, all five occur |

Only $g$ is bijective. The aligned lists also specify each edge of the bipartite drawings. When drawing, duplicate output values should be one vertex on the output side receiving more than one arrow.
:::

::: practice 5.1(b) · Same rule, different codomain
Let $f(x)=1/(1+e^{-x})$ for every real $x$. Show that $f:\mathbb R\to\mathbb R$ is injective but not surjective. Show that the same rule gives a bijection onto $(0,1)$.
::: answer
Since $e^{-x}>0$, the denominator is bigger than $1$. Thus $0<f(x)<1$ and, for example, $0$ is missed by the map to $\mathbb R$. Equal outputs force equal denominators and then $e^{-x}=e^{-x'}$. The exponential is injective, so $x=x'$.

Now take an arbitrary target $y\in(0,1)$ and solve for its input:

$$
y=\frac{1}{1+e^{-x}}
\quad\Longleftrightarrow\quad e^{-x}=\frac{1-y}{y}
\quad\Longleftrightarrow\quad
x=\ln\frac{y}{1-y}.
$$

The logarithm is defined because both $y$ and $1-y$ are positive. Substituting this input returns $y$, so every proposed target in the smaller codomain is reached. The graph grows from values approaching $0$ to values approaching $1$, with neither endpoint attained.
:::

::: practice 5.2(a) · Divisibility Hasse diagram and bounds
Use the divisors of $7475$ as the ambient set. Draw its Hasse diagram and determine the supremum, infimum, maximum and minimum of $\{13,65,1495\}$, $\{5,13,325\}$, $\{575,1495,115\}$, and $\{25,115,299\}$ under divisibility.
::: answer
Factor $7475=5^2\cdot13\cdot23$. Each divisor corresponds to an exponent triple $(i,j,k)$ with $0\le i\le2$ and $0\le j,k\le1$. A cover increases exactly one exponent by one. If the change were greater, one increment would supply a strict intermediate divisor. These are the rows and all the upward edges of the diagram:

| Rank | Vertices and their immediate successors |
| --- | --- |
| 0 | $1\to5,13,23$ |
| 1 | $5\to25,65,115$; $13\to65,299$; $23\to115,299$ |
| 2 | $25\to325,575$; $65\to325,1495$; $115\to575,1495$; $299\to1495$ |
| 3 | $325\to7475$; $575\to7475$; $1495\to7475$ |
| 4 | $7475$ |

For each sample, take the coordinatewise maxima of its exponent triples for the least upper bound. Coordinatewise minima give the greatest lower bound. Check membership in $X$ separately for a maximum or minimum.

| $X$ | Supremum | Infimum | Maximum | Minimum |
| --- | --- | --- | --- | --- |
| $\{13,65,1495\}$ | $1495$ | $13$ | $1495$ | $13$ |
| $\{5,13,325\}$ | $325$ | $1$ | $325$ | None |
| $\{575,1495,115\}$ | $7475$ | $115$ | None | $115$ |
| $\{25,115,299\}$ | $7475$ | $1$ | None | None |

In the third row, $115=5\cdot23$ divides both $575=5^2\cdot23$ and $1495=5\cdot13\cdot23$. It is already the minimum and therefore also the infimum. To sit above both $575$ and $1495$, a divisor must have the $5^2$ from $575$ and the $13$ from $1495$, together with the common $23$. The first candidate is $7475$ itself. It gives the supremum, and it lies outside the three-element set, so there is no maximum.
:::

::: practice 5.2(b,c) · When infix bounds fail
Take all contiguous infixes of $baab$ with the infix order. Draw its covers and find $\sup,\inf,\max,\min$ for $\{ab,baa\}$, $\{aa,ab\}$, $\{a,b\}$, and $\{ab,ba\}$. Decide whether the infix order on all words over $\{a,b\}$ is a lattice.
::: answer
The levels are $\varepsilon$ at length $0$, $a,b$ at length $1$, $aa,ab,ba$ at length $2$, $aab,baa$ at length $3$, and $baab$ at length $4$. Containment from one level to the next is a cover. If there is a larger gap in length, extend a chosen occurrence of the smaller word inside the larger word by one symbol to get a strict intermediate infix.

| Lower vertex | Immediate successors |
| --- | --- |
| $\varepsilon$ | $a,b$ |
| $a$ | $aa,ab,ba$ |
| $b$ | $ab,ba$ |
| $aa$ | $aab,baa$ |
| $ab$ | $aab$ |
| $ba$ | $baa$ |
| $aab$ and $baa$ | $baab$ for each |

| $X$ | Supremum | Infimum | Maximum | Minimum |
| --- | --- | --- | --- | --- |
| $\{ab,baa\}$ | $baab$ | None | None | None |
| $\{aa,ab\}$ | $aab$ | $a$ | None | None |
| $\{a,b\}$ | None | $\varepsilon$ | None | None |
| $\{ab,ba\}$ | $baab$ | None | None | None |

Go up from $a$ and from $b$. Both routes can reach $ab$, and both can reach $ba$. A least upper bound would have to fit inside both of those words while still containing both letters. The only length-two candidate inside $ab$ is $ab$ itself, and it fails inside $ba$.

Now start at $ab$ and $ba$ and go down. Both $a$ and $b$ are lower bounds, so a greatest lower bound would have to contain them both. This gives the very same impossible requirement, read in the other direction. It rules out the infimum of $\{ab,ba\}$ in the full word order as well, since a lower bound must still fit inside both words. The full order therefore fails the lattice test.
:::

::: practice 5.3(a) · Trace the ranking recursion
Apply $r(b)=1+\max\{r(a)\mid aH_Rb\}$ to the preceding infix diagram. Initialize all ranks to $-1$ to mark them undefined, then start at the maximal words and recurse through cover predecessors. Use rank $0$ for a vertex with no predecessor. Explain what happens if the same predecessor is requested twice.
::: answer
Start from the unique maximal word $baab$. Computing it requests $aab$ and $baa$. These request $aa,ab$ and $aa,ba$ respectively, then the letters and $\varepsilon$.

Watch $aa$. Both branches ask for it. The first request finds $-1$, checks the rank of its predecessor $a$, and stores $2$. The next request finds that $2$ and can use it immediately. Every time we do need to recurse, the requested predecessor is strictly shorter, so tracing requests backward must eventually reach $\varepsilon$.

| Rank | Vertices | Computation |
| --- | --- | --- |
| 0 | $\varepsilon$ | No predecessor |
| 1 | $a,b$ | Their only predecessor has rank 0 |
| 2 | $aa,ab,ba$ | Their predecessor ranks are 1 |
| 3 | $aab,baa$ | Their predecessor ranks are 2 |
| 4 | $baab$ | Both predecessors have rank 3 |

The rank is length in this example because each cover increases length by exactly one and every word is reachable from $\varepsilon$ along such covers. A rank comparison adds some ordering information beyond infix containment. For example, $b$ is ranked before $aa$, although $b$ is not an infix of $aa$.
:::

::: practice 5.5(a) · Draw permutations from disjoint cycles
On $[7]$, the one-line forms are $f=(4,5,2,7,3,6,1)$ and $g=(4,6,7,1,3,2,5)$. Convert them to cycles and describe the arrows of the two permutation graphs.
::: answer
Start the $g$ graph at $1$. Its successor is $4$ and $4$ returns to $1$, giving $(1,4)$. The next unused input is $2$, whose successor $6$ returns to it. From $3$ we follow $3\to7\to5\to3$. So $g=(1,4)(2,6)(3,7,5)$ and there are no fixed points. Place each cycle on its own polygon, with a two-cycle drawn as opposite arrows.

For $f$ the arrows are $1\to4\to7\to1$, $2\to5\to3\to2$, and the loop at $6$, yielding $(1,4,7)(2,5,3)(6)$. Each displayed number has exactly one arrow entering and leaving it. This is a quick check that both graphs represent permutations.
:::

::: practice 5.4 · Base-3 lexicographic embedding and missing Hasse covers
Over $\Sigma=\{a,b\}$ with $a<_{\mathrm{lex}}b$, map each word $w=w_1\cdots w_m\in\Sigma^*$ to the base-$3$ rational $r(w)=\sum_{i=1}^m d(w_i)3^{-i}\in[0,1)$ with $d(a)=1$ and $d(b)=2$.
1. Show that $u<_{\mathrm{lex}}v\iff r(u)<r(v)$, and explain what fails in base $2$ with $d(a)=0,d(b)=1$.
2. Compute $H_R=(R\setminus\operatorname{Id})\setminus(R\setminus\operatorname{Id})^2$ for $(\Sigma^*,\le_{\mathrm{lex}})$ and explain why $H_R^*\ne{\le_{\mathrm{lex}}}$, whereas restricting to finite words $\{a,b\}^{\le n}$ restores $H_R^*={\le_{\mathrm{lex}}}$.
::: answer
**1. Base-$3$ order embedding.** Because $r$ is injective, test $u<_{\mathrm{lex}}v$ in its two cases:
- **Proper prefix ($v=uz$ with $|z|\ge1$):** Every letter contributes at least $1$, so $r(v)-r(u)\ge 3^{-(|u|+1)}>0$.
- **First mismatch ($u=wax$, $v=wby$ with $|w|=k$):** Even if $x$ consists entirely of $b$s, its tail is strictly less than $\sum_{j>k+1}2\cdot 3^{-j}=3^{-(k+1)}$. Thus
$$
r(u)<r(w)+3^{-(k+1)}+3^{-(k+1)}=r(w)+2\cdot 3^{-(k+1)}\le r(v).
$$
Since $\le_{\mathrm{lex}}$ is a total order, $u<_{\mathrm{lex}}v\iff r(u)<r(v)$ follows. In base $2$ with $d(a)=0$ and $d(b)=1$, trailing $a$s contribute $0$, so $b<_{\mathrm{lex}}ba$ fails because $r(b)=1/2=r(ba)$.

**2. Hasse reduction.** On $\Sigma^*$, any cross-branch pair $uav<_{\mathrm{lex}}ubw$ has the strict intermediate word $uava$ ($uav<_{\mathrm{lex}}uava<_{\mathrm{lex}}ubw$), removing $(uav,ubw)$ from $H_{\le_{\mathrm{lex}}}$. Even $(u,ub)$ drops out because $u<_{\mathrm{lex}}ua<_{\mathrm{lex}}ub$ puts $(u,ub)\in R_s^2$. Only single-$a$ extensions survive: if $u<_{\mathrm{lex}}t<_{\mathrm{lex}}ua$ held, $t$ could not start with $ub$, so $u$ would be a proper prefix of $t$, forcing $|t|\ge|u|+1$ and $t\ge_{\mathrm{lex}}ua$. Thus $H_{\le_{\mathrm{lex}}}=\{(u,ua)\mid u\in\Sigma^*\}$, whose closure never reaches $b$ from $\varepsilon$, so $H_{\le_{\mathrm{lex}}}^*\ne{\le_{\mathrm{lex}}}$. On the finite set $\{a,b\}^{\le n}$, words of maximum length $n$ cannot be extended: $ua\,b^{n-|u|-1}$ has no longer extension, so $(ua\,b^{n-|u|-1},ub)$ survives as a cover and $H_R^*=R$.
:::

::: practice Jump 604 steps in lexicographic permutation order
Let $\le_{\mathrm{lex}}$ order $\mathcal S_7$ in one-line notation, with minimum $\hat h=(1,2,3,4,5,6,7)$ and Hasse cover relation $H$. Compute $\hat h H^{604}$, the permutation $604$ lexicographic steps after $\hat h$.
::: answer
Because $(\mathcal S_7,\le_{\mathrm{lex}})$ is a finite total order, $H$ moves one step along the sorted list of all $7!$ permutations, so $\hat h H^{604}$ is the permutation at $0$-based index $604$. Divide $604$ successively by $6!=720,5!=120,4!=24,3!=6,2!=2,1!=1$:
$$
604=0\cdot 6!+5\cdot 5!+0\cdot 4!+0\cdot 3!+2\cdot 2!+0\cdot 1!+0\cdot 0!.
$$
Select from the sorted remaining pool $[1,2,3,4,5,6,7]$ using the quotients $(0,5,0,0,2,0,0)$ as $0$-based indices:
- Index $0$ of $[1,2,3,4,5,6,7]\mapsto 1$ (pool $[2,3,4,5,6,7]$).
- Index $5$ of $[2,3,4,5,6,7]\mapsto 7$ (pool $[2,3,4,5,6]$).
- Index $0$ of $[2,3,4,5,6]\mapsto 2$ (pool $[3,4,5,6]$).
- Index $0$ of $[3,4,5,6]\mapsto 3$ (pool $[4,5,6]$).
- Index $2$ of $[4,5,6]\mapsto 6$ (pool $[4,5]$).
- Index $0$ of $[4,5]\mapsto 4$, then $5$.

Hence $\hat h H^{604}=\{(1,7,2,3,6,4,5)\}$ (or the permutation $(1,7,2,3,6,4,5)$).
:::

::: practice 5.5(b) · Reuse $f\circ g$ in longer permutation products
For $f=(1,4,7)(2,5,3)$ and $g=(1,4)(2,6)(3,7,5)$ on $[7]$, compute $f\circ g\circ f$, $g\circ f\circ g$, and $f\circ g\circ f\circ g$ in cycle notation.
::: answer
First compute $h=f\circ g$ (apply $g$, then $f$): $1\mapsto4\mapsto7$, $7\mapsto5\mapsto3$, $3\mapsto7\mapsto1$, $2\mapsto6\mapsto6$, $6\mapsto2\mapsto5$, $5\mapsto3\mapsto2$, and $4\mapsto1\mapsto4$, so $h=(1,7,3)(2,6,5)$. By associativity:
- $f\circ g\circ f=h\circ f$: $1\mapsto4\mapsto4$, $4\mapsto7\mapsto3$, $3\mapsto2\mapsto6$, $6\mapsto6\mapsto5$, $5\mapsto3\mapsto1$, and $2\mapsto5\mapsto2$, $7\mapsto1\mapsto7$, giving $(1,4,3,6,5)$.
- $g\circ f\circ g=g\circ h$: $1\mapsto7\mapsto5$, $5\mapsto2\mapsto6$, $6\mapsto5\mapsto3$, $3\mapsto1\mapsto4$, $4\mapsto4\mapsto1$, and $2\mapsto6\mapsto2$, $7\mapsto3\mapsto7$, giving $(1,5,6,3,4)$.
- $f\circ g\circ f\circ g=h^2$: squaring two disjoint $3$-cycles reverses each of them, giving $(1,3,7)(2,5,6)$.
:::
