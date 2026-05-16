# Deployment & Setup Guide

## 📋 Prerequisites
- AWS Account with CLI configured.
- Terraform v1.5+.
- Kubectl & Helm installed.
- Jenkins server with Docker and Terraform plugins.

## 🚀 Step 1: Infrastructure (Terraform)
```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

## 🚢 Step 2: Kubernetes Configuration
Update your local kubeconfig to point to the new cluster:
```bash
aws eks update-kubeconfig --region us-east-1 --name mycluster1
```

## 🔄 Step 3: CI/CD Pipeline (Jenkins)
1. Create a "Pipeline" job in Jenkins.
2. Set "Definition" to "Pipeline script from SCM".
3. Add your GitHub repository URL and branch (`main`).
4. Add credentials for:
   - `Docker_cred`: Docker Hub login.
   - `AWS Credentials`: For EKS deployment.
5. Build the job!

## 📦 Step 4: Manual Helm Deployment (Optional)
If you wish to deploy manually via Helm:
```bash
cd charts/portfolio-app
helm upgrade --install my-app .
```
