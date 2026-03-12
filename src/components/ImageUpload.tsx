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

  const fileList = useMemo(() => {
    if (!props.value) return [];
    return [
      {
        uid: "-1",
        name: "image",
        status: "done" as const,
        url: props.value
      }
    ];
  }, [props.value]);

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
        props.onChange?.(data.url);
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

