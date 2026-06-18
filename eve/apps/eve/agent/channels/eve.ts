import { eveChannel } from "eve/channels/eve";
import { localDev, none } from "eve/channels/auth";
import {
  fixtureEveChannel,
  useFixtureEveChannel,
} from "../../test/fixtures/eve-session-fixture.js";

const channel = useFixtureEveChannel()
  ? fixtureEveChannel
  : eveChannel({
      auth: [localDev(), none()],
    });

export default channel;
