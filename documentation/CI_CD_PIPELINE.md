# CI/CD Pipeline Documentation

## 🛠️ Tools Integration
- **Jenkins**: The heart of the automation, orchestrating every stage.
- **SonarQube**: Performed static code analysis to ensure 0 critical vulnerabilities.
- **Nexus**: Used for hosting build artifacts and dependencies.
- **Docker**: Containerizing the React portfolio application for consistent deployment.
- **Helm**: Packaging the Kubernetes resources for versioned releases.

## 📈 Pipeline Stages
### 1. Checkout
Fetches the latest code from the `main` branch of the GitHub repository.

### 2. Static Code Analysis
Runs SonarQube scanner. The pipeline is configured to fail if the **Quality Gate** is not met.

### 3. Infrastructure Sync
Checks for any changes in the `terraform/` directory and applies them to AWS.

### 4. Artifact Management
Builds the application artifacts, packages them into a ZIP, and uploads them to the Nexus repository.

### 5. Dockerization
Builds the Docker image using a multi-stage `Dockerfile` to minimize size and maximizes security.

### 6. EKS Deployment
Uses `helm upgrade --install` to perform a rolling update of the application on the EKS cluster.
