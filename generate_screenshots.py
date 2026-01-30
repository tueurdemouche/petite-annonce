#!/usr/bin/env python3
"""Generate App Store screenshots for Petite Annonce FR"""
import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = "/app/frontend/public/screenshots"

async def generate_screenshots():
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # iPhone 6.5" Screenshots (1284x2778)
        print("Generating iPhone 6.5\" screenshots...")
        iphone_context = await browser.new_context(
            viewport={"width": 1284, "height": 2778},
            device_scale_factor=1
        )
        iphone_page = await iphone_context.new_page()
        
        # Screenshot 1: Welcome
        await iphone_page.goto("http://localhost:3000", wait_until="networkidle", timeout=60000)
        await iphone_page.wait_for_timeout(2000)
        await iphone_page.screenshot(path=f"{SCREENSHOTS_DIR}/iphone65_1_welcome.png")
        print("✓ iPhone 6.5 - Welcome screen saved")
        
        # Screenshot 2: Home (after clicking guest)
        try:
            await iphone_page.get_by_text("Continuer en tant qu'invité").click()
            await iphone_page.wait_for_timeout(2000)
        except:
            pass
        await iphone_page.screenshot(path=f"{SCREENSHOTS_DIR}/iphone65_2_home.png")
        print("✓ iPhone 6.5 - Home screen saved")
        
        # Screenshot 3: Search
        await iphone_page.goto("http://localhost:3000/search", wait_until="networkidle", timeout=60000)
        await iphone_page.wait_for_timeout(2000)
        await iphone_page.screenshot(path=f"{SCREENSHOTS_DIR}/iphone65_3_search.png")
        print("✓ iPhone 6.5 - Search screen saved")
        
        await iphone_context.close()
        
        # iPad 13" Screenshots (2048x2732)
        print("\nGenerating iPad 13\" screenshots...")
        ipad_context = await browser.new_context(
            viewport={"width": 2048, "height": 2732},
            device_scale_factor=1
        )
        ipad_page = await ipad_context.new_page()
        
        # Screenshot 1: Welcome
        await ipad_page.goto("http://localhost:3000", wait_until="networkidle", timeout=60000)
        await ipad_page.wait_for_timeout(2000)
        await ipad_page.screenshot(path=f"{SCREENSHOTS_DIR}/ipad13_1_welcome.png")
        print("✓ iPad 13 - Welcome screen saved")
        
        # Screenshot 2: Home (after clicking guest)
        try:
            await ipad_page.get_by_text("Continuer en tant qu'invité").click()
            await ipad_page.wait_for_timeout(2000)
        except:
            pass
        await ipad_page.screenshot(path=f"{SCREENSHOTS_DIR}/ipad13_2_home.png")
        print("✓ iPad 13 - Home screen saved")
        
        # Screenshot 3: Search
        await ipad_page.goto("http://localhost:3000/search", wait_until="networkidle", timeout=60000)
        await ipad_page.wait_for_timeout(2000)
        await ipad_page.screenshot(path=f"{SCREENSHOTS_DIR}/ipad13_3_search.png")
        print("✓ iPad 13 - Search screen saved")
        
        await ipad_context.close()
        await browser.close()
        
    print(f"\n✅ All screenshots saved to {SCREENSHOTS_DIR}")
    
    # List files
    for f in os.listdir(SCREENSHOTS_DIR):
        size = os.path.getsize(f"{SCREENSHOTS_DIR}/{f}")
        print(f"  - {f} ({size/1024:.1f} KB)")

if __name__ == "__main__":
    asyncio.run(generate_screenshots())
