::: practice Servers, rooms, and digit constraints
Count the assignments of six unlabeled jobs to 18 distinct servers with at most one per server, 18 unlabeled people to 15 distinct rooms, ten labeled people to five indistinguishable nonempty rooms, and six distinguishable jobs to 11 distinct servers with at most one job per server. Then count the integers in $[1000]$ of digit sum 6 and 12.
::: answer
1. Pick the six occupied servers, giving $\binom{18}{6}$.
2. Record the 15 nonnegative room loads summing to 18, giving $\binom{32}{14}$.
3. Record who is together by partitioning the set of people into five nonempty blocks. Each block already represents a room. There is no further choice of room labels, so the count is $S_{10,5}$.
4. Assign a distinct server to each labeled job, giving $11!/5!$.

For the digits, pad the numbers below 1000 to three positions. Zero has digit sum 0 and 1000 has digit sum 1, so neither affects these two counts. A sum of 6 cannot force a digit over 9. Its count is $\binom82=28$. A sum of 12 has $\binom{14}{2}$ nonnegative triples before imposing the upper bound. If one coordinate is at least 10, subtract 10 there and count the triples summing to 2, giving $\binom42$ for each of three choices. Two coordinates cannot both be at least 10. The answer is $\binom{14}{2}-3\binom42=73$.
:::

::: practice Lottery tickets with prescribed multiplicity
A ticket is a six-entry word on $[5]$. Its payout is the highest letter that appears at least three times, or 0 if there is none. Count payouts 5 and 0.
::: answer
Payout 5 means precisely that 5 occurs $k\ge3$ times. Choose its $k$ positions and fill the other positions independently with four remaining letters, giving

$$
\sum_{k=3}^6\binom6k4^{6-k}=1545.
$$

For payout zero, every multiplicity is at most two. The positive profiles of six over at most five letters are $(2,2,2)$, $(2,2,1,1)$, and $(2,1,1,1,1)$. For a fixed profile, assign the multiplicities to letter labels and then count arrangements:

$$
\binom53\frac{6!}{(2!)^3}
+\binom52\binom32\frac{6!}{(2!)^2}
+5\frac{6!}{2!}
=8100.
$$

Read the middle term for profile $(2,2,1,1)$. Choose the two letters that occur twice, then choose the two that occur once from the remaining three. That fixes which letters can fill the positions. The factorial ratio now counts the different orders of those same letters on the ticket.
:::

::: practice List all four relabelings
In $G$, the two-cycle is $1\rightleftarrows5$, the uniquely looped vertex is 4, and the other arrows are $3\to2$, $6\to2$, $2\to4$. In $H$, the two-cycle is $b\rightleftarrows d$, the uniquely looped vertex is $a$, and the other arrows are $c\to f$, $e\to f$, $f\to a$. Give all isomorphisms $G\to H$ and all automorphisms of $G$.
::: answer
The unique loops force $4\mapsto a$. Now find the other arrow into 4 and the other arrow into $a$. They force $2\mapsto f$. There are two ways to send the predecessors $\{3,6\}$ of 2 to $\{c,e\}$, and two independent ways to send the vertices $\{1,5\}$ of the two-cycle to $\{b,d\}$. Each choice matches all six edges in the two graphs, so it gives an isomorphism. In two-line notation the top row is always $(1,2,3,4,5,6)$. The four bottom rows are $(b,f,c,a,d,e)$, $(b,f,e,a,d,c)$, $(d,f,c,a,b,e)$, and $(d,f,e,a,b,c)$.

In $G$ the same reasoning fixes 4 and 2 and allows the swaps of 1 with 5 and 3 with 6 independently. The four automorphisms are $\operatorname{Id}$, $(1\ 5)$, $(3\ 6)$, and $(1\ 5)(3\ 6)$.
:::

::: practice Realizable versus connected
Can $(1,1,1,1,1,2,2,3)$ be realized by a connected graph? Find two nonisomorphic realizations if possible. Then use Havel–Hakimi to decide whether $(1,3,3,5,5,5,6)$ is realizable by a simple graph.
::: answer
The first sum is 12, so a realization has six edges. Connecting eight vertices requires at least seven edges. For two disconnected realizations, put a single edge on vertices 7 and 8 in both graphs. On vertices 1 to 6 build a tree with three branches starting at vertex 1, with lengths $(1,1,3)$ in the first graph and $(1,2,2)$ in the second. For example, the branches are $(1,2),(1,3),(1,4,5,6)$ and $(1,2),(1,3,4),(1,5,6)$, respectively.

