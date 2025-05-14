import { BaseApp } from "@zeppos/zml/base-app";
import { StorageHelper } from "./utils/storage";
import { log } from "@zos/utils";

const logger = log.getLogger("App");

const storage = StorageHelper.getInstance();

App(
  BaseApp({
    globalData: {
      storage: storage,
    },
    onCreate() {
      logger.log("App onCreate");

      if (!this.globalData.storage) {
        logger.log("Storage not initialized correctly, initializing now");
        this.globalData.storage = StorageHelper.getInstance();
      }
    },
    onDestroy(options) {
      logger.log("App onDestroy");
    },
  })
);
