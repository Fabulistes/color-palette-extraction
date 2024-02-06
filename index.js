const buildPalette = (colorsList) => {
  let out = [];

  // const orderedByColor = orderByLuminance(colorsList);
  // const hslColors = convertRGBtoHSL(orderedByColor);

  const orderedByColor = colorsList;

  for (let i = 0; i < orderedByColor.length; i++) {
    const hexColor = rgbToHex(orderedByColor[i]);

    if (i > 0) {
      const difference = calculateColorDifference(
        orderedByColor[i],
        orderedByColor[i - 1] 
      );

      // if the distance is less than 120 we ommit that color
      if (difference < 120) {
        continue;
      }
    }

    out.push(hexColor);
  }

  return out;
};

const displayPalettes = (colorsList) => {

  let j = 0;

  colorsList.forEach(palette => {

    const paletteContainer = document.getElementById("palette" + j);

    for (let i = 0; i < palette.length; i++) {

      // create the div and text elements for both colors & append it to the document
      const colorElement = document.createElement("div");
      colorElement.style.backgroundColor = palette[i];
      colorElement.appendChild(document.createTextNode(palette[i]));
      paletteContainer.appendChild(colorElement);
    }
    j++;
  });
  
};

//  Convert each pixel value ( number ) to hexadecimal ( string ) with base 16
const rgbToHex = (pixel) => {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  return (
    "#" +
    componentToHex(pixel.r) +
    componentToHex(pixel.g) +
    componentToHex(pixel.b)
  ).toUpperCase();
};

/**
 * Convert HSL to Hex
 * this entire formula can be found in stackoverflow, credits to @icl7126 !!!
 * https://stackoverflow.com/a/44134328/17150245
 */
