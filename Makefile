# Variables
DOCKER_COMPOSE = docker-compose
PROJECT_NAME = my_project  # Change this to your project name

JMX_FILE = "RestroSync-LoadTest.jmx"
RESULTS_DIR = "loadtest/results"
JMeter_IMAGE = justb4/jmeter

# Default action
.DEFAULT_GOAL := help

# Start Docker Compose in detached mode
up:
	$(DOCKER_COMPOSE) up -d

# Start Docker Compose with build
up-build:
	$(DOCKER_COMPOSE) up -d --build

# Stop and remove all running containers
down:
	$(DOCKER_COMPOSE) down

# Stop and remove all containers, including volumes (WARNING: This deletes the database!)
down-volumes:
	$(DOCKER_COMPOSE) down --volumes

# Build images without starting containers
build:
	$(DOCKER_COMPOSE) build

# Restart the backend container
restart-backend:
	$(DOCKER_COMPOSE) restart backend

# Restart the database container
restart-db:
	$(DOCKER_COMPOSE) restart db

# Show running containers
ps:
	$(DOCKER_COMPOSE) ps

# Show logs for all services
logs:
	$(DOCKER_COMPOSE) logs -f

# Show logs for the backend container
logs-backend:
	$(DOCKER_COMPOSE) logs -f backend

# Show logs for the database container
logs-db:
	$(DOCKER_COMPOSE) logs -f db

# Execute a shell inside the backend container
shell-backend:
	docker exec -it my_node_app sh

# Execute a shell inside the database container
shell-db:
	docker exec -it my_postgres_db sh

# Connect to PostgreSQL using psql inside the container
psql:
	docker exec -it my_postgres_db psql -U myuser -d mydatabase

# Run Jest tests inside the Docker container
test:
	$(DOCKER_COMPOSE) run --rm test npm test -- --coverage --detectOpenHandles

# Run API and tests simultaneously
run-all-tests:
	$(DOCKER_COMPOSE) up -d --build test test-db
	$(DOCKER_COMPOSE) run --rm test npm test -- --coverage --detectOpenHandles
	$(DOCKER_COMPOSE) down

test-file:
	$(DOCKER_COMPOSE) run --rm test npm test -- $(FILE) --coverage --detectOpenHandles

test-folder:
ifndef DIR
	@echo "Usage: make test-folder DIR=path/to/folder"
	@echo "Example: make test-folder DIR=orderManagementTests"
	@exit 1
endif
	$(DOCKER_COMPOSE) run --rm test npm test --tests/unit/$(DIR) --coverage --detectOpenHandles

# Runs the JMeter test plan
run-jmeter: check-results-dir
	$(if $(findstring $(OS),Windows_NT), \
		if not exist $(RESULTS_DIR) mkdir $(RESULTS_DIR), \
		mkdir -p $(RESULTS_DIR))

	$(if $(findstring $(OS),Windows_NT), \
		docker run --rm -v "$(PWD)/loadtest:/test-plan" -v "$(PWD)/$(RESULTS_DIR):/results" $(JMeter_IMAGE) -n -t /test-plan/$(JMX_FILE) -l /results/test-results.jtl, \
		docker run --rm -v $(PWD)/loadtest:/test-plan -v $(PWD)/$(RESULTS_DIR):/results $(JMeter_IMAGE) -n -t /test-plan/$(JMX_FILE) -l /results/test-results.jtl)


run-loadtest: clean-loadtest-results
	mkdir loadtest/jtl-report
	mkdir loadtest/html-report
	jmeter -n -t loadtest/RestroSync-LoadTest.jmx -l loadtest/jtl-report/results.jtl -e -o loadtest/html-report
	open loadtest/html-report/index.html

clean-loadtest-results:
	rm -rf loadtest/jtl-report
	rm -rf loadtest/html-report

# Help command to show available commands
help:
	@echo "Available commands:"
	@echo "  make up              					- Start Docker Compose in detached mode"
	@echo "  make up-build        					- Build and start Docker Compose"
	@echo "  make down            					- Stop and remove containers"
	@echo "  make down-volumes    					- Stop and remove containers + volumes"
	@echo "  make build           					- Build Docker images"
	@echo "  make restart-backend 					- Restart the backend container"
	@echo "  make restart-db      					- Restart the database container"
	@echo "  make ps              					- List running containers"
	@echo "  make logs           					- Show logs for all services"
	@echo "  make logs-backend    					- Show logs for the backend service"
	@echo "  make logs-db         					- Show logs for the database service"
	@echo "  make shell-backend   					- Open shell inside the backend container"
	@echo "  make shell-db        					- Open shell inside the database container"
	@echo "  make psql            					- Connect to PostgreSQL database inside the container"
	@echo "  make test            					- Run Jest tests inside the Docker container"
	@echo "  make run-all-tests   					- Run API and tests simultaneously"
	@echo "  make test-coverage   					- Opens test coverage."
	@echo "  make test-file FILE=filename.test.js  	- Run a specific test file"
	@echo "  make test-folder DIR=foldername  		- Run all tests in one folder"
	@echo "  make clean-loadtest-results 			- Clean up load test results"
	@echo "  make run-loadtest    					- Run JMeter test plan and generate HTML report"