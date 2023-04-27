const chokidar = require("chokidar");

let updateConfigAndRun;
let lastFileChanged;

chokidar
  .watch(".", {
    ignored: /node_modules|\.tmp/,
  })
  .on("change", (f) => {
    lastFileChanged = f;
  });

class RelatedWatchPlugin {
  apply(jestHooks) {
    jestHooks.onFileChange(() => {
      if (updateConfigAndRun && lastFileChanged) {
        updateConfigAndRun({
          findRelatedTests: true,
          testPathPattern: lastFileChanged,
          nonFlagArgs: [lastFileChanged],
        });
        lastFileChanged = undefined;
      }
    });

    jestHooks.shouldRunTestSuite(() => {
      return !!updateConfigAndRun;
    });
  }
  getUsageInfo() {
    return {
      key: "n",
      prompt: "related to fs changes",
    };
  }
  run(_, updateAndRun) {
    updateConfigAndRun = updateAndRun;
    return Promise.resolve(false);
  }
}

module.exports = RelatedWatchPlugin;
