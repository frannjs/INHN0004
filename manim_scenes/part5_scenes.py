from manim import *
import numpy as np
from tex_helper import (
    M_BLUE,
    M_GREEN,
    M_INK,
    M_NODE_FILL,
    M_RED,
    M_YELLOW,
    make_graph_node,
    make_undirected_edge,
    prose_label,
    tex_mobject,
)


def make_clause_box(latex_str: str, pos, stroke_color=M_INK, text_color=M_INK, height: float = 0.31) -> VGroup:
    lbl = tex_mobject(latex_str, height=height, color=text_color)
    box = RoundedRectangle(
        corner_radius=0.14,
        width=lbl.width + 0.34,
        height=lbl.height + 0.24,
        stroke_color=stroke_color,
        stroke_width=1.8,
        fill_color=M_NODE_FILL,
        fill_opacity=1.0,
    )
    grp = VGroup(box, lbl).move_to(pos)
    return grp


def connect_boxes(top_box: VGroup, bot_box: VGroup, color=M_BLUE, stroke_width: float = 2.4) -> Arrow:
    start = top_box[0].get_bottom() + DOWN * 0.02
    side = -1 if start[0] < bot_box.get_center()[0] else 1
    end = bot_box[0].get_top() + UP * 0.02 + side * RIGHT * 0.14
    return Arrow(start, end, buff=0, color=color, stroke_width=stroke_width, tip_length=0.13)


