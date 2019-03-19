const emoji = require("node-emoji");

module.exports = {
  include: (value, group) => {
    if (!group.includes(value)) {
      console.log(
        `    ${emoji.get("pray")}   Allowed value: [${group}] Current: ${value}`
      );
      process.exit(1);
    }
  }
};
