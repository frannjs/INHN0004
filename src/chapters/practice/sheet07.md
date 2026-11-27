::: practice One coefficient and a count of many coefficients
Find the coefficient of $x^{36}y^{12}z^{32}$ in $(16x+19y+6z)^{80}$. In a separate expansion $(1+2x+3y+5z)^{100}$, count its nonzero coefficients of total degree at most 15.
::: answer
Each of the 80 factors supplies one letter. Pick which 36 supply $x$, which 12 of the remaining supply $y$, and let the rest supply $z$. Each choice contributes the same product of numerical factors. The coefficient is $\binom{80}{36,12,32}16^{36}19^{12}6^{32}$.

Now count exponent triples $(j,k,\ell)$ with nonnegative entries and $j+k+\ell\le15$. Every such monomial occurs because the remaining $100-j-k-\ell$ factors can supply 1, and no positive terms cancel. Insert a slack coordinate to make the sum exactly 15. Distributing 15 units among four labeled coordinates gives $\binom{18}{3}=816$.
:::

::: practice Allocate 42 objects among 23 recipients
Count the allocations in each row. Send all objects to recipients unless the row asks you to set aside leftovers. In that case, all leftovers go to one separate destination.

| Distinguishable labels | Required counts |
| --- | --- |
| Both objects and recipients | Unrestricted loads, exactly one each with leftovers, and at least one each |
| Recipients only | Unrestricted loads, and exactly one each with leftovers |
| Objects only | Exactly one each with leftovers, and at least one each |
| Neither objects nor recipients | Exactly one each with leftovers, and at least one each |
::: answer
| Labels that matter | Condition | Number | One outcome records |
| --- | --- | --- | --- |
| Both | No restrictions | $23^{42}$ | The recipient of each object |
| Both | Exactly one per recipient, with leftovers | $42!/19!$ | An injection from recipients to objects |
| Both | At least one per recipient, all distributed | $23!S_{42,23}$ | A partition into 23 nonempty fibres and a distinct label for each |
| Recipients only | No restrictions | $\binom{64}{22}$ | A nonnegative ordered load tuple summing to 42 |
| Recipients only | Exactly one per recipient, with leftovers | $1$ | The forced tuple of ones |
| Objects only | Exactly one per recipient, with leftovers | $\binom{42}{23}$ | The subset of delivered objects, with each in a singleton |
| Objects only | At least one per recipient, all distributed | $S_{42,23}$ | An unlabeled partition into 23 nonempty blocks |
| Neither | Exactly one per recipient, with leftovers | $1$ | Twenty-three singleton loads and 19 leftovers |
| Neither | At least one per recipient, all distributed | $P_{42,23}$ | A sorted list of 23 positive loads summing to 42 |

Compare the rows with exactly one object per recipient. With both sets labeled, the recipients determine 23 distinct slots, and we fill them with an injective tuple. With only the objects labeled, we still choose which 23 are delivered, but any order of those singleton groups gives the same outcome. In both cases the 19 leftovers are forced once the delivered objects are chosen.
:::

::: practice Six ways of grouping words
Over three letters, consider all words of length four. Compare keys formed by the word, the sorted word, labeled sets of positions, those position sets with their labels forgotten, the tuple of labeled letter counts, and those counts sorted. Count the keys for each rule and explain how to find the number of words under a given key. For the unlabeled position sets, discard empty sets to make a partition of the four positions. For sorted counts, keep all three coordinates, including zeros.
::: answer
| Key | Number of keys | Words per key |
| --- | --- | --- |
| Entire word | $3^4=81$ | $1$ |
| Sorted word | $\binom{6}{2}=15$ | $\binom4{m_1,m_2,m_3}$ for the letter counts |
| Labeled position sets | $3^4=81$ | $1$, since each position already has a label |
| Unlabeled position sets | $S_{4,1}+S_{4,2}+S_{4,3}=14$ | $3!/(3-k)!$ for $k$ nonempty blocks, assigning distinct letters to the blocks |
| Labeled counts | $\binom{6}{2}=15$ | $\binom4{m_1,m_2,m_3}$ |
| Sorted counts | $P_{4,1}+P_{4,2}+P_{4,3}=4$ | $\frac{3!}{\prod_i\mu_i!}\binom4{m_1,m_2,m_3}$ |

