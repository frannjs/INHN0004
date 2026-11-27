"""
Part IV (Chapters 12 & 13) Manim 1080p60 Animations:
1. Ch12EeaBezoutScene      -> public/animations/ch12_eea_bezout.mp4
2. Ch13CayleyCosetsCrtScene -> public/animations/ch13_cayley_cosets_crt.mp4
"""

from manim import *
from tex_helper import (
    M_BLUE,
    M_DIM,
    M_GREEN,
    M_INK,
    M_RED,
    M_YELLOW,
    make_directed_edge,
    make_graph_node,
    prose_label,
    tex_mobject,
)


class Ch12EeaBezoutScene(Scene):
    """Follow the divisions and back-substitutions for gcd(17, 24)."""

    def construct(self):
        hdr = tex_mobject(
            r"\gcd(a, b) \;=\; \gcd(b \bmod a,\, a) \;=\; \alpha \cdot a + \beta \cdot b",
            height=0.47,
            color=M_INK,
        ).move_to([0, 3.42, 0])

        # Table geometry on the left half: x in [-6.35, 0.15]
        col_x = [-5.75, -4.55, -3.15, -1.65, -0.45]
        hdr_y = 2.28
        row_y = [1.42, 0.58, -0.26, -1.10]

        col_tex = [r"a", r"b", r"\lfloor b/a \rfloor", r"\alpha", r"\beta"]
        col_cols = [M_BLUE, M_BLUE, M_INK, M_YELLOW, M_YELLOW]
        hdr_mobs = VGroup(
            *[
                tex_mobject(t, height=0.39, color=c).move_to([col_x[idx], hdr_y, 0])
                for idx, (t, c) in enumerate(zip(col_tex, col_cols))
            ]
        )

        h_line = Line([-6.35, 1.90, 0], [0.15, 1.90, 0], color=M_DIM, stroke_width=2.0)
        v_line1 = Line([-3.90, 2.62, 0], [-3.90, -1.52, 0], color=M_DIM, stroke_width=1.8)
        v_line2 = Line([-2.35, 2.62, 0], [-2.35, -1.52, 0], color=M_DIM, stroke_width=1.8)
        table_frame = VGroup(hdr_mobs, h_line, v_line1, v_line2)

        # Right-side explanation panel: centered around x = 3.65
        panel_cx = 3.65
        phase_lbl = prose_label("Divide with remainder", font_size=27, color=M_BLUE).move_to(
            [panel_cx, 2.30, 0]
        )

        self.play(FadeIn(hdr), run_time=0.55)
        self.play(FadeIn(table_frame), FadeIn(phase_lbl), run_time=0.65)

        # Rows: (a, b, k_str, div_tex)
        down_rows = [
            ("17", "24", "1", r"24 \;=\; 1 \cdot 17 + 7 \quad (r = 7)"),
            ("7", "17", "2", r"17 \;=\; 2 \cdot 7 + 3 \quad (r = 3)"),
            ("3", "7", "2", r"7 \;=\; 2 \cdot 3 + 1 \quad (r = 1)"),
            ("1", "3", "3", r"3 = 3\cdot1 + 0 \quad (\gcd=1)"),
        ]

        a_mobs, b_mobs, k_mobs = [], [], []
        step_notes = []

        for idx, (a_s, b_s, k_s, eq_s) in enumerate(down_rows):
            y = row_y[idx]
            is_last = idx == 3
            ma = tex_mobject(a_s, height=0.38, color=M_GREEN if is_last else M_INK).move_to([col_x[0], y, 0])
            mb = tex_mobject(b_s, height=0.38, color=M_INK).move_to([col_x[1], y, 0])
            mk = tex_mobject(k_s, height=0.38, color=M_INK).move_to([col_x[2], y, 0])
            a_mobs.append(ma)
            b_mobs.append(mb)
            k_mobs.append(mk)

            note = tex_mobject(
                eq_s,
                height=0.37,
                max_width=5.8,
                color=M_GREEN if is_last else M_INK,
            ).move_to([panel_cx, y, 0])
            step_notes.append(note)

            self.play(FadeIn(ma), FadeIn(mb), FadeIn(mk), FadeIn(note), run_time=0.55)
            self.wait(0.25)

        gcd_ring = SurroundingRectangle(a_mobs[3], color=M_GREEN, buff=0.11, corner_radius=0.10, stroke_width=2.2)
        al3 = tex_mobject("1", height=0.38, color=M_GREEN).move_to([col_x[3], row_y[3], 0])
        be3 = tex_mobject("0", height=0.38, color=M_GREEN).move_to([col_x[4], row_y[3], 0])

        base_banner = tex_mobject(
            r"1=1\cdot1+0\cdot3 \quad \Longrightarrow \quad (\alpha',\beta')=(1,0)",
            height=0.41,
            max_width=12.4,
            color=M_GREEN,
        ).move_to([0, -2.55, 0])

        self.play(Create(gcd_ring), FadeIn(al3), FadeIn(be3), FadeIn(base_banner), run_time=0.65)
        self.wait(0.55)

        # Phase 2: Upward back-substitution
        phase2_lbl = prose_label("Substitute upward", font_size=27, color=M_YELLOW).move_to(
            [panel_cx, 2.30, 0]
        )
        rule_Formula = tex_mobject(
            r"(\alpha,\beta) = (\beta'-\lfloor b/a\rfloor\alpha',\;\alpha')",
            height=0.39,
            max_width=5.8,
            color=M_YELLOW,
        ).move_to([panel_cx, 1.72, 0])

        self.play(FadeOut(phase_lbl), FadeOut(VGroup(*step_notes)), run_time=0.25)
        self.play(FadeIn(phase2_lbl), FadeIn(rule_Formula), run_time=0.35)

        up_steps = [
            (
                2,
                "-2",
                "1",
                r"\alpha = 0 - 2\cdot 1 = -2,\; \beta = 1",
                r"(-2)\cdot 3 + 1\cdot 7 = 1",
                0.88,
            ),
            (
                1,
                "5",
                "-2",
                r"\alpha = 1 - 2\cdot(-2) = 5,\; \beta = -2",
                r"5\cdot 7 + (-2)\cdot 17 = 1",
                0.02,
            ),
            (
                0,
                "-7",
                "5",
                r"\alpha = -2 - 1\cdot 5 = -7,\; \beta = 5",
                r"(-7)\cdot 17 + 5\cdot 24 = 1",
                -0.84,
            ),
        ]

        al_mobs = {3: al3}
        be_mobs = {3: be3}

        for r_idx, al_s, be_s, upd_tex, chk_tex, py in up_steps:
            y = row_y[r_idx]
            mal = tex_mobject(al_s, height=0.38, color=M_YELLOW).move_to([col_x[3], y, 0])
            mbe = tex_mobject(be_s, height=0.38, color=M_YELLOW).move_to([col_x[4], y, 0])
            al_mobs[r_idx] = mal
            be_mobs[r_idx] = mbe

            row_hi = SurroundingRectangle(
                VGroup(a_mobs[r_idx], b_mobs[r_idx], k_mobs[r_idx], mal, mbe),
                color=M_YELLOW,
                buff=0.10,
                corner_radius=0.10,
                stroke_width=1.8,
            )
            upd_mob = tex_mobject(upd_tex, height=0.36, max_width=5.8, color=M_INK).move_to([panel_cx, py + 0.16, 0])
            chk_mob = tex_mobject(chk_tex, height=0.34, max_width=5.8, color=M_GREEN).move_to([panel_cx, py - 0.25, 0])
            next_banner = tex_mobject(
                chk_tex,
                height=0.42,
                max_width=12.4,
                color=M_YELLOW,
            ).move_to([0, -2.55, 0])

            self.play(
                Create(row_hi),
                FadeIn(mal),
                FadeIn(mbe),
                FadeIn(upd_mob),
                FadeIn(chk_mob),
                Succession(FadeOut(base_banner), FadeIn(next_banner)),
                run_time=0.65,
            )
            base_banner = next_banner
            self.wait(0.45)
            self.play(FadeOut(row_hi), run_time=0.25)

        # Phase 3: Modular inverse payoff
        top_box = SurroundingRectangle(
            VGroup(a_mobs[0], b_mobs[0], k_mobs[0], al_mobs[0], be_mobs[0]),
            color=M_BLUE,
            buff=0.11,
            corner_radius=0.10,
            stroke_width=2.2,
        )
        final_banner = VGroup(
            tex_mobject(r"(-7)\cdot 17+5\cdot24=1 \ \Longrightarrow\ (-7)\cdot17\equiv_{24}1", height=0.43, color=M_BLUE),
            tex_mobject(r"17^{-1}\equiv_{24} -7\equiv_{24} 17", height=0.42, color=M_BLUE),
        ).arrange(DOWN, buff=0.20).move_to([0, -2.72, 0])

        self.play(Create(top_box), Succession(FadeOut(base_banner), FadeIn(final_banner)), run_time=0.85)
        self.wait(1.8)


