pipeline {

	agent {
		label 'kub-node-agent'
    }

    options {
		buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }

    environment {
		PROJECT_KEY = 'marketplace-frontend-nextjs'
		APP_IMAGE = '361769563347.dkr.ecr.us-east-1.amazonaws.com/marketplace-frontend-nextjs'
		AWS_REGISTRY = '361769563347.dkr.ecr.us-east-1.amazonaws.com'
        AWS_REGION = 'us-east-1'
    }

    stages {

		stage('Restore & Install Deps') {
			steps {
				container('node') {
					writeFile file: "next-lock.cache", text: "$GIT_COMMIT"

					cache(caches: [
						arbitraryFileCache(
							path: "node_modules",
							includes: "**/*",
							cacheValidityDecidingFile: "yarn.lock"
						)
					]) {
						sh '''
							corepack enable && corepack prepare yarn@stable --activate
							yarn
						'''
					}
				}
			}
		}

		stage('Build') {
			steps {
				container('node') {
					writeFile file: "next-lock.cache", text: "$GIT_COMMIT"

					cache(caches: [
						arbitraryFileCache(
							path: ".next/cache",
							includes: "**/*",
							cacheValidityDecidingFile: "next-lock.cache"
						)
					]) {
						sh 'yarn build'
					}
				}
			}
		}

        stage('Login AWS ECR') {
			steps {
				container('aws-cli') {
					withCredentials([
						usernamePassword(
							credentialsId: 'aws-username-password',
							usernameVariable: 'AWS_ACCESS_KEY_ID',
							passwordVariable: 'AWS_SECRET_ACCESS_KEY'
						)
						]) {
						sh '''
							aws ecr get-login-password --region $AWS_REGION > ecr-login.txt
						'''
						}
				}
			}
		}

		stage('Login Buildah AWS ECR') {
			steps {
				container('buildah') {
					sh '''
						buildah login -u AWS -p $(cat ecr-login.txt) $AWS_REGISTRY
					'''
				}
			}
		}

		stage('Login Buildah Docker Hub') {
			steps {
				container('buildah') {
					withCredentials([usernamePassword(
						credentialsId: 'docker-hub-credentials',
						usernameVariable: 'DOCKERHUB_USER',
						passwordVariable: 'DOCKERHUB_PASS'
					)]) {
						sh 'buildah login -u $DOCKERHUB_USER -p $DOCKERHUB_PASS docker.io'
					}
				}
			}
		}

		stage('SonarQube Analysis') {
			steps {
				container('sonar-scanner') {
					withSonarQubeEnv('sonarqube-server') {
						withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
							sh '''
							sonar-scanner \
								-Dsonar.projectKey=$PROJECT_KEY \
								-Dsonar.sources=src \
								-Dsonar.exclusions="**/node_modules/**,**/dist/**,**/*.test.ts,**/*.spec.ts,**/*.test.js,**/*.spec.js" \
								-Dsonar.typescript.tsconfigPath=tsconfig.json \
							'''
						}
					}
				}
			}
		}

		stage('Trivy Security Scan') {
			steps {
				container('trivy') {
					sh '''
						trivy fs --skip-dirs build/static/js .
					'''
				}
			}
		}

		stage('Build Multi-Arch') {
			steps {
				container('buildah') {
					writeFile file: "buildah-cache.key", text: "$GIT_COMMIT"

					sh'''
						mkdir -p buildah_storage_cache
						chmod -R 777 buildah_storage_cache
					'''

					cache(caches: [
						arbitraryFileCache(
							path: 'buildah_storage_cache',
							includes: '**/*',
							cacheValidityDecidingFile: 'buildah-cache.key'
						)
					]) {
						sh '''
							cp -r buildah_storage_cache /var/lib/containers/storage

							buildah bud --layers --platform linux/amd64 -t ${APP_IMAGE}-amd64:latest .
							buildah bud --layers --platform linux/arm64 -t ${APP_IMAGE}-arm64:latest .
							buildah manifest create ${APP_IMAGE}:latest --amend ${APP_IMAGE}-amd64:latest --amend ${APP_IMAGE}-arm64:latest

							cp -r /var/lib/containers/storage buildah_storage_cache
						'''
					}
				}
			}
		}

		stage('Push Image') {
			steps {
				container('buildah') {
					sh '''
                		buildah manifest push ${APP_IMAGE}:latest docker://${APP_IMAGE}:latest
            		'''
				}
			}
		}

    }
}