const hslToHex = (hslColor) => {
  const hslColorCopy = { ...hslColor };
  hslColorCopy.l /= 100;
  const a =
    (hslColorCopy.s * Math.min(hslColorCopy.l, 1 - hslColorCopy.l)) / 100;
  const f = (n) => {
    const k = (n + hslColorCopy.h / 30) % 12;
    const color = hslColorCopy.l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

/**
 * Convert RGB values to HSL
 * This formula can be
 * found here https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
 */
const convertRGBtoHSL = (rgbValues) => {
  return rgbValues.map((pixel) => {
    let hue,
      saturation,
      luminance = 0;

    // first change range from 0-255 to 0 - 1
    let redOpposite = pixel.r / 255;
    let greenOpposite = pixel.g / 255;
    let blueOpposite = pixel.b / 255;

    const Cmax = Math.max(redOpposite, greenOpposite, blueOpposite);
    const Cmin = Math.min(redOpposite, greenOpposite, blueOpposite);

    const difference = Cmax - Cmin;

    luminance = (Cmax + Cmin) / 2.0;

    if (luminance <= 0.5) {
      saturation = difference / (Cmax + Cmin);
    } else if (luminance >= 0.5) {
      saturation = difference / (2.0 - Cmax - Cmin);
    }

    /**
     * If Red is max, then Hue = (G-B)/(max-min)
     * If Green is max, then Hue = 2.0 + (B-R)/(max-min)
     * If Blue is max, then Hue = 4.0 + (R-G)/(max-min)
     */
    const maxColorValue = Math.max(pixel.r, pixel.g, pixel.b);

    if (maxColorValue === pixel.r) {
      hue = (greenOpposite - blueOpposite) / difference;
    } else if (maxColorValue === pixel.g) {
      hue = 2.0 + (blueOpposite - redOpposite) / difference;
    } else {
      hue = 4.0 + (greenOpposite - blueOpposite) / difference;
    }

    hue = hue * 60; // find the sector of 60 degrees to which the color belongs

    // it should be always a positive angle
    if (hue < 0) {
      hue = hue + 360;
    }

    // When all three of R, G and B are equal, we get a neutral color: white, grey or black.
    if (difference === 0) {
      return false;
    }

    return {
      h: Math.round(hue) + 180, // plus 180 degrees because that is the complementary color
      s: parseFloat(saturation * 100).toFixed(2),
      l: parseFloat(luminance * 100).toFixed(2),
    };
  });
};

/**
 * Using relative luminance we order the brightness of the colors
 * the fixed values and further explanation about this topic
 * can be found here -> https://en.wikipedia.org/wiki/Luma_(video)
 */
const orderByLuminance = (rgbValues) => {
  const calculateLuminance = (p) => {
    return 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;
  };

  return rgbValues.sort((p1, p2) => {
    return calculateLuminance(p2) - calculateLuminance(p1);
  });
};

const buildRgb = (imageData) => {
  const rgbValues = [];
  // note that we are loopin every 4!
  // for every Red, Green, Blue and Alpha
  for (let i = 0; i < imageData.length; i += 4) {
    const rgb = {
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2],
    };

    rgbValues.push(rgb);
  }

  return rgbValues;
};

/**
 * Calculate the color distance or difference between 2 colors
 *
 * further explanation of this topic
 * can be found here -> https://en.wikipedia.org/wiki/Euclidean_distance
 * note: this method is not accuarate for better results use Delta-E distance metric.
 */
const calculateColorDifference = (color1, color2) => {
  const rDifference = Math.pow(color2.r - color1.r, 2);
  const gDifference = Math.pow(color2.g - color1.g, 2);
  const bDifference = Math.pow(color2.b - color1.b, 2);

  return rDifference + gDifference + bDifference;
};

// returns what color channel has the biggest difference
const findBiggestColorRange = (rgbValues) => {
  /**
   * Min is initialized to the maximum value posible
   * from there we procced to find the minimum value for that color channel
   *
   * Max is initialized to the minimum value posible
   * from there we procced to fin the maximum value for that color channel
   */
  let rMin = Number.MAX_VALUE;
  let gMin = Number.MAX_VALUE;
  let bMin = Number.MAX_VALUE;

  let rMax = Number.MIN_VALUE;
  let gMax = Number.MIN_VALUE;
  let bMax = Number.MIN_VALUE;

  rgbValues.forEach((pixel) => {
    rMin = Math.min(rMin, pixel.r);
    gMin = Math.min(gMin, pixel.g);
    bMin = Math.min(bMin, pixel.b);

    rMax = Math.max(rMax, pixel.r);
    gMax = Math.max(gMax, pixel.g);
    bMax = Math.max(bMax, pixel.b);
  });

  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;

  // determine which color has the biggest difference
  const biggestRange = Math.max(rRange, gRange, bRange);
  if (biggestRange === rRange) {
    return "r";
  } else if (biggestRange === gRange) {
    return "g";
  } else {
    return "b";
  }
};

/**
 * Median cut implementation
 * can be found here -> https://en.wikipedia.org/wiki/Median_cut
 */
const quantization = (rgbValues, depth, MAX_DEPTH) => {

  // Base case
  if (depth === MAX_DEPTH || rgbValues.length === 0) {
    const color = rgbValues.reduce(
      (prev, curr) => {
        prev.r += curr.r;
        prev.g += curr.g;
        prev.b += curr.b;

        return prev;
      },
      {
        r: 0,
        g: 0,
        b: 0,
      }
    );

    color.r = Math.round(color.r / rgbValues.length);
    color.g = Math.round(color.g / rgbValues.length);
    color.b = Math.round(color.b / rgbValues.length);

    return [color];
  }

  /**
   *  Recursively do the following:
   *  1. Find the pixel channel (red,green or blue) with biggest difference/range
   *  2. Order by this channel
   *  3. Divide in half the rgb colors list
   *  4. Repeat process again, until desired depth or base case
   */
  const componentToSortBy = findBiggestColorRange(rgbValues);
  // rgbValues.sort((p1, p2) => {
  //   return p1[componentToSortBy] - p2[componentToSortBy];
  // });

  const mid = rgbValues.length / 2;
  return [
    ...quantization(rgbValues.slice(0, mid), depth + 1, MAX_DEPTH),
    ...quantization(rgbValues.slice(mid + 1), depth + 1, MAX_DEPTH),
  ];
};

const processImage = () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  for (let k = 0; k < 6; k++) {
    const paletteContainer = document.getElementById("palette" + k);
    // reset the HTML in case you load various images
    paletteContainer.innerHTML = "";
  }

  let palettes = [];

  for (let i = 0; i < 6; i++) {

    console.log('--------- part :', i);

      /**
     * getImageData returns an array full of RGBA values
     * each pixel consists of four values: the red value of the colour, the green, the blue and the alpha
     * (transparency). For array value consistency reasons,
     * the alpha is not from 0 to 1 like it is in the RGBA of CSS, but from 0 to 255.
     */

    let imageData;

    let c3 = canvas.width / 3;
    let h2 = canvas.height / 2;

    switch (i) {
      case 0:
        imageData = ctx.getImageData(0, 0, c3, h2);
        break;
      case 1:
        imageData = ctx.getImageData(c3, 0, c3, h2);
        break;
      case 2:
        imageData = ctx.getImageData(c3 * 2, 0, c3, h2);
        break;
      case 3:
        imageData = ctx.getImageData(0, h2, c3, h2);
        break;
      case 4:
        imageData = ctx.getImageData(c3, h2, c3, h2);
        break;
      case 5:
        imageData = ctx.getImageData(c3 * 2, h2, c3, h2);
        break;
    }
    

    // Convert the image data to RGB values so its much simpler
    const rgbArray = buildRgb(imageData.data);

    let palette = [];

    for (let depth = 6; depth < 12; depth++) {
      
      console.log('try depth :', depth);

        /**
       * Color quantization
       * A process that reduces the number of colors used in an image
       * while trying to visually maintin the original image as much as possible
       */
      const quantColors = quantization(rgbArray, 0, depth);
      
      palette = buildPalette(quantColors);

      if(palette.length >= 40) {
        break;
      }
      
    }
    

    console.log(palette.length);

    if(palette.length < 40) {
      console.log('non');
      alert("impossible de générer 40 échantillons sur l'image");
      return false;
    }else {
      console.log('oui');

      let out = [];

      for (let u = 0; u < palette.length && out.length < 40; u = u + palette.length / 40) {
        const color = palette[Math.floor(u)];
        out.push(color);
      }

      palettes.push(out);
    }

  }

  return palettes;
};

