pipeline {
    agent any

    tools {
        nodejs 'Node_18'
    }

    environment {
        DOCKER_IMAGE       = "shivadocker2997/tesportfolio:TES"
        DOCKER_CREDENTIALS = "Docker_cred"
        SONARQUBE_ENV      = "sonar-scanner"
        NEXUS_REPO         = "http://98.92.203.81:8081//repository/raw-repo/"
        KUBECONFIG_PATH    = "/var/lib/jenkins/.kube/config"
        AWS_REGION         = "us-east-1"
        EKS_CLUSTER        = "clustertes"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/shivaprabha2997/TES-Portfolio.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                if [ -f package.json ]; then
                    npm install
                else
                    echo "No package.json found, skipping install"
                fi
                '''
            }
        }

        stage('Build Project') {
            steps {
                sh '''
                if npm run | grep -q "build"; then
                    npm run build
                else
                    echo "No build script found, skipping"
                fi
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                if npm run | grep -q "test"; then
                    npm test
                else
                    echo "No test script found, skipping"
                fi
                '''
            }
            post {
                always  { echo "Test stage completed" }
                failure { echo "Tests failed! Check the logs above." }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    sh "${tool 'sonar-scanner'}/bin/sonar-scanner \
                       -Dsonar.projectKey=tes-portfolio \
                       -Dsonar.projectName=TES-Portfolio \
                       -Dsonar.sources=. \
                       -Dsonar.exclusions=node_modules/**,dist/**,coverage/**"
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Package & Publish to Nexus') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-credentials',
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh '''
                    VERSION=$(node -p "require('./package.json').version")
                    ARTIFACT="tes-portfolio-${VERSION}.zip"

                    echo "=== Creating artifact: ${ARTIFACT} ==="
                    zip -r "$ARTIFACT" . \
                        --exclude "node_modules/*" \
                        --exclude ".git/*" \
                        --exclude "dist/*" \
                        --exclude "coverage/*"

                    echo "=== Uploading to Nexus ==="
                    curl -u "$NEXUS_USER:$NEXUS_PASS" \
                         --upload-file "$ARTIFACT" \
                         "${NEXUS_REPO}${ARTIFACT}"

                    echo "Artifact ${ARTIFACT} uploaded to Nexus successfully"
                    '''
                }
            }
        }

        stage('Fix Docker Permission') {
            steps {
                sh 'sudo chmod 777 /var/run/docker.sock || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker push shivadocker2997/tesportfolio:TES
                    docker logout
                    '''
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                sh '''
                docker stop tescontainer || true
                docker rm   tescontainer || true

                docker run -itd --name tescontainer -p 8090:8080 shivadocker2997/tesportfolio:TES
                echo "Container running at http://<your-server-ip>:8090"
                '''
            }
        }

        stage('Configure AWS EKS') {
            steps {
                sh """
                aws eks --region ${AWS_REGION} update-kubeconfig --name ${EKS_CLUSTER}
                export KUBECONFIG=${KUBECONFIG_PATH}
                kubectl get nodes
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                export KUBECONFIG=${KUBECONFIG_PATH}
                kubectl apply -f deployment.yml
                kubectl rollout status deployment deploytes
                kubectl get pods -l app=tes
                kubectl get svc  tes-service
                """
            }
        }
    }

    post {
        success {
            emailext(
                to: "sivaprabha997@gmail.com",
                subject: "SUCCESS: TES Portfolio Build #${env.BUILD_NUMBER}",
                body: """
Build Successful

Project  : TES Portfolio
Build #  : ${env.BUILD_NUMBER}
Branch   : main
Image    : shivadocker2997/tesportfolio:TES
Cluster  : clustertes (us-east-1)

Build URL: ${env.BUILD_URL}
"""
            )
        }
        failure {
            emailext(
                to: "sivaprabha997@gmail.com",
                subject: "FAILED: TES Portfolio Build #${env.BUILD_NUMBER}",
                body: """
Pipeline Failed

Check Logs: ${env.BUILD_URL}console
"""
            )
        }
        always {
            sh 'docker image prune -f || true'
            cleanWs()
        }
    }
}
