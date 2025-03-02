FROM openjdk:latest
WORKDIR /app
COPY ./code/Main.java /app/
CMD ["sh", "-c", "javac Main.java && java Main"]
