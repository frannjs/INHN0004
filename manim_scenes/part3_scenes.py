import numpy as np
from manim import *
from tex_helper import (
    M_BLUE,
    M_DIM,
    M_GREEN,
    M_INK,
    M_MUTED,
    M_NODE_FILL,
    M_RED,
    M_YELLOW,
    make_directed_edge,
    make_graph_node,
    make_undirected_edge,
    prose_label,
    tex_mobject,
)


def outward_loop(center, direction, radius, color):
    """Attach both ends of a loop to the outward side of the vertex."""
    outward = direction / np.linalg.norm(direction)
    perpendicular = np.array([-outward[1], outward[0], 0])
    offset = radius * np.cos(PI / 6) * outward
    wing = radius * np.sin(PI / 6) * perpendicular
    return CurvedArrow(
        center + offset + wing,
        center + offset - wing,
        angle=-4.7,
        color=color,
        stroke_width=2.6,
        tip_length=0.13,
    )


class SccQuotientProductsScene(Scene):
    """Chapter 9: SCCs & Quotient Graph G/~ (Act I), then Direct vs. Cartesian Product (Act II)."""

    def construct(self):
        # =====================================================================
        # ACT I: SCCs and Quotient Graph G/~ on Slide 13 example V={1..6}
        # =====================================================================
        hdr1 = tex_mobject(
            r"G/\!{\sim} \;\coloneqq\; \bigl(V/\!{\sim},\; \{([s]_{\sim}, [t]_{\sim}) \mid (s,t) \in E\}\bigr), \qquad {\sim} \;\coloneqq\; E^* \cap (E^\top)^*",
            height=0.40,
            color=M_INK,
        ).to_edge(UP, buff=0.34)

        lbl_g = tex_mobject(r"G = (V, E)", height=0.34, color=M_INK).move_to([-3.55, 2.30, 0])
        pos_g = {
            1: np.array([-5.35, 1.10, 0.0]),
            2: np.array([-3.55, 1.10, 0.0]),
            5: np.array([-1.75, 1.10, 0.0]),
            6: np.array([-5.35, -1.10, 0.0]),
            3: np.array([-3.55, -1.10, 0.0]),
            4: np.array([-1.75, -1.10, 0.0]),
        }
        nodes_g = {u: make_graph_node(str(u), pos_g[u], radius=0.30) for u in pos_g}

        e_16 = make_directed_edge(pos_g[1], pos_g[6], color=M_BLUE, radius=0.30, curved=0.28)
        e_61 = make_directed_edge(pos_g[6], pos_g[1], color=M_BLUE, radius=0.30, curved=0.28)
        e_25 = make_directed_edge(pos_g[2], pos_g[5], color=M_GREEN, radius=0.30, curved=0.28)
        e_52 = make_directed_edge(pos_g[5], pos_g[2], color=M_GREEN, radius=0.30, curved=0.28)
        e_34 = make_directed_edge(pos_g[3], pos_g[4], color=M_YELLOW, radius=0.30, curved=0.28)
        e_43 = make_directed_edge(pos_g[4], pos_g[3], color=M_YELLOW, radius=0.30, curved=0.28)
        e_44 = outward_loop(pos_g[4], DOWN + RIGHT, 0.30, M_YELLOW)
        e_12 = make_directed_edge(pos_g[1], pos_g[2], color=GREY_B, radius=0.30)
        e_63 = make_directed_edge(pos_g[6], pos_g[3], color=GREY_B, radius=0.30)

        edges_g = VGroup(e_16, e_61, e_25, e_52, e_34, e_43, e_44, e_12, e_63)

        cap1 = tex_mobject(
            r"\text{Mutual reachability } E^* \cap (E^\top)^* \text{ partitions } V \text{ into three SCCs}",
            height=0.31,
            color=M_INK,
        ).to_edge(DOWN, buff=0.40)

        self.play(FadeIn(hdr1), FadeIn(lbl_g), run_time=0.6)
        self.play(
            *[FadeIn(nodes_g[u]) for u in pos_g],
            *[Create(e) for e in edges_g],
            FadeIn(cap1),
            run_time=1.0,
        )
        self.wait(0.5)

        halo_16 = SurroundingRectangle(
            VGroup(nodes_g[1], nodes_g[6]), color=M_BLUE, buff=0.20, corner_radius=0.24, stroke_width=2.0
        )
        halo_25 = SurroundingRectangle(
            VGroup(nodes_g[2], nodes_g[5]), color=M_GREEN, buff=0.20, corner_radius=0.24, stroke_width=2.0
        )
        halo_34 = SurroundingRectangle(
            VGroup(nodes_g[3], nodes_g[4], e_44), color=M_YELLOW, buff=0.20, corner_radius=0.24, stroke_width=2.0
        )
        self.play(Create(halo_16), Create(halo_25), Create(halo_34), run_time=0.75)
        self.wait(0.45)

        map_arrow = tex_mobject(r"\longmapsto", height=0.26, color=M_MUTED).move_to([0.20, 0.0, 0])
        lbl_q = tex_mobject(r"\text{Quotient } G/\!{\sim}", height=0.34, color=M_INK).move_to([3.75, 2.30, 0])

        pos_q = {
            "16": np.array([2.10, 0.0, 0.0]),
            "25": np.array([4.85, 1.10, 0.0]),
            "34": np.array([4.85, -1.10, 0.0]),
        }
        q_r = 0.46
        node_q16 = make_graph_node(r"\{1,6\}", pos_q["16"], radius=q_r, stroke_color=M_BLUE)
        node_q25 = make_graph_node(r"\{2,5\}", pos_q["25"], radius=q_r, stroke_color=M_GREEN)
        node_q34 = make_graph_node(r"\{3,4\}", pos_q["34"], radius=q_r, stroke_color=M_YELLOW)
        for node in (node_q16, node_q25, node_q34):
            node[1].scale_to_fit_width(q_r * 1.60)

        qe_12 = make_directed_edge(pos_q["16"], pos_q["25"], color=GREY_A, radius=q_r)
        qe_13 = make_directed_edge(pos_q["16"], pos_q["34"], color=GREY_A, radius=q_r)
        ql_16 = outward_loop(pos_q["16"], UP + LEFT, q_r, M_BLUE)
        ql_25 = outward_loop(pos_q["25"], UP + RIGHT, q_r, M_GREEN)
        ql_34 = outward_loop(pos_q["34"], DOWN + RIGHT, q_r, M_YELLOW)

        cap2 = tex_mobject(
            r"\text{Edges inside each SCC become loops. The remaining edges form a DAG.}",
            height=0.31,
            color=M_INK,
        ).to_edge(DOWN, buff=0.40)

        self.play(
            FadeIn(map_arrow),
            FadeIn(lbl_q),
            FadeIn(node_q16),
            FadeIn(node_q25),
            FadeIn(node_q34),
            Create(qe_12),
            Create(qe_13),
            Create(ql_16),
            Create(ql_25),
            Create(ql_34),
            Succession(FadeOut(cap1), FadeIn(cap2)),
            run_time=1.1,
        )
        self.wait(1.3)

        act1_all = VGroup(
            lbl_g, *nodes_g.values(), edges_g, halo_16, halo_25, halo_34,
            map_arrow, lbl_q, node_q16, node_q25, node_q34, qe_12, qe_13, ql_16, ql_25, ql_34, cap2
        )
        self.play(FadeOut(act1_all), run_time=0.55)

        # =====================================================================
        # ACT II: Direct Product vs. Cartesian Product on C_3 and P_3
        # =====================================================================
        hdr2 = tex_mobject(
            r"\text{Direct Product } \vec{C}_3 \times \vec{P}_3 \text{ (lockstep)} \quad\text{vs.}\quad \text{Cartesian Product } \vec{C}_3 \,\square\, \vec{P}_3 \text{ (interleaved)}",
            height=0.38,
            color=M_INK,
        ).to_edge(UP, buff=0.34)

        sub2 = tex_mobject(
            r"\vec{C}_3:\; a \to b \to c \to a \qquad\qquad \vec{P}_3:\; 1 \to 2 \to 3",
            height=0.30,
            color=M_MUTED,
        ).move_to([0.0, 2.58, 0])

        rows_lbl = ["a", "b", "c"]
        cols_lbl = ["1", "2", "3"]
        nr = 0.27

        pos_dp = {}
        nodes_dp = {}
        pos_cp = {}
        nodes_cp = {}

        for i, rl in enumerate(rows_lbl):
            for j, cl in enumerate(cols_lbl):
                y_val = 1.00 - i * 1.25
                p_l = np.array([-4.85 + j * 1.40, y_val, 0.0])
                p_r = np.array([2.05 + j * 1.40, y_val, 0.0])
                pos_dp[(i, j)] = p_l
                pos_cp[(i, j)] = p_r
                nodes_dp[(i, j)] = make_graph_node(rl + cl, p_l, radius=nr)
                nodes_cp[(i, j)] = make_graph_node(rl + cl, p_r, radius=nr)

        lbl_dp = tex_mobject(
            r"\vec{C}_3 \times \vec{P}_3 \;\text{(3 disjoint paths, DAG)}",
            height=0.30,
            color=M_YELLOW,
        ).move_to([-3.45, 1.86, 0])

        lbl_cp = tex_mobject(
            r"\vec{C}_3 \,\square\, \vec{P}_3 \;\text{(1 CC, cylinder mesh)}",
            height=0.30,
            color=M_GREEN,
        ).move_to([3.45, 1.86, 0])

        # Direct product edges: (i, j) -> ((i+1)%3, j+1) for j in {0, 1}
        dp_colors = [M_BLUE, M_YELLOW, M_RED]
        dp_edges = VGroup()
        for start_i in range(3):
            col = dp_colors[start_i]
            e1 = make_directed_edge(
                pos_dp[(start_i, 0)], pos_dp[((start_i + 1) % 3, 1)], color=col, radius=nr
            )
            e2 = make_directed_edge(
                pos_dp[((start_i + 1) % 3, 1)], pos_dp[((start_i + 2) % 3, 2)], color=col, radius=nr
            )
            dp_edges.add(e1, e2)

        # Cartesian product edges: horizontal (i, j)->(i, j+1) and vertical (i, j)->((i+1)%3, j)
        cp_horiz = VGroup()
        cp_vert = VGroup()
        for i in range(3):
            for j in range(2):
                cp_horiz.add(make_directed_edge(pos_cp[(i, j)], pos_cp[(i, j + 1)], color=M_BLUE, radius=nr))
        for j in range(3):
            cp_vert.add(make_directed_edge(pos_cp[(0, j)], pos_cp[(1, j)], color=M_GREEN, radius=nr))
            cp_vert.add(make_directed_edge(pos_cp[(1, j)], pos_cp[(2, j)], color=M_GREEN, radius=nr))
            bottom = pos_cp[(2, j)]
            top = pos_cp[(0, j)]
            cp_vert.add(CurvedArrow(
                bottom + np.array([-0.20, 0.22, 0]),
                top + np.array([-0.20, -0.22, 0]),
                angle=-1.40,
                color=M_GREEN,
                stroke_width=2.6,
                tip_length=0.16,
            ))

        cap_p = tex_mobject(
            r"\text{Every direct step advances in } \vec{P}_3 \text{, so a directed cycle is impossible.}",
            height=0.31,
            color=M_INK,
        ).to_edge(DOWN, buff=0.38)

        self.remove(hdr1)
        self.add(hdr2)
        self.play(
            FadeIn(sub2),
            FadeIn(lbl_dp),
            FadeIn(lbl_cp),
            *[FadeIn(m) for m in nodes_dp.values()],
            *[FadeIn(m) for m in nodes_cp.values()],
            run_time=0.8,
        )
        self.play(
            *[Create(e) for e in dp_edges],
            *[Create(e) for e in cp_horiz],
            *[Create(e) for e in cp_vert],
            FadeIn(cap_p),
            run_time=1.2,
        )
        self.wait(1.8)


