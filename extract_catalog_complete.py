import json
import re
import os
import shutil

with open('ocr_results_all.json', 'r', encoding='utf-8-sig') as f:
    ocr_data = json.load(f)

products = []
seen_skus = set()

TYPOS = [
    (r"3'Adore", "J'Adore"),
    (r"Cood Ciri", "Good Girl"),
    (r"Good Ciri", "Good Girl"),
    (r"By Skra", "By Shakira"),
    (r"Topino 24", "Torino 24"),
    (r"Conno Valentino", "Uomo Valentino"),
    (r"I a ida es Bella", "La Vida es Bella"),
    (r"I ly pnotic", "Hypnotic"),
    (r"Baccapat Rouge", "Baccarat Rouge 540"),
    (r"01\)\s*mpea|01\)\s*ympea", "Olympea"),
    (r"llépoes", "Héroes"),
    (r"PaplUm|Papfum", "Parfum"),
    (r"pop UNICA|pov UNICA", "por UNICA"),
    (r"Epba Pupa", "Erba Pura"),
    (r"K\. Flowep", "Kenzo Flower"),
    (r"10bacco \ainille|10bacco", "Tobacco Vanille"),
    (r"POIO Blue", "Polo Blue"),
    (r"Aqua Di Gio", "Acqua Di Gio"),
    (r"Iclôle Po»ep|Iclole", "Idôle Power"),
    (r"Pupe XS", "Pure XS"),
    (r"La \\ ida es Bella", "La Vida es Bella"),
    (r"Very Cirl Clam", "Very Good Girl Glam"),
    (r"The only One", "The Only One"),
    (r"212 llépoes", "212 Héroes"),
    (r"Dance Skra", "Dance Shakira"),
    (r"Hallo»een", "Halloween"),
    (r"Ange ou\s*Demon", "Ange ou Démon"),
    (r"Bade'e Al Oucl", "Bade'e Al Oud"),
    (r"Khampah", "Khamrah"),
    (r"Oud for Glopy", "Oud for Glory"),
    (r"Noble Blush", "Noble Blush"),
]

def clean_text(text):
    text = re.sub(r'\s+', ' ', text).strip()
    for pat, rep in TYPOS:
        text = re.sub(pat, rep, text, flags=re.I)
    return text.strip()

def get_page_lines(page_num):
    data = ocr_data.get(str(page_num), {})
    return data.get('lines', [])

def get_page_text(page_num):
    data = ocr_data.get(str(page_num), {})
    return data.get('text', '')

def add_product(name, category_slug, price, promo_price, description, sku, page_num, stock=35):
    name = clean_text(name)
    if not name or len(name) < 3:
        return
    sku = sku.strip().upper() if sku else f"UNI-{page_num}-{len(products)+1}"
    sku = re.sub(r'[^A-Z0-9-]', '', sku)
    if not sku:
        sku = f"UNI-{page_num}-{len(products)+1}"
    
    base_sku = sku
    counter = 1
    while sku in seen_skus:
        sku = f"{base_sku}-{counter}"
        counter += 1
    seen_skus.add(sku)

    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    if not slug:
        slug = f"prod-{sku.lower()}"

    price = float(price)
    promo_price = float(promo_price) if promo_price and promo_price < price else None
    points = int(price * 0.1)

    products.append({
        "name": name,
        "slug": slug,
        "category_slug": category_slug,
        "price": price,
        "promotional_price": promo_price,
        "description": clean_text(description),
        "sku": sku,
        "imageUrl": f"/catalog/page_{page_num}.jpg",
        "stock": stock,
        "points": points,
        "page": page_num
    })

