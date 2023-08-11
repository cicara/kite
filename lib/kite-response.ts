export class KiteResponse<T = any> extends Response {
  public data?: T;

  public getContentType() {
    return this.headers.get("content-type")?.split(";")[0].trim();
  }

  public static async fromResponse<T = any>(response: Response): Promise<KiteResponse<T>> {
    const kr = new KiteResponse(response.body, response);

    switch (kr.getContentType()) {
      case "text/plain":
      case "text/html":
      case "image/svg+xml": {
        kr.data = await response.clone().text();
        break;
      }
      case "application/json": {
        kr.data = await response.clone().json();
        break;
      }
    }

    return kr;
  }
}
