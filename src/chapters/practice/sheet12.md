::: practice Six syntax trees, truth tables, and KV maps
For each formula, draw the syntax tree and compute a short-circuit truth table and a KV map. Classify the formula and identify the equivalent pairs.

$F_1=(((p \land  (\neg q \land  s)) \lor  ((p \land  \neg q) \land  \neg s)) \lor  (r \land  (\neg p \lor  q)))$

$F_2=(((a \to  (p \to  q)) \land  (a \to  (q \to  r))) \to  (a \to  (p \to  r)))$

$F_3=(((a \to  (p \to  q)) \land  (a \to  (p \to  \neg q))) \to  (a \to  \neg p))$

$F_4=(p \to  (q \to  r))$

$F_5=((p \to  q) \to  r)$

$F_6=((p \to  (q \to  r)) \oplus  ((p \land  q) \to  r))$
::: answer
The tree labels below include the binary addresses. In the truth table, values under each connective refer to that occurrence. The root value gives the result. A star marks a skipped connective. Every descendant only needed by that skipped connective is skipped as well. Assignment values remain at the left. For code, evaluate the left operand first. Implement implication by returning $1$ immediately if that operand is $0$, and evaluating the right operand otherwise. For biconditional and exclusive-or, compare both values for equality and inequality respectively.

**Formula 1.** Keep $p$ and $q$ fixed and change $s$ from true to false. If $p\land\neg q$ is true, the first branch gives way to the second, so the left disjunction stays true. If $p\land\neg q$ is false, both branches fail for either value of $s$. Let $U=p\land\neg q$. The left disjunction is $U$ either way, so $F_1\equiv U\lor(r\land\neg U)\equiv U\lor r$. When we reach the KV map, the cells that differ in $s$ alone should agree.

```text
∨  ε
├─ ∨  0
│  ├─ ∧  00
│  │  ├─ p  000
│  │  └─ ∧  001
│  │     ├─ ¬  0010
│  │     │  └─ q  00100
│  │     └─ s  0011
│  └─ ∧  01
│     ├─ ∧  010
│     │  ├─ p  0100
│     │  └─ ¬  0101
│     │     └─ q  01010
│     └─ ¬  011
│        └─ s  0110
└─ ∧  1
   ├─ r  10
   └─ ∨  11
      ├─ ¬  110
      │  └─ p  1100
      └─ q  111
```

```text
p q r s  (((p ∧ (¬q ∧ s)) ∨ ((p ∧ ¬q) ∧ ¬s)) ∨ (r ∧ (¬p ∨ q)))
0 0 0 0       0  *  *     0     0 *   0 *    0    0  *  *
0 0 0 1       0  *  *     0     0 *   0 *    0    0  *  *
0 0 1 0       0  *  *     0     0 *   0 *    1    1  1  1
0 0 1 1       0  *  *     0     0 *   0 *    1    1  1  1
0 1 0 0       0  *  *     0     0 *   0 *    0    0  *  *
0 1 0 1       0  *  *     0     0 *   0 *    0    0  *  *
0 1 1 0       0  *  *     0     0 *   0 *    1    1  1  1
0 1 1 1       0  *  *     0     0 *   0 *    1    1  1  1
1 0 0 0       0  1  0     1     1 1   1 1    1    *  *  *
1 0 0 1       1  1  1     1     * *   * *    1    *  *  *
1 0 1 0       0  1  0     1     1 1   1 1    1    *  *  *
1 0 1 1       1  1  1     1     * *   * *    1    *  *  *
1 1 0 0       0  0  0     0     0 0   0 *    0    0  *  *
1 1 0 1       0  0  0     0     0 0   0 *    0    0  *  *
1 1 1 0       0  0  0     0     0 0   0 *    1    1  0  1
1 1 1 1       0  0  0     0     0 0   0 *    1    1  0  1
```

| pq and rs | 00 | 01 | 11 | 10 |
| --- | --- | --- | --- | --- |
| 00 | 0 | 0 | 1 | 1 |
| 01 | 0 | 0 | 1 | 1 |
| 11 | 0 | 0 | 1 | 1 |
| 10 | 1 | 1 | 1 | 1 |

