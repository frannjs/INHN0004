"""Part II scenes: demonstrate which object is counted and why a choice works."""
import numpy as np
from manim import *
from tex_helper import M_BLUE, M_DIM, M_GREEN, M_INK, M_MUTED, M_RED, M_YELLOW, prose_label, tex_mobject


def heading(text):
    return prose_label(text, font_size=38).to_edge(UP, buff=0.42)


def caption(text, color=M_INK):
    return prose_label(text, font_size=28, color=color).to_edge(DOWN, buff=0.48)


def at(x, y):
    return [x, y, 0]


class PairingDiagonalsScene(Scene):
    def construct(self):
        title = heading("Finish one finite diagonal at a time")
        lattice = {(n, m): Dot(at(-2.15 + (n - 1) * 1.08, -2 + (m - 1) * 1.08),
                                color=M_MUTED, radius=0.045)
                   for n in range(1, 6) for m in range(1, 6)}
        xlabels = VGroup(*(tex_mobject(str(n), height=0.2, color=M_MUTED)
                           .next_to(lattice[n, 1], DOWN, buff=0.28) for n in range(1, 6)))
        ylabels = VGroup(*(tex_mobject(str(m), height=0.2, color=M_MUTED)
                           .next_to(lattice[1, m], LEFT, buff=0.36) for m in range(1, 6)))
        axis_labels = VGroup(tex_mobject("n", height=0.23).next_to(xlabels, RIGHT),
                             tex_mobject("m", height=0.23).next_to(ylabels, UP))
        equation = tex_mobject(r"m+\frac{(m+n-1)(m+n-2)}2", height=0.62).move_to(at(4.35, 1.48))
        self.play(FadeIn(title), FadeIn(VGroup(*lattice.values(), xlabels, ylabels, axis_labels)), run_time=0.75)
        self.play(FadeIn(equation), run_time=0.45)
        history = None
        for length in range(1, 6):
            diagonal = tuple((length + 1 - m, m) for m in range(1, length + 1))
            line = Line(lattice[diagonal[0]].get_center(), lattice[diagonal[-1]].get_center(),
                        color=M_YELLOW, stroke_width=3).set_opacity(0.4) if length > 1 else None
            status = tex_mobject(rf"n+m={length+1}", height=0.36, color=M_YELLOW).move_to(at(4.35, 0.24))
            effects = [FadeIn(status)] if history is None else [Succession(FadeOut(history), FadeIn(status))]
            if line is not None:
                effects.append(Create(line))
            self.play(*effects, run_time=0.45)
            history = status
            for rank, pair in enumerate(diagonal, start=1 + length * (length - 1) // 2):
                dot = lattice[pair]
                label = tex_mobject(str(rank), height=0.26, color=M_BLUE).next_to(dot, UR, buff=0.04)
                self.play(dot.animate.set_color(M_BLUE).scale(1.4), FadeIn(label), run_time=0.22)
            self.wait(0.65)
            if line is not None:
                self.play(FadeOut(line), run_time=0.24)
        self.play(FadeIn(caption("Every pair lies on a finite diagonal.", M_BLUE)), run_time=0.4)
        self.wait(1.7)


class CantorDiagonalScene(Scene):
    def construct(self):
        bit_rows = ("01100", "11111", "01010", "10101", "00110")
        title = heading("Build a sequence missing from the list")
        xpos = [-2.3, -1.15, 0, 1.15, 2.3]
        ypos = [2.0, 1.18, 0.36, -0.46, -1.28]
        matrix = []
        labels = VGroup()
        for i, row in enumerate(bit_rows):
            labels.add(tex_mobject(rf"f({i+1})", height=0.29, color=M_MUTED).move_to(at(-3.6, ypos[i])))
            matrix.append([tex_mobject(bit, height=0.31).move_to(at(xpos[j], ypos[i]))
                           for j, bit in enumerate(row)])
        rhs = VGroup(*(tex_mobject(r"\cdots", height=0.05, color=M_MUTED).move_to(at(3.36, y)) for y in ypos))
        answer = tex_mobject("D", height=0.29, color=M_BLUE).move_to(at(-3.6, -2.36))
        base = Line(at(-4.0, -1.82), at(3.83, -1.82), color=M_DIM)
        self.play(FadeIn(title), FadeIn(VGroup(*[m for row in matrix for m in row], labels, rhs)), run_time=0.65)
        self.play(Create(base), FadeIn(answer), run_time=0.45)
        for i, row in enumerate(bit_rows):
            diagonal_bit = matrix[i][i]
            highlight = SurroundingRectangle(diagonal_bit, color=M_YELLOW, buff=0.12)
            new_bit = tex_mobject(str(1 - int(row[i])), height=0.31, color=M_BLUE).move_to(at(xpos[i], -2.36))
            self.play(Create(highlight), run_time=0.24)
            self.play(FadeIn(new_bit, shift=0.10 * UP), run_time=0.42)
            self.play(FadeOut(highlight), diagonal_bit.animate.set_color(M_YELLOW), run_time=0.24)
        dots = tex_mobject(r"\cdots", height=0.05, color=M_BLUE).move_to(at(3.36, -2.36))
        self.play(FadeIn(dots), FadeIn(caption("Row i fails at position i.", M_BLUE)), run_time=0.55)
        self.wait(1.8)


class InclusionExclusionScene(Scene):
    def construct(self):
        title = heading("One point, three layers of bookkeeping")
        positions = [at(-2.35, 0.63), at(0.49, 0.63), at(-0.93, -1.08)]
        colors = [M_BLUE, M_GREEN, M_RED]
        circles = VGroup(*(Circle(radius=1.7, stroke_color=color, fill_color=color, fill_opacity=0.11)
                           .move_to(pos) for color, pos in zip(colors, positions)))
        labels = VGroup(*(tex_mobject(rf"A_{i+1}", height=0.28, color=colors[i]).move_to(pos)
                          for i, pos in enumerate(positions)))
        dot = Dot(at(-0.93, 0.16), radius=0.1, color=M_YELLOW).set_z_index(2)
        stages = [
            ("+3", "The point belongs to all three sets."),
            ("+3-3", "It belongs to all three pairwise overlaps."),
            ("+3-3+1=1", "Restore its triple-overlap contribution."),
        ]
        self.play(FadeIn(title), FadeIn(circles), FadeIn(labels), FadeIn(dot), run_time=0.7)
        old_score = old_text = None
        for formula, text in stages:
            score = tex_mobject(formula, height=0.38, color=M_YELLOW).move_to(at(4.35, 0.15))
            label = caption(text)
            effects = [FadeIn(score), FadeIn(label)] if old_score is None else [
                Succession(FadeOut(old_score), FadeIn(score)),
                Succession(FadeOut(old_text), FadeIn(label)),
            ]
            self.play(*effects, Indicate(dot, color=M_YELLOW, scale_factor=1.5), run_time=0.75)
            old_score, old_text = score, label
            self.wait(1.1)
        self.wait(1.0)


class UrnCasesScene(Scene):
    def construct(self):
        title = heading("Same draws, different records")
        x = [-1.6, 0, 1.6]
        y = [1.42, 0.16, -1.10]
        cells = {(a, b): tex_mobject(rf"({a},{b})", height=0.36).move_to(at(x[b-1], y[a-1]))
                 for a in range(1, 4) for b in range(1, 4)}
        self.play(FadeIn(title), FadeIn(VGroup(*cells.values())), run_time=0.65)
        ordered = tex_mobject(r"+M,+A:\quad 9", height=0.34, color=M_BLUE).move_to(at(4.55, 1.42))
        self.play(FadeIn(ordered), run_time=0.4)
        self.wait(0.8)
        no_repeat = tex_mobject(r"-M,+A:\quad 6", height=0.34, color=M_BLUE).move_to(at(4.55, 0.43))
        diagonal = [cells[a, a] for a in range(1, 4)]
        self.play(*[m.animate.set_opacity(0.18) for m in diagonal], FadeIn(no_repeat), run_time=0.6)
        self.wait(0.85)
        choose = tex_mobject(r"-M,-A:\quad 3", height=0.34, color=M_BLUE).move_to(at(4.55, -0.56))
        for a, b in [(1, 2), (1, 3), (2, 3)]:
            # The corner-to-corner move must go around the middle cell.
            bend = 1.45 if (a, b) == (1, 3) else 0
            self.play(cells[b, a].animate(path_arc=bend).move_to(cells[a, b]).set_opacity(0), run_time=0.48)
            self.play(cells[a, b].animate.set_color(M_YELLOW), run_time=0.2)
        self.play(FadeIn(choose), run_time=0.4)
        self.wait(0.85)
        multi = tex_mobject(r"+M,-A:\quad 6", height=0.34, color=M_BLUE).move_to(at(4.55, -1.55))
        self.play(*[m.animate.set_opacity(1).set_color(M_YELLOW) for m in diagonal], FadeIn(multi), run_time=0.65)
        self.play(FadeIn(caption("After forgetting order, keep one representative per outcome.")), run_time=0.4)
        self.wait(1.6)


class MultisetSeparatorsScene(Scene):
    def construct(self):
        title = heading("A divider keeps even an empty group")
        self.play(FadeIn(title), run_time=0.6)
        layouts = ["**||*", "*|*|*", "||***", "***||"]
        positions = [-3.2, -1.6, 0, 1.6, 3.2]
        symbols = {
            "*": [tex_mobject(r"\star", height=0.55, color=M_YELLOW) for _ in range(3)],
            "|": [tex_mobject(r"\mid", height=0.55, color=M_BLUE) for _ in range(2)],
        }
        old_count = None
        for layout in layouts:
            sizes = tuple(len(group) for group in layout.split("|"))
            count = tex_mobject(rf"(m_1,m_2,m_3)=({sizes[0]},{sizes[1]},{sizes[2]})", height=0.48)
            count.move_to(at(0, -0.65))
            destinations = {kind: [x for x, slot in zip(positions, layout) if slot == kind] for kind in symbols}
            moves = []
            for kind, marks in symbols.items():
                lane = 1.12 * (DOWN if kind == "*" else UP)
                for mark, x in zip(marks, destinations[kind]):
                    target = np.array(at(x, 0.75))
                    if old_count is None:
                        mark.move_to(target)
                        moves.append(FadeIn(mark))
                    else:
                        start = mark.get_center()
                        if abs(start[0] - x) > 0.01:
                            moves.append(MoveAlongPath(mark, CubicBezier(start, start + lane, target + lane, target)))
            change_count = FadeIn(count) if old_count is None else Succession(FadeOut(old_count), FadeIn(count))
            self.play(*moves, change_count, run_time=0.55)
            old_count = count
            self.wait(0.75)
        rule = tex_mobject(r"\binom{3+3-1}{3}=\binom53=10", height=0.59, color=M_GREEN).move_to(at(0,-2.04))
        self.play(FadeIn(rule), run_time=0.6)
        self.wait(1.8)


class HallReassignmentScene(Scene):
    def construct(self):
        from tex_helper import make_directed_edge, make_graph_node
        title = heading("Find room by moving along the alternating path")
        pos = {
            "b": at(-3.5, 1.65), "a": at(-3.5, 0), "c": at(-3.5, -1.65),
            "1": at(3.5, 1.65), "2": at(3.5, 0), "3": at(3.5, -1.65),
        }
        radius = 0.30
        nodes = {v: make_graph_node(v, point, radius=radius) for v, point in pos.items()}
        old_pairs = [("a", "1"), ("c", "2")]
        new_pairs = [("b", "1"), ("a", "2"), ("c", "3")]
        edges = {(a, b): make_directed_edge(pos[a], pos[b], M_DIM, radius)
                 for a, b in old_pairs + new_pairs}
        old = [make_directed_edge(pos[a], pos[b], M_BLUE, radius, stroke_width=4)
               for a, b in old_pairs]
        self.play(FadeIn(title), FadeIn(VGroup(*edges.values(), *nodes.values())), run_time=0.75)
        label = caption("Two choices are assigned. Start from b, which has no match.")
        self.play(FadeIn(VGroup(*old)), FadeIn(label), run_time=0.55)
        self.wait(0.8)
        trace = []
        for a, b in [("b", "1"), ("1", "a"), ("a", "2"), ("2", "c"), ("c", "3")]:
            backward = a.isdigit()
            step = make_directed_edge(pos[a], pos[b], M_YELLOW, radius, curved=0.17 if backward else 0,
                                      stroke_width=4)
            self.play(Create(step), run_time=0.42)
            trace.append(step)
        reached = caption("The last choice, 3, is free.", M_YELLOW)
        free_choice = Circle(radius=radius + 0.14, color=M_YELLOW, stroke_width=3).move_to(pos["3"])
        self.play(Succession(FadeOut(label), FadeIn(reached)), ShowPassingFlash(free_choice), run_time=0.55)
        self.wait(0.9)
        final = [make_directed_edge(pos[a], pos[b], M_GREEN, radius, stroke_width=4)
                 for a, b in new_pairs]
        reassigned = caption("Switch the matched edges. All three are assigned.", M_GREEN)
        self.play(FadeOut(VGroup(*trace, *old)), FadeIn(VGroup(*final)),
                  Succession(FadeOut(reached), FadeIn(reassigned)), run_time=0.75)
        self.wait(1.65)
