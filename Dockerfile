FROM node:12
ARG STAND
ENV STAND=$STAND
WORKDIR /apps/finbot3
COPY ./ /apps/finbot3
EXPOSE 4090

# Install app dependencies and run application
RUN echo hellofinbot3

COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT /docker-entrypoint.sh