# Process all pages
for p in range(1, 87):
    text = get_page_text(p)
    lines = get_page_lines(p)

    price_matches = re.findall(r'\$\s*(\d{1,3}(?:\.\d{3})*)', text)
    found_prices = []
    for pm in price_matches:
        val = float(pm.replace('.', ''))
        if 1000 <= val <= 250000:
            found_prices.append(val)
    
    if p == 1:
        continue
    elif p == 2:
        add_product(
            name="Perfume Estilo Born in Roma Uomo Valentino - UNICA Premium 90ml",
            category_slug="perfumes-premium",
            price=66999,
            promo_price=46999,
            description="Lanzamiento especial. Fragancia Fougére Amaderada con notas especiadas, bergamota y mandarina de salida; lavanda silvestre de corazón y notas amaderadas y vetiver de fondo. Incluye neceser UNICA de regalo y perfumero recargable de 10 ml. 90 ml.",
            sku="MBRUPP",
            page_num=p
        )
    elif p == 3:
        add_product(
            name="Perfume Estilo Torino 24 - UNICA Árabe Premium 120ml",
            category_slug="perfumes-arabes-premium",
            price=69999,
            promo_price=54999,
            description="Lanzamiento exclusivo alta perfumería árabe. Fragancia Frutal con notas de mango, bergamota y ciruela. Incluye perfumero recargable de 10 ml. 120 ml.",
            sku="UT024",
            page_num=p
        )
    elif p in [4, 5]:
        for i, line in enumerate(lines):
            l = line.strip()
            if l.startswith("Estilo "):
                name_part = l.replace("Estilo ", "")
                if i + 1 < len(lines) and any(w in lines[i+1] for w in ["por UNICA", "UNICA", "Parfum", "Clásico", "Rose", "Red", "Rock"]):
                    name_part += " " + lines[i+1].replace("por UNICA", "").replace("por", "").strip()
                name_clean = f"Perfume Estilo {name_part} - UNICA Femenino 50ml"
                notes = "Fragancia femenina de alta intensidad y fijación prolongada. Presentación Eau de Parfum 50 ml."
                sku_val = f"FFEM-{p}-{i}"
                for k in range(i+1, min(i+5, len(lines))):
                    if re.match(r'^[A-Z0-9]{4,6}$', lines[k].strip()):
                        sku_val = lines[k].strip()
                    elif any(fam in lines[k].lower() for fam in ['floral', 'frutal', 'oriental', 'vainilla', 'ámbar', 'cítrico']):
                        notes = f"Familia olfativa: {lines[k].strip()}. Presentación Eau de Parfum 50 ml."
                add_product(
                    name=name_clean,
                    category_slug="fragancias-femeninas",
                    price=24999,
                    promo_price=19999,
                    description=notes,
                    sku=sku_val,
                    page_num=p
                )
    elif p in [6, 7]:
        for i, line in enumerate(lines):
            l = line.strip()
            if l.startswith("Estilo "):
                name_part = l.replace("Estilo ", "")
                if i + 1 < len(lines) and any(w in lines[i+1] for w in ["por UNICA", "UNICA", "Intense", "Black", "Impact", "Secret"]):
                    name_part += " " + lines[i+1].replace("por UNICA", "").replace("por", "").strip()
                name_clean = f"Perfume Estilo {name_part} - UNICA Masculino 50ml"
                notes = "Fragancia masculina sofisticada de alta concentración y gran duración. Presentación Eau de Parfum 50 ml."
                sku_val = f"FMASC-{p}-{i}"
                for k in range(i+1, min(i+5, len(lines))):
                    if re.match(r'^[A-Z0-9]{4,6}$', lines[k].strip()):
                        sku_val = lines[k].strip()
                    elif any(fam in lines[k].lower() for fam in ['amaderad', 'fougere', 'especiad', 'cítrico', 'aromático']):
                        notes = f"Familia olfativa: {lines[k].strip()}. Presentación Eau de Parfum 50 ml."
                add_product(
                    name=name_clean,
                    category_slug="fragancias-masculinas",
                    price=24999,
                    promo_price=19999,
                    description=notes,
                    sku=sku_val,
                    page_num=p
                )
    elif p == 8:
        add_product(
            name="Body Splash Estilo Idôle Power por UNICA 125ml",
            category_slug="fragancias-femeninas",
            price=11999,
            promo_price=8999,
            description="Body Splash refrescante e intenso con notas de rosa y sándalo. Presentación 125 ml.",
            sku="FIDPOB",
            page_num=p
        )
        add_product(
            name="Perfume Roll-On Estilo Idôle Power por UNICA 15ml",
            category_slug="fragancias-femeninas",
            price=11999,
            promo_price=8999,
            description="Perfume pocket de bolsillo para cartera. Notas de rosa intensa y madera cálida. 15 ml.",
            sku="FIDP015",
            page_num=p
        )
    elif p == 9:
        add_product(
            name="Perfume Estilo Idôle Power por UNICA 50ml",
            category_slug="fragancias-femeninas",
            price=24999,
            promo_price=19999,
            description="El poder de ser vos. Una esencia intensa y envolvente que combina femineidad, carácter y sensualidad. Eau de Parfum Femenino 50 ml.",
            sku="FIDPO",
            page_num=p
        )
    elif p in [10, 11, 12, 13]:
        for i, line in enumerate(lines):
            l = line.strip()
            if l.startswith("Estilo "):
                name_part = l.replace("Estilo ", "")
                if i + 1 < len(lines) and any(w in lines[i+1] for w in ["por UNICA", "UNICA", "Nova", "Rose", "Poison", "Amour", "Blue", "Flower", "Scandal"]):
                    name_part += " " + lines[i+1].replace("por UNICA", "").replace("por", "").strip()
                name_clean = f"Perfume Pocket Estilo {name_part} - UNICA 15ml"
                notes = "Versión de cartera 15 ml. Ideal para llevar siempre con vos con la máxima concentración."
                sku_val = f"FPOCK-{p}-{i}"
                for k in range(i+1, min(i+4, len(lines))):
                    if re.match(r'^[A-Z0-9]{4,6}$', lines[k].strip()):
                        sku_val = lines[k].strip()
                add_product(
                    name=name_clean,
                    category_slug="fragancias-femeninas",
                    price=11999,
                    promo_price=8999,
                    description=notes,
                    sku=sku_val,
                    page_num=p
                )
    elif p == 14:
        add_product(
            name="Perfume Pocket Estilo 212 Men Parfum por UNICA 15ml",
            category_slug="fragancias-masculinas",
            price=11999,
            promo_price=8999,
            description="Eau de Parfum Masculino 15 ml en envase transportable de alta graduación aromática.",
            sku="M212P15",
            page_num=p
        )
        add_product(
            name="Body Splash Estilo 212 Men Parfum por UNICA 125ml",
            category_slug="fragancias-masculinas",
            price=11999,
            promo_price=8999,
            description="Body splash refrescante masculino con fijación ligera y sensación de frescura duradera. 125 ml.",
            sku="M212PB",
            page_num=p
        )
    elif p == 15:
        add_product(
            name="Perfume Estilo 212 Men Parfum por UNICA 50ml",
            category_slug="fragancias-masculinas",
            price=24999,
            promo_price=19999,
            description="Carácter que se hace sentir. Intensa y sofisticada esencia para el hombre que vive con seguridad y deja su sello. Eau de Parfum Masculino 50 ml.",
            sku="M212P",
            page_num=p
        )
    elif p in [16, 17]:
        for i, line in enumerate(lines):
            l = line.strip()
            if l.startswith("Estilo "):
                name_part = l.replace("Estilo ", "")
                if i + 1 < len(lines) and any(w in lines[i+1] for w in ["por UNICA", "UNICA", "Victory", "Elixir", "Sauvage", "Scandal", "Phantom"]):
                    name_part += " " + lines[i+1].replace("por UNICA", "").replace("por", "").strip()
                name_clean = f"Perfume Estilo {name_part} - UNICA Masculino 50ml"
                notes = "Eau de Parfum masculino de alta fijación olfativa. Frasco de 50 ml."
                sku_val = f"FMASC50-{p}-{i}"
                for k in range(i+1, min(i+4, len(lines))):
                    if re.match(r'^[A-Z0-9]{4,6}$', lines[k].strip()):
                        sku_val = lines[k].strip()
                add_product(
                    name=name_clean,
                    category_slug="fragancias-masculinas",
                    price=24999,
                    promo_price=19999,
                    description=notes,
                    sku=sku_val,
                    page_num=p
                )
    elif p in [18, 19]:
        for i, line in enumerate(lines):
            l = line.strip()
            if l.startswith("Estilo ") or ("por UNICA" in l and "Estilo" in l):
                name_clean = f"Óleo Perfumado Concentrado {l} 15ml"
                add_product(
                    name=name_clean,
                    category_slug="perfumes-premium",
                    price=18999,
                    promo_price=14999,
                    description="Alta concentración de fragancia en base oleosa pura. Máxima fijación en la piel sin alcohol resecante.",
                    sku=f"OLEO-{p}-{i}",
                    page_num=p
                )
    elif 20 <= p <= 44:
        cat = "perfumes-premium"
        if any(w in text.lower() for w in ["árabe", "arabe", "oud", "bade'e", "torino"]):
            cat = "perfumes-arabes-premium"
        
        prod_names = []
        for i, l in enumerate(lines):
            if l.strip().startswith("Estilo "):
                pname = l.strip().replace("Estilo ", "")
                if i + 1 < len(lines) and any(w in lines[i+1] for w in ["por UNICA", "Por Unica", "Premium", "Gold", "Oud", "Roma", "Rouge", "Poison"]):
                    pname += " " + lines[i+1].replace("por UNICA", "").replace("Por Unica", "").strip()
                prod_names.append(pname)
        
        sku_matches = re.findall(r'(?:Código|Codigo|CODIGO)[:\s]+([A-Z0-9]+)', text)
        pr = found_prices[0] if found_prices else 44999
        promo = found_prices[1] if len(found_prices) > 1 and found_prices[1] < pr else (pr * 0.8 if pr > 30000 else None)
        if promo and promo > pr:
            pr, promo = promo, pr

        if prod_names:
            for idx, pn in enumerate(prod_names):
                sku_val = sku_matches[idx] if idx < len(sku_matches) else f"PREM-{p}-{idx+1}"
                add_product(
                    name=f"Perfume Estilo {pn} - UNICA Premium",
                    category_slug=cat,
                    price=pr,
                    promo_price=promo,
                    description=f"Edición Premium de alta concentración y persistencia. Notas refinadas inspiradas en las mejores creaciones de la perfumería internacional.",
                    sku=sku_val,
                    page_num=p
                )
        else:
            add_product(
                name=f"Perfume UNICA Edición Especial - Página {p}",
                category_slug=cat,
                price=pr,
                promo_price=promo,
                description="Fragancia fina de edición limitada perteneciente a la colección UNICA Premium.",
                sku=sku_matches[0] if sku_matches else f"PREM-{p}",
                page_num=p
            )
    elif 45 <= p <= 49:
        sku_matches = re.findall(r'(?:Código|Codigo)[:\s]+([A-Z0-9]+)', text)
        names = []
        for i, l in enumerate(lines):
            if any(w in l.lower() for w in ["estilo", "bade'e", "khamrah", "yara", "asad", "noble"]):
                names.append(l.strip())
        
        pr = found_prices[0] if found_prices else 49999
        promo = found_prices[1] if len(found_prices) > 1 and found_prices[1] < pr else 39999
        
        if names:
            for idx, nm in enumerate(names[:2]):
                sku_val = sku_matches[idx] if idx < len(sku_matches) else f"ARAB-{p}-{idx+1}"
                clean_n = re.sub(r'^(?:Estilo\s+|Por\s+)', '', nm, flags=re.I)
                add_product(
                    name=f"Perfume Árabe Estilo {clean_n} - UNICA Árabe Premium",
                    category_slug="perfumes-arabes-premium",
                    price=pr,
                    promo_price=promo,
                    description="Fragancia oriental de estela magnética, especias exóticas, maderas nobles y vainilla ahumada. Frasco de lujo 100 ml.",
                    sku=sku_val,
                    page_num=p
                )
        else:
            add_product(
                name=f"Perfume Árabe UNICA Premium - Página {p}",
                category_slug="perfumes-arabes-premium",
                price=pr,
                promo_price=promo,
                description="Fragancia oriental exclusiva elaborada con esencias de Medio Oriente.",
                sku=sku_matches[0] if sku_matches else f"ARAB-{p}",
                page_num=p
            )
    elif 50 <= p <= 56:
        sku_matches = re.findall(r'(?:Código|Codigo)[:\s]+([A-Z0-9]+)', text)
        pr = found_prices[0] if found_prices else 6999
        promo = found_prices[1] if len(found_prices) > 1 and found_prices[1] < pr else None
        
        if any(w in text.lower() for w in ["esmalte", "manos", "uñas"]):
            colors = ["Blanco French", "Vía Láctea", "Rosa Vintage", "Rojo Pasión", "Bordeaux", "Nude Chic", "Brillo Secado Rápido"]
            for idx, col in enumerate(colors[:max(1, len(sku_matches))]):
                sku_val = sku_matches[idx] if idx < len(sku_matches) else f"ESM-{p}-{idx+1}"
                add_product(
                    name=f"Esmalte de Uñas Estilo UNICA - {col}",
                    category_slug="cosmetica-unas",
                    price=4999,
                    promo_price=promo,
                    description="Esmalte de uñas con alto poder cubritivo y secado rápido. Acabado brillante de larga duración formulado para el cuidado de tus uñas.",
                    sku=sku_val,
                    page_num=p
                )
        elif any(w in text.lower() for w in ["labios", "labial"]):
            add_product(
                name=f"Labial Estilo UNICA Línea Gloss & Mate",
                category_slug="cosmetica-unas",
                price=8999,
                promo_price=6999,
                description="Labial de alta pigmentación con textura sedosa e hidratación enriquecida. Look duradero e impactante.",
                sku=sku_matches[0] if sku_matches else f"LAB-{p}",
                page_num=p
            )
        else:
            add_product(
                name=f"Línea Cosmética UNICA Candy - Página {p}",
                category_slug="cosmetica-unas",
                price=pr if pr < 15000 else 7999,
                promo_price=promo,
                description="Un toque de dulzura y estilo. Expresa tu personalidad con notas irresistibles y auténticas.",
                sku=sku_matches[0] if sku_matches else f"COSM-{p}",
                page_num=p
            )
    elif 57 <= p <= 73:
        sku_matches = re.findall(r'(?:Código|Codigo)[:\s]+([A-Z0-9]+)', text)
        pr = found_prices[0] if found_prices else 14999
        promo = found_prices[1] if len(found_prices) > 1 and found_prices[1] < pr else 11999
        
        if "auto" in text.lower():
            add_product(
                name="Difusor para Auto UNICA & Repuesto 100ml",
                category_slug="difusores-hogar",
                price=8999,
                promo_price=6999,
                description="Set difusor aromático para rejilla de auto con repuesto de 100 ml. Mantén tu vehículo perfumado con aromas exclusivos.",
                sku=sku_matches[0] if sku_matches else f"AUTO-{p}",
                page_num=p
            )
        elif any(w in text.lower() for w in ["telas", "ambiente"]):
            aroma_match = re.search(r'(?:Telas|Ambientes|Aromatizador)\s+([A-Za-zÁÉÍÓÚáéíóú\s]{4,20})', text)
            aroma = aroma_match.group(1).strip() if aroma_match else "Sensaciones"
            add_product(
                name=f"Aromatizador de Ambientes y Telas {aroma} 500ml",
                category_slug="difusores-hogar",
                price=11999,
                promo_price=8999,
                description="Perfumina textil y ambiental con gatillo rociador. No mancha las prendas y aromatiza tus espacios por horas.",
                sku=sku_matches[0] if sku_matches else f"AROM-{p}",
                page_num=p
            )
        else:
            aroma_name = "Esencial UNICA"
            for l in lines:
                if any(w in l.lower() for w in ['frutos', 'vainilla', 'maderas', 'lavanda', 'jazmín', 'coco', 'marino', 'verbena', 'azahar', 'té verde']):
                    aroma_name = l.strip()
                    break
            add_product(
                name=f"Difusor Esencial con Varillas {aroma_name} 200ml",
                category_slug="difusores-hogar",
                price=pr if 8000 <= pr <= 25000 else 14999,
                promo_price=promo if promo and promo < pr else 11999,
                description="Difusor ambiental de aroma continuo con varillas de ratán de alta absorción. Duración aproximada: 45 a 60 días.",
                sku=sku_matches[0] if sku_matches else f"DIF-{p}",
                page_num=p
            )
    elif 74 <= p <= 79:
        sku_matches = re.findall(r'(?:Código|Codigo)[:\s]+([A-Z0-9]+)', text)
        pr = found_prices[0] if found_prices else 16999
        promo = found_prices[1] if len(found_prices) > 1 and found_prices[1] < pr else 14999
        
        oleo_names = []
        for l in lines:
            if any(w in l.lower() for w in ["óleo", "oleo", "guducci", "31 hierbas"]):
                oleo_names.append(l.strip())
        
        if oleo_names:
            for idx, on in enumerate(oleo_names[:2]):
                sku_val = sku_matches[idx] if idx < len(sku_matches) else f"SUM-{p}-{idx+1}"
                add_product(
                    name=f"{on} - Sumeria Aromaterapia",
                    category_slug="oleos-esenciales-sumeria",
                    price=pr,
                    promo_price=promo,
                    description="Óleo esencial 100% puro para bienestar físico y emocional. Aplicar en sienes, muñecas, nuca o difusor ultrasónico.",
                    sku=sku_val,
                    page_num=p
                )
        else:
            add_product(
                name=f"Óleo Esencial Sumeria Bienestar Natural - Página {p}",
                category_slug="oleos-esenciales-sumeria",
                price=pr,
                promo_price=promo,
                description="Terapia aromática natural para armonizar tus energías y relajar la mente.",
                sku=sku_matches[0] if sku_matches else f"SUM-{p}",
                page_num=p
            )
    elif 80 <= p <= 83:
        sku_matches = re.findall(r'(?:Código|Codigo)[:\s]+([A-Z0-9]+)', text)
        pr = found_prices[0] if found_prices else 18999
        promo = found_prices[1] if len(found_prices) > 1 and found_prices[1] < pr else 16999
        
        if any(w in text.lower() for w in ["cuasia", "pediculosis", "piojos"]):
            add_product(
                name="Solución Capilar Cuasia Amarga Anti-Pediculosis - Sumeria 125ml",
                category_slug="cuidado-capilar-facial",
                price=pr,
                promo_price=promo,
                description="Fórmula súper exclusiva a base de extracto natural de Cuasia Amarga. Eficacia comprobada para eliminar piojos y liendres de manera segura y natural.",
                sku=sku_matches[0] if sku_matches else "SU036",
                page_num=p
            )
        else:
            add_product(
                name=f"Tratamiento Capilar y Corporal Sumeria - Página {p}",
                category_slug="cuidado-capilar-facial",
                price=pr,
                promo_price=promo,
                description="Nutrición profunda para cuero cabelludo y cabello, restaurando brillo y elasticidad.",
                sku=sku_matches[0] if sku_matches else f"CAP-{p}",
                page_num=p
            )
    elif 84 <= p <= 86:
        sku_matches = re.findall(r'(?:Código|Codigo)[:\s]+([A-Z0-9]+)', text)
        if p == 86:
            add_product(
                name="Perfume Estilo La Vida es Bella L'Elixir - UNICA Premium 90ml",
                category_slug="perfumes-premium",
                price=69999,
                promo_price=49999,
                description="Gran lanzamiento de contratapa. Fragancia Chipre Floral de magnetismo irresistible. Incluye neceser de regalo. Contenido: 90 ml.",
                sku="FVBLE",
                page_num=p
            )
        else:
            pr = found_prices[0] if found_prices else 22999
            promo = found_prices[1] if len(found_prices) > 1 and found_prices[1] < pr else 18999
            add_product(
                name="Tratamiento Facial Skincare Sumeria - Rejuvenecedor",
                category_slug="cuidado-capilar-facial",
                price=pr,
                promo_price=promo,
                description="Limpiar, hidratar y cuidar la piel de tu rostro todos los días. Fórmula antioxidante con activos rejuvenecedores.",
                sku=sku_matches[0] if sku_matches else f"SKIN-{p}",
                page_num=p
            )

