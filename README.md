lettergetter
============

Gets the normalized vectors for the pixels in a string, with an option for a different font to render.

lettergetter depends on jquery, and exposes the global "LG".

LG has a single function:

```javascript
var word = LG.get(wordToShow);

word.forEach(function(letter) {
	letter.forEach(function(point) {

	});
});
```

Caveats:

It doesn't do opacity. It doesn't handle thin characters well, or puncuation well ('.' is just 6 pixels...)