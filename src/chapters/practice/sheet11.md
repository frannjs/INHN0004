::: practice The unit group modulo 42
Find the units and multiplication table modulo $42$. Find the inverse of $5$ using EEA, draw the Cayley graphs for $\{5\}$ and for a generating pair containing $5$, and determine every element order and the exponent.
::: answer
Since $42=2\cdot3\cdot7$, there are $42(1-1/2)(1-1/3)(1-1/7)=12$ units. The table headers list them all. For a table cell multiply the row and column values and reduce. The $11,19$ cell is $209\bmod42=41$, for example.

| $\cdot_{42}$ | 1 | 5 | 11 | 13 | 17 | 19 | 23 | 25 | 29 | 31 | 37 | 41 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 5 | 11 | 13 | 17 | 19 | 23 | 25 | 29 | 31 | 37 | 41 |
| 5 | 5 | 25 | 13 | 23 | 1 | 11 | 31 | 41 | 19 | 29 | 17 | 37 |
| 11 | 11 | 13 | 37 | 17 | 19 | 41 | 1 | 23 | 25 | 5 | 29 | 31 |
| 13 | 13 | 23 | 17 | 1 | 11 | 37 | 5 | 31 | 41 | 25 | 19 | 29 |
| 17 | 17 | 1 | 19 | 11 | 37 | 29 | 13 | 5 | 31 | 23 | 41 | 25 |
| 19 | 19 | 11 | 41 | 37 | 29 | 25 | 17 | 13 | 5 | 1 | 31 | 23 |
| 23 | 23 | 31 | 1 | 5 | 13 | 17 | 25 | 29 | 37 | 41 | 11 | 19 |
| 25 | 25 | 41 | 23 | 31 | 5 | 13 | 29 | 37 | 11 | 19 | 1 | 17 |
| 29 | 29 | 19 | 25 | 41 | 31 | 5 | 37 | 11 | 1 | 17 | 23 | 13 |
| 31 | 31 | 29 | 5 | 25 | 23 | 1 | 41 | 19 | 17 | 37 | 13 | 11 |
| 37 | 37 | 17 | 29 | 19 | 41 | 31 | 11 | 1 | 23 | 13 | 25 | 5 |
| 41 | 41 | 37 | 31 | 29 | 25 | 23 | 19 | 17 | 13 | 11 | 5 | 1 |

For the inverse, $42=8\cdot5+2$ and $5=2\cdot2+1$. Hence $1=5-2(42-8\cdot5)=17\cdot5-2\cdot42$. Thus $5^{-1}=17$ in this group.

In the graph for $\{5\}$ draw these two oriented cycles, with each row wrapping from its last node back to its first.

| Label | Cycle order |
|---|---|
| $5$ | $1,5,25,41,37,17$ |
| $5$ | $11,13,23,31,29,19$ |

Put the two cycles one above the other. The first row is $\langle5\rangle$, and any further step labeled $5$ keeps us in that row. We need an edge that leaves it. Multiplication by $11$ takes $1$ straight into the second cycle, so the two labels together make the graph connected and generate the group.

Every $11$-arrow switches rows. To fill in all of those arrows, draw the directed cycles $(1,11,37,29,25,23)$ and $(5,13,17,19,41,31)$ in a second color.

| $x$ | Powers from $1$ up to first return | $\operatorname{ord}(x)$ |
|---|---|---|
| 1 | 1 | 1 |
| 5 | 1, 5, 25, 41, 37, 17 | 6 |
| 11 | 1, 11, 37, 29, 25, 23 | 6 |
| 13 | 1, 13 | 2 |
| 17 | 1, 17, 37, 41, 25, 5 | 6 |
| 19 | 1, 19, 25, 13, 37, 31 | 6 |
| 23 | 1, 23, 25, 29, 37, 11 | 6 |
| 25 | 1, 25, 37 | 3 |
| 29 | 1, 29 | 2 |
| 31 | 1, 31, 37, 13, 25, 19 | 6 |
| 37 | 1, 37, 25 | 3 |
| 41 | 1, 41 | 2 |

Take the least common multiple of the last column to get $\lambda_{\mathbb Z_{42}^*}=6$. Checking $5^6=1$ alone only proves that $6$ is a period of $5$. The remaining rows prove it is a period of the whole group, and the first return for $5$ proves minimality.
:::

