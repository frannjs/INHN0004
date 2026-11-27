from math import prod

from manim import (
    AnimationGroup,
    BackgroundRectangle,
    Circle,
    Cutout,
    Difference,
    FadeIn,
    FadeOut,
    Intersection,
    Line,
    Rectangle,
    Scene,
    Square,
    Union,
    VGroup,
)
import numpy as np

from tex_helper import (
    M_BLUE,
    M_DIM,
    M_GREEN,
    M_INK,
    M_MUTED,
    M_RED,
    M_YELLOW,
    make_graph_node,
    make_undirected_edge,
    prose_label,
    tex_mobject,
)


def point(x, y):
    return np.array([x, y, 0.0])


class FormulaScopeTrees(Scene):
    def construct(self):
        trees = [
            (
                -3.4,
                r"\neg(A\land B)",
                [(r"\neg", 0, 1.16), (r"\land", 0, -0.19), ("A", -1.10, -1.54), ("B", 1.10, -1.54)],
                [(0, 1), (1, 2), (1, 3)],
                {0: "T", 1: "F", 2: "F", 3: "F"},
            ),
            (
                3.4,
                r"(\neg A)\land B",
                [(r"\land", 0, 1.16), (r"\neg", -1.10, -0.19), ("A", -1.10, -1.54), ("B", 1.10, -0.19)],
                [(0, 1), (0, 3), (1, 2)],
                {0: "F", 1: "T", 2: "F", 3: "F"},
            ),
        ]
        values = {0: VGroup(), 1: VGroup(), 2: VGroup(), 3: VGroup()}
        for center, expression, items, edges, answers in trees:
            coords = [point(center + x, y) for _, x, y in items]
            root = tex_mobject(expression, 0.42).move_to(point(center, 2.45))
            self.add(root)
            for start, end in edges:
                self.add(make_undirected_edge(coords[start], coords[end], M_MUTED, 0.32, 2.0))
            for i, ((label, _, _), at) in enumerate(zip(items, coords)):
                color = M_BLUE if label == r"\neg" else (M_YELLOW if label == r"\land" else M_INK)
                node = make_graph_node(label, at, 0.32, color)
                if label == r"\neg":
                    node[1].scale(0.72)
                self.add(node)
                value = answers[i]
                values[i].add(tex_mobject(value, 0.27, color=M_GREEN if value == "T" else M_RED).move_to(at + point(0.63, 0)))

        self.wait(1.25)
        condition = tex_mobject(r"A=\mathrm{F}\qquad B=\mathrm{F}", 0.34).move_to(point(0, -2.85))
        self.play(FadeIn(condition), FadeIn(values[2]), FadeIn(values[3]), run_time=0.45)
        self.wait(1.05)
        self.play(FadeIn(values[1]), run_time=0.45)
        self.wait(0.9)
        self.play(FadeIn(values[0]), run_time=0.45)
        self.wait(2.1)


class VennMembershipCells(Scene):
    def construct(self):
        frame = Rectangle(width=5.0, height=3.6, stroke_color=M_MUTED).move_to(point(-3.55, 0))
        a = Circle(radius=1.18, color=M_BLUE).move_to(point(-2.95, 0))
        b = Circle(radius=1.18, color=M_GREEN).move_to(point(-4.15, 0))
        title = VGroup(
            prose_label("Venn diagram", 28).move_to(point(-3.55, 2.72)),
            prose_label("Karnaugh–Veitch map", 28).move_to(point(3.55, 2.72)),
        )
        labels = VGroup(
            tex_mobject(r"\Omega", 0.28).move_to(point(-5.64, 1.35)),
            tex_mobject("A", 0.29, color=M_BLUE).move_to(point(-2.18, 1.41)),
            tex_mobject("B", 0.29, color=M_GREEN).move_to(point(-4.92, 1.41)),
            tex_mobject(r"x\in B", 0.28, color=M_GREEN).move_to(point(1.28, 0)),
            tex_mobject(r"x\in A", 0.28, color=M_BLUE).move_to(point(3.55, 1.93)),
        )
        grid = {}
        grid_labels = VGroup()
        for bbit in range(2):
            y = 0.6 - 1.2 * bbit
            grid_labels.add(tex_mobject(str(bbit), 0.25).move_to(point(2.15, y)))
            for abit in range(2):
                x = 2.95 + 1.2 * abit
                grid[abit, bbit] = Square(side_length=1.2, stroke_color=M_MUTED).move_to(point(x, y))
                if bbit == 0:
                    grid_labels.add(tex_mobject(str(abit), 0.25).move_to(point(x, 1.48)))

        self.add(title, frame, a, b, labels, grid_labels, *grid.values())
        regions = {
            (0, 0): Cutout(frame, Union(a, b)),
            (0, 1): Difference(b, a),
            (1, 0): Difference(a, b),
            (1, 1): Intersection(a, b),
        }
        cases = {
            (0, 0): r"00\qquad x\notin A,\ x\notin B",
            (0, 1): r"01\qquad x\in B\setminus A",
            (1, 0): r"10\qquad x\in A\setminus B",
            (1, 1): r"11\qquad x\in A\cap B",
        }
        for bits, expression in cases.items():
            region = regions[bits].set_stroke(width=0).set_fill(M_YELLOW, 0.38).set_z_index(-1)
            cell = grid[bits].copy().set_stroke(width=0).set_fill(M_YELLOW, 0.54).set_z_index(-1)
            caption = tex_mobject(expression, 0.35).move_to(point(0, -2.7))
            self.play(FadeIn(region), FadeIn(cell), FadeIn(caption), run_time=0.28)
            self.wait(1.3)
            self.play(FadeOut(region), FadeOut(cell), FadeOut(caption), run_time=0.22)

        selected = VGroup()
        for bits in [(1, 0), (0, 1)]:
            selected.add(regions[bits].set_fill(M_YELLOW, 0.38))
            selected.add(grid[bits].copy().set_stroke(width=0).set_fill(M_YELLOW, 0.54).set_z_index(-1))
        final = tex_mobject(r"x\in A\mathbin{\Delta}B\quad\Longleftrightarrow\quad 10\ \text{or}\ 01", 0.37)
        final.move_to(point(0, -2.7))
        self.play(FadeIn(selected), FadeIn(final), run_time=0.5)
        self.wait(2.2)


