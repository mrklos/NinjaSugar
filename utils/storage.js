import EasyStorage from "@silver-zepp/easy-storage";
import { log } from "@zos/utils";

const logger = log.getLogger("Storage");

export const STORAGE_APIAUTHKEY = "STORAGE_APIAUTHKEY";
export const STORAGE_SETTINGS = "STORAGE_SETTINGS";
export const STORAGE_GLUCOSEDATA = "STORAGE_GLUCOSEDATA";
export const STORAGE_LASTGLUCOSE = "STORAGE_LASTGLUCOSE";
export const STORAGE_BACKGROUNDID = "STORAGE_BACKGROUNDID";
export const STORAGE_WATCHDOGID = "STORAGE_WATCHDOGID";
export const STORAGE_ALERTID = "STORAGE_ALERTID";

export class StorageHelper {
  static instance = null;

  static getInstance() {
    if (!StorageHelper.instance) {
      StorageHelper.instance = new StorageHelper();
    }
    return StorageHelper.instance;
  }

  constructor() {
    if (StorageHelper.instance) {
      return StorageHelper.instance;
    }

    try {
      this.storage = new EasyStorage();
      this.storage.SetAutosaveEnable(true);
      logger.log("Storage constructor initialized");
      StorageHelper.instance = this;
    } catch (error) {
      logger.log(`Storage initialization error: ${error}`);
    }
  }

  storeLatestGlucoseEntry(glucoseData) {
    try {
      if (!glucoseData) {
        logger.log("storeLatestGlucoseEntry: Invalid data");
        return;
      }
      this.storage.setKey(STORAGE_LASTGLUCOSE, JSON.stringify(glucoseData));
    } catch (error) {
      logger.log(`storeLatestGlucoseEntry error: ${error}`);
    }
  }

  getLatestGlucoseEntry() {
    try {
      let glucoseEntry = this.storage.getKey(STORAGE_LASTGLUCOSE, null);
      if (glucoseEntry !== null) {
        glucoseEntry = JSON.parse(glucoseEntry);
        return glucoseEntry;
      } else {
        logger.log(`getLatestGlucoseEntry: null`);
        return null;
      }
    } catch (error) {
      logger.log(`getLatestGlucoseEntry error: ${error}`);
      return null;
    }
  }

  storeAuthDetails(authDetails) {
    try {
      if (!authDetails || !authDetails.token) {
        logger.log("storeAuthDetails: Invalid auth details");
        return;
      }
      this.storage.setKey(STORAGE_APIAUTHKEY, JSON.stringify(authDetails));
    } catch (error) {
      logger.log(`storeAuthDetails error: ${error}`);
    }
  }

  getAuthDetails() {
    try {
      let stringValue = this.storage.getKey(STORAGE_APIAUTHKEY, null);
      if (stringValue !== null) {
        let object = JSON.parse(stringValue);
        return object;
      } else {
        return null;
      }
    } catch (error) {
      logger.log(`getAuthDetails error: ${error}`);
      return null;
    }
  }

  getAlarmID() {
    try {
      return this.storage.getKey(STORAGE_BACKGROUNDID, null);
    } catch (error) {
      logger.log(`getAlarmID error: ${error}`);
      return null;
    }
  }

  setAlarmID(id) {
    try {
      this.storage.setKey(STORAGE_BACKGROUNDID, id);
    } catch (error) {
      logger.log(`setAlarmID error: ${error}`);
    }
  }

  clearAlarmID() {
    try {
      this.storage.removeKey(STORAGE_BACKGROUNDID);
    } catch (error) {
      logger.log(`clearAlarmID error: ${error}`);
    }
  }

  clearAuthDetails() {
    try {
      this.storage.removeKey(STORAGE_APIAUTHKEY);
    } catch (error) {
      logger.log(`clearAuthDetails error: ${error}`);
    }
  }

  setWatchDogID(id) {
    try {
      this.storage.setKey(STORAGE_WATCHDOGID, id);
    } catch (error) {
      logger.log(`setWatchDogID error: ${error}`);
    }
  }

  getWatchDogID() {
    try {
      return this.storage.getKey(STORAGE_WATCHDOGID, null);
    } catch (error) {
      logger.log(`getWatchDogID error: ${error}`);
      return null;
    }
  }

  clearWatchDogID() {
    try {
      this.storage.removeKey(STORAGE_WATCHDOGID);
    } catch (error) {
      logger.log(`clearWatchDogID error: ${error}`);
    }
  }

  setAlertID(id) {
    try {
      this.storage.setKey(STORAGE_ALERTID, id);
    } catch (error) {
      logger.log(`setAlertID error: ${error}`);
    }
  }

  getAlertID() {
    try {
      return this.storage.getKey(STORAGE_ALERTID, null);
    } catch (error) {
      logger.log(`getAlertID error: ${error}`);
      return null;
    }
  }

  clearAlertID() {
    try {
      this.storage.removeKey(STORAGE_ALERTID);
    } catch (error) {
      logger.log(`clearAlertID error: ${error}`);
    }
  }
}
