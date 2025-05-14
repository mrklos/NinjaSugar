import * as hmUI from "@zos/ui";
import * as alarmMgr from "@zos/alarm";
import { BasePage } from "@zeppos/zml/base-page";
import { log } from "@zos/utils";
import {
  ACTION_BUTTON,
  GLUCOSE_TEXT,
  DATE_TEXT,
} from "zosLoader:./index.[pf].layout.js";
import { StorageHelper } from "../../utils/storage";
import { formatLocalTimeWithMinutesAgo } from "../../utils/utils";

const logger = log.getLogger("Main");

Page(
  BasePage({
    state: {},
    onInit() {
      this.serviceFile = "app-service/FetchGlucoseService";
      this.glucoseTextView = null;
      this.timestampTextView = null;
      this.actionButton = null;
      this.updateInterval = null;

      try {
        this.storage = getApp().globalData.storage;

        if (!this.storage || !this.storage.getLatestGlucoseEntry) {
          logger.log("Storage not found in globalData, using singleton");
          this.storage = StorageHelper.getInstance();
        }

        if (!this.storage || !this.storage.getLatestGlucoseEntry) {
          logger.log("Error: Storage is not initialized properly");
        }
      } catch (error) {
        logger.log(`Storage initialization error: ${error}`);
      }
    },
    build() {
      logger.log(`build`);
      this.glucoseTextView = hmUI.createWidget(hmUI.widget.TEXT, {
        ...GLUCOSE_TEXT,
        text: "0",
      });
      this.timestampTextView = hmUI.createWidget(hmUI.widget.TEXT, {
        ...DATE_TEXT,
        text: "0",
      });
      this.actionButton = hmUI.createWidget(hmUI.widget.BUTTON, {
        ...ACTION_BUTTON,
        text: this.isBackgroundServiceRunning() ? "Stop" : "Start",
        click_func: (button_widget) => {
          this.buttonAction();
        },
      });

      this.redraw();
      this.updateInterval = setInterval(() => this.redraw(), 1000 * 60);
    },
    onDestroy() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }

      logger.log("Page destroyed and cleaned up");
    },
    startTimeService() {
      const option = {
        url: this.serviceFile,
        repeat_type: alarmMgr.REPEAT_MINUTE,
        repeat_period: 1,
        repeat_duration: 1,
        //store: true,
        delay: 60,
      };

      const id = alarmMgr.set(option);
      this.storage.setAlarmID(id);
      logger.log(
        `startTimeService starting alarm: ${this.serviceFile} id: ${id}`
      );
      this.redraw();
    },
    fetchGlucose(onSuccess, onFailure) {
      hmUI.showToast("Fetching glucose");
      this.request({ type: "authorizeAndFetchGlucose" })
        .then((result) => {
          if (result.status) {
            logger.log(`fetchGlucose result received`);
            if (this.storage) {
              this.storage.storeLatestGlucoseEntry(result.data);
              this.redraw();
            } else {
              logger.log("Storage not available for storing glucose");
            }
            onSuccess();
          } else {
            hmUI.showToast(result.error);
            onFailure();
          }
        })
        .catch((error) => {
          logger.log(`fetchGlucose error: ${error}`);
          this.glucoseTextView.setProperty(hmUI.prop.TEXT, error);
          onFailure();
        });
    },
    stopTimeService() {
      logger.log(`stopTimeService`);

      const backgroundId = this.storage.getAlarmID();
      if (backgroundId !== null) {
        alarmMgr.cancel(backgroundId);
        this.storage.clearAlarmID();
      }

      const allAlarms = alarmMgr.getAllAlarms();
      for (let i = 0; i < allAlarms.length; i++) {
        const alarmId = allAlarms[i];
        try {
          alarmMgr.cancel(alarmId);
          logger.log(`Cancelled alarm with ID: ${alarmId}`);
        } catch (error) {
          logger.log(`Error cancelling alarm ${alarmId}: ${error}`);
        }
      }
    },
    buttonAction() {
      if (this.isBackgroundServiceRunning()) {
        this.stopTimeService();
        this.redraw();
      } else {
        this.actionButton.setProperty(hmUI.prop.TEXT, "Starting...");
        this.actionButton.setProperty(hmUI.prop.ENABLE, false);

        this.fetchGlucose(
          () => {
            this.startTimeService();
            this.actionButton.setProperty(hmUI.prop.ENABLE, true);
            this.redraw();
          },
          () => {
            // In case of failure
            this.actionButton.setProperty(hmUI.prop.ENABLE, true);
            this.redraw();
          }
        );
      }
    },
    redraw() {
      if (this.isBackgroundServiceRunning()) {
        this.actionButton.setProperty(hmUI.prop.TEXT, "Stop");
      } else {
        this.actionButton.setProperty(hmUI.prop.TEXT, "Start");
      }

      let glucoseEntry = this.storage.getLatestGlucoseEntry();

      if (glucoseEntry) {
        this.glucoseTextView.setProperty(
          hmUI.prop.TEXT,
          `${glucoseEntry.Value} ${glucoseEntry.TrendArrowString || ""}`
        );
        this.glucoseTextView.setProperty(
          hmUI.prop.COLOR,
          glucoseEntry.isHigh
            ? 0xffaa00
            : glucoseEntry.isLow
            ? 0xff0000
            : 0x00cc00
        );
        this.timestampTextView.setProperty(
          hmUI.prop.TEXT,
          formatLocalTimeWithMinutesAgo(glucoseEntry.LocalTimestamp)
        );
      } else {
        logger.log(`redraw: no glucose`);
      }
    },
    isBackgroundServiceRunning() {
      try {
        const allAlarms = alarmMgr.getAllAlarms();
        return allAlarms.length > 0;
      } catch (error) {
        logger.log(`isBackgroundServiceRunning error: ${error}`);
        return false;
      }
    },
  })
);
