# Project 01 - Serverless Framework

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
## Prerequisites
<BR>
Before proceeding, ensure you have the following:

* AWS CLI: Installed and configured with an IAM user or role that has sufficient permissions to:
  Manage IAM resources (iam:CreateOpenIDConnectProvider, iam:CreateRole, iam:PutRolePolicy, etc.).
* GitHub Repository: hihinsonli/01PROJECT-Serverless-User-API is set up and accessible.
* OpenSSL: Required to fetch the SSL certificate thumbprint.

<BR>

## Bootstrap Steps - Run on your local machine.

<BR>

Step 1: Retrieve the SHA-1 Fingerprint (Thumbprint) of GitHub's OIDC SSL Certificate
Run the following command to fetch the SHA-1 fingerprint (thumbprint) of GitHub's OIDC provider SSL certificate (token.actions.githubusercontent.com) in the correct format for AWS:
`echo | openssl s_client -servername token.actions.githubusercontent.com -showcerts -connect token.actions.githubusercontent.com:443 2>/dev/null | openssl x509 -fingerprint -noout | sed 's/SHA1 Fingerprint=//' | tr -d ':'`

Expected Output: A 40-character hexadecimal string.

<BR>

Step 2: Create the OIDC Provider in AWS
Using the thumbprint retrieved in Step 1, create an OIDC provider in AWS to allow GitHub Actions to authenticate via OIDC:
```
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list <40-character hexadecimal string from step 1>
```

Expected Output:
```
{
    "OpenIDConnectProviderArn": "arn:aws:iam::<your_account>:oidc-provider/token.actions.githubusercontent.com"
}
```

<BR>

Step 3: Verify the OIDC Provider
Verify that the OIDC provider was created successfully:
`aws iam list-open-id-connect-providers`

Expected Output:
```
{
    "OpenIDConnectProviderList": [
        {
            "Arn": "arn:aws:iam::<your_account>:oidc-provider/token.actions.githubusercontent.com"
        }
    ]
}
```

<BR>

<BR>

Step 4: Create the Trust Policy Document
Run command below on your local machine, make sure your local machine has been granted by AWS access token.
```
cat << EOF > github-actions-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<your_account>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:hihinsonli/01PROJECT-Serverless-User-API:*"
        }
      }
    }
  ]
}
EOF
```

<BR>

<BR>

Step 5: Create a file named github-actions-policy.json
Run below command on your local machine:
```
cat << EOF > github-actions-policy.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:CreateStack",
                "cloudformation:DescribeStacks",
                "cloudformation:DeleteStack",
                "cloudformation:UpdateStack",
                "cloudformation:CreateChangeSet",
                "cloudformation:DeleteChangeSet",
                "cloudformation:DescribeChangeSet",
                "cloudformation:ExecuteChangeSet",
                "cloudformation:SetStackPolicy",
                "cloudformation:DescribeStackEvents",
                "cloudformation:ListStackResources"
            ],
            "Resource": "arn:aws:cloudformation:ap-southeast-2:<your_account>:stack/user-api-dev-dev/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:ValidateTemplate"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListBucket",
                "s3:DeleteBucket",
                "s3:ListBucketVersions"
            ],
            "Resource": "arn:aws:s3:::cloudformation-artifacts-bucket-zdtg4jftdws"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:DeleteObjectVersion"
            ],
            "Resource": "arn:aws:s3:::cloudformation-artifacts-bucket-zdtg4jftdws/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "lambda:CreateFunction",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:DeleteFunction",
                "lambda:GetFunction",
                "lambda:AddPermission",
                "lambda:RemovePermission",
                "lambda:InvokeFunction",
                "lambda:TagResource",
                "lambda:ListVersionsByFunction",
                "lambda:PublishVersion"
            ],
            "Resource": "arn:aws:lambda:ap-southeast-2:<your_account>:function:user-api-dev-dev-*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "apigateway:GET",
                "apigateway:POST",
                "apigateway:PUT",
                "apigateway:DELETE",
                "apigateway:PATCH"
            ],
            "Resource": [
                "arn:aws:apigateway:ap-southeast-2::/restapis",
                "arn:aws:apigateway:ap-southeast-2::/restapis/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "apigateway:GET",
                "apigateway:PUT",
                "apigateway:DELETE"
            ],
            "Resource": "arn:aws:apigateway:ap-southeast-2::/tags/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:CreateTable",
                "dynamodb:DeleteTable",
                "dynamodb:DescribeTable",
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:TagResource"
            ],
            "Resource": "arn:aws:dynamodb:ap-southeast-2:<your_account>:table/user-table-dev"
        },
        {
            "Effect": "Allow",
            "Action": [
                "sns:CreateTopic",
                "sns:DeleteTopic",
                "sns:GetTopicAttributes",
                "sns:SetTopicAttributes",
                "sns:TagResource"
            ],
            "Resource": "arn:aws:sns:ap-southeast-2:<your_account>:AlarmNotifications-dev"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudwatch:PutMetricAlarm",
                "cloudwatch:DeleteAlarms",
                "cloudwatch:DescribeAlarms"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DeleteLogGroup",
                "logs:TagResource"
            ],
            "Resource": "arn:aws:logs:ap-southeast-2:<your_account>:log-group:/aws/lambda/user-api-dev-dev-*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:UpdateRole",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "iam:PutRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:GetRole",
                "iam:PassRole",
                "iam:TagRole"
            ],
            "Resource": "arn:aws:iam::<your_account>:role/user-api-dev-dev-ap-southeast-2-lambdaRole"
        }
    ]
}
EOF
```

