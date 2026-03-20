# Kubernetes & Kustomize Configuration

## Directory Structure

```
k8s/
├── kustomization.yaml          # Master kustomization file
├── deployment-patches.yaml     # Resource patches
├── namespaces/                 # Namespace definitions
│   ├── kustomization.yaml
│   ├── app-namespace.yaml
│   ├── db-namespace.yaml
│   └── monitoring-namespace.yaml
├── db/                         # Database (PostgreSQL)
│   ├── kustomization.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── secret.env
│   ├── pvc.yaml
│   ├── statefulset.yaml
│   ├── service.yaml
│   └── init-configmap.yaml
├── backend/                    # Backend API Service
│   ├── kustomization.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── secret.env
│   ├── serviceaccount.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   └── pdb.yaml
├── frontend/                   # Frontend Web Service
│   ├── kustomization.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── serviceaccount.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   └── pdb.yaml
├── monitoring/                 # Prometheus & Grafana
│   ├── kustomization.yaml
│   ├── prometheus-configmap.yaml
│   ├── prometheus-deployment.yaml
│   ├── prometheus-service.yaml
│   ├── prometheus-serviceaccount.yaml
│   ├── prometheus-clusterrole.yaml
│   ├── prometheus-clusterrolebinding.yaml
│   ├── grafana-datasource-configmap.yaml
│   ├── grafana-deployment.yaml
│   ├── grafana-service.yaml
│   ├── grafana-serviceaccount.yaml
│   ├── grafana-secret.yaml
│   └── grafana-dashboards-configmap.yaml
├── argocd/                     # ArgoCD Applications
│   ├── stud-reg-app.yaml       # Main application
│   ├── monitoring.yaml         # Monitoring stack
│   └── README.md               # ArgoCD setup guide
└── overlays/                   # Environment overlays
    └── dev/                    # Development override
        ├── kustomization.yaml
        ├── patch-local.yaml
        └── secret-dev.env
```

## Quick Start

### 1. Deploy Everything
```bash
kubectl apply -k k8s/
```

### 2. Deploy Specific Component
```bash
# Database only
kubectl apply -k k8s/db/

# Backend only
kubectl apply -k k8s/backend/

# Monitoring only
kubectl apply -k k8s/monitoring/
```

### 3. Deploy with Development Overlay
```bash
kubectl apply -k k8s/overlays/dev/
```

## Component Details

### Database (PostgreSQL)
- **Type**: StatefulSet (1 replica)
- **Storage**: ReadWriteOnce 10Gi
- **Port**: 5432
- **Health Check**: pg_isready probe
- **Resource Limits**: 256Mi→512Mi memory, 250m→500m CPU

### Backend API
- **Type**: Deployment
- **Replicas**: 3 (configurable)
- **Port**: 3000
- **Health Check**: HTTP GET /health
- **HPA**: 2-10 replicas based on CPU/Memory
- **Resource Limits**: 256Mi→512Mi memory, 250m→500m CPU

### Frontend
- **Type**: Deployment
- **Replicas**: 2 (configurable)
- **Port**: 8080
- **Health Check**: HTTP GET /health & /index.html
- **HPA**: 1-5 replicas based on CPU/Memory
- **Resource Limits**: 128Mi→256Mi memory, 100m→200m CPU

### Monitoring
- **Prometheus**: Scrapes all services, 15-day retention
- **Grafana**: Visualization with Prometheus datasource
- **Both**: 1 replica each with persistent volumes

## Kustomize Commands

### Build manifests (preview changes)
```bash
kustomize build k8s/
```

### Build specific component
```bash
kustomize build k8s/backend/
```

### Build with overlay
```bash
kustomize build k8s/overlays/dev/
```

### Set image for deployment
```bash
cd k8s/backend
kustomize edit set image stud-reg-backend=my-registry.com/backend:v1.2.3
```

### Set replica count
```bash
cd k8s/backend
kustomize edit set replicas backend=5
```

## Secrets Management

### Update Secrets
Edit the `secret.env` files in each component directory:

```bash
# Database secret
k8s/db/secret.env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Backend secret
k8s/backend/secret.env
DB_PASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
APP_DOMAIN=your-domain.com

# Frontend secret (if needed)
k8s/frontend/secret.env
REACT_APP_API_URL=https://api.your-domain.com
```

**Important**: Never commit `secret.env` files! Add them to `.gitignore`.

Then apply:
```bash
kubectl apply -k k8s/
```

## Scaling & Autoscaling

### Manual Scale
```bash
# Scale backend to 5 replicas
kubectl scale deployment backend --replicas=5 -n stud-reg-system

# Scale frontend to 3 replicas
kubectl scale deployment frontend --replicas=3 -n stud-reg-system
```

