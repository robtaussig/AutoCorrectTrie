# AutoCorrectTrie.js

## Example input:

I hsve a hatd tkme xoming ul witg grdat exanples byt heee iz a lomg sentrnce witgout puncfuation bevause tgat is nlt a feqture at tge momrnt ib favt punctuarion woyld probzbly mesw it ul unlrss tne adjaxent wotd ia sprlt corrvctly

## Output:

Did you mean: 'I have a hard time coming up with great examples but here is a long sentence without punctuation because that is not a feature at the moment in fact punctuation would probably mess it up unless the adjacent word is spelt correctly'?

Performed in 16ms

## Limitations:

1) Currently only suggests words that are one deviation away from the invalid word.
2) Invalid words that have no children one step away will be returned as if they are correct.
3) Does not consider context when sugggesting words. Simply suggests words based on proximiy of keys on the keyboard, and for 'ties' (e.g., typing 'ir isn't my fault' will result in 'or isn't my fault') it picks picks whichever suggested version happened to be made first based on how the node was found in the trie.
4) Punctuation is not supported yet. This will not be a difficult fix.

## Ideas:

1) Find a dictionary with words sorted by common use, to use as another metric for prioritizing suggestions (will accomplish this by assigning a property to nodes that make a complete word that will align with its position in the dictionary).

2) Introduce machine learning to scan through a long document and assign relational values to words that commonly go together, to add another heuristic to suggest words more accurately.

3) Increase the scope of suggestions to find words that are 2, 3, or perhaps 4 deviations away from the invalid word.

4) Identify mistakes, even if the mistake happens to create a valid word.
