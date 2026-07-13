from PIL import Image
import os

def remover_fundo(imagem_path, output_path, cor_fundo=None, tolerancia=30):
    """
    Remove o fundo de uma imagem e salva com transparência
    
    Args:
        imagem_path: Caminho da imagem original
        output_path: Caminho para salvar a nova imagem
        cor_fundo: Tupla (R, G, B) da cor de fundo. Se None, usa o pixel do canto superior esquerdo
        tolerancia: Tolerância para considerar pixels como fundo (0-255)
    """
    # Abrir a imagem
    img = Image.open(imagem_path)
    
    # Converter para RGBA se não estiver
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Se não especificou a cor de fundo, pega do canto superior esquerdo
    if cor_fundo is None:
        cor_fundo = img.getpixel((0, 0))
    
    print(f"Cor de fundo detectada: RGB{cor_fundo}")
    print(f"Tamanho da imagem: {img.size}")
    
    # Obter dados dos pixels
    dados = img.getdata()
    
    # Criar nova lista de pixels
    novos_dados = []
    for item in dados:
        # Calcular distância da cor de fundo
        r, g, b = item[:3]
        fr, fg, fb = cor_fundo[:3]
        
        distancia = ((r - fr) ** 2 + (g - fg) ** 2 + (b - fb) ** 2) ** 0.5
        
        # Se estiver dentro da tolerância, torna transparente
        if distancia <= tolerancia:
            novos_dados.append((r, g, b, 0))
        else:
            novos_dados.append(item)
    
    # Aplicar novos pixels
    img.putdata(novos_dados)
    
    # Salvar a imagem
    img.save(output_path, 'PNG')
    print(f"Imagem salva em: {output_path}")
    print(f"Pixels transparentes: {sum(1 for item in novos_dados if item[3] == 0)}/{len(novos_dados)}")

# Processar as imagens de logo
print("=" * 60)
print("Removendo fundo das imagens de logo")
print("=" * 60)

# Lista de imagens para processar
imagens = [
    "logo_da_marca.jpg",
    "src/assets/imagens_inicio/logo_da_marca.jpg",
    "src/assets/imagens_inicio/logo_da_marca.png"
]

for img_path in imagens:
    if os.path.exists(img_path):
        print(f"\nProcessando: {img_path}")
        
        # Criar nome de output
        nome_base = os.path.splitext(img_path)[0]
        output_path = f"{nome_base}_sem_fundo.png"
        
        try:
            remover_fundo(img_path, output_path, tolerancia=40)
        except Exception as e:
            print(f"Erro ao processar {img_path}: {e}")
    else:
        print(f"\nArquivo não encontrado: {img_path}")

print("\n" + "=" * 60)
print("Processo concluído!")
print("=" * 60)