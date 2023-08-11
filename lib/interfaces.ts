export type BodyType = FormData | object | string;
export type InputType = string | URL | Request;

export type BodySerializer = (body: any) => any;
export type ParamsSerializer = (params: any) => string;

export type Interceptor = (request: Request, next: typeof fetch) => Promise<Response>;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: any;
  interceptors?: Array<Interceptor>;
  responseType?: "json" | "text" | "blob" | "response";
}