<BR>

<BR>


Step 7: Create the Policy
Run below command on your local machine:
```
aws iam create-policy \
  --policy-name GitHubActionsPolicy \
  --policy-document file://github-actions-policy.json
```

<BR>

<BR>

Step 8: Create the `GitHubActionsRole` Role
Run below command on your local machine:

```
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://github-actions-trust-policy.json
```


<BR>

<BR>

Step 8: Attach the Policy to the Role
Run below command on your local machine:

```
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::<your_account>:policy/GitHubActionsPolicy
```

## Deployment - Trigger Github Actions workflow manually
* Update .github/workflows/main.yaml playbook to assume your account GitHubActionsRole, alternatively update GithubActions Environments `AWS_ACCOUNT` to your aws account.
* Go to my project repository via browser. https://github.com/hihinsonli/01PROJECT-Serverless-User-API
* Switch to Actions tab.
* Select `Serverless Deploy and Remove` workflow on left menu
* Click `Run workflow` dropdown on the right and select `main` for deployment branch, input stage name and aws region for deployment, and select `deploy` from `Action to perform (deploy or remove)` dropdown
* Click `Run workflow`.

<BR>

Sample Deploy workflow run: https://github.com/hihinsonli/01PROJECT-Serverless-User-API/actions/runs/14791134467/job/41528347354

## Results Validation

#### You shall see the API endpoint for sending HTTP GET/POST request 
![API Endpoint](results/output.jpg)

#### Run below commands to add some dummy users into DynamoDB table
```
curl -X POST <API-Endpoint-you-retrieved-from-Github-Actions-output> \
  -H "Content-Type: application/json" \
  -d '{"id": "1", "name": "Hinson", "email": "contactme@hinsonli.com"}'

curl -X POST <API-Endpoint-you-retrieved-from-Github-Actions-output> \
  -H "Content-Type: application/json" \
  -d '{"id": "2", "name": "Ray", "email": "ray.li@hinsonli.com"}'

curl -X POST <API-Endpoint-you-retrieved-from-Github-Actions-output> \
  -H "Content-Type: application/json" \
  -d '{"id": "3", "name": "Altair", "email": "altair@hinsonli.com"}'
```

#### Run below command to query user's infomation
```
curl -X GET <API-Endpoint-you-retrieved-from-Github-Actions-output>
```

#### Sample results
![Sample Results](results/http_requests.jpg)


## Resources Cleanup
* Go to my project repository via browser. https://github.com/hihinsonli/01PROJECT-Serverless-User-API
* Switch to Actions tab.
* Select `Serverless Deploy and Remove` workflow on left menu
* Click `Run workflow` dropdown on the right and select `main` for deployment branch, input stage name and aws region for deployment, and select `remove` from `Action to perform (deploy or remove)` dropdown
* Click `Run workflow`.
<BR>
Sample remove workflow run: https://github.com/hihinsonli/01PROJECT-Serverless-User-API/actions/runs/14791611609/job/41529788314

* Export AWS access token locally on your machine so that you can destroy AWS resources via AWS CLI
* Run below commands to cleanup Github Actions Access IAM policy/role
```
aws iam detach-role-policy --role-name GitHubActionsRole --policy-arn arn:aws:iam::<your_account>:policy/GitHubActionsPolicy
aws iam delete-role --role-name GitHubActionsRole
aws iam delete-policy --policy-arn arn:aws:iam::<your_account>:policy/GitHubActionsPolicy
```
* Delete the OIDC Provider by running
```
 aws iam delete-open-id-connect-provider \
  --open-id-connect-provider-arn arn:aws:iam::<your_account>:oidc-provider/token.actions.githubusercontent.com
```