class BfsDfsHavelScene(Scene):
    """Chapter 10: BFS vs. DFS Spanning Trees (Act I), then Havel-Hakimi Reduction & Reconstruction (Act II)."""

    def construct(self):
        # =====================================================================
        # ACT I: BFS vs. DFS on Slide 31 8-node graph
        # =====================================================================
        hdr1 = tex_mobject(
            r"\text{Spanning Tree Heuristics: } \text{BFS (earliest } u_j\text{, FIFO)} \;\text{ vs. }\; \text{DFS (latest } u_j\text{, LIFO)}",
            height=0.39,
            color=M_INK,
        ).to_edge(UP, buff=0.34)

        base_rel = {
            0: np.array([0.0, 1.40, 0.0]),
            1: np.array([-1.80, 0.05, 0.0]),
            2: np.array([-0.60, 0.05, 0.0]),
            3: np.array([0.60, 0.05, 0.0]),
            4: np.array([1.80, 0.05, 0.0]),
            5: np.array([-1.20, -1.35, 0.0]),
            6: np.array([0.0, -1.35, 0.0]),
            7: np.array([1.20, -1.35, 0.0]),
        }
        all_edges = [(0, 1), (0, 2), (0, 3), (0, 4), (1, 5), (2, 6), (3, 7), (4, 7), (5, 6), (6, 7)]

        nr = 0.26
        pos_b = {u: base_rel[u] + np.array([-3.55, 0.0, 0.0]) for u in base_rel}
        pos_d = {u: base_rel[u] + np.array([3.55, 0.0, 0.0]) for u in base_rel}

        nodes_b = {u: make_graph_node(str(u), pos_b[u], radius=nr, stroke_color=M_BLUE if u == 0 else M_INK) for u in pos_b}
        nodes_d = {u: make_graph_node(str(u), pos_d[u], radius=nr, stroke_color=M_YELLOW if u == 0 else M_INK) for u in pos_d}

        bg_b = VGroup(*[make_undirected_edge(pos_b[u], pos_b[v], color=M_DIM, radius=nr, stroke_width=2.0) for u, v in all_edges])
        bg_d = VGroup(*[make_undirected_edge(pos_d[u], pos_d[v], color=M_DIM, radius=nr, stroke_width=2.0) for u, v in all_edges])

        lbl_b = tex_mobject(r"\text{BFS from } 0 \;\text{(height } 2\text{, shortest paths)}", height=0.31, color=M_BLUE).move_to([-3.55, 2.25, 0])
        lbl_d = tex_mobject(r"\text{DFS from } 0 \;\text{(height } 5\text{, deep + backtrack)}", height=0.31, color=M_YELLOW).move_to([3.55, 2.25, 0])

        cap1 = tex_mobject(
            r"\text{Both select } |E_T| = |V| - 1 = 7 \text{ edges; tie-breaking chooses } \min(\Gamma(u_j) \setminus V_i)",
            height=0.30,
            color=M_MUTED,
        ).to_edge(DOWN, buff=0.38)

        self.play(
            FadeIn(hdr1),
            FadeIn(lbl_b),
            FadeIn(lbl_d),
            FadeIn(bg_b),
            FadeIn(bg_d),
            *[FadeIn(m) for m in nodes_b.values()],
            *[FadeIn(m) for m in nodes_d.values()],
            FadeIn(cap1),
            run_time=0.85,
        )

        bfs_steps = [(0, 1), (0, 2), (0, 3), (0, 4), (1, 5), (2, 6), (3, 7)]
        dfs_steps = [(0, 1), (1, 5), (5, 6), (6, 2), (6, 7), (7, 3), (7, 4)]

        tree_b_edges = VGroup()
        tree_d_edges = VGroup()

        for (ub, vb), (ud, vd) in zip(bfs_steps, dfs_steps):
            eb = make_undirected_edge(pos_b[ub], pos_b[vb], color=M_BLUE, radius=nr, stroke_width=4.0)
            ed = make_undirected_edge(pos_d[ud], pos_d[vd], color=M_YELLOW, radius=nr, stroke_width=4.0)
            tree_b_edges.add(eb)
            tree_d_edges.add(ed)
            self.play(
                Create(eb),
                Create(ed),
                nodes_b[vb][0].animate.set_stroke(color=M_BLUE, width=2.8),
                nodes_d[vd][0].animate.set_stroke(color=M_YELLOW, width=2.8),
                run_time=0.36,
            )

        self.wait(1.1)

        act1_all = VGroup(
            lbl_b, lbl_d, bg_b, bg_d, *nodes_b.values(), *nodes_d.values(), tree_b_edges, tree_d_edges, cap1
        )
        self.play(FadeOut(act1_all), run_time=0.55)

        # =====================================================================
        # ACT II: Havel-Hakimi on (1, 1, 2, 3, 4, 4, 5) (Slide 37)
        # =====================================================================
        hdr2 = tex_mobject(
            r"\text{Havel--Hakimi Algorithm on } d = (1, 1, 2, 3, 4, 4, 5)",
            height=0.40,
            color=M_INK,
        ).to_edge(UP, buff=0.34)

        p1_lbl = tex_mobject(r"\text{1. Top-down reduction}", height=0.31, color=M_BLUE).move_to([-3.65, 2.42, 0])
        p2_lbl = tex_mobject(r"\text{2. Bottom-up graph construction}", height=0.31, color=M_GREEN).move_to([3.45, 2.42, 0])

        r0 = tex_mobject(r"(1,\, 1,\, 2,\, 3,\, 4,\, 4,\, \mathbf{5})", height=0.33, color=M_INK).move_to([-3.65, 1.35, 0])
        r1 = tex_mobject(r"\downarrow\; \mathrm{sort}(1,0,1,2,3,3) = (0,\, 1,\, 1,\, 2,\, 3,\, \mathbf{3})", height=0.30, color=M_BLUE).move_to([-3.65, 0.50, 0])
        r2 = tex_mobject(r"\downarrow\; \mathrm{sort}(0,1,0,1,2) = (0,\, 0,\, 1,\, 1,\, \mathbf{2})", height=0.30, color=M_BLUE).move_to([-3.65, -0.35, 0])
        r3 = tex_mobject(r"\downarrow\; (0,\, 0,\, 0,\, 0) \;\mapsto\; ([4], \emptyset)", height=0.31, color=M_GREEN).move_to([-3.65, -1.20, 0])

        self.remove(hdr1)
        self.add(hdr2)
        self.play(FadeIn(p1_lbl), FadeIn(p2_lbl), FadeIn(r0), run_time=0.6)
        self.play(FadeIn(r1), run_time=0.45)
        self.play(FadeIn(r2), run_time=0.45)
        self.play(FadeIn(r3), run_time=0.45)

        # Place 7 nodes on a clean circle centered at (3.45, 0.05) with radius 1.72
        center_hh = np.array([3.45, 0.05, 0.0])
        rad_hh = 1.72
        hh_pos = {}
        for k in range(1, 8):
            ang = np.pi / 2 - (k - 1) * (2 * np.pi / 7)
            hh_pos[k] = center_hh + np.array([rad_hh * np.cos(ang), rad_hh * np.sin(ang), 0.0])

        outline = {5: M_YELLOW, 6: M_BLUE, 7: M_RED}
        hh_nodes = {
            k: make_graph_node(str(k), hh_pos[k], radius=0.26, stroke_color=outline.get(k, M_INK))
            for k in range(1, 8)
        }

        cap_hh = tex_mobject(
            r"\text{Base case } (0,0,0,0)\text{: start with } 4 \text{ isolated nodes } \{1,2,3,4\}",
            height=0.30,
            color=M_GREEN,
        ).to_edge(DOWN, buff=0.38)

        self.play(*[FadeIn(hh_nodes[k]) for k in [1, 2, 3, 4]], FadeIn(cap_hh), run_time=0.6)

        # Add node 5 (deg 2) -> connect to 3, 4 (deg 0, 0) => degs: 1:0, 2:0, 3:1, 4:1, 5:2
        e5 = VGroup(
            make_undirected_edge(hh_pos[5], hh_pos[3], color=M_YELLOW, radius=0.26, stroke_width=3.0),
            make_undirected_edge(hh_pos[5], hh_pos[4], color=M_YELLOW, radius=0.26, stroke_width=3.0),
        )
        cap_hh5 = tex_mobject(
            r"\text{Add node } 5 \text{ (deg } 2\text{) connected to } \{3,4\} \;\Rightarrow\; (0, 0, 1, 1, 2)",
            height=0.30,
            color=M_YELLOW,
        ).to_edge(DOWN, buff=0.38)
        self.play(
            Succession(FadeIn(hh_nodes[5], run_time=0.24), AnimationGroup(*[Create(e) for e in e5], run_time=0.51)),
            Succession(FadeOut(cap_hh), FadeIn(cap_hh5)),
            run_time=0.75,
        )
        self.wait(0.35)

        # Add node 6 (deg 3) -> connect to nodes of deg 2, 1, 0: {5, 4, 2}
        # Resulting degs on {1..6}: 1:0, 2:1, 3:1, 4:2, 5:3, 6:3 -> sorted (0, 1, 1, 2, 3, 3)
        e6 = VGroup(
            make_undirected_edge(hh_pos[6], hh_pos[5], color=M_BLUE, radius=0.26, stroke_width=3.0),
            make_undirected_edge(hh_pos[6], hh_pos[4], color=M_BLUE, radius=0.26, stroke_width=3.0),
            make_undirected_edge(hh_pos[6], hh_pos[2], color=M_BLUE, radius=0.26, stroke_width=3.0),
        )
        cap_hh6 = tex_mobject(
            r"\text{Add node } 6 \text{ (deg } 3\text{) connected to } \{5,4,2\} \;\Rightarrow\; (0, 1, 1, 2, 3, 3)",
            height=0.30,
            color=M_BLUE,
        ).to_edge(DOWN, buff=0.38)
        self.play(
            Succession(FadeIn(hh_nodes[6], run_time=0.24), AnimationGroup(*[Create(e) for e in e6], run_time=0.51)),
            Succession(FadeOut(cap_hh5), FadeIn(cap_hh6)),
            run_time=0.75,
        )
        self.wait(0.35)

        # Add node 7 (deg 5) -> connect to nodes of deg 3, 3, 2, 1, 0: {6, 5, 4, 2, 1}
        # Resulting degs on {1..7}: 1:1, 3:1, 2:2, 4:3, 5:4, 6:4, 7:5 -> sorted (1, 1, 2, 3, 4, 4, 5)!
        e7 = VGroup(
            *[
                make_undirected_edge(hh_pos[7], hh_pos[t], color=M_RED, radius=0.26, stroke_width=3.0)
                for t in [6, 5, 4, 2, 1]
            ]
        )
        cap_hh7 = tex_mobject(
            r"\text{Add node } 7 \text{ (deg } 5\text{) connected to } \{6,5,4,2,1\} \;\Rightarrow\; (1, 1, 2, 3, 4, 4, 5)",
            height=0.30,
            color=M_GREEN,
        ).to_edge(DOWN, buff=0.38)
        self.play(
            Succession(FadeIn(hh_nodes[7], run_time=0.24), AnimationGroup(*[Create(e) for e in e7], run_time=0.61)),
            Succession(FadeOut(cap_hh6), FadeIn(cap_hh7)),
            run_time=0.85,
        )
        self.wait(1.6)


