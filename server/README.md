# Servidor de reconhecimento (proxy)

A app envia a foto (reduzida) a este Worker, que chama a API da Anthropic com a **tua** chave e devolve
`{ isCar, brand, model, yearFrom, yearTo, confidence }`. A chave nunca está na app.

## Publicar (≈10 minutos, plano gratuito da Cloudflare)

1. Cria uma chave em https://console.anthropic.com e **define um limite mensal de gastos** na consola.
2. Na pasta `server/`:
   ```bash
   npx wrangler login
   npx wrangler secret put ANTHROPIC_API_KEY   # cola a chave
   npx wrangler secret put APP_TOKEN           # inventa um segredo longo (ex.: openssl rand -hex 24)
   npx wrangler deploy                         # devolve o URL https://parklog-recognize.<conta>.workers.dev
   ```
3. Na raiz do projeto cria o `.env` (copia o `.env.example`) com esse URL e o mesmo `APP_TOKEN`:
   ```
   EXPO_PUBLIC_RECOGNITION_URL=https://parklog-recognize.<conta>.workers.dev
   EXPO_PUBLIC_RECOGNITION_TOKEN=<o mesmo APP_TOKEN>
   ```
   e reinicia com `npx expo start --dev-client -c` (as variáveis só são lidas no arranque).
4. Na app: **Perfil → Reconhecimento automático** (vem desligado).

## Teste rápido
```bash
curl -s "$URL" -H "x-parklog-key: $APP_TOKEN" -H "content-type: application/json" \
  -d "{\"image\":\"$(base64 -i foto.jpg)\",\"mediaType\":\"image/jpeg\"}"
```

## Notas
- O token na app **não é um segredo forte** (vai dentro do bundle): serve para afastar abusos casuais. O que
  protege a conta é o limite de gastos e, mais tarde, a verificação App Attest.
- O Worker não regista nem guarda imagens. A foto vai para a API da Anthropic (consulta os termos de utilização).
- Pensado para ser trocado: `src/services/recognition.js` é o único sítio que a app usa. Um modelo Core ML
  no telemóvel pode substituir o proxy sem tocar nos ecrãs.
