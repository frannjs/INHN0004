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
    prose_label,
    tex_mobject,
)


class EulerInferenceScene(Scene):
    """Chapter 1: Euler diagram inference blueprint (Barbara / Bandersnatches) vs. invalid converse counterexample."""

    def construct(self):
        hdr = tex_mobject(
            r"\text{Valid inference and a counterexample}",
            height=0.40,
            color=M_INK,
        ).to_edge(UP, buff=0.36)
        self.play(FadeIn(hdr), run_time=0.6)

        divider = Line([0.0, 2.65, 0], [0.0, -2.55, 0], color=M_DIM, stroke_width=1.6)
        self.play(Create(divider), run_time=0.4)

        # ---------------- LEFT PANEL: VALID SYLLOGISM ----------------
        left_title = prose_label("Transitive inference", font_size=25, color=M_GREEN)
        left_title.move_to([-3.55, 2.38, 0])

        c_left = np.array([-3.55, 0.15, 0.0])
        circ_r = Circle(radius=1.78, stroke_color=M_GREEN, stroke_width=2.4, fill_color=M_GREEN, fill_opacity=0.06).move_to(c_left)
        circ_q = Circle(radius=1.18, stroke_color=M_BLUE, stroke_width=2.4, fill_color=M_BLUE, fill_opacity=0.08).move_to(c_left + np.array([-0.18, -0.06, 0]))
        circ_p = Circle(radius=0.62, stroke_color=M_YELLOW, stroke_width=2.4, fill_color=M_YELLOW, fill_opacity=0.11).move_to(c_left + np.array([-0.32, -0.12, 0]))

        lbl_p = tex_mobject(r"P", height=0.28, color=M_YELLOW).move_to(circ_p.get_center() + np.array([-0.22, 0.18, 0]))
        lbl_q = tex_mobject(r"Q", height=0.28, color=M_BLUE).move_to(circ_q.get_center() + np.array([0.62, 0.56, 0]))
        lbl_r = tex_mobject(r"R", height=0.28, color=M_GREEN).move_to(circ_r.get_center() + np.array([1.12, 1.05, 0]))

        self.play(FadeIn(left_title), run_time=0.4)
        self.play(Create(circ_q), FadeIn(lbl_q), Create(circ_p), FadeIn(lbl_p), run_time=0.8)

        note = tex_mobject(
            r"\text{Premise 1: All } x \text{ with } P(x) \text{ satisfy } Q(x) \quad (P \text{ inside } Q)",
            height=0.31,
            color=M_BLUE,
        ).to_edge(DOWN, buff=0.40)
        self.play(FadeIn(note), run_time=0.45)
        self.wait(0.45)

        note2 = tex_mobject(
            r"\text{Premise 2: All } y \text{ with } Q(y) \text{ satisfy } R(y) \quad (Q \text{ inside } R)",
            height=0.31,
            color=M_GREEN,
        ).to_edge(DOWN, buff=0.40)
        self.play(FadeOut(note), run_time=0.15)
        self.play(Create(circ_r), FadeIn(lbl_r), FadeIn(note2), run_time=0.8)
        self.wait(0.45)

        wit_d_pos = circ_p.get_center() + np.array([0.14, -0.10, 0])
        dot_d = Dot(wit_d_pos, radius=0.085, color=M_YELLOW)
        lbl_d = tex_mobject(r"d", height=0.27, color=M_YELLOW).next_to(dot_d, RIGHT, buff=0.10)
        ring_d = Circle(radius=0.20, stroke_color=M_YELLOW, stroke_width=2.0).move_to(wit_d_pos)

        left_rule = tex_mobject(
            r"\frac{\forall x\,(P(x)\to Q(x)) \quad \forall y\,(Q(y)\to R(y))}{\forall z\,(P(z)\to R(z))}",
            height=0.66,
            color=M_INK,
        ).move_to([-3.55, -2.18, 0])

        note3 = tex_mobject(
            r"\text{Any witness } d \text{ with } P(d) \text{ lies in } Q \text{ and hence in } R \text{ (valid)}",
            height=0.31,
            color=M_YELLOW,
        ).to_edge(DOWN, buff=0.40)

        self.play(FadeOut(note2), run_time=0.15)
        self.play(FadeIn(dot_d), FadeIn(lbl_d), Create(ring_d), FadeIn(note3), run_time=0.7)
        self.play(FadeOut(ring_d), FadeIn(left_rule), run_time=0.6)
        self.wait(0.6)

        # ---------------- RIGHT PANEL: INVALID CONVERSE ----------------
        right_title = prose_label("Test the converse", font_size=25, color=M_RED)
        right_title.move_to([3.55, 2.38, 0])

        c_right = np.array([3.55, 0.15, 0.0])
        rcirc_q = Circle(radius=1.68, stroke_color=M_BLUE, stroke_width=2.4, fill_color=M_BLUE, fill_opacity=0.07).move_to(c_right)
        rcirc_p = Circle(radius=0.82, stroke_color=M_YELLOW, stroke_width=2.4, fill_color=M_YELLOW, fill_opacity=0.10).move_to(c_right + np.array([-0.42, -0.18, 0]))

        rlbl_p = tex_mobject(r"P\text{ (pig)}", height=0.27, color=M_YELLOW).move_to(rcirc_p.get_center())
        rlbl_q = tex_mobject(r"Q\text{ (can fly)}", height=0.28, color=M_BLUE).move_to(rcirc_q.get_center() + np.array([0.55, 1.08, 0]))

        note4 = tex_mobject(
            r"\text{Test converse: All pigs } (P) \text{ can fly } (Q),\text{ and } Q(mp)\text{ holds}",
            height=0.31,
            color=M_BLUE,
        ).to_edge(DOWN, buff=0.40)

        self.play(FadeOut(note3), run_time=0.15)
        self.play(
            FadeIn(right_title),
            Create(rcirc_q),
            FadeIn(rlbl_q),
            Create(rcirc_p),
            FadeIn(rlbl_p),
            FadeIn(note4),
            run_time=0.85,
        )

        # Witness mp starts ambiguous, then settles in Q \ P as counterexample
        mp_in_pos = rcirc_p.get_center() + np.array([0.15, -0.32, 0])
        mp_out_pos = c_right + np.array([0.78, -0.25, 0])
        dot_mp = Dot(mp_in_pos, radius=0.09, color=M_RED)
        lbl_mp = tex_mobject(r"mp", height=0.26, color=M_RED).next_to(dot_mp, RIGHT, buff=0.10)

        self.play(FadeIn(dot_mp), FadeIn(lbl_mp), run_time=0.45)
        self.play(
            dot_mp.animate.move_to(mp_out_pos),
            lbl_mp.animate.move_to(mp_out_pos + np.array([0.36, 0.0, 0])),
            run_time=0.85,
        )

        right_verdict = tex_mobject(
            r"Q(mp) \text{ true, } P(mp) \text{ false} \;\Longrightarrow\; \text{not valid}",
            height=0.34,
            color=M_RED,
        ).move_to([3.55, -2.18, 0])

        final_note = tex_mobject(
            r"\text{Counterexample } mp \in Q \setminus P \text{ satisfies all premises while refuting } P(mp)",
            height=0.31,
            color=M_RED,
        ).to_edge(DOWN, buff=0.40)

        pulse = Circle(radius=0.22, stroke_color=M_RED, stroke_width=2.2).move_to(mp_out_pos)
        self.play(FadeOut(note4), run_time=0.15)
        self.play(Create(pulse), FadeIn(right_verdict), FadeIn(final_note), run_time=0.75)
        self.play(FadeOut(pulse), run_time=0.4)
        self.wait(1.6)


