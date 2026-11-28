# -*- coding: utf-8 -*-
"""
Script de generación del catálogo oficial auditado UNICA 50
Relevamiento exhaustivo página a página de UNICA50.pdf
Eliminación de falsos positivos y fijación de precios exactos de lista y promocionales.
"""
import json
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[áàäâ]', 'a', text)
    text = re.sub(r'[éèëê]', 'e', text)
    text = re.sub(r'[íìïî]', 'i', text)
    text = re.sub(r'[óòöô]', 'o', text)
    text = re.sub(r'[úùüû]', 'u', text)
    text = re.sub(r'[ñ]', 'n', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

categories = [
    {"name": "Perfumes Premium", "slug": "perfumes-premium"},
    {"name": "Perfumes Árabes Premium", "slug": "perfumes-arabes-premium"},
    {"name": "Fragancias Femeninas", "slug": "fragancias-femeninas"},
    {"name": "Fragancias Masculinas", "slug": "fragancias-masculinas"},
    {"name": "Extrait de Parfum", "slug": "extrait-de-parfum"},
    {"name": "Difusores, Hogar & Auto", "slug": "ambiente-y-hogar"},
    {"name": "Cosmética & Uñas", "slug": "cosmetica-y-unas"},
    {"name": "Sumeria Bienestar", "slug": "sumeria-aromaterapia"}
]

products = []

def add_prod(name, sku, cat, price, promo_price, page, desc, stock=45):
    slug = slugify(name)
    products.append({
        "name": name,
        "slug": slug,
        "sku": sku,
        "category_slug": cat,
        "price": float(price),
        "promotional_price": float(promo_price) if promo_price else None,
        "description": desc,
        "imageUrl": f"/catalog/page_{page}.jpg",
        "stock": stock
    })

# ==========================================
# 1. LANZAMIENTOS CON REGALO (Páginas 2, 3, 86)
# ==========================================
add_prod(
    name="Perfume Estilo Born in Roma Uomo Valentino 90ml - UNICA Premium",
    sku="MBRUPP",
    cat="perfumes-premium",
    price=66999,
    promo_price=46999,
    page=2,
    desc="¡Lanzamiento Edición Nº 50! Incluye Neceser UNICA de regalo + Perfumero recargable de 10ml. Fragancia Fougére Amaderada. Notas de salida: especiadas, bergamota y mandarina. Notas de corazón: lavanda silvestre. Notas de fondo: amaderadas y vetiver."
)

add_prod(
    name="Perfume Estilo Torino 24 Árabe 120ml - UNICA Árabe Premium",
    sku="UTO24",
    cat="perfumes-arabes-premium",
    price=74999,
    promo_price=54999,
    page=3,
    desc="¡Lanzamiento Edición Nº 50! Incluye Neceser UNICA de regalo + Perfumero recargable de 10ml. Fragancia Frutal Floral. Notas de salida: mango, bergamota, ciruela y mandarina. Notas de corazón: flor de azahar, flor de loto rosa y styrax. Notas de fondo: almizcle blanco, musgo y pachulí."
)

add_prod(
    name="Perfume Estilo La Vida es Bella L'Elixir 90ml - UNICA Premium",
    sku="FVBLE",
    cat="perfumes-premium",
    price=69999,
    promo_price=49999,
    page=86,
    desc="¡Lanzamiento Especial Fiestas! Incluye Neceser UNICA de regalo + Perfumero recargable de 10ml. Floral Frutal Gourmand. Notas de frambuesa, licor y bergamota de Calabria, flor de violeta y rosa, cuero, manteca de cacao y cedro."
)

# ==========================================
# 2. FRAGANTES FEMENINOS EN PROMO (Páginas 4 y 5)
# P. Lista $19.999 | P. Promo $16.999 (50ml)
# ==========================================
femeninos_promo = [
    ("Perfume Estilo 212 Vip Rose Red 50ml", "F2VRR", 4, "Floral - Frutal"),
    ("Perfume Estilo Angel 50ml", "FANGE", 4, "Oriental - Vainilla"),
    ("Perfume Estilo Black Opium 50ml", "FBLOP", 4, "Oriental - Vainilla"),
    ("Perfume Estilo Fame 50ml", "FFAME", 4, "Almizcle - Floral - Amaderado"),
    ("Perfume Estilo J'Adore Parfum Clásico 50ml", "FJACL", 4, "Floral - Frutal"),
    ("Perfume Estilo J'Adore Parfum D'Eau 50ml", "FJADE", 4, "Floral"),
    ("Perfume Estilo Libre 50ml", "FLIBR", 4, "Ámbar - Fougere"),
    ("Perfume Estilo L'Interdit 50ml", "FLINT", 4, "Oriental - Floral - Frutal"),
    ("Perfume Estilo Love Rock By Skra 50ml", "FLRSH", 4, "Floral - Frutal"),
    ("Perfume Estilo Million Gold 50ml", "FMIGO", 4, "Almizcle - Floral - Amaderado"),
    ("Perfume Estilo Neroli Portofino 50ml", "FNEPO", 4, "Cítrico - Aromático"),
    ("Perfume Estilo Nina 50ml", "FNINA", 4, "Floral - Frutal"),
    ("Perfume Estilo The Only One 50ml", "FONON", 5, "Ámbar - Vainilla"),
    ("Perfume Estilo Ralph 50ml", "FRALP", 5, "Floral - Frutal"),
    ("Perfume Estilo Toy 2 50ml", "FTOY2", 5, "Almizcle - Floral - Amaderado"),
    ("Perfume Estilo Very Good Girl Glam 50ml", "FVGGG", 5, "Frutal - Floral")
]

for name, sku, page, family in femeninos_promo:
    add_prod(
        name=f"{name} - UNICA Femenino",
        sku=sku,
        cat="fragancias-femeninas",
        price=19999,
        promo_price=16999,
        page=page,
        desc=f"Fragante Femenino Eau de Parfum 50ml en promoción especial libro Nº 50. Familia olfativa: {family}."
    )

# ==========================================
# 3. FRAGANTES MASCULINOS EN PROMO (Páginas 6 y 7)
# P. Lista $19.999 | P. Promo $16.999 (50ml)
# ==========================================
masculinos_promo = [
    ("Perfume Estilo 212 Vip Black 50ml", "M212B", 6, "Aromático - Fougere"),
    ("Perfume Estilo Allure Homme 50ml", "MALHS", 6, "Amaderado - Especiado"),
    ("Perfume Estilo Bad Boy Le Parfum 50ml", "MBBLP", 6, "Cuero"),
    ("Perfume Estilo Invictus Aqua 50ml", "MINAQ", 6, "Amaderado - Acuático"),
    ("Perfume Estilo Invictus Intense 50ml", "MININ", 6, "Amaderado - Oriental"),
    ("Perfume Estilo Invictus Parfum 50ml", "MINPA", 6, "Aromática - Acuática"),
    ("Perfume Estilo K. Aventura 50ml", "MKAAV", 6, "Aromático"),
    ("Perfume Estilo L'eau D'issey Pour Homme 50ml", "MLEDI", 6, "Amaderado - Acuático"),
    ("Perfume Estilo Mess 50ml", "MMESS", 6, "Amaderado - Aromático"),
    ("Perfume Estilo One Million 50ml", "MONMI", 6, "Amaderado - Especiado - Oriental"),
    ("Perfume Estilo Power of Seducción A. B. 50ml", "MPOSE", 6, "Aromático - Verde"),
    ("Perfume Estilo Pure XS 50ml", "MPUXS", 6, "Aromático - Especiado - Almizclado"),
    ("Perfume Estilo Stronger With You Intensely 50ml", "MSWYI", 7, "Aromático - Fougere"),
    ("Perfume Estilo The Icon A. B. 50ml", "MTHIC", 7, "Ámbar - Especiado"),
    ("Perfume Estilo The Secret A. B. 50ml", "MTHSE", 7, "Oriental - Especiado"),
    ("Perfume Estilo Toy Boy 50ml", "MTOBO", 7, "Amaderado - Especiado"),
    ("Perfume Estilo Tommy Impact 50ml", "MTOIM", 7, "Especiado - Ambarado"),
    ("Perfume Estilo Tommy 50ml", "MTOMM", 7, "Cítrico - Aromático"),
    ("Perfume Estilo Tuscan Leather Tom Ford 50ml", "MTULE", 7, "Cuero")
]

for name, sku, page, family in masculinos_promo:
    add_prod(
        name=f"{name} - UNICA Masculino",
        sku=sku,
        cat="fragancias-masculinas",
        price=19999,
        promo_price=16999,
        page=page,
        desc=f"Fragante Masculino Eau de Parfum 50ml en promoción especial libro Nº 50. Familia olfativa: {family}."
    )

# ==========================================
# 4. LANZAMIENTO IDÔLE POWER (Páginas 8 y 9)
# Splash 125ml $8.999 | Pocket 15ml $8.999 | 50ml $19.999
# ==========================================
add_prod(
    name="Body Splash Estilo Idôle Power 125ml - UNICA",
    sku="FIDPOB",
    cat="fragancias-femeninas",
    price=8999,
    promo_price=None,
    page=8,
    desc="Body Splash 125ml Estilo Idôle Power. Aroma fresco, intenso y envolvente que combina feminidad y carácter."
)

add_prod(
    name="Perfume Pocket Estilo Idôle Power 15ml - UNICA",
    sku="FIDPO15",
    cat="fragancias-femeninas",
    price=8999,
    promo_price=None,
    page=8,
    desc="Eau de Parfum Femenino formato Pocket 15ml Estilo Idôle Power. Ideal para llevar siempre con vos."
)

add_prod(
    name="Perfume Estilo Idôle Power 50ml - UNICA",
    sku="FIDPO",
    cat="fragancias-femeninas",
    price=19999,
    promo_price=None,
    page=9,
    desc="Eau de Parfum Femenino 50ml Estilo Idôle Power. Floral Frutal con notas de manzana, rosa de mayo y sándalo."
)

# ==========================================
# 5. FRAGANTES FEMENINOS LÍNEA GENERAL (Páginas 10-13)
# 50ml: $19.999 | 15ml Pocket: $8.999 | Splash 125ml: $8.999
# ==========================================
femeninos_linea = [
    # Page 10
    ("212 Heroes for Her", "F212H", 10, "Floral - Frutal - Chipre", True, False),
    ("212 Vip Rose", "F212R", 10, "Floral - Frutal", True, True),
    ("212 Vip", "F212V", 10, "Oriental - Vainilla", True, False),
    ("Amor Amor", "FAMAM", 10, "Floral - Frutal", True, False),
    ("Angel Nova", "FANGN", 10, "Ámbar - Frutal", True, False),
    ("Ange ou Demon", "FANOD", 10, "Oriental - Frutal", True, False),
    ("Baccarat Rouge", "FBARO", 10, "Oriental - Floral", True, False),
    ("Chanel Nº 5", "FCHN5", 10, "Floral - Aldehídico", True, False),
    ("Dance Skra", "FDASH", 10, "Floral - Frutal - Gourmand", True, False),
    ("Divine", "FDIVI", 10, "Ámbar - Floral", True, False),
    ("Dylan Purple", "FDYPU", 10, "Floral - Frutal", True, False),
    ("Eden", "FEDEN", 10, "Floral", True, False),
    # Page 11
    ("Good Girl", "FGOGI", 11, "Floral - Oriental", True, False),
    ("Good Girl Supreme", "FGOGS", 11, "Ámbar - Floral", True, False),
    ("Halloween", "FHALL", 11, "Floral - Frutal", True, False),
    ("Humor", "FHUMO", 11, "Floral - Frutal", True, False),
    ("Hypnotic Poison", "FHYPO", 11, "Oriental - Vainilla", True, False),
    ("Jimmy Choo", "FJICH", 11, "Chipre - Frutal - Madera", True, False),
    # Page 12
    ("Kenzo Amour", "FKEAM", 12, "Oriental - Vainilla", True, False),
    ("Kenzo Flower", "FKEFL", 12, "Especiado - Floral - Apolvado", True, False),
    ("K. Flower by K. Poppy", "FKFKP", 12, "Frutal - Floral", True, False),
    ("La Bomba", "FLABO", 12, "Oriental - Floral", True, False),
    ("Light Blue", "FLIBL", 12, "Floral - Frutal", True, False),
    ("La Vida es Bella", "FLVEB", 12, "Floral - Frutal - Gourmand", True, True),
    ("My Way", "FMYWA", 12, "Floral", True, True),
    ("Nina Luna", "FNILU", 12, "Oriental - Vainilla", True, True),
    ("Olympea Floral", "FOLFL", 12, "Floral", True, False),
    ("Olympea", "FOLYM", 12, "Floral - Oriental - Marina", True, False),
    ("Pure XS for Her", "FPUXS", 12, "Oriental - Floral", True, False),
    ("Ricci Ricci", "FRIRI", 12, "Chipre - Floral", True, False),
    # Page 13
    ("Scandal", "FSCAN", 13, "Chipre - Floral", True, False),
    ("The Icon para mujeres A. B.", "FTHIC", 13, "Ámbar - Acuática", True, False),
    ("Very Good Girl", "FVEGG", 13, "Floral - Oriental", True, False),
    ("Very Irresistible", "FVEIR", 13, "Floral - Frutal", True, False),
    ("Venus", "FVENU", 13, "Chipre - Floral", True, True),
    ("Yara Tous", "FYATO", 13, "Frutal - Floral", True, False)
]

for title, base_sku, page, family, has_15, has_125 in femeninos_linea:
    # 50ml
    add_prod(
        name=f"Perfume Estilo {title} 50ml - UNICA Femenino",
        sku=f"{base_sku}-50",
        cat="fragancias-femeninas",
        price=19999,
        promo_price=None,
        page=page,
        desc=f"Fragante Femenino Eau de Parfum 50ml. Familia olfativa: {family}."
    )
    # 15ml Pocket
    if has_15:
        add_prod(
            name=f"Perfume Pocket Estilo {title} 15ml - UNICA",
            sku=f"{base_sku}-15",
            cat="fragancias-femeninas",
            price=8999,
            promo_price=None,
            page=page,
            desc=f"Eau de Parfum Femenino 15ml formato cartera / bolsillo. Familia olfativa: {family}."
        )
    # 125ml Splash
    if has_125:
        add_prod(
            name=f"Body Splash Estilo {title} 125ml - UNICA",
            sku=f"{base_sku}-125",
            cat="fragancias-femeninas",
            price=8999,
            promo_price=None,
            page=page,
            desc=f"Body Splash refrescante 125ml para todo el cuerpo. Familia olfativa: {family}."
        )

# ==========================================
# 6. LANZAMIENTO 212 MEN PARFUM (Páginas 14 y 15)
# ==========================================
add_prod(
    name="Body Splash Estilo 212 Men Parfum 125ml - UNICA",
    sku="M212PB",
    cat="fragancias-masculinas",
    price=8999,
    promo_price=None,
    page=14,
    desc="Body Splash Masculino 125ml Estilo 212 Men Parfum. Notas aromáticas y especiadas para uso diario."
)

add_prod(
    name="Perfume Pocket Estilo 212 Men Parfum 15ml - UNICA",
    sku="M212P15",
    cat="fragancias-masculinas",
    price=8999,
    promo_price=None,
    page=14,
    desc="Eau de Parfum Masculino Pocket 15ml Estilo 212 Men Parfum. Compacto, potente y elegante."
)

add_prod(
    name="Perfume Estilo 212 Men Parfum 50ml - UNICA",
    sku="M212P",
    cat="fragancias-masculinas",
    price=19999,
    promo_price=None,
    page=15,
    desc="Eau de Parfum Masculino 50ml Estilo 212 Men Parfum. Amaderada Especiada. Cardamomo, jengibre, lavanda, vainilla, notas amaderadas, cuero e incienso."
)

# ==========================================
# 7. FRAGANTES MASCULINOS LÍNEA GENERAL (Páginas 16 y 17)
# 50ml: $19.999 | 15ml: $8.999 | 125ml Splash: $8.999
# ==========================================
masculinos_linea = [
    # Page 16
    ("212 Men Heroes For Ever Young", "M212H", 16, "Fougere - Frutal - Amaderado", True, False),
    ("212 Men", "M212M", 16, "Almizcle - Aromático - Amaderado", True, False),
    ("212 Vip Men", "M212V", 16, "Oriental - Amaderado", True, False),
    ("9 PM", "M9PM", 16, "Oriental Vainilla", True, True),
    ("Aqua Di Gio Profondo", "MADGP", 16, "Aromático - Fougere", True, False),
    ("Aqua Di Gio", "MAQDG", 16, "Aromático - Acuático", True, False),
    ("Asad Bourbon", "MASBO", 16, "Oriental - Especiado", True, False),
    ("Bad Boy", "MBABO", 16, "Oriental - Especiado", True, False),
    ("Invictus", "MINVI", 16, "Amaderado - Marino - Aromático", True, False),
    ("Invictus Victory", "MINVV", 16, "Ámbar", True, False),
    ("Kayak", "MKAYA", 16, "Aromático - Acuático", True, False),
    ("Kenzo Pour Homme", "MKENZ", 16, "Aromático - Acuático", True, False),
    # Page 17
    ("Le Male Elixir", "MLEME", 17, "Oriental - Fougere", True, False),
    ("Phantom", "MPHAN", 17, "Amaderado - Especiado", True, False),
    ("Polo Blue", "MPOBL", 17, "Aromático - Fougere", True, False),
    ("Sauvage", "MSAUV", 17, "Aromático - Fougere", True, False),
    ("Scandal", "MSCAN", 17, "Chipre - Floral", True, False),
    ("CK One", "UCKON", 17, "Cítrico - Hesperídico - Amaderado", True, False),
    ("Millesime Imperial", "UMIIM", 17, "Almizcle - Amaderado", True, False)
]

for title, base_sku, page, family, has_15, has_125 in masculinos_linea:
    # 50ml
    add_prod(
        name=f"Perfume Estilo {title} 50ml - UNICA Masculino",
        sku=f"{base_sku}-50",
        cat="fragancias-masculinas",
        price=19999,
        promo_price=None,
        page=page,
        desc=f"Fragante Masculino Eau de Parfum 50ml. Familia olfativa: {family}."
    )
    # 15ml Pocket
    if has_15:
        add_prod(
            name=f"Perfume Pocket Estilo {title} 15ml - UNICA",
            sku=f"{base_sku}-15",
            cat="fragancias-masculinas",
            price=8999,
            promo_price=None,
            page=page,
            desc=f"Eau de Parfum Masculino 15ml formato cartera / bolsillo. Familia olfativa: {family}."
        )
    # 125ml Splash
    if has_125:
        add_prod(
            name=f"Body Splash Estilo {title} 125ml - UNICA",
            sku=f"{base_sku}-125",
            cat="fragancias-masculinas",
            price=8999,
            promo_price=None,
            page=page,
            desc=f"Body Splash masculino 125ml vigorizante para después de la ducha. Familia olfativa: {family}."
        )

# ==========================================
# 8. EXTRAIT DE PARFUM 10ML ROLL-ON (Páginas 18 y 19)
# $19.999 c/u
# ==========================================
extraits = [
    ("Perfume Roll-On Extrait de Parfum Erba Pura 10ml", "UERPUE", 19, "Aroma cítrico y frutal de altísima concentración sobre base oleosa."),
    ("Perfume Roll-On Extrait de Parfum Good Girl 10ml", "FGOGIE", 19, "Floral oriental intenso y concentrado en formato roll-on 10ml."),
    ("Perfume Roll-On Extrait de Parfum La Bomba 10ml", "FLABOE", 19, "Extracto de perfume ultra concentrado con notas florales y especiadas."),
    ("Perfume Roll-On Extrait de Parfum Olympea 10ml", "FOLYME", 19, "Extracto oleoso con estela duradera de vainilla salada y jazmín de agua.")
]

for name, sku, page, desc in extraits:
    add_prod(
        name=f"{name} - UNICA",
        sku=sku,
        cat="extrait-de-parfum",
        price=19999,
        promo_price=None,
        page=page,
        desc=f"{desc} Máxima fijación y duración prolongada en piel."
    )

# ==========================================
# 9. FRAGANTE PREMIUM 90ml / 100ml (Páginas 20 a 42)
# ==========================================
premiums = [
    ("Perfume Estilo Scandal 100ml", "FSCANP", 20, 39999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Million Gold 100ml", "FMIGOP", 20, 36999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Fame 100ml", "FFAMEP", 21, 35999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Pure XS for Her 100ml", "FPUXSP", 21, 34999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Baccarat Rouge 100ml", "UBAROP", 22, 44999, 32999, "UNICA Premium Unisex"),
    ("Perfume Estilo Black Opium 100ml", "FBLOPP", 22, 36999, 29999, "UNICA Premium Femenino"),
    ("Perfume Estilo La Bomba 100ml", "FLABOP", 23, 49999, 39999, "UNICA Premium Femenino"),
    ("Perfume Estilo Hypnotic Poison 100ml", "FHYPOP", 23, 36999, 29999, "UNICA Premium Femenino"),
    ("Perfume Estilo 212 Héroes For Her 100ml", "F212HP", 24, 49999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo 212 VIP Rosé 100ml", "F212RP", 24, 36999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Good Girl 100ml", "FGOGIP", 25, 44999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Very Good Girl Glam 100ml", "FVGGGP", 25, 44999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Donna Born in Roma 100ml", "FDBRVP", 26, 39999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Angel 100ml", "FANGEP", 27, 29999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Ange ou Démon 100ml", "FANODP", 28, 29999, 24999, "UNICA Premium Femenino"),
    ("Perfume Estilo Halloween 100ml", "FHALLP", 28, 34999, 29999, "UNICA Premium Femenino"),
    ("Perfume Estilo My Way 100ml", "FMYWAP", 29, 29999, 24999, "UNICA Premium Femenino"),
    ("Perfume Estilo Olympea 100ml", "FOLYMP", 29, 34999, 29999, "UNICA Premium Femenino"),
    ("Perfume Estilo La Vida es Bella 100ml", "FLVEBP", 30, 36999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo L'Interdit 100ml", "FLINTP", 30, 39999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Kenzo Flower by K. Poppy 100ml", "FKFKPP", 31, 29999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Kenzo Flower 100ml", "FKEFLP", 31, 29999, None, "UNICA Premium Femenino"),
    ("Perfume Estilo Tobacco Vanille 100ml", "MTAVAP", 32, 37999, None, "UNICA Premium Masculino / Unisex"),
    ("Perfume Estilo Tuscan Leather Tom Ford 100ml", "MTULEP", 32, 37999, None, "UNICA Premium Masculino / Unisex"),
    ("Perfume Estilo Oud Wood Tom Ford 100ml", "MOUWO", 32, 37999, None, "UNICA Premium Masculino / Unisex"),
    ("Perfume Estilo Stronger With You Intensely 100ml", "MSWYIP", 33, 35999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo Born in Roma Uomo 100ml", "MBREUP", 33, 36999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo Bad Boy 100ml", "MBABOP", 34, 46999, 39999, "UNICA Premium Masculino"),
    ("Perfume Estilo 212 Héroes 100ml", "M212HP", 35, 49999, 39999, "UNICA Premium Masculino"),
    ("Perfume Estilo 212 VIP Black 100ml", "M212BP", 35, 42999, 34999, "UNICA Premium Masculino"),
    ("Perfume Estilo Le Male Elixir 100ml", "MLEMEP", 36, 42999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo Scandal Pour Homme 100ml", "MSCANP", 36, 39999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo Polo Blue 100ml", "MPOBLP", 37, 32999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo Kenzo Pour Homme 100ml", "MKENZP", 37, 34999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo Invictus Victory 100ml", "MINVVP", 38, 41999, 34999, "UNICA Premium Masculino"),
    ("Perfume Estilo Millésime Impérial 100ml", "UMIIMP", 38, 49999, 42999, "UNICA Premium Masculino / Unisex"),
    ("Perfume Estilo Invictus Aqua 100ml", "MINAQP", 39, 36999, 29999, "UNICA Premium Masculino"),
    ("Perfume Estilo Invictus Intense 100ml", "MININP", 39, 36999, 29999, "UNICA Premium Masculino"),
    ("Perfume Estilo Invictus 100ml", "MINVIP", 40, 36999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo Invictus Parfum 100ml", "MINPAP", 40, 36999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo One Million 100ml", "MONMIP", 41, 36999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo Phantom 100ml", "MPHANP", 41, 39999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo Toy Boy 100ml", "MTOBOP", 42, 34999, None, "UNICA Premium Masculino"),
    ("Perfume Estilo Toy 2 100ml", "FTOY2P", 42, 34999, None, "UNICA Premium Femenino")
]

for name, sku, page, price, promo, line in premiums:
    add_prod(
        name=f"{name} - {line}",
        sku=sku,
        cat="perfumes-premium",
        price=price,
        promo_price=promo,
        page=page,
        desc=f"Fragancia Premium de alta graduación en frasco de lujo 100ml. {line}."
    )

# ==========================================
# 10. PERFUMES ÁRABES PREMIUM (Páginas 43 a 47)
# ==========================================
arabes = [
    ("Perfume Estilo Torino 21 120ml", "UTO21A", 43, 44999, None, "Cítrico, aromático y fresco de lujo oriental."),
    ("Perfume Estilo Erba Pura 100ml", "UERPUA", 43, 42999, None, "Canasta de frutas mediterráneas, ámbar y vainilla dulce."),
    ("Perfume Estilo Noble Blush 100ml", "FNOBLA", 44, 39999, None, "Notas empolvadas, flores aterciopeladas y sándalo blanco."),
    ("Perfume Estilo Bade'e Al Oud Oud for Glory 100ml", "MBOFGA", 45, 39999, None, "Oud misterioso, azafrán, lavanda y pachulí ahumado."),
    ("Perfume Estilo Bade'e Al Oud Honor & Glory 100ml", "UBOHGA", 45, 39999, None, "Piña caramelizada, crema brûlée, canela y benjuí."),
    ("Perfume Estilo Khamrah 100ml", "UKHAMA", 46, 44999, None, "Canela especiada, dátiles dulces, haba tonka y praliné."),
    ("Perfume Estilo Club de Nuit Intense 100ml", "MCDNIA", 46, 44999, None, "Grosella negra, manzana, abedul ahumado y ámbar gris."),
    ("Perfume Estilo Yara 100ml", "FYARAA", 47, 54999, None, "Orquídea dulce, mandarina jugosa, heliotropo y vainilla."),
    ("Perfume Estilo Asad 100ml", "MASADA", 47, 54999, None, "Pimienta negra, piña madura, tabaco, café y madera seca.")
]

for name, sku, page, price, promo, desc in arabes:
    add_prod(
        name=f"{name} - UNICA Árabe Premium",
        sku=sku,
        cat="perfumes-arabes-premium",
        price=price,
        promo_price=promo,
        page=page,
        desc=f"{desc} Colección Árabe Exclusiva UNICA."
    )

# ==========================================
# 11. ÁRABES EDICIÓN LIMITADA 20ML (Páginas 48 y 49)
# $14.999 c/u
# ==========================================
arabes_20ml = [
    ("Perfume Estilo Khamrah 20ml", "UKHAM20", 48),
    ("Perfume Estilo Asad 20ml", "MASAD20", 48),
    ("Perfume Estilo Bade'e Al Oud Honor & Glory 20ml", "UBOHG20", 48),
    ("Perfume Estilo Bade'e Al Oud Oud for Glory 20ml", "MBOFG20", 48),
    ("Perfume Estilo Noble Blush 20ml", "FNOBL20", 49),
    ("Perfume Estilo Yara 20ml", "FYARA20", 49),
    ("Perfume Estilo Erba Pura 20ml", "UERPU20", 49),
    ("Perfume Estilo Club de Nuit Intense 20ml", "MCDNI20", 49)
]

for name, sku, page in arabes_20ml:
    add_prod(
        name=f"{name} - UNICA Árabe Edición 20ml",
        sku=sku,
        cat="perfumes-arabes-premium",
        price=14999,
        promo_price=None,
        page=page,
        desc="Presentación especial 20ml de la colección de perfumería árabe UNICA."
    )

# ==========================================
# 12. LÍNEAS ESPECIALES (Páginas 50 y 51)
# ==========================================
add_prod(
    name="Perfume Candy Flow EDT 100ml - UNICA",
    sku="FCAFL",
    cat="perfumes-premium",
    price=27999,
    promo_price=None,
    page=50,
    desc="Fragancia vibrante, dulce y juvenil en frasco de 100ml. Notas florales y frutales chispeantes."
)

add_prod(
    name="Perfume UR EDP Masculino 50ml - UNICA",
    sku="UR001",
    cat="perfumes-premium",
    price=29999,
    promo_price=None,
    page=51,
    desc="Fragancia masculina distintiva con carácter moderno, seductor y sofisticado. Frasco 50ml."
)

# ==========================================
# 13. COSMÉTICA, MAQUILLAJE Y UÑAS (Páginas 52 a 55)
# ==========================================
add_prod("Gloss Labial Brillo Humectante Rojo 6ml - UNICA Make Up", "EUGRO", "cosmetica-y-unas", 9999, None, 52, "Gloss labial con brillo satinado y emolientes nutritivos para labios irresistibles.")
add_prod("Gloss Labial Brillo Humectante Rosa 6ml - UNICA Make Up", "EUGLR", "cosmetica-y-unas", 9999, None, 52, "Tono rosa luminoso y fresco con textura no pegajosa.")
add_prod("Gloss Labial Brillo Humectante Transparente 6ml - UNICA Make Up", "EUGLT", "cosmetica-y-unas", 9999, None, 52, "Brillo efecto espejo ultra hidratante apto para combinar con cualquier labial.")

add_prod("Máscara de Pestañas Máximo Volumen y Alargue - UNICA Make Up", "EUO006", "cosmetica-y-unas", 14999, None, 53, "Fórmula negra intensa de larga duración que define, alarga y da volumen pestaña a pestaña.")
add_prod("Delineador Líquido para Ojos Negro Profundo - UNICA Make Up", "EUO013", "cosmetica-y-unas", 14999, None, 53, "Punta de alta precisión para trazos definidos y duraderos sin correrse.")
add_prod("Base Líquida DD Cream Tono Medio Protección y Color - UNICA Make Up", "EURDD2", "cosmetica-y-unas", 9999, None, 53, "Base ligera perfeccionadora de piel con factor de protección e hidratación profunda.")

# Tratamientos uñas $6.999 c/u
add_prod("Tratamiento de Uñas Endurecedor con Calcio 10ml - UNICA Nails", "EUT007", "cosmetica-y-unas", 6999, None, 54, "Tratamiento fortificante con calcio para uñas frágiles y quebradizas.")
add_prod("Tratamiento de Uñas Base Fortalecedora 10ml - UNICA Nails", "EUT003", "cosmetica-y-unas", 6999, None, 54, "Base nutritiva que protege las uñas antes del esmaltado prolongando su duración.")
add_prod("Tratamiento de Uñas Vía Láctea 10ml - UNICA Nails", "EUT002", "cosmetica-y-unas", 6999, None, 54, "Tono lechoso traslúcido para manicura clásica y acabado natural pulcro.")
add_prod("Tratamiento de Uñas Aceite de Limón para Cutículas 10ml - UNICA Nails", "EUT005", "cosmetica-y-unas", 6999, None, 54, "Nutrición intensa con aceite esencial de limón para cutículas suaves e hidratadas.")

# Esmaltes de uñas $6.999 c/u
add_prod("Esmalte de Uñas Blanco French 10ml - UNICA Nails", "EUM013", "cosmetica-y-unas", 6999, None, 55, "Blanco puro ideal para línea de francesita o cobertura total elegante.")
add_prod("Esmalte de Uñas Gris Cremoso 10ml - UNICA Nails", "EUM017", "cosmetica-y-unas", 6999, None, 55, "Tono gris moderno y cremoso con brillo espejo de secado rápido.")
add_prod("Esmalte de Uñas Negro Intenso 10ml - UNICA Nails", "EUM016", "cosmetica-y-unas", 6999, None, 55, "Negro profundo brillante de alta cobertura en una sola pasada.")
add_prod("Esmalte de Uñas Pastel Cremoso 10ml - UNICA Nails", "EUT022", "cosmetica-y-unas", 6999, None, 55, "Tono pastel delicado y romántico para uso cotidiano.")
add_prod("Esmalte de Uñas Rosa Viejo 10ml - UNICA Nails", "EUM003", "cosmetica-y-unas", 6999, None, 55, "Rosa vintage sobrio y femenino para un look distinguido.")
add_prod("Esmalte de Uñas Rojo Pasión 10ml - UNICA Nails", "EUM001", "cosmetica-y-unas", 6999, None, 55, "Rojo vibrante clásico de alta pigmentación y duración.")

# ==========================================
# 14. LÍNEA BEBÉ, AMBIENTE, DIFUSORES Y AUTOS (Páginas 56 a 73)
# ==========================================
add_prod("Colonia Bebé Nubicita 110ml - UNICA Bebé", "NU001", "ambiente-y-hogar", 10999, None, 56, "Colonia hipoalergénica con delicadas notas suaves para el cuidado diario de tu bebé.")
add_prod("Aromatizador Bebé Nubicita Repuesto 300ml - UNICA Bebé", "NU002R", "ambiente-y-hogar", 10999, None, 56, "Repuesto económico 300ml para perfumar la ropita y la habitación de los más pequeños.")

# Repuestos 500ml $13.999 c/u
repuestos_500ml = [
    ("Aromatizador Ambiente Pistacho Dubai Repuesto 500ml", "AU043R", 57, "Gourmand dulce con pistacho tostado, crema y vainilla."),
    ("Aromatizador Ambiente Frutas Tropicales Repuesto 500ml", "AU001R", 57, "Cocktail energizante de mango, maracuyá y papaya."),
    ("Aromatizador Ambiente Dulzura Gourmet Repuesto 500ml", "AU008R", 57, "Notas cálidas de caramelo, coco y azúcar moreno."),
    ("Aromatizador Ambiente Vainilla Árabe Repuesto 500ml", "AU042R", 58, "Vainilla exótica con toques especiados y ambarados."),
    ("Aromatizador Ambiente Granada Pomelo Repuesto 500ml", "AU014R", 58, "Explosión cítrica y frutal revitalizante."),
    ("Aromatizador Ambiente Jardines de Azahar Repuesto 500ml", "AU005R", 58, "Flores blancas de azahar primaverales y frescas."),
    ("Aromatizador Ambiente Suavidad y Frescura Repuesto 500ml", "AU003R", 59, "Aroma a ropa limpia, algodón y brisa matinal."),
    ("Aromatizador Ambiente Flores de Lino Repuesto 500ml", "AU023R", 59, "Notas florales suaves y relajantes para el hogar."),
    ("Aromatizador Ambiente Mimitos de Bebé Repuesto 500ml", "AU002R", 59, "Tierno aroma atalcado y floral suave para cuartos infantiles."),
    ("Aromatizador Ambiente Amanecer Marino Repuesto 500ml", "AU004R", 60, "Frescura oceánica con toques de algas y brisa salada."),
    ("Aromatizador Ambiente Bubblegum Repuesto 500ml", "AU022R", 60, "Divertido aroma a chicle dulce y tutti-frutti."),
    ("Aromatizador Ambiente Jengibre y Verbena Repuesto 500ml", "AU010R", 60, "Toque chispeante y cítrico con raíz de jengibre estimulante."),
    ("Aromatizador Ambiente Maracuyá Hawaiano Repuesto 500ml", "AU018R", 61, "Aroma tropical jugoso y refrescante."),
    ("Aromatizador Ambiente Santal Repuesto 500ml", "AU029R", 61, "Maderas nobles de sándalo oriental para crear calidez."),
    ("Aromatizador Ambiente Frutos de Cuyo Repuesto 500ml", "AU026R", 61, "Frutos rojos autóctonos maduros y dulces."),
    ("Aromatizador Ambiente Maderas Dulces Repuesto 500ml", "AUB04R", 66, "Cálidas maderas especiadas con notas avainilladas."),
    ("Aromatizador Ambiente Pomelo Mediterráneo Repuesto 500ml", "AU027R", 69, "Aroma cítrico y floral alegre de pomelo mediterráneo maduro.")
]

for name, sku, page, desc in repuestos_500ml:
    add_prod(
        name=f"{name} - Ambiente UNICA",
        sku=sku,
        cat="ambiente-y-hogar",
        price=13999,
        promo_price=None,
        page=page,
        desc=f"{desc} Repuesto económico de 500ml para difusores y atomizadores."
    )

# Aromatizadores con gatillo 200ml $9.999 c/u
gatillos_200ml = [
    ("Aromatizador con Gatillo Bubblegum 200ml", "AU035", 62, "Chicle dulce"),
    ("Aromatizador con Gatillo Maderas Dulces 200ml", "AU038", 62, "Maderas acogedoras"),
    ("Aromatizador con Gatillo Violette Flor 200ml", "AU037", 62, "Flores de violeta silvestre"),
    ("Aromatizador con Gatillo La Maison 200ml", "AU036", 63, "Elegancia floral y amaderada francesa"),
    ("Aromatizador con Gatillo Mimitos de Bebé 200ml", "AU039", 63, "Ternura atalcada"),
    ("Aromatizador con Gatillo Suavidad y Frescura 200ml", "AU034", 63, "Frescura a limpio")
]

for name, sku, page, aroma in gatillos_200ml:
    add_prod(
        name=f"{name} - Ambiente UNICA",
        sku=sku,
        cat="ambiente-y-hogar",
        price=9999,
        promo_price=None,
        page=page,
        desc=f"Envase con gatillo vaporizador de 200ml para telas y ambientes. Aroma: {aroma}."
    )

# Difusores con varillas 200ml (P. Lista $14.999 | P. Promo $11.999)
difusores_varillas = [
    ("Difusor Esencial Jengibre y Verbena con Varillas 200ml", "AU032", 64, "Cítrico estimulante"),
    ("Difusor Esencial Santal con Varillas 200ml", "AU030", 64, "Sándalo amaderado y relajante"),
    ("Difusor Esencial Frutos de Cuyo con Varillas 200ml", "AU031", 65, "Frutos rojos cuyanos"),
    ("Difusor Esencial Limones de Amalfi con Varillas 200ml", "AU033", 65, "Limón mediterráneo fresco"),
    ("Difusor Esencial Pomelo Mediterráneo con Varillas 200ml", "AU041", 68, "Pomelo cítrico-floral radiante")
]

for name, sku, page, aroma in difusores_varillas:
    add_prod(
        name=f"{name} - Ambiente UNICA",
        sku=sku,
        cat="ambiente-y-hogar",
        price=14999,
        promo_price=11999,
        page=page,
        desc=f"Difusor de aromas de 200ml en botella de vidrio con juego de varillas de ratán difusoras. Aroma: {aroma}."
    )

# Difusores Vidrio 100ml y repuestos (Página 67)
add_prod("Difusor de Vidrio Maderas Dulces 100ml con 4 Varillas - UNICA", "AUB03", "ambiente-y-hogar", 16999, None, 67, "Difusor decorativo en frasco de vidrio de 100ml con 4 varillas difusoras. Aroma cálido de maderas dulces.")
add_prod("Difusor de Vidrio Peonía 100ml con 4 Varillas - UNICA", "AUB01", "ambiente-y-hogar", 16999, None, 67, "Difusor decorativo en frasco de vidrio de 100ml con 4 varillas difusoras. Aroma sofisticado a flores de peonía.")
add_prod("Repuesto Difusor Vidrio Maderas Dulces 100ml - UNICA", "AUB03R", "ambiente-y-hogar", 9999, None, 67, "Repuesto de recarga 100ml para difusor de vidrio Maderas Dulces.")
add_prod("Repuesto Difusor Vidrio Peonía 100ml - UNICA", "AUB01R", "ambiente-y-hogar", 9999, None, 67, "Repuesto de recarga 100ml para difusor de vidrio Peonía.")

# Aromatizadores de telas y ambientes 125ml $7.999 c/u (Páginas 70, 71, 73)
add_prod("Aromatizador de Ambientes y Telas Té Verde 125ml - UNICA", "AUT005", "ambiente-y-hogar", 7999, None, 70, "Spray para textiles y ambientes con infusión relajante de té verde.")
add_prod("Aromatizador de Ambientes y Telas Patio BLR 125ml - UNICA", "AUT004", "ambiente-y-hogar", 7999, None, 70, "Frescura floral de patio tradicional con notas verdes.")
add_prod("Aromatizador de Ambientes y Telas Citrus 125ml - UNICA", "AUT003", "ambiente-y-hogar", 7999, None, 70, "Aroma vigorizante a cítricos jugosos de alta persistencia.")
add_prod("Aromatizador de Ambientes y Telas Pitanga 125ml - UNICA", "AUT010", "ambiente-y-hogar", 7999, None, 71, "Cítrico frutal exótico con frutos rojos de pitanga.")
add_prod("Aromatizador de Ambientes y Telas Bebé 125ml - UNICA", "AUT008", "ambiente-y-hogar", 7999, None, 71, "Suave fragancia floral cítrica para cunas, ropas y cortinas.")
add_prod("Aromatizador de Ambientes y Telas Toy 2 125ml - UNICA", "AUT009", "ambiente-y-hogar", 7999, None, 71, "Floral frutal delicado y chispeante para almohadones y sábanas.")
add_prod("Aromatizador de Ambientes y Telas Océano 125ml - UNICA", "AUT002", "ambiente-y-hogar", 7999, None, 73, "Brisa marina y aire puro revitalizante para el hogar.")

# Línea Difusores para Autos
autos = [
    ("Maderas Dulces", "AUB06", "AUB06R", "AUB06P", 66),
    ("Pomelo Mediterráneo", "AU025", "AU025R", "AU025P", 69),
    ("Limones de Amalfi", "AU016", "AU016R", "AU016P", 72),
    ("Océano", "AUT006", "AUT006R", "AUT006P", 73)
]

for name, sku_set, sku_rep, sku_perf, page in autos:
    add_prod(
        name=f"Set Difusor para Auto {name} (Perfumero 10ml + Repuesto 100ml) - UNICA",
        sku=sku_set,
        cat="ambiente-y-hogar",
        price=15999,
        promo_price=None,
        page=page,
        desc=f"Set completo para vehículo: 1 Perfumero colgante de 10ml con madera difusora + 1 Repuesto de recarga 100ml ({name}). ¡Rinde hasta 10 cargas!"
    )
    add_prod(
        name=f"Repuesto Difusor Auto {name} 100ml - UNICA",
        sku=sku_rep,
        cat="ambiente-y-hogar",
        price=9999,
        promo_price=None,
        page=page,
        desc=f"Repuesto económico de 100ml para perfumero de auto. Aroma {name}. Rinde 10 cargas completas."
    )
    add_prod(
        name=f"Perfumero Colgante para Auto {name} 10ml - UNICA",
        sku=sku_perf,
        cat="ambiente-y-hogar",
        price=8999,
        promo_price=None,
        page=page,
        desc=f"Perfumero colgante de 10ml para el espejo retrovisor con tapa de madera difusora y cordón ajustable. Aroma: {name}."
    )

# ==========================================
# 15. SUMERIA BIENESTAR Y AROMATERAPIA (Páginas 74 a 85)
# ==========================================
# Página 74: Óleos puros
add_prod("Óleo Esencial Anti Estrés 10ml - Sumeria Bienestar", "SU009", "sumeria-aromaterapia", 14999, None, 74, "Blend de aceites esenciales puros diseñado para brindar calma, armonía y serenidad mental.")
add_prod("Óleo Esencial Guducci 10ml - Sumeria Bienestar", "SU008", "sumeria-aromaterapia", 14999, None, 74, "Energía y vitalidad natural. Estimula la concentración y combate la fatiga corporal y mental.")
add_prod("Óleo Esencial 31 Hierbas 10ml - Sumeria Bienestar", "SU004", "sumeria-aromaterapia", 17999, None, 74, "Elixir herbal tradicional suizo con 31 hierbas puras. Alivio para tensiones en cabeza, cuello y cuerpo.")

# Página 75: Óleos puros
add_prod("Óleo Esencial de Lavanda 10ml - Sumeria Bienestar", "SU030", "sumeria-aromaterapia", 11999, None, 75, "Relajación y protección natural. Inductor de descanso reparador y alivio cutáneo.")
add_prod("Óleo Esencial Armonía 10ml - Sumeria Bienestar", "SU033", "sumeria-aromaterapia", 13999, None, 75, "Equilibrio emocional y paz interior. Mezcla aromaterapéutica equilibrante.")
add_prod("Óleo Esencial de Limón 10ml - Sumeria Bienestar", "SU029", "sumeria-aromaterapia", 9999, None, 75, "Purificación, desinfección y estimulación anímica y sensorial.")
add_prod("Óleo Esencial de Tea Tree 10ml - Sumeria Bienestar", "SU023", "sumeria-aromaterapia", 13999, None, 75, "Poderoso antiséptico y regenerador natural para piel y uñas.")

# Página 76: Bienestar corporal en promo
add_prod("Loción Corporal Árnica y Hamamellis 125ml - Sumeria", "SU046", "sumeria-aromaterapia", 12999, 9999, 76, "Bálsamo refrescante corporal. Desinflamación y regeneración activa contra golpes y fatiga muscular.")
add_prod("Eucavita Volver a Respirar Profundamente 60ml - Sumeria", "SU016", "sumeria-aromaterapia", 14999, 11999, 76, "Spray balsámico con eucalipto, menta, mentol y alcanfor para despejar las vías respiratorias.")
add_prod("Crema Enebro Bienestar Corporal 90g - Sumeria", "SU002", "sumeria-aromaterapia", 17999, 14999, 76, "Crema enriquecida con árnica, romero y harpagofito. Alivio térmico y relajación para contracturas.")

# Página 77: Cuidado familiar en promo
add_prod("Desodorante para Pies Caléndula y Eucaliptus 125ml - Sumeria", "SU044", "sumeria-aromaterapia", 9999, 7999, 77, "Desodorante refrescante y antibacterial con caléndula y eucalipto para pies frescos todo el día.")
add_prod("Repelente de Insectos Blend Herbal 200ml - Sumeria", "SU045", "sumeria-aromaterapia", 12999, 9999, 77, "Protección natural eficaz contra mosquitos con citronela, lavanda, romero y eucalipto.")
add_prod("Bálsamo Post Solar Aloe Vera y Menta 125ml - Sumeria", "SU047", "sumeria-aromaterapia", 12999, 9999, 77, "Alivio y regeneración inmediata tras la exposición solar con alantoína, aloe vera y menta.")

# Página 78: Cuidado capilar vegano Manzana Verde
add_prod("Shampoo Manzana Verde Vegano Control Graso Repuesto 250g - Sumeria", "SU038SR", "sumeria-aromaterapia", 12999, 8999, 78, "Shampoo vegano sin sulfatos, siliconas ni parabenos. Con manzana verde, menta y limón para limpieza profunda.")
add_prod("Bálsamo Acondicionador Manzana Verde Vegano Repuesto 250g - Sumeria", "SU038BR", "sumeria-aromaterapia", 12999, 8999, 78, "Bálsamo acondicionador vegano nutritivo que aporta brillo y suavidad natural sin apelmazar.")

# Página 79: Cuidado capilar vegano Anti-Caída
add_prod("Bálsamo Acondicionador Anti-Caída Vegano Repuesto 250g - Sumeria", "SU025BR", "sumeria-aromaterapia", 12999, 9999, 79, "Acondicionador fortificante enriquecido con ortiga, jengibre, vitamina C y cafeína.")
add_prod("Serum Reparador de Puntas Aceite de Argán y Karité 30ml - Sumeria", "SU010", "sumeria-aromaterapia", 13999, 9999, 79, "Tratamiento intensivo para sellar puntas abiertas, eliminar el frizz y restaurar el brillo.")
add_prod("Shampoo Anti-Caída Vegano Repuesto 250g - Sumeria", "SU025SR", "sumeria-aromaterapia", 12999, 9999, 79, "Shampoo estimulante del crecimiento con ortiga y jengibre para frenar la caída y engrosar la fibra.")

# Página 80: Cuasia amarga
add_prod("Solución Capilar Cuasia Amarga Anti Piojos 10ml - Sumeria", "SU036", "sumeria-aromaterapia", 16999, None, 80, "Tratamiento natural anti pediculosis con cuasia amarga, tomillo y lavanda. Seguro, no irrita y elimina piojos y liendres.")

# Página 81: Nutrición corporal
add_prod("Crema de Ordeñe Nutritiva y Humectante 250g - Sumeria", "SU003", "sumeria-aromaterapia", 18999, None, 81, "Crema emoliente rica en vitaminas A y E para zonas resecas, talones, codos y grietas.")
add_prod("Exfoliante Corporal Carozo de Damasco 250g - Sumeria", "SU043", "sumeria-aromaterapia", 18999, None, 81, "Exfoliante suave con micropartículas de carozo de damasco para renovar y suavizar la textura de la piel.")

# Página 82: Nutrición Karité y Bronce
add_prod("Crema Corporal Bronce Reafirmante y Tonificante Repuesto 125g - Sumeria", "SU034", "sumeria-aromaterapia", 14999, None, 82, "Crema corporal iluminadora con castañas y vitamina A que potencia el tono bronceado.")
add_prod("Jabón Líquido Humectante Manteca de Karité Repuesto 280g - Sumeria", "SU012R", "sumeria-aromaterapia", 14999, None, 82, "Jabón cremoso emoliente con aceite de almendras y manteca de karité para manos y cuerpo.")
add_prod("Humectante Corporal Manteca de Karité Repuesto 280g - Sumeria", "SU007R", "sumeria-aromaterapia", 18999, None, 82, "Loción humectante sedosa con suavidad inmediata para pieles sensibles o secas.")

# Página 83: Manos, labios y almendras
add_prod("Humectante de Manos con Manteca de Karité 90g - Sumeria", "SU001", "sumeria-aromaterapia", 16999, None, 83, "Crema reparadora de manos de rápida absorción con aceite de almendras y vitamina A y E.")
add_prod("Bálsamo Labial con Manteca de Karité y Filtro Solar 4g - Sumeria", "SU021", "sumeria-aromaterapia", 7999, None, 83, "Bálsamo protector y nutritivo contra resequedad, frío y sol con filtro UV.")
add_prod("Óleo de Almendras Dulces Nutrición Profunda 10ml - Sumeria", "SU013", "sumeria-aromaterapia", 12999, None, 83, "Aceite 100% puro para nutrir cutis, zonas secas, estrías y puntas del cabello.")

# Página 84: Facial Granada y Damasco
add_prod("Crema Hidratante Facial Granada, Caléndula y Germen de Trigo 75g - Sumeria", "SU006", "sumeria-aromaterapia", 16999, None, 84, "Hidratación y regeneración celular diaria para un rostro luminoso y protegido.")
add_prod("Exfoliante Facial Damasco y Jojoba 100g - Sumeria", "SU039", "sumeria-aromaterapia", 15999, None, 84, "Limpieza facial profunda que remueve impurezas y células muertas dejando los poros limpios.")
add_prod("Óleo Esencial Puro de Rosa Mosqueta 10ml - Sumeria", "SU011", "sumeria-aromaterapia", 10999, None, 84, "Potente regenerador cutáneo, atenúa cicatrices, líneas de expresión y manchas.")
add_prod("Agua Micelar de Caléndula y Rosa Mosqueta 100ml - Sumeria", "SU035", "sumeria-aromaterapia", 12999, None, 84, "Sin alcohol ni parabenos. Limpia, desmaquilla, tonifica e hidrata la piel en un solo paso.")

# Página 85: Facial Seda y Limpieza
add_prod("Tratamiento Rejuvenecedor Efecto Seda 50g - Sumeria", "SU018", "sumeria-aromaterapia", 29999, None, 85, "Crema anti-age ultra lujosa con aceite de rosa mosqueta, germen de trigo y ácido hialurónico regenerador.")
add_prod("Leche de Limpieza Facial Granada y Caléndula 100ml - Sumeria", "SU005", "sumeria-aromaterapia", 12999, None, 85, "Emulsión suave desmaquillante y limpiadora que cuida la barrera protectora cutánea.")

data = {
    "categories": categories,
    "products": products
}

with open("backend/src/db/catalog_unica_50.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Catálogo generado con éxito: {len(categories)} categorías y {len(products)} productos auditados.")
