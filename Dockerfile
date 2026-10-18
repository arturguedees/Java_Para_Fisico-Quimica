# ==============================================================================
# Stage 1: Compilando o codigo Java 21 com Maven (Multi-stage build!)
# ==============================================================================
# Uso uma imagem com Maven so pra compilar o projeto, assim a imagem final fica bem mais leve
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Primeiro copio so o pom.xml e baixo as dependencias pro Docker aproveitar o cache
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Agora copio o codigo fonte e gero o .jar final do Spring Boot
COPY src ./src
RUN mvn clean package -DskipTests -Dmaven.test.skip=true -B

# ==============================================================================
# Stage 2: Imagem final so com o JRE 21 pra rodar rapido em qualquer servidor cloud
# ==============================================================================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Pego so o arquivo .jar que foi compilado na etapa anterior
COPY --from=build /app/target/*.jar app.jar

# A porta padrao e 8080 (ou a variavel PORT que o servidor de hospedagem injetar)
EXPOSE 8080

# Deixei o perfil "h2" ativo por padrao pra funcionar sem precisar configurar banco externo,
# e limitei a RAM da JVM em 75% do container pra nao dar erro de falta de memoria (OOM)
ENV SPRING_PROFILES_ACTIVE=h2
ENV H2_CONSOLE_ENABLED=false
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.awt.headless=true"

ENTRYPOINT ["java", "-jar", "app.jar"]
