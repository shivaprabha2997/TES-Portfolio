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
        EKS_CLUSTER     = "mycluster1"

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
                --for=condition=available deployment/tes-deployment \
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

    post {

        success {

            emailext(
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",

                body: """
Build SUCCESS

Application URL:
http://${env.APP_URL}

Jenkins URL:
${env.BUILD_URL}
""",

                to: "${RECIPIENTS}"
            )
        }

        failure {

            emailext(
                subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",

                body: """
Build FAILED

Check Logs:
${env.BUILD_URL}
""",

                to: "${RECIPIENTS}"
            )
        }

        always {

            archiveArtifacts artifacts: 'tes-portfolio.zip',
            fingerprint: true
        }
    }
}
