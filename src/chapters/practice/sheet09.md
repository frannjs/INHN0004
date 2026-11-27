::: practice Primes, the sieve, and a product plus one
Prove the square-root primality test for $n\ge2$. Bound the number of distinct prime factors of $n$ by $\log_2 n$. Use the sieve to find the primes through $30$. Then test $1+\prod_{i=1}^kp_i$ for the first ten primes $p_i$ and $k=1,\ldots,10$. Finally, prove that every integer above $1$ has a prime divisor.
::: answer
If $n=ab$ is composite, at least one factor, say $a$, has $1<a\le\sqrt n$. A prime dividing $a$ divides $n$. Conversely, a prime divisor no larger than $\sqrt n<n$ is a proper divisor of $n$. To obtain the required prime divisor, choose the smallest divisor of $a$ greater than $1$. A proper factor of that divisor would be a smaller divisor of $a$. The same argument works for every $n>1$. The square-root test needs the stated lower bound since $1$ has no prime divisors.

If there are $k$ distinct prime divisors, take one copy of each. Their product divides $n$ by unique factorization, so it is at most $n$. Each prime contributes a factor of at least $2$, so their product is at least $2^k$. Now $2^k\le n$ gives $k\le\log_2 n$.

Start with all candidates from $2$ to $30$. Record $2$ and remove its multiples, then do the same for $3$ and $5$. At this point no composite can remain because it would have a prime divisor at most $\sqrt{30}<6$. The recorded and remaining primes together are $2,3,5,7,11,13,17,19,23,29$. In a sieve using the least remaining candidate at every step, each least candidate is prime. Otherwise it would have been removed with its smaller prime factor.

| $k$ | $1+\prod_{i=1}^k p_i$ | Certificate |
|---|---|---|
| 1 | 3 | Prime |
| 2 | 7 | Prime |
| 3 | 31 | Prime |
| 4 | 211 | Prime |
| 5 | 2311 | Prime |
| 6 | 30031 | $59\cdot509$ |
| 7 | 510511 | $19\cdot97\cdot277$ |
| 8 | 9699691 | $347\cdot27953$ |
| 9 | 223092871 | $317\cdot703763$ |
| 10 | 6469693231 | $331\cdot571\cdot34231$ |

For the prime rows, use the sieve to supply trial primes up to the square root of the candidate. For the last prime row the largest trial prime is $47$. None divides $2311$. For the composite rows multiplication checks the certificate directly.

Pause at row 6. The candidate is composite, and both of its prime factors are outside the list we multiplied. The argument needs exactly that. Adding one excludes the primes in the product, leaving any prime factor of the candidate as a new one.
:::
