import { Upload, message } from "antd";
import type { UploadProps } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { endpoints } from "../api/endpoints";
import { postFormData } from "../api/request";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
};

export default function ImageUpload(props: Props) {
  const [loading, setLoading] = useState(false);
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  const normalizeImageUrl = (raw?: string) => {
    if (!raw) return "";
    // 已是绝对地址时直接返回
    if (/^https?:\/\//i.test(raw)) return raw;
    // 后端返回 /static/uploads/xxx 时，拼接 API 域名，避免走 5173
    if (raw.startsWith("/")) return `${apiBase}${raw}`;
    return `${apiBase}/${raw}`;
  };

  const fileList = useMemo(() => {
    if (!props.value) return [];
    return [
      {
        uid: "-1",
        name: "image",
        status: "done" as const,
        url: normalizeImageUrl(props.value)
      }
    ];
  }, [props.value, apiBase]);

  const uploadProps: UploadProps = {
    listType: "picture-card",
    maxCount: 1,
    accept: "image/*",
    fileList,
    onRemove: () => {
      props.onChange?.("");
      return true;
    },
    customRequest: async (options) => {
      try {
        setLoading(true);
        const fd = new FormData();
        fd.append("file", options.file as File);
        const data = await postFormData<{ url: string }>(endpoints.uploadImage, fd);
        // 存储绝对 URL，确保 admin/mobile 前端都可直接访问
        props.onChange?.(normalizeImageUrl(data.url));
        options.onSuccess?.(data, options.file as any);
      } catch (e: any) {
        message.error(e?.message || "上传失败");
        options.onError?.(e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Upload {...uploadProps}>
      {props.value ? null : (
        <div>
          {loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div style={{ marginTop: 8 }}>上传</div>
        </div>
      )}
    </Upload>
  );
}

