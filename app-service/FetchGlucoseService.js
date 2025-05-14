import { BasePage } from "@zeppos/zml/base-page";
import { log } from "@zos/utils";
import * as appService from "@zos/app-service";
import * as alarmMgr from "@zos/alarm";
import { StorageHelper } from "../utils/storage";

const logger = log.getLogger("FetchGlucoseService");

const ALERT_DELAYS = {
  high: 20 * 60,
  low: 15 * 60,
  watchdog: 30 * 60,
};

// eslint-disable-next-line no-undef
AppService(
  BasePage({
    onInit() {
      this.initStorage();
      logger.log("onInit: starting");
      this.fetchGlucoseAndExit();
    },

    onEvent() {
      logger.log("onEvent: starting");
      this.fetchGlucoseAndExit();
    },

    onDestroy() {},

    initStorage() {
      try {
        // eslint-disable-next-line no-undef
        this.storage = getApp().globalData.storage;
        if (!this.storage?.getLatestGlucoseEntry) {
          logger.log("Storage not found in globalData, using singleton");
          this.storage = StorageHelper.getInstance();
        }
        if (!this.storage?.getLatestGlucoseEntry) {
          throw new Error("Storage is not available or initialized properly");
        }
      } catch (e) {
        logger.log(`Storage initialization error: ${e}`);
        appService.exit();
      }
    },

    fetchGlucoseAndExit() {
      this.request({ type: "authorizeAndFetchGlucose" })
        .then((result) => {
          if (!result.status) {
            logger.log(`Fetch error: ${result.error}`);
            return appService.exit();
          }

          const entry = result.data;
          try {
            this.storage.storeLatestGlucoseEntry(entry);
            this.handleAlerts(entry);
          } catch (err) {
            logger.log(`Data processing error: ${err}`);
          }

          appService.exit();
        })
        .catch((err) => {
          logger.log(`Request error: ${err}`);
          appService.exit();
        });
    },

    handleAlerts(entry) {
      try {
        const isHigh = entry.isHigh;
        const isLow = entry.isLow;
        const existingAlertId = parseInt(this.storage.getAlertID());
        const existingAlerts = alarmMgr.getAllAlarms();

        logger.log(`handleAlerts id: ${existingAlertId}`);

        // Clear any pending guard-dog alarm
        this.clearWatchDog();

        if (isHigh || isLow) {
          if (
            !existingAlertId ||
            (existingAlertId && !existingAlerts.includes(existingAlertId))
          ) {
            const delay = isHigh ? ALERT_DELAYS.high : ALERT_DELAYS.low;
            // logger.log(`Scheduling glucose alert in ${delay / 60}m`);
            const id = alarmMgr.set({
              url: "views/glucoseAlert/index",
              delay,
              param: JSON.stringify({
                message: `Sugar ${isHigh ? "high" : "low"}`,
              }),
            });
            this.storage.setAlertID(id);
          }
        } else {
          // Normal range: clear glucose alert if exists
          if (existingAlertId) {
            // logger.log(`Clearing glucose alert ${existingAlertId}`);
            const status = alarmMgr.cancel(existingAlertId);
            if (status == 0) {
              this.storage.clearAlertID();
            }
            // logger.log(
            //   `remaining alerts ${JSON.stringify(
            //     alarmMgr.getAllAlarms()
            //   )}, status: ${status} `
            // );
          }

          // Schedule guard-dog alarm for inactivity
          // logger.log(
          //   `Scheduling guard-dog alarm in ${ALERT_DELAYS.watchdog / 60}m`
          // );
          const wdId = alarmMgr.set({
            url: "views/glucoseAlert/index",
            delay: ALERT_DELAYS.watchdog,
            param: JSON.stringify({
              message: `No update in ${
                ALERT_DELAYS.watchdog / 60
              } minutes, please check`,
            }),
          });
          this.storage.setWatchDogID(wdId);
        }
      } catch (e) {
        logger.log(`handleAlerts error: ${e}`);
      }
    },

    clearWatchDog() {
      const wdId = parseInt(this.storage.getWatchDogID());
      // logger.log(`clearWatchDog id: ${wdId}`);
      if (wdId) {
        try {
          logger.log(`Clearing watch-dog alarm ${wdId}`);
          const status = alarmMgr.cancel(wdId);
          // logger.log(
          //   `clearWatchDog remaining alerts ${JSON.stringify(
          //     alarmMgr.getAllAlarms()
          //   )},  cancelid: ${status}`
          // );
        } catch (e) {
          logger.log(`Error cancelling watch-dog: ${e}`);
        }
        this.storage.clearWatchDogID();
      }
    },
  })
);
