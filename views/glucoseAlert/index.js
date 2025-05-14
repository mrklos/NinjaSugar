import * as hmUI from "@zos/ui";
import { log } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import { DEVICE_WIDTH } from "../../utils/constants";
import { px } from "@zos/utils";
import { Vibrator, VIBRATOR_SCENE_TIMER } from "@zos/sensor";
import { exit } from "@zos/router";
import { StorageHelper } from "../../utils/storage";
import * as alarmMgr from "@zos/alarm";
import { formatLocalTimeWithMinutesAgo } from "../../utils/utils";

const logger = log.getLogger("Glucose Alert");

Page(
  BasePage({
    state: {},
    onInit(param) {
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

      try {
        this.vibrator = new Vibrator();
      } catch (error) {
        logger.log(`Vibrator initialization error: ${error}`);
        this.vibrator = null;
      }
      const paramObject = typeof param === "string" ? JSON.parse(param) : param;
      this.message = paramObject.message;
      this.updateInterval = null;
    },
    build() {
      this.messageTextView = hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(56),
        y: px(100),
        w: DEVICE_WIDTH - 2 * px(56),
        h: px(80),
        color: 0xffffff,
        text_size: px(36),
        align_h: hmUI.align.CENTER_H,
        text_style: hmUI.text_style.WRAP,
        text: this.message ?? "Default alert message",
      });
      this.glucoseTextView = hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(56),
        y: px(200),
        w: DEVICE_WIDTH - 2 * px(56),
        h: px(80),
        color: 0xffffff,
        text_size: px(36),
        align_h: hmUI.align.CENTER_H,
        text_style: hmUI.text_style.WRAP,
        text: "0",
      });
      this.timestampTextView = hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(56),
        y: px(300),
        w: DEVICE_WIDTH - 2 * px(56),
        h: px(80),
        color: 0xffffff,
        text_size: px(24),
        align_h: hmUI.align.CENTER_H,
        text_style: hmUI.text_style.WRAP,

        text: "0",
      });

      this.actionButton = hmUI.createWidget(hmUI.widget.BUTTON, {
        x: px(56),
        y: px(400),
        w: DEVICE_WIDTH - 2 * px(56),
        h: px(80),
        text: "CLOSE",
        click_func: (button_widget) => {
          const existingAlertId = parseInt(this.storage.getAlertID());
          const status = alarmMgr.cancel(existingAlertId);
          if (status == 0) {
            this.storage.clearAlertID();
          }
          exit();
        },
      });

      this.vibrator.stop();
      this.vibrator.setMode(VIBRATOR_SCENE_TIMER);
      this.vibrator.start();

      this.redraw();
      this.clearUpdateInterval();
      this.updateInterval = setInterval(() => this.redraw(), 1000 * 60);
    },
    onPause() {
      logger.log("onPause");
      this.clearUpdateInterval();
      this.vibrator.stop();
    },
    onDestroy() {
      logger.log("onDestroy");
      this.clearUpdateInterval();
      this.vibrator.stop();
    },
    clearUpdateInterval() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    },
    redraw() {
      logger.log(`redraw`);
      try {
        let glucoseEntry = this.storage.getLatestGlucoseEntry();
        if (glucoseEntry) {
          this.glucoseTextView.setProperty(
            hmUI.prop.TEXT,
            `${glucoseEntry.Value} ${glucoseEntry.TrendArrowString}`
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
        }
      } catch (e) {
        logger.log(`redraw Error: ${e}`);
      }
    },
  })
);
