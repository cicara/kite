# Kite

kite is tiny fetch wrapper.

- kite.js `3.48 kB`, gzip `1.25 kB`
- kite.umd.cjs `2.80 kB`, gzip `1.19 kB`

## Installation

```shell
npm install @cicara/kite
# or
pnpm add @cicara/kite
# or
yarn add @cicara/kite
```

## How to use

```ts
import { Kite, KiteResponse } from "@cicara/kite";

const kite = new Kite({
  interceptors: [
    (request, next) => {
      return next(request);
    },
  ],
  paramsSerializer: (params) => {
    return new URLSearchParams(params).toString();
  },
});

try {
  const data = await kite.get("/api/some/path", {
    params: {
      _t: Date.now(),
      id: "some-id",
    },
  });
  console.log(data);
} catch (err) {
  if (err instanceof KiteResponse) {
    console.log(err.status);
  }
  console.error(err);
}
```
