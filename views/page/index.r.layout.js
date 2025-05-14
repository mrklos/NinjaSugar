import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../../utils/constants";

export const TEXT_STYLE = {
  x: px(0),
  y: px(0),
};

export const GLUCOSE_TEXT = {
  x: px(56),
  y: px(100),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(80),
  color: 0xffffff,
  text_size: px(36),
  align_h: hmUI.align.CENTER_H,
  text_style: hmUI.text_style.WRAP,
};

export const DATE_TEXT = {
  x: px(56),
  y: px(200),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(80),
  color: 0xffffff,
  text_size: px(24),
  align_h: hmUI.align.CENTER_H,
  text_style: hmUI.text_style.WRAP,
};

export const ACTION_BUTTON = {
  x: (DEVICE_WIDTH - px(360)) / 2,
  y: px(300),
  w: px(360),
  h: px(80),
  text_size: px(36),
  radius: px(12),
};
