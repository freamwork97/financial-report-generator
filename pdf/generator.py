from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML, CSS
from pathlib import Path
from dataclasses import asdict
from backend.metrics.calculator import FinancialMetrics
import json


TEMPLATE_DIR = Path(__file__).parent / "templates"


def generate_pdf(
    company_name: str,
    year: int,
    metrics: FinancialMetrics,
    analysis_text: str,
    price_history: list[dict],
    output_path: str,
) -> str:
    env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))
    template = env.get_template("report.html")

    m = asdict(metrics)
    html_content = template.render(
        company_name=company_name,
        year=year,
        metrics=m,
        analysis_text=analysis_text,
        price_history=json.dumps(price_history[-30:] if price_history else []),
    )

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    HTML(string=html_content).write_pdf(str(output))
    return str(output)