class Ch14KvScene(Scene):
    """Read one Karnaugh–Veitch map as a minimal DNF and as a minimal CNF."""

    def construct(self):
        # =====================================================================
        # ACT I — KARNAUGH-VEITCH MAP BLOCK MINIMIZATION ON ITE(p, q, r)
        # =====================================================================
        hdr1 = tex_mobject(
            r"\operatorname{ITE}(p, q, r) \;\coloneqq\; ((p \to q) \land (\neg p \to r))",
            height=0.40,
            color=M_INK,
        ).to_edge(UP, buff=0.38)

        cell_s = 0.92
        gx0 = -4.50  # col 0 center x
        gy0 = 0.65   # row 0 center y

        # ITE(p, q, r) values in TUM KV order:
        # cols (p, r): (0,0), (1,0), (1,1), (0,1)
        # rows (q): 0, 1
        vals = [
            [0, 0, 0, 1],
            [0, 1, 1, 1],
        ]

        cells = []
        cell_texts = []
        for r in range(2):
            row_cells = []
            row_txts = []
            for c in range(4):
                cx = gx0 + c * cell_s
                cy = gy0 - r * cell_s
                sq = Square(
                    side_length=cell_s,
                    stroke_color=GREY_B,
                    stroke_width=1.8,
                    fill_color=M_NODE_FILL,
                    fill_opacity=1.0,
                ).move_to([cx, cy, 0])
                v = vals[r][c]
                t = tex_mobject(
                    str(v),
                    height=0.37,
                    color=M_INK,
                ).move_to([cx, cy, 0])
                row_cells.append(sq)
                row_txts.append(t)
            cells.append(row_cells)
            cell_texts.append(row_txts)

        grid_grp = VGroup(
            *[cells[r][c] for r in range(2) for c in range(4)],
            *[cell_texts[r][c] for r in range(2) for c in range(4)],
        )

        # Marginal variable bars: p over cols 1..2, q left of row 1, r under cols 2..3
        p_bar = Line(
            [gx0 + 0.5 * cell_s, gy0 + 0.5 * cell_s + 0.16, 0],
            [gx0 + 2.5 * cell_s, gy0 + 0.5 * cell_s + 0.16, 0],
            color=M_INK,
            stroke_width=3.0,
        )
        p_lbl = tex_mobject(r"p", height=0.37, color=M_INK).next_to(p_bar, UP, buff=0.10)

        q_bar = Line(
            [gx0 - 0.5 * cell_s - 0.16, gy0 - 0.5 * cell_s, 0],
            [gx0 - 0.5 * cell_s - 0.16, gy0 - 1.5 * cell_s, 0],
            color=M_INK,
            stroke_width=3.0,
        )
        q_lbl = tex_mobject(r"q", height=0.37, color=M_INK).next_to(q_bar, LEFT, buff=0.12)

        r_bar = Line(
            [gx0 + 1.5 * cell_s, gy0 - 1.5 * cell_s - 0.16, 0],
            [gx0 + 3.5 * cell_s, gy0 - 1.5 * cell_s - 0.16, 0],
            color=M_INK,
            stroke_width=3.0,
        )
        r_lbl = tex_mobject(r"r", height=0.37, color=M_INK).next_to(r_bar, DOWN, buff=0.10)

        bars_grp = VGroup(p_bar, p_lbl, q_bar, q_lbl, r_bar, r_lbl)

        foot1 = prose_label("DNF groups the cells with value 1", 28).to_edge(DOWN, buff=0.42)

        self.play(FadeIn(hdr1), FadeIn(grid_grp), FadeIn(bars_grp), FadeIn(foot1), run_time=0.9)

        # Maximal 1-blocks for Minimal DNF
        blk_pq = SurroundingRectangle(
            VGroup(cells[1][1], cells[1][2]),
            color=M_YELLOW,
            buff=-0.08,
            corner_radius=0.12,
            stroke_width=3.2,
            fill_color=M_YELLOW,
            fill_opacity=0.16,
        )
        blk_npr = SurroundingRectangle(
            VGroup(cells[0][3], cells[1][3]),
            color=M_GREEN,
            buff=-0.08,
            corner_radius=0.12,
            stroke_width=3.2,
            fill_color=M_GREEN,
            fill_opacity=0.16,
        )

        dnf_t1 = tex_mobject(r"p \land q", height=0.43, color=M_YELLOW).move_to([2.95, 1.35, 0])
        dnf_t2 = tex_mobject(r"\neg p \land r", height=0.43, color=M_GREEN).move_to([2.95, 0.62, 0])
        dnf_res = tex_mobject(
            r"(p \land q) \lor (\neg p \land r)",
            height=0.47,
            max_width=6.7,
            color=M_INK,
        ).move_to([2.95, -0.40, 0])

        self.play(Create(blk_pq), FadeIn(dnf_t1), run_time=0.75)
        self.play(Create(blk_npr), FadeIn(dnf_t2), run_time=0.75)
        self.play(FadeIn(dnf_res), run_time=0.6)
        self.wait(1.2)

        # Transition to Maximal 0-blocks for Minimal CNF
        foot1_cnf = prose_label("CNF groups the cells with value 0", 28).to_edge(DOWN, buff=0.42)

        blk_pr = SurroundingRectangle(
            VGroup(cells[0][0], cells[1][0]),
            color=M_BLUE,
            buff=-0.08,
            corner_radius=0.12,
            stroke_width=3.2,
            fill_color=M_BLUE,
            fill_opacity=0.16,
        )
        blk_npq = SurroundingRectangle(
            VGroup(cells[0][1], cells[0][2]),
            color=M_RED,
            buff=-0.08,
            corner_radius=0.12,
            stroke_width=3.2,
            fill_color=M_RED,
            fill_opacity=0.16,
        )
        cnf_t1 = tex_mobject(r"p \lor r", height=0.43, color=M_BLUE).move_to([2.95, 1.35, 0])
        cnf_t2 = tex_mobject(r"\neg p \lor q", height=0.43, color=M_RED).move_to([2.95, 0.62, 0])
        cnf_res = tex_mobject(r"(p \lor r) \land (\neg p \lor q)", height=0.47, max_width=6.7).move_to([2.95, -0.40, 0])

        self.play(
            FadeOut(VGroup(blk_pq, blk_npr, foot1, dnf_t1, dnf_t2, dnf_res)),
            run_time=0.35,
        )
        self.play(Create(blk_pr), FadeIn(cnf_t1), FadeIn(foot1_cnf), run_time=0.72)
        self.play(Create(blk_npq), FadeIn(cnf_t2), run_time=0.72)
        self.play(FadeIn(cnf_res), run_time=0.45)
        self.wait(1.9)