::: practice Smallest generating sets modulo 24 and 15
For each unit group modulo $24$ and $15$, determine the cyclic subgroup of each element, the group exponent and a smallest generating set. Specify the Cayley edges and the operation table.
::: answer
For modulus $24$, each nonidentity element $x$ squares to $1$, so its subgroup is $\{1,x\}$. The subgroup of $1$ is $\{1\}$, and the exponent of the whole group is $2$. Suppose we pick just two labels $a,b$. In any product we can group the copies of $a$ and the copies of $b$ because multiplication commutes. Each pair of equal factors cancels to $1$. Only the four products $1,a,b,ab$ can remain, so two labels cannot reach all eight units.

Try $\{5,7,13\}$. The two labels $5,7$ give $1,5,7,11$. Multiplying those by $13$ gives $13,17,19,23$. So the three labels reach every unit. Draw a cube whose vertices are the triples of choices of whether to include each label. An edge labeled by $5$ changes just the choice for $5$, and similarly for the other labels. Draw both directions, since a second step with the same label takes you back.

| $\cdot_{24}$ | 1 | 5 | 7 | 11 | 13 | 17 | 19 | 23 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 5 | 7 | 11 | 13 | 17 | 19 | 23 |
| 5 | 5 | 1 | 11 | 7 | 17 | 13 | 23 | 19 |
| 7 | 7 | 11 | 1 | 5 | 19 | 23 | 13 | 17 |
| 11 | 11 | 7 | 5 | 1 | 23 | 19 | 17 | 13 |
| 13 | 13 | 17 | 19 | 23 | 1 | 5 | 7 | 11 |
| 17 | 17 | 13 | 23 | 19 | 5 | 1 | 11 | 7 |
| 19 | 19 | 23 | 13 | 17 | 7 | 11 | 1 | 5 |
| 23 | 23 | 19 | 17 | 13 | 11 | 7 | 5 | 1 |

For modulus $15$, the power rows give all cyclic subgroups and orders.

| $x$ | Powers from $1$ up to first return | $\operatorname{ord}(x)$ |
|---|---|---|
| 1 | 1 | 1 |
| 2 | 1, 2, 4, 8 | 4 |
| 4 | 1, 4 | 2 |
| 7 | 1, 7, 4, 13 | 4 |
| 8 | 1, 8, 4, 2 | 4 |
| 11 | 1, 11 | 2 |
| 13 | 1, 13, 4, 7 | 4 |
| 14 | 1, 14 | 2 |

The exponent is $4$, so one element cannot generate a group of order $8$. The pair $\{2,7\}$ works. The $2$-arrows give the directed cycles $(1,2,4,8)$ and $(7,14,13,11)$. The $7$-arrows give cycles $(1,7,4,13)$ and $(2,14,8,11)$. The first $7$-arrow bridges the two $2$-cycles. The table is:

| $\cdot_{15}$ | 1 | 2 | 4 | 7 | 8 | 11 | 13 | 14 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 2 | 4 | 7 | 8 | 11 | 13 | 14 |
| 2 | 2 | 4 | 8 | 14 | 1 | 7 | 11 | 13 |
| 4 | 4 | 8 | 1 | 13 | 2 | 14 | 7 | 11 |
| 7 | 7 | 14 | 13 | 4 | 11 | 2 | 1 | 8 |
| 8 | 8 | 1 | 2 | 11 | 4 | 13 | 14 | 7 |
| 11 | 11 | 7 | 14 | 2 | 13 | 1 | 8 | 4 |
| 13 | 13 | 11 | 7 | 1 | 14 | 8 | 4 | 2 |
| 14 | 14 | 13 | 11 | 8 | 7 | 4 | 2 | 1 |
:::

::: practice Draw the Cayley graph modulo 16
Specify all edges of $\Gamma(\mathbb Z_{16}^*,\{3,7\})$.
::: answer
Draw two directed four-cycles $(1,3,9,11)$ and $(7,5,15,13)$ with the label $3$. Check the order in the second row: $7\cdot3\equiv_{16}5$, then $5\cdot3\equiv_{16}15$. Draw pairs with both directions for label $7$: $1$ with $7$, $3$ with $5$, $9$ with $15$, and $11$ with $13$. They line up in the same order on the two rows because multiplications by $3$ and $7$ commute.
:::

