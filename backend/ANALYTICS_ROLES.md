# Role-Based Analytics Access

This document describes the implementation of role-based access control for analytics endpoints in the LMS system.

## Overview

The analytics system now implements role-based access where:
- **Admins** can see all analytics data across the entire platform
- **Instructors** can only see analytics for their own courses
- **Students** have limited access to their own progress data

## Implementation Details

### 1. Current User Decorator

A new decorator `@CurrentUser()` has been created to extract the authenticated user from the request:

```typescript
// backend/src/common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserResponse => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### 2. Analytics Controller Updates

All analytics endpoints now accept the current user as a parameter:

```typescript
@Get('dashboard')
@Roles('ADMIN', 'INSTRUCTOR')
async getDashboardStats(@CurrentUser() user: UserResponse) {
  return await this.analyticsService.getDashboardStats(user);
}
```

### 3. Analytics Service Role-Based Logic

The service implements different filtering logic based on user roles:

#### Dashboard Statistics
- **Admin**: Sees all users, courses, enrollments, and revenue
- **Instructor**: Sees only users enrolled in their courses, their own courses, enrollments in their courses, and revenue from their courses

#### Course Enrollment Statistics
- **Admin**: Sees enrollment stats for all courses
- **Instructor**: Sees enrollment stats only for their own courses

#### Instructor Statistics
- **Admin**: Can view stats for any instructor
- **Instructor**: Can only view their own stats

#### Student Progress
- **Admin**: Can view progress for any student
- **Instructor**: Can only view progress for students enrolled in their courses
- **Student**: Can only view their own progress

## API Endpoints

### Dashboard Analytics
```
GET /analytics/dashboard
```
**Access**: ADMIN, INSTRUCTOR
**Behavior**: 
- Admin sees platform-wide statistics
- Instructor sees statistics for their courses only

### User Role Statistics
```
GET /analytics/users/roles
```
**Access**: ADMIN only
**Behavior**: Shows distribution of users by role

### Course Enrollment Statistics
```
GET /analytics/courses/enrollment-stats
```
**Access**: ADMIN, INSTRUCTOR
**Behavior**:
- Admin sees enrollment stats for all courses
- Instructor sees enrollment stats for their courses only

### Instructor Statistics
```
GET /analytics/instructor/:instructorId
```
**Access**: ADMIN, INSTRUCTOR
**Behavior**:
- Admin can view any instructor's stats
- Instructor can only view their own stats

### Student Progress
```
GET /analytics/student/:studentId/progress
```
**Access**: ADMIN, INSTRUCTOR, STUDENT
**Behavior**:
- Admin can view any student's progress
- Instructor can view progress for students in their courses
- Student can only view their own progress

## Security Features

1. **Role Validation**: Each endpoint validates the user's role before processing
2. **Data Filtering**: Queries are filtered based on user permissions
3. **Access Control**: Users cannot access data they're not authorized to see
4. **Error Handling**: Proper error messages for unauthorized access attempts

## Testing

A test script has been created to verify the role-based access:

```bash
node test-analytics-roles.js
```

This script tests:
- Login with different user roles
- Access to various analytics endpoints
- Proper error handling for unauthorized access
- Data filtering based on user permissions

## Database Queries

The implementation uses Prisma queries with conditional `where` clauses:

```typescript
// Example: Instructor dashboard stats
const totalUsers = await this.prisma.user.count({
  where: {
    coursesEnrolled: {
      some: {
        course: {
          instructorId: user.id,
        },
      },
    },
  },
});
```

## Error Handling

The system throws `ForbiddenException` when:
- A user tries to access data they're not authorized to see
- An instructor tries to view another instructor's stats
- A student tries to view another student's progress

## Future Enhancements

Potential improvements could include:
1. Caching analytics data for better performance
2. More granular permissions (e.g., course-specific analytics)
3. Real-time analytics updates
4. Export functionality for analytics data
5. Custom date range filtering for analytics 