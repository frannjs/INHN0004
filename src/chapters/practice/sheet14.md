::: practice Three rules about clause sets
- Take $C_1,C_2\in F$ and two distinct literals $L_1,L_2\in C_1$ with $\overline L_1,\overline L_2\in C_2$. Let $R$ be the union of the two clauses after removing those four occurrences. Give a counterexample to $F\equiv F\cup\{R\}$.
- Suppose $L$ occurs somewhere in $F$ and $\overline L$ occurs nowhere in $F$. Prove that $L$ can be true in some model whenever $F$ is satisfiable.
- Suppose $C$ contains both $L$ and $\overline L$. Prove that $F$ and $F\setminus\{C\}$ are unsatisfiable under the same conditions.
::: answer
Take $F=\{\{p,q\},\{\neg p,\neg q\}\}$. Both clauses are satisfied by $p=1,q=0$. Removing both complementary pairs would give $\varnothing$ as a new clause. Adding this clause makes the set contradictory, so the proposed two-pivot rule changes its meaning.

For purity, start with any satisfying assignment. If $L$ is true already, keep it. If it is false, flip its variable. All clauses containing $L$ are now true. The dual literal $\overline L$ occurs nowhere, so a clause with neither sign is unchanged. Thus the new assignment still satisfies every clause.

Finally, any assignment makes one of $L,\overline L$ true. The clause containing both is therefore true under all assignments. Every model of the smaller set is automatically a model of the original, and every model of the original already satisfies the smaller set. So both are satisfiable together and unsatisfiable together.
:::

::: practice Build a refutation from parent clauses
Refute the clause set
$$
\begin{aligned}
\{\,&\{s,t,\neg u\},\{s,u\},\{s,\neg u,x\},\{\neg s,t,u\},\{\neg s,t,\neg u\},\\
&\{\neg s,\neg u,\neg x\},\{\neg t,u\},\{\neg t,\neg u,x\},\{\neg t,\neg x\}\,\}.
\end{aligned}
$$
Draw the deduction graph so each resolvent has arrows from its two parents. Then find a proof in which each resolution step uses a positive parent clause, meaning one with only positive literals.
::: answer
Start with the two clauses containing opposite signs of $x$ that both have $\neg t$. Resolving on $x$ keeps that shared literal and leaves $\neg u$ beside it. Now the clause containing $u$ and $\neg t$ lets us finish that side. We can use the same idea on the clauses carrying $t$ and meet at the last step. Draw the two arrows from the listed parents for each row.

| Parents | Pivot | Child |
|---|---|---|
| $\{\neg t,\neg u,x\}$, $\{\neg t,\neg x\}$ | $x$ | $\{\neg t,\neg u\}$ |
| $\{\neg t,u\}$, $\{\neg t,\neg u\}$ | $u$ | $\{\neg t\}$ |
| $\{\neg s,t,u\}$, $\{\neg s,t,\neg u\}$ | $u$ | $\{\neg s,t\}$ |
| $\{s,u\}$, $\{s,t,\neg u\}$ | $u$ | $\{s,t\}$ |
| $\{\neg s,t\}$, $\{s,t\}$ | $s$ | $\{t\}$ |
| $\{t\}$, $\{\neg t\}$ | $t$ | $\varnothing$ |

For the positive-parent constraint, start with $\{s,u\}$ and use $u$ as the first pivot. The result $\{s,t\}$ is positive too, so we can use it twice, once to keep $u$ next to $t$ and once to keep $\neg u$ next to $t$. Those two clauses are enough to force $\{t\}$. In each row find the positive parent before choosing the pivot.

