::: practice Compose two relations and classify reachability
On $[4]$, use $R=\{(1,2),(2,3),(3,4),(4,1)\}$ and $S=\{(1,3),(3,2),(2,4),(4,2)\}$. Find $RS$, $SR$, $R^2$, $R^3$, each reflexive-transitive closure, and each component relation $X^*\cap(X^\top)^*$ and $(X\cup X^\top)^*$.

Start with input $1$. Following $R$ then $S$ lands at $4$. Where does following $S$ then $R$ land? If these two land at the same element, try input $2$.
::: answer
For a product, take the row of the **first** relation and use its destinations as row indices into the second. From input $2$, $RS$ follows $2\to3\to2$, while $SR$ follows $2\to4\to1$. The middle vertex is the witness. Only the two ends enter the answer.

| Relation | From 1 | From 2 | From 3 | From 4 |
| --- | --- | --- | --- | --- |
| $RS$ | $\{4\}$ | $\{2\}$ | $\{2\}$ | $\{3\}$ |
| $SR$ | $\{4\}$ | $\{1\}$ | $\{3\}$ | $\{3\}$ |
| $R^2$ | $\{3\}$ | $\{4\}$ | $\{1\}$ | $\{2\}$ |
| $R^3$ | $\{4\}$ | $\{1\}$ | $\{2\}$ | $\{3\}$ |
| $R^*$ | $[4]$ | $[4]$ | $[4]$ | $[4]$ |
| $S^*$ | $[4]$ | $\{2,4\}$ | $\{2,3,4\}$ | $\{2,4\}$ |

The directed cycle $R$ reaches every vertex from every starting point. Its mutual-reachability relation and its connectivity after forgetting direction are both $[4]\times[4]$. For $S$, the path $1\to3\to2$ enters the cycle $2\leftrightarrow4$. Neither cycle vertex returns to $3$. Therefore $S^*\cap(S^\top)^*$ relates elements in the same block of $\{\{1\},\{3\},\{2,4\}\}$. After allowing either direction, the chain $1,3,2,4$ connects everything, so $(S\cup S^\top)^*=[4]\times[4]$.

The useful split is between exact length and any length. The row for $R^2$ asks for exactly two edges. The row for $R^*$ includes the zero-edge path and every destination attained later.
:::

::: practice Four induction proofs with four different steps
Prove $\sum_{k=0}^n k=n(n+1)/2$, $|2^A|=2^{|A|}$ for finite $A$, $|A^n|=|A|^n$, and $F_n\le 2^n$ for the Fibonacci sequence $F_0=0$, $F_1=1$, $F_{n+2}=F_{n+1}+F_n$. Before doing the algebra, identify what is added or split in each step.
::: answer
**Sum.** I.B. At $n=0$ both sides are zero. I.S. Fix $n\ge0$. I.A. The sum through $n$ is $n(n+1)/2$. I.C. The sum through $n+1$ is $(n+1)(n+2)/2$. Isolate the new summand to see exactly where we use the assumption:
$$
\sum_{k=0}^{n+1}k=\sum_{k=0}^{n}k+(n+1)=\frac{n(n+1)}2+(n+1)=\frac{(n+1)(n+2)}2.
$$

**Subsets.** I.B. A set of size zero has one subset, so $|2^\emptyset|=1=2^0$. I.S. Fix $n\ge0$. I.A. Each $n$-element set has $2^n$ subsets. I.C. Each $(n+1)$-element set has $2^{n+1}$. For such a set $A$, choose $a\in A$ and put $B=A\setminus\{a\}$. A subset of $A$ comes from exactly one subset of $B$, with the independent choice to include $a$ or omit it. The two families are disjoint and each has size $2^n$, giving the required count.

**Tuples.** I.B. $A^0$ contains just the empty tuple, matching the empty product $|A|^0=1$ even for $A=\varnothing$. I.S. Fix $n\ge0$. I.A. There are $|A|^n$ tuples of length $n$. I.C. There are $|A|^{n+1}$ tuples of length $n+1$. A tuple of length $n+1$ has exactly one prefix of length $n$ and exactly one last entry. Conversely every such pair builds a tuple. For each of the $|A|^n$ prefixes, there are $|A|$ possible last entries, giving $|A|^n|A|=|A|^{n+1}$.

