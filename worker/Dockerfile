FROM node:20-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install semgrep --break-system-packages

RUN curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.18.4/gitleaks_8.18.4_linux_x64.tar.gz \
    | tar xz -C /usr/local/bin gitleaks

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json .
COPY src/ ./src/

CMD ["npx", "tsx", "src/index.ts"]