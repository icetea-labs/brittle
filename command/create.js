const Git = require("nodegit");
const Steps = require("cli-step");
const chalk = require("chalk");
const emoji = require("node-emoji");
const { exec } = require("child_process");

module.exports = async (githubUrl, name) => {
  const steps = new Steps(2);
  let oldStep = null;
  steps.startRecording();
  oldStep = steps
    .advance(
      "Cloning",
      null,
      `git clone ${githubUrl} ${name}`
    )
    .start();
  try {
    await Git.Clone(githubUrl, `./${name}`);
  } catch (e) {
    oldStep.error(e);
    process.exit(1);
  }
  oldStep.success("Cloning", "white_check_mark");

  oldStep = steps
    .advance("Fetching packages", null, `npm install --prefix ${name}`)
    .start();
  exec(`npm install --prefix ${name}`, (error, stdout, stderr) => {
    if (error) {
      oldStep.error("Fetching packages failed");
      console.error(error.toString());
      return;
    }
    if (stdout) {
      oldStep.success("Fetching packages", "white_check_mark");
      const lines = [
        "",
        `${emoji.get("rocket")}   Successfully created project`,
        `${emoji.get("point_right")}   Get started with the following commands`,
        "",
        `${chalk.dim("$")} ${chalk.cyan(`cd ${name}`)}`,
        `${chalk.dim("$")} ${chalk.cyan("brittle build")}`,
        ""
      ];
      lines.forEach(line => console.log(line));
    }
  });
}