class EulerPlanarGrayScene(Scene):
    """Chapter 11: Euler's Polyhedron Formula & K_5/K_{3,3} Bounds (Act I), then Hypercube Gray Code on Q_3 (Act II)."""

    def construct(self):
        # =====================================================================
        # ACT I: Euler's Polyhedron Formula |V| - |E| + |F| = 2 & Non-Planarity
        # =====================================================================
        hdr1 = tex_mobject(
            r"\text{Euler's Polyhedron Formula: } |V| - |E| + |F| = 2 \quad (\text{connected planar } G)",
            height=0.39,
            color=M_INK,
        ).to_edge(UP, buff=0.34)

        p1 = np.array([-3.65, 1.95, 0.0])
        p2 = np.array([-5.55, -1.05, 0.0])
        p3 = np.array([-1.75, -1.05, 0.0])
        p4 = np.array([-3.65, -0.05, 0.0])
        nr = 0.27

        face_l = Polygon(p1, p2, p4, fill_color=M_BLUE, fill_opacity=0.14, stroke_width=0)
        face_r = Polygon(p1, p3, p4, fill_color=M_GREEN, fill_opacity=0.14, stroke_width=0)
        face_b = Polygon(p2, p3, p4, fill_color=M_YELLOW, fill_opacity=0.14, stroke_width=0)

        fl_out = tex_mobject(r"f_{\mathrm{out}}", height=0.28, color=M_MUTED).move_to([-5.35, 1.45, 0])

        e_12 = make_undirected_edge(p1, p2, color=M_BLUE, radius=nr, stroke_width=3.0)
        e_13 = make_undirected_edge(p1, p3, color=M_GREEN, radius=nr, stroke_width=3.0)
        e_23 = make_undirected_edge(p2, p3, color=M_YELLOW, radius=nr, stroke_width=3.0)
        e_14 = make_undirected_edge(p1, p4, color=M_INK, radius=nr, stroke_width=2.8)
        e_24 = make_undirected_edge(p2, p4, color=M_INK, radius=nr, stroke_width=2.8)
        e_34 = make_undirected_edge(p3, p4, color=M_INK, radius=nr, stroke_width=2.8)

        k4_nodes = VGroup(
            make_graph_node("1", p1, radius=nr),
            make_graph_node("2", p2, radius=nr),
            make_graph_node("3", p3, radius=nr),
            make_graph_node("4", p4, radius=nr),
        )

        def face_tally(label, edge_count, face_count, color):
            return VGroup(
                tex_mobject(label, height=0.29, max_width=5.6, color=color),
                tex_mobject(f"4 - {edge_count} + {face_count} = 2", height=0.32, color=color),
            ).arrange(DOWN, buff=0.19).move_to([-3.65, -2.22, 0])

        tally = face_tally(r"K_4", 6, 4, M_INK)

        # Right panel: Face-edge double counting & K_5, K_{3,3} refutation
        b0 = tex_mobject(r"\text{At least } d>2 \text{ sides per face}", height=0.29, color=M_BLUE)
        b1 = tex_mobject(r"d|F| \le 2|E| \;\Longrightarrow\; |E| \le \tfrac{d}{d-2}(|V|-2)", height=0.35, max_width=6.15, color=M_BLUE)
        b2 = tex_mobject(r"\text{Simple planar } G,\; |V|\ge 3:\quad |E| \le 3|V| - 6", height=0.31, max_width=6.15, color=M_INK)
        b3 = tex_mobject(r"K_5:\;10 > 3\cdot 5 - 6 = 9 \;\;(\text{not planar})", height=0.31, max_width=6.15, color=M_RED)
        b4 = tex_mobject(r"K_{3,3}\; (d=4):\;9 > 2\cdot 6 - 4 = 8 \;\;(\text{not planar})", height=0.31, max_width=6.15, color=M_RED)
        rhs_stack = VGroup(b0, b1, b2, b3, b4).arrange(DOWN, aligned_edge=LEFT, buff=0.35).move_to([3.35, 0.15, 0])

        cap1 = tex_mobject(
            r"\text{Deleting a cycle edge merges two adjacent faces: both } |E| \text{ and } |F| \text{ drop by } 1",
            height=0.30,
            color=M_INK,
        ).to_edge(DOWN, buff=0.38)

        self.play(
            FadeIn(hdr1),
            FadeIn(face_l),
            FadeIn(face_r),
            FadeIn(face_b),
            FadeIn(fl_out),
            Create(e_12),
            Create(e_13),
            Create(e_23),
            Create(e_14),
            Create(e_24),
            Create(e_34),
            FadeIn(k4_nodes),
            FadeIn(tally),
            FadeIn(cap1),
            run_time=0.95,
        )

        self.wait(0.45)
        tally2 = face_tally(r"\text{Delete } \{1,3\}", 5, 3, M_GREEN)
        self.play(
            FadeOut(e_13), FadeOut(face_r), Succession(FadeOut(tally), FadeIn(tally2)),
            FadeIn(b0), FadeIn(b1), FadeIn(b2), run_time=0.75,
        )
        self.wait(0.65)
        tally3 = face_tally(r"\text{Delete } \{2,3\}", 4, 2, M_YELLOW)
        self.play(
            FadeOut(e_23), FadeOut(face_b), Succession(FadeOut(tally2), FadeIn(tally3)),
            FadeIn(b3), run_time=0.75,
        )
        self.wait(0.65)
        tally4 = face_tally(r"\text{Tree after deleting } \{1,2\}", 3, 1, M_BLUE)
        self.play(
            FadeOut(e_12),
            FadeOut(face_l),
            Succession(FadeOut(tally3), FadeIn(tally4)),
            FadeIn(b4),
            run_time=0.85,
        )
        self.wait(1.3)

        act1_all = VGroup(fl_out, e_14, e_24, e_34, k4_nodes, tally4, rhs_stack, cap1)
        self.play(FadeOut(act1_all), run_time=0.55)

        # =====================================================================
        # ACT II: Reflected Gray Code Hamiltonian Cycle on Q_3 (Planar Schlegel Layout)
        # =====================================================================
        hdr2 = tex_mobject(
            r"\text{Reflected Gray Code on } Q_3 \cong P_2 \,\square\, Q_2:\; \text{Hamiltonian Cycle}",
            height=0.39,
            color=M_INK,
        ).to_edge(UP, buff=0.34)

        # Planar mirrored Schlegel layout of Q_3 symmetric across x = 0:
        q_pos = {
            "000": np.array([-4.20, -1.25, 0.0]),
            "001": np.array([-4.20, 1.35, 0.0]),
            "011": np.array([-1.55, 1.35, 0.0]),
            "010": np.array([-1.55, -1.25, 0.0]),
            "110": np.array([1.55, -1.25, 0.0]),
            "111": np.array([1.55, 1.35, 0.0]),
            "101": np.array([4.20, 1.35, 0.0]),
            "100": np.array([4.20, -1.25, 0.0]),
        }
        qr = 0.36
        q_nodes = {
            w: make_graph_node(w, q_pos[w], radius=qr, stroke_color=M_BLUE if w[0] == "0" else M_GREEN)
            for w in q_pos
        }

        mirror_line = DashedLine([0.0, -1.85, 0.0], [0.0, 2.05, 0.0], dash_length=0.14, color=M_MUTED, stroke_width=1.8)
        lbl_q0 = tex_mobject(r"0 Q_2 \text{ (forward)}", height=0.29, color=M_BLUE).move_to([-2.88, 2.52, 0])
        lbl_q1 = tex_mobject(r"1 Q_2 \text{ (reversed)}", height=0.29, color=M_GREEN).move_to([2.88, 2.52, 0])

        # Background non-cycle Q_3 edges
        bg_q = VGroup(
            make_undirected_edge(q_pos["000"], q_pos["010"], color=M_DIM, radius=qr),
            make_undirected_edge(q_pos["110"], q_pos["100"], color=M_DIM, radius=qr),
            make_undirected_edge(q_pos["011"], q_pos["111"], color=M_DIM, radius=qr),
            ArcBetweenPoints(
                q_pos["001"] + np.array([0.22, 0.31, 0.0]),
                q_pos["101"] + np.array([-0.22, 0.31, 0.0]),
                angle=-0.42,
                color=M_DIM,
                stroke_width=2.0,
            ),
        )

        seq_bar = tex_mobject(
            r"000 \to 001 \to 011 \to 010 \;\xrightarrow{\text{flip } b_1}\; 110 \to 111 \to 101 \to 100 \;\xrightarrow{\text{flip } b_1}\; 000",
            height=0.31,
            color=M_INK,
        ).to_edge(DOWN, buff=0.38)

        self.remove(hdr1)
        self.add(hdr2)
        self.play(
            Create(mirror_line),
            FadeIn(lbl_q0),
            FadeIn(lbl_q1),
            FadeIn(bg_q),
            *[FadeIn(m) for m in q_nodes.values()],
            FadeIn(seq_bar),
            run_time=0.85,
        )

        cycle_pairs = [
            ("000", "001", M_BLUE, 0.0),
            ("001", "011", M_BLUE, 0.0),
            ("011", "010", M_BLUE, 0.0),
            ("010", "110", M_YELLOW, 0.0),
            ("110", "111", M_GREEN, 0.0),
            ("111", "101", M_GREEN, 0.0),
            ("101", "100", M_GREEN, 0.0),
            ("100", "000", M_YELLOW, -0.62),
        ]

        for u_w, v_w, col, crv in cycle_pairs:
            arc = make_directed_edge(q_pos[u_w], q_pos[v_w], color=col, radius=qr, curved=crv, stroke_width=3.6)
            self.play(
                Create(arc),
                q_nodes[v_w][0].animate.set_stroke(color=M_YELLOW if col == M_YELLOW else col, width=3.2),
                run_time=0.34,
            )

        self.wait(1.7)
