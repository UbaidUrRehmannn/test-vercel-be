import fs from "fs-extra";
import path from "path";

// The "swagger-ui-dist" package provides a getAbsoluteFSPath function.
import { getAbsoluteFSPath } from "swagger-ui-dist";

// Get the absolute path to the swagger-ui-dist directory
const source = getAbsoluteFSPath();

const destination = "public";

// copy source folder to destination
fs.copy(source, destination, function (err) {
  if (err) {
    console.log("An error occurred while copying the folder.");
    return console.error(err);
  }
  console.log("Copied the folder successfully.");
});
