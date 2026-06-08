pipeline {
  agent any
  environment {
    REGISTRY = 'myregistry.example.com/sst-report'
    IMAGE_TAG = "${env.BRANCH_NAME}-${env.GIT_COMMIT ? env.GIT_COMMIT.take(8) : 'local'}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build frontend') {
      steps {
        sh 'npm ci --prefix frontend'
        sh 'npm run build --prefix frontend'
      }
    }
    stage('Backend smoke') {
      steps {
        echo 'No backend tests configured; add pytest or similar if needed.'
      }
    }
    stage('Docker build & optionally push') {
      when { expression { return env.BUILD_IMAGE == 'true' } }
      steps {
        sh "docker build -t ${REGISTRY}:${IMAGE_TAG} ."
        withCredentials([usernamePassword(credentialsId: 'docker-reg-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin myregistry.example.com'
          sh "docker push ${REGISTRY}:${IMAGE_TAG}"
        }
      }
    }
  }
  post {
    success { echo "Build ${env.JOB_NAME} #${env.BUILD_NUMBER} succeeded" }
    failure { echo "Build ${env.JOB_NAME} #${env.BUILD_NUMBER} failed" }
  }
}