### Autoscaling (HPA)
- **Backend**: 2-10 replicas, 70% CPU / 80% Memory threshold
- **Frontend**: 1-5 replicas, 70% CPU / 80% Memory threshold

Monitor HPA:
```bash
kubectl get hpa -n stud-reg-system -w
```

## Resource Quotas

Each namespace has resource quotas. Check them:
```bash
kubectl describe resourcequota -n stud-reg-system
kubectl describe resourcequota -n stud-reg-db
kubectl describe resourcequota -n monitoring
```

## Pod Disruption Budgets (PDB)

Protects availability during cluster maintenance:
- **Backend PDB**: Minimum 1 replica available
- **Frontend PDB**: Minimum 1 replica available

Check:
```bash
kubectl get pdb -A
```

## Monitoring & Alerts

### Prometheus
- Scrapes metrics every 15 seconds
- Uses service discovery for pods
- 15-day retention

Access: `http://localhost:9090`

### Grafana
- Dashboard at: `http://localhost:3050`
- Default credentials: admin/admin123
- Datasource: Prometheus

### Example Queries
```promql
# CPU usage percentage
sum(rate(container_cpu_usage_seconds_total[5m])) * 100

# Memory usage
sum(container_memory_usage_bytes)

# HTTP request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Pod availability
kube_pod_status_ready
```

## Updating Deployments

### Update image
```bash
# Update backend image
kubectl set image deployment/backend backend=stud-reg-backend:v2 -n stud-reg-system

# Check rollout status
kubectl rollout status deployment/backend -n stud-reg-system
```

### Rollback to previous version
```bash
kubectl rollout undo deployment/backend -n stud-reg-system
```

### View rollout history
```bash
kubectl rollout history deployment/backend -n stud-reg-system
```

## Debugging

### Pod Logs
```bash
# Backend logs
kubectl logs -n stud-reg-system -l app=backend --tail=50 -f

# Frontend logs
kubectl logs -n stud-reg-system -l app=frontend --tail=50 -f

# Database logs
kubectl logs -n stud-reg-db -l app=postgres --tail=50 -f

# Prometheus logs
kubectl logs -n monitoring -l app=prometheus --tail=50 -f
```

### Pod Describe
```bash
# Get pod details
kubectl describe pod <pod-name> -n stud-reg-system
```

### Execute commands
```bash
# Execute command in pod
kubectl exec -n stud-reg-system <backend-pod> -- npm -v

# Interactive shell
kubectl exec -it -n stud-reg-system <backend-pod> -- sh
```

### Port Forwarding
```bash
# Forward backend
kubectl port-forward -n stud-reg-system svc/backend 3000:3000

# Forward Grafana
kubectl port-forward -n monitoring svc/grafana 3050:3000

# Forward Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090
```

### Check Events
```bash
kubectl get events -n stud-reg-system --sort-by='.lastTimestamp'
```

## Production Considerations

### Before Deploying to Production

1. **Update Secrets**
   - Change all default passwords in `secret.env` files
   - Use external secrets manager (AWS Secrets Manager, Vault, etc.)

2. **Configure Resources**
   - Adjust resource limits based on your infrastructure
   - Update HPA min/max replicas
   - Set up cluster autoscaling

3. **Setup Persistence**
   - Use production-grade storage (EBS, GCP Persistent Disk)
   - Configure backup and restore procedures
   - Test disaster recovery

4. **Networking**
   - Setup Ingress controller
   - Configure SSL/TLS certificates
   - Setup load balancing

5. **Monitoring & Logging**
   - Integrate with centralized logging (ELK, CloudWatch, Stack Driver)
   - Setup alerts for critical metrics
   - Configure log retention policies

6. **Security**
   - Implement Network Policies
   - Setup Pod Security Policies
   - Use private container registry
   - Regular security scanning

7. **Backup & Disaster Recovery**
   - Regular database backups
   - Backup application state
   - Test recovery procedures

## Useful Links

- [Kubernetes Docs](https://kubernetes.io/docs/)
- [Kustomize](https://kustomize.io/)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)
- [ArgoCD](https://argo-cd.readthedocs.io/)

## Troubleshooting Guide

### Issue: Pod keeps restarting
- Check logs: `kubectl logs <pod-name>`
- Check resource limits
- Check health check configuration

### Issue: Service not accessible
- Check service: `kubectl get svc`
- Check endpoints: `kubectl get endpoints`
- Check network policies

### Issue: Database connection failed
- Check StatefulSet status: `kubectl get statefulset`
- Check PVC status: `kubectl get pvc`
- Verify configmap and secrets

### Issue: High memory usage
- Check container limit: `kubectl describe pod`
- Monitor with Prometheus
- Scale deployment or increase resources
