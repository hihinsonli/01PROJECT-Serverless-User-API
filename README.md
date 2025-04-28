# Project 01 - Serverless Framework Requirement

**Scenario**:  
You are a DevOps engineer at a startup building a serverless REST API for a microservices-based application. Your task is to set up the infrastructure and deployment pipeline to support the development team. The API will be built using AWS Lambda and API Gateway, with a focus on serverless architecture and observability.

**Requirements for Infrastructure**:  
- An AWS API Gateway to handle HTTP requests.  
- Two AWS Lambda functions:  
  - One handles `GET /users` and returns a static JSON response (e.g., `{"users": ["user1", "user2"]}`).  
  - Another handles `POST /users` and logs the request body to CloudWatch.  
- A DynamoDB table to store user data (not used in Lambda logic for simplicity, but provisioned for future use).  
- CloudWatch alarms to monitor:  
  - Lambda function errors (for both functions).  
  - API Gateway 4xx errors.  
  - Alarms should notify an SNS topic subscribed to an email address.  
- Use the **Serverless Framework** to define and deploy the infrastructure.  
- Infrastructure should be parameterized for reusability (e.g., support different environments like `dev` and `prod`).  

**Deliverables**:  
- A private GitHub/GitLab repository containing:  
  - A `serverless.yml` file defining the infrastructure using the Serverless Framework.  
  - Two Lambda function code files (use Node.js or Python) with dummy logic for `GET /users` and `POST /users`.  
  - A CI/CD pipeline that:  
    - Lints the `serverless.yml` file (use `serverless.yml` linter or a YAML linter).  
    - Authenticates to AWS using OIDC.  
    - Deploys the Serverless Framework stack (only on the `main` branch).  
    - Runs tests on the Lambda functions (e.g., a simple test to verify the `GET /users` response).  

**Limitations**:  
- Use GitHub Actions or GitLab CI.  
- If using GitHub Actions, only use `actions/checkout`.
- Assume the CI/CD runner has only Docker installed.  
- No local file I/O in Lambda functions (use CloudWatch for logging).  

**Learning Outcomes**:  
- Gain experience with the Serverless Framework for defining serverless infrastructure.  
- Practice setting up CI/CD pipelines for serverless applications.  
- Learn to monitor serverless applications using CloudWatch alarms.  

# Usage Instruction
