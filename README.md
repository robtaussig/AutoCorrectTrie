# AutoCorrect.js

## Summary: 

- Takes a sentence as its input and returns a new sentence, replacing each invalid word with the word most likely intended. It currently calculates this based off of three heuristics:
    1) The proximity of the mistyped key to the character on a keyboard that would make it a valid word. Example: The input is 'fatner.' Once the program identifies every word that is one deviation away ('father', 'fanner', 'fatter', 'fainer', 'fawner'), it selects 'father' as the most likely answer since 'h' is closer to 'n' compared to the other options ('n' to 't', 't' to 'n', 'i' to 't', and 'w' to 't').
    2) It takes an optional sample text, and creates a complete Markov Chain of the provided text to calculate the odds of specific words combinations. For example, I used an aggregate of my tumblr entries for the following example. A look under the hood for the word 'am' would produce the following object:

        am: { 
        totalWords: 15,
        I: 1,
        after: 1,
        not: 1,
        more: 1,
        with: 2,
        appointment: 1,
        ',': 2,
        so: 1,
        even: 1,
        thankful: 1,
        no: 1,
        very: 1,
        less: 1 
        }

        So for an input of 'I am mofe comfortable on the weekend.' it would identify 'mofe' as an invalid word, with possible alternatives being 'mode', 'more', 'move', 'mote', 'mome', 'moue', 'moke', 'mole', and 'mope'. Referring to the Markov chain, specifically for the word 'am' (the word that precedes 'mofe' in the input text), it would give 'more' the nod because it has followed the word 'am' once in the sample text (my tumblr account), whereas none of the other words have been used specifically after 'am.' (I was initially confused why 'appointment' would ever follow 'am' but it came from the following sentence: 'I have a 7 am appointment', which reveals a flaw in using Markov chains for this purpose).

    3) The 'commonality' of each word, based on its position in a sorted list of English words (by frequency), which is used to construct the Trie originally (whenever a word is created, it is assigned a property noting its rank).

  For now, I am not as concerned with the exact weight of each heuristic as I am with the functionality of the program. Words are sorted by their 'proximity', 'probability', and 'commonality' and assigned an overall score based on their position in each sorted list. Commonality is weighted 3 times based on early experimentation, as it seems to be the most predictive heuristic.

## Features:
- Implements a Trie datastructure to map every word in a given text file as valid. From a dictionary of 172,824 words, 387,888 nodes are created, each containing 5 properties: 
    1) next - points to all nodes containing valid letter continuations).
    2) ~~prev~~ - Removed both because it is not necessary and creates a circular reference.
    3) isWord - indicates whether the currentNode marks the completion of a word, even if there are still possible nodes to explore.
    4) value - Not required as each node's value can be derived from the key held by the node that points to it, but for now it is helpful for conceptualizing everything.
    5) ~~string~~ - Removed because it is unnecessary and takes up a lot of space considering it is merely a small convenience. Words can still be reconstructed based on path to node.
    6) Commonality - Position in the list of 10,000 'most common' words in the English dictionary. This helps predict words later on with greater accuracy.

- Capable of returning an array of suggested words, sorted by their likelihood of being the intended word (if the original word is not valid).
- Can also take a sentence and auto-replace all invalid words with the most likely alternative based on the above heuristic. An example is below.

## Example input:

>>Input: I wjkl nevrr understtnf wht somw peoklr preeer Ditt Sida. Wht nlt jusr ddynk qater?

## Output:


Output: 'I will never understand why some people prefer Diet Soda. Why not just drink water?'
Performed in 62ms

## Example input with accompanying sample text:

(Sample text: kafka.txt)
Input: hwre is an exanple of tge resolts beinf afcected by the sanple tects becaust ve czn see thet ude wordd differebtly

Output: here is an example of the results being affected by the sample texts because he can see that use words differently

(Sample text: tumblr.txt)
Input: hwre is an exanple of tge resolts beinf afcected by the sanple tects becaust ve czn see thet ude wordd differebtly

Output: here is an example of the results being affected by the sample texts because we can see they use words differently

The first difference is after the word 'because.' If we look at Kafka's markov chain for that word, we get this:

{ totalWords: 21,
  he: 6,
  as: 1,
  the: 1,
  of: 6,
  these: 1,
  ',': 2,
  it: 1,
  'Gregor\'s': 1,
  her: 1,
  she: 1 }

For tumblr.txt, we get the following:

{ totalWords: 13,
  recursive: 1,
  we: 3,
  DFS: 1,
  I: 3,
  'Big-O': 1,
  gosh: 1,
  the: 1,
  without: 1,
  in: 1 }

So for the spelling mistake of 've,' it was determined that Kafka's most likely continuation from because (that is also a possible mistake of 've') was 'he', which is one deviation away, whereas in tumblr.txt, the most likely continuation is 'we.' The second difference, 'can see that' vs 'can see they' is explained by looking at the two markov chains: in kafka.txt, 'see' is used 39 times, and the only word that is one deviation from 'thet' is 'that', which is used 4 times after 'see'. In tumblr.txt, 'see' is used 9 times, but is never followed by a word that is a possible typo of 'thet', and therefore it defaults to the word that is closest in proximity based on keystrokes (thet -> that is the difference of e->t, which is further on the keyboard than thet->they, or t->y).

Does this mean that the author of tumblr.txt is a better writer than Kafka? I'll let the reader decide. 

## Limitations:

1) The weight assigned to proximity vs Markov chain probability vs commonality is not finely tuned right now. I was more concerned with getting the functionality down, and when everything is ready I will go deeper into tweaking everything.

## To do:

1) Identify mistakes, even if the mistake happens to create a valid word.
