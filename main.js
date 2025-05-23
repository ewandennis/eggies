const EGG_W = 500;
const EGG_H = 600;
const EGG_SHOULDER = 0.25;

// origin at centre
// shapes centred on position
// y is down

const ANGLE_HORIZ = 0;
const ANGLE_TL_BR = Math.PI/4;
const ANGLE_VERT = Math.PI/2;
const ANGLE_TR_BL = 3*Math.PI/4;
const ANGLES = [ANGLE_HORIZ, ANGLE_TL_BR, ANGLE_VERT, ANGLE_TR_BL];

const EGG_STEPS = 150;

class Egg extends Two.Path {
  // The Fritz Hugelschaffer egg curve
  constructor({w, h, two}) {
    const path = [];
    const a = 3;
    const b = 2;
    const d = 0.5;
    const scale = h/4;
    for (let i = 0; i < EGG_STEPS; i++) {
      const t = i / EGG_STEPS * Math.PI * 2;
      const sin = Math.sin(t);
      const cos = Math.cos(t);
      const xx = (Math.sqrt(a*a - d*d * sin*sin) + d * cos) * cos;
      const yy = b * sin;
      const x = yy * scale;
      const y = (d * scale) - xx * scale;
      if (i === 0) {
        path.push(new Two.Anchor(x, y, 0, 0, 0, 0, Two.Commands.move));
      } else {
        path.push(new Two.Anchor(x, y, 0, 0, 0, 0, Two.Commands.line));
      }
    }
    
    super(path, true, false, true);
    two.add(this);
  }
}

class FlatPattern extends Two.Rectangle {
  constructor({w, h, colour}) {
    super(-w/2, -h/2, w*3, h*3);
    this.noStroke();
    this.fill = colour;
  }
}
;
class StripePattern extends Two.Group {
  constructor({w, h, size, angle, colour, two}) {
    super();
    const stripeHeight = size * h;
    for(let y = -h/2; y < h/2; y+= stripeHeight*2) {
      const stripe = two.makeRectangle(0, y + stripeHeight/2, w+600, stripeHeight);
      stripe.noStroke();
      stripe.fill = colour;
      this.add(stripe);
    }
    this.rotation = angle;
    two.add(this);
  }
}

class ChequerPattern extends Two.Group {
  constructor({w, h, size, colour, two}) {
    super();
    const checkSize = size * w;
    let oddYFlag = true;
    for(let y = -h; y < h; y += checkSize) {
      let oddXFlag = oddYFlag;
      for (let x = -w; x < w; x += checkSize) {
        if (oddXFlag) {
          const check = two.makeRectangle(x + checkSize/2, y + checkSize/2, checkSize, checkSize);
          check.noStroke();
          check.fill = colour;
          this.add(check);
        }
        oddXFlag = !oddXFlag;
      }
      oddYFlag = !oddYFlag;
    }
    two.add(this);
  }
}

const ZIGZAG_SIZES = [0.2, 0.1];
const MAX_ZIGZAGS = 6;
class ZigzagPattern extends Two.Group {
  constructor({ w, h, size, colour, angle, two}) {
    super();
    const zigSize = w * size;
    const zagSize = zigSize * Math.tan(Math.PI / 4);
    for (let nZigZags = 0, y = -h/2 + zigSize; nZigZags < MAX_ZIGZAGS && y < h - zigSize; nZigZags++, y += zigSize*3) {
      let verts = [];
      let zigOrZag = true;;
      for (let x = -w; x <= w; x += zigSize) {
        const yy = y + (zigOrZag * zagSize);
        verts.push(new Two.Anchor(x, yy, 0, 0, 0, 0));
        zigOrZag = !zigOrZag;
      }
      const zigzag = two.makePath(verts);
      zigzag.stroke = colour;
      zigzag.linewidth = zigSize;
      zigzag.noFill();
      zigzag.closed = false;
      this.add(zigzag);
    }
    this.rotation = angle;
    two.add(this);
  }
}

const PATTERNS = ['flat', 'stripe', 'chequer', 'zigzag'];

const capitalise = s => s[0].toUpperCase() + s.slice(1);

class EasterEgg extends Two.Group {
  constructor({ bg = 'black', fg = 'white', pattern = 'Stripe', size = 0.1, angle = ANGLE_HORIZ, two }) {
    super();

    // egg mask
    const eggShape = new Egg({ w: EGG_W, h: EGG_H, two });
    eggShape.noStroke();
    eggShape.noFill();
    this.mask = eggShape;
    this.add([eggShape]);

    const eggBg = two.makeRectangle(0, 0, EGG_W * 2, EGG_H * 2);
    eggBg.noStroke();
    eggBg.fill = bg;
    this.add([eggBg]);

    // pattern
    const patternClsName = capitalise(pattern) + 'Pattern';
    const PatternCls = eval(patternClsName);
    const patternShape = new PatternCls({ w: EGG_W, h: EGG_H * 1.3, size, angle, colour: fg, two });
    this.add([patternShape]);

    // band

    // subject
  }
}

const COLOURS = [
  ['black', 'white'],
  ['#474', '#ddd'],
  ['cornflowerblue', 'black'],
  ['orange', 'red'],
  ['purple', 'black'],
  ['gold', 'black'],
];

const randInt = max => Math.floor(Math.random()*max);
const makeEggGo = () => {
  const two = new Two({ fullscreen: true }).appendTo(document.body);

  const bg = two.makeRectangle(two.width/2, two.height/2, two.width, two.height);
  bg.noStroke();
  bg.fill = '#333';

  const SCALE = 0.5;
  const colours = COLOURS[randInt(COLOURS.length)];
  const pattern = PATTERNS[randInt(PATTERNS.length)];
  const size = pattern === 'zigzag' || pattern === 'stripe' ? ZIGZAG_SIZES[randInt(ZIGZAG_SIZES.length)] : 0.2;
  const angle = pattern != 'zigzag' ? ANGLES[randInt(ANGLES.length)] : 0;
  const egg = new EasterEgg({
    bg: colours[0],
    fg: colours[1],
    pattern,
    size,
    angle,
    two
  });
  egg.scale = SCALE;
  egg.position.set(two.width/2, two.height/2);
  two.add(egg);

  two.update();

  window.two = two;
};

document.addEventListener('DOMContentLoaded', makeEggGo);