class Ch14TseytinScene(Scene):
    """Assign tree labels, write local gate constraints, then convert to CNF."""

    def construct(self):
        hdr2 = tex_mobject(
            r"F = (p_1 \land p_2) \lor (p_3 \land p_4) \;\equiv_e\; E_F \quad (\text{Tseytin CNF})",
            height=0.46,
            color=M_INK,
        ).to_edge(UP, buff=0.38)

        pos_qe = np.array([-4.05, 1.80, 0.0])
        pos_q0 = np.array([-5.25, 0.30, 0.0])
        pos_q1 = np.array([-2.85, 0.30, 0.0])
        pos_p1 = np.array([-5.85, -1.25, 0.0])
        pos_p2 = np.array([-4.65, -1.25, 0.0])
        pos_p3 = np.array([-3.45, -1.25, 0.0])
        pos_p4 = np.array([-2.25, -1.25, 0.0])

        n_qe = make_graph_node(r"\lor", pos_qe, radius=0.31, stroke_color=M_YELLOW)
        n_q0 = make_graph_node(r"\land", pos_q0, radius=0.31, stroke_color=M_BLUE)
        n_q1 = make_graph_node(r"\land", pos_q1, radius=0.31, stroke_color=M_GREEN)
        n_p1 = make_graph_node(r"p_1", pos_p1, radius=0.29)
        n_p2 = make_graph_node(r"p_2", pos_p2, radius=0.29)
        n_p3 = make_graph_node(r"p_3", pos_p3, radius=0.29)
        n_p4 = make_graph_node(r"p_4", pos_p4, radius=0.29)

        t_edges = VGroup(
            make_undirected_edge(pos_qe, pos_q0, color=GREY_B, radius=0.31),
            make_undirected_edge(pos_qe, pos_q1, color=GREY_B, radius=0.31),
            make_undirected_edge(pos_q0, pos_p1, color=GREY_B, radius=0.30),
            make_undirected_edge(pos_q0, pos_p2, color=GREY_B, radius=0.30),
            make_undirected_edge(pos_q1, pos_p3, color=GREY_B, radius=0.30),
            make_undirected_edge(pos_q1, pos_p4, color=GREY_B, radius=0.30),
        )

        tag_qe = tex_mobject(r"q_\varepsilon", height=0.38, color=M_YELLOW).next_to(n_qe, LEFT, buff=0.16)
        tag_q0 = tex_mobject(r"q_0", height=0.38, color=M_BLUE).next_to(n_q0, LEFT, buff=0.16)
        tag_q1 = tex_mobject(r"q_1", height=0.38, color=M_GREEN).next_to(n_q1, RIGHT, buff=0.16)

        tree_grp = VGroup(t_edges, n_qe, n_q0, n_q1, n_p1, n_p2, n_p3, n_p4)

        foot2 = prose_label("Add one constraint per gate", 28).to_edge(DOWN, buff=0.42)
        cnf_note = prose_label("Expand each gate into three clauses", 28).to_edge(DOWN, buff=0.42)

        self.play(FadeIn(hdr2), FadeIn(tree_grp), FadeIn(foot2), run_time=0.85)
        self.play(FadeIn(tag_qe), FadeIn(tag_q0), FadeIn(tag_q1), run_time=0.6)

        c_root = tex_mobject(
            r"\text{Assert the root}\quad q_\varepsilon",
            height=0.42,
            color=M_YELLOW,
        ).move_to([2.35, 1.85, 0]).align_to([-1.15, 0, 0], LEFT)

        gates = [
            (n_qe, M_YELLOW, 0.95, r"G_\varepsilon = (q_\varepsilon \leftrightarrow(q_0\lor q_1))",
             r"(\neg q_\varepsilon\lor q_0\lor q_1)\land(q_\varepsilon\lor\neg q_0)\land(q_\varepsilon\lor\neg q_1)"),
            (n_q0, M_BLUE, 0.05, r"G_0 = (q_0 \leftrightarrow(p_1\land p_2))",
             r"(q_0\lor\neg p_1\lor\neg p_2)\land(\neg q_0\lor p_1)\land(\neg q_0\lor p_2)"),
            (n_q1, M_GREEN, -0.85, r"G_1 = (q_1 \leftrightarrow(p_3\land p_4))",
             r"(q_1\lor\neg p_3\lor\neg p_4)\land(\neg q_1\lor p_3)\land(\neg q_1\lor p_4)"),
        ]
        intermediate = VGroup()
        self.play(FadeIn(c_root), run_time=0.48)
        for node, color, y, gate, _ in gates:
            gate_formula = tex_mobject(gate, height=0.46, max_width=7.55, color=color)
            gate_formula.move_to([2.35, y, 0]).align_to([-1.15, 0, 0], LEFT)
            intermediate.add(gate_formula)
            self.play(
                node[0].animate(rate_func=there_and_back).set_stroke(color=color, width=6),
                FadeIn(gate_formula),
                run_time=0.8,
            )
        self.wait(1.45)
        self.play(FadeOut(intermediate), FadeOut(foot2), run_time=0.27)
        self.play(FadeIn(cnf_note), run_time=0.33)
        for node, color, y, _, clauses in gates:
            cnf_formula = tex_mobject(clauses, height=0.41, max_width=7.55, color=color)
            cnf_formula.move_to([2.35, y, 0]).align_to([-1.15, 0, 0], LEFT)
            self.play(
                node[0].animate(rate_func=there_and_back).set_stroke(color=color, width=6),
                FadeIn(cnf_formula),
                run_time=0.8,
            )
        summary = prose_label("One root unit plus nine gate clauses", 28)
        summary.to_edge(DOWN, buff=0.42)
        self.play(FadeOut(cnf_note), run_time=0.21)
        self.play(FadeIn(summary), run_time=0.35)
        self.wait(2.05)


