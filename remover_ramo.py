from PIL import Image, ImageDraw

# Abrir a imagem
img = Image.open('logo_da_marca_sem_fundo.png')
width, height = img.size

# Converter para RGBA para trabalhar com transparência
img = img.convert('RGBA')

# O ramo/galho está na parte superior da imagem
# Vamos identificar e remover a área do ramo
# O ramo está acima da flor, na região central superior

# Criar uma máscara para o ramo
# O ramo está aproximadamente na região: y de 0 a 30% da altura, x central
mask = Image.new('L', (width, height), 255)
draw = ImageDraw.Draw(mask)

# Definir a área do ramo para ser removida
# O ramo está na parte superior central
ramo_y_inicio = 0
ramo_y_fim = int(height * 0.35)
ramo_x_inicio = int(width * 0.35)
ramo_x_fim = int(width * 0.65)

# Desenhar uma área elíptica para cobrir o ramo
draw.ellipse([ramo_x_inicio, ramo_y_inicio, ramo_x_fim, ramo_y_fim], fill=0)

# Aplicar a máscara para remover o ramo
pixels = img.load()
mask_pixels = mask.load()

for y in range(height):
    for x in range(width):
        if mask_pixels[x, y] == 0:
            # Tornar o pixel transparente
            pixels[x, y] = (255, 255, 255, 0)

# Salvar a imagem sem o ramo
img.save('logo_sem_ramo.png')

print("Ramo removido com sucesso! Imagem salva como 'logo_sem_ramo.png'")
print(f"Dimensões da imagem: {width}x{height}")
