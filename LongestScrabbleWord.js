var fs = require('fs');
//Create array of each word
var text = fs.readFileSync("./files/enable1.txt", "utf-8").split('\n');

//Create hashmap to quickly look up whether a substring of a word is valid.
var map = {};
for (var i = 0; i < text.length; i++) {
    var word = text[i];
    map[word] = true;
}

//Set up function that determines whether a word can be reduced to a two letter word. Breaks out early if no path is possible.
const wordCrawler = function(word) {
    if (!map[word]) return false;
    if (word.length === 2) return true;
    var leftWord = word.slice(0, word.length - 1);
    var rightWord = word.slice(1);
    var left = wordCrawler(leftWord);
    if (left) return true;
    var right = wordCrawler(rightWord);
    if (right) return true;
    return false;
};

//Sort array by length so that once a possible solution is found, we don't need to check any words thereafter.
var sorted = text.sort(function(a,b) {
    return b.length - a.length;
});

var longestWord = "";
var answers = [];

//Iterate  through words, breaking out of loop once longest possible is found, while storing other possible answers in array.
for (var j = 0; j < sorted.length; j++) {
    var currentWord = sorted[j];
    if (longestWord.length > currentWord.length) {
        break;
    }
    else {
        var result = wordCrawler(currentWord);
        if (result) {
            answers.push(currentWord);
            if (currentWord.length > longestWord.length) {
                longestWord = currentWord;
            }
        }
    }
}

console.log('answers:', answers);
console.log('answer: ', longestWord);
