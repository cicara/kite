import { KiteResponse } from "./kite-response";
import { defaultBodySerializers } from "./body-serializers";
import { defaultParamsSerializer } from "./params-serializer";
import type { Interceptor, InputType, BodyType, RequestOptions, ParamsSerializer, BodySerializer } from "./interfaces";

export interface Options {
  fetch: typeof fetch;
  baseURL?: string;
  interceptors: Array<Interceptor>;
  bodySerializers: Record<string, BodySerializer>;
  paramsSerializer: ParamsSerializer;
}

export class Kite {
  public options: Options;

  constructor(init?: Partial<Options>) {
    this.options = {
      fetch: globalThis.fetch,
      baseURL: document.baseURI,
      interceptors: [],
      bodySerializers: {
        ...defaultBodySerializers,
        ...init?.bodySerializers,
      },
      paramsSerializer: defaultParamsSerializer,
      ...init,
    };
  }

  public get<T>(url: InputType, options?: RequestOptions & { responseType?: "json" }): Promise<T>;

  public get(url: InputType, options: RequestOptions & { responseType: "text" }): Promise<string>;

  public get(url: InputType, options: RequestOptions & { responseType: "blob" }): Promise<Blob>;

  public get(url: InputType, options: RequestOptions & { responseType: "response" }): Promise<KiteResponse>;

  public get(url: InputType, options?: RequestOptions): Promise<any> {
    return this.request<any>(url, { ...options, method: "GET" } as any);
  }

  public put<T>(url: InputType, body?: BodyType, options?: RequestOptions): Promise<T>;

  public put(url: InputType, body?: BodyType, options?: RequestOptions & { responseType: "text" }): Promise<string>;

  public put(url: InputType, body?: BodyType, options?: RequestOptions & { responseType: "blob" }): Promise<Blob>;

  public put(
    url: InputType,
    body?: BodyType,
    options?: RequestOptions & { responseType: "response" }
  ): Promise<KiteResponse>;

  public put(url: InputType, body?: BodyType, options?: RequestOptions) {
    return this.request<any>(url, { ...options, method: "PUT", body } as any);
  }

  public post<T>(url: InputType, body?: BodyType, options?: RequestOptions): Promise<T>;

  public post(url: InputType, body?: BodyType, options?: RequestOptions & { responseType: "text" }): Promise<string>;

  public post(url: InputType, body?: BodyType, options?: RequestOptions & { responseType: "blob" }): Promise<Blob>;

  public post(
    url: InputType,
    body?: BodyType,
    options?: RequestOptions & { responseType: "response" }
  ): Promise<KiteResponse>;

  public post(url: InputType, body?: BodyType, options?: RequestOptions) {
    return this.request<any>(url, { ...options, method: "POST", body } as any);
  }

  public patch<T>(url: InputType, body?: BodyType, options?: RequestOptions): Promise<T>;

  public patch(url: InputType, body?: BodyType, options?: RequestOptions & { responseType: "text" }): Promise<string>;

  public patch(url: InputType, body?: BodyType, options?: RequestOptions & { responseType: "blob" }): Promise<Blob>;

  public patch(
    url: InputType,
    body?: BodyType,
    options?: RequestOptions & { responseType: "response" }
  ): Promise<KiteResponse>;

  public patch(url: InputType, body?: BodyType, options?: RequestOptions) {
    return this.request<any>(url, { ...options, method: "PATCH", body } as any);
  }

  public delete<T>(url: InputType, options?: RequestOptions & { responseType?: "json" }): Promise<T>;

  public delete(url: InputType, options: RequestOptions & { responseType: "text" }): Promise<string>;

  public delete(url: InputType, options: RequestOptions & { responseType: "blob" }): Promise<Blob>;

  public delete(url: InputType, options: RequestOptions & { responseType: "response" }): Promise<KiteResponse>;

  public delete(url: InputType, options?: RequestOptions): Promise<any> {
    return this.request<any>(url, { ...options, method: "DELETE" } as any);
  }

  public async request<T>(
    input: InputType,
    options?: RequestOptions & { body?: BodyType; responseType?: "json" }
  ): Promise<T>;

  public async request(
    input: InputType,
    options: RequestOptions & { body?: BodyType; responseType: "text" }
  ): Promise<string>;

  public async request(
    input: InputType,
    options: RequestOptions & { body?: BodyType; responseType: "blob" }
  ): Promise<Blob>;

  public async request(
    input: InputType,
    options: RequestOptions & { body?: BodyType; responseType: "response" }
  ): Promise<KiteResponse>;

  public async request(
    input: InputType,
    options: RequestOptions & { body?: BodyType } = { responseType: "json" }
  ): Promise<any> {
    const { body, params, ...restOptions } = options;

    let req: Request;
    if (typeof input === "string") {
      const url = this.updateURLParams(new URL(input, this.options.baseURL), params);
      req = new Request(url, { ...restOptions });
    } else if (input instanceof URL) {
      const url = this.updateURLParams(input, params);
      req = new Request(url, { ...restOptions });
    } else {
      const url = this.updateURLParams(new URL(input.url), params);
      req = new Request(new Request(url, input), { ...restOptions });
    }

    if (body) {
      if (body instanceof FormData || body instanceof Blob) {
        req = new Request(req, { body });
      } else if (typeof body === "object") {
        const contentType = req.headers.get("content-type")?.split(";")[0] ?? "application/json";
        const bodySerializer = this.options.bodySerializers[contentType];
        if (!bodySerializer) {
          throw new Error(`no body serializer for content type "${contentType}"`);
        }
        req = new Request(req, { body: bodySerializer(body), headers: { "content-type": contentType } });
      }
    }

    // req = this.setRequestBody(req, body);

    const fetch = [...this.options.interceptors, ...(options.interceptors ?? [])].reduce((next, interceptor) => {
      return async function newFetch(input: InputType, init?: RequestInit) {
        const request = new Request(input, init);
        return await interceptor(request, next);
      };
    }, this.options.fetch);

    const response = await fetch(req);

    if (!response.ok) {
      throw await KiteResponse.fromResponse(response);
    }

    switch (options?.responseType) {
      case "text": {
        return await response.text();
      }
      case "blob": {
        return await response.blob();
      }
      case "response": {
        return await KiteResponse.fromResponse(response);
      }
      case "json":
      default: {
        const text = await response.text();
        if (text) {
          return JSON.parse(text);
        } else {
          return null;
        }
      }
    }
  }

  /**
   * append additional params to request
   */
  private updateURLParams(url: URL, params?: any): URL {
    url.search += (url.search ? "&" : "") + this.options.paramsSerializer(params);
    return url;
  }
}
