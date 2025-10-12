# Dockerfile para a API Spring Boot da Orbitamos
FROM openjdk:21-jdk-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia o arquivo pom.xml
COPY pom.xml .

# Instala o Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Baixa as dependências
RUN mvn dependency:go-offline -B

# Copia o código fonte
COPY src ./src

# Compila a aplicação
RUN mvn clean package -DskipTests

# Expõe a porta
EXPOSE 8080

# Comando para executar a aplicação
CMD ["java", "-jar", "target/api-0.0.1-SNAPSHOT.jar"]
