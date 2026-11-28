import json

with open('backend/src/db/catalog_unica_50.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

print(f"Total products in catalog: {len(cat['products'])}")

by_page = {}
for p in cat['products']:
    page = p.get('page', 0)
    by_page.setdefault(page, []).append(p)

for page in sorted(by_page.keys()):
    prods = by_page[page]
    print(f"\n=== PAGE {page} ({len(prods)} products) ===")
    for pr in prods:
        print(f"  [{pr.get('sku')}] {pr.get('name')} | ${pr.get('price')} (promo: {pr.get('promotional_price')})")
