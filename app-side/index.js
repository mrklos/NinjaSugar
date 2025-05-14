import { BaseSideService } from "@zeppos/zml/base-side";
import { settingsLib } from "@zeppos/zml/base-side";
import { Sha256 } from "@aws-crypto/sha256-js";

const logger = console;
let authDetails = null;
let settings = null;

async function fetchWithErrorHandling(url, options = {}) {
  logger.log(`fetchWithErrorHandling: ${url}, ${JSON.stringify(options)}`);
  try {
    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Product: "llu.ios",
      Version: "4.12.0",
    };

    const res = await fetch({
      url,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    logger.log(`fetchWithErrorHandling: ${JSON.stringify(res)}`);
    logger.log(res);
    if (!res) {
      throw new Error("No response from server");
    }

    if (!res.body) {
      throw new Error("No data in response");
    }

    const data = typeof res.body === "string" ? JSON.parse(res.body) : res.body;
    return data;
  } catch (error) {
    logger.log(`fetchWithErrorHandling error: ${error}`);
    throw error;
  }
}

function isValidAuth(auth) {
  return (
    auth &&
    typeof auth.token === "string" &&
    auth.token.length > 0 &&
    auth.accountID
  );
}

async function authorize() {
  logger.log(`authorize: ${JSON.stringify(authDetails)}`);
  if (isValidAuth(authDetails)) {
    return authDetails;
  } else {
    try {
      const newAuthDetails = await apiGetAuthDetails();

      if (isValidAuth(newAuthDetails)) {
        authDetails = newAuthDetails;
        return newAuthDetails;
      } else {
        throw new Error("No valid authentication fetched from api");
      }
    } catch (error) {
      logger.log(`authorize error: ${error}`);
      throw error;
    }
  }
}

async function authorizeAndFetchGlucose(res) {
  try {
    const authdetails = await authorize();
    const glucoseData = await apiGetGlucoseDetails(authdetails);
    res(null, {
      status: true,
      data: glucoseData,
    });
  } catch (error) {
    logger.log(`authorizeAndFetchGlucose error: ${error}`);
    res(null, {
      status: false,
      error: `ERROR = ${error}`,
    });
  }
}

function getTrendArrowString(trendArrow) {
  switch (trendArrow) {
    case 1:
      return "↓";
    case 2:
      return "↘";
    case 3:
      return "→";
    case 4:
      return "↗";
    case 5:
      return "↑";
    default:
      return "";
  }
}

async function apiGetGlucoseDetails(authDetails) {
  if (!authDetails || !authDetails.token || !authDetails.accountID) {
    throw new Error("Invalid auth details");
  }

  if (!settings || !settings.connectionsURL) {
    throw new Error("Missing connections URL in settings");
  }

  const response = await fetchWithErrorHandling(settings.connectionsURL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authDetails.token}`,
      "Account-Id": authDetails.accountID,
    },
  });

  if (!response.data || !response.data[0]) {
    throw new Error("Invalid data format");
  }

  const data = response.data[0];
  if (!data) {
    throw new Error("Missing data");
  }

  const measurement = data.glucoseMeasurement;
  if (!measurement) {
    throw new Error("Missing glucoseMeasurement in data");
  }

  const targetHigh = data.targetHigh;
  const targetLow = data.targetLow;
  if (!targetHigh || !targetLow) {
    throw new Error("Missing targetHigh or targetLow");
  }

  const requiredFields = ["Value", "FactoryTimestamp"];
  for (const field of requiredFields) {
    if (measurement[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const details = {
    FactoryTimestamp: measurement.FactoryTimestamp,
    LocalTimestamp: parseUtcFactoryTimestamp(measurement.FactoryTimestamp),
    Value: measurement.Value,
    isHigh: measurement.Value >= targetHigh ? true : false, //measurement.isHigh, //todo: currently isHigh/isLow returns false for some reason?
    isLow: measurement.Value < targetLow ? true : false, //measurement.isLow, //todo: currently isHigh/isLow returns false for some reason?
    TrendArrowString: getTrendArrowString(measurement.TrendArrow),
  };
  logger.log(details);
  return details;
}

function parseUtcFactoryTimestamp(str) {
  const m = str.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2}) ([AP]M)$/
  );
  if (!m) throw new Error(`Invalid timestamp: ${str}`);
  let [, M, D, Y, h, mm, ss, ap] = m;
  let month = Number(M) - 1;
  let day = Number(D);
  let year = Number(Y);
  let hour = Number(h);
  let minute = Number(mm);
  let second = Number(ss);
  if (ap === "PM" && hour < 12) hour += 12;
  if (ap === "AM" && hour === 12) hour = 0;
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

async function apiGetAuthDetails() {
  if (!settings || !settings.authURL || !settings.login || !settings.password) {
    throw new Error("Missing required settings for authentication");
  }

  const response = await fetchWithErrorHandling(settings.authURL, {
    method: "POST",
    body: JSON.stringify({
      email: settings.login,
      password: settings.password,
    }),
  });

  if (!response.data || !response.data.user || !response.data.authTicket) {
    throw new Error("Invalid auth data structure");
  }

  if (!response.data.user.id || !response.data.authTicket.token) {
    throw new Error("Missing user ID or auth token");
  }

  const hash = new Sha256();
  hash.update(response.data.user.id);

  try {
    const digestResult = await hash.digest();
    const accountID = Array.from(new Uint8Array(digestResult))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return {
      accountID: accountID,
      token: response.data.authTicket.token,
    };
  } catch (hashError) {
    logger.log(`Hash digest error: ${hashError}`);
    throw new Error("Failed to create account ID hash");
  }
}

// eslint-disable-next-line no-undef
AppSideService(
  BaseSideService({
    onInit() {
      logger.log("App-side service initialized");
      const newValue = settingsLib.getItem("settings");
      settings = newValue
        ? typeof newValue === "string"
          ? JSON.parse(newValue)
          : newValue
        : {};
    },
    onSettingsChange({ key, newValue }) {
      if (key === "settings" && newValue) {
        settings = newValue
          ? typeof newValue === "string"
            ? JSON.parse(newValue)
            : newValue
          : {};
        //re-authorize if settings change
        authDetails = null;
      }
    },
    onRequest(req, res) {
      authorizeAndFetchGlucose(res);
    },
    onRun() {},
    onDestroy() {
      authDetails = null;
      settings = null;
      logger.log("App-side service destroyed");
    },
  })
);
