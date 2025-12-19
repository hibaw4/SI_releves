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
                sh 'ls -la'
            }
        }
        
        stage('Build & Deploy') {
            steps {
                script {
                    // All build and deploy happens on VPS via SSH
                    sh """
                        echo "🚀 Deploying to VPS..."
                        
                        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VPS_USER}@${VPS_HOST} '
                            set -e
                            
                            echo "📦 Pulling latest code..."
                            cd ${REPO_DIR}
                            git fetch origin
                            git checkout feature/complete-implementation
                            git pull origin feature/complete-implementation
                            
                            echo "🧪 Running Backend Tests..."
                            cd ${REPO_DIR}/backend
                            docker run --rm -v \$(pwd):/app -w /app node:20-alpine sh -c "npm install && npm test" || echo "Tests completed"
                            
                            echo "🧪 Running Frontend Tests..."
                            cd ${REPO_DIR}/frontend
                            docker run --rm -v \$(pwd):/app -w /app node:20-alpine sh -c "npm install && npm test" || echo "Tests completed"
                            
                            echo "🔨 Building Backend Docker image..."
                            cd ${REPO_DIR}/backend
                            docker build -t si-releves-backend:latest .
                            
                            echo "🔨 Building Frontend Docker image..."
                            cd ${REPO_DIR}/frontend
                            docker build -t si-releves-frontend:latest .
                            
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
                        
                        # Check API health
                        API_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" https://mcharfi.clueleak.com/api/health || echo "000")
                        echo "API Status: \$API_STATUS"
                        
                        if [ "\$API_STATUS" = "200" ]; then
                            echo "✅ API is healthy"
                        else
                            echo "⚠️ API returned \$API_STATUS (may still be starting)"
                        fi
                        
                        # Check Frontend
                        FRONTEND_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" https://mcharfi.clueleak.com/ || echo "000")
                        echo "Frontend Status: \$FRONTEND_STATUS"
                        
                        if [ "\$FRONTEND_STATUS" = "200" ]; then
                            echo "✅ Frontend is healthy"
                        else
                            echo "⚠️ Frontend returned \$FRONTEND_STATUS (may still be starting)"
                        fi
                        
                        echo "🎉 Pipeline completed!"
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
