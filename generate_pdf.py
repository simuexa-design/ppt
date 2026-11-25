"""
Export ECG Guardian Presentation Website to 11-Page Widescreen PDF
Uses Playwright with Microsoft Edge to render all 11 slides at 16:9 with zero overflow.
"""

import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def export_deck_to_pdf():
    script_dir = Path(__file__).resolve().parent
    html_path = script_dir / "index.html"
    output_pdf = script_dir / "ECG_Guardian_Presentation_Deck.pdf"

    if not html_path.exists():
        print(f"[-] Error: {html_path} does not exist!")
        sys.exit(1)

    target_url = html_path.as_uri()
    print("=" * 70)
    print("  ECG GUARDIAN PRESENTATION WEBSITE -> PDF EXPORTER")
    print(f"  Source: {target_url}")
    print(f"  Output: {output_pdf}")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
        )

        context = browser.new_context(
            viewport={"width": 1600, "height": 900},
            device_scale_factor=2
        )

        page = context.new_page()
        page.goto(target_url, wait_until="networkidle")
        time.sleep(1.5)

        slide_count = page.evaluate("() => document.querySelectorAll('.slide').length")
        print(f"[+] Verified {slide_count} slides loaded.")

        # Ensure numeric counters display final exact values before PDF snapshot
        page.evaluate("""() => {
            document.querySelectorAll('[data-count]').forEach(el => {
                const decimals = parseInt(el.dataset.decimals || '0', 10);
                const suffix = el.dataset.suffix || '';
                el.textContent = parseFloat(el.dataset.count).toFixed(decimals) + suffix;
            });
        }""")

        page.emulate_media(media="print")
        time.sleep(0.5)

        page.pdf(
            path=str(output_pdf),
            width="16in",
            height="9in",
            print_background=True,
            margin={"top": "0px", "right": "0px", "bottom": "0px", "left": "0px"},
            prefer_css_page_size=True
        )

        browser.close()

    if output_pdf.exists():
        size_kb = output_pdf.stat().st_size / 1024
        print(f"[✓] PDF generated: {output_pdf} ({size_kb:.1f} KB)")
    else:
        print("[-] PDF export failed.")
        sys.exit(1)

if __name__ == "__main__":
    export_deck_to_pdf()
