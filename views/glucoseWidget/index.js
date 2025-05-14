import * as hmUI from "@zos/ui";
import { log } from "@zos/utils";
import { DEVICE_WIDTH } from "../../utils/constants";
import { px } from "@zos/utils";
import { StorageHelper } from "../../utils/storage";
import { formatLocalTimeWithMinutesAgo } from "../../utils/utils";

const logger = log.getLogger("Glucose Widget");

SecondaryWidget({
  state: {},
  onInit(e) {
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

    this.updateInterval = null;
    logger.log(`onInit(${e})`);
  },
  build() {
    this.glucoseTextView = hmUI.createWidget(hmUI.widget.TEXT, {
      x: px(56),
      y: px(100),
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
      y: px(200),
      w: DEVICE_WIDTH - 2 * px(56),
      h: px(80),
      color: 0xffffff,
      text_size: px(24),
      align_h: hmUI.align.CENTER_H,
      text_style: hmUI.text_style.WRAP,
      text: "0",
    });
  },

  onResume() {
    logger.log(`onResume`);
    //Assume if user saw glucose, we can postpone alert
    this.storage.clearAlertID();

    this.redraw();

    this.clearUpdateInterval();
    this.updateInterval = setInterval(() => this.redraw(), 1000 * 60);
  },

  onPause() {
    logger.log("onPause");
    this.clearUpdateInterval();
  },

  onDestroy() {
    logger.log("onDestroy");
    this.clearUpdateInterval();
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
      }
    } catch (e) {
      logger.log(`redraw Error: ${e}`);
    }
  },
});
