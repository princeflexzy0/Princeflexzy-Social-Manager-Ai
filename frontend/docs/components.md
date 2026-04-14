# Component Library Documentation

This document provides an overview of the reusable components available in the Default Automation Frontend.

## Overview

Our component library is built on top of shadcn/ui, providing a consistent design system across the application.

## Core Components

### Button

```typescript
import { Button } from "@/components/ui/button"

<Button variant="default" size="default">
  Click me
</Button>
```

Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
Sizes: `default`, `sm`, `lg`, `icon`

### Input

```typescript
import { Input } from "@/components/ui/input"

<Input type="email" placeholder="Email" />
```

### Card

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
  <CardFooter>
    Footer
  </CardFooter>
</Card>
```

## Layout Components

### Sidebar

```typescript
import { Sidebar } from "@/components/Sidebar"

<Sidebar items={[
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon
  }
]} />
```

### Topbar

```typescript
import { Topbar } from "@/components/Topbar"

<Topbar user={currentUser} />
```

## Data Display

### DataTable

```typescript
import { DataTable } from "@/components/DataTable"

<DataTable
  columns={columns}
  data={data}
  searchKey="name"
  pagination
/>
```

### Chart

```typescript
import { Chart } from "@/components/ui/chart"

<Chart
  type="line"
  data={chartData}
  options={chartOptions}
/>
```

## Form Components

### Form

```typescript
import { Form } from "@/components/ui/form"

<Form
  onSubmit={handleSubmit}
  defaultValues={defaultValues}
>
  {/* Form fields */}
</Form>
```

## Hooks

### useMobile

```typescript
import { useMobile } from "@/hooks/use-mobile"

const isMobile = useMobile()
```

### useToast

```typescript
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()
toast.success("Operation successful")