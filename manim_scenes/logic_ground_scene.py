from manim import Arrow, Create, DOWN, FadeIn, FadeOut, Scene, SurroundingRectangle, UP, VGroup
from tex_helper import M_BLUE, M_INK, M_RED, prose_label, tex_mobject


class HerbrandExpansionScene(Scene):
    """Follow the first two ground substitutions and the resulting refutation."""

    def construct(self):
        formula = tex_mobject(
            r"\forall x\bigl(P(x)\land\neg P(f(x))\bigr)",
            height=0.48,
        ).move_to([0, 3.10, 0])
        constant = prose_label("Start with a fresh constant a", 28).next_to(formula, DOWN, buff=0.33)

        first_term = tex_mobject(r"k=0:\quad x=a", height=0.36, color=M_BLUE).move_to([-3.55, 0.95, 0])
        first_positive = tex_mobject(r"\{P(a)\}", height=0.44).move_to([-0.25, 0.95, 0])
        first_negative = tex_mobject(r"\{\neg P(f(a))\}", height=0.44).move_to([3.10, 0.95, 0])
        first_row = VGroup(first_positive, first_negative)
        feasible = prose_label("These two clauses can both be true", 28).move_to([0, -0.35, 0])

        next_term = tex_mobject(r"k=1:\quad x=f(a)", height=0.36, color=M_BLUE).move_to([-3.55, -0.55, 0])
        next_positive = tex_mobject(r"\{P(f(a))\}", height=0.44).move_to([-0.25, -0.55, 0])
        next_negative = tex_mobject(r"\{\neg P(f(f(a)))\}", height=0.44).move_to([4.10, -0.55, 0])
        next_row = VGroup(next_positive, next_negative)

        negative_frame = SurroundingRectangle(first_negative, color=M_RED, buff=0.17, corner_radius=0.12)
        positive_frame = SurroundingRectangle(next_positive, color=M_RED, buff=0.17, corner_radius=0.12)
        empty_clause = tex_mobject(r"\varnothing", height=0.44, color=M_RED).move_to([1.44, -2.43, 0])
        arrows = [
            Arrow(
                frame.get_bottom(), empty_clause.get_top() + [offset, 0, 0],
                buff=0.20, color=M_RED, max_tip_length_to_length_ratio=0.13,
            )
            for frame, offset in ((negative_frame, 0.13), (positive_frame, -0.13))
        ]
        result = tex_mobject(r"\text{Resolve on } P(f(a))", height=0.43, color=M_INK).move_to([0, -3.35, 0])

        self.play(FadeIn(formula), FadeIn(constant), run_time=0.65)
        self.play(FadeIn(first_term), run_time=0.55)
        self.play(FadeIn(first_row, shift=0.15 * UP), FadeIn(feasible), run_time=0.75)
        self.wait(1.3)
        self.play(FadeOut(feasible), run_time=0.24)
        self.play(FadeIn(next_term), FadeIn(next_row, shift=0.15 * UP), run_time=0.85)
        self.wait(1.1)
        self.play(Create(negative_frame), Create(positive_frame), run_time=0.65)
        self.play(*(Create(arrow) for arrow in arrows), FadeIn(empty_clause), run_time=0.85)
        self.play(FadeIn(result), run_time=0.50)
        self.wait(2.1)