class WordTreeScene(Scene):
    """Chapter 2: Infinite word tree of Sigma^* over {a,b}, language filtering, and MSBF binary tree of N."""

    def construct(self):
        hdr = tex_mobject(
            r"\Sigma^* \;=\; \bigcup_{k \in \mathbb{N}_0} \Sigma^k \quad\text{for } \Sigma = \{a, b\}",
            height=0.67,
            color=M_INK,
        ).to_edge(UP, buff=0.34)
        self.play(FadeIn(hdr), run_time=0.6)

        # Coordinates for levels k = 0, 1, 2, 3
        y_lvls = [2.05, 0.82, -0.45, -1.78]
        lvl_labels = [
            tex_mobject(rf"\Sigma^{k}", height=0.31, color=M_MUTED).move_to([-6.35, y_lvls[k], 0])
            for k in range(4)
        ]

        pos = {
            "": np.array([0.0, y_lvls[0], 0.0]),
            "a": np.array([-2.70, y_lvls[1], 0.0]),
            "b": np.array([2.70, y_lvls[1], 0.0]),
            "aa": np.array([-4.15, y_lvls[2], 0.0]),
            "ab": np.array([-1.35, y_lvls[2], 0.0]),
            "ba": np.array([1.35, y_lvls[2], 0.0]),
            "bb": np.array([4.15, y_lvls[2], 0.0]),
        }
        lvl3_words = ["aaa", "aab", "aba", "abb", "baa", "bab", "bba", "bbb"]
        lvl3_xs = [-5.15, -3.68, -2.21, -0.74, 0.74, 2.21, 3.68, 5.15]
        for w, x in zip(lvl3_words, lvl3_xs):
            pos[w] = np.array([x, y_lvls[3], 0.0])

        def make_word_pill(tex_str: str, center, w_box: float = 0.86, h_box: float = 0.46, stroke_col=M_INK):
            rect = RoundedRectangle(
                width=w_box,
                height=h_box,
                corner_radius=0.18,
                stroke_color=stroke_col,
                stroke_width=2.0,
                fill_color=M_NODE_FILL,
                fill_opacity=1.0,
            ).move_to(center)
            lbl = tex_mobject(tex_str, height=0.25, color=M_INK).move_to(center)
            return VGroup(rect, lbl)

        def edge_between_boxes(u_word: str, v_word: str, col):
            p1 = pos[u_word] + np.array([0.0, -0.24, 0.0])
            p2 = pos[v_word] + np.array([0.0, 0.24, 0.0])
            return Arrow(
                p1,
                p2,
                buff=0.03,
                color=col,
                stroke_width=2.3,
                max_tip_length_to_length_ratio=0.18,
                tip_length=0.14,
            )

        nodes = {}
        nodes[""] = make_word_pill(r"\varepsilon", pos[""], w_box=0.76)
        for w in ["a", "b"]:
            nodes[w] = make_word_pill(w, pos[w], w_box=0.76)
        for w in ["aa", "ab", "ba", "bb"]:
            nodes[w] = make_word_pill(w, pos[w], w_box=0.84)
        for w in lvl3_words:
            nodes[w] = make_word_pill(w, pos[w], w_box=0.96)

        note = tex_mobject(
            r"k = 0:\; \Sigma^0 = \{\varepsilon\} \text{ (the empty word of length } 0\text{)}",
            height=0.31,
            color=M_INK,
        ).to_edge(DOWN, buff=0.38)

        self.play(FadeIn(lvl_labels[0]), FadeIn(nodes[""]), FadeIn(note), run_time=0.65)

        edges_1 = [edge_between_boxes("", "a", M_BLUE), edge_between_boxes("", "b", M_YELLOW)]
        note1 = tex_mobject(
            r"k = 1:\; \text{append } a \text{ (left, blue) or } b \text{ (right, yellow) to form } \Sigma^1 = \{a, b\}",
            height=0.31,
            color=M_BLUE,
        ).to_edge(DOWN, buff=0.38)
        self.play(FadeOut(note), run_time=0.15)
        self.play(
            FadeIn(lvl_labels[1]),
            *[Create(e) for e in edges_1],
            FadeIn(nodes["a"]),
            FadeIn(nodes["b"]),
            FadeIn(note1),
            run_time=0.8,
        )

        edges_2 = [
            edge_between_boxes("a", "aa", M_BLUE),
            edge_between_boxes("a", "ab", M_YELLOW),
            edge_between_boxes("b", "ba", M_BLUE),
            edge_between_boxes("b", "bb", M_YELLOW),
        ]
        note2 = tex_mobject(
            r"k = 2, 3:\; |\Sigma^k| = 2^k \text{ words of length } k \text{ at depth } k",
            height=0.31,
            color=M_INK,
        ).to_edge(DOWN, buff=0.38)
        self.play(FadeOut(note1), run_time=0.15)
        self.play(
            FadeIn(lvl_labels[2]),
            *[Create(e) for e in edges_2],
            *[FadeIn(nodes[w]) for w in ["aa", "ab", "ba", "bb"]],
            FadeIn(note2),
            run_time=0.8,
        )

        edges_3 = []
        for parent in ["aa", "ab", "ba", "bb"]:
            edges_3.append(edge_between_boxes(parent, parent + "a", M_BLUE))
            edges_3.append(edge_between_boxes(parent, parent + "b", M_YELLOW))

        dots_below = VGroup(
            *[
                tex_mobject(r"\vdots", height=0.26, color=M_DIM).move_to([pos[w][0], -2.35, 0])
                for w in lvl3_words
            ]
        )

        self.play(
            FadeIn(lvl_labels[3]),
            *[Create(e) for e in edges_3],
            *[FadeIn(nodes[w]) for w in lvl3_words],
            FadeIn(dots_below),
            run_time=0.9,
        )
        self.wait(0.5)

        # Highlight Language L = {w in Sigma^* | w ends on a}
        lang_words = ["a", "aa", "ba", "aaa", "aba", "baa", "bba"]
        note_lang = tex_mobject(
            r"\text{Language } L = \{w \in \Sigma^* \mid w \text{ ends on } a\} \subseteq \Sigma^*",
            height=0.32,
            color=M_GREEN,
        ).to_edge(DOWN, buff=0.38)

        self.play(FadeOut(note2), run_time=0.15)
        self.play(
            *[nodes[w][0].animate.set_stroke(M_GREEN, width=3.0).set_fill(M_GREEN, opacity=0.18) for w in lang_words],
            FadeIn(note_lang),
            run_time=0.85,
        )
        self.wait(0.85)

        # Relabel a -> 0 and b -> 1 while keeping the graph fixed.
        hdr_bin = tex_mobject(
            r"a \mapsto 0,\quad b \mapsto 1\qquad \text{Words starting in } 1 \text{ encode } \mathbb{N}",
            height=0.40,
            color=M_INK,
        ).to_edge(UP, buff=0.34)

        bin_labels = VGroup()
        relabel_anims = []
        for w in pos:
            if w == "":
                continue
            bin_str = w.replace("a", "0").replace("b", "1")
            is_msbf = bin_str.startswith("1")
            new_lbl = tex_mobject(
                bin_str,
                height=0.25,
                color=M_YELLOW if is_msbf else "#9B9BA5",
            ).move_to(pos[w])
            bin_labels.add(new_lbl)
            if is_msbf:
                relabel_anims.append(
                    nodes[w][0].animate.set_stroke(M_YELLOW, width=2.8).set_fill(M_YELLOW, opacity=0.14)
                )
            else:
                relabel_anims.append(
                    nodes[w][0].animate.set_stroke(M_MUTED, width=1.9).set_fill(M_NODE_FILL, opacity=1.0)
                )

        note_bin = tex_mobject(
            r"1_2=1,\quad 10_2=2,\quad 11_2=3,\quad 100_2=4,\quad\dots,\quad 111_2=7",
            height=0.31,
            color=M_YELLOW,
        ).to_edge(DOWN, buff=0.38)

        normal_levels = VGroup(*lvl_labels)
        binary_levels = VGroup(
            *(tex_mobject(rf"\{{0,1\}}^{k}", height=0.28, color=M_MUTED, max_width=0.95)
              .move_to(label) for k, label in enumerate(lvl_labels))
        )
        word_labels = VGroup(*(node[1] for word, node in nodes.items() if word))
        self.play(FadeOut(hdr), FadeOut(note_lang), FadeOut(word_labels), FadeOut(normal_levels), run_time=0.20)
        self.play(
            FadeIn(hdr_bin), FadeIn(note_bin), FadeIn(bin_labels), FadeIn(binary_levels),
            *relabel_anims, run_time=0.42,
        )
        self.wait(1.7)


