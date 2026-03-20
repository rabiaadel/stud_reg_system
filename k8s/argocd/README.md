# ArgoCD Installation - Apply this first
# kubectl create namespace argocd
# kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Then apply the applications:
# kubectl apply -f k8s/argocd/stud-reg-app.yaml
# kubectl apply -f k8s/argocd/monitoring.yaml

# Access ArgoCD UI:
# kubectl -n argocd port-forward svc/argocd-server 8080:443
# Get initial admin password:
# kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

apiVersion: v1
kind: Namespace
metadata:
  name: argocd
