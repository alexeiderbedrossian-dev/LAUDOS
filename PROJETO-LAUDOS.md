# LAUDOS — contexto do projeto (Centro Médico Mercês)

Sistema interno de laudos de ultrassonografia. Não é público: só entra quem tem o endereço e o login.

## Clínica e médico

- Nome: Centro Médico Mercês
- Setor: setor de exames de imagem
- Endereço: Rua Jacarezinho, 258 — CEP 80710-150 — Bairro Mercês — Curitiba/PR
- Telefone: (41) 3029-2030
- Médico: Dr. Ralff Mallmann
- Radiologia · Ultrassonografia
- CRM-PR 25980
- Logo oficial no app (`public/logo-merces.png`)

## Acesso

- E-mail: alexeicuritiba@me.com
- Senha: Merces2026
- Usar **Entrar**, não “Criar acesso”
- Código no GitHub (privado): https://github.com/alexeiderbedrossian-dev/LAUDOS

## O que o sistema faz

Login da equipe → escolher o exame → ditar ou digitar medidas → o laudo se escreve no padrão do serviço → revisar → imprimir em A4 com cabeçalho da clínica e assinatura do Dr. Ralff Mallmann.

## Exames

Tireoide, região cervical, abdômen total, abdômen superior, abdômen e próstata, masculino (próstata e bolsa), feminino (pelve), ecocardiograma, partes moles, articulações, arterial MMII, arterial MMSS, venoso MMII, venoso MMSS, mapeamento venoso, Doppler de carótidas.

## Padrões de laudo já aplicados (texto do médico)

Seguir exatamente o modelo enviado pelo médico, não reescrever no estilo genérico.

1. **Tireoide** — Técnica (linear, Doppler colorido e power Doppler); Relatório (glândula tópica, parênquima, nódulos, Doppler com VPS das tireóideas inferiores, medidas com volume e VR, estruturas adjacentes); Impressão; nota SBEM/CBR/ACR TI-RADS.
2. **Cervical** — Técnica linear bidimensional; pele/subcutâneo; linfonodos; grandes vasos; impressão “dentro dos limites da normalidade”.
3. **Abdômen total** — Blocos FÍGADO, VESÍCULA, VIAS BILIARES, PÂNCREAS, RIM D/E, BAÇO, RETROPERITÔNEO, CAVIDADE PERITONEAL, BEXIGA; impressão “dentro dos padrões da normalidade”.
4. **Venoso MMII** — Título DUPLEX SCAN VENOSO DOS MEMBROS INFERIORES; MID e MIE com sistema profundo (femorais, poplítea, tibiais, fibulares, surais, gastrocnêmias) e superficial (safenas); telangiectasias à ectoscopia.
5. **Arterial MMII** — Título ECODOPPLER COLORIDO ARTERIAL DE MEMBROS INFERIORES; cada artéria pérvia, diâmetros preservados, fluxo laminar; impressão “sem alterações”.
6. **Abdômen total e próstata** — Fígado (inclui esteatose grau II quando marcada), vias, vesícula, pâncreas, baço, rins, retroperitônio, aorta/VCI, bexiga, óstios, próstata (medidas, volume cc, peso g), vesículas seminais, volumes pré/pós-miccional.

Quando o exame for normal, o texto impresso deve coincidir com o modelo. Achados (nódulo, TVP, estenose, esteatose) só alteram o bloco correspondente.

## Como continuar o aperfeiçoamento

- Novos padrões de laudo: aplicar no exame correspondente, como nos itens acima.
- Não mudar a identidade da clínica nem o login sem pedido explícito.
- Não tornar o sistema público.
- Manter ditado em português (medidas → campos → narrativa).
- Laudo para impressão A4, com logo, endereço e assinatura.

## Fora do padrão ainda (próximos, se o médico enviar o texto)

Abdômen superior, masculino (bolsa), feminino, eco, partes moles, articulações, arterial/venoso de MMSS, mapeamento venoso, carótidas.
