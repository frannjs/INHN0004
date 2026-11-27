import numpy as np
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
    make_undirected_edge,
    prose_label,
    tex_mobject,
)


class HasseReductionScene(Scene):
    """Hasse diagram reduction H_R = R_s \\ R_s^2 on the divisor poset (D_12, |)."""

    def construct(self):
        hdr = tex_mobject(
            r"H_R \;\coloneqq\; R_s \setminus R_s^2, \quad R_s \;\coloneqq\; R \setminus \mathrm{Id}_A \quad (A = D_{12} = \{1,2,3,4,6,12\},\; R = {\mid})",
            height=0.40,
            max_width=13.0,
            color=M_INK,
        ).to_edge(UP, buff=0.30)
        self.play(FadeIn(hdr), run_time=0.6)

        # Clean ranked coordinates on the left half of the 14.2 x 8.0 frame
        pos = {
            1: np.array([-3.55, -2.05, 0.0]),
            2: np.array([-5.05, -0.68, 0.0]),
            3: np.array([-2.05, -0.68, 0.0]),
            4: np.array([-5.05, 0.68, 0.0]),
            6: np.array([-2.05, 0.68, 0.0]),
            12: np.array([-3.55, 2.05, 0.0]),
        }
        loop_dirs = {
            1: DOWN + LEFT * 0.45,
            2: LEFT,
            3: RIGHT,
            4: LEFT,
            6: RIGHT,
            12: UP + LEFT * 0.45,
        }

        order_elems = [1, 2, 3, 4, 6, 12]
        nodes = {v: make_graph_node(str(v), pos[v], radius=0.30) for v in order_elems}

        # Partition R into Id_A (6), H_R (7 covering edges), and R_s^2 (5 transitive shortcuts)
        loop_edges = VGroup(
            *[
                make_directed_edge(
                    pos[v], pos[v], color=M_RED, radius=0.30, loop_out_dir=loop_dirs[v], stroke_width=2.3
                )
                for v in order_elems
            ]
        )

        cover_pairs = [(1, 2), (1, 3), (2, 4), (2, 6), (3, 6), (4, 12), (6, 12)]
        cover_edges = VGroup(
            *[
                make_directed_edge(pos[u], pos[v], color=M_BLUE, radius=0.30, stroke_width=2.7)
                for u, v in cover_pairs
            ]
        )

        # Gentle outward curves so shortcuts never pass through intermediate node circles
        shortcut_specs = [
            (1, 4, -0.42),
            (1, 6, 0.42),
            (1, 12, 0.16),
            (2, 12, -0.42),
            (3, 12, 0.42),
        ]
        shortcut_edges = VGroup(
            *[
                make_directed_edge(
                    pos[u], pos[v], color=M_YELLOW, radius=0.30, curved=ang, stroke_width=2.1
                )
                for u, v, ang in shortcut_specs
            ]
        )

        # Right-hand 6x6 Boolean matrix in topological order (1, 2, 3, 4, 6, 12)
        shortcut_set = {(u, v) for u, v, _ in shortcut_specs}
        cover_set = set(cover_pairs)

        def mat_grid_for(mode: str):
            grid = []
            for u in order_elems:
                row = []
                for v in order_elems:
                    if v % u != 0:
                        row.append(0)
                    elif u == v:
                        row.append(1 if mode == "full" else 0)
                    elif (u, v) in shortcut_set:
                        row.append(1 if mode in ("full", "strict") else 0)
                    else:
                        row.append(1)
                grid.append(row)
            return grid

        def color_full(i, j, val):
            if val == 0:
                return M_MUTED
            u, v = order_elems[i], order_elems[j]
            if u == v:
                return M_RED
            if (u, v) in shortcut_set:
                return M_YELLOW
            return M_BLUE

        mat_r, mat_entries = make_paren_matrix(
            mat_grid_for("full"), color_full, cell_h=0.23, h_buff=0.34, v_buff=0.23
        )
        mat_r.move_to([3.25, -0.15, 0.0])

        # Row and column headers for the 6x6 matrix
        col_hdrs = VGroup(
            *[
                tex_mobject(str(v), height=0.20, color=M_MUTED).move_to(
                    [mat_entries[j].get_center()[0], mat_r.get_top()[1] + 0.25, 0.0]
                )
                for j, v in enumerate(order_elems)
            ]
        )
        row_hdrs = VGroup(
            *[
                tex_mobject(str(v), height=0.20, color=M_MUTED).move_to(
                    [mat_r.get_left()[0] - 0.26, mat_entries[i * 6].get_center()[1], 0.0]
                )
                for i, v in enumerate(order_elems)
            ]
        )

        stage_lbl = tex_mobject(
            r"M_R:\; 18\text{ pairs } (\text{upper-triangular})",
            height=0.31,
            color=M_INK,
        ).move_to([3.25, 2.15, 0.0])

        foot = prose_label(
            "Divisibility includes 6 self-loops, 5 shortcuts, and 7 covers.",
            font_size=22,
            color=M_MUTED,
        ).to_edge(DOWN, buff=0.30)

        self.play(
            *[FadeIn(nodes[v]) for v in order_elems],
            FadeIn(mat_r),
            FadeIn(col_hdrs),
            FadeIn(row_hdrs),
            FadeIn(stage_lbl),
            FadeIn(foot),
            run_time=0.8,
        )
        self.play(
            *[Create(e) for e in cover_edges],
            *[Create(e) for e in shortcut_edges],
            *[Create(e) for e in loop_edges],
            run_time=1.1,
        )
        self.wait(0.85)

        # Stage 2: Remove Id_A -> Strict order R_s
        stage_lbl_2 = tex_mobject(
            r"M_{R_s} = M_{R \setminus \mathrm{Id}_A}:\; 12\text{ strict pairs}",
            height=0.31,
            color=M_RED,
        ).move_to(stage_lbl.get_center())
        foot_2 = prose_label(
            "Remove all 6 self-loops to get the strict order.",
            font_size=22,
            color=M_RED,
        ).to_edge(DOWN, buff=0.30)

        diag_boxes = VGroup(
            *[
                SurroundingRectangle(mat_entries[i * 6 + i], color=M_RED, buff=0.06, corner_radius=0.07, stroke_width=1.8)
                for i in range(6)
            ]
        )
        self.play(FadeOut(stage_lbl), FadeOut(foot), run_time=0.15)
        self.play(
            Create(diag_boxes),
            FadeIn(stage_lbl_2),
            FadeIn(foot_2),
            run_time=0.65,
        )

        diag_entries = [mat_entries[i * 6 + i] for i in range(6)]
        diag_zeros = [tex_mobject("0", height=0.23, color=M_MUTED).move_to(entry) for entry in diag_entries]

        self.play(
            FadeOut(loop_edges),
            FadeOut(diag_boxes),
            *(FadeOut(entry) for entry in diag_entries),
            run_time=0.75,
        )
        self.add(*diag_zeros)
        self.wait(0.75)

        # Stage 3: Remove two-step shortcuts R_s^2
        stage_lbl_3 = tex_mobject(
            r"M_{H_R} = M_{R_s \setminus R_s^2}:\; 7\text{ covering pairs}",
            height=0.31,
            color=M_YELLOW,
        ).move_to(stage_lbl.get_center())
        foot_3 = prose_label(
            "Remove shortcuts whose endpoints already have a two-step path.",
            font_size=22,
            color=M_YELLOW,
        ).to_edge(DOWN, buff=0.30)

        shortcut_indices = [
            i * 6 + j
            for i, u in enumerate(order_elems)
            for j, v in enumerate(order_elems)
            if (u, v) in shortcut_set
        ]
        sc_boxes = VGroup(
            *[
                SurroundingRectangle(mat_entries[idx], color=M_YELLOW, buff=0.06, corner_radius=0.07, stroke_width=1.8)
                for idx in shortcut_indices
            ]
        )
        self.play(FadeOut(stage_lbl_2), FadeOut(foot_2), run_time=0.15)
        self.play(
            Create(sc_boxes),
            FadeIn(stage_lbl_3),
            FadeIn(foot_3),
            run_time=0.75,
        )
        self.wait(0.55)

        shortcut_entries = [mat_entries[i] for i in shortcut_indices]
        shortcut_zeros = [tex_mobject("0", height=0.23, color=M_MUTED).move_to(entry) for entry in shortcut_entries]

        self.play(
            FadeOut(shortcut_edges),
            FadeOut(sc_boxes),
            *(FadeOut(entry) for entry in shortcut_entries),
            run_time=0.85,
        )
        self.add(*shortcut_zeros)
        self.wait(0.75)

        # Stage 4: Upward Hasse convention & H_R^* = R
        hasse_lines = VGroup(
            *[
                make_undirected_edge(pos[u], pos[v], color=M_GREEN, radius=0.30, stroke_width=3.0)
                for u, v in cover_pairs
            ]
        )
        cover_indices = [
            i * 6 + j
            for i, u in enumerate(order_elems)
            for j, v in enumerate(order_elems)
            if (u, v) in cover_set
        ]
        stage_lbl_4 = tex_mobject(
            r"\text{Hasse diagram } H_R \text{ with } H_R^* = R",
            height=0.32,
            color=M_GREEN,
        ).move_to(stage_lbl.get_center())
        foot_4 = prose_label(
            "Paths upward recover the comparisons. Staying put supplies the loops.",
            font_size=22,
            color=M_GREEN,
        ).to_edge(DOWN, buff=0.30)

        self.play(FadeOut(stage_lbl_3), FadeOut(foot_3), run_time=0.15)
        self.play(
            FadeOut(cover_edges),
            FadeIn(hasse_lines),
            *(mat_entries[index].animate.set_color(M_GREEN) for index in cover_indices),
            FadeIn(stage_lbl_4),
            FadeIn(foot_4),
            run_time=0.95,
        )
        self.wait(1.8)


