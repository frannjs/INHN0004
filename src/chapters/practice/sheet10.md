::: practice Two extended Euclidean tables
Tabulate the EEA for $(a,b)=(7387,8633)$ and $(233,377)$. Record $k=\lfloor b/a\rfloor$ and the coefficients $\alpha,\beta$ expressing the gcd as $\alpha a+\beta b$.
::: answer
For each table, first obtain the rows by reducing $(a,b)$ to $(b\bmod a,a)$. The first table stops at $(89,1157)$ because $1157=13\cdot89$ has remainder $0$. That row also gives us a place to start going back. The gcd is its first entry, so set $(\alpha,\beta)=(1,0)$ there and move upward with $(\beta'-k\alpha',\alpha')$.

| $a$ | $b$ | $k$ | $\alpha$ | $\beta$ |
|---|---|---|---|---|
| 7387 | 8633 | 1 | −7 | 6 |
| 1246 | 7387 | 5 | 6 | −1 |
| 1157 | 1246 | 1 | −1 | 1 |
| 89 | 1157 | 13 | 1 | 0 |

Check the first move up from the bottom. Since $1246-1157=89$, the row just above has coefficients $-1$ and $1$ in that order. Repeating the same move gives $-7\cdot7387+6\cdot8633=89$ in the first row.

| $a$ | $b$ | $k$ | $\alpha$ | $\beta$ |
|---|---|---|---|---|
| 233 | 377 | 1 | −144 | 89 |
| 144 | 233 | 1 | 89 | −55 |
| 89 | 144 | 1 | −55 | 34 |
| 55 | 89 | 1 | 34 | −21 |
| 34 | 55 | 1 | −21 | 13 |
| 21 | 34 | 1 | 13 | −8 |
| 13 | 21 | 1 | −8 | 5 |
| 8 | 13 | 1 | 5 | −3 |
| 5 | 8 | 1 | −3 | 2 |
| 3 | 5 | 1 | 2 | −1 |
| 2 | 3 | 1 | −1 | 1 |
| 1 | 2 | 2 | 1 | 0 |

Here the first row gives $-144\cdot233+89\cdot377=1$. The consecutive Fibonacci inputs explain the long sequence of quotient $1$: subtracting one number from the next leaves the previous one.
:::

::: practice Two large powers modulo 911
Find $987^{911}\bmod911$ and $987^{909}\bmod911$ by hand.
::: answer
Reduce the base to $76$. Look at the two exponents. One is just above $910$ and the other just below it. If the $910$th power is $1$, we can find both answers from that one calculation.

The modulus $911$ is prime by trial primes up to $29$. Multiplication by the unit $76$ permutes the $910$ nonzero remainders. Multiply the entries of that permuted list. The product equals the original product, and each entry contributes one extra factor of $76$. There are $910$ entries, so the new product is $76^{910}$ times the old one. Every factor is a unit, so cancel the product to get $76^{910}\equiv_{911}1$. Therefore the first answer is $76$, while the second is the inverse of $76$. Since $12\cdot76-911=1$, the second answer is $12$.

This argument is the multiplicative permutation proof of the prime-modulus period. Repeated squaring is another way to compute the residues without proving the period: keep each square reduced modulo $911$ and multiply the selected powers.
:::

::: practice Find every symmetry and build its operation table
On $[8]$, take the edges

$$
\begin{gathered}
\{2,5\},\{5,6\},\{6,7\},\\
\{7,1\},\{1,8\},\{8,5\}.
\end{gathered}
$$

Find all graph automorphisms in cycle notation and tabulate their composition. Is the group commutative?
::: answer
The isolated vertices $3,4$ may be swapped independently. The degree-three vertex $5$ and the degree-one vertex $2$ are unique and fixed. The connected component is the five-cycle $5,6,7,1,8,5$ plus the leaf $2$ at $5$. There are two ways to start tracing the image of the cycle from $5$. If $6$ stays fixed, the next vertex has to stay fixed too. If $6$ goes to $8$, the next vertex $7$ has to go to $1$, because the other neighbor of $8$ is $5$ and is already taken. Continue one step at a time to get the reflection $\tau=(1\,7)(6\,8)$.

Independently let $\sigma=(3\,4)$. Either choice on the cycle can be combined with either choice on the isolated vertices. The group consists of $e=\operatorname{Id}_{[8]},\tau,\sigma,\tau\circ\sigma=(1\,7)(3\,4)(6\,8)$.

Both swaps square to $e$, and their moved vertices are disjoint. Their products commute. The row is applied after the column.

| $\circ$ | $e$ | $\tau$ | $\sigma$ | $\tau\circ\sigma$ |
|---|---|---|---|---|
| $e$ | $e$ | $\tau$ | $\sigma$ | $\tau\circ\sigma$ |
| $\tau$ | $\tau$ | $e$ | $\tau\circ\sigma$ | $\sigma$ |
| $\sigma$ | $\sigma$ | $\tau\circ\sigma$ | $e$ | $\tau$ |
| $\tau\circ\sigma$ | $\tau\circ\sigma$ | $\sigma$ | $\tau$ | $e$ |

The symmetric table is another check of commutativity.
:::

::: practice Permutation powers, composite-modulus powers, and modular inverses
1. For $\pi=(1\,2\,3)(4\,5)\in\mathcal S_6$, compute $\pi^{787}$ and $\pi^{785}$ in cycle notation.
2. Compute $(264^3+449^{23})\bmod m$ by hand for $m\in\{22,23,24\}$.
3. Given $1383=3\cdot 461$ (both prime) and $a=860$, compute $\varphi(1383)$, find $a^{-1}\bmod 1383$ via the tabular EEA, and evaluate $860^{917}\bmod 1383$.
::: answer
**1.** Disjoint cycle lengths $3$ and $2$ give period $\operatorname{lcm}(3,2)=6$. Since $787=6\cdot131+1\equiv_6 1$, $\pi^{787}=\pi=(1\,2\,3)(4\,5)$. Since $785\equiv_6 5\equiv_6 -1$, $\pi^{785}=\pi^{-1}=(1\,3\,2)(4\,5)$.

**2.** Reduce the bases modulo each $m$ first:
- **Modulo $22$:** $264=12\cdot 22\equiv_{22}0$ and $449=20\cdot 22+9\equiv_{22}9$. Squaring gives $9^2=81\equiv_{22}15$, $9^3\equiv_{22}135\equiv_{22}3$, $9^4\equiv_{22}27\equiv_{22}5$, and $9^5\equiv_{22}45\equiv_{22}1$ (matching $\varphi(22)=10$). Thus $9^{23}=(9^5)^4\cdot 9^3\equiv_{22}3$, so the sum is $3$.
- **Modulo $23$:** $264=11\cdot 23+11\equiv_{23}11$ and $449=20\cdot 23-11\equiv_{23}12$. Here $11^3=121\cdot 11\equiv_{23}6\cdot 11=66\equiv_{23}-3$, while $23$ is prime ($\varphi(23)=22$), so $12^{23}\equiv_{23}12^1=12$. The sum is $(-3+12)\bmod 23=9$.
- **Modulo $24$:** $264=11\cdot 24\equiv_{24}0$ and $449=19\cdot 24-7\equiv_{24}17$. Since $17^2=289=12\cdot 24+1\equiv_{24}1$, odd powers of $17$ all leave $17$, so the sum is $17$.

**3.** By the totient product formula, $\varphi(1383)=1383(1-1/3)(1-1/461)=2\cdot 460=920$. Run the tabular EEA on $(860,1383)$:

| $a$ | $b$ | $k$ | $\alpha$ | $\beta$ |
|---|---|---|---|---|
| 860 | 1383 | 1 | 632 | −393 |
| 523 | 860 | 1 | −393 | 239 |
| 337 | 523 | 1 | 239 | −154 |
| 186 | 337 | 1 | −154 | 85 |
| 151 | 186 | 1 | 85 | −69 |
| 35 | 151 | 4 | −69 | 16 |
| 11 | 35 | 3 | 16 | −5 |
| 2 | 11 | 5 | −5 | 1 |
| 1 | 2 | 2 | 1 | 0 |

Thus $632\cdot 860-393\cdot 1383=1$, so $860^{-1}\equiv_{1383}632$. Since $\gcd(860,1383)=1$, $860^{920}\equiv_{1383}1$ and $917\equiv_{920}-3$, giving $860^{917}\equiv_{1383}632^3$. Now $632^2=399424=288\cdot 1383+1120\equiv_{1383}-263$, and $(-263)\cdot 632=-166216=-121\cdot 1383+1127\equiv_{1383}1127$.
:::