**Formula 2.** When $a=0$ all conditionals with antecedent $a$ are true. When $a=1$, the inner argument says that if $p$ implies $q$ and $q$ implies $r$, then $p$ implies $r$. Both cases make the root true.

```text
→  ε
├─ ∧  0
│  ├─ →  00
│  │  ├─ a  000
│  │  └─ →  001
│  │     ├─ p  0010
│  │     └─ q  0011
│  └─ →  01
│     ├─ a  010
│     └─ →  011
│        ├─ q  0110
│        └─ r  0111
└─ →  1
   ├─ a  10
   └─ →  11
      ├─ p  110
      └─ r  111
```

```text
a p q r  (((a → (p → q)) ∧ (a → (q → r))) → (a → (p → r)))
0 0 0 0       1    *     1    1    *      1    1    *
0 0 0 1       1    *     1    1    *      1    1    *
0 0 1 0       1    *     1    1    *      1    1    *
0 0 1 1       1    *     1    1    *      1    1    *
0 1 0 0       1    *     1    1    *      1    1    *
0 1 0 1       1    *     1    1    *      1    1    *
0 1 1 0       1    *     1    1    *      1    1    *
0 1 1 1       1    *     1    1    *      1    1    *
1 0 0 0       1    1     1    1    1      1    1    1
1 0 0 1       1    1     1    1    1      1    1    1
1 0 1 0       1    1     0    0    0      1    *    *
1 0 1 1       1    1     1    1    1      1    1    1
1 1 0 0       0    0     0    *    *      1    *    *
1 1 0 1       0    0     0    *    *      1    *    *
1 1 1 0       1    1     0    0    0      1    *    *
1 1 1 1       1    1     1    1    1      1    1    1
```

| ap and qr | 00 | 01 | 11 | 10 |
| --- | --- | --- | --- | --- |
| 00 | 1 | 1 | 1 | 1 |
| 01 | 1 | 1 | 1 | 1 |
| 11 | 1 | 1 | 1 | 1 |
| 10 | 1 | 1 | 1 | 1 |

**Formula 3.** When $a=1$ and $p=1$, the two inner premises would require both $q$ and $\neg q$. So if the entire antecedent is true, either $a=0$ or $p=0$. Both make the consequent true.

```text
→  ε
├─ ∧  0
│  ├─ →  00
│  │  ├─ a  000
│  │  └─ →  001
│  │     ├─ p  0010
│  │     └─ q  0011
│  └─ →  01
│     ├─ a  010
│     └─ →  011
│        ├─ p  0110
│        └─ ¬  0111
│           └─ q  01110
└─ →  1
   ├─ a  10
   └─ ¬  11
      └─ p  110
```

```text
a p q  (((a → (p → q)) ∧ (a → (p → ¬q))) → (a → ¬p))
0 0 0       1    *     1    1    * *     1    1 *
0 0 1       1    *     1    1    * *     1    1 *
0 1 0       1    *     1    1    * *     1    1 *
0 1 1       1    *     1    1    * *     1    1 *
1 0 0       1    1     1    1    1 *     1    1 1
1 0 1       1    1     1    1    1 *     1    1 1
1 1 0       0    0     0    *    * *     1    * *
1 1 1       1    1     0    0    0 0     1    * *
```

| a and pq | 00 | 01 | 11 | 10 |
| --- | --- | --- | --- | --- |
| 0 | 1 | 1 | 1 | 1 |
| 1 | 1 | 1 | 1 | 1 |

**Formula 4.** The only false row is $(p,q,r)=(1,1,0)$, exactly the row with both antecedents true and the final consequent false.

```text
→  ε
├─ p  0
└─ →  1
   ├─ q  10
   └─ r  11
```

```text
p q r  (p → (q → r))
0 0 0     1    *
0 0 1     1    *
0 1 0     1    *
0 1 1     1    *
1 0 0     1    1
1 0 1     1    1
1 1 0     0    0
1 1 1     1    1
```

| p and qr | 00 | 01 | 11 | 10 |
| --- | --- | --- | --- | --- |
| 0 | 1 | 1 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 |

**Formula 5.** The conditional is true when $r=1$ or its antecedent $p\to q$ is false. This is the same truth condition as $(p\land\neg q)\lor r$.

