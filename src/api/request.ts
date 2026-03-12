import { message } from "antd";
import api, { ApiResponse } from "./client";

export class BizError extends Error {
  code: number;
  constructor(code: number, msg: string) {
    super(msg);
    this.code = code;
  }
}

function showOnce(key: string, content: string) {
  message.error({ content, key, duration: 2 });
}

export async function getData<T>(url: string, params?: any): Promise<T> {
  const resp = await api.get<ApiResponse<T>>(url, { params });
  if (resp.data?.code !== 0) {
    showOnce(`biz_${url}`, resp.data?.msg || "请求失败");
    throw new BizError(resp.data?.code ?? -1, resp.data?.msg || "请求失败");
  }
  return resp.data.data;
}

export async function postData<T>(url: string, body?: any): Promise<T> {
  const resp = await api.post<ApiResponse<T>>(url, body ?? {});
  if (resp.data?.code !== 0) {
    showOnce(`biz_${url}`, resp.data?.msg || "请求失败");
    throw new BizError(resp.data?.code ?? -1, resp.data?.msg || "请求失败");
  }
  return resp.data.data;
}

export async function postFormData<T>(url: string, formData: FormData): Promise<T> {
  const resp = await api.post<ApiResponse<T>>(url, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (resp.data?.code !== 0) {
    showOnce(`biz_${url}`, resp.data?.msg || "请求失败");
    throw new BizError(resp.data?.code ?? -1, resp.data?.msg || "请求失败");
  }
  return resp.data.data;
}

