import { fetchAuthSession } from "aws-amplify/auth";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Service {
  constructor(config) {
    this.region = config.region || "us-east-1";
    this.bucket = config.bucket;
    this.authService = config.authService;
    this.s3Client = null;
  }

  async getUserPrefix() {
    const userId = await this.authService.getUserId();
    if (!userId) {
      throw new Error("User is not authenticated");
    }
    return `${userId}/`;
  }

  async addUserPrefix(key) {
    const userPrefix = await this.getUserPrefix();
    return key ? `${userPrefix}${key}` : userPrefix;
  }

  async removeUserPrefix(key) {
    const userPrefix = await this.getUserPrefix();
    if (key.startsWith(userPrefix)) {
      return key.slice(userPrefix.length);
    }
    return key;
  }

  async getS3Client() {
    if (this.s3Client) {
      return this.s3Client;
    }

    try {
      console.log("Creating new S3 client...");

      const { credentials } = await fetchAuthSession();
      console.log(
        "Fetched auth session: credentials available:",
        !!credentials
      );

      if (!credentials) {
        throw new Error("No credentials available from Amplify Auth session");
      }

      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken,
        },
      });

      console.log("S3 client created successfully with credentials");
      return this.s3Client;
    } catch (error) {
      console.error("Error creating S3 client:", error);
      throw new Error(`Failed to initialize S3 client: ${error.message}`);
    }
  }

  async stripUserPrefixFromPath(s3Path) {
    const userPrefix = await this.getUserPrefix();
    if (s3Path && s3Path.startsWith(userPrefix)) {
      return s3Path.substring(userPrefix.length);
    }
    return s3Path || "";
  }

  async addUserPrefixToPath(uiPath) {
    const userPrefix = await this.getUserPrefix();
    if (uiPath && uiPath.startsWith(userPrefix)) {
      return uiPath;
    }
    return `${userPrefix}${uiPath || ""}`;
  }

  async listObjects(uiPath = "") {
    try {
      const s3Client = await this.getS3Client();

      const s3Path = await this.addUserPrefixToPath(uiPath);

      const params = {
        Bucket: this.bucket,
        Delimiter: "/",
        Prefix: s3Path,
      };

      const command = new ListObjectsV2Command(params);
      const data = await s3Client.send(command);

      const userPrefix = await this.getUserPrefix();

      const folders = [];
      if (data.CommonPrefixes) {
        for (const prefix of data.CommonPrefixes) {
          const s3FolderPath = prefix.Prefix;
          const uiFolderPath = await this.stripUserPrefixFromPath(s3FolderPath);

          const name = s3FolderPath.replace(s3Path, "").replace("/", "");

          folders.push({
            name: name,
            path: s3FolderPath,
            uiPath: uiFolderPath,
            type: "folder",
          });
        }
      }

      const files = [];
      if (data.Contents) {
        for (const item of data.Contents) {
          if (item.Key === s3Path) continue;

          const s3FilePath = item.Key;
          const uiFilePath = await this.stripUserPrefixFromPath(s3FilePath);

          const relativePath = item.Key.replace(s3Path, "");

          if (relativePath.includes("/")) continue;

          files.push({
            name: relativePath,
            path: s3FilePath,
            uiPath: uiFilePath,
            size: item.Size,
            lastModified: item.LastModified,
            type: "file",
            contentType: this.getContentType(item.Key),
          });
        }
      }

      return {
        folders,
        files,
        s3Path: s3Path,
        uiPath: uiPath,
      };
    } catch (error) {
      console.error("Error in listObjects:", error);
      throw new Error(`Error listing objects: ${error.message}`);
    }
  }

  async uploadFile(file, uiPath = "") {
    try {
      console.log("uploadFile called:", file.name, "to UI path:", uiPath);
      const s3Client = await this.getS3Client();

      const s3Path = await this.addUserPrefixToPath(uiPath);
      console.log("Converted to S3 path:", s3Path);

      const s3Key = s3Path ? `${s3Path}${file.name}` : file.name;
      console.log("Full S3 key for upload:", s3Key);

      const fileBuffer = await file.arrayBuffer();

      const params = {
        Bucket: this.bucket,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: file.type || this.getContentType(file.name),
      };

      const command = new PutObjectCommand(params);
      const data = await s3Client.send(command);

      const uiKey = await this.stripUserPrefixFromPath(s3Key);

      return {
        success: true,
        s3Path: s3Key,
        uiPath: uiKey,
        eTag: data.ETag,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }

  async deleteFile(key) {
    try {
      const s3Client = await this.getS3Client();

      if (!key.startsWith(await this.getUserPrefix())) {
        key = await this.addUserPrefix(key);
      }

      const params = {
        Bucket: this.bucket,
        Key: key,
      };

      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
      return true;
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  async createFolder(folderName, uiPath = "") {
    try {
      const s3Client = await this.getS3Client();

      const s3Path = await this.addUserPrefixToPath(uiPath);

      const s3FolderKey = s3Path ? `${s3Path}${folderName}/` : `${folderName}/`;

      const params = {
        Bucket: this.bucket,
        Key: s3FolderKey,
        Body: "",
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      const uiFolderKey = await this.stripUserPrefixFromPath(s3FolderKey);

      return {
        s3Path: s3FolderKey,
        uiPath: uiFolderKey,
      };
    } catch (error) {
      throw new Error(`Error creating folder: ${error.message}`);
    }
  }

  async renameFolder(oldFolderKey, newFolderName) {
    try {
      console.log("renameFolder called:", oldFolderKey, newFolderName);
      const s3Client = await this.getS3Client();

      if (!oldFolderKey.startsWith(await this.getUserPrefix())) {
        oldFolderKey = await this.addUserPrefix(oldFolderKey);
      }
      console.log("User-prefixed old folder key:", oldFolderKey);

      if (!oldFolderKey.endsWith("/")) {
        oldFolderKey = `${oldFolderKey}/`;
      }

      // IMPORTANT: If newFolderName is already a full path, use it directly
      // Otherwise, extract the parent path and construct the new path
      let newFolderKey;

      if (newFolderName.indexOf("/") > -1) {
        if (!newFolderName.startsWith(await this.getUserPrefix())) {
          newFolderKey = await this.addUserPrefix(newFolderName);
        } else {
          newFolderKey = newFolderName;
        }

        if (!newFolderKey.endsWith("/")) {
          newFolderKey = `${newFolderKey}/`;
        }
      } else {
        const pathParts = oldFolderKey
          .split("/")
          .filter((part) => part.length > 0);
        pathParts.pop();

        newFolderKey =
          pathParts.length > 0
            ? `${pathParts.join("/")}/${newFolderName}/`
            : `${newFolderName}/`;

        if (!newFolderKey.startsWith(await this.getUserPrefix())) {
          newFolderKey = await this.addUserPrefix(newFolderKey);
        }
      }

      console.log("New folder key:", newFolderKey);

      if (oldFolderKey === newFolderKey) {
        console.log("Source and destination are the same, no move needed");
        return {
          success: true,
          oldPath: oldFolderKey,
          newPath: newFolderKey,
          itemsProcessed: 0,
        };
      }

      try {
        const checkParams = {
          Bucket: this.bucket,
          Prefix: newFolderKey,
          MaxKeys: 1,
        };

        const command = new ListObjectsV2Command(checkParams);
        const checkResult = await s3Client.send(command);

        if (checkResult.Contents && checkResult.Contents.length > 0) {
          throw new Error("A folder with this name already exists");
        }
      } catch (error) {
        if (error.message !== "A folder with this name already exists") {
          throw error;
        }
        throw error;
      }

      const listParams = {
        Bucket: this.bucket,
        Prefix: oldFolderKey,
      };

      console.log("Listing objects in folder:", listParams);
      let isTruncated = true;
      let continuationToken = null;
      let processedCount = 0;
      let totalCount = 0;
      let errorCount = 0;

      const countParams = { ...listParams, MaxKeys: 1000 };
      let countResult;

      do {
        const countCommand = new ListObjectsV2Command(
          continuationToken
            ? { ...countParams, ContinuationToken: continuationToken }
            : countParams
        );

        countResult = await s3Client.send(countCommand);
        totalCount += countResult.Contents ? countResult.Contents.length : 0;
        isTruncated = countResult.IsTruncated;
        continuationToken = countResult.NextContinuationToken;
      } while (isTruncated);

      console.log(`Found ${totalCount} objects to rename`);

      isTruncated = true;
      continuationToken = null;

      while (isTruncated) {
        const command = new ListObjectsV2Command(
          continuationToken
            ? { ...listParams, ContinuationToken: continuationToken }
            : listParams
        );

        const listedObjects = await s3Client.send(command);

        if (listedObjects.Contents && listedObjects.Contents.length > 0) {
          for (const item of listedObjects.Contents) {
            const oldKey = item.Key;
            const objectName = oldKey.substring(oldFolderKey.length);
            const newKey = `${newFolderKey}${objectName}`;

            try {
              console.log(`Copying ${oldKey} to ${newKey}`);
              const copyCommand = new CopyObjectCommand({
                Bucket: this.bucket,
                CopySource: `${this.bucket}/${oldKey}`,
                Key: newKey,
              });

              await s3Client.send(copyCommand);

              const deleteCommand = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: oldKey,
              });

              await s3Client.send(deleteCommand);

              processedCount++;
              console.log(`Processed ${processedCount}/${totalCount}`);
            } catch (error) {
              console.error(`Error processing object ${oldKey}:`, error);
              errorCount++;
            }
          }
        }

        isTruncated = listedObjects.IsTruncated;
        continuationToken = listedObjects.NextContinuationToken;
      }

      const putCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: newFolderKey,
        Body: "",
      });

      await s3Client.send(putCommand);
      console.log("Created new folder marker");

      if (errorCount > 0) {
        throw new Error(
          `Renamed ${processedCount} items but encountered errors on ${errorCount} items`
        );
      }

      console.log("Folder rename completed successfully");
      return {
        success: true,
        oldPath: oldFolderKey,
        newPath: newFolderKey,
        itemsProcessed: processedCount,
      };
    } catch (error) {
      console.error("Error renaming folder:", error);
      throw new Error(`Error renaming folder: ${error.message}`);
    }
  }

  async deleteFolder(folderKey) {
    try {
      console.log("deleteFolder called:", folderKey);
      const s3Client = await this.getS3Client();

      if (!folderKey.startsWith(await this.getUserPrefix())) {
        folderKey = await this.addUserPrefix(folderKey);
      }

      if (!folderKey.endsWith("/")) {
        folderKey = `${folderKey}/`;
      }

      console.log("User-prefixed folder key to delete:", folderKey);

      const listParams = {
        Bucket: this.bucket,
        Prefix: folderKey,
      };

      console.log("Listing objects to delete:", listParams);
      const command = new ListObjectsV2Command(listParams);
      const listedObjects = await s3Client.send(command);
      console.log("Found objects:", listedObjects.Contents?.length || 0);

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log("No objects found to delete");
        return true;
      }

      const deleteParams = {
        Bucket: this.bucket,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
          Quiet: false,
        },
      };

      console.log(`Deleting ${deleteParams.Delete.Objects.length} objects`);
      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      const deleteResult = await s3Client.send(deleteCommand);
      console.log("Delete result:", deleteResult);

      if (listedObjects.IsTruncated) {
        console.log("More objects to delete, recursively calling deleteFolder");
        await this.deleteFolder(folderKey);
      }

      console.log("Folder delete completed successfully");
      return true;
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw new Error(`Error deleting folder: ${error.message}`);
    }
  }

  async getSignedUrl(path, expires = 3600) {
    try {
      console.log("getSignedUrl called for path:", path);
      const s3Client = await this.getS3Client();

      const s3Path = await this.addUserPrefixToPath(path);
      console.log("Using S3 path for signed URL:", s3Path);

      const params = {
        Bucket: this.bucket,
        Key: s3Path,
      };

      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, { expiresIn: expires });

      return url;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      throw new Error(`Error getting signed URL: ${error.message}`);
    }
  }

  async moveFile(oldKey, newKey) {
    try {
      console.log("moveFile called:", oldKey, newKey);
      const s3Client = await this.getS3Client();

      if (!oldKey.startsWith(await this.getUserPrefix())) {
        oldKey = await this.addUserPrefix(oldKey);
      }

      if (!newKey.startsWith(await this.getUserPrefix())) {
        newKey = await this.addUserPrefix(newKey);
      }

      console.log("Moving from:", oldKey, "to:", newKey);

      const copyParams = {
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${oldKey}`,
        Key: newKey,
      };

      console.log("Copy params:", copyParams);
      const copyCommand = new CopyObjectCommand(copyParams);
      await s3Client.send(copyCommand);
      console.log("File copied to new location");

      await this.deleteFile(oldKey);
      console.log("Original file deleted");

      return true;
    } catch (error) {
      console.error("Error moving/renaming file:", error);
      throw new Error(`Error moving/renaming file: ${error.message}`);
    }
  }

  async getFileContent(file) {
    try {
      console.log("getFileContent called for file:", file.name);
      const s3Client = await this.getS3Client();

      const s3Path = await this.addUserPrefixToPath(file.path);

      const params = {
        Bucket: this.bucket,
        Key: s3Path,
      };

      const command = new GetObjectCommand(params);
      const response = await s3Client.send(command);

      const reader = response.Body.getReader();
      const chunks = [];
      let done, value;

      while (!(done = (await reader.read()).done)) {
        value = (await reader.read()).value;
        if (value) {
          chunks.push(value);
        }
      }

      const concatenated = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let position = 0;
      for (const chunk of chunks) {
        concatenated.set(chunk, position);
        position += chunk.length;
      }

      // Convert to text
      const decoder = new TextDecoder("utf-8");
      const content = decoder.decode(concatenated);

      return content;
    } catch (error) {
      console.error("Error getting file content:", error);
      throw new Error(`Error getting file content: ${error.message}`);
    }
  }

  getContentType(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    const imageTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      bmp: "image/bmp",
      webp: "image/webp",
      svg: "image/svg+xml",
      tiff: "image/tiff",
      tif: "image/tiff",
    };

    return imageTypes[ext] || "application/octet-stream";
  }

  async getThumbnail(key) {
    try {
      return await this.getSignedUrl(key);
    } catch (error) {
      throw new Error(`Error getting thumbnail: ${error.message}`);
    }
  }
}

export default S3Service;
