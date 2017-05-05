const Trie = require('./Trie.js');
const WordPriority = require('./WordPriority.js');

module.exports = class AutoCorrect {
    constructor(validWords) {
        this.trie = new Trie(validWords);
        this.wordPriority = new WordPriority();
    }

    correctSentence(sentence) {
        return sentence.split(' ').map(el => {
            let suggestedWords = this.suggestWords(el);
            if (suggestedWords.length > 0) {
                return suggestedWords[0];
            }
            else {
                return el;
            }
        })
        .join(' ');
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
            while (currentNode.next[word[position + depth]] && position + depth < word.length) {
                currentNode = currentNode.next[word[position + depth]];
                depth++;
            }
            //If hit the word length and is a valid word, push into relatives array
            if (position + depth === word.length && currentNode.checkIsWord()) {
                relatives.push(currentNode.string);
            }
        }
        return relatives;
    }

    isValidWord(word) {
        console.log(word);
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
                firstUniqueLetter = word1[i];
                secondUniqueLetter = word2[i];
            }
        }
        let xDiff = Math.abs(this.wordPriority.closenessMap[firstUniqueLetter].x - this.wordPriority.closenessMap[secondUniqueLetter].x);
        let yDiff = Math.abs(this.wordPriority.closenessMap[firstUniqueLetter].y - this.wordPriority.closenessMap[secondUniqueLetter].y);
        let closeness = Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2));
        return closeness;
    }

    sortWordsByLikelihood(suggestedWords, word) {

        return suggestedWords.sort((a,b) => {
            return this.measureClosesness(a, word) - this.measureClosesness(b, word);
        });
    }

    suggestWords(word) {
        if (typeof word !== 'string' || word.length < 1) return [];
        let upperCase = false;
        if (word[0] === word[0].toUpperCase()) {
            upperCase = true;
            word = word.toLowerCase();
        }
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
        return this.sortWordsByLikelihood(suggestedWords, word);
    }
};