**Fibonacci.** I.B. $0\le1$ and $1\le2$ settle $n=0,1$. I.S. Fix $n\ge0$. I.A. Assume the bounds through $n+1$. I.C. Prove the bound at $n+2$. Read the recurrence first at $n=0$. It asks for both $F_1$ and $F_0$, so both basis checks have a job in the very first step. At the general step, we use the bound for each of the two terms.
$$
F_{n+2}=F_{n+1}+F_n\le2^{n+1}+2^n=3\cdot2^n\le2^{n+2}.
$$
The valid proof shapes follow the data: one new term, two disjoint families, an extra coordinate, or two earlier indices.
:::

::: practice Why the Hanoi solution is optimal
Show that it takes at least $2^n-1$ moves to transfer $n$ different-sized disks. Then construct a transfer using $2^{n+1}-2$ moves when each size occurs twice and disks of equal size may sit on each other.
::: answer
Write $H(n)$ for the minimum in the ordinary problem. I.B. $H(0)=0$. For the step, assume $H(n-1)=2^{n-1}-1$ for $n\ge1$. When the largest disk is moved, every smaller disk must be on the third rod. Reaching that state before the first move of the largest disk costs at least $H(n-1)$. Immediately before its final arrival at the target rod, all smaller disks must again occupy the remaining rod. Moving those disks onto the target afterward costs at least $H(n-1)$. Hence at least $2H(n-1)+1$ moves are required, even if there are extra moves of the largest disk in between. The recursive construction achieves that bound by moving it once. We get $H(n)=2^n-1$.

For the doubled version, regard each equal-sized pair as a block throughout an ordinary $n$-disk solution. Each legal move of a block can be done by moving its top disk and then its bottom disk. The destination only has larger disks or is empty before the first move, and the equal disk on top of the destination permits the second. There are two physical moves per block move, giving $2(2^n-1)=2^{n+1}-2$. This part asks for a construction, so a lower bound is unnecessary.
:::

::: practice Linear and circular seat assignments
Count binary strings of length $n$ with no consecutive ones, first along a counter and then around a circle where the first and last seats touch. Compute the first few values, then explain the Fibonacci indices.
::: answer
Enumerating the binary tuples first gives these values. Use the two counts at $n=3$ to check the wraparound rule. The linear assignment $101$ is allowed and the circular assignment $101$ is excluded.

| $n$ | $0$ | $1$ | $2$ | $3$ | $4$ | $5$ |
| --- | --- | --- | --- | --- | --- | --- |
| Linear $T_n$ | 1 | 2 | 3 | 5 | 8 | 13 |
| Circular $R_n$ | 1 | 1 | 3 | 4 | 7 | 11 |

A valid counter assignment either starts with $0$ and has an arbitrary valid tail of length $n-1$, or starts with $10$ and has a valid tail of length $n-2$. These families are disjoint and exhaustive for $n\ge2$. With $T_0=1$ and $T_1=2$, this gives $T_2=3$, $T_3=5$, $T_4=8$. The initial values equal $F_2,F_3$, and $T_n=T_{n-1}+T_{n-2}$ extends the identity $T_n=F_{n+2}$ by induction.

At a round table with $n\ge3$, fix the first seat. If it is empty, we can cut the circle there. Seats $2$ through $n$ now form a line and contribute $T_{n-1}$. If it is occupied, its two neighbors, seats $2$ and $n$, are forced empty. We have already fixed three places, and the remaining $n-3$ places form a line, so there are $T_{n-3}$ choices. Thus
$$
R_n=T_{n-1}+T_{n-3}=F_{n+1}+F_{n-1}.
$$
Two seats give $00,01,10$ and the same formula. With one seat the cyclic adjacency convention compares the lone position with itself, so only $0$ survives. This agrees with $F_2+F_0=1$. At $n=0$ there is one empty assignment. The circular Fibonacci formula applies from $n=1$ onward.
:::