```text
→  ε
├─ →  0
│  ├─ p  00
│  └─ q  01
└─ r  1
```

```text
p q r  ((p → q) → r)
0 0 0      1    0
0 0 1      1    1
0 1 0      1    0
0 1 1      1    1
1 0 0      0    1
1 0 1      0    1
1 1 0      1    0
1 1 1      1    1
```

| p and qr | 00 | 01 | 11 | 10 |
| --- | --- | --- | --- | --- |
| 0 | 0 | 1 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 |

**Formula 6.** The two operands both fail on precisely $(1,1,0)$. Exclusive-or of equal truth values is always $0$.

```text
⊕  ε
├─ →  0
│  ├─ p  00
│  └─ →  01
│     ├─ q  010
│     └─ r  011
└─ →  1
   ├─ ∧  10
   │  ├─ p  100
   │  └─ q  101
   └─ r  11
```

```text
p q r  ((p → (q → r)) ⊕ ((p ∧ q) → r))
0 0 0      1    *     0     0    1
0 0 1      1    *     0     0    1
0 1 0      1    *     0     0    1
0 1 1      1    *     0     0    1
1 0 0      1    1     0     0    1
1 0 1      1    1     0     0    1
1 1 0      0    0     0     1    0
1 1 1      1    1     0     1    1
```

| p and qr | 00 | 01 | 11 | 10 |
| --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 0 | 0 |
| 1 | 0 | 0 | 0 | 0 |

Over the combined variable set, $F_1\equiv F_5$ and $F_2\equiv F_3$. The latter two are valid. $F_6$ is contradictory. $F_1,F_4,F_5$ are satisfiable and invalid. The row $(p,q,r)=(0,0,0)$ separates $F_4$ from $F_1,F_5$.
:::

::: practice Validate seven inference rules
Write these inferences as entailments and prove them by the truth conditions. In each row, every listed premise is assumed true. Then explain why adding another premise preserves a valid entailment.

| Premises | Conclusion |
|---|---|
| If $A$ then $B$. $A$ holds. | $B$ holds. |
| If $A$ then $B$. $B$ is false. | $A$ is false. |
| $A$ or $B$ holds. $B$ is false. | $A$ holds. |
| If $A$ then $B$. If $B$ then $C$. | If $A$ then $C$. |
| $A$ or $B$ holds. If $A$ then $C$. If $B$ then $C$. | $C$ holds. |
| If $B$ is false then $A$ is false. | If $A$ then $B$. |
| If $A$ is false then $B$. If $A$ is false then $B$ is false. | $A$ holds. |
::: answer
- $A\to B,A\models B$. With a true antecedent, the conditional is satisfied only when the consequent is true.
- $A\to B,\neg B\models\neg A$. If $A$ were true, the conditional would require $B$.
- $A\lor B,\neg B\models A$. With $B=0$, the disjunction needs $A=1$.
- $A\to B,B\to C\models A\to C$. When $A=0$ the target is true. When $A=1$, apply the two premises successively to get $C=1$.
- $A\lor B,A\to C,B\to C\models C$. At least one of $A,B$ is true, and either gives $C$.
- $\neg B\to\neg A\models A\to B$. A counterexample to the conclusion would have $A=1,B=0$ and thus falsify the premise.
- $\neg A\to B,\neg A\to\neg B\models A$. If $A=0$, the two premises would require opposite values of $B$.

If $F\models G$, every assignment satisfying $F$ gives $G$. Adding another premise only restricts the assignments we examine. Thus $F,F'\models G$.
:::

::: practice Four time slots as a coloring
Five lectures have conflict sets $\{1,3,4\}$, $\{1,2,5\}$, $\{2,3,4\}$ and $\{1,2,4\}$ for four students. Argue that four slots suffice, then check whether fewer could work.
::: answer
Join two lectures when some student wants to attend both. Then a time slot is a color, and an edge means its endpoints need different slots. Lectures $1,2,3,4$ form $K_4$, and lecture $5$ is adjacent just to $1,2$. Draw $1,2,3$ in an outer triangle and $4$ inside. Add $5$ outside the edge $\{1,2\}$ so its two edges stay outside the triangle. This planar drawing lets us apply the four-color theorem, giving four slots at most.

