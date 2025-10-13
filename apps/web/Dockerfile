# Dockerfile para o Frontend Next.js da Orbitamos
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências (incluindo devDependencies para build)
RUN npm ci

# Copia o código fonte
COPY . .

# Gera o build da aplicação
RUN npm run build

# Expõe a porta
EXPOSE 3000

# Comando para executar a aplicação
CMD ["npm", "start"]
