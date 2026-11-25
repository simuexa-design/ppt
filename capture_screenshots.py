"""
Playwright Live Screenshot Capture for ECG Guardian Presentation Website
Captures real, up-to-date screenshots from the running platform at http://127.0.0.1:5000/
"""

import os
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def capture_all():
    out_dir = Path(__file__).resolve().parent / "images" / "screenshots"
    out_dir.mkdir(parents=True, exist_ok=True)
    base_url = "http://127.0.0.1:5000/"

    print("=" * 70)
    print("  PLAYWRIGHT SCREENSHOT CAPTURE · ECG GUARDIAN LIVE PLATFORM")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--no-sandbox", "--disable-gpu"]
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1.5
        )
        page = context.new_page()

        print(f"[*] Navigating to {base_url}...")
        page.goto(base_url, wait_until="networkidle")
        time.sleep(1.5)

        # 1. Landing Page
        page.evaluate("() => navigateTo('landing')")
        time.sleep(1.2)
        page.screenshot(path=str(out_dir / "screen_01_landing.png"))
        print("[+] Captured screen_01_landing.png")

        # 2. Auth Gateway
        page.evaluate("() => navigateTo('auth')")
        time.sleep(0.8)
        page.screenshot(path=str(out_dir / "screen_02_auth.png"))
        print("[+] Captured screen_02_auth.png")

        # 3. Doctor Login -> Doctor Dashboard
        page.evaluate("() => quickLoginUser('dr_sonali', true)")
        time.sleep(1.5)
        page.screenshot(path=str(out_dir / "screen_03_doctor_dashboard.png"))
        print("[+] Captured screen_03_doctor_dashboard.png")

        # 4. ECG Scan Studio (Load AFib Sample)
        page.evaluate("async () => { navigateTo('ecgScan'); await loadBenchmarkSample('afib', false); }")
        time.sleep(1.5)
        page.screenshot(path=str(out_dir / "screen_04_ecg_scan.png"))
        print("[+] Captured screen_04_ecg_scan.png")

        # 5. Deep Learning Analysis + 1D Grad-CAM
        page.evaluate("async () => { navigateTo('analysis'); await triggerAnalysis(); }")
        time.sleep(2.8)
        page.screenshot(path=str(out_dir / "screen_05_analysis.png"))
        print("[+] Captured screen_05_analysis.png")

        # 6. Clinical Decision Support (CDS)
        page.evaluate("() => navigateTo('cds')")
        time.sleep(1.2)
        page.screenshot(path=str(out_dir / "screen_06_cds.png"))
        print("[+] Captured screen_06_cds.png")

        # 7. Formal Doctor Diagnostic Report
        page.evaluate("() => navigateTo('doctorReport')")
        time.sleep(1.2)
        page.screenshot(path=str(out_dir / "screen_07_doctor_report.png"))
        print("[+] Captured screen_07_doctor_report.png")

        # 8. Patient Cohort Management
        page.evaluate("() => navigateTo('patientsManagement')")
        time.sleep(1.2)
        page.screenshot(path=str(out_dir / "screen_09_patient_management.png"))
        print("[+] Captured screen_09_patient_management.png")

        # 9. Patient Portal Login -> Raj Verma Dashboard
        page.evaluate("() => quickLoginUser('raj_verma', true)")
        time.sleep(1.5)
        page.screenshot(path=str(out_dir / "screen_08_patient_dashboard.png"))
        print("[+] Captured screen_08_patient_dashboard.png")

        browser.close()

    print("=" * 70)
    print(f"[✓] All 9 fresh screenshots saved to {out_dir}")
    print("=" * 70)

if __name__ == "__main__":
    capture_all()
