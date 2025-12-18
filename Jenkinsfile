pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'ghcr.io'
        IMAGE_PREFIX = 'mcharfi/si-releves'
        VPS_HOST = '84.247.166.77'
        SSH_CREDS_ID = 'vps-ssh-key'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'docker build -t ${IMAGE_PREFIX}-backend:${BUILD_NUMBER} -t ${IMAGE_PREFIX}-backend:latest .'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'docker build -t ${IMAGE_PREFIX}-frontend:${BUILD_NUMBER} -t ${IMAGE_PREFIX}-frontend:latest .'
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'feature/complete-implementation'
            }
            steps {
                sshagent(credentials: [env.SSH_CREDS_ID]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no root@${VPS_HOST} "
                            cd /root/services/si-releves && 
                            docker compose pull && 
                            docker compose up -d --force-recreate app frontend
                        "
                    '''
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

