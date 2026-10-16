from django.shortcuts import render

PRODUCTOS = [
    {'nombre': 'Spaghetti boloñesa', 'categoria': 'Pastas', 'precio': 165},
    {'nombre': 'Fettuccine Alfredo', 'categoria': 'Pastas', 'precio': 170},
    {'nombre': 'Penne arrabbiata', 'categoria': 'Pastas', 'precio': 155},
    {'nombre': 'Lasaña de carne', 'categoria': 'Pastas', 'precio': 185},
    {'nombre': 'Ravioles de espinaca', 'categoria': 'Pastas', 'precio': 175},
    {'nombre': 'Bruschetta', 'categoria': 'Entradas', 'precio': 85},
    {'nombre': 'Pan de ajo', 'categoria': 'Entradas', 'precio': 60},
    {'nombre': 'Ensalada caprese', 'categoria': 'Entradas', 'precio': 110},
    {'nombre': 'Sopa minestrone', 'categoria': 'Entradas', 'precio': 80},
    {'nombre': 'Carpaccio de res', 'categoria': 'Entradas', 'precio': 140},
    {'nombre': 'Tiramisú', 'categoria': 'Postres y bebidas', 'precio': 85},
    {'nombre': 'Panna cotta', 'categoria': 'Postres y bebidas', 'precio': 75},
    {'nombre': 'Cannoli', 'categoria': 'Postres y bebidas', 'precio': 70},
    {'nombre': 'Soda italiana', 'categoria': 'Postres y bebidas', 'precio': 50},
    {'nombre': 'Espresso', 'categoria': 'Postres y bebidas', 'precio': 40},
]


def catalogo(request):
    return render(request, 'catalogo/catalogo.html', {'productos': PRODUCTOS})
