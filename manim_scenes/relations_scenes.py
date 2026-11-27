from manim import *
from tex_helper import (
    M_BLUE,
    M_GREEN,
    M_INK,
    M_MUTED,
    M_RED,
    M_YELLOW,
    make_directed_edge,
    make_graph_node,
    make_paren_matrix,
    prose_label,
    tex_mobject,
)


class RelationalProductScene(Scene):
    """Official Slide 130 example on {a, b, c, d}: M_RS = (max_k r_{i,k} * s_{k,j})."""

    def construct(self):
        formula_hdr = tex_mobject(
            r"M_{RS} \;=\; \Bigl(\max_{k \in \{a,b,c,d\}} r_{i,k} \cdot s_{k,j}\Bigr)_{i,j} \;\eqqcolon\; M_R \cdot M_S",
            height=0.52,
            color=M_INK,
        ).to_edge(UP, buff=0.38)

        r_vals = [
            [0, 1, 0, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 1],
        ]
        s_vals = [
            [0, 0, 0, 1],
            [0, 0, 1, 1],
            [1, 0, 0, 0],
            [0, 1, 0, 0],
        ]
        rs_vals = [
            [0, 1, 1, 1],
            [1, 1, 0, 0],
            [0, 0, 0, 0],
            [0, 1, 0, 0],
        ]

        mat_r, r_entries = make_paren_matrix(
            r_vals, lambda i, j, v: M_BLUE if v == 1 else M_MUTED
        )
        mat_s, s_entries = make_paren_matrix(
            s_vals, lambda i, j, v: M_GREEN if v == 1 else M_MUTED
        )
        mat_out, out_entries = make_paren_matrix(
            [[0 for _ in range(4)] for _ in range(4)],
        )

        dot = tex_mobject(r"\cdot", height=0.14, color=M_INK)
        eq = tex_mobject(r"=", height=0.18, color=M_INK)

        row_grp = VGroup(mat_r, dot, mat_s, eq, mat_out).arrange(RIGHT, buff=0.45).shift(UP * 0.12)
        out_dots = {
            index: tex_mobject(r"\cdot", height=0.065, color=M_MUTED).move_to(entry)
            for index, entry in enumerate(out_entries)
        }
        mat_out.remove(mat_out[0])

        lbl_r = tex_mobject(r"M_R", height=0.34, color=M_BLUE).next_to(mat_r, UP, buff=0.22)
        lbl_s = tex_mobject(r"M_S", height=0.34, color=M_GREEN).next_to(mat_s, UP, buff=0.22)
        lbl_o = tex_mobject(r"M_{RS}", height=0.34, color=M_YELLOW).next_to(mat_out, UP, buff=0.22)

        self.play(FadeIn(formula_hdr), run_time=0.6)
        self.play(FadeIn(row_grp), FadeIn(VGroup(*out_dots.values())), FadeIn(lbl_r), FadeIn(lbl_s), FadeIn(lbl_o), run_time=0.8)

        note_tex = tex_mobject(
            r"\text{Row } a \text{ of } M_R \text{ paired with column } c \text{ of } M_S",
            height=0.32,
            color=M_MUTED,
        ).to_edge(DOWN, buff=0.48)
        self.play(FadeIn(note_tex), run_time=0.35)

        steps = [
            (0, 2, 1, r"(M_{RS})_{a,c} = \max(0\cdot 0,\; \mathbf{1\cdot 1},\; 0\cdot 0,\; 1\cdot 0) = 1 \quad (a \xrightarrow{R} b \xrightarrow{S} c)"),
            (0, 0, None, r"(M_{RS})_{a,a} = \max(0\cdot 0,\; 1\cdot 0,\; 0\cdot 1,\; 1\cdot 0) = 0 \quad ((a,a) \notin RS)"),
            (1, 0, 2, r"(M_{RS})_{b,a} = \max(0\cdot 0,\; 0\cdot 0,\; \mathbf{1\cdot 1},\; 1\cdot 0) = 1 \quad (b \xrightarrow{R} c \xrightarrow{S} a)"),
        ]

        for i, j, wit, eq_str in steps:
            r_row = VGroup(*[r_entries[i * 4 + k] for k in range(4)])
            s_col = VGroup(*[s_entries[k * 4 + j] for k in range(4)])
            r_box = SurroundingRectangle(r_row, color=M_BLUE, buff=0.11, corner_radius=0.12, stroke_width=2.0)
            s_box = SurroundingRectangle(s_col, color=M_GREEN, buff=0.11, corner_radius=0.12, stroke_width=2.0)
            next_note = tex_mobject(
                eq_str,
                height=0.34,
                color=M_YELLOW if wit is not None else M_RED,
            ).to_edge(DOWN, buff=0.46)

            self.play(FadeOut(note_tex), run_time=0.15)
            self.play(
                Create(r_box),
                Create(s_box),
                FadeIn(next_note),
                run_time=0.6,
            )
            note_tex = next_note

            target = out_dots.pop(i * 4 + j)
            if wit is not None:
                wr = SurroundingRectangle(r_entries[i * 4 + wit], color=M_YELLOW, buff=0.09, corner_radius=0.1)
                ws = SurroundingRectangle(s_entries[wit * 4 + j], color=M_YELLOW, buff=0.09, corner_radius=0.1)
                self.play(Create(wr), Create(ws), run_time=0.4)
                repl = tex_mobject("1", height=0.30, color=M_YELLOW).move_to(target.get_center())
                self.remove(target)
                self.play(FadeIn(repl), run_time=0.25)
                self.wait(0.45)
                self.play(FadeOut(wr), FadeOut(ws), FadeOut(r_box), FadeOut(s_box), run_time=0.3)
            else:
                repl = tex_mobject("0", height=0.30, color=M_MUTED).move_to(target.get_center())
                self.remove(target)
                self.play(FadeIn(repl), run_time=0.25)
                self.wait(0.45)
                self.play(FadeOut(r_box), FadeOut(s_box), run_time=0.3)

        remaining = []
        for idx, entry in out_dots.items():
            ri, ci = divmod(idx, 4)
            v = rs_vals[ri][ci]
            repl = tex_mobject(
                str(v),
                height=0.30,
                color=M_YELLOW if v == 1 else M_MUTED,
            ).move_to(entry.get_center())
            remaining.append(repl)

        final_note = tex_mobject(
            r"\text{Row } i \text{ of } M_{RS} \text{ is the entrywise OR of rows of } M_S \text{ selected by row } i \text{ of } M_R",
            height=0.31,
            color=M_INK,
        ).to_edge(DOWN, buff=0.46)
        self.play(FadeOut(note_tex), run_time=0.15)
        self.remove(*out_dots.values())
        self.play(FadeIn(VGroup(*remaining)), FadeIn(final_note), run_time=0.60)
        self.wait(1.6)


