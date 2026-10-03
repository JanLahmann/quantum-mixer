# ARM64 Build Instructions

## Building for ARM64 Architecture (Raspberry Pi, Apple Silicon)

The `Dockerfile.arm64` provides ARM64-compatible base images and dependencies.

### Build the Image

```bash
docker build -f Dockerfile.arm64 -t quantum-mixer:arm64 .
Run the Container
docker run -p 8080:8080 quantum-mixer:arm64

The application will be accessible at http://localhost:8080 or http://<raspberry-pi-ip>:8080.

### Tested On
Raspberry Pi 5 with Bookworm OS (ARM64)
Should work on Apple Silicon Macs (M1/M2/M3)

### Differences from Standard Dockerfile
Uses node:18-bookworm and python:3.11-bookworm base images (multi-arch support)
Qiskit 0.45.3 and qiskit-aer 0.13.3 (with pre-built ARM64 wheels)
Direct pip installation instead of poetry export

## Prebuilt image

Every push to `main` builds and publishes `ghcr.io/janlahmann/quantum-mixer:<commit SHA>` and `:latest` (workflow `.github/workflows/docker-arm64.yml`). RasQberry Two pins one of these and pulls it on the Raspberry Pi:

```bash
docker pull ghcr.io/janlahmann/quantum-mixer:latest
```