class Ch15DpllScene(Scene):
    """Keep only the constraints that remain after each DPLL reduction."""

    def construct(self):
        hdr1 = prose_label("DPLL with one-literal and pure-literal rules", 34)
        hdr1.to_edge(UP, buff=0.38)

        k0 = make_clause_box(
            r"\{\{\neg p, q, \neg r, s\},\; \{\neg q, \neg r, s\},\; \{r\},\; \{\neg p, \neg s\},\; \{\neg p, r\}\}",
            [-0.75, 2.25, 0],
            stroke_color=M_INK,
            height=0.38,
        )
        k1 = make_clause_box(
            r"\{\{\neg p, q, s\},\; \{\neg q, s\},\; \{\neg p, \neg s\}\}",
            [-0.75, 0.88, 0],
            stroke_color=M_YELLOW,
            height=0.38,
        )
        k2 = make_clause_box(
            r"\{\{\neg q, s\}\}",
            [-0.75, -0.49, 0],
            stroke_color=M_BLUE,
            height=0.38,
        )
        k3 = make_clause_box(
            r"\varnothing \quad \text{(satisfiable)}",
            [-0.75, -1.87, 0],
            stroke_color=M_GREEN,
            text_color=M_GREEN,
            height=0.40,
        )

        arr1 = Arrow(k0.get_bottom(), k1.get_top(), buff=0.08, color=M_YELLOW, stroke_width=2.6, tip_length=0.16)
        lbl1 = tex_mobject(r"\text{OLR}\quad r=1", height=0.37, color=M_YELLOW).next_to(arr1, RIGHT, buff=0.26)

        arr2 = Arrow(k1.get_bottom(), k2.get_top(), buff=0.08, color=M_BLUE, stroke_width=2.6, tip_length=0.16)
        lbl2 = tex_mobject(r"\text{PLR}\quad p=0", height=0.37, color=M_BLUE).next_to(arr2, RIGHT, buff=0.26)

        arr3 = Arrow(k2.get_bottom(), k3.get_top(), buff=0.08, color=M_GREEN, stroke_width=2.6, tip_length=0.16)
        lbl3 = tex_mobject(r"\text{PLR}\quad q=0", height=0.37, color=M_GREEN).next_to(arr3, RIGHT, buff=0.26)

        foot1 = tex_mobject(
            r"r=1,\quad p=q=0,\quad s\in\{0,1\}",
            height=0.45,
        ).to_edge(DOWN, buff=0.55)

        self.play(FadeIn(hdr1), FadeIn(k0), run_time=0.8)
        self.play(GrowArrow(arr1), FadeIn(lbl1), FadeIn(k1), run_time=0.85)
        self.wait(0.45)
        self.play(GrowArrow(arr2), FadeIn(lbl2), FadeIn(k2), run_time=0.85)
        self.wait(0.45)
        self.play(GrowArrow(arr3), FadeIn(lbl3), FadeIn(k3), run_time=0.85)
        self.play(FadeIn(foot1), run_time=0.45)
        self.wait(1.7)

