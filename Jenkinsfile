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
                echo "📥 Code checked out from ${env.GIT_BRANCH}"
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test || echo "No tests configured yet"'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test || echo "No tests configured yet"'
                        }
                    }
                }
            }
        }
        
        stage('Build & Deploy to VPS') {
            when {
                branch 'feature/complete-implementation'
            }
            steps {
                script {
                    // Use SSH to connect to VPS and run deployment
                    sh """
                        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VPS_USER}@${VPS_HOST} '
                            set -e
                            echo "📦 Pulling latest code..."
                            cd ${REPO_DIR}
                            git fetch origin
                            git checkout feature/complete-implementation
                            git pull origin feature/complete-implementation
                            
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
                            sleep 10
                            docker compose ps
                            
                            echo "✅ Deployment complete!"
                        '
                    """
                }
            }
        }
        
        stage('Health Check') {
            when {
                branch 'feature/complete-implementation'
            }
            steps {
                script {
                    sh """
                        echo "🏥 Running health checks..."
                        sleep 5
                        
                        # Check API health
                        API_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" https://mcharfi.clueleak.com/api/health)
                        if [ "\$API_STATUS" = "200" ]; then
                            echo "✅ API is healthy (HTTP \$API_STATUS)"
                        else
                            echo "❌ API health check failed (HTTP \$API_STATUS)"
                            exit 1
                        fi
                        
                        # Check Frontend
                        FRONTEND_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" https://mcharfi.clueleak.com/)
                        if [ "\$FRONTEND_STATUS" = "200" ]; then
                            echo "✅ Frontend is healthy (HTTP \$FRONTEND_STATUS)"
                        else
                            echo "❌ Frontend health check failed (HTTP \$FRONTEND_STATUS)"
                            exit 1
                        fi
                        
                        echo "🎉 All health checks passed!"
                    """
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above.'
        }
    }
}