class DivisorSubsetLattice(Scene):
    def construct(self):
        levels = [
            [()],
            [(2,), (3,), (5,)],
            [(2, 3), (2, 5), (3, 5)],
            [(2, 3, 5)],
        ]
        pairs = [(2, 3), (3, 5)]
        lower = (3,)
        upper = (2, 3, 5)
        node_colors = {pairs[0]: M_BLUE, pairs[1]: M_BLUE, lower: M_GREEN, upper: M_YELLOW}
        sides = []
        for center, title, use_subsets in [
            (-3.65, "Divisibility", False),
            (3.65, "Inclusion", True),
        ]:
            positions = {
                primes: point(center + (i - (len(row) - 1) / 2) * 1.72, -1.95 + height * 1.22)
                for height, row in enumerate(levels)
                for i, primes in enumerate(row)
            }
            edges = {}
            for left_row, right_row in zip(levels, levels[1:]):
                for lo in left_row:
                    for hi in right_row:
                        if set(lo) < set(hi):
                            edge = Line(positions[lo], positions[hi], color=M_MUTED, stroke_width=1.8)
                            edges[lo, hi] = edge.set_z_index(-1)
            nodes = {}
            for key, center_point in positions.items():
                if use_subsets:
                    expression = (r"\{" + ",".join(map(str, key)) + r"\}") if key else r"\varnothing"
                else:
                    expression = str(prod(key))
                label = tex_mobject(expression, height=0.3).move_to(center_point)
                bg = BackgroundRectangle(label, color="#000000", fill_opacity=1, buff=0.11)
                nodes[key] = VGroup(bg, label)
            panel_header = prose_label(title, 29).move_to(point(center, 2.75))
            self.add(panel_header, *edges.values(), *nodes.values())
            sides.append((edges, nodes))

        divider = Line(point(0, -2.35), point(0, 2.6), color=M_DIM, stroke_width=1.5)
        self.add(divider)
        caption = tex_mobject(r"6\ \leftrightarrow\ \{2,3\}\qquad 15\ \leftrightarrow\ \{3,5\}", 0.33)
        caption.move_to(point(0, -3.1))
        self.play(
            FadeIn(caption),
            *(nodes[key][1].animate.set_color(node_colors[key]) for _, nodes in sides for key in pairs),
            run_time=0.55,
        )
        self.wait(1.25)

        for bound, targets, expression in [
            (lower, [(lower, key) for key in pairs], r"\gcd(6,15)=3\qquad\{2,3\}\cap\{3,5\}=\{3\}"),
            (upper, [(key, upper) for key in pairs], r"\operatorname{lcm}(6,15)=30\qquad\{2,3\}\cup\{3,5\}=\{2,3,5\}"),
        ]:
            color = node_colors[bound]
            new_caption = tex_mobject(expression, 0.34, color=color).move_to(caption)
            changes = []
            for edges, nodes in sides:
                changes.extend(edges[target].animate.set_stroke(color=color, width=4) for target in targets)
                changes.append(nodes[bound][1].animate.set_color(color))
            self.play(FadeOut(caption), run_time=0.15)
            self.play(AnimationGroup(*changes), FadeIn(new_caption), run_time=0.55)
            caption = new_caption
            self.wait(2.0)
