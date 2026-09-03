import { useId, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_EDGE = 1920;

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file) {
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return readAsDataUrl(file);
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.84);
}

export async function storeImageFile(file) {
  if (!file?.type?.startsWith("image/")) throw new Error("请选择图片文件");
  if (file.size > MAX_FILE_SIZE) throw new Error("单张图片不能超过 10MB");
  return compressImage(file);
}

export function ImageUploadField({ label, value, onChange, className = "", hint = "支持 JPG、PNG、WebP、GIF、SVG，单张不超过 10MB" }) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function selectFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await storeImageFile(file));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "图片处理失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`media-upload-field ${className}`.trim()}>
      <span className="media-upload-label">{label}</span>
      <div className="media-upload-control">
        <div className={`media-upload-preview ${value ? "has-image" : ""}`}>
          {value ? <img src={value} alt="上传预览" /> : <span>暂无图片</span>}
        </div>
        <div className="media-upload-actions">
          <input value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder="图片路径或URL" />
          <div>
            <label className="admin-button primary media-file-button" htmlFor={inputId}>
              {busy ? "处理中…" : "选择图片"}
            </label>
            <input id={inputId} className="media-file-input" type="file" accept="image/*" onChange={selectFile} disabled={busy} />
            {value && <button className="admin-button ghost" type="button" onClick={() => onChange("")}>清除</button>}
          </div>
          <small>{error || hint}</small>
        </div>
      </div>
    </div>
  );
}
