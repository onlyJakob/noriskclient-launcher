import { invoke } from "@tauri-apps/api";
import { launcherOptions } from "./optionsStore.js";
import { get, writable } from "svelte/store";

export const branches = writable([]);
export const currentBranchIndex = writable(0);

export async function fetchBranches() {
  await invoke("request_norisk_branches").then(result => {
    const latestBranch = launcherOptions.experimentalMode ? launcherOptions.latestDevBranch : launcherOptions.latestBranch;
    result.sort(function(a, b) {
      if (a === latestBranch) {
        return -1;
      } else if (b === latestBranch) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });
    branches.set(result);
  }).catch((reason) => {
    branches.set([]);
    //addNotification(reason);
  });
  console.log("Fetches Branches: ", get(branches))

  let options = get(launcherOptions);
  let latestBranch = options.experimentalMode ? options.latestDevBranch : options.latestBranch;
  let _branches = get(branches);
  if (!latestBranch) {
    if (_branches.length > 0) {
      currentBranchIndex.set(0);
    }
  } else {
    let index = _branches.indexOf(latestBranch);
    if (index !== -1) {
      currentBranchIndex.set(index);
    }
  }

  console.log("Current Branch", get(branches)[get(currentBranchIndex)])
}

export function switchBranch(isLeft) {
  const totalBranches = get(branches).length;
  if (isLeft) {
    currentBranchIndex.update(value => {
      return (value - 1 + totalBranches) % totalBranches;
    });
  } else {
    currentBranchIndex.update(value => {
      return (value + 1) % totalBranches;
    });
  }
  console.log("Branches and Index", get(branches), get(currentBranchIndex));
}
