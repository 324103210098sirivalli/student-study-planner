
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Java') {
            steps {
                bat 'java -version'
                bat 'javac -version'
            }
        }

        stage('Check Maven') {
            steps {
                bat 'mvn -version'
            }
        }

        stage('Build and Test Java API') {
            steps {
                dir('backend') {
                    bat 'mvn -B clean test package'
                }
            }
        }

        stage('Build React Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Verify Docker') {
            steps {
                bat '"C:\\Users\\Kolisetti Sirivalli\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" --version'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'backend/target/*.jar,frontend/dist/**',
                allowEmptyArchive: true
        }

        success {
            echo 'Student Study Planner CI build completed successfully!'
        }

        failure {
            echo 'Build failed. Check Console Output for details.'
        }
    }
}
