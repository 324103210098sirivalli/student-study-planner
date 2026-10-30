stage('Deploy to Kubernetes') {
    when {
        expression {
            return params.DEPLOY_TO_K8S == true
        }
    }
    steps {
        bat 'kubectl apply -f k8s/'

        bat "kubectl set image deployment/backend backend=%DOCKERHUB_CREDENTIALS_USR%/student-study-planner-backend:%BUILD_NUMBER% -n study-planner"

        bat "kubectl set image deployment/frontend frontend=%DOCKERHUB_CREDENTIALS_USR%/student-study-planner-frontend:%BUILD_NUMBER% -n study-planner"
    }
}