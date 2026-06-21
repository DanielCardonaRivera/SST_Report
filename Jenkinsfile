pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Repository') {
            steps {
                sh 'pwd'
                sh 'ls -la'
            }
        }

        stage('Frontend Validation') {
            steps {
                sh '''
                    if [ -d frontend ]; then
                        echo "Frontend encontrado"
                    else
                        echo "Frontend no encontrado"
                        exit 1
                    fi
                '''
            }
        }

        stage('Backend Validation') {
            steps {
                sh '''
                    if [ -f backend/app.py ]; then
                        echo "Backend encontrado"
                    else
                        echo "backend/app.py no encontrado"
                        exit 1
                    fi
                '''
            }
        }

    }

    post {
        success {
            echo "Build ${env.JOB_NAME} #${env.BUILD_NUMBER} succeeded"
        }
        failure {
            echo "Build ${env.JOB_NAME} #${env.BUILD_NUMBER} failed"
        }
    }
}