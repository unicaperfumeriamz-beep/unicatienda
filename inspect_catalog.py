import json

with open('backend/src/db/catalog_unica_50.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

print('Categories count:', len(cat['categories']))
print('Products count:', len(cat['products']))

prices = {}
for p in cat['products']:
    pr = p.get('price')
    prices[pr] = prices.get(pr, 0) + 1

print('Price distribution:')
for price, count in sorted(prices.items(), key=lambda x: str(x[0])):
    print(f"  ${price}: {count} products")

print('\nSample 20 products:')
for p in cat['products'][:20]:
    print(f"  [{p.get('sku')}] {p.get('name')} | Cat: {p.get('category_slug')} | Price: ${p.get('price')} | Promo: ${p.get('promotional_price')} | Page: {p.get('page')}")
