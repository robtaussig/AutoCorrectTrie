const Trie = require('./Trie.js');
const WordPriority = require('./WordPriority.js');

module.exports = class AutoCorrect {
    constructor(validWords, exampleText = false) {
        this.trie = new Trie(validWords);
        this.wordPriority = new WordPriority(exampleText);
    }

    correctSentence(sentence) {
        let currentSentence = [];
        let sentenceArray = sentence.split(' ');
        for (let i = 0; i < sentenceArray.length; i++) {
            let currentWord = sentenceArray[i];
            let suggestedWords = this.suggestWords(currentWord);
            if (suggestedWords.length > 0) {
                let sortedWords = suggestedWords.sort((a,b) => {
                    let aCloseness = this.wordPriority.wordProbability(currentSentence[i - 1], a);
                    let bCloseness = this.wordPriority.wordProbability(currentSentence[i - 1], b);
                    return this.wordPriority.wordProbability(currentSentence[i - 1], b) - this.wordPriority.wordProbability(currentSentence[i - 1], a);
                });
                currentSentence.push(sortedWords[0]);
            }
            else {
                currentSentence.push(currentWord + '*');
            }
        }
        return currentSentence.join(' ');
    }

    findValidAlternativeNodes(word, position) {
        let alternatives = [];
        if (position === 0) {
            for (let firstLetter in this.trie.nodes) {
                if (firstLetter !== word[position]) {
                    alternatives.push(this.trie.nodes[firstLetter]);
                }
            }
        }
        else {
            let currentNode = this.trie.nodes[word[0]];
            for (let i = 1; i < position; i++) {
                if (!currentNode) {
                    break;
                }
                currentNode = currentNode.next[word[i]];
            }
            if (currentNode) {
                for (let child in currentNode.next) {
                    if (child !== word[position]) {
                        alternatives.push(currentNode.next[child]);
                    }
                }
            }
        }
        return alternatives;
    }

    findValidAlternativeWords(word, position) {
        let relatives = [];
        let validAlternativeNodes = this.findValidAlternativeNodes(word, position);
        //Test whether it is possible to find a valid word by following the same path as the original word, except for the replaced letter
        for (let i = 0; i < validAlternativeNodes.length; i++) {
            let depth = 1;
            let currentNode = validAlternativeNodes[i];
            let subString = word.slice(0,position) + currentNode.value;
            while (currentNode.next[word[position + depth]] && position + depth < word.length) {
                currentNode = currentNode.next[word[position + depth]];
                subString += currentNode.value;
                depth++;
            }
            //If hit the word length and is a valid word, push into relatives array
            if (position + depth === word.length && currentNode.checkIsWord()) {
                relatives.push(subString);
            }
        }
        return relatives;
    }

    isValidWord(word) {
        if (typeof word !== 'string' || word.length < 1) return false;
        let currentNode = this.trie.nodes[word[0].toLowerCase()];
        for (let i = 1; i < word.length; i++) {
            let nextNode = currentNode.next[word[i].toLowerCase()];
            if (nextNode) {
                currentNode = nextNode;
            }
            else {
                return false;
            }
        }
        return currentNode.checkIsWord();
    }

    //Assumes both words are the same length and only deviate by one letter
    measureClosesness(word1, word2) {
        let firstUniqueLetter;
        let secondUniqueLetter;
        for (let i = 0; i < word1.length; i++) {
            if (word1[i] !== word2[i]) {
                firstUniqueLetter = word1[i].toLowerCase();
                secondUniqueLetter = word2[i].toLowerCase();
            }
        }

        let xDiff = Math.abs(this.wordPriority.closenessMap[firstUniqueLetter].x - this.wordPriority.closenessMap[secondUniqueLetter].x);
        let yDiff = Math.abs(this.wordPriority.closenessMap[firstUniqueLetter].y - this.wordPriority.closenessMap[secondUniqueLetter].y);
        let closeness = Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2));
        return closeness;
    }

    sortWordsByLikelihood(suggestedWords, word) {

        return suggestedWords.sort((a,b) => {
            let keyboardClosenessA = this.measureClosesness(a.replace(/\W/g, ''), word.replace(/\W/g, ''));
            let keyboardClosenessB = this.measureClosesness(b.replace(/\W/g, ''), word.replace(/\W/g, ''));
            return keyboardClosenessA - keyboardClosenessB;
        });
    }

    suggestWords(word) {
        if (typeof word !== 'string' || word.length < 1) return [];
        //Test for uppercase. If so, remember that and recapitalize after search.
        let upperCase = false;
        if (word[0] === word[0].toUpperCase()) {
            upperCase = true;
            word = word.toLowerCase();
        }
        let punctuation = word.match(/[^A-Za-z]/);

        word = word.replace(/\W/g, '');

        let suggestedWords = [];
        if (this.isValidWord(word)) {
            return [word];
        }
        else {
            for (let i = 0; i < word.length; i++) {
                // Go through each letter in the given word, and check whether replacing it with any other letter results in a valid word
                let alternativeWords = this.findValidAlternativeWords(word, i);
                suggestedWords = suggestedWords.concat(alternativeWords);
            }
        }
        if (upperCase) {
            suggestedWords = suggestedWords.map(el => {
                return el[0].toUpperCase() + el.slice(1).toLowerCase();
            });
        }
        if (punctuation) {
            suggestedWords = suggestedWords.map(el => {
                return punctuation.index === 0 ? punctuation[0] + el : el + punctuation[0];
            });
        }
        return this.sortWordsByLikelihood(suggestedWords, word);
    }
};