::: practice Four modular calculations
Find $\varphi(94743)$, evaluate $17445^{16434}+14335^{13146}\bmod107$, invert $149$ modulo $4087$ with EEA, and solve $5x+7y\equiv_{29}11$, $13x+3y\equiv_{29}2$.
::: answer
The factorization is $94743=3^3\cdot11^2\cdot29$. Use each distinct prime once in the totient formula. The result is $94743(1-1/3)(1-1/11)(1-1/29)=55440$.

Modulo the prime $107$ the bases have remainders $4$ and $104$, both nonzero. Fermat gives period $106$ for both. The exponents reduce to $4$ and $2$. The sum becomes $4^4+(-3)^2=265\equiv_{107}51$.

| $a$ | $b$ | $k$ | $\alpha$ | $\beta$ |
|---|---|---|---|---|
| 149 | 4087 | 27 | −192 | 7 |
| 64 | 149 | 2 | 7 | −3 |
| 21 | 64 | 3 | −3 | 1 |
| 1 | 21 | 21 | 1 | 0 |

The first row gives $-192\cdot149+7\cdot4087=1$, so the standard inverse is $3895$.

For the system, multiply the first congruence by $6$, since $5\cdot6\equiv_{29}1$. It becomes $x+13y\equiv_{29}8$. Substitute $x\equiv_{29}8-13y$ in the second equation to get $17+8y\equiv_{29}2$. The inverse of $8$ is $11$ modulo $29$, so $y\equiv_{29}11(-15)\equiv_{29}9$ and $x\equiv_{29}8-13\cdot9\equiv_{29}7$. Check: $35+63=98\equiv_{29}11$ and $91+27=118\equiv_{29}2$. Each step was reversible, which proves uniqueness.
:::

::: practice Element orders modulo 89, power towers, and group isomorphism tests
1. In $\mathbb Z_{89}^*$ ($89$ is prime), find $\operatorname{ord}(3)$ and $\operatorname{ord}(5)$, construct an element of order $22$, and decide whether an element of order $12$ exists.
2. Evaluate the power tower $19584^{(17499^{5566})}\bmod 107$ ($107$ is prime), and find $d\in\mathbb N$ such that $(x^3)^d\equiv_{319}x$ for all $x\in\mathbb Z_{319}^*$ ($319=11\cdot 29$).
3. Classify which groups are isomorphic: (i) among $\mathbb Z_{15}^*,\mathbb Z_{16}^*,\mathbb Z_{24}^*$, and (ii) among $\mathbb Z_{3623}^*,\mathbb Z_{7246}^*,\mathbb Z_{3622}^*,\mathbb Z_{3622},\mathbb Z_{3623}$ (given $1811,3623\in\mathbb P$).
::: answer
**1. Prime-divisor order test in $\mathbb Z_{89}^*$.** Here $|\mathbb Z_{89}^*|=88=2^3\cdot 11$, with prime divisors $2$ and $11$.
- For $3$: $3^4=81\equiv_{89}-8$, so $3^{88/11}=3^8\equiv_{89}64\ne1$. Next, $3^{88/2}=3^{44}=(-8)^{11}=-2^{33}=-(2^{10})^3\cdot 8\equiv_{89}-(45)^3\cdot 8$; since $45^2=2025=22\cdot 89+67\equiv_{89}-22$, we get $-(-22)\cdot 45\cdot 8=7920=89\cdot 89-1\equiv_{89}-1\ne 1$. Neither prime quotient hits $1$, so $\operatorname{ord}(3)=88$ ($3$ is a primitive root).
- For $5$: $5^4=625=7\cdot 89+2\equiv_{89}2$, so $5^8\equiv_{89}4\ne 1$, while $5^{44}=(5^4)^{11}\equiv_{89}2^{11}=2048=23\cdot 89+1\equiv_{89}1$. Thus $\operatorname{ord}(5)\mid 44$ and $\operatorname{ord}(5)\nmid 8$, leaving $\{11,22,44\}$. Checking $5^{22}=(5^4)^5\cdot 25\equiv_{89}32\cdot 25=800=9\cdot 89-1\equiv_{89}-1\ne 1$ forces $\operatorname{ord}(5)=44$.
- Order $22$: since $\operatorname{ord}(3)=88$, $3^{88/22}=3^4=81$ has order $88/\gcd(88,4)=22$. Order $12$ is impossible by Lagrange's theorem because $12\nmid 88$.

