var fs = require('fs');
//Create array of each word
var text = fs.readFileSync("./files/dictionary.txt", "utf-8").split('\n');

class Trie {
    constructor(validWords) {
        this.trie = {};
        this.validWords = validWords;
        this.createNodes();
        this.closenessMap = [
            ['q','w','e','r','t','y','u','i','o','p'],
            ['a','s','d','f','g','h','j','k','l'],
            ['z','x','c','v','b','n','m']
        ];
        this.closenessMap = {
            a: {x:1,y:0}, b: {x:2,y:4}, c: {x:2,y:2}, d: {x:1,y:2}, e: {x:0,y:2}, 
            f: {x:1,y:3}, g: {x:1,y:4}, h: {x:1,y:5}, i: {x:0,y:7}, j: {x:1,y:6}, 
            k: {x:1,y:7}, l: {x:1,y:8}, m: {x:2,y:6}, n: {x:2,y:5}, o: {x:0,y:8}, 
            p: {x:0,y:9}, q: {x:0,y:0}, r: {x:0,y:3}, s: {x:1,y:1}, t: {x:0,y:4}, 
            u: {x:0,y:6}, v: {x:2,y:3}, w: {x:0,y:1}, x: {x:2,y:1}, y: {x:0,y:5}, z: {x:2,y:0}
        };
    }

    createNodes() {
        //length - 1 accounts for an empty line in the file
        for (let i = 0; i < this.validWords.length - 1; i++) {
            let currentWord = this.validWords[i];
            let firstLetter = currentWord[0];
            let currentNode;
            if (this.trie[firstLetter]) {
                currentNode = this.trie[firstLetter];
            }
            else {
                currentNode = new Node(firstLetter, null);
                this.trie[firstLetter] = currentNode;
            }
            for (let j = 1; j < currentWord.length; j++) {
                currentNode = currentNode.moveToOrCreateNode(currentWord[j]);
            }
            currentNode.setIsWord();
        }
    }

    checkIsWord(word) {
        if (typeof word !== 'string' || word.length < 1) return false;
        let currentNode = this.trie[word[0].toLowerCase()];
        for (let i = 1; i < word.length; i++) {
            let nextNode = currentNode.traverseNode(word[i].toLowerCase());
            if (nextNode) {
                currentNode = nextNode;
            }
            else {
                return false;
            }
        }
        return currentNode.checkIsWord();
    }

    autoCorrect(word) {
        if (typeof word !== 'string' || word.length < 1) return [];
        let suggestedWords = [];
        if (this.checkIsWord(word)) {
            return [word];
        }
        else {
            for (let i = 0; i < word.length; i++) {
                // Go through each letter in the given word, and check whether replacing it with any other letter results in a valid word
                let closeWords = this.findRelatives(word, i);
                suggestedWords = suggestedWords.concat(closeWords);
            }
        }
        return suggestedWords.sort((a,b) => {
            return this.measureClosesness(a, word) - this.measureClosesness(b, word);
        });
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
        let xDiff = Math.abs(this.closenessMap[firstUniqueLetter].x - this.closenessMap[secondUniqueLetter].x);
        let yDiff = Math.abs(this.closenessMap[firstUniqueLetter].y - this.closenessMap[secondUniqueLetter].y);
        let closeness = Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2));
        return closeness;
    }

    findRelatives(word, nodePosition) {
        let relatives = [];
        let children = [];
        if (nodePosition === 0) {
            //Replace first letter with all other valid characters
            for (let firstLetter in this.trie) {
                if (firstLetter !== word[nodePosition]) {
                    children.push(this.trie[firstLetter]);
                }
            }
        }
        else {
            let currentNode = this.trie[word[0]];
            //find node at nodePosition
            for (let i = 1; i < nodePosition; i++ ) {
                //No legal words left
                if (!currentNode) {
                    break;
                }
                currentNode = currentNode.next[word[i]];
            }
            if (currentNode) {
                for (let child in currentNode.next) {
                    if (child !== word[nodePosition]) {
                        children.push(currentNode.next[child]);
                    }
                }
            }   
        }
        //Test whether it is possible to find a valid word by following the same path as the original word, except for the replaced letter
        for (let i = 0; i < children.length; i++) {
            let depth = 1;
            let currentNode = children[i];
            while (currentNode.next[word[nodePosition + depth]] && nodePosition + depth < word.length) {
                currentNode = currentNode.next[word[nodePosition + depth]];
                depth++;
            }
            //If hit the word length and is a valid word, push into relatives array
            if (nodePosition + depth === word.length && currentNode.checkIsWord()) {
                relatives.push(currentNode.string);
            }
        }
        return relatives;
    }
}

class Node {
    constructor(value, prev) {
        this.next = {};
        this.prev = prev;
        this.isWord = false;
        this.value = value.toLowerCase();
        if (prev) {
            this.string = prev.string + this.value;
        }
        else {
            this.string = this.value;
        }
    }

    moveToOrCreateNode(value) {
        let returnValue;
        //Create new node if it doesn't exist
        if (!this.next[value]) {
            returnValue = new Node(value, this);
            this.next[value] = returnValue;
        }
        //Otherwise, move to it
        else {
            returnValue = this.next[value];
        }
        return returnValue;
    }

    traverseNode(value) {
        if (!this.next[value]) {
            return false;
        }
        else {
            return this.next[value];
        }
    }

    checkIsWord() {
        return this.isWord;
    }

    setIsWord() {
        this.isWord = true;
    }
}

var readline = require('readline');

let trie = new Trie(text);

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question(">>Type something  ", function(answer) {
    let result = answer.split(' ').map(el => {
        let suggestedWords = trie.autoCorrect(el);
        if (suggestedWords.length > 0) {
            return suggestedWords[0];
        }
        else {
            return el;
        }
    })
    .join(' ');
    console.log(`Did you mean: \'${result}\'?`);
    rl.close();
});