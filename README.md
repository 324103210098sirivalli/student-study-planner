# Student Study Planner — Java + Spring Boot + React

This version keeps the original React StudySpace interface and replaces the Express/Node backend with a Java 17 Spring Boot REST API built by Maven. MongoDB remains the database. It includes Docker Compose, Jenkins pipeline and Kubernetes manifests for the CI/CD case study.

## Requirements
- Java JDK 17+
- Maven 3.9+ (or use Docker Compose without installing Java/Maven locally)
- Node.js 20+ and npm (for local frontend)
- MongoDB 7+ running locally, OR Docker Desktop

## Quickest run (recommended): Docker Compose
1. Install and start Docker Desktop.
2. Open PowerShell in this extracted project folder.
3. Run: `docker compose up --build`
4. Wait for the images and services to start. Open **http://localhost:8080**.
5. Choose **Create an account**, register, then add study tasks.
6. API health: http://localhost:5000/api/health
7. Stop with `Ctrl+C`; then run `docker compose down`. Data persists in the `mongo-data` volume. To delete data too: `docker compose down -v` (destructive).

## Run without Docker (two terminals + MongoDB)
1. Start MongoDB locally on port 27017.
2. Terminal 1:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```
3. Terminal 2:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
4. Open the Vite URL (usually http://localhost:5173). The local React API defaults to http://localhost:5000/api.

## Main API
- `POST /api/auth/register` body `{ "name":"Student", "email":"student@example.com", "password":"secret123" }`
- `POST /api/auth/login`
- `GET /api/tasks` (Bearer token required)
- `POST /api/tasks` (Bearer token required)
- `PUT /api/tasks/{id}` (Bearer token required)
- `DELETE /api/tasks/{id}` (Bearer token required)
- `GET /api/health`

## CI/CD case study tools
- Git + GitHub: source control and collaboration.
- Maven: Java backend build and test (`cd backend && mvn clean test package`).
- Jenkins: `Jenkinsfile` builds Java and React, builds and pushes Docker images, optionally applies Kubernetes manifests.
- Docker: root `docker-compose.yml` for local end-to-end execution; individual Dockerfiles for API and frontend.
- Kubernetes: manifests in `k8s/`. Before deploying, replace `YOUR_DOCKERHUB_USERNAME` in `k8s/02-backend.yaml` and `k8s/03-frontend.yaml`, configure a strong JWT secret through a Kubernetes Secret, and ensure your cluster can pull the images.

## Jenkins setup notes
1. Install Jenkins with JDK 17, Maven and NodeJS available on the agent; install Docker CLI/daemon and kubectl only if using those stages.
2. In **Manage Jenkins → Tools**, create JDK tool named `JDK17` and Maven tool named `Maven3`.
3. Add a Jenkins username/password credential with ID `dockerhub-creds` for Docker Hub.
4. Create a Pipeline job from this GitHub repository and select `Jenkinsfile`.
5. Configure Docker access for the Jenkins agent. Do not expose the Docker socket to untrusted builds.
6. For Kubernetes deployment, configure kubeconfig securely on the agent, change the image names in `k8s/`, and set `DEPLOY_TO_K8S` to true.

## GitHub collaboration
1. Create a new GitHub repository, for example `student-study-planner-java-cicd`.
2. From this project directory run:
   ```bash
   git init
   git add .
   git commit -m "Convert study planner backend to Java Spring Boot"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/student-study-planner-java-cicd.git
   git push -u origin main
   ```
3. In GitHub repository **Settings → Collaborators** (or **Collaborators and teams**), invite your friend's GitHub username. They must accept the invitation.
4. Work on feature branches and use Pull Requests instead of both editing `main` directly.

## Notes
- This is an educational starter. Change the example JWT secrets before shared/public deployment. For a real deployment use Kubernetes Secrets, HTTPS, stricter CORS, resource limits and database credentials.
- Kubernetes image names are placeholders until you push images to your Docker registry.