| Positive parent | Other parent | Pivot | Child |
|---|---|---|---|
| $\{s,u\}$ | $\{s,t,\neg u\}$ | $u$ | $\{s,t\}$ |
| $\{s,t\}$ | $\{\neg s,t,u\}$ | $s$ | $\{t,u\}$ |
| $\{s,t\}$ | $\{\neg s,t,\neg u\}$ | $s$ | $\{t,\neg u\}$ |
| $\{t,u\}$ | $\{t,\neg u\}$ | $u$ | $\{t\}$ |
| $\{t\}$ | $\{\neg t,u\}$ | $t$ | $\{u\}$ |
| $\{t\}$ | $\{\neg t,\neg u,x\}$ | $t$ | $\{\neg u,x\}$ |
| $\{u\}$ | $\{\neg u,x\}$ | $u$ | $\{x\}$ |
| $\{x\}$ | $\{\neg t,\neg x\}$ | $x$ | $\{\neg t\}$ |
| $\{t\}$ | $\{\neg t\}$ | $t$ | $\varnothing$ |

The final empty clause is a contradiction certificate in either proof. We use exactly one opposing pair in each row, even if the displayed parents happen to contain other opposing pairs.
:::

::: practice Horn positive-unit propagation and reverse-engineering a resolution DAG
1. Decide satisfiability of the Horn clause set $\mathcal K=\{\{\neg s,t,\neg u\},\{s\},\{u\},\{s,\neg u,\neg x\},\{\neg s,\neg u,\neg x\},\{\neg t,u\},\{\neg t,\neg u,x\},\{\neg t,\neg x\}\}$ by applying OLR **only** to positive unit clauses (choosing the lexicographically least positive unit at each step).
2. Construct four input clauses $C_1,C_2,C_3,C_4$ and four resolvents $R_1,R_2,R_3,R_4$ with parent pairs $(C_2,C_3)\to R_1$, $(C_3,C_4)\to R_2$, $(C_1,R_1)\to R_3$, $(R_1,R_2)\to R_4$, and $(R_3,R_4)\to\varnothing$ so that every step is a valid single-pivot resolution.
::: answer
**1. Positive-unit OLR trace.**
- Start: positive units are $\{s\}$ and $\{u\}$; pick $s$: remove $\{s\}$ and $\{s,\neg u,\neg x\}$, strip $\neg s$ to get $\{\{t,\neg u\},\{u\},\{\neg u,\neg x\},\{\neg t,u\},\{\neg t,\neg u,x\},\{\neg t,\neg x\}\}$.
- Pick positive unit $\{u\}$: remove $\{u\}$ and $\{\neg t,u\}$, strip $\neg u$ to get $\{\{t\},\{\neg x\},\{\neg t,x\},\{\neg t,\neg x\}\}$.
- Pick positive unit $\{t\}$: remove $\{t\}$, strip $\neg t$ to get $\{\{\neg x\},\{x\}\}$.
- Pick positive unit $\{x\}$: strip $\neg x$ from $\{\neg x\}$ to obtain $\{\varnothing\}$ — **unsatisfiable**.

**2. Bottom-up construction of the resolution DAG.** Work upward from $\varnothing$:
- To resolve $(R_3,R_4)\to\varnothing$, set $R_3=\{A\}$ and $R_4=\{\neg A\}$.
- To get $R_3=\{A\}$ from $(C_1,R_1)$ and $R_4=\{\neg A\}$ from $(R_1,R_2)$, give $R_1=\{B\}$ so $C_1=\{A,\neg B\}$ and $R_2=\{\neg A,\neg B\}$.
- To get $R_1=\{B\}$ from $(C_2,C_3)$ and $R_2=\{\neg A,\neg B\}$ from $(C_3,C_4)$, let $C_3=\{C\}$ be the shared positive unit, forcing $C_2=\{B,\neg C\}$ and $C_4=\{\neg A,\neg B,\neg C\}$.
Every node resolves on a single pivot ($C,C,B,B,A$ in order) to reach $\varnothing$.
:::

