# chore-app

Household chore timers app that doubles as an AWS SAA-aligned reference architecture.

Use managed AWS services with clear boundaries:

- React SPA
- Amplify
- API Gateway
- Lambda
- DynamoDB (single-table, household-scoped data)

## Build: REST API -> Lamda -> DynamoDB

https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-dynamo-db.html

> [Clean up](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-dynamo-db.html#http-api-dynamo-db-cleanup)

## Build: React UI

`npm create vite@latest chore-app-ui -- --template react-ts`

## Deploy: React UI to Amplify

https://docs.aws.amazon.com/amplify/latest/userguide/getting-started-next.html

## Network Diagram

<img width="762" height="305" alt="ChoresTimerAWSReactApp" src="https://github.com/user-attachments/assets/fb69c597-97d3-4431-bfe0-a498d0c58113" />
