"""
Automated unit & integration test for MediRead Python AI Service
"""
import asyncio
import sys

# Force UTF-8 stdout for Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from schemas import PrescriptionAnalysis
from vision_analyzer import analyze_prescription_image
from chat_assistant import answer_prescription_question
from shorthands import decode_shorthand


async def run_tests():
    print("=== MediRead AI Python Test Suite ===")
    passed = 0
    failed = 0

    # 1. Shorthand decoding test
    print("\n[Test 1] Medical Shorthand Decoding")
    od = decode_shorthand("OD")
    bd = decode_shorthand("BD")
    matrix = decode_shorthand("1-0-1")
    if od and od["meaning"] == "Once daily" and bd and "Twice" in bd["meaning"] and matrix:
        print("[PASS] Shorthand decoder verified:", od["meaning"], bd["meaning"])
        passed += 1
    else:
        print("[FAIL] Shorthand decoder failed")
        failed += 1

    # 2. Vision analysis pipeline test (synthetic JPEG)
    print("\n[Test 2] Vision Analysis Pipeline (Synthetic JPEG)")
    synthetic_jpeg = bytes([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xd9
    ])
    result = await analyze_prescription_image(synthetic_jpeg, "image/jpeg")
    if isinstance(result, PrescriptionAnalysis) and len(result.medicines) > 0:
        print(f"[PASS] Vision pipeline returned structured analysis with {len(result.medicines)} medicines.")
        print(f"  Doctor: {result.doctorName}")
        print(f"  Summary: {result.summaryNote}")
        passed += 1
    else:
        print("[FAIL] Vision analysis pipeline failed")
        failed += 1

    # 3. Contextual Chat Assistant test
    print("\n[Test 3] Contextual Chat Assistant")
    reply = await answer_prescription_question(
        message="When should I take Pan-D?",
        prescription_data=result,
        history=[]
    )
    if reply and len(reply) > 5:
        print("[PASS] Chat assistant replied:", reply)
        passed += 1
    else:
        print("[FAIL] Chat assistant failed")
        failed += 1

    print(f"\n=== PYTHON AI RESULTS: {passed} PASSED, {failed} FAILED ===")


if __name__ == "__main__":
    asyncio.run(run_tests())
