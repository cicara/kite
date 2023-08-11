import type { BodySerializer } from "./interfaces";

export const defaultBodySerializers: Record<string, BodySerializer> = {
  "application/json": (body) => JSON.stringify(body),
  "application/x-www-form-urlencoded": (body) => new URLSearchParams(body).toString(),
};
