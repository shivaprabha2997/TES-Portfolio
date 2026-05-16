pipeline {
    agent any

    tools {
        nodejs 'Node_18'
        terraform 'terraform'
    }

    environment {
        DOCKER_IMAGE       = "shivadocker2997/tesportfolio:TES"
        DOCKER_CREDENTIALS = "Docker_cred"
        SONARQUBE_ENV      = "sonar-scanner"
        NEXUS_REPO         = "http://98.92.203.81:8081/repository/raw-repo/"
        AWS_REGION         = "us-east-1"
        CLUSTER_NAME       = "mycluster1"
        RECIPIENTS         = "sivaprabha997@gmail.com"
    }

    stages {
        stage('Checkout') { steps { git branch: 'main', url: 'https://github.com/shivaprabha2997/TES-Portfolio.git' } }
        stage('Infrastructure (Terraform)') { steps { dir('terraform') { sh 'terraform init && terraform plan' } } }
        stage('Build & Test') { steps { sh 'npm install' } }
        stage('Docker Build & Push') { steps { withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) { sh "docker build -t ${DOCKER_IMAGE} ." } } }
        stage('Deploy to EKS') { steps { script { sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"; sh "kubectl apply -f deployment.yml"; sh "kubectl apply -f service.yml" } } }
    }
}
