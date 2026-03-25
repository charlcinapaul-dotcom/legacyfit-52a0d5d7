
## Add `refetchOnWindowFocus: false` to QueryClient

Single-line change in `src/App.tsx`.

**File:** `src/App.tsx` — line 36, after `retry: 1,`

Add:
```ts
refetchOnWindowFocus: false,
```

Result:
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

That's the entire change. One line, one file.
