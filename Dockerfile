FROM eclipse-temurin:17-jdk AS build
WORKDIR /build
COPY backend/lib ./lib
COPY backend/WebContent/WEB-INF/lib ./webinf-lib
COPY backend/src ./src
RUN mkdir -p classes && \
    find src -name "*.java" > sources.txt && \
    javac -cp "lib/*:webinf-lib/*" -d classes @sources.txt

FROM tomcat:9.0-jdk17-temurin
RUN rm -rf /usr/local/tomcat/webapps/*
COPY backend/WebContent /usr/local/tomcat/webapps/ROOT
COPY --from=build /build/classes /usr/local/tomcat/webapps/ROOT/WEB-INF/classes

# Render assigns the port to listen on via $PORT; Tomcat's connector is fixed
# at container-build time, so rewrite it from the env var at container start.
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]