class Ch13CayleyCosetsCrtScene(Scene):
    """Coset decomposition, Cayley graph, and CRT on Z_21^* = Z_3^* x Z_7^* (Slides pp. 57-58, 72)."""

    def construct(self):
        hdr = tex_mobject(
            r"\text{Right multiplication by } 10 \text{ in } \mathbb{Z}_{21}^*",
            height=0.46,
            max_width=13.2,
            color=M_INK,
        ).move_to([0, 3.45, 0])

        # 2 x 6 grid for Z_21^* matching Slide 53 (p. 72)
        col_x = [-3.10, -1.42, 0.26, 1.94, 3.62, 5.30]
        y_top = 0.78
        y_bot = -1.02
        r_node = 0.37

        top_vals = ["1", "10", "16", "13", "4", "19"]
        bot_vals = ["8", "17", "2", "20", "11", "5"]

        top_nodes = [
            make_graph_node(v, [col_x[c], y_top, 0], radius=r_node, stroke_color=M_BLUE)
            for c, v in enumerate(top_vals)
        ]
        bot_nodes = [
            make_graph_node(v, [col_x[c], y_bot, 0], radius=r_node, stroke_color=M_YELLOW)
            for c, v in enumerate(bot_vals)
        ]

        self.play(FadeIn(hdr), run_time=0.55)
        self.play(
            LaggedStart(*[FadeIn(n) for n in top_nodes + bot_nodes], lag_ratio=0.05),
            run_time=0.85,
        )

        # Build the two 6-cycles for r_10
        top_edges = []
        bot_edges = []
        for c in range(5):
            top_edges.append(
                make_directed_edge(
                    [col_x[c], y_top, 0], [col_x[c + 1], y_top, 0], color=M_BLUE, radius=r_node
                )
            )
            bot_edges.append(
                make_directed_edge(
                    [col_x[c], y_bot, 0], [col_x[c + 1], y_bot, 0], color=M_YELLOW, radius=r_node
                )
            )

        # Return arcs (curving cleanly above top row and below bottom row)
        top_ret = CurvedArrow(
            [col_x[5], y_top + r_node + 0.03, 0],
            [col_x[0], y_top + r_node + 0.03, 0],
            angle=0.25,
            color=M_BLUE,
            stroke_width=2.5,
            tip_length=0.16,
        )
        bot_ret = CurvedArrow(
            [col_x[5], y_bot - r_node - 0.03, 0],
            [col_x[0], y_bot - r_node - 0.03, 0],
            angle=-0.25,
            color=M_YELLOW,
            stroke_width=2.5,
            tip_length=0.16,
        )
        top_edges.append(top_ret)
        bot_edges.append(bot_ret)

        coset_lbl_top = tex_mobject(r"H = \langle 10 \rangle", height=0.39, color=M_BLUE).move_to([-5.35, y_top, 0])
        coset_lbl_bot = tex_mobject(r"8H", height=0.39, color=M_YELLOW).move_to(
            [-5.35, y_bot, 0]
        )

        lagrange_banner = tex_mobject(
            r"|\mathbb{Z}_{21}^*| = 2\,|\langle 10 \rangle| = 2\cdot6 = 12",
            height=0.45,
            max_width=13.0,
            color=M_INK,
        ).move_to([0, -2.95, 0])

        self.play(
            LaggedStart(*[Create(e) for e in top_edges], lag_ratio=0.08),
            FadeIn(coset_lbl_top),
            run_time=0.9,
        )
        self.play(
            LaggedStart(*[Create(e) for e in bot_edges], lag_ratio=0.08),
            FadeIn(coset_lbl_bot),
            FadeIn(lagrange_banner),
            run_time=0.9,
        )
        self.wait(0.85)

        # Act 2: Add generator 8 (ord(8) = 2) -> connected Cayley graph Gamma(Z_21^*, {8, 10}) & CRT coordinates
        hdr_crt = tex_mobject(
            r"\Gamma(\mathbb{Z}_{21}^*,\{8,10\}) \cong \Gamma(\mathbb{Z}_3^*,\{2\}) \mathbin{\square} \Gamma(\mathbb{Z}_7^*,\{3\})",
            height=0.46,
            max_width=13.0,
            color=M_INK,
        ).move_to([0, 3.45, 0])

        gen8_edges = []
        for c in range(6):
            gen8_edges.append(
                make_directed_edge(
                    [col_x[c], y_top, 0],
                    [col_x[c], y_bot, 0],
                    color=M_GREEN,
                    radius=r_node,
                    curved=0.22,
                )
            )
            gen8_edges.append(
                make_directed_edge(
                    [col_x[c], y_bot, 0],
                    [col_x[c], y_top, 0],
                    color=M_GREEN,
                    radius=r_node,
                    curved=0.22,
                )
            )

        z7_hdr_lbl = tex_mobject(r"x \bmod 7", height=0.38, color=M_INK).move_to([-5.35, 2.38, 0])
        z7_vals = ["1", "3", "2", "6", "4", "5"]
        z7_mobs = VGroup(
            *[
                tex_mobject(v, height=0.38, color=M_RED).move_to([col_x[c], 2.38, 0])
                for c, v in enumerate(z7_vals)
            ]
        )

        z3_top = tex_mobject(r"x \equiv_3 1", height=0.38, color=M_GREEN).move_to([-5.35, y_top, 0])
        z3_bot = tex_mobject(r"x \equiv_3 2", height=0.38, color=M_GREEN).move_to([-5.35, y_bot, 0])

        crt_banner = tex_mobject(
            r"h(x) = (x \bmod 3,\; x \bmod 7), \qquad h^{-1}(x_3, x_7) = (7x_3 - 6x_7) \bmod 21",
            height=0.43,
            max_width=13.0,
            color=M_GREEN,
        ).move_to([0, -2.95, 0])

        self.play(FadeOut(VGroup(hdr, coset_lbl_top, coset_lbl_bot, lagrange_banner)), run_time=0.28)
        self.play(
            FadeIn(hdr_crt),
            LaggedStart(*[Create(e) for e in gen8_edges], lag_ratio=0.04),
            FadeIn(z3_top),
            FadeIn(z3_bot),
            FadeIn(z7_hdr_lbl),
            FadeIn(z7_mobs),
            FadeIn(crt_banner),
            run_time=1.15,
        )
        self.wait(0.65)

        # Highlight CRT reconstruction on node 20 <-> (x_3 = 2, x_7 = 6) at column 3, bottom row
        hi_z3 = SurroundingRectangle(z3_bot, color=M_YELLOW, buff=0.10, corner_radius=0.10, stroke_width=2.0)
        hi_z7 = SurroundingRectangle(z7_mobs[3], color=M_YELLOW, buff=0.11, corner_radius=0.10, stroke_width=2.0)
        hi_node = SurroundingRectangle(bot_nodes[3], color=M_YELLOW, buff=0.10, corner_radius=0.14, stroke_width=2.4)

        wit_banner = tex_mobject(
            r"h^{-1}(2,6) = (7\cdot2-6\cdot6) \bmod21 = 20",
            height=0.45,
            max_width=13.2,
            color=M_YELLOW,
        ).move_to([0, -2.95, 0])

        self.play(
            Create(hi_z3),
            Create(hi_z7),
            Create(hi_node),
            Succession(FadeOut(crt_banner), FadeIn(wit_banner)),
            run_time=0.85,
        )
        self.wait(1.8)
