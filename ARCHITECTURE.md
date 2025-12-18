# Architecture

This application is a "serverless" REST API for managing household chores.
It utilizes AWS-managed services to provide a simple and scalable backend.

---

## DynamoDB (Datastore)

- **Table name:** `chore-app-items`
- **Partition key:** `id` (UUID)
- **Purpose:** Stores chore records with flexible attributes
- **Notes:** UUIDs are generated server-side; timestamps are server-generated

---

## Lambda Function (Compute)

- **Function name:** `chore-app-function`
- **Runtime:** Python
- **Role name:** `chore-app-role`
- **Role policy template:** `Simple microservice permissions`
- **Responsibility:**
  - Handle all API routes
  - Generate UUIDs and timestamps
  - Perform CRUD operations on DynamoDB
  - Return JSON responses

---

## API Gateway (IPv4 HTTP API)

- **API name:** `chore-app-api`
- **Protocol:** HTTP (IPv4)

### Routes
- `GET /items`
- `GET /items/{id}`
- `PUT /items`
- `DELETE /items/{id}`

### Integration
- All routes integrate with `chore-app-function` (Lambda)

---

## Data Flow

1. Client sends an HTTP request
2. API Gateway routes the request
3. Lambda processes the request
4. DynamoDB stores or retrieves data
5. Lambda returns a JSON response

---

## Testing

The API is tested manually using Insomnia.

See:
- `TESTING.md`
- Exported Insomnia v5 collection
