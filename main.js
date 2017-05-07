var fs = require('fs');
const dictionary = fs.readFileSync("./files/dictionary.txt", "utf-8").split('\n');
var readline = require('readline');
const AutoCorrect = require('./src/AutoCorrect.js');
const MarkovChain = require('./src/MarkovChain.js');


var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let exampleText = "./files/tumblr.txt";

const autoCorrect = new AutoCorrect(dictionary, exampleText);

rl.question(">>Type something  ", function(answer) {
    let timeNow = new Date();
    let result = autoCorrect.correctSentence(answer);
    let timeAfter = new Date();
    console.log(`Did you mean: \'${result}\'?`);
    console.log(`Performed in ${timeAfter - timeNow}ms`);
    rl.close();
});