FROM alpine:latest

RUN apk add --no-cache curl bash

WORKDIR /app

COPY setup.sh .

RUN chmod +x setup.sh

CMD ["./setup.sh"]
