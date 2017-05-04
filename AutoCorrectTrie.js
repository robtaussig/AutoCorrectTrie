var fs = require('fs');
//Create array of each word
var text = fs.readFileSync("./files/dictionary.txt", "utf-8").split('\n');

class Trie {
    constructor(validWords) {
        this.trie = {};
        this.validWords = validWords;
        this.createNodes();
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
                currentNode = currentNode.traverseOrCreateNode(currentWord[j]);
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
        if (typeof word !== 'string' || word.length < 1) return 'Input must be a string greater than length 0';
        let suggestedWords = [];
        if (this.checkIsWord(word)) {
            return `${word} is a real word!`;
        }
        else {
            for (let i = 0; i < word.length; i++) {
                let closeWords = this.findRelatives(word, i);
                suggestedWords = suggestedWords.concat(closeWords);
            }
        }
        return suggestedWords;
    }

    findRelatives(word, nodePosition) {
        let relatives = [];
        let children = [];
        if (nodePosition === 0) {
            for (let firstLetter in this.trie) {
                if (firstLetter !== word[0]) {
                    children.push(this.trie[firstLetter]);
                }
            }
        }
        else {
            let currentNode = this.trie[word[0]];
            for (let i = 1; i < nodePosition; i++ ) {
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

        for (let i = 0; i < children.length; i++) {
            let depth = 1;
            let currentNode = children[i];
            while (currentNode.next[word[nodePosition + depth]] && nodePosition + depth < word.length) {
                currentNode = currentNode.next[word[nodePosition + depth]];
                depth++;
            }
            // console.log(nodePosition, depth);
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

    traverseOrCreateNode(value) {
        let returnValue;
        if (!this.next[value]) {
            returnValue = new Node(value, this);
            this.next[value] = returnValue;
        }
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

    scanNext(value) {
        return !!this.next[value];
    }

    checkIsWord() {
        return this.isWord;
    }

    setIsWord() {
        this.isWord = true;
    }

    closeWords() {
        let closeWords = [];
        for (let key in this.next) {

            if (this.next[key].checkIsWord()) {
                closeWords.push(this.next[key].string);
            }
        }
        return closeWords;
    }
}

let trie = new Trie(text);

let word = 'zogging';
console.log(trie.autoCorrect(word));
