import fs from 'node:fs/promises';

const snackSauzen = {
  name: 'Snacksauzen',
  min: 0,
  max: 2,
  options: [
    { name: 'Mayonaise', price: 0.70 },
    { name: 'Curry', price: 0.70 },
    { name: 'Pindasaus', price: 0.90 },
    { name: 'Ketchup', price: 0.70 },
    { name: 'Speciaal curry', price: 0.85 },
    { name: 'Speciaal ketchup', price: 0.85 },
    { name: 'Mosterd', price: 0.70 },
    { name: 'Joppiesaus', price: 0.85 },
    { name: 'Mayo/curry', price: 0.80 },
    { name: 'Mayo/pinda', price: 0.90 },
    { name: 'Broodje', price: 0.90 },
    { name: 'Samurai', price: 0.75 }
  ]
};

const zonderUiGroep = {
  name: 'Zonder ui',
  min: 0,
  max: 1,
  options: [
    { name: 'Zonder ui', price: 0 }
  ]
};

const aardappelKeuze = {
  name: 'Gebakken aardappels/patat afhaal',
  min: 0,
  max: 1,
  options: [
    { name: 'Patat', price: 2.40 },
    { name: 'Gebakken aardappels', price: 3.25 }
  ]
};

const biefstukBereiding = {
  name: 'Vlees bereiding',
  min: 0,
  max: 1,
  options: [
    { name: 'Medium', price: 0 },
    { name: 'Medium rare', price: 0 },
    { name: 'Rare', price: 0 },
    { name: 'Well done', price: 0 }
  ]
};

const biefstukSauzen = {
  name: 'Biefstuk sauskeuze',
  min: 0,
  max: 2,
  options: [
    { name: '+ kruidenboter', price: 0 },
    { name: '+ pepersaus', price: 0 },
    { name: 'Champignons', price: 2.75 },
    { name: 'Geb. uien', price: 2.75 },
    { name: 'Geb. Champ. en uien', price: 3.00 }
  ]
};