The four lectures in the $K_4$ already need four distinct slots, so four is also a lower bound. Which one can we share with lecture $5$? It conflicts with $1$ and $2$ but can go alongside $3$. One minimum schedule is $\{1\},\{2\},\{3,5\},\{4\}$.
:::

::: practice Two KV maps with an irrelevant variable
Construct KV maps for these two formulas. Both contain the clause $e\lor\neg e$.

$$
\begin{aligned}
F={}&(a\lor b\lor c)\land(a\lor c\lor\neg d)\land(\neg a\lor\neg b\lor\neg d\lor\neg f)\\
&\land(b\lor d\lor f)\land(\neg a\lor d\lor f)\land(\neg a\lor b\lor f)\\
&\land(\neg a\lor b\lor d)\land(c\lor f)\land(e\lor\neg e).
\end{aligned}
$$
$$
\begin{aligned}
G={}&(\neg a\lor\neg b\lor\neg c)\land(\neg a\lor\neg b\lor\neg d\lor\neg f)\\
&\land(\neg a\lor b\lor f)\land(a\lor\neg b\lor f)\\
&\land(a\lor d)\land(b\lor d)\land(d\lor f)\land(e\lor\neg e).
\end{aligned}
$$
::: answer
There are two identical layers, one for each value of $e$, because its clause is true in both. The tables give each layer with $(a,b,c)$ in Gray order down the sides and $(d,f)$ in Gray order across the top.

**Formula 1.**

| $(a,b,c)$ and $(d,f)$ | 00 | 01 | 11 | 10 |
| --- | --- | --- | --- | --- |
| 000 | 0 | 0 | 0 | 0 |
| 001 | 0 | 1 | 1 | 1 |
| 011 | 1 | 1 | 1 | 1 |
| 010 | 0 | 1 | 0 | 0 |
| 110 | 0 | 1 | 0 | 0 |
| 111 | 0 | 1 | 0 | 1 |
| 101 | 0 | 0 | 1 | 0 |
| 100 | 0 | 0 | 1 | 0 |

**Formula 2.**

| $(a,b,c)$ and $(d,f)$ | 00 | 01 | 11 | 10 |
| --- | --- | --- | --- | --- |
| 000 | 0 | 0 | 1 | 1 |
| 001 | 0 | 0 | 1 | 1 |
| 011 | 0 | 0 | 1 | 0 |
| 010 | 0 | 0 | 1 | 0 |
| 110 | 0 | 1 | 0 | 1 |
| 111 | 0 | 0 | 0 | 0 |
| 101 | 0 | 0 | 1 | 0 |
| 100 | 0 | 0 | 1 | 0 |

To verify a $0$, find just one false clause. At the all-zero assignment the first clause of $F$ is false, and $a\lor d$ is false for $G$. To verify a $1$, find a true literal in every clause. For instance $(a,b,c,d,f)=(0,1,1,1,1)$ satisfies $F$ because every clause with $\neg a$ is already true and the other clauses have one of $b,c,d,f$ available. In the other layer only $e$ changes, which leaves the values fixed.
:::

::: practice SAT encoding of lecture scheduling, cardinality caps, and relation axioms
1. Let $T_{i,j}$ ($i\in[5],j\in[4]$) assert that lecture $L_i$ runs in slot $j$, with student conflict edges $E=\{\{1,2\},\{1,3\},\{1,4\},\{2,3\},\{2,4\},\{3,4\},\{2,5\},\{1,5\}\}$. Write CNF clauses for: ($C_1$) every lecture gets at least one slot, ($C_2$) every lecture gets at most one slot, ($C_3$) no two conflicting lectures share a slot, and ($C_4$) slot $1$ hosts **at most two** of $\{L_1,L_2,L_5\}$.
2. Using variables $r_{i,j}$ ($i,j\in[3]$) for $(i,j)\in R$, write expanded propositional formulas on $[3]$ asserting: (i) $R\ne\varnothing$, (ii) $R$ is not symmetric, (iii) $R$ is antisymmetric but not asymmetric, and (iv) the schema for transitivity.
::: answer
**1. Scheduling and cardinality clauses.**
- $C_1$ (at least one slot per lecture): $\bigwedge_{i=1}^5(T_{i,1}\lor T_{i,2}\lor T_{i,3}\lor T_{i,4})$.
- $C_2$ (at most one slot per lecture): $\bigwedge_{i=1}^5\bigwedge_{1\le j<j'\le 4}(\neg T_{i,j}\lor\neg T_{i,j'})$.
- $C_3$ (conflict-free): $\bigwedge_{\{i,i'\}\in E}\bigwedge_{j=1}^4(\neg T_{i,j}\lor\neg T_{i',j})$.
- $C_4$ (at most two of three true): forbid all three from being true simultaneously via the single ternary clause $(\neg T_{1,1}\lor\neg T_{2,1}\lor\neg T_{5,1})$.

