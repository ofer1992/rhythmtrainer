Training left and right hand independence for pop, rock, blues etc genres. The idea is to drill the left hand pattern of choice over varying right hand rhythms.

Written in JS.

Parts to tackle:
- input from user - already done before using vexflow fast input and parsed. perhaps can be done again.
- display - vexflow or abcjs? abcjs might be easier to interact with but interactivity isn't crucial at first
- timing is handled with tone
- capturing and evalutating - webmidi, question is how to integrate with tone js
  - i delay every timing of tone js with an offset. is there a cleaner way?