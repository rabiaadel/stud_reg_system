#!/usr/bin/env groovy

pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins: agent
spec:
  serviceAccountName: jenkins
  securityContext:
    runAsUser: 0
    fsGroup: 0
  containers:
  - name: docker
    image: docker:latest
    command:
    - cat
    tty: true
    securityContext:
      privileged: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
  - name: node
    image: node:20-alpine
    command:
    - cat
    tty: true
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
            '''
        }
    }

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'production'], description: 'Deployment environment')
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run tests')
        booleanParam(name: 'RUN_SECURITY_SCAN', defaultValue: true, description: 'Run security scans')
        booleanParam(name: 'BUILD_IMAGES', defaultValue: true, description: 'Build Docker images')
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy to Kubernetes')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }

    environment {
        DOCKER_REGISTRY = credentials('docker-registry-url')
        SONARQUBE_TOKEN = credentials('sonarqube-token')
        KUBECONFIG = credentials('kubeconfig-${ENVIRONMENT}')
        ECR_REGISTRY = 'your-account.dkr.ecr.us-east-1.amazonaws.com'
        IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // Get git information
                    env.GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    env.GIT_BRANCH = sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD').trim()
                }
            }
        }

        stage('Lint and Test') {
            when {
                expression { params.RUN_TESTS }
            }
            parallel {
                stage('Test Frontend') {
                    steps {
                        container('node') {
                            dir('frontend') {
                                sh '''
                                    npm ci
                                    npm run lint
                                    npm run build
                                    npm test -- --coverage --watchAll=false || true
                                '''
                            }
                        }
                    }
                }

                stage('Test Backend') {
                    steps {
                        container('node') {
                            dir('backend') {
                                sh '''
                                    npm ci
                                    npm run lint || true
                                    npm test -- --coverage || true
                                '''
                            }
                        }
                    }
                }
            }
        }

        stage('Security Scanning') {
            when {
                expression { params.RUN_SECURITY_SCAN }
            }
            parallel {
                stage('Trivy FS Scan') {
                    steps {
                        container('docker') {
                            sh '''
                                docker run --rm -v $WORKSPACE:/scan aquasec/trivy:latest fs --severity HIGH,CRITICAL --format json -o /scan/trivy-report.json /scan
                            '''
                        }
                    }
                }

                stage('SonarQube Analysis') {
                    steps {
                        container('docker') {
                            sh '''
                                docker run --rm -v $WORKSPACE:/workspace \
                                  -e SONAR_HOST_URL="https://sonarqube.example.com" \
                                  -e SONAR_LOGIN="${SONARQUBE_TOKEN}" \
                                  sonarsource/sonar-scanner-cli \
                                  -Dsonar.projectKey=stud-reg-system \
                                  -Dsonar.sources=/workspace/backend,/workspace/frontend
                            '''
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            when {
                expression { params.BUILD_IMAGES }
            }
            parallel {
                stage('Build Backend') {
                    steps {
                        container('docker') {
                            sh '''
                                docker build -f Dockerfile.backend \
                                  -t ${ECR_REGISTRY}/stud-reg-backend:${IMAGE_TAG} \
                                  -t ${ECR_REGISTRY}/stud-reg-backend:latest .
                            '''
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        container('docker') {
                            sh '''
                                docker build -f Dockerfile.frontend \
                                  -t ${ECR_REGISTRY}/stud-reg-frontend:${IMAGE_TAG} \
                                  -t ${ECR_REGISTRY}/stud-reg-frontend:latest .
                            '''
                        }
                    }
                }
            }
        }

        stage('Scan Docker Images') {
            when {
                expression { params.BUILD_IMAGES }
            }
            parallel {
                stage('Scan Backend Image') {
                    steps {
                        container('docker') {
                            sh '''
                                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                                  aquasec/trivy:latest image --severity HIGH,CRITICAL \
                                  ${ECR_REGISTRY}/stud-reg-backend:${IMAGE_TAG}
                            '''
                        }
                    }
                }

                stage('Scan Frontend Image') {
                    steps {
                        container('docker') {
                            sh '''
                                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                                  aquasec/trivy:latest image --severity HIGH,CRITICAL \
                                  ${ECR_REGISTRY}/stud-reg-frontend:${IMAGE_TAG}
                            '''
                        }
                    }
                }
            }
        }

        stage('Push Docker Images') {
            when {
                expression { params.BUILD_IMAGES && (env.GIT_BRANCH == 'main' || env.GIT_BRANCH == 'develop') }
            }
            steps {
                container('docker') {
                    sh '''
                        docker push ${ECR_REGISTRY}/stud-reg-backend:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/stud-reg-backend:latest
                        docker push ${ECR_REGISTRY}/stud-reg-frontend:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/stud-reg-frontend:latest
                    '''
                }
            }
        }

        stage('Update Kustomization') {
            when {
                expression { params.DEPLOY }
            }
            steps {
                container('docker') {
                    sh '''
                        # Install kustomize if not present
                        curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
                        sudo mv kustomize /usr/local/bin/

                        # Update image references
                        cd k8s/backend && kustomize edit set image stud-reg-backend=${ECR_REGISTRY}/stud-reg-backend:${IMAGE_TAG}
                        cd ../../
                        cd k8s/frontend && kustomize edit set image stud-reg-frontend=${ECR_REGISTRY}/stud-reg-frontend:${IMAGE_TAG}
                        cd ../../

                        # Commit changes
                        git config user.email "jenkins@example.com"
                        git config user.name "Jenkins"
                        git add k8s/*/kustomization.yaml
                        git commit -m "Update images to ${IMAGE_TAG}" || true
                        git push
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                expression { params.DEPLOY }
            }
            steps {
                container('kubectl') {
                    sh '''
                        kubectl apply -k k8s/
                        kubectl rollout status deployment/stud-reg-backend -n stud-reg-system --timeout=5m
                        kubectl rollout status deployment/stud-reg-frontend -n stud-reg-system --timeout=5m
                    '''
                }
            }
        }

        stage('Smoke Tests') {
            when {
                expression { params.DEPLOY }
            }
            steps {
                container('kubectl') {
                    sh '''
                        # Wait for services to be ready
                        kubectl wait --for=condition=ready pod -l app=backend -n stud-reg-system --timeout=300s
                        kubectl wait --for=condition=ready pod -l app=frontend -n stud-reg-system --timeout=300s

                        # Port forward and test
                        kubectl port-forward svc/backend 3000:3000 -n stud-reg-system &
                        sleep 5
                        curl -f http://localhost:3000/health || exit 1
                    '''
                }
            }
        }
    }

    post {
        always {
            // Archive reports
            archiveArtifacts artifacts: '**/trivy-report.json,**/coverage/**', allowEmptyArchive: true
            junit testResults: '**/test-results.xml', allowEmptyResults: true

            // Publish reports
            publishHTML([
                reportDir: 'coverage',
                reportFiles: 'index.html',
                reportName: 'Code Coverage Report'
            ])
        }

        success {
            echo "Pipeline succeeded!"
            // Send slack notification
            script {
                if (params.DEPLOY) {
                    echo "Deployment successful to ${params.ENVIRONMENT}"
                }
            }
        }

        failure {
            echo "Pipeline failed!"
            sh '''
                kubectl get pods -A || true
                kubectl logs -n stud-reg-system -l app=backend --tail=50 || true
            '''
        }

        cleanup {
            cleanWs()
        }
    }
}
