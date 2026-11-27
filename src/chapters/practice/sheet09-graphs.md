::: practice Repeated degree in every simple graph
Show that a simple graph on $n\ge2$ vertices has two vertices of equal degree, even when it is disconnected.
::: answer
Degrees lie in $0,\ldots,n-1$. But a degree-zero vertex and a degree-$(n-1)$ vertex cannot coexist, since the latter must be adjacent to the former. Thus at most $n-1$ of the degree values occur. With $n$ vertices, two share a value. This also explains why using the full interval would not be enough for the pigeonhole argument.
:::

::: practice Realize and complement two degree sequences
Find the possible simple graphs, up to isomorphism, with degree list $(1,1,1,1)$ or $(1,2,2,2,3)$. Determine their complements.
::: answer
The first list gives two disjoint edges. Its complement contains the four edges between the two pairs, so it is $K_{2,2}\cong C_4$.

For the second, let $a$ have degree 3 and $b$ degree 1. Erase $b$ in your sketch. Only the degree of its one neighbour drops. If that neighbour was $a$, the four remaining vertices all have degree 2. Every component in this degree-two graph is a cycle and needs at least three vertices, so there is just one component, a $C_4$. Putting back $b$ gives a four-cycle with one pendant edge.

If $b$ had a different neighbour $c$, then $c$ had degree 2. Removing $b$ leaves degrees $(3,2,2,1)$. The degree-three vertex $a$ is universal on the four remaining vertices. The two degree-two vertices must also connect to each other and $c$ has already used its last degree. The original graph is therefore a triangle with a two-edge path attached at $a$. These cases exhaust the possibilities.

In the complement the degrees of $a,b$ swap, the three 2s stay 2, and the presence of the edge $ab$ reverses. Hence the two graphs are complementary.
:::

::: practice Colour grids and decide who can tour the graph
Find $\chi(Q_d)$ and $\chi(M_{m,n})$ for $d\ge0$ and $m,n\ge1$. Then determine for which parameters $P_n$, $C_n$, $K_n$ and $B_h$ have Eulerian or Hamiltonian cycles. Use $n\ge1$ for paths and complete graphs, $n\ge3$ for cycles, and $h\ge0$ for binary trees. Allow the empty cycle on one vertex.
::: answer
Colour $Q_d$ by parity of the number of ones and $M_{m,n}$ by parity of $i+j$. Each edge crosses the colour classes. Thus the chromatic number is 2 whenever an edge exists. It is 1 for $Q_0$ and $M_{1,1}$.

| Graph | Eulerian cycle | Hamiltonian cycle |
| --- | --- | --- |
| $P_n$ | Only $n=1$ | Only $n=1$ |
| $C_n$ with $n\ge3$ | Every such $n$ | Every such $n$ |
| $K_n$ | Odd $n$ | $n=1$ or $n\ge3$ |
| $B_h$ | Only $h=0$ | Only $h=0$ |

A nontrivial tree has leaves, so it has odd degrees and no cycle. A cycle graph's own cycle visits exactly the required edges and vertices. In $K_n$, every degree is $n-1$, so Euler's criterion gives odd $n$. When $n\ge3$ the increasing vertex list and the closing edge form a Hamiltonian cycle. For $n=2$ that closing edge would repeat the original undirected edge.
:::

::: practice Self-complementary graphs and parity modulo 4
1. Prove that if a simple graph $G$ is disconnected, its complement $\overline G$ is connected.
2. Construct self-complementary graphs ($G\cong\overline G$) on $n=4$ and $n=5$ vertices, and prove that $G\cong\overline G$ implies $|V|\bmod 4\in\{0,1\}$.
::: answer
**1.** Pick $u,v\in V$. If $u$ and $v$ lie in different connected components of $G$, then $\{u,v\}\notin E$, so $\{u,v\}$ is a direct edge in $\overline G$. If $u$ and $v$ lie in the same component of $G$, pick any $w$ in another component of $G$; neither $\{u,w\}$ nor $\{w,v\}$ is in $E$, so $u-w-v$ is a path of length $2$ in $\overline G$. Thus $\overline G$ is connected.

**2.** On $n=4$, $P_4$ ($0-1-2-3$) has complement $1-3-0-2$, also a four-vertex path, so $P_4\cong\overline{P_4}$. On $n=5$, the $5$-cycle $C_5$ has complement forming the inner pentagram $5$-cycle, so $C_5\cong\overline{C_5}$. In general, $G\cong\overline G$ forces $|E|=|\overline E|=\frac12\binom n2=\frac{n(n-1)}{4}$. Because $|E|$ is an integer, $4\mid n(n-1)$. Since $n$ and $n-1$ have opposite parity, $4$ must divide the even factor—meaning either $4\mid n$ ($n\equiv_4 0$) or $4\mid(n-1)$ ($n\equiv_4 1$).
:::

::: practice Pizza slicing via Euler's planar formula and counting tree colourings
1. Mark $n=37$ equally spaced points on the rim of a round pizza (for odd $n$, no three interior chords meet at one interior point). Cut along the straight chord between every non-adjacent pair of marked points (using the circular rim between adjacent points). Using Euler's planar formula, determine how many pizza slices are produced.
2. How many proper $5$-colourings $c\colon V\to[5]$ does the path graph $P_{10}$ admit? Compare this with $\chi(P_{10})$.
::: answer
**1. Pizza slices via $|V|-|E|+|F|=2$.** Model the sliced disk as a connected planar graph:
- **Vertices $|V|$:** Each interior crossing comes from a unique $4$-subset of rim points $1\le a<b<c<d\le n$ (the two crossing diagonals $v_av_c$ and $v_bv_d$). Adding the $n$ rim vertices gives $|V|=n+\binom n4$.
- **Edges $|E|$:** Each of the $n$ rim vertices has $2$ rim-arc incidences and $n-3$ chord incidences, so degree $n-1$. Each of the $\binom n4$ interior crossings has degree $4$. By handshaking,
$$
2|E|=n(n-1)+4\binom n4\quad\Longrightarrow\quad |E|=\binom n2+2\binom n4.
$$
- **Bounded slices $|F|-1$:** Euler's formula gives $|F|=2-|V|+|E|$; subtracting $1$ for the unbounded region outside the pizza leaves
$$
|F|-1=1-|V|+|E|=1-n+\binom n2+\binom n4.
$$
(Quick sanity check at $n=7$: $1-7+21+35=50$ slices.) At $n=37$, $\binom{37}{2}=666$ and $\binom{37}{4}=66045$, giving $1-37+666+66045=66675$ slices.

**2. Counting proper colourings versus $\chi$.** Since $P_{10}$ has $9$ edges and no odd cycle, $\chi(P_{10})=2$. To **count** all proper $5$-colourings $c\colon[10]\to[5]$, colour vertex $1$ in $5$ ways, then colour vertices $2,3,\ldots,10$ in order: each vertex only has to avoid the colour of its single predecessor, leaving $4$ choices each time and $5\cdot 4^9=1{,}310{,}720$ proper $5$-colourings.
:::