::: practice Wolf, goat, cabbage and Dreadbury Mansion via SAT and resolution
1. Encode the river-crossing reachability puzzle using variables $S_{m,w,g,c}$ ($m,w,g,c\in\{\ell,r\}$): initial fact $F_0=\{S_{\ell,\ell,\ell,\ell}\}$, Horn transition clauses $F_1$ that never depart from a state where the wolf eats the goat ($w=g\ne m$) or the goat eats the cabbage ($g=c\ne m$), and goal refutation $\{\neg S_{r,r,r,r}\}$. Deduce $\varnothing$ by unit resolution and read off the crossing plan.
2. Refute the Dreadbury Mansion uniqueness clause set
$$
\{\{H_{a,a}\},\{H_{a,c}\},\{H_{b,b},R_{b,a}\},\{H_{c,a},\neg M_c\},\{\neg H_{a,a},H_{b,a}\},\{\neg H_{a,c},H_{b,c}\},\{\neg H_{a,a},\neg H_{c,a}\},\{\neg H_{b,a},\neg H_{b,b},\neg H_{b,c}\},\{\neg M_b,\neg R_{b,a}\},\{M_a,M_b,M_c\},\{\neg M_a,M_b,M_c\}\}
$$
by resolution, and explain why refuting this set (which includes $\{\neg M_a,M_b,M_c\}$, i.e. $M_a\to(M_b\lor M_c)$) proves Agatha is the **unique** murderer once $M_a$ is known to be satisfiable.
::: answer
**1. River crossing as Horn resolution.** Keep all binary move clauses $\{\neg S_{s,w,g,c},S_{t,w',g',c'}\}$ ($\{s,t\}=\{\ell,r\}$, at most one passenger changes bank with $m$) whose source $(s,w,g,c)$ satisfies $(w=g\Rightarrow m=g)\land(g=c\Rightarrow m=g)$. Resolving positive units forward from $\{S_{\ell,\ell,\ell,\ell}\}$ yields the $7$-trip plan:
1. $\{S_{r,\ell,r,\ell}\}$ (man takes goat $\ell\to r$),
2. $\{S_{\ell,\ell,r,\ell}\}$ (man returns alone $r\to\ell$),
3. $\{S_{r,r,r,\ell}\}$ (man takes wolf $\ell\to r$),
4. $\{S_{\ell,r,\ell,\ell}\}$ (man brings goat back $r\to\ell$),
5. $\{S_{r,r,\ell,r}\}$ (man takes cabbage $\ell\to r$),
6. $\{S_{\ell,r,\ell,r}\}$ (man returns alone $r\to\ell$),
7. $\{S_{r,r,r,r}\}$ (man takes goat $\ell\to r$), which resolves with $\{\neg S_{r,r,r,r}\}$ to $\varnothing$.

**2. Dreadbury Mansion refutation.**
1. Resolve $\{H_{a,a}\}$ with $\{\neg H_{a,a},H_{b,a}\}\to\{H_{b,a}\}$, and $\{H_{a,c}\}$ with $\{\neg H_{a,c},H_{b,c}\}\to\{H_{b,c}\}$.
2. Resolve $\{H_{b,a}\}$ and $\{H_{b,c}\}$ into $\{\neg H_{b,a},\neg H_{b,b},\neg H_{b,c}\}\to\{\neg H_{b,b}\}$.
3. Resolve $\{\neg H_{b,b}\}$ with $\{H_{b,b},R_{b,a}\}\to\{R_{b,a}\}$, then with $\{\neg M_b,\neg R_{b,a}\}\to\{\neg M_b\}$.
4. Resolve $\{H_{a,a}\}$ with $\{\neg H_{a,a},\neg H_{c,a}\}\to\{\neg H_{c,a}\}$, then with $\{H_{c,a},\neg M_c\}\to\{\neg M_c\}$.
5. Resolve $\{M_a,M_b,M_c\}$ with $\{\neg M_a,M_b,M_c\}$ on $M_a\to\{M_b,M_c\}$, then resolve with $\{\neg M_b\}$ and $\{\neg M_c\}$ to get $\varnothing$.

Why this proves uniqueness: adding $\neg M_a\lor M_b\lor M_c$ (or directly $\neg M_b$ and $\neg M_c$ derived from the premises!) makes the premises plus "someone other than Agatha is a murderer" ($M_b\lor M_c$) unsatisfiable, forcing $M_b=M_c=0$ and $M_a=1$ in every model.
:::