**2. Relation properties on $[3]$ as propositional formulas.**
- (i) Nonempty: $r_{1,1}\lor r_{1,2}\lor r_{1,3}\lor r_{2,1}\lor r_{2,2}\lor r_{2,3}\lor r_{3,1}\lor r_{3,2}\lor r_{3,3}$.
- (ii) Not symmetric (some off-diagonal pair disagrees): $(r_{1,2}\land\neg r_{2,1})\lor(\neg r_{1,2}\land r_{2,1})\lor(r_{1,3}\land\neg r_{3,1})\lor(\neg r_{1,3}\land r_{3,1})\lor(r_{2,3}\land\neg r_{3,2})\lor(\neg r_{2,3}\land r_{3,2})$.
- (iii) Antisymmetric and not asymmetric (no two-cycles on distinct nodes, yet at least one self-loop breaks asymmetry): $(\neg r_{1,2}\lor\neg r_{2,1})\land(\neg r_{1,3}\lor\neg r_{3,1})\land(\neg r_{2,3}\lor\neg r_{3,2})\land(r_{1,1}\lor r_{2,2}\lor r_{3,3})$.
- (iv) Transitive schema: $\bigwedge_{i,j,k\in[3]}((r_{i,j}\land r_{j,k})\to r_{i,k})\equiv\bigwedge_{i,j,k\in[3]}(\neg r_{i,j}\lor\neg r_{j,k}\lor r_{i,k})$ ($27$ clauses; the $15$ cases with $i=j$ or $j=k$ simplify to tautologies, leaving $12$ nontrivial clauses).
:::

::: practice Validity versus satisfiability traps and disjoint variable sets
Prove or give a counterexample:
1. If $(F\to G)$ is satisfiable and $F$ is satisfiable, then $G$ is satisfiable.
2. If $\models(F\to G)$ and $F$ is satisfiable, then $G$ is satisfiable.
3. If $F\equiv G$ and $V_F\cap V_G=\varnothing$, then $F$ and $G$ are either both valid or both unsatisfiable.
::: answer
**1. False.** Take $F=p$ and $G=(q\land\neg q)\equiv\bot$. Setting $\beta(p)=1$ satisfies $F$, and setting $\beta'(p)=0,\beta'(q)=0$ satisfies $p\to(q\land\neg q)$, yet $G$ is unsatisfiable. Different satisfying assignments need not overlap!

**2. True.** Pick a fitting assignment $\beta$ with $\llbracket F\rrbracket(\beta)=1$ and extend it arbitrarily to variables in $V_G\setminus V_F$. Because $F\to G$ is valid, $\llbracket F\to G\rrbracket(\beta)=1$; with antecedent $1$, the conditional forces $\llbracket G\rrbracket(\beta)=1$.

**3. True.** Take any two assignments $\beta_1,\beta_2$ on $V_F\cup V_G$, and form the hybrid assignment $\beta_*$ that agrees with $\beta_1$ on $V_F$ and with $\beta_2$ on $V_G$ (possible because $V_F\cap V_G=\varnothing$). Since $F$ reads only $V_F$ and $G$ reads only $V_G$,
$$
\llbracket F\rrbracket(\beta_1)=\llbracket F\rrbracket(\beta_*)=\llbracket G\rrbracket(\beta_*)=\llbracket G\rrbracket(\beta_2).
$$
Thus $F$ and $G$ take one and the same constant truth value across **all** assignments—either always $1$ (both valid) or always $0$ (both unsatisfiable).
:::