class PermutationCyclesScene(Scene):
    """Disjoint cycle decomposition on [7] and right-to-left composition (f o g)(x) = f(g(x))."""

    def construct(self):
        hdr = tex_mobject(
            r"\text{Disjoint cycles on } [7] \quad \text{and} \quad (f \circ g)(x) = f(g(x))",
            height=0.39,
            max_width=13.0,
            color=M_INK,
        ).to_edge(UP, buff=0.30)
        self.play(FadeIn(hdr), run_time=0.6)

        # Two-line table of f at upper-center
        twoline_f = tex_mobject(
            r"f \;=\; \begin{pmatrix} 1 & 2 & 3 & 4 & 5 & 6 & 7 \\ 4 & 5 & 2 & 7 & 3 & 6 & 1 \end{pmatrix}",
            height=0.76,
            color=M_INK,
        ).move_to([-2.95, 2.05, 0.0])

        cycle_eq = tex_mobject(
            r"(1,\,4,\,7)",
            height=0.36,
            color=M_BLUE,
        ).move_to([3.05, 2.05, 0.0])

        # Disjoint cycle geometry for f across y in [-2.05, +0.55]
        pos_f = {
            1: np.array([-5.05, 0.48, 0.0]),
            4: np.array([-3.75, -1.55, 0.0]),
            7: np.array([-6.05, -1.55, 0.0]),
            2: np.array([-0.55, 0.48, 0.0]),
            5: np.array([0.75, -1.55, 0.0]),
            3: np.array([-1.55, -1.55, 0.0]),
            6: np.array([3.65, -0.55, 0.0]),
        }

        nodes = {k: make_graph_node(str(k), pos_f[k], radius=0.31) for k in range(1, 8)}

        foot = prose_label(
            "Every finite permutation decomposes into vertex-disjoint directed cycles.",
            font_size=18,
            color=M_MUTED,
        ).to_edge(DOWN, buff=0.30)

        self.play(
            FadeIn(twoline_f),
            *[FadeIn(nodes[k]) for k in range(1, 8)],
            FadeIn(foot),
            run_time=0.75,
        )

        # Trace Cycle 1: (1, 4, 7)
        c1_edges = VGroup(
            make_directed_edge(pos_f[1], pos_f[4], color=M_BLUE, radius=0.31, stroke_width=2.8),
            make_directed_edge(pos_f[4], pos_f[7], color=M_BLUE, radius=0.31, stroke_width=2.8),
            make_directed_edge(pos_f[7], pos_f[1], color=M_BLUE, radius=0.31, stroke_width=2.8),
        )
        foot_c1 = prose_label(
            "Start at 1:  1 -> 4 -> 7 -> 1 closes the 3-cycle (1, 4, 7).",
            font_size=18,
            color=M_BLUE,
        ).to_edge(DOWN, buff=0.30)

        self.play(FadeOut(foot), run_time=0.15)
        self.play(
            *[nodes[k][0].animate.set_stroke(M_BLUE, width=2.6) for k in (1, 4, 7)],
            Create(c1_edges[0]),
            Create(c1_edges[1]),
            Create(c1_edges[2]),
            FadeIn(cycle_eq),
            FadeIn(foot_c1),
            run_time=0.95,
        )
        self.wait(0.55)

        # Trace Cycle 2: (2, 5, 3)
        c2_edges = VGroup(
            make_directed_edge(pos_f[2], pos_f[5], color=M_GREEN, radius=0.31, stroke_width=2.8),
            make_directed_edge(pos_f[5], pos_f[3], color=M_GREEN, radius=0.31, stroke_width=2.8),
            make_directed_edge(pos_f[3], pos_f[2], color=M_GREEN, radius=0.31, stroke_width=2.8),
        )
        cycle_eq_2 = tex_mobject(
            r"(1,\,4,\,7)(2,\,5,\,3)",
            height=0.36,
            color=M_GREEN,
        ).move_to(cycle_eq.get_center())
        foot_c2 = prose_label(
            "Next unvisited element 2:  2 -> 5 -> 3 -> 2 closes the disjoint 3-cycle (2, 5, 3).",
            font_size=18,
            color=M_GREEN,
        ).to_edge(DOWN, buff=0.30)

        self.play(FadeOut(cycle_eq), FadeOut(foot_c1), run_time=0.15)
        self.play(
            *[nodes[k][0].animate.set_stroke(M_GREEN, width=2.6) for k in (2, 5, 3)],
            Create(c2_edges[0]),
            Create(c2_edges[1]),
            Create(c2_edges[2]),
            FadeIn(cycle_eq_2),
            FadeIn(foot_c2),
            run_time=0.95,
        )
        self.wait(0.55)

        def fixed_point_loop(center):
            right = center + RIGHT * 0.16 + UP * 0.28
            left = center + LEFT * 0.16 + UP * 0.28
            return ArcBetweenPoints(right, left, angle=3 * PI / 2, color=M_YELLOW, stroke_width=2.8).add_tip(
                tip_length=0.14, tip_width=0.14,
            )

        c3_loop = fixed_point_loop(pos_f[6])
        cycle_eq_3 = tex_mobject(
            r"f \;=\; (1,4,7)(2,5,3)(6) \;=\; (1,4,7)(2,5,3)",
            height=0.33,
            max_width=6.8,
            color=M_YELLOW,
        ).move_to([3.05, 2.05, 0.0])
        foot_c3 = prose_label(
            "6 -> 6 is a fixed point (1-cycle): omitted by convention when the domain [7] is fixed.",
            font_size=18,
            color=M_YELLOW,
        ).to_edge(DOWN, buff=0.30)

        self.play(FadeOut(cycle_eq_2), FadeOut(foot_c2), run_time=0.15)
        self.play(
            nodes[6][0].animate.set_stroke(M_YELLOW, width=2.6),
            Create(c3_loop),
            FadeIn(cycle_eq_3),
            FadeIn(foot_c3),
            run_time=0.85,
        )
        self.wait(0.95)

        # Stage 2: Compose f o g where g = (1,4)(2,6)(3,7,5)
        self.play(
            FadeOut(c1_edges),
            FadeOut(c2_edges),
            FadeOut(c3_loop),
            FadeOut(twoline_f),
            FadeOut(cycle_eq_3),
            FadeOut(foot_c3),
            *[FadeOut(node) for node in nodes.values()],
            run_time=0.55,
        )

        comp_top = tex_mobject(
            r"f = (1,4,7)(2,5,3),\quad g = (1,4)(2,6)(3,7,5) \quad\Longrightarrow\quad (f \circ g)(x) = f(g(x)) = (gf)(x)",
            height=0.35,
            max_width=12.8,
            color=M_INK,
        ).move_to([0.0, 2.15, 0.0])

        # Reposition nodes into the disjoint cycles of f o g = (1, 7, 3)(2, 6, 5)(4)
        pos_fg = {
            1: np.array([-4.65, 0.55, 0.0]),
            7: np.array([-3.35, -1.50, 0.0]),
            3: np.array([-5.65, -1.50, 0.0]),
            2: np.array([0.05, 0.55, 0.0]),
            6: np.array([1.35, -1.50, 0.0]),
            5: np.array([-0.95, -1.50, 0.0]),
            4: np.array([4.35, -0.50, 0.0]),
        }

        nodes = {k: make_graph_node(str(k), pos_fg[k], radius=0.31) for k in pos_fg}
        self.play(FadeIn(comp_top), *[FadeIn(node) for node in nodes.values()], run_time=0.6)

        fg_c1 = VGroup(
            make_directed_edge(pos_fg[1], pos_fg[7], color=M_BLUE, radius=0.31, stroke_width=2.8),
            make_directed_edge(pos_fg[7], pos_fg[3], color=M_BLUE, radius=0.31, stroke_width=2.8),
            make_directed_edge(pos_fg[3], pos_fg[1], color=M_BLUE, radius=0.31, stroke_width=2.8),
        )
        fg_c2 = VGroup(
            make_directed_edge(pos_fg[2], pos_fg[6], color=M_GREEN, radius=0.31, stroke_width=2.8),
            make_directed_edge(pos_fg[6], pos_fg[5], color=M_GREEN, radius=0.31, stroke_width=2.8),
            make_directed_edge(pos_fg[5], pos_fg[2], color=M_GREEN, radius=0.31, stroke_width=2.8),
        )
        fg_c3 = fixed_point_loop(pos_fg[4])

        trace_note = tex_mobject(
            r"\text{Apply } g \text{ first, then } f:\quad 1 \xrightarrow{g} 4 \xrightarrow{f} 7,\;\; 7 \xrightarrow{g} 5 \xrightarrow{f} 3,\;\; 3 \xrightarrow{g} 7 \xrightarrow{f} 1",
            height=0.31,
            max_width=12.6,
            color=M_BLUE,
        ).to_edge(DOWN, buff=0.32)

        self.play(
            *[nodes[k][0].animate.set_stroke(M_BLUE, width=2.6) for k in (1, 7, 3)],
            Create(fg_c1),
            FadeIn(trace_note),
            run_time=0.95,
        )
        self.wait(0.65)

        res_lbl = tex_mobject(
            r"f \circ g \;=\; (1,\,7,\,3)(2,\,6,\,5)(4) \;=\; (1,\,7,\,3)(2,\,6,\,5)",
            height=0.35,
            max_width=11.5,
            color=M_GREEN,
        ).move_to([0.0, 1.38, 0.0])

        trace_note_2 = tex_mobject(
            r"2 \xrightarrow{g} 6 \xrightarrow{f} 6,\;\; 6 \xrightarrow{g} 2 \xrightarrow{f} 5,\;\; 5 \xrightarrow{g} 3 \xrightarrow{f} 2, \quad\text{and}\quad 4 \xrightarrow{g} 1 \xrightarrow{f} 4",
            height=0.31,
            max_width=12.6,
            color=M_INK,
        ).to_edge(DOWN, buff=0.32)

        self.play(FadeOut(trace_note), run_time=0.15)
        self.play(
            *[nodes[k][0].animate.set_stroke(M_GREEN, width=2.6) for k in (2, 6, 5)],
            nodes[4][0].animate.set_stroke(M_YELLOW, width=2.6),
            Create(fg_c2),
            Create(fg_c3),
            FadeIn(res_lbl),
            FadeIn(trace_note_2),
            run_time=1.0,
        )
        self.wait(1.8)