class Ch15ResolutionScene(Scene):
    """Derive the empty clause one pair of parents at a time."""

    def construct(self):
        hdr2 = tex_mobject(
            r"\text{Derive the empty clause by resolution}",
            height=0.46,
            color=M_INK,
        ).to_edge(UP, buff=0.38)

        c1 = make_clause_box(r"\{\neg q, s\}", [-5.25, 2.00, 0], stroke_color=GREY_B, height=0.38)
        c2 = make_clause_box(r"\{\neg p, q, s\}", [-2.55, 2.00, 0], stroke_color=GREY_B, height=0.38)
        c3 = make_clause_box(r"\{p\}", [0.00, 2.00, 0], stroke_color=GREY_B, height=0.38)
        c4 = make_clause_box(r"\{r, \neg s\}", [2.35, 2.00, 0], stroke_color=GREY_B, height=0.38)
        c5 = make_clause_box(r"\{\neg p, \neg r, \neg s\}", [5.05, 2.00, 0], stroke_color=GREY_B, height=0.38)

        premises = VGroup(c1, c2, c3, c4, c5)

        r1 = make_clause_box(r"\{\neg p, s\}", [-3.90, 0.62, 0], stroke_color=M_BLUE, text_color=M_BLUE, height=0.39)
        r2 = make_clause_box(r"\{\neg p, \neg s\}", [3.70, 0.62, 0], stroke_color=M_BLUE, text_color=M_BLUE, height=0.39)

        r3 = make_clause_box(r"\{s\}", [-1.85, -0.76, 0], stroke_color=M_YELLOW, text_color=M_YELLOW, height=0.39)
        r4 = make_clause_box(r"\{\neg s\}", [1.85, -0.76, 0], stroke_color=M_YELLOW, text_color=M_YELLOW, height=0.39)

        bot_box = make_clause_box(r"\varnothing", [0.00, -2.05, 0], stroke_color=M_RED, text_color=M_RED, height=0.41)

        e_c1_r1 = connect_boxes(c1, r1, color=M_BLUE)
        e_c2_r1 = connect_boxes(c2, r1, color=M_BLUE)

        e_c4_r2 = connect_boxes(c4, r2, color=M_BLUE)
        e_c5_r2 = connect_boxes(c5, r2, color=M_BLUE)

        e_r1_r3 = connect_boxes(r1, r3, color=M_YELLOW)
        e_c3_r3 = connect_boxes(c3, r3, color=M_YELLOW)

        e_c3_r4 = connect_boxes(c3, r4, color=M_YELLOW)
        e_r2_r4 = connect_boxes(r2, r4, color=M_YELLOW)

        e_r3_bot = connect_boxes(r3, bot_box, color=M_RED, stroke_width=3.0)
        e_r4_bot = connect_boxes(r4, bot_box, color=M_RED, stroke_width=3.0)

        self.play(FadeIn(hdr2), FadeIn(premises), run_time=0.85)
        steps = (
            (e_c1_r1, e_c2_r1, r1, "q", M_BLUE),
            (e_c4_r2, e_c5_r2, r2, "r", M_BLUE),
            (e_r1_r3, e_c3_r3, r3, "p", M_YELLOW),
            (e_c3_r4, e_r2_r4, r4, "p", M_YELLOW),
            (e_r3_bot, e_r4_bot, bot_box, "s", M_RED),
        )
        pivot_label = None
        for left, right, child, pivot, color in steps:
            next_label = tex_mobject(rf"\text{{Resolve on }} {pivot}", height=0.42, color=color)
            next_label.to_edge(DOWN, buff=0.53)
            caption = FadeIn(next_label) if pivot_label is None else Succession(FadeOut(pivot_label), FadeIn(next_label))
            self.play(GrowArrow(left), GrowArrow(right), FadeIn(child), caption, run_time=0.85)
            self.wait(0.32)
            pivot_label = next_label
        self.play(FadeOut(pivot_label), run_time=0.24)
        conclusion = prose_label("The empty clause proves unsatisfiability", 28, M_RED)
        conclusion.to_edge(DOWN, buff=0.53)
        self.play(FadeIn(conclusion), run_time=0.45)
        self.wait(2.3)


