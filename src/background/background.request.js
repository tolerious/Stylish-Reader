import axios from "axios";
import { baseUrl } from "./constants";
import { getLoginToken } from "./background.utils";

class HttpClient {
  constructor(baseURL = baseUrl, timeout = 10000) {
    // 创建 axios 实例
    this.instance = axios.create({
      baseURL, // 基础 URL
      timeout, // 超时时间
    });

    // 请求拦截器
    this.instance.interceptors.request.use(
      async (config) => {
        // 在发送请求之前可以做一些处理，比如添加 token
        const token = await getLoginToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        // 对响应数据做一些处理
        return response.data;
      },
      (error) => {
        // 对响应错误做一些处理
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET 请求
   * @param {string} url 请求地址
   * @param {object} params 请求参数
   * @param {object} config 请求配置
   * @returns {Promise}
   */
  get(url, params = {}, config = {}) {
    return this.instance.get(url, { params, ...config });
  }

  /**
   * POST 请求
   * @param {string} url 请求地址
   * @param {object} data 请求体数据
   * @param {object} config 请求配置
   * @returns {Promise}
   */
  post(url, data = {}, config = {}) {
    return this.instance.post(url, data, config);
  }

  /**
   * PUT 请求
   * @param {string} url 请求地址
   * @param {object} data 请求体数据
   * @param {object} config 请求配置
   * @returns {Promise}
   */
  put(url, data = {}, config = {}) {
    return this.instance.put(url, data, config);
  }

  /**
   * DELETE 请求
   * @param {string} url 请求地址
   * @param {object} config 请求配置
   * @returns {Promise}
   */
  delete(url, config = {}) {
    return this.instance.delete(url, config);
  }

  /**
   * 获取 Blob 数据
   * @param {string} url 请求地址
   * @param {object} params 请求参数
   * @param {object} config 请求配置
   * @returns {Promise<Blob>}
   */
  getBlob(url, params = {}, config = {}) {
    return this.instance.get(url, {
      params,
      ...config,
      responseType: "blob", // 指定响应类型为 Blob
    });
  }

  /**
   * 发送 POST 请求并获取 Blob 数据
   * @param {string} url 请求地址
   * @param {object} data 请求体数据
   * @param {object} config 请求配置
   * @returns {Promise<Blob>}
   */
  postBlob(url, data = {}, config = {}) {
    return this.instance.post(url, data, {
      ...config,
      responseType: "blob", // 指定响应类型为 Blob
    });
  }
}

// // 示例：创建一个实例并导出
// const baseURL = "https://api.example.com"; // 替换为你的 API 地址
// const httpClient = new HttpClient(baseURL);

export default HttpClient;