::: practice Fibonacci prefix sums and three-step / multi-stride inductions
1. Conjecture a formula relating $\sum_{i=0}^n F_i$ to $F_{n+2}$ and prove it for all $n\in\mathbb N_0$ by induction.
2. Define $a_0=1$, $a_1=2$, $a_2=4$, and $a_{n+3}=a_{n+2}+a_{n+1}+a_n$ for $n\in\mathbb N_0$. Prove $a_n\le 2^n$ for all $n\in\mathbb N_0$.
3. Define $b_0=1$, and for $n\in\mathbb N_0$ let $b_{n+1}=2b_n$ when $5\mid(n+1)$ and $b_{n+1}=b_n+2$ otherwise. Find a closed form for $b_{5k+1}$ ($k\in\mathbb N_0$) and prove it by induction on $k$.
::: answer
**1. Fibonacci prefix sum.** Comparing $\sum_{i=0}^n F_i=0,1,2,4,7$ with $F_{n+2}=1,2,3,5,8$ gives the claim $\sum_{i=0}^n F_i=F_{n+2}-1$.
- **I.B. ($n=0$).** $\sum_{i=0}^0 F_i=F_0=0=1-1=F_2-1$.
- **I.S.** Fix $n\in\mathbb N_0$. **I.A.:** $\sum_{i=0}^n F_i=F_{n+2}-1$. **I.C.:** $\sum_{i=0}^{n+1} F_i=F_{n+3}-1$.
- **Proof of I.C.** Split off the last summand and apply the Fibonacci recurrence:
$$
\sum_{i=0}^{n+1}F_i=\left(\sum_{i=0}^n F_i\right)+F_{n+1}=(F_{n+2}-1)+F_{n+1}=F_{n+3}-1.
$$

**2. Three-step recurrence (three bases required).**
- **I.B.** At $n=0$, $a_0=1\le 2^0$; at $n=1$, $a_1=2\le 2^1$; at $n=2$, $a_2=4\le 2^2$. All three bases are needed before the first recursive step $a_3$.
- **I.S.** Fix $n\in\mathbb N_0$. **I.A.:** Assume $a_n\le 2^n$, $a_{n+1}\le 2^{n+1}$, and $a_{n+2}\le 2^{n+2}$. **I.C.:** $a_{n+3}\le 2^{n+3}$.
- **Proof of I.C.** Using all three assumptions,
$$
a_{n+3}=a_{n+2}+a_{n+1}+a_n\le 2^{n+2}+2^{n+1}+2^n=7\cdot 2^n\le 8\cdot 2^n=2^{n+3}.
$$

**3. Stride-five closed form.** Compute $b_1=3$, then $b_2=5,b_3=7,b_4=9$, $b_5=18$, and $b_6=20$. Across any block from $5k+1$ to $5k+6$, indices $5k+2,5k+3,5k+4$ are not divisible by $5$ (adding $6$ total), $5k+5$ is divisible by $5$ (doubling), and $5k+6$ is not divisible by $5$ (adding $2$):
$$
b_{5(k+1)+1}=b_{5k+6}=2(b_{5k+1}+6)+2=2b_{5k+1}+14.
$$
Claim: $b_{5k+1}=17\cdot 2^k-14$ for all $k\in\mathbb N_0$. **I.B. ($k=0$):** $b_1=3=17\cdot 2^0-14$. **I.S.:** Fix $k\in\mathbb N_0$ and assume $b_{5k+1}=17\cdot 2^k-14$. Then $b_{5(k+1)+1}=2(17\cdot 2^k-14)+14=17\cdot 2^{k+1}-14$.
:::

::: practice Alternating colours in doubled Hanoi
As in the doubled variant, start with $2n$ disks ($n\ge1$), two of each size, with the white disk initially above the red disk in every pair. Show that the stack can be moved from the left rod to the right rod in at most $2^{n+2}-5$ moves while ending again with white above red in every pair.
::: answer
Let $B_n$ be the minimum moves required. **I.B. ($n=1$):** Move white $L\to M$, red $L\to R$, and white $M\to R$ in $3=2^3-5$ moves.

**I.S.** Fix $n\ge1$ and assume $B_n\le 2^{n+2}-5$. For $n+1$ size pairs, execute five phases:
1. Move the top $2n$ disks $L\to R$ ignoring colour order in $2^{n+1}-2$ moves.
2. Move both largest disks $L\to M$ ($2$ moves; red now sits above white on $M$).
3. Reverse Phase 1 to return the $2n$ smaller disks $R\to L$ in $2^{n+1}-2$ moves, restoring their exact initial alternating colours.
4. Move both largest disks $M\to R$ ($2$ moves; white is back above red on $R$).
5. Move the $2n$ smaller disks $L\to R$ preserving colours in $B_n$ moves.

Using the induction assumption gives $B_{n+1}\le B_n+2(2^{n+1}-2)+4\le(2^{n+2}-5)+2^{n+2}=2^{n+3}-5$.
:::
