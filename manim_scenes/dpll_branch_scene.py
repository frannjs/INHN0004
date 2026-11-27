from manim import Arrow, Create, DOWN, FadeIn, FadeOut, RoundedRectangle, Scene, Succession, UP, VGroup, there_and_back
from tex_helper import M_BLUE, M_GREEN, M_INK, M_NODE_FILL, M_RED, M_YELLOW, prose_label, tex_mobject


class DpllBacktrackScene(Scene):
    """Show the failed branch, return to its parent, and find a model."""

    def construct(self):
        def clause_node(formula, x, y, color=M_BLUE, max_width=10.8):
            label = tex_mobject(formula, height=0.39, max_width=max_width)
            frame = RoundedRectangle(
                width=label.width + 0.46,
                height=0.73,
                corner_radius=0.13,
                color=color,
                stroke_width=1.8,
                fill_color=M_NODE_FILL,
                fill_opacity=1,
            )
            return VGroup(frame, label).move_to([x, y, 0])

        def step(start, end, color):
            return Arrow(start, end, buff=0.06, color=color, stroke_width=2.2, tip_length=0.13)

        def edge_label(rule, assignment, x, y):
            return VGroup(
                prose_label(rule, 25, M_INK),
                tex_mobject(assignment, height=0.32, color=M_YELLOW),
            ).arrange(buff=0.15).move_to([x, y, 0])

        def caption(text):
            return prose_label(text, 27, M_INK).move_to([0, -3.35, 0])

        initial = clause_node(
            r"\{\{\neg p,q\},\{\neg p,\neg q\},\{p,r\},\{p,\neg r,s\},\{p,\neg s,r\}\}",
            0, 2.97,
        )
        first = clause_node(r"\{\{q\},\{\neg q\}\}", -3.45, 1.28)
        failure = clause_node(r"\{\varnothing\}", -3.45, -0.44, M_RED)
        second = clause_node(r"\{\{r\},\{\neg r,s\},\{\neg s,r\}\}", 3.45, 1.28, max_width=5.9)
        one_unit = clause_node(r"\{\{s\}\}", 3.45, -0.44)
        success = clause_node(r"\varnothing", 3.45, -2.16, M_GREEN)

        branch_true = step(initial.get_bottom() + [-1.7, 0, 0], first.get_top(), M_BLUE)
        branch_false = step(initial.get_bottom() + [1.7, 0, 0], second.get_top(), M_BLUE)
        unit_q = step(first.get_bottom(), failure.get_top(), M_RED)
        unit_r = step(second.get_bottom(), one_unit.get_top(), M_BLUE)
        unit_s = step(one_unit.get_bottom(), success.get_top(), M_GREEN)

        left_branch = edge_label("Branch", "p=1", -3.68, 2.22)
        right_branch = edge_label("Branch", "p=0", 3.68, 2.22)
        left_unit = edge_label("OLR", "q=1", -2.23, 0.42)
        right_first_unit = edge_label("OLR", "r=1", 4.67, 0.42)
        right_second_unit = edge_label("OLR", "s=1", 4.67, -1.30)
        fail_text = prose_label("Contains an empty clause", 24, M_RED).next_to(failure, DOWN, buff=0.24)
        win_text = prose_label("No clauses remain", 24, M_GREEN).next_to(success, DOWN, buff=0.24)

        begin = caption("No unit or pure literal. Branch on p.")
        backtrack = caption("Backtrack to the original set.")
        finish = caption("The successful path fixes p, r, and s. The value of q is free.")

        self.play(FadeIn(initial), FadeIn(begin), run_time=0.7)
        self.wait(1.0)
        self.play(Create(branch_true), FadeIn(left_branch), FadeIn(first, shift=0.10 * UP), run_time=0.9)
        self.wait(0.9)
        self.play(Create(unit_q), FadeIn(left_unit), FadeIn(failure), FadeIn(fail_text), run_time=0.9)
        self.play(Succession(FadeOut(begin), FadeIn(backtrack)), run_time=0.45)
        self.wait(1.3)
        self.play(
            initial[0].animate(rate_func=there_and_back).set_stroke(color=M_YELLOW, width=5),
            run_time=0.8,
        )
        self.play(Create(branch_false), FadeIn(right_branch), FadeIn(second, shift=0.10 * UP), run_time=0.9)
        self.wait(0.9)
        self.play(Create(unit_r), FadeIn(right_first_unit), FadeIn(one_unit), run_time=0.85)
        self.wait(0.75)
        self.play(Create(unit_s), FadeIn(right_second_unit), FadeIn(success), FadeIn(win_text), run_time=0.85)
        self.play(Succession(FadeOut(backtrack), FadeIn(finish)), run_time=0.45)
        self.wait(2.8)