const products = [

  // ======================
  // PATAT
  // ======================

  { id: '1-pers-patat', category: 'Patat', name: '1 pers patat', price: 2.50, optionGroups: [] },
  { id: '2-pers-patat', category: 'Patat', name: '2 pers. patat', price: 4.90, optionGroups: [] },
  { id: '3-pers-patat', category: 'Patat', name: '3 pers. patat', price: 7.25, optionGroups: [] },
  { id: '4-pers-patat', category: 'Patat', name: '4 pers. patat', price: 9.50, optionGroups: [] },
  { id: '5-pers-patat', category: 'Patat', name: '5 pers. patat', price: 11.50, optionGroups: [] },

  {
    id: 'patat-groot',
    category: 'Patat',
    name: 'Patat groot',
    price: 3.15,
    optionGroups: [
      {
        name: 'Pt groot sausoptie',
        min: 0,
        max: 1,
        options: [
          { name: 'Mayonaise', price: 0.70 },
          { name: 'Curry', price: 0.70 },
          { name: 'Ketchup', price: 0.70 },
          { name: 'Joppiesaus', price: 0.85 },
          { name: 'Pindasaus', price: 1.00 },
          { name: 'Speciaal curry', price: 0.95 },
          { name: 'Speciaal ketchup', price: 0.85 },
          { name: 'Mayo/pinda', price: 0.90 },
          { name: 'Oorlog groot', price: 0.90 },
          { name: 'Mayo/curry', price: 0.90 }
        ]
      }
    ]
  },

  { id: 'patat-mayonaise', category: 'Patat', name: 'Patat mayonaise', price: 3.10, optionGroups: [] },
  { id: 'patat-oorlog', category: 'Patat', name: 'Patat oorlog', price: 3.50, optionGroups: [] },
  { id: 'patat-pinda', category: 'Patat', name: 'Patat pinda', price: 3.50, optionGroups: [] },
  { id: 'patat-spec-curry', category: 'Patat', name: 'Patat spec. curry', price: 3.25, optionGroups: [] },
  { id: 'patat-curry', category: 'Patat', name: 'Patat curry', price: 3.10, optionGroups: [] },
  { id: 'patat-joppie', category: 'Patat', name: 'Patat joppie', price: 3.50, optionGroups: [] },
  { id: 'patat-ketchup', category: 'Patat', name: 'Patat ketchup', price: 3.25, optionGroups: [] },
  { id: 'patat-spec-ketchup', category: 'Patat', name: 'Patat spec. ketchup', price: 3.25, optionGroups: [zonderUiGroep] },

  // ======================
  // SNACKS
  // ======================

  { id: 'kroket', category: 'Snacks', name: 'Kroket', price: 2.40, optionGroups: [snackSauzen] },
  { id: 'frikandel', category: 'Snacks', name: 'Frikandel', price: 2.20, optionGroups: [snackSauzen] },
  { id: 'bamibal', category: 'Snacks', name: 'Bamibal', price: 2.50, optionGroups: [snackSauzen] },
  { id: 'frikandel-spec-curry', category: 'Snacks', name: 'Frikandel spec. curry', price: 2.85, optionGroups: [] },
  { id: 'frikandel-mayo-curry', category: 'Snacks', name: 'Frikandel mayo/curry', price: 2.85, optionGroups: [] },
  { id: 'frikandel-spec-ketchup', category: 'Snacks', name: 'Frikandel spec. ketchup', price: 2.85, optionGroups: [zonderUiGroep] },
  { id: 'kalfskroket', category: 'Snacks', name: 'Kalfskroket', price: 2.95, optionGroups: [snackSauzen] },
  { id: 'kwekkeboom-kroket', category: 'Snacks', name: 'Kwekkeboom kroket', price: 2.95, optionGroups: [snackSauzen] },
  { id: 'gehaktbal', category: 'Snacks', name: 'Gehaktbal', price: 3.75, optionGroups: [snackSauzen] },
  { id: 'kaassoufle', category: 'Snacks', name: 'Kaassoufle', price: 2.50, optionGroups: [snackSauzen] },
  { id: 'berehap', category: 'Snacks', name: 'Berehap', price: 2.90, optionGroups: [snackSauzen] },
  { id: 'kipkorn', category: 'Snacks', name: 'Kipkorn', price: 2.50, optionGroups: [snackSauzen] },
  { id: 'mexicano', category: 'Snacks', name: 'Mexicano', price: 2.90, optionGroups: [snackSauzen] },

  // ======================
  // LUXE GERECHTEN
  // ======================

  {
    id: 'weekendmenu',
    category: 'Luxe gerechten',
    name: 'Weekendmenu',
    price: 14.50,
    optionGroups: [
      {
        name: 'Pt/geb aard WM',
        min: 0,
        max: 1,
        options: [
          { name: 'Geb. aardappels', price: 1.25 },
          { name: 'Patat', price: 0 }
        ]
      }
    ]
  },

  {
    id: 'schnitzel',
    category: 'Luxe gerechten',
    name: 'Schnitzel',
    price: 11.00,
    optionGroups: [
      {
        name: 'Warme sauzen Cafetaria',
        min: 0,
        max: 1,
        options: [
          { name: 'Champignons en uien', price: 2.75 },
          { name: 'Zigeunersaus', price: 3.00 },
          { name: 'Champignonroomsaus', price: 3.00 },
          { name: 'Pepersaus', price: 3.00 },
          { name: 'Ham en Kaas', price: 2.00 },
          { name: 'Geb. uien', price: 2.75 }
        ]
      },
      aardappelKeuze
    ]
  },

  {
    id: 'boerenschnitzel',
    category: 'Luxe gerechten',
    name: 'Boerenschnitzel',
    price: 14.00,
    optionGroups: [
      {
        name: 'Boeren/Hoeve',
        min: 0,
        max: 1,
        options: [
          { name: 'Zonder spek', price: 0 },
          { name: 'Zonder uien', price: 0 },
          { name: 'Zonder champignons', price: 0 },
          { name: 'Zonder paprika', price: 0 }
        ]
      },
      {
        name: 'Schnitzel',
        min: 0,
        max: 3,
        options: [
          { name: 'Geb. Ei', price: 1.25 },
          { name: 'Zigeunersaus', price: 3.00 },
          { name: 'Pepersaus', price: 3.00 },
          { name: 'Champ. roomsaus', price: 3.00 },
          { name: 'Champignons', price: 2.75 },
          { name: 'Champignons en uien', price: 2.75 },
          { name: 'Ham en Kaas', price: 2.00 },
          { name: 'Geb. uien', price: 2.75 },
          { name: 'Geb. Champ. en uien', price: 3.00 }
        ]
      },
      aardappelKeuze
    ]
  },

  {
    id: 'kipsate',
    category: 'Luxe gerechten',
    name: 'Kipsaté',
    price: 12.00,
    optionGroups: [aardappelKeuze]
  },

  {
    id: 'kiphaasjes',
    category: 'Luxe gerechten',
    name: 'Kiphaasjes',
    price: 12.00,
    optionGroups: [aardappelKeuze]
  },

  {
    id: 'biefstuk',
    category: 'Luxe gerechten',
    name: 'Biefstuk',
    price: 15.50,
    optionGroups: [
      biefstukBereiding,
      biefstukSauzen,
      aardappelKeuze
    ]
  },

  {
    id: 'biefpuntjes',
    category: 'Luxe gerechten',
    name: 'Biefpuntjes',
    price: 15.50,
    optionGroups: [
      biefstukBereiding,
      biefstukSauzen,
      aardappelKeuze
    ]
  },

  {
    id: 'vega-gyros',
    category: 'Luxe gerechten',
    name: 'Vega gyros',
    price: 15.50,
    optionGroups: [
      {
        name: 'Huisgemaakte koude sauzen',
        min: 0,
        max: 1,
        options: [
          { name: 'Kerriemayonaise', price: 0 },
          { name: 'Cocktailsaus', price: 0 },
          { name: 'Knoflooksaus', price: 0 }
        ]
      },
      {
        name: 'Geen ui/champ',
        min: 0,
        max: 1,
        options: [
          { name: 'Geen champ. & ui', price: 0 },
          { name: 'Geen champ', price: 0 },
          { name: 'Geen ui', price: 0 }
        ]
      },
      aardappelKeuze
    ]
  },

  { id: 'soep-van-de-dag', category: 'Luxe gerechten', name: 'Soep van de dag', price: 6.50, optionGroups: [] },
  { id: 'tomatensoep', category: 'Luxe gerechten', name: 'Tomatensoep', price: 5.50, optionGroups: [] },

  {
    id: 'fish-chips',
    category: 'Luxe gerechten',
    name: 'Fish en chips',
    price: 17.50,
    optionGroups: [
      {
        name: 'Patat of Aardappels',
        min: 0,
        max: 1,
        options: [
          { name: 'Geb. aardappels', price: 0 },
          { name: 'Patat', price: 0 }
        ]
      }
    ]
  },

  // ======================
  // HAMBURGERS
  // ======================

  {
    id: 'broodje-hamburger',
    category: 'Hamburgers',
    name: 'Broodje hamburger',
    price: 4.00,
    optionGroups: [
      {
        name: 'Sauzen Hamburgers',
        min: 0,
        max: 1,
        options: [
          { name: 'Mayonaise', price: 0.70 },
          { name: 'Curry', price: 0.70 },
          { name: 'Pindasaus', price: 0.90 },
          { name: 'Ketchup', price: 0.70 }
        ]
      }
    ]
  },

  { id: 'broodje-hamburger-speciaal', category: 'Hamburgers', name: 'Broodje hamburger speciaal', price: 5.25, optionGroups: [] },
  { id: 'cheeseburger', category: 'Hamburgers', name: 'Cheeseburger', price: 6.00, optionGroups: [] },
  { id: 'broodje-hamburger-hoeve', category: 'Hamburgers', name: 'Broodje hamburger de Hoeve', price: 5.50, optionGroups: [] },

  {
    id: 'kipburger',
    category: 'Hamburgers',
    name: 'Kipburger',
    price: 5.25,
    optionGroups: [
      {
        name: 'Kipburger',
        min: 0,
        max: 1,
        options: [
          { name: 'Zonder samurai', price: 0 },
          { name: 'Zonder spek', price: 0 },
          { name: 'Zonder joppie', price: 0 },
          { name: 'Zonder sla', price: 0 }
        ]
      }
    ]
  },

  { id: 'mexicano-burger', category: 'Hamburgers', name: 'Mexicano burger', price: 5.00, optionGroups: [] },
  { id: 'vegaburger-menu', category: 'Hamburgers', name: 'Vegaburger menu', price: 12.00, optionGroups: [] },

  {
    id: 'hamburger-xxl-menu',
    category: 'Hamburgers',
    name: 'Hamburger XXL menu',
    price: 13.00,
    optionGroups: [
      {
        name: 'Geb. Aard / patat',
        min: 0,
        max: 1,
        options: [
          { name: 'patat', price: 0 },
          { name: 'Geb. aardappels', price: 0 }
        ]
      }
    ]
  },

  // ======================
  // UITSMIJTERS/BROODJES
  // ======================

  {
    id: 'zacht-broodje-beenham',
    category: 'Uitsmijters/broodjes',
    name: 'Zacht broodje beenham',
    price: 6.25,
    optionGroups: [
      {
        name: 'Sauskeuze Beenham',
        min: 0,
        max: 1,
        options: [
          { name: 'Mosterd-dille', price: 0 },
          { name: 'Pindasaus', price: 0 },
          { name: 'Geen saus', price: 0 }
        ]
      }
    ]
  },

  { id: 'zacht-broodje-gezond', category: 'Uitsmijters/broodjes', name: 'Zacht broodje gezond', price: 5.50, optionGroups: [] },

  {
    id: 'zacht-broodje-shoarma',
    category: 'Uitsmijters/broodjes',
    name: 'Zacht broodje shoarma',
    price: 7.25,
    optionGroups: [
      {
        name: 'Sauskeuze shoarma',
        min: 0,
        max: 2,
        options: [
          { name: 'Pindasaus', price: 0.90 },
          { name: 'Mayo/pinda', price: 0.90 },
          { name: 'Knoflooksaus', price: 0.95 },
          { name: 'Cocktailsaus', price: 0.95 },
          { name: 'Dubbele portie shoarma', price: 5.50 }
        ]
      }
    ]
  },

  // ======================
  // SAUZEN
  // ======================

  { id: 'bakje-klein-mayonaise', category: 'Sauzen', name: 'Bakje klein mayonaise', price: 1.25, optionGroups: [] },
  { id: 'bakje-klein-curry', category: 'Sauzen', name: 'Bakje klein curry', price: 1.75, optionGroups: [] },
  { id: 'bakje-klein-pindasaus', category: 'Sauzen', name: 'Bakje klein pindasaus', price: 1.75, optionGroups: [] },
  { id: 'bakje-klein-ketchup', category: 'Sauzen', name: 'Bakje klein ketchup', price: 1.75, optionGroups: [] },
  { id: 'bakje-klein-joppiesaus', category: 'Sauzen', name: 'Bakje klein joppiesaus', price: 1.75, optionGroups: [] },

  { id: 'beker-mayonaise', category: 'Sauzen', name: 'Beker mayonaise', price: 2.00, optionGroups: [] },
  { id: 'beker-curry', category: 'Sauzen', name: 'Beker curry', price: 2.25, optionGroups: [] },
  { id: 'beker-pindasaus', category: 'Sauzen', name: 'Beker pindasaus', price: 2.75, optionGroups: [] },
  { id: 'beker-ketchup', category: 'Sauzen', name: 'Beker ketchup', price: 2.25, optionGroups: [] },
  { id: 'beker-joppiesaus', category: 'Sauzen', name: 'Beker joppiesaus', price: 2.75, optionGroups: [] },

  { id: 'beker-uien', category: 'Sauzen', name: 'Beker uien', price: 1.25, optionGroups: [] },
  { id: 'beker-speciaalsaus', category: 'Sauzen', name: 'Beker speciaalsaus', price: 1.75, optionGroups: [] },
  { id: 'beker-oorlog', category: 'Sauzen', name: 'Beker oorlog', price: 2.75, optionGroups: [] },
  { id: 'bakje-uien', category: 'Sauzen', name: 'Bakje uien', price: 0.75, optionGroups: [] },

  { id: 'beker-knoflooksaus', category: 'Sauzen', name: 'Beker knoflooksaus', price: 2.75, optionGroups: [] },
  { id: 'bakje-knoflooksaus', category: 'Sauzen', name: 'Bakje knoflooksaus', price: 1.50, optionGroups: [] },

  { id: 'beker-champ-roomsaus', category: 'Sauzen', name: 'Beker Champ. roomsaus', price: 2.75, optionGroups: [] },
  { id: 'beker-zigeunersaus', category: 'Sauzen', name: 'Beker Zigeunersaus', price: 2.75, optionGroups: [] },

  // ======================
  // FRISDRANKEN
  // ======================

  { id: 'coca-cola-blik', category: 'Frisdranken', name: 'Coca-cola blik', price: 2.50, optionGroups: [] },
  { id: 'cola-zero-blik', category: 'Frisdranken', name: 'Cola Zero blik', price: 2.50, optionGroups: [] },
  { id: 'fanta-sinas-blik', category: 'Frisdranken', name: 'Fanta sinas blik', price: 2.50, optionGroups: [] },
  { id: 'red-bull-blik', category: 'Frisdranken', name: 'Red bull blik', price: 3.25, optionGroups: [] },
  { id: 'coca-cola-05', category: 'Frisdranken', name: 'Coca-cola 0.5 ltr.', price: 3.00, optionGroups: [] },
  { id: 'chaudfontaine-blauw', category: 'Frisdranken', name: 'Chaudfontaine blauw 0.5 ltr.', price: 2.65, optionGroups: [] },

  // ======================
  // BIJLAGEN
  // ======================

  { id: 'broodje', category: 'Bijlagen', name: 'Broodje', price: 0.90, optionGroups: [] },
  { id: 'portie-gebakken-aardappels-bijlage', category: 'Bijlagen', name: 'Portie geb. aardappels', price: 3.25, optionGroups: [] },
  { id: 'gebakken-uien', category: 'Bijlagen', name: 'Gebakken uien', price: 2.75, optionGroups: [] },
  { id: 'bakje-rauwkost', category: 'Bijlagen', name: 'Bakje rauwkost', price: 2.75, optionGroups: [] },
  { id: 'bakje-macaronisalade', category: 'Bijlagen', name: 'Bakje macaronisalade', price: 2.75, optionGroups: [] },
  { id: 'geb-champ-en-uien', category: 'Bijlagen', name: 'Geb. Champ. en uien', price: 3.00, optionGroups: [] },
  { id: 'bakje-klein-rauwkost', category: 'Bijlagen', name: 'Bakje klein rauwkost', price: 1.35, optionGroups: [] },

  // ======================
  // BITTERGARNITUUR
  // ======================

  { id: 'bitterballen-6', category: 'Bittergarnituur', name: 'Bitterballen 6st.', price: 4.25, optionGroups: [] },
  { id: 'warm-hapje-los', category: 'Bittergarnituur', name: 'warm hapje los', price: 0.95, optionGroups: [] }

];

const menu = {
  updatedAt: new Date().toISOString(),
  source: 'Handmatig ingevoerd via build-menu.mjs',
  products
};

await fs.mkdir('data', { recursive: true });

await fs.writeFile(
  'data/menu.json',
  JSON.stringify(menu, null, 2),
  'utf8'
);

console.log(`Menu opgebouwd: ${products.length} producten`);