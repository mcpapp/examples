import { eveChannel } from "eve/channels/eve";
import { localDev, none } from "eve/channels/auth";
import {
  helloWorldEveChannel,
  useModelBackedEveChannel,
} from "../../src/hello-world-session.js";

const channel = useModelBackedEveChannel()
  ? eveChannel({
      auth: [localDev(), none()],
    })
  : helloWorldEveChannel;

export default channel;
