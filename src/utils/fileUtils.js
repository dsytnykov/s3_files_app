export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const isImage = (filename) => {
  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "svg",
    "tiff",
    "tif",
  ];
  const ext = filename.split(".").pop().toLowerCase();

  return imageExtensions.includes(ext);
};

export const getFileIcon = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();

  const iconMap = {
    pdf: "file-pdf",
    doc: "file-word",
    docx: "file-word",
    xls: "file-excel",
    xlsx: "file-excel",
    ppt: "file-powerpoint",
    pptx: "file-powerpoint",
    zip: "file-archive",
    rar: "file-archive",
    tar: "file-archive",
    gz: "file-archive",
    txt: "file-text",
    jpg: "file-image",
    jpeg: "file-image",
    png: "file-image",
    gif: "file-image",
    bmp: "file-image",
    webp: "file-image",
    svg: "file-image",
    mp4: "file-video",
    avi: "file-video",
    mkv: "file-video",
    mp3: "file-audio",
    wav: "file-audio",
  };

  return iconMap[ext] || "file";
};

export const getThumbnailUrl = (file, s3Service) => {
  if (isImage(file.name)) {
    return s3Service.getThumbnail(file.path);
  }

  return null;
};

export const getFolderName = (path) => {
  if (!path) return "";

  const cleanPath = path.endsWith("/") ? path.slice(0, -1) : path;

  const parts = cleanPath.split("/");
  return parts[parts.length - 1];
};

export const getParentPath = (path) => {
  if (!path) return "";

  const cleanPath = path.endsWith("/") ? path.slice(0, -1) : path;

  const lastSlashIndex = cleanPath.lastIndexOf("/");
  if (lastSlashIndex <= 0) return "";

  return cleanPath.substring(0, lastSlashIndex + 1);
};

export const isValidFileName = (name) => {
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  return !invalidChars.test(name) && name.trim() !== "";
};

export const generateUniqueFileName = (existingFiles, baseName) => {
  const existingNames = existingFiles.map((file) => file.name);

  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  const nameParts = baseName.split(".");
  const extension = nameParts.pop();
  const nameWithoutExt = nameParts.join(".");

  let counter = 1;
  let newName = `${nameWithoutExt} (${counter}).${extension}`;

  while (existingNames.includes(newName)) {
    counter++;
    newName = `${nameWithoutExt} (${counter}).${extension}`;
  }

  return newName;
};

///////// Add these functions to src/utils/fileUtils.js

export const isTextFile = (filename) => {
  const textExtensions = [
    "txt",
    "md",
    "log",
    "json",
    "csv",
    "xml",
    "html",
    "css",
    "js",
    "jsx",
    "ts",
    "tsx",
    "py",
    "java",
    "c",
    "cpp",
    "h",
    "rb",
    "php",
  ];
  const ext = filename.split(".").pop().toLowerCase();

  return textExtensions.includes(ext);
};

export const isPdfFile = (filename) => {
  return filename.split(".").pop().toLowerCase() === "pdf";
};

export const isCodeFile = (filename) => {
  const codeExtensions = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "py",
    "java",
    "c",
    "cpp",
    "h",
    "rb",
    "php",
    "go",
    "rust",
    "sql",
  ];
  const ext = filename.split(".").pop().toLowerCase();

  return codeExtensions.includes(ext);
};

export const isOfficeFile = (filename) => {
  const officeExtensions = [
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "odt",
    "ods",
    "odp",
  ];
  const ext = filename.split(".").pop().toLowerCase();

  return officeExtensions.includes(ext);
};

export const isVideoFile = (filename) => {
  const videoExtensions = [
    "mp4",
    "webm",
    "mov",
    "avi",
    "wmv",
    "flv",
    "mkv",
    "m4v",
    "mpeg",
    "mpg",
  ];
  const ext = filename.split(".").pop().toLowerCase();

  return videoExtensions.includes(ext);
};
