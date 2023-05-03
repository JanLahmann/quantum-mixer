## STAGE: builder-frontend
FROM registry.access.redhat.com/ubi8/nodejs-18 AS builder-frontend

# Use yarn for installation
RUN npm install -g yarn

# Install dependencies for application
COPY quantum-mixer-frontend/package.json quantum-mixer-frontend/yarn.lock ./
RUN yarn install

# Copy application code
COPY quantum-mixer-frontend ./

# Build application
RUN npm run build


## STAGE: main
FROM registry.access.redhat.com/ubi8/python-39

# Install poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Copy poetry requirement files
COPY quantum-mixer-backend/poetry.lock quantum-mixer-backend/pyproject.toml ./

# Export poetry requirement to pip requirements, install with pip
RUN poetry export -f requirements.txt --without-hashes | pip install -r /dev/stdin

# Copy application code
COPY quantum-mixer-backend ./

# Copy frontend files
COPY --from=builder-frontend /opt/app-root/src/dist/quantum-mixer-frontend public

# Start the FastAPI server using Uvicorn
ENV PORT=8080
CMD ["sh", "./start.sh"]
