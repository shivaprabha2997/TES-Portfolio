# AWS Management: Console vs. Infrastructure as Code (Terraform)

This project demonstrates the transition from manual cloud management to professional automated orchestration.

---

## 🖱️ Method 1: Manual Creation (AWS Management Console)
For initial exploration or troubleshooting, the console provides a visual way to manage resources.

### 1. Creating the VPC
1. Navigate to **VPC Dashboard**.
2. Click **Create VPC**.
3. Select **VPC and more**.
4. Configure CIDR (10.0.0.0/16) and select **Number of Availability Zones (3)**.
5. Set Public/Private subnets and NAT Gateways (1 per AZ for high availability).
6. Click **Create**.

### 2. Creating the EKS Cluster
1. Navigate to **Elastic Kubernetes Service**.
2. Click **Add cluster > Create**.
3. Set Name (`mycluster1`) and select your VPC and Private Subnets.
4. Once created, go to the **Compute** tab and click **Add Node Group**.
5. Configure Instance Type (`t3.medium`) and Scaling (1-5 nodes).

---

## 🤖 Method 2: Automated Creation (Terraform IaC)
This is the professional "DevOps Way" implemented in this repository.

### Why use the Terraform code provided in this repo?
- **Speed**: Provision the entire stack (VPC, EKS, ALB, Route53) in minutes with a single command.
- **Repeatability**: Delete and recreate the exact same environment anytime.
- **Version Control**: Every change to the infrastructure is tracked in GitHub.

### How to run:
```bash
cd terraform
terraform init
terraform apply -auto-approve
```

---

## 🏆 Recommendation for Recruiters
While I am proficient in using the **AWS Console** for quick checks and monitoring, I prioritize **Terraform** for all production workloads to ensure consistency, security, and scalability. This project reflects that "Infrastructure as Code" first mindset.