Try the word $xyyx$. In the fourth row the key keeps the groups of positions $\{1,4\}$ and $\{2,3\}$. There are three choices of letter for the first group and two left for the second. In the last row the key is merely $(0,2,2)$. We still choose which of the three letters is absent, and now we also choose which two of the four positions one of the remaining letters occupies. That gives $3\cdot6=18$. In the formula for this row, $\mu_i$ counts how many of the three coordinates equal $i$, **including zeros**. To check the counts by enumeration, visit the $3^4$ tuples and append each to its key's list. The six key counts in order are $81,15,81,14,15,4$. Summing the list lengths gives 81 every time because each word goes into exactly one list for a given rule.
:::

::: practice Draw two graph products from the same grid
Use a directed path $\vec P_n$ with arrows $i\to i+1$ for $0\le i<n-1$, and a directed cycle $\vec C_n$ that adds $n-1\to0$. Compare both products for factors drawn from $\vec P_2,\vec P_3,\vec C_2,\vec C_3$. Why is the direct product acyclic when one factor is a path? What changes for simple undirected factors? Compare the components of the direct products $\vec C_2\times\vec C_2$ and $\vec C_2\times\vec C_3$.
::: answer
Place $(i,j)$ in row $i$ and column $j$. In the Cartesian drawing, an arrow is a horizontal step or a vertical step. Add a wraparound in a particular direction precisely when that direction's factor is a cycle. In the direct drawing, both coordinates must have a successor. Draw the unique arrow from $(i,j)$ to the pair of successors when they exist, using wraparound separately in each cycle direction. For example $\vec P_2\times\vec C_3$ has the three arrows $(0,0)\to(1,1)$, $(0,1)\to(1,2)$, and $(0,2)\to(1,0)$. Its Cartesian counterpart has both directed row cycles and three vertical arrows $(0,j)\to(1,j)$. Set each factor in the graph lab to see the resulting drawings.

This table gives the number of arrows in each drawing as (Cartesian, direct), with rows and columns in the indicated factor order. Each entry follows from $|E_1||V_2|+|V_1||E_2|$ and $|E_1||E_2|$, respectively. The Cartesian sets are disjoint here because these factors have no loops.

| First factor | $\vec P_2$ | $\vec P_3$ | $\vec C_2$ | $\vec C_3$ |
| --- | --- | --- | --- | --- |
| $\vec P_2$ | $(4,1)$ | $(7,2)$ | $(6,2)$ | $(9,3)$ |
| $\vec P_3$ | $(7,2)$ | $(12,4)$ | $(10,4)$ | $(15,6)$ |
| $\vec C_2$ | $(6,2)$ | $(10,4)$ | $(8,4)$ | $(12,6)$ |
| $\vec C_3$ | $(9,3)$ | $(15,6)$ | $(12,6)$ | $(18,9)$ |

Every direct step increases a path coordinate, so no positive-length walk can close. With undirected factors, both forward and backward steps are available, and the argument no longer applies. For example $P_3\times P_3$ has the cycle $(0,1),(1,0),(2,1),(1,2),(0,1)$. The simple cycle family still starts at $n=3$. In either version, the Cartesian rule models interleaving one program step at a time, while the direct rule models synchronized steps.

With two directed cycles, each step advances both coordinates. The first return takes the least positive number of steps that is a multiple of both cycle lengths. The product of two length-two cycles splits into two cycles of length two. Now start at $(0,0)$ with lengths two and three. After two steps we are at $(0,2)$, and after three we are at $(1,0)$. The coordinates first return together at step six. That cycle uses all six states. In general there are $mn/\operatorname{lcm}(m,n)=\gcd(m,n)$ components of equal length.
:::

::: practice Gift budgets with lower bounds and pocket slack
1. Distribute **at most** $k$ indivisible euros among $n$ distinct relatives ($0$ euros allowed). Evaluate at $k=10,n=3$ and give the general binomial formula.
2. Repeat with budget at most $k$ euros when each of the $n$ friends must receive **at least** $\ell$ euros ($k\ge n\ell$). Evaluate at $k=40,n=3,\ell=10$.
::: answer
**1.** Introduce an $(n+1)$-st recipient—"your own pocket"—to absorb the unspent euros $m_{n+1}=k-\sum_{i=1}^n m_i\ge0$. Nonnegative $(n+1)$-tuples summing to $k$ are counted by stars-and-bars with $k$ stars and $n$ bars:
$$
\binom{k+(n+1)-1}{k}=\binom{n+k}{k}=\binom{n+k}{n}.
$$
At $k=10,n=3$, this gives $\binom{13}{3}=286$.