Each tree has one degree-three vertex, two degree-two vertices, and three leaves. Together with the separate edge this gives the requested degree sequence. Any isomorphism would send the unique degree-three vertex to the unique degree-three vertex and preserve how many of its neighbours are leaves. The first graph has two such neighbours and the second has one.

For the second, the degree sum is even and the degrees are in range, so perform Havel–Hakimi. The successive ascending lists are $(0,2,2,4,4,4)$, $(0,1,1,3,3)$, $(0,0,0,2)$, and $(-1,-1,0)$. Look at the list just before the negatives appear. The degree-2 vertex still needs two neighbours, and every other vertex has residual degree zero. Those two $-1$s record demands for edges the other vertices cannot supply.
:::

::: practice What a tree degree list forces
Let the tree have $n\ge2$ vertices and ascending degrees $d_1,\ldots,d_n$. Show that the sum is $2n-2$, that $d_1=d_2=1$, and that if $n=2$ or $d_3>1$ then the tree is isomorphic to $P_n$.
::: answer
A tree has $n-1$ edges, each contributing two incidences, so its degree sum is $2n-2$. Every degree is positive. If there were fewer than two ones, the sum would be at least $1+2(n-1)=2n-1$. Hence the first two degrees are 1. For $n=2$ the tree is the edge. Otherwise $d_3>1$ forces all $n-2$ remaining degrees to be at least 2. Their sum is exactly $2(n-2)$, so all are 2. A longest simple path must cover the graph: an omitted vertex would attach to an internal path vertex of degree at least 3 or extend a path endpoint. Thus the graph is $P_n$.
:::

::: practice Trace both spanning trees from zero
Start at 0 and choose the least unvisited successor of the parent selected by BFS or DFS. The first graph has arrows

$$
\begin{aligned}
\{&(0,1),(1,2),(2,3),(3,1),\\
  &(0,4),(4,5),(5,1),(3,5)\}.
\end{aligned}
$$

Also trace its undirected version. The second graph has arrows

$$
\begin{aligned}
\{&(0,1),(0,4),(1,0),(1,3),\\
  &(1,4),(2,3),(4,0),(4,2)\}.
\end{aligned}
$$
::: answer
The first graph includes vertex 5 since several specified edges use it. The discovery time $i$ begins at 1 for vertex 0, so the first edge has label 2. In the undirected columns arrows below indicate parent to child, regardless of original edge direction.

| $i$ | First directed BFS | First directed DFS | First undirected BFS | First undirected DFS |
| --- | --- | --- | --- | --- |
| 2 | $0\to1$ | $0\to1$ | $0\to1$ | $0\to1$ |
| 3 | $0\to4$ | $1\to2$ | $0\to4$ | $1\to2$ |
| 4 | $1\to2$ | $2\to3$ | $1\to2$ | $2\to3$ |
| 5 | $4\to5$ | $3\to5$ | $1\to3$ | $3\to5$ |
| 6 | $2\to3$ | $0\to4$ | $1\to5$ | $5\to4$ |

For the second graph the sequences at times 2 through 5 are BFS $(0,1),(0,4),(1,3),(4,2)$ and DFS $(0,1),(1,3),(1,4),(4,2)$. After DFS visits 3, that vertex has no outgoing edge, so the algorithm returns to the latest eligible parent, 1. Its unvisited successor 4 comes next.
:::

::: practice Automorphism counts and small generating sets for disconnected graphs
1. On $\mathbb Z_4=\{0,1,2,3\}$, give $|\operatorname{Aut}(H)|$ and a minimal generating set for $H\in\{P_4,C_4,K_4\}$.
2. Let $G=P_6\oplus K_5\oplus K_5$ have three disjoint connected components: $P_6$ on $\{1,\ldots,6\}$ (in path order), the first $K_5$ on $\{7,\ldots,11\}$, and the second $K_5$ on $\{12,\ldots,16\}$. Compute $|\operatorname{Aut}(G)|$ and give a generating set of **at most four** permutations in cycle notation.
::: answer
**1. Connected building blocks.**
- $P_4$: $|\operatorname{Aut}(P_4)|=2$, generated by the single reflection $\{(0\,3)(1\,2)\}$.
- $C_4$: $|\operatorname{Aut}(C_4)|=2\cdot 4=8$, generated by the rotation and reflection $\{(0\,1\,2\,3),\,(1\,3)\}$.
- $K_4$: $|\operatorname{Aut}(K_4)|=4!=24$, generated by one swap and one $4$-cycle $\{(0\,1),\,(0\,1\,2\,3)\}$.

