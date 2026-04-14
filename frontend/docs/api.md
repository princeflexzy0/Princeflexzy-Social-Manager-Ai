# API Integration Guide

This document outlines how to integrate with the Default Automation Frontend's API endpoints.

## Authentication

All API requests must include an `Authorization` header with a valid JWT token:

```typescript
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Error Handling

API responses follow this structure:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
```

Example usage:

```typescript
import { apiFetch } from '@/lib/api';

try {
  const response = await apiFetch<UserData>('/users/me');
  // Handle success
} catch (error) {
  // Handle error
}
```

## Endpoints

### Authentication

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Users

- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Posts

- `GET /posts`
- `POST /posts`
- `PUT /posts/:id`
- `DELETE /posts/:id`

### Analytics

- `GET /analytics/overview`
- `GET /analytics/users`
- `GET /analytics/posts`