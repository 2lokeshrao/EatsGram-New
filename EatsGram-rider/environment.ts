import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import * as Updates from "expo-updates";
import { useContext } from "react";
import { ConfigurationContext } from "./lib/context/global/configuration.context";
const getEnvVars = (env = Updates.channel) => {
  const configuration = useContext(ConfigurationContext);
  if (__DEV__) {
    loadDevMessages();
    loadErrorMessages();
  }
  if (!__DEV__) {
    return {
      // GRAPHQL_URL: "https://EatsGram-multivendor.up.railway.app/graphql",
      // WS_GRAPHQL_URL: "wss://EatsGram-multivendor.up.railway.app/graphql",
      GRAPHQL_URL: "https://aws-server.EatsGram.com/graphql",
      WS_GRAPHQL_URL: "wss://aws-server.EatsGram.com/graphql",
      SENTRY_DSN:
        configuration?.riderAppSentryUrl ??
        "https://e963731ba0f84e5d823a2bbe2968ea4d@o1103026.ingest.sentry.io/6135261",
      // GOOGLE_MAPS_KEY: 'AIzaSyBk4tvTtPaSEAVSvaao2yISz4m8Q-BeE1M',
      GOOGLE_MAPS_KEY:configuration?.googleApiKey,
      ENVIRONMENT: "production",
    };
  }

  return {
      GRAPHQL_URL: "https://aws-server.EatsGram.com/graphql",
      WS_GRAPHQL_URL: "wss://aws-server.EatsGram.com/graphql",
    SENTRY_DSN:
      configuration?.riderAppSentryUrl ??
      "https://e963731ba0f84e5d823a2bbe2968ea4d@o1103026.ingest.sentry.io/6135261",
    // GOOGLE_MAPS_KEY: 'AIzaSyBk4tvTtPaSEAVSvaao2yISz4m8Q-BeE1M',
    GOOGLE_MAPS_KEY:configuration?.googleApiKey,
    ENVIRONMENT: "development",
  };
};

export default getEnvVars;
