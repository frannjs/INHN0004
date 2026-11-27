"""Two course proofs in motion, using the same conventions as the graph chapters."""
import numpy as np
from manim import *
from tex_helper import M_BLUE, M_DIM, M_GREEN, M_INK, M_MUTED, M_RED, M_YELLOW
from tex_helper import make_directed_edge, make_graph_node, make_undirected_edge, prose_label, tex_mobject

class CatalanReflectionScene(Scene):
    def construct(self):
        title = prose_label("Fix the first failure, then reflect the suffix", font_size=38)
        title.to_edge(UP, buff=0.42)
        origin = np.array([-3.10, -2.08, 0])
        stride = 1.17

        def grid_point(i, j):
            return origin + np.array([stride * i, stride * j, 0])

        grid = VGroup(*(Line(grid_point(i, 0), grid_point(i, 4), color=M_DIM, stroke_width=1)
                        for i in range(5)),
                      *(Line(grid_point(0, i), grid_point(4, i), color=M_DIM, stroke_width=1)
                        for i in range(5)))
        diagonal = DashedLine(grid_point(0, 0), grid_point(4, 4), color=M_MUTED)
        axis_x = tex_mobject("x", height=0.22, color=M_MUTED).next_to(grid_point(4, 0), DOWN, buff=0.16)
        axis_y = tex_mobject("y", height=0.22, color=M_MUTED).next_to(grid_point(0, 4), LEFT, buff=0.16)
        self.play(FadeIn(title), FadeIn(VGroup(grid, diagonal, axis_x, axis_y)), run_time=0.66)
        word = "xxyyyx"
        positions = [(0, 0)]
        for letter in word:
            i, j = positions[-1]
            positions.append((i + int(letter == "x"), j + int(letter == "y")))
        edges = []
        letters = []
        for index, (start, end) in enumerate(zip(positions, positions[1:])):
            color = M_RED if index == 4 else M_YELLOW if index == 5 else M_BLUE
            edge = Arrow(grid_point(*start), grid_point(*end), buff=0, color=color, stroke_width=4)
            letter = tex_mobject(word[index], height=0.25, color=color).move_to([3 + 0.52 * index, 1.18, 0])
            edges.append(edge)
            letters.append(letter)
            self.play(GrowArrow(edge), FadeIn(letter), run_time=0.33)
        threshold = prose_label("First failure", font_size=23, color=M_RED).move_to([4.32, 0.1, 0])
        label = tex_mobject(r"(3,3)", height=0.22, color=M_YELLOW).next_to(grid_point(3, 3), RIGHT, buff=0.18)
        self.play(FadeIn(label), FadeIn(threshold), run_time=0.5)
        self.wait(1.08)

        reflected = Arrow(grid_point(2, 3), grid_point(2, 4), buff=0, color=M_GREEN, stroke_width=5)
        replacement = tex_mobject("y", height=0.25, color=M_GREEN).move_to(letters[-1])
        end_label = tex_mobject(r"(2,4)", height=0.22, color=M_GREEN).next_to(grid_point(2, 4), RIGHT, buff=0.18)
        ending = prose_label("Now two opens and four closes.", font_size=22, color=M_GREEN).move_to([4.3, -0.65, 0])
        self.play(ReplacementTransform(edges[-1], reflected),
                  Succession(FadeOut(letters[-1]), FadeIn(replacement)),
                  Succession(FadeOut(label), FadeIn(end_label)), FadeIn(ending), run_time=0.74)
        reverse_hint = prose_label("The same first failure tells us where to reverse.", font_size=26)
        reverse_hint.to_edge(DOWN, buff=0.46)
        self.play(FadeIn(reverse_hint), run_time=0.45)
        self.wait(1.55)


class EulerCycleSpliceScene(Scene):
    def construct(self):
        title = prose_label("Insert a second closed trail at the shared vertex", font_size=38)
        title.to_edge(UP, buff=0.44)
        pos = {
            "s": np.array([0, 0.08, 0]),
            "a": np.array([-2.75, 1.35, 0]),
            "b": np.array([-2.75, -1.25, 0]),
            "c": np.array([2.75, 1.35, 0]),
            "d": np.array([2.75, -1.25, 0]),
        }
        radius = 0.32
        nodes = {v: make_graph_node(v, point, radius=radius) for v, point in pos.items()}
        first = ["s", "a", "b", "s"]
        second = ["s", "c", "d", "s"]
        left = list(zip(first, first[1:]))
        right = list(zip(second, second[1:]))
        edges = VGroup(*(make_undirected_edge(pos[u], pos[v], M_DIM, radius=radius) for u, v in left + right))
        self.play(FadeIn(title), FadeIn(VGroup(edges, *nodes.values())), run_time=0.7)
        cursor = Dot(color=M_BLUE, radius=0.066).move_to(pos["s"] + 0.46 * UP)
        self.play(FadeIn(cursor), run_time=0.4)
        for pairs, color in ((left, M_BLUE), (right, M_GREEN)):
            for u, v in pairs:
                edge = make_directed_edge(pos[u], pos[v], color, radius=radius, stroke_width=4)
                self.play(Create(edge), cursor.animate.set_color(color).move_to(pos[v] + 0.46 * UP), run_time=0.46)
            shared_vertex = Circle(radius=radius + 0.21, color=color, stroke_width=3).move_to(pos["s"])
            self.play(ShowPassingFlash(shared_vertex), run_time=0.42)
            self.wait(0.6)
        route = tex_mobject(r"s,\ a,\ b,\ s,\ c,\ d,\ s", height=0.42, color=M_INK)
        route.move_to([0, -2.30, 0])
        cue = prose_label("Six edges appear once. The vertex s can appear again.", font_size=26)
        cue.to_edge(DOWN, buff=0.46)
        self.play(FadeOut(cursor), FadeIn(route), FadeIn(cue), run_time=0.66)
        self.wait(1.5)