class ClosureWaveScene(Scene):
    """Official Slide 136/144 example on {1,2,3,4} (2 top-left, 4 top-right, 1 bottom-left, 3 bottom-right)."""

    def construct(self):
        hdr = tex_mobject(
            r"R^* \;=\; \mathrm{Id}_A \cup R^+ \;=\; \mathrm{Id}_A \cup R \cup R^2 \cup R^3 \quad (|A| = 4)",
            height=0.44,
            color=M_INK,
        ).to_edge(UP, buff=0.42)
        self.play(FadeIn(hdr), run_time=0.6)

        # Exact official slide layout: 2 top-left, 4 top-right, 1 bottom-left, 3 bottom-right
        pos = {
            1: np.array([-4.0, -1.45, 0.0]),
            2: np.array([-4.0, 1.15, 0.0]),
            3: np.array([-1.2, -1.45, 0.0]),
            4: np.array([-1.2, 1.15, 0.0]),
        }
        loop_dirs = {
            1: DOWN + LEFT,
            2: UP + LEFT,
            3: DOWN + RIGHT,
            4: UP + RIGHT,
        }

        nodes = {k: make_graph_node(str(k), pos[k], radius=0.33) for k in pos}
        self.play(*[FadeIn(nodes[k]) for k in pos], run_time=0.6)

        r1_pairs = [(1, 3), (2, 1), (2, 4), (3, 1), (3, 2)]
        r1_edges = VGroup(
            *[
                make_directed_edge(
                    pos[u],
                    pos[v],
                    color=M_BLUE,
                    curved=0.22 if (v, u) in r1_pairs else 0.0,
                    loop_out_dir=loop_dirs[u],
                )
                for u, v in r1_pairs
            ]
        )

        title1 = tex_mobject(r"k = 1:\; R^1 = R", height=0.38, color=M_BLUE).move_to([2.95, 0.85, 0])
        sub1 = tex_mobject(
            r"\text{Node } 4 \text{ has no outgoing edges } (4R = \emptyset)",
            height=0.28,
            color=M_MUTED,
        ).next_to(title1, DOWN, buff=0.28)
        self.play(*[Create(e) for e in r1_edges], FadeIn(title1), FadeIn(sub1), run_time=1.0)
        self.wait(0.75)

        r2_new = [(1, 1), (1, 2), (2, 3), (3, 3), (3, 4)]
        r2_edges = VGroup(
            *[
                make_directed_edge(
                    pos[u],
                    pos[v],
                    color=M_YELLOW,
                    curved=0.24 if u != v else 0.0,
                    loop_out_dir=loop_dirs[u],
                )
                for u, v in r2_new
            ]
        )
        title2 = tex_mobject(r"k = 2:\; R \cup R^2", height=0.38, color=M_YELLOW).move_to(title1.get_center())
        sub2 = tex_mobject(
            r"\text{Adds } (1,2),\,(2,3),\,(3,4) \text{ and loops } (1,1),\,(3,3)",
            height=0.28,
            color=M_MUTED,
        ).next_to(title2, DOWN, buff=0.28)
        self.play(FadeOut(title1), FadeOut(sub1), run_time=0.15)
        self.play(
            *[Create(e) for e in r2_edges],
            FadeIn(title2),
            FadeIn(sub2),
            run_time=0.95,
        )
        self.wait(0.75)

        r3_new = [(1, 4), (2, 2)]
        r3_edges = VGroup(
            *[
                make_directed_edge(
                    pos[u],
                    pos[v],
                    color=M_GREEN,
                    curved=-0.24 if u != v else 0.0,
                    loop_out_dir=loop_dirs[u],
                )
                for u, v in r3_new
            ]
        )
        title3 = tex_mobject(r"k = 3:\; R^+ = R \cup R^2 \cup R^3", height=0.38, color=M_GREEN).move_to(title2.get_center())
        sub3 = tex_mobject(
            r"\text{Adds } (1,4) \text{ via } (1,3,2,4) \text{ and } (2,2);\; \text{still } (4,4) \notin R^+",
            height=0.28,
            color=M_MUTED,
        ).next_to(title3, DOWN, buff=0.28)
        self.play(FadeOut(title2), FadeOut(sub2), run_time=0.15)
        self.play(
            *[Create(e) for e in r3_edges],
            FadeIn(title3),
            FadeIn(sub3),
            run_time=0.95,
        )
        self.wait(0.75)

        id4_edge = make_directed_edge(pos[4], pos[4], color=M_RED, loop_out_dir=loop_dirs[4])
        title4 = tex_mobject(r"R^* = \mathrm{Id}_A \cup R^+ = R^{<4}", height=0.38, color=M_INK).move_to(title3.get_center())
        sub4 = tex_mobject(
            r"\mathrm{Id}_A \text{ supplies the } 0\text{-step loop } (4,4) \text{ at sink node } 4",
            height=0.28,
            color=M_RED,
        ).next_to(title4, DOWN, buff=0.28)
        self.play(FadeOut(title3), FadeOut(sub3), run_time=0.15)
        self.play(
            Create(id4_edge),
            nodes[4][0].animate.set_stroke(M_RED, width=3),
            FadeIn(title4),
            FadeIn(sub4),
            run_time=0.95,
        )
        self.wait(1.7)
