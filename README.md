# AutoCorrectTrie.js

## Features:
- Implements a Trie datastructure to map every word in a given text file as valid. From a dictionary of 172,824 words, 387,888 nodes are created, each containing 5 properties: 
    1) next - points to all nodes containing valid letter continuations).
    2) prev - points to the previous node. This is definitely not required, and in fact creates a circular reference so it's ill advised. Future plans involve removing this and storing a reference to previous nodes in a temporary variable in cases where we need to travel 'back.'
    3) isWord - indicates whether the currentNode marks the completion of a word, even if there are still possible nodes to explore.
    4) value - also not required as each node's value can be derived from the key held by the node that points to it, but for now it is helpful for conceptualizing everything.
    5) string - the resultant string from traveling to any specific node. Also not necessary, as any word can be derived from the path taken to any particular node. But for now, it is helpful.

- Capable of returning an array of suggested words, sorted by their likelihood of being the intended word (if the original word is not valid). For now, this is based on the proximity of the mistyped characters to the possible alternatives on a keyboard.
- Can also take a sentence and auto-replace all invalid words with the most likely alternative based on the above heuristic. An example is below.
- Accounts for punctuation and capitalization, although only in cases where the punctuation prepends or appends the input text (e.g. '!hello', 'hello,' or '(hey there)', but not 'he!lo'). Stripping punctuation marks is not a challenge, but putting them back in place when returning suggestions complicates things a bit. Ultimately not a hard improvement, but not high up on the priority list. Capilization is only handled in cases where the first letter is capitalized. In fact, 'heLlo' would convert to 'Hello' based on how the program currently checks for capitalization. Also not hard to fix, just not a high priority for now.

## Example input:

I hsve a hatd tkme xoming ul witg grdat exanples, byt heee iz a lomg sentrnce witg puncfuation. Anf capitsl letrers. Nwxt strp iz tl checj fpr worfs futther thab onw devistion awwy.

## Output:

Did you mean: 'I have a hard time coming up with great examples, but here is a long sentence with punctuation. And capital letters. Next step is to check for words further than one deviation away.'?
Performed in 11ms

## Limitations:

1) Currently only suggests words that are one deviation away from the invalid word.
2) Invalid words that have no children one step away will be returned as if they are correct.
3) Does not consider context when sugggesting words. Simply suggests words based on proximiy of keys on the keyboard, and for 'ties' (e.g., typing 'ir isn't my fault' will result in 'or isn't my fault') it picks picks whichever suggested version happened to be made first based on how the node was found in the trie.

## Ideas:

1) Find a dictionary with words sorted by common use, to use as another metric for prioritizing suggestions (will accomplish this by assigning a property to nodes that make a complete word that will align with its position in the dictionary).

2) Introduce some form of machine learning to scan through a long document and assign relational values to words that commonly go together, to add another heuristic to suggest words more accurately.

3) Increase the scope of suggestions to find words that are 2, 3, or perhaps 4 deviations away from the invalid word.

4) Identify mistakes, even if the mistake happens to create a valid word.