**2. Power tower and RSA-style exponent inverse.**
- Reduce the base modulo $107$: $19584=183\cdot 107+3\equiv_{107}3\in\mathbb Z_{107}^*$. By Fermat, reduce the exponent modulo $\varphi(107)=106$: $17499=165\cdot 106+9\equiv_{106}9$. Since $\gcd(9,106)=1$, apply Euler a second time inside $\mathbb Z_{106}^*$ with $\varphi(106)=\varphi(2)\varphi(53)=52$: $5566=107\cdot 52+2\equiv_{52}2$, so $17499^{5566}\equiv_{106}9^2=81$. Finally evaluate $3^{81}\bmod 107$: $3^5=243\equiv_{107}29$, $3^{10}\equiv_{107}841\equiv_{107}-15$, $3^{20}\equiv_{107}225\equiv_{107}11$, $3^{40}\equiv_{107}121\equiv_{107}14$, $3^{80}\equiv_{107}196\equiv_{107}89\equiv_{107}-18$, so $3^{81}\equiv_{107}-54\equiv_{107}53$.
- Modulo $319=11\cdot 29$, $\varphi(319)=10\cdot 28=280$. Choosing $3d\equiv_{280}1$ ensures $x^{3d}\equiv_{319}x$ for all $x\in\mathbb Z_{319}^*$. Since $280=93\cdot 3+1$, $(-93)\cdot 3+1\cdot 280=1$, giving $d=(-93)\bmod 280=187$.

**3. Isomorphism classification.**
- (i) All three have order $8$, but $\lambda(\mathbb Z_{24}^*)=2$ whereas $\mathbb Z_{15}^*\cong\mathbb Z_4\times\mathbb Z_2$ and $\mathbb Z_{16}^*=\langle 3\rangle\cdot\langle 7\rangle\cong\mathbb Z_4\times\mathbb Z_2$ both have exponent $4$. Thus $\mathbb Z_{15}^*\cong\mathbb Z_{16}^*\not\cong\mathbb Z_{24}^*$, with explicit isomorphism $h(2^i\cdot_{15}11^j)=3^i\cdot_{16}7^j$ ($i\in\mathbb Z_4,j\in\mathbb Z_2$).
- (ii) Since $3623\in\mathbb P$ is an odd prime and $7246=2\cdot 3623$, Gauss's primitive-root theorem makes both $\mathbb Z_{3623}^*$ and $\mathbb Z_{7246}^*$ **cyclic** of order $\varphi(3623)=\varphi(7246)=3622$, matching additive $(\mathbb Z_{3622},+_{3622},0)$: thus $\mathbb Z_{3623}^*\cong\mathbb Z_{7246}^*\cong\mathbb Z_{3622}$. Meanwhile $|\mathbb Z_{3622}^*|=\varphi(2\cdot 1811)=1810$ and $|\mathbb Z_{3623}|=3623$, so those two orders match nothing else.
:::

::: practice Read inverses and non-abelian products from a 12-node Cayley graph
Let $(G,\odot,1)$ on $[12]$ have right-multiplication Cayley graph $\Gamma(G,\{2,7\})$ whose red $2$-edges form the two directed $6$-cycles $(1\to2\to3\to4\to5\to6\to1)$ and $(7\to8\to9\to10\to11\to12\to7)$, and whose blue $7$-edges form the three directed $4$-cycles $(1\to7\to4\to10\to1)$, $(2\to12\to5\to9\to2)$, and $(3\to11\to6\to8\to3)$. Find $6^{-1}$, compute $6\odot 8$ and $8\odot 6$, and decide whether $G$ is abelian or cyclic.
::: answer
Remember that an edge $u\xrightarrow{g}v$ means $v=u\odot g$:
- **Inverse of $6$:** The red $2$-edge $6\to 1$ says $6\odot 2=1$. Starting at $1$ and taking one red $2$-step lands at $2$, so $6^{-1}=2$ (and $6=2^{-1}$).
- **Generator word for $8$:** From $1$, one blue $7$-step reaches $7$, and one red $2$-step reaches $8$, so $8=7\odot 2$.
- **Compute $6\odot 8$:** Start at $6$ and follow $8$'s word $(7,\text{ then }2)$: the blue $7$-arrow leaves $6\to 8$, and the red $2$-arrow leaves $8\to 9$. Hence $6\odot 8=9$.
- **Compute $8\odot 6$:** Since $6=2^{-1}$ (or $6=2^5$), start at $8$ and step **backward** along the red $2$-arrow $7\to 8$ (equivalently, take five red steps forward $8\to9\to10\to11\to12\to7$). Hence $8\odot 6=7$.

