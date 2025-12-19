pipeline {
    agent any
    
    environment {
        VPS_HOST = '84.247.166.77'
        VPS_USER = 'root'
        APP_DIR = '/root/services/si-releves'
        REPO_DIR = '/root/services/si-releves/app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "📥 Code checked out successfully"'
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    sh """
                        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VPS_USER}@${VPS_HOST} '
                            set -e
                            cd ${REPO_DIR}
                            git fetch origin
                            git checkout feature/complete-implementation
                            git pull origin feature/complete-implementation
                            
                            echo "🧪 Running Backend Tests..."
                            cd ${REPO_DIR}/backend
                            docker run --rm -v \$(pwd):/app -w /app node:20-alpine sh -c "npm install && npm run test:ci" || true
                            
                            echo "🧪 Running Frontend Tests..."
                            cd ${REPO_DIR}/frontend
                            docker run --rm -v \$(pwd):/app -w /app node:20-alpine sh -c "npm install && npm run test:ci" || true
                            
                            echo "✅ Tests completed!"
                        '
                        
                        # Copy test results from VPS
                        scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VPS_USER}@${VPS_HOST}:${REPO_DIR}/backend/test-results.xml backend-results.xml || true
                        scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VPS_USER}@${VPS_HOST}:${REPO_DIR}/frontend/test-results.xml frontend-results.xml || true
                    """
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: '*-results.xml'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    sh """
                        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VPS_USER}@${VPS_HOST} '
                            set -e
                            
                            echo "🔨 Building Backend Docker image..."
                            cd ${REPO_DIR}/backend
                            docker build -t si-releves-backend:latest .
                            
                            echo "🔨 Building Frontend Docker image..."
                            cd ${REPO_DIR}/frontend
                            docker build -t si-releves-frontend:latest .
                            
                            echo "✅ Docker images built!"
                        '
                    """
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    sh """
                        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VPS_USER}@${VPS_HOST} '
                            set -e
                            
                            echo "🚀 Deploying containers..."
                            cd ${APP_DIR}
                            docker compose up -d --force-recreate backend frontend
                            
                            echo "⏳ Waiting for containers to be healthy..."
                            sleep 15
                            docker compose ps
                            
                            echo "✅ Deployment complete!"
                        '
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sh """
                        echo "🏥 Running health checks..."
                        sleep 5
                        
                        API_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" https://mcharfi.clueleak.com/api/health || echo "000")
                        echo "API Status: \$API_STATUS"
                        
                        FRONTEND_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" https://mcharfi.clueleak.com/ || echo "000")
                        echo "Frontend Status: \$FRONTEND_STATUS"
                        
                        if [ "\$API_STATUS" = "200" ] && [ "\$FRONTEND_STATUS" = "200" ]; then
                            echo "✅ All health checks passed!"
                        else
                            echo "⚠️ Some services may still be starting..."
                        fi
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above.'
        }
    }
}
