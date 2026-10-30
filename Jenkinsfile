pipeline {
  agent any
  tools { jdk 'JDK17'; maven 'Maven3' }
  environment { DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds') }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Build and test Java API') { steps { dir('backend') { sh 'mvn -B clean test package' } } }
    stage('Build React frontend') { steps { dir('frontend') { sh 'npm ci || npm install'; sh 'npm run build' } } }
    stage('Build Docker images') { steps { sh 'docker build -t ' + '${DOCKERHUB_CREDENTIALS_USR}' + '/student-study-planner-backend:${BUILD_NUMBER} ./backend'; sh 'docker build -t ' + '${DOCKERHUB_CREDENTIALS_USR}' + '/student-study-planner-frontend:${BUILD_NUMBER} ./frontend' } }
    stage('Push Docker images') { steps { sh 'echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin'; sh 'docker push "$DOCKERHUB_CREDENTIALS_USR/student-study-planner-backend:${BUILD_NUMBER}"'; sh 'docker push "$DOCKERHUB_CREDENTIALS_USR/student-study-planner-frontend:${BUILD_NUMBER}"' } }
    stage('Deploy to Kubernetes') { when { expression { return params.DEPLOY_TO_K8S == true } } steps { sh 'kubectl apply -f k8s/' ; sh 'kubectl set image deployment/backend backend="$DOCKERHUB_CREDENTIALS_USR/student-study-planner-backend:${BUILD_NUMBER}" -n study-planner'; sh 'kubectl set image deployment/frontend frontend="$DOCKERHUB_CREDENTIALS_USR/student-study-planner-frontend:${BUILD_NUMBER}" -n study-planner' } }
  }
  parameters { booleanParam(name: 'DEPLOY_TO_K8S', defaultValue: false, description: 'Deploy after images are pushed; configure kubectl credentials first') }
  post { always { archiveArtifacts artifacts: 'backend/target/*.jar,frontend/dist/**', allowEmptyArchive: true } }
}
