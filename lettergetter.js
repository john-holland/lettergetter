/**
 * Written by John Holland, licensed under MIT License.
 */

(function(){
    window.LG = window.LG || {};
    var LG = window.LG;
    LG.shouldCache = true;
    LG.cache = { };
    /**
     * Gets a list of lists of points, representing the pixels in the letters of a word.
     * TODO: Currently getPoints doesn't get non-black pixels, but it would be cool to use the normalized distance between white and the color as the opacity.
     *
     * @param string The string to get the pixels for.
     * @param font The font to render the string in.
     * @returns {Array} A list of list of normalized pixels vectors for the letters of the string passed in.
     */
    LG.get = function(string, font) {
        if (!string) {
            throw newError('IllegalArgument', 'A non-empty string is required.');
        }

        if (string in LG.cache) {
            return LG.cache[string];
        }

        var useFont = !!font ? "40px "+ font.trim() : "40px Calibri";

        var canvas = canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        var points = [];
        for (var i = 0; i < string.length; i++) {
            var char = string.charAt(i);

            points.push(getPoints(char, useFont, canvas));
        }

        $(canvas).remove();

        LG.cache[string] = points;
        return points;
    };

    function newError(type, message) {
        return {
            type: type,
            message: message,
            toString: function() { return this.type + ": " + message; }
        };
    }

    function getPoints(string, font, cacheCanvas) {
        //I want to fill the canvas with white and draw black text on it. Then for each point that's black, I need to
        //  push that point into an array. During the loop to get the black pixels, I'll store the top left and bottom right points of the drawn string.
        //  using these, I'll fix the offset to zero and normalize each point.
        var useFont = font;
        if (!useFont) {
            useFont = "40px Calibri";
        }


        var canvas = cacheCanvas;

        if (!canvas) {
            canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
        }
        canvas.width = 800;
        canvas.height = 600;
        canvas.style.position = "absolute";
        canvas.style.top = "-200%";

        var canvasContext = canvas.getContext("2d");

        var imageWidth = canvas.width;
        var imageHeight = canvas.height;
        var message = string;

        if (message) {
            message = message.trim();
        }

        if (!message) {
            throw newError("IllegalArgument", "String must be non-empty.");
        }

        var textSizePX = 40;
        //fill it with white
        canvasContext.fillStyle = "white";
        canvasContext.fillRect(0,0,800,600);

        //draw some black text on it
        canvasContext.fillStyle = "black";
        canvasContext.font = useFont;

        // The width of the text will vary with font size. The width is in pixels and is returned as a textMetrics object.
        var textDimensions = canvasContext.measureText(message);
        textDimensions.height = canvasContext.measureText("M").width; //this is a hack! and it's only a close approximation (but it actually works pretty well...)

        var textHeight = textDimensions.height;
        var textWidth = textDimensions.width;

        // You don't have to draw the text on canvas to measure its width. This is only for reference
        canvasContext.fillText(message, 0, textHeight);

        var imageData = canvasContext.getImageData(0, 0, 800, 600);
        var pixels = imageData.data;
        var points = [];
        var topLeft = {x: 1000000, y: 1000000};
        var bottomRight = {x:0, y:0};

        for (var y = 0; y < imageHeight; y++) {
            for (var x = 0; x < imageWidth; x++) {

                var offset = (y * imageWidth + x) * 4;
                //pixels[offset] //red
                //pixels[offset + 1]; //green
                //pixels[offset + 2]; //blue
                //pixels[offset + 3]; //alpha
                if (pixels[offset] === 0 && pixels[offset + 1] === 0 && pixels[offset + 2] === 0) {
                    if (topLeft.x > x) {
                        topLeft.x = x;
                    }

                    if (topLeft.y > y) {
                        topLeft.y = y;
                    }

                    if (bottomRight.x < x) {
                        bottomRight.x = x;
                    }

                    if (bottomRight.y < y) {
                        bottomRight.y = y;
                    }

                    points.push({
                        x: x,
                        y: y
                    });
                }
            }
        }

        var previousBottom = { x: bottomRight.x, y: bottomRight.y };
        var previousBottomLength = length(previousBottom);

        function length(point) {
            if (typeof point.z !== 'undefined') {
                return Math.sqrt((point.x * point.x) + (point.y * point.y) + (point.z * point.z))
            } else {
                return Math.sqrt((point.x * point.x) + (point.y * point.y))
            }
        }

        function normalize(point) {
            var pointLength = length(point);
            return {x: point.x / pointLength, y: point.y / pointLength};
        }

        bottomRight.x = bottomRight.x - topLeft.x;
        bottomRight.y = bottomRight.y - topLeft.y;



        //since we have the offset from topLeft, then we'll subtract that from each of the points and normalize them.
        points.forEach(function(point) {
            var x = point.x - topLeft.x;
            var y = point.y - topLeft.y;

            var pointLength = length(bottomRight);

            point.x = x / pointLength;
            point.y = y / pointLength;
        });

        if (!cacheCanvas) {
            $(canvas).remove();
        }

        var bottomRightLength = length(bottomRight);
        return {
            points: points,
            left: topLeft.x / previousBottomLength,
            right: bottomRight.x / bottomRightLength,
            top: topLeft.y / previousBottomLength,
            bottom: bottomRight.y / bottomRightLength
        };
    }
})();