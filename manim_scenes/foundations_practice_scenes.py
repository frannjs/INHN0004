from manim import DOWN, UP, FadeIn, FadeOut, Scene, VGroup
import numpy as np

from tex_helper import (
    M_BLUE, M_GREEN, M_INK, M_MUTED, M_YELLOW,
    make_directed_edge, make_graph_node, make_undirected_edge, prose_label,
    tex_mobject,
)


class InfixBoundsScene(Scene):
    """Trace upper bounds and locate the first incomparable candidates."""

    def construct(self):
        ranks = [
            [r"\varepsilon"],
            ["a", "b"],
            ["aa", "ab", "ba"],
            ["aab", "baa"],
            ["baab"],
        ]
        covers = [
            (r"\varepsilon", "a"), (r"\varepsilon", "b"),
            ("a", "aa"), ("a", "ab"), ("a", "ba"), ("b", "ab"), ("b", "ba"),
            ("aa", "aab"), ("aa", "baa"), ("ab", "aab"), ("ba", "baa"),
            ("aab", "baab"), ("baa", "baab"),
        ]
        radius = 0.39
        positions = {
            label: np.array([2.3 * (column - (len(rank) - 1) / 2), -2.06 + 1.21 * level, 0])
            for level, rank in enumerate(ranks)
            for column, label in enumerate(rank)
        }
        vertices = {label: make_graph_node(label, pos, radius=radius) for label, pos in positions.items()}
        for vertex in vertices.values():
            label = vertex[1]
            if label.width > 1.55 * radius:
                label.scale_to_fit_width(1.55 * radius)
        edges = {
            (source, target): make_undirected_edge(positions[source], positions[target], color=M_MUTED, radius=radius)
            for source, target in covers
        }
        title = prose_label("Which common upper bound comes first?", 35).to_edge(UP, buff=0.28)
        rank_labels = VGroup(*[
            tex_mobject(str(level), height=0.23, color=M_MUTED).move_to([-4.6, -2.06 + 1.21 * level, 0])
            for level in range(len(ranks))
        ])
        footer = lambda expr: tex_mobject(expr, height=0.34).to_edge(DOWN, buff=0.4)
        self.play(FadeIn(title), FadeIn(rank_labels), FadeIn(VGroup(*edges.values(), *vertices.values())))
        self.wait(0.8)
        question = footer(r"X=\{a,b\}\qquad\text{Find a word above both.}")
        self.play(FadeIn(question), *[
            vertices[v][0].animate.set_stroke(M_YELLOW, width=4) for v in ["a", "b"]
        ])
        self.play(*[
            edges[s, t].animate.set_stroke(M_BLUE, width=4)
            for s, t in [("a", "ab"), ("a", "ba"), ("b", "ab"), ("b", "ba")]
        ], *[
            vertices[v][0].animate.set_stroke(M_BLUE, width=4) for v in ["ab", "ba"]
        ])
        no_least = footer(r"ab,ba\text{ are incomparable minimal upper bounds. No supremum.}")
        self.play(FadeOut(question), run_time=0.15)
        self.play(FadeIn(no_least), run_time=0.26)
        self.wait(2)
        question = footer(r"X=\{aa,ab\}\qquad\text{Now look for their first common upper bound.}")
        self.play(FadeOut(no_least), run_time=0.15)
        self.play(FadeIn(question), *[
            vertices[v][0].animate.set_stroke(M_YELLOW if v in ["aa", "ab"] else M_INK, width=2.6)
            for v in vertices
        ], *[edge.animate.set_stroke(M_MUTED, width=2.6) for edge in edges.values()])
        self.play(*[
            edges[s, t].animate.set_stroke(M_GREEN, width=4)
            for s, t in [("aa", "aab"), ("ab", "aab"), ("aab", "baab")]
        ], vertices["aab"][0].animate.set_stroke(M_GREEN, width=4))
        least = footer(r"\sup\{aa,ab\}=aab,\quad aab\preceq_i baab.")
        self.play(FadeOut(question), run_time=0.15)
        self.play(FadeIn(least), run_time=0.26)
        self.wait(2)


class FunctionFibresScene(Scene):
    """Follow the same arrows forwards and backwards in the chapter example."""

    def construct(self):
        values = {1: "r", 2: "g", 3: "b", 4: "g", 5: "r"}
        inputs = {i: np.array([-2.85, 2.6 - 0.93 * i, 0]) for i in values}
        targets = {b: np.array([2.85, 1.75 - 1.22 * j, 0]) for j, b in enumerate("rgby")}
        radius = 0.31
        in_nodes = {i: make_graph_node(str(i), pos, radius=radius) for i, pos in inputs.items()}
        out_nodes = {b: make_graph_node(b, pos, radius=radius) for b, pos in targets.items()}
        arrows = {
            i: make_directed_edge(inputs[i], targets[b], color=M_MUTED, radius=radius)
            for i, b in values.items()
        }
        title = prose_label("Images and preimages in the same graph", 34).to_edge(UP, buff=0.30)
        labels = VGroup(
            prose_label("Domain A", 22).move_to([-2.85, 2.53, 0]),
            prose_label("Codomain B", 22).move_to([2.85, 2.53, 0]),
        )
        footer = lambda expr: tex_mobject(expr, height=0.34).to_edge(DOWN, buff=0.44)
        step = footer(r"X=\{1,4\}\qquad\text{Select the starting inputs.}")
        self.play(FadeIn(title), FadeIn(labels), FadeIn(VGroup(*arrows.values(), *in_nodes.values(), *out_nodes.values())))
        self.play(FadeIn(step), *[in_nodes[i][0].animate.set_stroke(M_YELLOW, width=4) for i in [1, 4]])
        forward = footer(r"f(X)=\{r,g\}\qquad\text{Follow only the selected arrows.}")
        self.play(FadeOut(step), run_time=0.15)
        self.play(FadeIn(forward), *[
            arrows[i].animate.set_color(M_YELLOW) for i in [1, 4]
        ], *[out_nodes[b][0].animate.set_stroke(M_YELLOW, width=4) for b in ["r", "g"]])
        self.wait(1.4)
        reverse = footer(r"f^{-1}(f(X))=\{1,2,4,5\}\qquad\text{Collect every input reaching either output.}")
        self.play(FadeOut(forward), run_time=0.15)
        self.play(FadeIn(reverse), *[
            arrows[i].animate.set_color(M_BLUE) for i in [2, 5]
        ], *[in_nodes[i][0].animate.set_stroke(M_BLUE, width=4) for i in [2, 5]])
        self.wait(1.8)
        end = footer(r"\{1,4\}\subsetneq\{1,2,4,5\}\qquad\text{The return trip can add inputs.}")
        self.play(FadeOut(reverse), run_time=0.15)
        self.play(FadeIn(end), run_time=0.26)
        self.wait(1.6)
