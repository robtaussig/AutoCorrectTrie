module.exports =  class Node {
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

    checkIsWord() {
        return this.isWord;
    }

    setIsWord() {
        this.isWord = true;
    }
};