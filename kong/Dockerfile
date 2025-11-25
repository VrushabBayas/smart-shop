FROM alpine:latest

RUN apk add --no-cache curl bash jq

WORKDIR /app

COPY setup.sh .

RUN chmod +x setup.sh

CMD ["./setup.sh"]
