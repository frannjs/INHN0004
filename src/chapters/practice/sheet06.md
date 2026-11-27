::: practice Equivalence relations on four labels
How many equivalence relations are there on $[4]$? How many distinct relations of the form $a\equiv_f b\Longleftrightarrow f(a)=f(b)$ arise from functions $f:[4]\to[4]$? First group the possibilities by class sizes.
::: answer
For sizes $4$, there is one class. For $3+1$, choose the singleton in 4 ways. For $2+2$, choose the partner of 1 in 3 ways and the other pair is forced. For $2+1+1$, choose the pair in 6 ways. For four singletons there is one possibility. Each class partition determines the relation, so there are $1+4+3+6+1=15$.

Every $f$ gives a partition into nonempty fibres. Conversely, any partition has at most four classes, so we can label them by distinct values of $[4]$ and make $f$ constant with that value on each class. Therefore all 15 arise this way, even though there are $4^4$ functions. For a partition with $k$ classes, $4!/(4-k)!$ distinct functions realize it.
:::

::: practice Binary expansions of subsets of the natural numbers
Turn membership of each positive integer into its corresponding binary digit after the point. Find the numbers for $3\mathbb N$, $3\mathbb N+1$, and $3\mathbb N+2$. Find the first eight decimal digits of the number for the primes.
::: answer
Find the first 1 before summing anything. In $3\mathbb N+1$ it is at position 4, because the first allowed input is 1 and $3\cdot1+1=4$. The three sets start at 3, 4, and 5. From any such start $j$, each new 1 is three positions later, so its contribution is $2^{-3}$ times the previous one. Summing gives $2^{-j}/(1-2^{-3})$, and hence $1/7$, $1/14$, and $1/28$. The full positive residue classes for 1 and 2 modulo 3 also contain 1 and 2, respectively. For those classes, adding the contributions $1/2$ and $1/4$ gives $4/7$ and $2/7$.

For primes, sum $2^{-p}$ over prime $p\le50$. The omitted sum is smaller than $\sum_{i>50}2^{-i}=2^{-50}$, because that bound allows a 1 at every remaining position. To decide which eight decimal digits to keep, multiply the lower and upper bounds by $10^8$ and take their floors. The denominators are both $2^{50}$, so we can do the check with integers:

$$
\left\lfloor10^8\frac{\sum_{p\le50}2^{50-p}}{2^{50}}\right\rfloor
=\left\lfloor10^8\frac{1+\sum_{p\le50}2^{50-p}}{2^{50}}\right\rfloor=41468250.
$$

Every value between the bounds has that same floor. So the first eight digits after the point are $41468250$, including the final zero.

Every rational binary expansion is eventually periodic, as the remainders in base-two long division are drawn from a finite set. If prime membership repeated with period $t\ge1$ after some index, choose a prime $p$ in the repeating part. Position $p+pt=p(1+t)$ would have the same bit as position $p$ but is composite. Thus the expansion cannot be rational.
:::

::: practice Read the type before counting a space of functions
For $A=B=[2]$ and $C=[n]$, find the sizes of $A^{(B^C)}$, $(A^B)^C$, and $A^{C\times B}$. Repeat with $A=[2]$ and $B=[1]$.

Next, tabulate $c^b$ for $c,b\in\{0,1,2\}$ with $0^0=1$. Give the output when fixing $c$ to obtain each function of $b$, then when fixing $b$ to obtain each function of $c$. Finally apply $g\mapsto g(1)^2$ to each function obtained by fixing $c$.
::: answer
For $A=B=[2]$, there are $2^n$ possible inputs to a function in $A^{(B^C)}$, yielding $2^{2^n}$ choices. A map in $(A^B)^C$ chooses one of $2^2$ rows at each of $n$ positions, giving $4^n=2^{2n}$. A map in $A^{C\times B}$ chooses a bit at each of $2n$ pairs, giving the same $2^{2n}$.

For $B=[1]$, there is one map $C\to B$, so the first size is 2. An $A^B$ row now has one cell and two possible values. The second and third sizes are both $2^n$. This includes $n=0$: a domain with no elements supports one empty function, while $B^C$ itself has one element.

With rows indexed by $c$, the table gives $(1,0,0),(1,1,1),(1,2,4)$. Fix $c=2$ and you get the function $b\mapsto 2^b$, the third row. Fix $b=2$ instead and you get $c\mapsto c^2$, the third column. Reading each column in turn gives $(1,1,1),(0,1,2),(0,1,4)$. Finally apply $g\mapsto g(1)^2$ to the original rows. It reads the middle entry of each row and squares it, giving $0,1,4$. The inputs to this last map are whole rows.
:::

::: practice Count the numbers that avoid three divisors
In $0,\ldots,1000$, count the integers divisible by none of $2,7,11$. Include zero in the starting universe, and explain how to check the result independently.
::: answer
There are $1001$ possibilities. A forbidden multiple of $d$ occurs $1+\lfloor 1000/d\rfloor$ times, including zero. For the single divisors these counts are $501,143,91$. For pairwise intersections the least common multiples are $14,22,77$, giving $72,46,13$. The triple has least common multiple $154$ and size 7. Thus

$$
1001-(501+143+91)+(72+46+13)-7=390.
$$

An independent check is to scan all integers in the interval and increment a count only when all three remainders are nonzero. The count agrees. The same routine for divisors $6,14,32$ up to $1000$ returns 768, and for $2,7,13$ up to $182$ it returns 72. When divisors share a factor, their intersection uses their least common multiple. For example the intersection for 6 and 14 consists of multiples of 42.
:::

