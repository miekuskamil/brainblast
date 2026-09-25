

export function makeRng(e = Date.now()) {
  let t = e >>> 0,
    n = () => {
      t = (t + 1831565813) >>> 0;
      let e = t;
      return (
        (e = Math.imul(e ^ (e >>> 15), e | 1)),
        (e ^= e + Math.imul(e ^ (e >>> 7), e | 61)),
        ((e ^ (e >>> 14)) >>> 0) / 4294967296
      );
    };
  return {
    next: n,
    int: (e, t) => e + Math.floor(n() * (t - e + 1)),
    pick: (e) => e[Math.floor(n() * e.length)],
    sample: (e, t) => {
      let r = [...e],
        i = [];
      for (; i.length < t && r.length;)
        i.push(r.splice(Math.floor(n() * r.length), 1)[0]);
      return i;
    },
    shuffle: (e) => {
      let t = [...e];
      for (let e = t.length - 1; e > 0; e--) {
        let r = Math.floor(n() * (e + 1));
        [t[e], t[r]] = [t[r], t[e]];
      }
      return t;
    },
  };
}

export const defaultRng = makeRng();
