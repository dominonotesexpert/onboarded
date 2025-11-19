// Source - https://stackoverflow.com/a/79631068
// Posted by Chen Peleg, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-19, License - CC BY-SA 4.0

import { json } from "@remix-run/node";
import path from "node:path";

export const loader = async () => {
  const projectRoot = path.resolve();
  return json({
    workspace: {
      root: projectRoot,
      uuid: "flowforge-devtools"
    }
  });
};
