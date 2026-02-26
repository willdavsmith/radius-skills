# Local Development with Radius

## Architecture

```
┌─────────────────────────────────────────────────────┐
│ Host Machine                                        │
│                                                     │
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │ Local OCI│  │ kind Cluster                     │ │
│  │ Registry │  │                                  │ │
│  │ :5001    │◄─┤  ┌────────┐ ┌──────┐ ┌───────┐  │ │
│  │          │  │  │Radius  │ │App   │ │Recipe │  │ │
│  └──────────┘  │  │Control │ │Pods  │ │Pods   │  │ │
│                │  │Plane   │ │      │ │       │  │ │
│                │  └────────┘ └──────┘ └───────┘  │ │
│                └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

Pods access host via: host.docker.internal
```

## Prerequisites

- Docker Desktop
- kind (Kubernetes in Docker)
- Radius CLI (`rad`)
- Bicep CLI (installed via `rad bicep download`)

## Setup Steps

### 1. Create a kind Cluster

```bash
kind create cluster --name dev
```

### 2. Install Radius

```bash
rad initialize
rad workspace create kubernetes default --group default --environment default
```

### 3. Start a Local OCI Registry

Needed for storing recipes and container images:

```bash
docker run -d -p 5001:5000 --name radius-registry registry:2
curl http://localhost:5001/v2/_catalog  # verify
```

### 4. Configure kind for Insecure Registry

kind's containerd defaults to HTTPS. For a local HTTP registry:

```bash
NODENAME=$(kubectl get nodes -o jsonpath='{.items[0].metadata.name}')

# Create hosts.toml for the registry
docker exec $NODENAME mkdir -p /etc/containerd/certs.d/host.docker.internal:5001
docker exec $NODENAME bash -c 'cat > /etc/containerd/certs.d/host.docker.internal:5001/hosts.toml << EOF
[host."http://host.docker.internal:5001"]
  capabilities = ["pull", "resolve"]
  skip_verify = true
EOF'

# Enable certs.d in containerd config
docker exec $NODENAME bash -c \
  'sed -i "s|config_path = \"\"|config_path = \"/etc/containerd/certs.d\"|" /etc/containerd/config.toml'

# Restart containerd
docker exec $NODENAME systemctl restart containerd
```

### 5. Build and Push Container Images

```bash
# Build
docker build -t myapp-backend:latest ./backend
docker build -t myapp-frontend:latest ./frontend

# Tag for local registry
docker tag myapp-backend:latest localhost:5001/myapp-backend:latest
docker tag myapp-frontend:latest localhost:5001/myapp-frontend:latest

# Push
docker push localhost:5001/myapp-backend:latest
docker push localhost:5001/myapp-frontend:latest
```

### 6. Publish and Register Recipes

```bash
# Publish recipe to local registry
rad bicep publish --file kubernetes-postgresql.bicep \
  --target br:localhost:5001/recipes/postgresql-kubernetes:latest \
  --plain-http

# Register recipe (use host.docker.internal for in-cluster access)
rad recipe register postgresql \
  --resource-type Radius.Data/postgreSqlDatabases \
  --template-kind bicep \
  --template-path "host.docker.internal:5001/recipes/postgresql-kubernetes:latest" \
  --plain-http
```

### 7. Deploy and Test

```bash
# Deploy with port-forwarding
rad run app.bicep

# Or deploy without port-forwarding
rad deploy app.bicep

# Then manually port-forward
kubectl port-forward -n <namespace> svc/frontend-frontend 3000:3000
```

## Networking: localhost vs host.docker.internal

| Context | `localhost` points to | `host.docker.internal` points to |
|---------|----------------------|----------------------------------|
| Your terminal | Host machine ✅ | Host machine ✅ |
| Inside a Docker container | The container itself ❌ | Host machine ✅ |
| Inside a kind pod | The pod itself ❌ | Host machine ✅ |

**Rule of thumb:** Use `localhost` only from your terminal. Use `host.docker.internal` for anything that runs inside Docker or Kubernetes.

## Debugging

### Check pod status
```bash
kubectl get pods -n default-<appname>
```

### Check logs
```bash
kubectl logs -n default-<appname> <pod-name>
```

### Check Radius deployment
```bash
rad app graph
rad resource list containers
```

### Common issues

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `ImagePullBackOff` | Image not in registry, or HTTPS issue | Push to registry + configure containerd |
| `CrashLoopBackOff` | App code error (check logs) | `kubectl logs` to see error |
| `Error` status | Connection to dependency failed | Check env vars with `kubectl exec -- env` |
| Recipe download failed | Wrong registry URL or path | Use `host.docker.internal`, add `--plain-http` |

## Dockerfile Tips for kind

### Node.js (Alpine)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev    # Don't use npm ci without package-lock.json

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
USER node                      # UID 1000 is already 'node' in Alpine
EXPOSE 3000
CMD ["node", "server.js"]
```

> **Gotcha:** `node:20-alpine` already has a user with UID 1000 (`node`). Don't `adduser -D -u 1000`. Use `USER node` instead.
> **Gotcha:** `npm ci` requires `package-lock.json`. Use `npm install --omit=dev` if no lockfile exists.

### Go (Multi-stage)

```dockerfile
FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

FROM alpine:3.19
RUN adduser -D -u 10001 appuser
WORKDIR /app
COPY --from=build /app/server .
USER appuser
EXPOSE 8080
CMD ["./server"]
```
