type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type ResponseType = "json" | "blob" | "text";

interface FetchOptions<T = any> {
  method?: HttpMethod; // 请求方法
  headers?: Record<string, string>; // 请求头
  body?: T; // 请求体
  params?: Record<string, string | number>; // 查询参数
  timeout?: number; // 超时时间（毫秒）
  responseType?: ResponseType; // 响应类型
}

interface FetchResponse<T = any> {
  status: number; // HTTP 状态码
  data: T; // 响应数据
  headers: Headers; // 响应头
}

export class FetchWrapper {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(
    url: string,
    params?: Record<string, string | number>
  ): string {
    if (!params) return url;
    const query = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return `${url}?${query}`;
  }

  private async request<T = any, R = any>(
    url: string,
    options: FetchOptions<T> = {}
  ): Promise<FetchResponse<R>> {
    const {
      method = "GET",
      headers = {},
      body,
      params,
      timeout,
      responseType = "json",
    } = options;
    const fullUrl = this.buildUrl(this.baseUrl + url, params);

    const controller = new AbortController();
    const signal = controller.signal;

    if (timeout) {
      setTimeout(() => controller.abort(), timeout);
    }

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("floatingPanelToken")}`,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });

      let responseData: any;
      if (responseType === "json") {
        responseData = await response.json();
      } else if (responseType === "blob") {
        responseData = await response.blob();
      } else if (responseType === "text") {
        responseData = await response.text();
      } else {
        throw new Error(`Unsupported responseType: ${responseType}`);
      }

      return {
        status: response.status,
        data: responseData,
        headers: response.headers,
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out");
      }
      throw new Error(`Fetch request failed: ${error.message}`);
    }
  }

  public get<R = any>(
    url: string,
    params?: Record<string, string | number>,
    headers?: Record<string, string>,
    timeout?: number,
    responseType?: ResponseType
  ) {
    return this.request<void, R>(url, {
      method: "GET",
      params,
      headers,
      timeout,
      responseType,
    });
  }

  public post<T = any, R = any>(
    url: string,
    body?: T,
    headers?: Record<string, string>,
    timeout?: number,
    responseType?: ResponseType
  ) {
    return this.request<T, R>(url, {
      method: "POST",
      body,
      headers,
      timeout,
      responseType,
    });
  }

  public put<T = any, R = any>(
    url: string,
    body?: T,
    headers?: Record<string, string>,
    timeout?: number,
    responseType?: ResponseType
  ) {
    return this.request<T, R>(url, {
      method: "PUT",
      body,
      headers,
      timeout,
      responseType,
    });
  }

  public delete<R = any>(
    url: string,
    headers?: Record<string, string>,
    timeout?: number,
    responseType?: ResponseType
  ) {
    return this.request<void, R>(url, {
      method: "DELETE",
      headers,
      timeout,
      responseType,
    });
  }
}