Because $6\odot 8=9\ne 7=8\odot 6$, $G$ is **non-abelian** and therefore **not cyclic**.
:::

::: practice Four-modulus CRT, 16 modular square roots, and composite-modulus powers
1. Find all $x\in\mathbb Z$ satisfying $x\equiv_{10}9$, $x\equiv_9 4$, $x\equiv_7 6$, and $x\equiv_{11}5$.
2. Find the number of solutions (and the formula generating all of them) for $x^2\equiv_{6930}1$ in $\mathbb Z_{6930}^*$, where $6930=10\cdot 9\cdot 7\cdot 11$.
3. Evaluate $(34^{222}+25^{178})\bmod 391$, given $391=17\cdot 23$.
::: answer
**1. Pairwise CRT merge.** The moduli $10,9,7,11$ are pairwise coprime with product $90\cdot 77=6930$:
- Merge $x\equiv_{10}9$ and $x\equiv_9 4$: from $1\cdot 10+(-1)\cdot 9=1$, $x\equiv_{90}9(-9)+4(10)=-41\equiv_{90}49$.
- Merge $x\equiv_7 6$ and $x\equiv_{11}5$: EEA gives $(-3)\cdot 7+2\cdot 11=1$, so $x\equiv_{77}6(22)+5(-21)=27$.
- Merge $x\equiv_{90}49$ and $x\equiv_{77}27$: EEA on $(77,90)$ ($90=1\cdot 77+13$, $77=5\cdot 13+12$, $13=1\cdot 12+1$) gives $6\cdot 90+(-7)\cdot 77=540-539=1$. Hence
$$
x\equiv_{6930}49(-539)+27(540)=-11831=-2\cdot 6930+2029\equiv_{6930}2029,
$$
giving solution set $2029+6930\mathbb Z$.

**2. Square roots of $1$ in $\mathbb Z_{6930}^*$.** By CRT on unit groups, $\mathbb Z_{6930}^*\cong\mathbb Z_{10}^*\times\mathbb Z_9^*\times\mathbb Z_7^*\times\mathbb Z_{11}^*$. All four factors are cyclic of even orders $4,6,6,10$ (since $10=2\cdot 5,9=3^2,7,11$), so $u^2=1$ has **exactly two** solutions $\pm1$ in each factor! That gives $2^4=16$ square roots, reconstructed by plugging every $(s,t,u,v)\in\{\pm1\}^4$ into
$$
h^{-1}(s,t,u,v)=\bigl(-539((-9s+10t)\bmod 90)+540((22u-21v)\bmod 77)\bigr)\bmod 6930,
$$
yielding $\{1,881,1079,1189,1891,2771,2969,3079,3851,3961,4159,5039,5741,5851,6049,6929\}$.

**3. Composite-modulus power when a base is NOT coprime to $N$.** Notice $34=2\cdot 17$ is **not** a unit modulo $391=17\cdot 23$, so Euler's theorem modulo $391$ does not apply to $34^{222}$! Instead split modulo $17$ and modulo $23$ via CRT:
- **Modulo $17$:** $34\equiv_{17}0\implies 34^{222}\equiv_{17}0$. For $25\equiv_{17}8$, Fermat gives period $16$; $178=11\cdot 16+2$, so $25^{178}\equiv_{17}8^2=64\equiv_{17}13$. Sum $\equiv_{17}13$.
- **Modulo $23$:** $34\equiv_{23}11$ and $25\equiv_{23}2$. Fermat gives period $22$: $222=10\cdot 22+2$ and $178=8\cdot 22+2$, so $11^2+2^2=125=5\cdot 23+10\equiv_{23}10$.
- **Reconstruct modulo $391$:** From $4\cdot 17+(-3)\cdot 23=68-69=-1$, we have $(-4)\cdot 17+3\cdot 23=1$. Thus $x\equiv_{391}13(69)+10(-68)=897-680=217$.
:::
