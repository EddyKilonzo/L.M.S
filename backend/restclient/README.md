# LMS API Testing with REST Client

This folder contains HTTP request files for testing all endpoints of the LMS API using REST Client extension in VS Code.

## Prerequisites

1. **VS Code REST Client Extension**: Install the "REST Client" extension in VS Code
2. **Server Running**: Make sure your NestJS server is running on `http://localhost:3000`
3. **Database**: Ensure your database is properly set up and migrated

## Files Overview

### Individual Module Tests
- `auth.http` - Authentication endpoints (register, login, verification, password reset)
- `users.http` - User management endpoints (CRUD operations)
- `courses.http` - Course management endpoints (CRUD operations)
- `content.http` - Content management endpoints (modules and lessons)
- `enrollments.http` - Enrollment and progress tracking endpoints
- `quizzes.http` - Quiz creation and submission endpoints
- `analytics.http` - Analytics and reporting endpoints

### Complete Workflow Test
- `workflow-test.http` - Complete end-to-end workflow from registration to course completion

## How to Use

### 1. Using Individual Test Files

1. Open any `.http` file in VS Code
2. Click the "Send Request" link above each request
3. View the response in the split panel

### 2. Using the Complete Workflow

1. Open `workflow-test.http`
2. Run requests in sequence (top to bottom)
3. The file uses variables to pass data between requests
4. Replace placeholder values (like verification codes) with actual values from responses

### 3. Authentication Flow

For protected endpoints, you need to:

1. **Register a user** using `POST /auth/register`
2. **Verify email** using the code from the registration response
3. **Login** to get an access token
4. **Use the token** in the `Authorization: Bearer <token>` header

### 4. Testing Different User Roles

- **STUDENT**: Can enroll in courses, take quizzes, track progress
- **INSTRUCTOR**: Can create courses, content, and quizzes
- **ADMIN**: Can access all endpoints and analytics

## Important Notes

### Email Verification
- After registration, users receive a 5-digit verification code
- The code expires in 10 minutes
- Replace `"code": "12345"` with the actual code from the registration response

### Access Tokens
- Login responses include an `access_token`
- Use this token in the `Authorization` header for protected endpoints
- Format: `Authorization: Bearer <your-access-token>`

### IDs and References
- Many requests require IDs from previous responses
- The workflow test uses variables to automatically pass these IDs
- For individual tests, replace placeholder IDs with actual values

## Example Testing Sequence

1. **Start with auth.http**:
   - Register a user
   - Verify email with the received code
   - Login to get access token

2. **Test courses.http** (as instructor):
   - Create courses using the instructor's access token

3. **Test content.http** (as instructor):
   - Create modules and lessons for the courses

4. **Test enrollments.http** (as student):
   - Enroll in courses
   - Track progress

5. **Test quizzes.http**:
   - Create quizzes (instructor)
   - Take quizzes (student)

6. **Test analytics.http**:
   - View analytics and reports

## Error Testing

Each file includes requests that should fail:
- Invalid data
- Non-existent resources
- Unauthorized access
- Missing authentication

## Tips

1. **Use the workflow test** for a complete user journey
2. **Check response status codes** to verify error handling
3. **Test with different user roles** to verify authorization
4. **Use unique emails** for each test to avoid conflicts
5. **Save response data** for use in subsequent requests

## Troubleshooting

- **500 errors**: Check server logs for detailed error messages
- **401 errors**: Ensure you're using a valid access token
- **404 errors**: Verify the endpoint URL and resource IDs
- **Validation errors**: Check the request body format and required fields 