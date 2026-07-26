FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Imagen de producción
FROM node:22-alpine AS runner

WORKDIR /app

# Copiar los archivos construidos de Nitro y Vite
COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", ".output/server/index.mjs"]