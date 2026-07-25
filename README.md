# GeoSERP

Free tool that builds Google search URLs so you can see a SERP the way another
country sees it: local `google.<tld>`, that country's `gl` and its own language
`hl`, with personalization turned off. All 27 EU member states, plus the
largest non EU markets.

Live: https://geoserp.vercel.app

## What works, and what does not

Measured on 2026-07-25 in a normal signed-in Chrome session:

| Parameter | Effect | Evidence |
|---|---|---|
| `gl` + `hl` + local domain | Results change substantially | "project management software" on `gl=de,hl=de` returned projektmagazin.de and openproject.org; `gl=pl,hl=pl` returned flexi-project.com; `gl=us,hl=en` returned paymoapp.com |
| `pws=0` | Personalization off | Google's own footer prints "Results are not personalized" |
| `tbm=lcl` | Switches to local pack and Maps listings | Renders the listings view |
| `uule` (city) | **Ignored in the browser** | Same query on google.cz from a Prague IP with uule for Brno, Ostrava, Pilsen and with no uule at all returned an identical top 10. Google's footer said the location came from the IP address. Both uule forms behaved the same, the `w+` named city form and the `a+` coordinate form |

The tool therefore leads with country and language targeting, and treats the
city `uule` as a string you copy into a SERP API, where requests carry no
browser location state. Google prints the location it actually used at the very
bottom of every results page, which is the only reliable check.

## uule encoding

`uule` is a base64 payload with a literal `w+` prefix wrapping a small protobuf
style message:

```
uule = "w+" + base64(
  0x08 0x02          role = 2
  0x10 0x20          producer = 32
  0x22 <varint len>
  utf8(canonical name)
)
```

Encoding the whole byte array at once matters. The shortcut copied around the
web, `"w+CAIQICI" + alphabet[len] + base64(name)`, only agrees with this for
names up to 63 bytes, because past that the length varint no longer fits in the
low 6 bits of the final prefix character. Google's own dataset goes further: the
longest name is a 119 byte Greek municipality. `src/lib/uule.ts` builds the real
payload, and the test suite pins both the agreement below 63 bytes and the
divergence above it against two uule values captured from live tooling.

## Locations

`public/locations-eu.txt` and `public/locations-world.txt` are generated from the
official [Google Ads geotargets CSV](https://developers.google.com/google-ads/api/data/geotargets),
one `canonicalName|COUNTRY` per line. 88,444 active cities and municipalities,
32,894 of them across all 27 EU member states.

```bash
npm run build:locations   # regenerate from ../data/geotargets.csv
```

## Development

```bash
npm install
npm test          # uule encoder, country table, URL builder, history
npm run dev
npm run build
```

No backend, no database, no analytics. History lives in `localStorage` only.