const loadImage = () => {
  const imgFile = document.getElementById("imgfile");
  const image = new Image();
  const file = imgFile.files[0];
  const fileReader = new FileReader();

  document.getElementById('video').classList.add('hidden');

  // Whenever file & image is loaded procced to extract the information from the image
  fileReader.onload = () => {
    image.onload = () => {

      const canvas = document.getElementById("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);

      let data = processImage();
      console.log('image palette', data);
      if(data) {
        displayPalettes(data);
      }
    };
    image.src = fileReader.result;
  };
  fileReader.readAsDataURL(file);
}

const loadVideo = () => {

  if(document.getElementById('videoframerate').value.includes(',')) {
    alert('Format framrate incorrect');
    return;
  }
  let framerate = parseFloat(document.getElementById('videoframerate').value);

  let currentFrame = 1;

  let videoColors = [];

  const videoFile = document.getElementById("videofile");
  const videoEl = document.getElementById('video');
  const canvas = document.getElementById("canvas");
  videoEl.classList.remove('hidden');

  const file = videoFile.files[0];

  var reader = new FileReader();
  reader.onload = function(e) {
    videoEl.src = e.target.result;

    videoEl.load();

    videoEl.addEventListener('loadeddata', function() {
      console.log(videoEl.duration);
      videoEl.currentTime = (videoEl.duration / (videoEl.duration * framerate));
    });

    videoEl.addEventListener('seeked', function() {
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
  
      let ctx = canvas.getContext('2d');
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height );

      let data = processImage();
      videoColors.push(data);
      if(data) {
        displayPalettes(data);
      }

      if(currentFrame < Math.floor(videoEl.duration * framerate)) {
        currentFrame++;
        videoEl.currentTime = (videoEl.duration / (videoEl.duration * framerate)) * currentFrame;
      }else { // process done

        for (let p = 0; p < videoColors.length; p++) {
          const time = videoColors[p];
          for (let k = 0; k < time.length; k++) {
            const cloud = time[k];
            let str = '';
            for (let i = 0; i < cloud.length; i++) {
              const color = cloud[i];
              str += color.slice(1);
              str += i == cloud.length / 2 - 1 ? ':' : i == cloud.length - 1 ? '' : ',';
            }
            videoColors[p][k] = str;
          }
        } 

        console.log(videoColors);

        let out = {
          generator: 'Color palette creator',
          filename: file.filename,
          author: 'Loic Quinquenel',
          github: 'https://github.com/Fabulistes/color-palette-extraction',
          data: videoColors,
          dataLength: videoColors.length
        }

        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(out));
        let dlAnchorElem = document.getElementById('downloadAnchorElem');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "theme.json");
        dlAnchorElem.click();
      }
    });


  }.bind(this);
  reader.readAsDataURL(file);

}