class HanoiInductionScene(Scene):
    """Show the recursive 3-disk transfer one completed move at a time."""

    def construct(self):
        hdr = tex_mobject(
            r"a_0=0,\qquad a_{n+1}=2a_n+1,\qquad a_n=2^n-1",
            height=0.42,
            color=M_INK,
        ).to_edge(UP, buff=0.46)

        peg_xs = [-5.28, -2.96, -0.64]
        base_y = -1.44
        peg_top_y = 1.12
        disk_h = 0.45

        base_line = Line([-6.45, base_y, 0], [0.55, base_y, 0], color=M_MUTED, stroke_width=3.2)
        pegs = VGroup(
            *(Line([px, base_y, 0], [px, peg_top_y, 0], color="#666671", stroke_width=4) for px in peg_xs)
        )

        peg_lbls = VGroup(
            *(tex_mobject(rf"\mathrm{{{name}}}", height=0.31).move_to([x, base_y - 0.40, 0])
              for x, name in zip(peg_xs, "LMR"))
        )

        def slot_pos(peg_index, level):
            return np.array([peg_xs[peg_index], base_y + disk_h * (level + 0.5), 0.0])

        disks = []
        # The slide numbers the disks from the largest (1) to the smallest (3).
        for index, (width, color) in enumerate([(1.78, M_BLUE), (1.36, M_GREEN), (0.96, M_YELLOW)]):
            position = slot_pos(0, index)
            rect = RoundedRectangle(
                width=width,
                height=disk_h - 0.02,
                corner_radius=0.12,
                stroke_color=color,
                stroke_width=3,
                fill_color=interpolate_color(BLACK, ManimColor(color), 0.27),
                fill_opacity=1,
            ).move_to(position)
            label = tex_mobject(str(index + 1), height=0.27).move_to(position)
            disks.append(VGroup(rect, label))

        panel_x = 3.65
        panel_width = 5.40
        captions = [
            ("Move disks 2 and 3", r"\mathrm{L}\to\mathrm{M}\qquad a_2=3\ \text{moves}", M_GREEN),
            ("Move disk 1", r"\mathrm{L}\to\mathrm{R}\qquad 1\ \text{move}", M_BLUE),
            ("Move disks 2 and 3", r"\mathrm{M}\to\mathrm{R}\qquad a_2=3\ \text{moves}", M_YELLOW),
        ]
        cards = []
        for i, (title, action, color) in enumerate(captions):
            box = RoundedRectangle(
                width=panel_width, height=1.15, corner_radius=0.14, stroke_color="#444450",
                stroke_width=2, fill_color=M_NODE_FILL, fill_opacity=1,
            ).move_to([panel_x, 1.45 - 1.27 * i, 0])
            title_label = prose_label(f"Phase {i + 1} · {title}", font_size=23)
            action_label = tex_mobject(action, height=0.28, max_width=panel_width - 0.60, color=color)
            if title_label.width > panel_width - 0.60:
                title_label.scale_to_fit_width(panel_width - 0.60)
            labels = VGroup(title_label, action_label).arrange(DOWN, buff=0.13).move_to(box)
            cards.append(VGroup(box, labels))

        counter_label = prose_label("Moves completed", font_size=22).move_to([2.75, -2.13, 0])
        counter = tex_mobject(r"0/7", height=0.35).move_to([5.38, -2.13, 0])
        note = prose_label("Before disk 1 can move to R, clear both smaller disks to M.", font_size=25)
        note.to_edge(DOWN, buff=0.61)
        self.play(FadeIn(VGroup(hdr, base_line, pegs, peg_lbls, *disks, *cards, counter_label, counter, note)), run_time=0.55)
        stacks = [[0, 1, 2], [], []]
        move_count = 0

        def move_disk(src, dst):
            nonlocal move_count, counter
            disk_index = stacks[src].pop()
            assert not stacks[dst] or stacks[dst][-1] < disk_index
            disk = disks[disk_index]
            end = slot_pos(dst, len(stacks[dst]))
            stacks[dst].append(disk_index)
            lift_y = peg_top_y + disk_h
            self.bring_to_front(disk)
            self.play(disk.animate.set_y(lift_y), run_time=0.21)
            self.play(disk.animate.set_x(end[0]), run_time=0.25)
            self.play(disk.animate.move_to(end), run_time=0.21)
            move_count += 1
            next_counter = tex_mobject(
                f"{move_count}/7", height=0.35, color=M_GREEN if move_count == 7 else M_INK,
            ).move_to(counter)
            self.remove(counter)
            self.add(next_counter)
            counter = next_counter
            self.wait(0.46 if move_count == 6 else 0.16)

        self.play(cards[0][0].animate.set_stroke(M_GREEN, width=3), run_time=0.25)
        self.wait(0.44)
        move_disk(0, 2)
        move_disk(0, 1)
        move_disk(2, 1)

        note_mid = prose_label("The smaller disks stay on M while disk 1 moves to R.", font_size=25).move_to(note)
        self.play(FadeOut(note), run_time=0.15)
        self.play(
            cards[0][0].animate.set_stroke("#444450", width=2),
            cards[1][0].animate.set_stroke(M_BLUE, width=3),
            FadeIn(note_mid), run_time=0.28,
        )
        move_disk(0, 2)

        note_end = prose_label("Rebuild the two-disk stack above disk 1 on R.", font_size=25).move_to(note)
        self.play(FadeOut(note_mid), run_time=0.15)
        self.play(
            cards[1][0].animate.set_stroke("#444450", width=2),
            cards[2][0].animate.set_stroke(M_YELLOW, width=3),
            FadeIn(note_end), run_time=0.28,
        )
        move_disk(1, 0)
        move_disk(1, 2)
        move_disk(0, 2)

        assert stacks == [[], [], [0, 1, 2]] and move_count == 7
        result = tex_mobject(r"a_3=a_2+1+a_2=3+1+3=7", height=0.38, color=M_GREEN).move_to(note)
        self.play(FadeOut(note_end), run_time=0.15)
        self.play(FadeIn(result), run_time=0.26)
        self.wait(1.85)
