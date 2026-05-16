# System Architecture Documentation

## 🏗️ High-Level Overview
This project implements a highly available, secure, and scalable cloud infrastructure on AWS using the principles of Infrastructure as Code (IaC) and GitOps.

## 🗺️ Network Architecture
- **VPC**: 10.0.0.0/16 CIDR block.
- **Subnets**: 
  - **Public Subnets**: Hosting the Application Load Balancer (ALB) and NAT Gateways.
  - **Private Subnets**: Hosting the EKS Managed Node Groups for maximum security.
- **Connectivity**: 
  - Internet Gateway (IGW) for egress/ingress.
  - NAT Gateways for secure outbound internet access from private nodes.

## 🚢 Orchestration (EKS)
- **Cluster**: Amazon EKS v1.27.
- **Compute**: Managed Node Groups utilizing `t3.medium` instances with Auto Scaling.
- **Ingress**: AWS Load Balancer Controller managing the ALB for traffic distribution.

## 🔐 Security Model
- **Network Isolation**: All application workloads run in private subnets.
- **IAM**: Least-privilege IAM roles for EKS service accounts (IRSA).
- **Quality Gates**: SonarQube integrated into the CI/CD pipeline to enforce code quality and security standards.

## 🔄 CI/CD Flow
1. **Source**: GitHub repository.
2. **Orchestration**: Jenkins.
3. **Analysis**: SonarQube (Static Analysis).
4. **Artifacts**: Nexus Repository Manager.
5. **Deployment**: Helm Chart deployment to EKS.