class Ch15WitnessDependencyScene(Scene):
    """Skolem witnesses depend on the universal moves preceding them."""

    def construct(self):
        title = prose_label("Which choices can each witness see?", font_size=36)
        title.to_edge(UP, buff=0.42)
        prefix = VGroup(
            tex_mobject(r"\forall x", height=0.47, color=M_BLUE),
            tex_mobject(r"\exists y", height=0.47, color=M_YELLOW),
            tex_mobject(r"\forall z", height=0.47, color=M_BLUE),
            tex_mobject(r"\exists w", height=0.47, color=M_GREEN),
            tex_mobject(r"P(x,y,z,w)", height=0.47),
        ).arrange(RIGHT, buff=0.54).move_to([0, 1.77, 0])
        witnesses = VGroup(
            tex_mobject(r"y=f(x)", height=0.45, color=M_YELLOW).move_to([-3.0, -0.65, 0]),
            tex_mobject(r"w=g(x,z)", height=0.45, color=M_GREEN).move_to([1.0, -0.65, 0]),
        )
        y_edge = Arrow(prefix[0].get_bottom(), witnesses[0].get_top(), buff=0.12, color=M_YELLOW)
        w_from_x = Arrow(prefix[0].get_bottom(), witnesses[1].get_top() + 0.23 * LEFT, buff=0.12, color=M_GREEN)
        w_from_z = Arrow(prefix[2].get_bottom(), witnesses[1].get_top() + 0.23 * RIGHT, buff=0.12, color=M_GREEN)
        result = tex_mobject(
            r"\forall x\,\forall z\,P(x,f(x),z,g(x,z))",
            height=0.47,
        ).move_to([0, -2.25, 0])
        footer = prose_label("The witness for y must work for every later z.", font_size=28)
        footer.to_edge(DOWN, buff=0.40)
        self.play(FadeIn(title), LaggedStart(*[FadeIn(item) for item in prefix], lag_ratio=0.23), run_time=1.3)
        self.play(Indicate(prefix[1], color=M_YELLOW), GrowArrow(y_edge), FadeIn(witnesses[0]), run_time=0.9)
        self.wait(1.25)
        self.play(Indicate(prefix[3], color=M_GREEN), GrowArrow(w_from_x), GrowArrow(w_from_z), FadeIn(witnesses[1]), run_time=1.0)
        self.wait(1.25)
        self.play(FadeIn(result), FadeIn(footer), run_time=0.75)
        self.wait(2.0)
