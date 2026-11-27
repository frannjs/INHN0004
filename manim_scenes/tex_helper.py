"""
Shared Computer Modern LaTeX + Graph helper for Manim Community v0.22.
Compiles genuine LaTeX via /Library/TeX/texbin/pdflatex -> /opt/homebrew/bin/pdftocairo -svg
in isolated temp directories with atomic cache rename so parallel Manim renders are 100% race-free.
"""

import hashlib
import os
import subprocess
import tempfile
import numpy as np
from pathlib import Path
from manim import *

config.background_color = "#000000"

CACHE_DIR = Path(__file__).resolve().parent / ".tex_svg_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

PDFLATEX = "/Library/TeX/texbin/pdflatex"
PDFTOCAIRO = "/opt/homebrew/bin/pdftocairo"

# 3Blue1Brown mathematical palette matching book.css
M_BLUE = "#58C4DD"
M_YELLOW = "#F4D35E"
M_GREEN = "#83C167"
M_RED = "#FC6255"
M_INK = "#FAFAFA"
M_MUTED = "#7A7A85"
M_DIM = "#2C2C34"
M_NODE_FILL = "#0B0C10"


def tex_mobject(latex_expr: str, height: float = 0.38, max_width: float = 12.8, color=M_INK) -> SVGMobject:
    """Render inline/display LaTeX math to a crisp vector SVGMobject using BasicTeX."""
    digest = hashlib.sha1(latex_expr.encode("utf-8")).hexdigest()[:16]
    svg_path = CACHE_DIR / f"{digest}.svg"

    if not svg_path.exists():
        doc = (
            r"\documentclass[12pt]{article}" "\n"
            r"\usepackage{amsmath,amssymb}" "\n"
            r"\pdfpagewidth=36in \pdfpageheight=12in \textwidth=34in \oddsidemargin=0in" "\n"
            r"\providecommand{\coloneqq}{\mathrel{:=}}" "\n"
            r"\providecommand{\eqqcolon}{\mathrel{=:}}" "\n"
            r"\providecommand{\llbracket}{[\![}" "\n"
            r"\providecommand{\rrbracket}{]\!]}" "\n"
            r"\pagestyle{empty}" "\n"
            r"\begin{document}" "\n"
            r"\noindent$\displaystyle " + latex_expr + r"$" "\n"
            r"\end{document}" "\n"
        )
        with tempfile.TemporaryDirectory() as tmp_d:
            tmp_dir = Path(tmp_d)
            (tmp_dir / "expr.tex").write_text(doc, encoding="utf-8")
            res = subprocess.run(
                [PDFLATEX, "-interaction=nonstopmode", "-halt-on-error", "expr.tex"],
                cwd=tmp_d,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            if res.returncode != 0:
                raise RuntimeError(
                    f"pdflatex failed on {latex_expr}:\n{res.stdout.decode('utf-8', 'ignore')[-800:]}"
                )
            tmp_out = CACHE_DIR / f".tmp_{digest}_{os.getpid()}.svg"
            subprocess.run(
                [PDFTOCAIRO, "-svg", str(tmp_dir / "expr.pdf"), str(tmp_out)],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
            )
            os.replace(str(tmp_out), str(svg_path))

    mob = SVGMobject(str(svg_path))
    mob.set_color(color)
    mob.set_stroke(width=0)
    mob.set_fill(color=color, opacity=1.0)
    if mob.height > 1e-6:
        mob.scale_to_fit_height(height)
    if mob.width > max_width:
        mob.scale_to_fit_width(max_width)
    return mob


def prose_label(text: str, font_size: int = 21, color=M_INK, weight=NORMAL) -> Text:
    """Clean editorial sans-serif label for titles/captions."""
    return Text(text, font="Helvetica Neue", font_size=font_size, color=color, weight=weight)


def make_graph_node(label_latex: str, pos, radius: float = 0.34, stroke_color=M_INK) -> VGroup:
    """Crisp circular graph vertex with centered LaTeX label."""
    circ = Circle(
        radius=radius,
        stroke_color=stroke_color,
        stroke_width=2.2,
        fill_color=M_NODE_FILL,
        fill_opacity=1.0,
    ).move_to(pos)
    lbl = tex_mobject(label_latex, height=radius * 0.85, color=M_INK).move_to(pos)
    return VGroup(circ, lbl)


def make_directed_edge(
    u_pos,
    v_pos,
    color=M_BLUE,
    radius: float = 0.34,
    curved: float = 0.0,
    loop_out_dir=UP + RIGHT,
    stroke_width: float = 2.6,
):
    """Directed edge or outward self-loop stopping cleanly at node boundaries."""
    u = np.array(u_pos, dtype=float)
    v = np.array(v_pos, dtype=float)
    if np.linalg.norm(v - u) < 1e-5:
        d = np.array(loop_out_dir, dtype=float)
        d = d / (np.linalg.norm(d) or 1.0)
        arc = Arc(radius=0.25, start_angle=-0.45, angle=4.95, color=color, stroke_width=stroke_width)
        arc.move_to(u + d * (radius + 0.21))
        arc.add_tip(tip_length=0.14, tip_width=0.14)
        return arc

    vec = v - u
    dist = np.linalg.norm(vec)
    unit = vec / dist
    start = u + unit * (radius + 0.03)
    end = v - unit * (radius + 0.05)
    if abs(curved) < 1e-4:
        return Arrow(
            start,
            end,
            buff=0,
            color=color,
            stroke_width=stroke_width,
            max_tip_length_to_length_ratio=0.22,
            tip_length=0.16,
        )
    return CurvedArrow(
        start,
        end,
        angle=curved,
        color=color,
        stroke_width=stroke_width,
        tip_length=0.16,
    )


def make_undirected_edge(u_pos, v_pos, color=M_BLUE, radius: float = 0.34, stroke_width: float = 2.6):
    """Clean undirected edge stopping at node boundaries."""
    u = np.array(u_pos, dtype=float)
    v = np.array(v_pos, dtype=float)
    vec = v - u
    dist = np.linalg.norm(vec) or 1.0
    unit = vec / dist
    return Line(u + unit * (radius + 0.02), v - unit * (radius + 0.02), color=color, stroke_width=stroke_width)


def make_paren_matrix(grid, entry_color_fn=None, cell_h: float = 0.30, h_buff: float = 0.44, v_buff: float = 0.32):
    """Curved-parenthesis matrix using Computer Modern LaTeX digits."""
    rows = []
    entries = []
    for i, row in enumerate(grid):
        r_mobs = []
        for j, val in enumerate(row):
            col = entry_color_fn(i, j, val) if entry_color_fn else M_INK
            tex_str = str(val)
            h = 0.08 if tex_str == r"\cdot" else cell_h
            m = tex_mobject(tex_str, height=h, color=col)
            r_mobs.append(m)
            entries.append(m)
        rows.append(VGroup(*r_mobs).arrange(RIGHT, buff=h_buff))
    body = VGroup(*rows).arrange(DOWN, buff=v_buff)

    top_y = body.get_top()[1] + 0.18
    bot_y = body.get_bottom()[1] - 0.18
    lx = body.get_left()[0] - 0.20
    rx = body.get_right()[0] + 0.20

    l_paren = ArcBetweenPoints(
        [lx + 0.09, top_y, 0], [lx + 0.09, bot_y, 0], angle=0.52, color=GREY_A, stroke_width=2.2
    )
    r_paren = ArcBetweenPoints(
        [rx - 0.09, bot_y, 0], [rx - 0.09, top_y, 0], angle=0.52, color=GREY_A, stroke_width=2.2
    )
    return VGroup(body, l_paren, r_paren), entries
