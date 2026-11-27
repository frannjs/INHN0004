# Discrete Structures (INHN0004)

An interactive textbook for TUM's Discrete Structures course. [Read the textbook](https://ds.tum.ninja/).

The reader includes worked practice and a searchable symbol dictionary. Sign in to save notes, highlights, and reading progress.

## How it teaches

The explanations start with a small example you can work through by hand. Once the idea is clear, they introduce the notation, state the definition precisely, and explain why the result holds. Graphs, tables, and worked problems help connect each step to the next.

**Example from relations.** Take the relation R with the arrows a → b and b → c. Where can you get from a in exactly two steps? Follow the arrows through b to c. In symbols, (a, c) ∈ R². In the Boolean matrix for R², that same fact appears as a 1 in row a, column c. [Explore relations in the textbook](https://ds.tum.ninja/?page=ch04#sec-4-3).

The animations use Manim Community, a fork of the animation engine Grant Sanderson created for 3Blue1Brown. [About Manim](https://docs.manim.community/en/stable/faq/installation.html).

Please direct requests for exam materials to the official course channels.

## Run locally

    pnpm install
    pnpm dev
