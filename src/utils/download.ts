import api from "../api/client";

export async function downloadByGet(url: string, params: any, filename: string) {
  const resp = await api.get(url, { params, responseType: "blob" });
  const blob = new Blob([resp.data]);
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

