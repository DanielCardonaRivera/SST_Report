pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Project') {
            steps {
                sh 'echo SST_Report CI Pipeline'
                sh 'ls -la'
            }
        }

        stage('Frontend') {
            steps {
                sh 'test -d frontend'
            }
        }

        stage('Backend') {
            steps {
                sh 'test -f backend/app.py'
            }
        }
    }

    post {
        success {
            echo 'Build SUCCESS'
        }
        failure {
            echo 'Build FAILURE'
        }
    }
}