**2.** Hand each of the $n$ friends $\ell$ euros upfront, leaving at most $k-n\ell$ euros to distribute freely among the $n$ friends plus your pocket. Applying part 1 to remaining budget $k'=k-n\ell$ gives $\binom{n+k-n\ell}{n}=\binom{k-n(\ell-1)}{n}$ (and $\binom{13}{3}=286$ again at $k=40,n=3,\ell=10$).
:::

::: practice Combinatorial double counting for binomial and Stirling sums
Prove combinatorially (without expanding factorials):
1. $\binom nm\binom mk=\binom nk\binom{n-k}{m-k}$ for $0\le k\le m\le n$.
2. Vandermonde's identity $\sum_{i=0}^k\binom mi\binom{n}{k-i}=\binom{m+n}{k}$, and deduce $\sum_{k=0}^n\binom nk^2=\binom{2n}{n}$.
3. Simplify $\sum_{k=0}^{30}\binom{30}{k}S_{k,27}$ into a single Stirling number of the second kind.
::: answer
**1.** Both sides count nested pairs $(A,B)$ with $A\subseteq B\subseteq[n]$, $|A|=k$, and $|B|=m$. Left: pick $B$ in $\binom nm$ ways, then $A\subseteq B$ in $\binom mk$ ways. Right: pick $A\subseteq[n]$ first in $\binom nk$ ways, then choose the remaining $m-k$ elements of $B\setminus A$ from $[n]\setminus A$ in $\binom{n-k}{m-k}$ ways.

**2.** Let $M,N$ be disjoint sets of sizes $m,n$. Choosing $k$ elements from $M\uplus N$ takes $\binom{m+n}{k}$ ways; splitting by the unique count $i=|X\cap M|\in\{0,\ldots,k\}$ chooses $i$ from $M$ and $k-i$ from $N$ in $\binom mi\binom{n}{k-i}$ ways. Setting $m=n=k$ and using $\binom nk=\binom{n}{n-k}$ yields $\sum_{k=0}^n\binom nk^2=\sum_{k=0}^n\binom nk\binom{n}{n-k}=\binom{2n}{n}$.

**3.** Partition $[31]$ into $28$ nonempty blocks and focus on the block containing $31$. Choose the $k\in\{0,\ldots,30\}$ elements of $[30]$ that **do not** share $31$'s block in $\binom{30}{k}$ ways (the other $30-k$ elements join $31$), then partition those $k$ elements into the remaining $27$ nonempty blocks in $S_{k,27}$ ways (note $S_{k,27}=0$ for $k<27$). Summing over $k$ counts every $28$-block partition of $[31]$ once, so $\sum_{k=0}^{30}\binom{30}{k}S_{k,27}=S_{31,28}$.
:::

::: practice Monotone grid paths avoiding a cell and restricted permutations
1. Count monotone lattice paths from $(0,0)$ to $(7,5)$ using steps $(1,0)$ and $(0,1)$ that **never** visit $(3,2)$.
2. Count permutations $\pi\in\mathcal S_7$ satisfying $\pi(4)\ne 3\land\pi(5)\ne 4$.
::: answer
**1.** An unrestricted path makes $7$ right steps and $5$ up steps in $\binom{7+5}{7}=\binom{12}{5}=792$ ways. Every path visiting $(3,2)$ concatenates a path $(0,0)\to(3,2)$ ($\binom{3+2}{3}=\binom52=10$ ways) with a path $(3,2)\to(7,5)$ ($\binom{4+3}{4}=\binom73=35$ ways). Subtracting the forbidden routes leaves $\binom{12}{5}-\binom52\binom73=792-350=442$.

**2.** Let $B_1=\{\pi\in\mathcal S_7\mid \pi(4)=3\}$ and $B_2=\{\pi\in\mathcal S_7\mid \pi(5)=4\}$. Fixing one image leaves $6!$ permutations of the other six values, and fixing two distinct inputs to two distinct images leaves $5!$ permutations on $B_1\cap B_2$. By inclusion–exclusion, $|\mathcal S_7\setminus(B_1\cup B_2)|=7!-2\cdot 6!+5!=5040-1440+120=3720$.
:::