print(f"Total products extracted: {len(products)}")

categories = [
    {"name": "Fragancias Femeninas", "slug": "fragancias-femeninas"},
    {"name": "Fragancias Masculinas", "slug": "fragancias-masculinas"},
    {"name": "Perfumes Árabes Premium", "slug": "perfumes-arabes-premium"},
    {"name": "Perfumes Premium", "slug": "perfumes-premium"},
    {"name": "Difusores & Hogar", "slug": "difusores-hogar"},
    {"name": "Cosmética & Uñas", "slug": "cosmetica-unas"},
    {"name": "Óleos Esenciales & Sumeria", "slug": "oleos-esenciales-sumeria"},
    {"name": "Cuidado Capilar & Facial", "slug": "cuidado-capilar-facial"}
]

catalog_data = {
    "edition": "Edición Nº 50 - UNICA Perfumería",
    "categories": categories,
    "products": products
}

os.makedirs('backend/src/db', exist_ok=True)
os.makedirs('frontend/public', exist_ok=True)

with open('backend/src/db/catalog_unica_50.json', 'w', encoding='utf-8') as f:
    json.dump(catalog_data, f, ensure_ascii=False, indent=2)

with open('frontend/public/catalog_unica_50.json', 'w', encoding='utf-8') as f:
    json.dump(catalog_data, f, ensure_ascii=False, indent=2)

print("Saved catalog_unica_50.json to backend and frontend successfully!")