**2. Disjoint union with isomorphic components.** Any automorphism maps $P_6$ to itself ($2$ choices: $\operatorname{Id}$ or $\rho=(1\,6)(2\,5)(3\,4)$), permutes each $K_5$ internally ($5!$ choices each), and either keeps each $K_5$ on its own vertex set or exchanges the two $K_5$ components ($2!$ choices). Therefore
$$
|\operatorname{Aut}(G)|=2\cdot(5!)^2\cdot 2!=2\cdot 14400\cdot 2=57600.
$$
Four permutations generate the entire group:
- $\rho=(1\,6)(2\,5)(3\,4)$ (generates $\operatorname{Aut}(P_6)$),
- $\tau=(7\,8)$ and $\gamma=(7\,8\,9\,10\,11)$ (generate all $5!$ permutations on the first $K_5$),
- $\beta=(7\,12)(8\,13)(9\,14)(10\,15)(11\,16)$ (swaps the two $K_5$ components vertex for vertex).

Why do we need no extra generators for $\{12,\ldots,16\}$? Conjugating $\tau$ and $\gamma$ by $\beta$ produces $\beta\circ\tau\circ\beta=(12\,13)$ and $\beta\circ\gamma\circ\beta=(12\,13\,14\,15\,16)$, which already generate all $5!$ permutations on the second $K_5$!
:::

::: practice Two Havel–Hakimi realizations and the converse tree degree test
1. Run Havel–Hakimi on $(0,1,1,1,1,2,2,2)$ and construct two non-isomorphic simple realizations by varying which tie-breaking vertices receive edges during reconstruction.
2. Prove by induction on $n\ge2$ that every sorted sequence $(d_1,\ldots,d_n)$ of positive integers with $d_1=d_2=1$ and $\sum_{i=1}^n d_i=2n-2$ is the degree sequence of a tree.
::: answer
**1.** Label $(v_1,\ldots,v_8)$ with $(0,1,1,1,1,2,2,2)$. Removing $v_8$ (deg $2$) and decrementing $v_6,v_7$ leaves $(0,1,1,1,1,1,1)$ on $v_1,\ldots,v_7$, which pairs into three disjoint edges plus isolated $v_1$.
- **Realization 1 (connected component of size $7$ plus $v_1$):** Pair $(v_6,v_5),(v_7,v_4),(v_2,v_3)$, then restore $v_8$ adjacent to $v_6,v_7$. Components have sizes $1,2,5$ ($P_5\oplus P_2\oplus P_1$).
- **Realization 2 (cycle plus edges):** Pair $(v_6,v_7),(v_2,v_3),(v_4,v_5)$, then restore $v_8$ adjacent to $v_6,v_7$. Now $\{v_6,v_7,v_8\}$ forms $C_3$, giving $C_3\oplus P_2\oplus P_2\oplus P_1$. Since Realization 2 has a triangle and Realization 1 is acyclic, they are non-isomorphic.

**2.** **I.B. ($n=2$):** $(1,1)$ is realized by $P_2$. **I.S.:** Fix $n\ge2$ and assume every valid $(n)$-term list is tree-realizable. Take $(d_1,\ldots,d_{n+1})$ with $d_1=d_2=1$ and $\sum_{i=1}^{n+1}d_i=2n$. Necessarily $d_{n+1}\ge2$ (if all $d_i=1$, the sum $n+1<2n$ for $n\ge2$). Delete leaf $d_1=1$ and decrement $d_{n+1}$ to $d_{n+1}-1\ge1$. The remaining $n$ positive entries sum to $2n-2$. Because their average is $<2$, at least two entries equal $1$, so after sorting the reduced list satisfies the induction assumption and realizes a tree $T'$. Attaching a new leaf of degree $1$ to the vertex of degree $d_{n+1}-1$ preserves connectedness and acyclicity while restoring degrees $(d_1,\ldots,d_{n+1})$.
:::
