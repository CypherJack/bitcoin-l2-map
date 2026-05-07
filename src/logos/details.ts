// Detail logos shown in the side panel. Each is rendered as <img> at runtime.
export interface DetailLogo {
  src: string;
  alt: string;
}

export const DETAILS: Record<string, DetailLogo> = {
  "btc": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f72c047082a2a7c89d4_bitcoin.svg",
    "alt": "Bitcoin"
  },
  "ln": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f73285a130fed6d5ca9_lightning-netwok.svg",
    "alt": "Lightning"
  },
  "spark": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f72656ce076ab5f0c9b_spark.svg",
    "alt": "Spark"
  },
  "rgb": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f7281358dbb86c60bde_rgb.svg",
    "alt": "RGB"
  },
  "bitvm": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f72a5892c5bb372f690_bitvm.svg",
    "alt": "BitVM"
  },
  "liquid": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f726b3e88ab0d5cc5d0_liquid.svg",
    "alt": "Liquid"
  },
  "rsk": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f720f1b0b43b0e2c43a_rootstock.svg",
    "alt": "Rootstock"
  },
  "citrea": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f72def586cce58f0981_citrea.svg",
    "alt": "Citrea"
  },
  "ark": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f724deab7a55d683d82_arkade.svg",
    "alt": "Ark"
  },
  "fedi": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f720bff70462a99e9ee_ecash.svg",
    "alt": "e-cash"
  },
  "ordinals": {
    "src": "https://cdn.prod.website-files.com/688e6d7092aabedfae99d3ff/69fb5f7235b04269e66740f0_inscription.svg",
    "alt": "Inscriptions"
  }
};
