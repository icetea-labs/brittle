const chalk = require("chalk");

module.exports = () => console.log(
    `
               ##XX##            
          #Xx${chalk.cyan("+========+")}xX#       
        X${chalk.cyan("+================+")}X     
      #${chalk.cyan("+====================+")}#   
     #${chalk.cyan("+======================+")}#      ${chalk.cyan("_____              _____")}  
     ${chalk.cyan("+===============+")}##${chalk.cyan("x+====+")}     ${chalk.cyan("|_   _|            |_   _|")}
    X${chalk.cyan("===============")}x######${chalk.cyan("+===")}X      ${chalk.cyan("| |    ___   ___   | |    ___   __ _")}
    X${chalk.cyan("===============")}x#####${chalk.cyan("+====")}X      ${chalk.cyan("| |   / __| / _ \\  | |   / _ \\ / _\` |")}
    X${chalk.cyan("=====")}x##Xx${chalk.cyan("+=")}xxxxxXxx${chalk.cyan("======")}X     ${chalk.cyan("_| |_ | (__ |  __/  | |  |  __/| (_| |")}
     ${chalk.cyan("+===")}x######x#####x${chalk.cyan("=======+")}      ${chalk.cyan("\\___/  \\___| \\___|  \\_/   \\___| \\__,_|")}
     #${chalk.cyan("+==")}x#####${chalk.cyan("++")}#####x${chalk.cyan("======+")}#  
      #${chalk.cyan("+====+")}x${chalk.cyan("+==++++++=====+")}#   
        X${chalk.cyan("+================+")}X     
          #Xx${chalk.cyan("+========+")}xX#       
               ##XX##            
    `
)