::: practice Partial orders on $[3]$ and comparing orders with equivalences
1. Count all partial orders on $[3]$ by classifying their possible Hasse diagrams.
2. Prove that every finite set $A$ admits at least as many partial orders as equivalence relations.
3. Prove that the set of equivalence relations on $\mathbb N$ has cardinality $|2^{\mathbb N}|$.
::: answer
**1. Partial orders on $[3]$.** Group the unlabeled Hasse shapes by number of cover edges:
- $0$ covers (three incomparable vertices): $1$ partial order ($\operatorname{Id}_{[3]}$).
- $1$ cover (one ordered pair $a\to b$ and one isolated element $c$): $3\cdot 2=6$ labelings.
- $2$ covers forming a V-shape ($a\to b,a\to c$) or $\Lambda$-shape ($b\to a,c\to a$): $3$ choices of apex in each shape, giving $3+3=6$ labelings.
- $2$ covers forming a chain $a\to b\to c$ (total orders): $3!=6$ labelings.
Total: $1+6+6+6=19$ partial orders.

**2. Injection from equivalences to partial orders.** Fix a reference total order $<$ on finite $A$. Given any partition (equivalence relation $\sim$) of $A$, orient each equivalence class internally as a strict chain under $<$ while leaving distinct blocks incomparable: $x\preceq_\sim y\iff x=y\lor(x\sim y\land x<y)$. Reflexivity, antisymmetry, and transitivity hold immediately. Recovering the connected components $(P\cup P^\top)^*$ of $\preceq_\sim$ recovers the exact blocks of $\sim$, so $\sim\mapsto{\preceq_\sim}$ is injective.

**3. Equivalences on $\mathbb N$.** Every equivalence relation is a subset of $\mathbb N\times\mathbb N$, giving at most $|2^{\mathbb N\times\mathbb N}|=|2^{\mathbb N}|$ equivalences. Conversely, map each subset $S\subseteq\mathbb N\setminus\{1\}$ to the partition putting $\{1\}\cup S$ in one block and every $x\notin\{1\}\cup S$ in its own singleton. Distinct subsets produce distinct classes $[1]$, giving an injection $2^{\mathbb N\setminus\{1\}}\to\operatorname{Eq}(\mathbb N)$ of size $|2^{\mathbb N}|$. Cantor–Schroeder–Bernstein concludes $|\operatorname{Eq}(\mathbb N)|=|2^{\mathbb N}|$.
:::

::: practice Infinite subsets and infinite function spaces
1. Let $\mathcal N=\{X\subseteq\mathbb N\mid |X|=|\mathbb N|\}$. Prove $|\mathcal N|=|2^{\mathbb N}|$, and explain why mapping $X\subseteq\mathbb N$ to $(0.d_1d_2\ldots)_3$ with $d_i\in\{0,1\}$ is injective on all of $2^{\mathbb N}$ whereas base $2$ is not.
2. Compare $|A^{C\times B}|$ with $|(A^B)^C|$, and determine whether $|\mathbb N^{\mathbb N}|$ and $|\mathbb N^{\mathbb R}|$ equal $|2^{\mathbb N}|$ or $|2^{\mathbb R}|$.
::: answer
**1.** Clearly $\mathcal N\subseteq 2^{\mathbb N}$ gives $|\mathcal N|\le|2^{\mathbb N}|$. For the reverse injection, reserve the even numbers $2\mathbb N$ to guarantee infinitude and encode any $S\subseteq\mathbb N$ into the odd positions: $f(S)=2\mathbb N\cup\{2s-1\mid s\in S\}\in\mathcal N$. Recovering $S=\{s\in\mathbb N\mid 2s-1\in f(S)\}$ proves injectivity, so $|\mathcal N|=|2^{\mathbb N}|$. In base $2$, $\{1\}\mapsto(0.100\ldots)_2=1/2$ collides with $\mathbb N\setminus\{1\}\mapsto(0.0111\ldots)_2=1/2$; in base $3$ using only digits $\{0,1\}$, the maximum tail after a first mismatch at $k$ is $\sum_{j>k}3^{-j}=\frac12\cdot 3^{-k}<3^{-k}$, so distinct subsets have strictly distinct values.

**2.** Currying $\Phi(f)(c)(b)=f(c,b)$ is a bijection $A^{C\times B}\to(A^B)^C$ with inverse $\Psi(g)(c,b)=g(c)(b)$, so $|A^{C\times B}|=|(A^B)^C|$ for all sets. For $\mathbb N^{\mathbb N}$: $\{0,1\}^{\mathbb N}\subseteq\mathbb N^{\mathbb N}$ gives $|2^{\mathbb N}|\le|\mathbb N^{\mathbb N}|$, and representing inputs in $\mathbb N$ gives $|\mathbb N^{\mathbb N}|\le|(2^{\mathbb N})^{\mathbb N}|=|2^{\mathbb N\times\mathbb N}|=|2^{\mathbb N}|=|\mathbb R|$. For $\mathbb N^{\mathbb R}$: $\{0,1\}^{\mathbb R}\subseteq\mathbb N^{\mathbb R}$ gives $|2^{\mathbb R}|\le|\mathbb N^{\mathbb R}|\le|(2^{\mathbb N})^{\mathbb R}|=|2^{\mathbb R\times\mathbb N}|=|2^{\mathbb R}|$, so $|\mathbb N^{\mathbb R}|=|2^{\mathbb R}|$.
:::
