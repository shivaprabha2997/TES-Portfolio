pipeline {
    agent any

    tools {
        nodejs 'Node_18'
    }

    environment {
        DOCKER_IMAGE       = "shivadocker2997/tesportfolio:TES"
        DOCKER_CREDENTIALS = "Docker_cred"
        SONARQUBE_ENV      = "sonar-scanner"

        NEXUS_REPO      = "http://98.92.203.81:8081/repository/raw-repo/"
        AWS_REGION      = "us-east-1"
        CLUSTER_NAME     = "mycluster1"

        RECIPIENTS      = "sivaprabha997@gmail.com"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/shivaprabha2997/TES-Portfolio.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                if [ -f package.json ]; then
                    npm install
                else
                    echo "No package.json found"
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
                    echo "No build script found"
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
                    echo "No test script found"
                fi
                '''
            }

            post {
                always {
                    echo "Test stage completed"
                }

                failure {
                    echo "Tests failed"
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {

                    sh """
                    ${tool 'sonar-scanner'}/bin/sonar-scanner \
                    -Dsonar.projectKey=tes-portfolio \
                    -Dsonar.projectName=TES-Portfolio \
                    -Dsonar.sources=. \
                    -Dsonar.exclusions=node_modules/**,dist/**,coverage/**
                    """
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

                withCredentials([
                    usernamePassword(
                        credentialsId: 'nexus_cred',
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )
                ]) {

                    sh """
                    zip -r tes-portfolio.zip .

                    curl -v -u $NEXUS_USER:$NEXUS_PASS \
                    --upload-file tes-portfolio.zip \
                    ${NEXUS_REPO}tes-portfolio.zip
                    """
                }
            }
        }

        stage('Fix Docker Permission') {
            steps {
                sh '''
                sudo chmod 777 /var/run/docker.sock || true
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${DOCKER_IMAGE} .
                """
            }
        }

        stage('Push Docker Image') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

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

                docker rm tescontainer || true

                docker run -itd \
                --name tescontainer \
                -p 8090:8080 \
                shivadocker2997/tesportfolio:TES

                echo "Container running on port 8090"
                '''
            }
        }

        stage('Install Helm') {
            steps {

                sh '''
                curl -LO https://get.helm.sh/helm-v3.14.0-linux-amd64.tar.gz

                tar -zxvf helm-v3.14.0-linux-amd64.tar.gz

                mv linux-amd64/helm ./helm

                chmod +x ./helm
                '''
            }
        }

        stage('Setup Kubeconfig') {
            steps {
                sh '''
                aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
                kubectl get nodes
                '''
            }
        }
        
        stage('Deploy Monitoring (Prometheus + Grafana)') {
            steps {

                sh '''
                ./helm repo add prometheus-community \
                https://prometheus-community.github.io/helm-charts || true

                ./helm repo update

                ./helm upgrade --install monitoring \
                prometheus-community/kube-prometheus-stack \
                --namespace monitoring \
                --create-namespace \
                --set grafana.service.type=LoadBalancer
                '''
            }
        }

        stage('Get Grafana Password') {
            steps {

                sh '''
                echo "Grafana Admin Password:"

                kubectl get secret monitoring-grafana \
                -n monitoring \
                -o jsonpath="{.data.admin-password}" | base64 --decode

                echo ""
                '''
            }
        } 

        stage('Deploy Application to EKS') {
            steps {

                sh '''
                kubectl apply -f deployment.yml

                kubectl apply -f service.yml
                '''
            }
        }

        stage('Wait for LoadBalancer') {
            steps {

                sh '''
                echo "Waiting for LoadBalancer..."

                kubectl wait \
                --for=condition=available deployment/deploytes \
                --timeout=300s

                sleep 180
                '''
            }
        } 
        

        stage('Get Application URL') {
            steps {

                script {

                    def url = sh(
                        script: '''
                        kubectl get svc tes-service \
                        -o jsonpath="{.status.loadBalancer.ingress[0].hostname}{.status.loadBalancer.ingress[0].ip}"
                        ''',
                        returnStdout: true
                    ).trim()

                    env.APP_URL = url

                    echo "Application URL: ${env.APP_URL}"
                }
            }
        }
    }

   stage('Expose Grafana') {
            steps {
                sh '''
                echo "Waiting for Grafana..."
                sleep 30

                kubectl patch svc monitoring-grafana \
                -n monitoring \
                -p '{"spec": {"type": "LoadBalancer"}}'
                '''
            }
        }

        stage('Expose Prometheus') {
            steps {
                sh '''
                kubectl patch svc monitoring-kube-prometheus-prometheus \
                -n monitoring \
                -p '{"spec": {"type": "LoadBalancer"}}'
                '''
            }
        }
    }

    // ===========================
    post {

        success {
            script {

                sleep 40

                def APP_URL = ""
                def GRAFANA_URL = ""
                def PROM_URL = ""

                for (int i = 0; i < 5; i++) {

                    APP_URL = sh(
                        script: "kubectl get svc puzzle-game-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' || true",
                        returnStdout: true
                    ).trim()

                    GRAFANA_URL = sh(
                        script: "kubectl get svc monitoring-grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' || true",
                        returnStdout: true
                    ).trim()

                    PROM_URL = sh(
                        script: "kubectl get svc monitoring-kube-prometheus-prometheus -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' || true",
                        returnStdout: true
                    ).trim()

                    if (APP_URL && GRAFANA_URL && PROM_URL) {
                        break
                    }

                    sleep 20
                }

                def DOCKER_IMAGE = "${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}"

                emailext(
                    subject: "🚀 Deployment Successful - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    mimeType: 'text/html',
                    body: """
                    <html>
                    <body style="font-family: Arial;">

                    <h2 style="color:green;">🎉 Deployment Successful</h2>

                    <h3>📌 Project Details</h3>
                    <ul>
                        <li><b>Project:</b> ${PROJECT_NAME}</li>
                        <li><b>Cluster:</b> ${CLUSTER_NAME}</li>
                    </ul>

                    <h3>🐳 Docker Image</h3>
                    <p>${DOCKER_IMAGE}</p>

                    <h3>🌐 Application</h3>
                    <a href="http://${APP_URL}">Open Application</a>

                    <h3>📊 Grafana</h3>
                    <a href="http://${GRAFANA_URL}">Open Grafana</a>

                    <h3>🔥 Prometheus</h3>
                    <a href="http://${PROM_URL}:9090">Open Prometheus</a>

                    <h3>🛠 Jenkins</h3>
                    <ul>
                        <li>Job: ${env.JOB_NAME}</li>
                        <li>Build: ${env.BUILD_NUMBER}</li>
                        <li><a href="${env.BUILD_URL}">Open Build</a></li>
                    </ul>

                    </body>
                    </html>
                    """,
                    to: "${env.RECIPIENTS}"
                )
            }
        }

        failure {
            emailext(
                subject: "❌ Deployment Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                mimeType: 'text/html',
                body: """
                <html>
                <body style="font-family: Arial;">

                <h2 style="color:red;">❌ Deployment Failed</h2>

                <p><b>Project:</b> Sliding Puzzle Game</p>
                <p><b>Cluster:</b> mycluster</p>

                <h3>🔍 Logs</h3>
                <a href="${env.BUILD_URL}">View Build Logs</a>

                </body>
                </html>
                """,
                to: "${env.RECIPIENTS}"
            )
        }

        always {
            archiveArtifacts artifacts: 'tes-portfolio.zip', fingerprint: true, allowEmptyArchive: true
        }
    }
}
