// Static home-page content mirroring dpetals.com. Image paths are relative to CDN_BASE (src/lib/cdn.ts).
// Swap these for Medusa data (src/lib/medusa) once the backend is wired up.
import type {
  BannerTone,
  CdnImage,
  LinkItem,
  ProductSummary,
  SizedImage,
} from "@/types/home";

export const heroSlides: {
  kicker: string;
  title: string;
  subtitle: string;
  cta: LinkItem;
  imageMain: SizedImage;
  imageAccent: SizedImage;
  chip: { label: string; value: string };
}[] = [
  {
    "kicker": "Natural Skincare",
    "title": "Gentle, effective care for skin and hair.",
    "subtitle": "Chemical-free skincare, haircare and pure essential oils, made for Indian skin and climate.",
    "cta": {
      "label": "Shop Bestsellers",
      "href": "/collections/bestsellers"
    },
    "chip": {
      "label": "4.8 average rating",
      "value": "Loved across India"
    },
    "imageMain": {
      "src": "files/AVI03830.jpg",
      "alt": "Gentle, effective care for skin and hair.",
      "width": 900,
      "height": 1125
    },
    "imageAccent": {
      "src": "files/AVI03871.jpg",
      "alt": "",
      "width": 600,
      "height": 750
    }
  },
  {
    "kicker": "New launch",
    "title": "Clear skin starts with neem and tea tree.",
    "subtitle": "A face wash with 1% salicylic acid and 1% hyaluronic acid. Clears acne and excess oil without drying. SLS free and Paraben free",
    "cta": {
      "label": "Shop Face Wash",
      "href": "/products/neem-tea-tree-face-wash"
    },
    "chip": {
      "label": "50% off MRP",
      "value": "Neem & Tea Tree Face Wash"
    },
    "imageMain": {
      "src": "files/AVI03894.jpg",
      "alt": "Clear skin starts with neem and tea tree.",
      "width": 900,
      "height": 1125
    },
    "imageAccent": {
      "src": "files/AVI04105.jpg",
      "alt": "",
      "width": 600,
      "height": 750
    }
  },
  {
    "kicker": "Gift set",
    "title": "Six pure oils. One beautiful box.",
    "subtitle": "Six pure essential oils for sleep, focus, hair, skin and home. Now 80% off MRP.",
    "cta": {
      "label": "Shop the Set",
      "href": "/products/essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser"
    },
    "chip": {
      "label": "80% off MRP",
      "value": "6 x 15ml Gift Set"
    },
    "imageMain": {
      "src": "files/WhatsApp_Image_2026-07-12_at_22.16.00.jpg",
      "alt": "Six pure oils. One beautiful box.",
      "width": 900,
      "height": 900
    },
    "imageAccent": {
      "src": "files/dp-cat-combos-v4.jpg",
      "alt": "",
      "width": 600,
      "height": 600
    }
  }
];

export const valueCards: SizedImage[] = [
  {
    "src": "files/WhatsApp_Image_2026-02-21_at_9.51.59_AM.jpg",
    "alt": "Pure Actives",
    "width": 600,
    "height": 600
  },
  {
    "src": "files/dp-val-natural.jpg",
    "alt": "Botanical Extracts",
    "width": 600,
    "height": 800
  },
  {
    "src": "files/dp-val-fresh.jpg",
    "alt": "Aroma Oils",
    "width": 600,
    "height": 800
  },
  {
    "src": "files/dp-val-pure.jpg",
    "alt": "Ancient Ayurveda",
    "width": 600,
    "height": 800
  },
  {
    "src": "files/dp-val-nochem.jpg",
    "alt": "No Harsh Chemicals",
    "width": 600,
    "height": 800
  }
];

export const concerns: {
  title: string;
  description: string;
  href: string;
  image: CdnImage;
}[] = [
  {
    "title": "Acne & Oil Control",
    "description": "Neem, tea tree, salicylic acid, multani mitti",
    "href": "/collections/skincare",
    "image": {
      "src": "files/dp-concern-acne-oil.jpg",
      "alt": "Acne & Oil Control"
    }
  },
  {
    "title": "Glow & Pigmentation",
    "description": "Kumkumadi, saffron, rose, vitamin E",
    "href": "/collections/skincare",
    "image": {
      "src": "files/dp-concern-glow-pigmentation.jpg",
      "alt": "Glow & Pigmentation"
    }
  },
  {
    "title": "Hydration & Dryness",
    "description": "Aloe gels, body butters, jojoba oil",
    "href": "/collections/skincare",
    "image": {
      "src": "files/dp-concern-dryness-v2.jpg",
      "alt": "Hydration & Dryness"
    }
  },
  {
    "title": "Hair Fall & Dandruff",
    "description": "Rosemary oil, ayurvedic mask, nourishing gel",
    "href": "/collections/haircare",
    "image": {
      "src": "files/dp-concern-hairfall-dandruff.jpg",
      "alt": "Hair Fall & Dandruff"
    }
  },
  {
    "title": "Relax & Aromatherapy",
    "description": "Lavender, sandalwood, eucalyptus, diffuser sets",
    "href": "/collections/essential-oils-for-aromatherapy",
    "image": {
      "src": "files/dp-concern-relax-spa-v2.jpg",
      "alt": "Relax & Aromatherapy"
    }
  }
];

export const bestsellers: ProductSummary[] = [
  {
    "handle": "neem-tea-tree-face-wash",
    "title": "Neem & Tea Tree Face Wash",
    "image": {
      "src": "files/face_wash_with_props.png",
      "alt": "Neem & Tea Tree Face Wash"
    },
    "subtitle": "Face Wash · 120 ml",
    "price": 250,
    "mrp": 499,
    "currency": "INR",
    "isNew": true,
    "rating": null
  },
  {
    "handle": "hair-nourishing-gel-mask-conditioner",
    "title": "Hair Nourishing Gel — Mask cum Conditioner",
    "image": {
      "src": "files/Nourishing_Gel_With_Props.jpg",
      "alt": "Hair Nourishing Gel — Mask cum Conditioner"
    },
    "subtitle": "Conditioner · 180 g",
    "price": 250,
    "mrp": 499,
    "currency": "INR",
    "isNew": true,
    "rating": null
  },
  {
    "handle": "ayurvedic-hair-mask",
    "title": "Ayurvedic Hair Mask",
    "image": {
      "src": "files/Hair_Pack.png",
      "alt": "Ayurvedic Hair Mask"
    },
    "subtitle": "Hair Mask · 100 g",
    "price": 275,
    "mrp": 499,
    "currency": "INR",
    "isNew": false,
    "rating": {
      "average": 4,
      "count": 1
    }
  },
  {
    "handle": "lemongrass-basil-body-wash",
    "title": "Lemongrass & Basil Body Wash",
    "image": {
      "src": "files/1_0de2b355-368e-4276-a6af-802222a61bb9.jpg",
      "alt": "Lemongrass & Basil Body Wash"
    },
    "subtitle": "Body Wash · 200 ml",
    "price": 225,
    "mrp": 499,
    "currency": "INR",
    "isNew": false,
    "rating": {
      "average": 5,
      "count": 1
    }
  },
  {
    "handle": "rose-mint-aloe-vera-gel",
    "title": "Rose Mint Aloe Vera Gel",
    "image": {
      "src": "files/rosemint_aloevera_with_probs.png",
      "alt": "Rose Mint Aloe Vera Gel"
    },
    "subtitle": "Moisturizer · 200 g",
    "price": 250,
    "mrp": 399,
    "currency": "INR",
    "isNew": true,
    "rating": {
      "average": 5,
      "count": 1
    }
  },
  {
    "handle": "sandalwood-essential-oil",
    "title": "Sandalwood Essential Oil",
    "image": {
      "src": "files/1_59a4f5e6-58d1-4c8d-a416-6f1c316bbaad.jpg",
      "alt": "Sandalwood Essential Oil"
    },
    "subtitle": "Essential Oil · 15 ml",
    "price": 225,
    "mrp": 499,
    "currency": "INR",
    "isNew": true,
    "rating": null
  },
  {
    "handle": "multani-mitti-face-pack",
    "title": "Multani Mitti Face Pack",
    "image": {
      "src": "files/MultaniMittiStoreListing_1.jpg",
      "alt": "Multani Mitti Face Pack"
    },
    "subtitle": "· 200 g",
    "price": 150,
    "mrp": 399,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  {
    "handle": "rose-water-face-mist-toner",
    "title": "Rose Water Face Mist Toner",
    "image": {
      "src": "files/Rosewater-Listing_1.jpg",
      "alt": "Rose Water Face Mist Toner"
    },
    "subtitle": "· 100 ml",
    "price": 150,
    "mrp": 299,
    "currency": "INR",
    "isNew": false,
    "rating": null
  }
];

export const haircarePicks: ProductSummary[] = [
  {
    "handle": "ayurvedic-hair-mask",
    "title": "Ayurvedic Hair Mask",
    "image": {
      "src": "files/Hair_Pack.png",
      "alt": "Ayurvedic Hair Mask"
    },
    "subtitle": "Hair Mask · 100 g",
    "price": 275,
    "mrp": 499,
    "currency": "INR",
    "isNew": false,
    "rating": {
      "average": 4,
      "count": 1
    }
  },
  {
    "handle": "cold-pressed-jojoba-oil",
    "title": "Cold Pressed Jojoba Oil",
    "image": {
      "src": "files/1.jpg",
      "alt": "Cold Pressed Jojoba Oil"
    },
    "subtitle": "Oil · 100 ml",
    "price": 599,
    "mrp": 999,
    "currency": "INR",
    "isNew": false,
    "rating": {
      "average": 5,
      "count": 5
    }
  },
  {
    "handle": "hair-care-combo-herbal-hair-mask-nourishing-gel",
    "title": "Hair Care Combo – Herbal Hair Mask & Nourishing Gel",
    "image": {
      "src": "files/hair_care_combo_2_dd55eb93-67a4-478d-8459-ae4faeef48fa.jpg",
      "alt": "Hair Care Combo – Herbal Hair Mask & Nourishing Gel"
    },
    "subtitle": "Haircare Combo",
    "price": 450,
    "mrp": 998,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  {
    "handle": "hair-nourishing-gel-mask-conditioner",
    "title": "Hair Nourishing Gel — Mask cum Conditioner",
    "image": {
      "src": "files/Nourishing_Gel_With_Props.jpg",
      "alt": "Hair Nourishing Gel — Mask cum Conditioner"
    },
    "subtitle": "Conditioner · 180 g",
    "price": 250,
    "mrp": 499,
    "currency": "INR",
    "isNew": true,
    "rating": null
  },
  {
    "handle": "rosemary-essential-oil",
    "title": "Rosemary Essential Oil",
    "image": {
      "src": "files/Rosemary_Listing_Image_0004_Rosemary_Store_Listing_1.jpg",
      "alt": "Rosemary Essential Oil"
    },
    "subtitle": "· 15 ml",
    "price": 225,
    "mrp": 499,
    "currency": "INR",
    "isNew": false,
    "rating": {
      "average": 5,
      "count": 4
    }
  },
  {
    "handle": "tea-tree-essential-oil",
    "title": "Tea Tree Essential Oil",
    "image": {
      "src": "files/TeaTreeListingImage_0004_TeaTreeStoreListing_1.jpg",
      "alt": "Tea Tree Essential Oil"
    },
    "subtitle": "· 15 ml",
    "price": 225,
    "mrp": 499,
    "currency": "INR",
    "isNew": false,
    "rating": {
      "average": 5,
      "count": 2
    }
  }
];

export const skincarePicks: ProductSummary[] = [
  {
    "handle": "neem-tea-tree-face-wash",
    "title": "Neem & Tea Tree Face Wash",
    "image": {
      "src": "files/face_wash_with_props.png",
      "alt": "Neem & Tea Tree Face Wash"
    },
    "subtitle": "Face Wash · 120 ml",
    "price": 250,
    "mrp": 499,
    "currency": "INR",
    "isNew": true,
    "rating": null
  },
  {
    "handle": "rose-mint-aloe-vera-gel",
    "title": "Rose Mint Aloe Vera Gel",
    "image": {
      "src": "files/rosemint_aloevera_with_probs.png",
      "alt": "Rose Mint Aloe Vera Gel"
    },
    "subtitle": "Moisturizer · 200 g",
    "price": 250,
    "mrp": 399,
    "currency": "INR",
    "isNew": true,
    "rating": {
      "average": 5,
      "count": 1
    }
  },
  {
    "handle": "cucumber-aloe-vera-gel",
    "title": "Cucumber Aloe Vera Gel",
    "image": {
      "src": "files/Artboard_2_copy_2.jpg",
      "alt": "Cucumber Aloe Vera Gel"
    },
    "subtitle": "· 200 g / 500 g",
    "price": 250,
    "mrp": 399,
    "currency": "INR",
    "isNew": false,
    "rating": {
      "average": 4.89,
      "count": 9
    }
  },
  {
    "handle": "saffron-kumkumadi-aloe-vera-gel",
    "title": "Saffron Kumkumadi Aloe Vera Gel",
    "image": {
      "src": "files/Artboard_2_copy_3.jpg",
      "alt": "Saffron Kumkumadi Aloe Vera Gel"
    },
    "subtitle": "Moisturizer · 200 g",
    "price": 250,
    "mrp": 399,
    "currency": "INR",
    "isNew": true,
    "rating": null
  },
  {
    "handle": "rose-water-face-mist-toner",
    "title": "Rose Water Face Mist Toner",
    "image": {
      "src": "files/Rosewater-Listing_1.jpg",
      "alt": "Rose Water Face Mist Toner"
    },
    "subtitle": "· 100 ml",
    "price": 150,
    "mrp": 299,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  {
    "handle": "multani-mitti-face-pack",
    "title": "Multani Mitti Face Pack",
    "image": {
      "src": "files/MultaniMittiStoreListing_1.jpg",
      "alt": "Multani Mitti Face Pack"
    },
    "subtitle": "· 200 g",
    "price": 150,
    "mrp": 399,
    "currency": "INR",
    "isNew": false,
    "rating": null
  }
];

export const comboProducts: ProductSummary[] = [
  {
    "handle": "rose-water-multani-mitti-face-pack-combo",
    "title": "Rose Water & Multani Mitti Face Pack Combo",
    "image": {
      "src": "files/New_Steam_Distilled_Rose_water_Multani_Mitti_Combo_1.jpg",
      "alt": "Rose Water & Multani Mitti Face Pack Combo"
    },
    "subtitle": "Skincare Combo",
    "price": 275,
    "mrp": 398,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  {
    "handle": "aloe-vera-gel-combo-set-of-3-cucumber-rose-mint-saffron-kumkumadi",
    "title": "Aloe Vera Gel Combo (Set of 3) - Cucumber, Rose Mint & Saffron Kumkumadi",
    "image": {
      "src": "files/all_aloevera_gel_combo_e878fac6-1eb5-4a49-ade5-7155e018c13c.png",
      "alt": "DPetals Aloe Vera Gel Combo set of 3 jars"
    },
    "subtitle": "Skincare Combo · 3 x 200 g (600 g total)",
    "price": 599,
    "mrp": 1197,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  {
    "handle": "hair-care-combo-herbal-hair-mask-nourishing-gel",
    "title": "Hair Care Combo – Herbal Hair Mask & Nourishing Gel",
    "image": {
      "src": "files/hair_care_combo_2_dd55eb93-67a4-478d-8459-ae4faeef48fa.jpg",
      "alt": "Hair Care Combo – Herbal Hair Mask & Nourishing Gel"
    },
    "subtitle": "Haircare Combo",
    "price": 450,
    "mrp": 998,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  {
    "handle": "body-butter-combo-set-of-2-moroccan-mirage-citrus-sunrise",
    "title": "Body Butter Combo (Set of 2) - Moroccan Mirage & Citrus Sunrise",
    "image": {
      "src": "files/Body_butter_banner_3719f681-698a-49d8-ab84-2ddddd58f883.png",
      "alt": "Body Butter Combo (Set of 2) - Moroccan Mirage & Citrus Sunrise"
    },
    "subtitle": "Body Care Combo · 2 x 180 g (360 g total)",
    "price": 499,
    "mrp": 1398,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  {
    "handle": "luxury-body-wash-combo-set-of-3-lemongrass-basil-saffron-patchouli-sandalwood-cedarwood",
    "title": "Luxury Body Wash Combo (Set of 3) - Lemongrass & Basil, Saffron & Patchouli, Sandalwood & Cedarwood",
    "image": {
      "src": "files/all_body_wash_c1cb36be-e015-4ae1-9380-77845cd27ba6.jpg",
      "alt": "DPetals Body Wash Combo set of 3 sulphate-free shower gels"
    },
    "subtitle": "Body Care Combo · 3 x 200 ml (600 ml total)",
    "price": 599,
    "mrp": 1497,
    "currency": "INR",
    "isNew": false,
    "rating": null
  }
];

export const ingredients: CdnImage[] = [
  {
    "src": "files/dp-ing-butter-whip.jpg",
    "alt": "Whipped butters"
  },
  {
    "src": "files/dp-ing-oil-pour.jpg",
    "alt": "Cold pressed oils"
  },
  {
    "src": "files/dp-ing-milk-pour.jpg",
    "alt": "Small fresh batches"
  },
  {
    "src": "files/dp-ing-cashew.jpg",
    "alt": "Nut butters"
  },
  {
    "src": "files/dp-ing-herb-powder.jpg",
    "alt": "Herb infusions"
  },
  {
    "src": "files/dp-ing-aloe.jpg",
    "alt": "Fresh aloe vera"
  }
];

export const categories: { title: string; href: string; image: CdnImage }[] = [
  {
    "title": "Skincare",
    "href": "/collections/skincare",
    "image": {
      "src": "files/dp-cat-skincare-model.jpg",
      "alt": "Skincare"
    }
  },
  {
    "title": "Haircare",
    "href": "/collections/haircare",
    "image": {
      "src": "files/dp-cat-haircare-model.jpg",
      "alt": "Haircare"
    }
  },
  {
    "title": "Body Care",
    "href": "/collections/body-wash",
    "image": {
      "src": "files/dp-cat-bodycare-model.jpg",
      "alt": "Body Care"
    }
  },
  {
    "title": "Essential Oils",
    "href": "/collections/essential-oils-for-aromatherapy",
    "image": {
      "src": "files/dp-cat-essential-oils-v3.jpg",
      "alt": "Essential Oils"
    }
  },
  {
    "title": "Combos & Kits",
    "href": "/collections/combo",
    "image": {
      "src": "files/dp-cat-combos-kit-v5.jpg",
      "alt": "Combos & Kits"
    }
  }
];

export const comboKits: { title: string; href: string; image: CdnImage }[] = [
  {
    "title": "Body Butters",
    "href": "/products/body-butter-combo-set-of-2-moroccan-mirage-citrus-sunrise",
    "image": {
      "src": "files/Body_butter_banner_3719f681-698a-49d8-ab84-2ddddd58f883.png",
      "alt": "Body Butters"
    }
  },
  {
    "title": "Body Wash Kit",
    "href": "/products/luxury-body-wash-combo-set-of-3-lemongrass-basil-saffron-patchouli-sandalwood-cedarwood",
    "image": {
      "src": "files/all_body_wash.jpg",
      "alt": "Body Wash Kit"
    }
  },
  {
    "title": "Essential oils gift set",
    "href": "/products/essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser",
    "image": {
      "src": "files/dp-cat-combos-v4.jpg",
      "alt": "Essential oils gift set"
    }
  },
  {
    "title": "Hair care combo",
    "href": "/products/hair-care-combo-herbal-hair-mask-nourishing-gel",
    "image": {
      "src": "files/hair_care_combo_2.jpg",
      "alt": "Hair care combo"
    }
  },
  {
    "title": "Rose water + Multani mitti",
    "href": "/products/rose-water-multani-mitti-face-pack-combo",
    "image": {
      "src": "files/New_Steam_Distilled_Rose_water_Multani_Mitti_Combo_1.jpg",
      "alt": "Rose water + Multani mitti"
    }
  },
  {
    "title": "Aloevera Combo",
    "href": "/products/aloe-vera-gel-combo-set-of-3-cucumber-rose-mint-saffron-kumkumadi",
    "image": {
      "src": "files/all_aloevera_gel_combo.png",
      "alt": "Aloevera Combo"
    }
  }
];

export const spotlight = {
  "badge": "NEW LAUNCH",
  "title": "Essential Oils Combo Set for Aromatherapy and Diffuser",
  "image": {
    "src": "files/01EssentialOilGiftsetMockup_a500cadb-1262-409c-9c6f-4a48a6bb1313.jpg",
    "alt": "Essential Oils Combo Set for Aromatherapy and Diffuser",
    "width": 900,
    "height": 900
  },
  "points": [
    "Covers sleep, focus, hair, skin and home",
    "Six 100% pure steam-distilled oils",
    "Beautiful gift-ready box",
    "Big savings vs buying individually"
  ],
  "price": 599,
  "mrp": 1499,
  "currency": "INR",
  "handle": "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser"
};

export const promoBanners: {
  id: string;
  tone: BannerTone;
  kicker: string;
  titleMain: string;
  titleAccent: string;
  text: string;
  cta: LinkItem;
  image: SizedImage;
}[] = [
  {
    "id": "hair",
    "tone": "sage",
    "kicker": "Nutri-powered haircare",
    "titleMain": "Ayurvedic Hair Masks",
    "titleAccent": "Strength conditioning, naturally",
    "text": "Rosemary, bhringraj and amla infused slowly in nourishing butters. No sulphates, no silicones.",
    "cta": {
      "label": "Shop Haircare",
      "href": "/collections/haircare"
    },
    "image": {
      "src": "files/dp-banner-hairmask-v3.png",
      "alt": "Ayurvedic Hair Masks",
      "width": 784,
      "height": 992
    }
  },
  {
    "id": "glow",
    "tone": "meadow",
    "kicker": "Skincare and Haircare Routine",
    "titleMain": "Aloevera Gels",
    "titleAccent": "Fresh Herbal Rituals for Radiant Skin",
    "text": "Saffron and kumkumadi botanicals brighten and even skin tone. Rose and Mint Extract provides cooling sensation. Cucumber calms the skin and conditions frizzy hair.",
    "cta": {
      "label": "Shop Skincare",
      "href": "/collections/skincare"
    },
    "image": {
      "src": "files/combo_aloevera_gel.jpg",
      "alt": "Aloevera Gels",
      "width": 1024,
      "height": 1024
    }
  },
  {
    "id": "aroma",
    "tone": "sand",
    "kicker": "Mindfulness. Relaxation",
    "titleMain": "Aroma Oils",
    "titleAccent": "6 Assorted Essential Oils in one Box",
    "text": "Use them in diffuser, aromatherapy, massage, candle making and many more",
    "cta": {
      "label": "Shop Aroma Oils",
      "href": "/collections/skincare"
    },
    "image": {
      "src": "files/10.jpg",
      "alt": "Aroma Oils",
      "width": 1024,
      "height": 1024
    }
  },
  {
    "id": "shower",
    "tone": "mist",
    "kicker": "Exotic Spa",
    "titleMain": "Shower Gels",
    "titleAccent": "Infused with Vitamin E and Aroma Oils",
    "text": "Premium and Luxury Bathing Experience with our Exotic Body Wash Range",
    "cta": {
      "label": "Shop Body Wash",
      "href": "/collections/body-wash"
    },
    "image": {
      "src": "files/AVI04117.jpg",
      "alt": "Shower Gels",
      "width": 1024,
      "height": 1024
    }
  },
  {
    "id": "hair-gel",
    "tone": "peach",
    "kicker": "Good Hair Day Daily",
    "titleMain": "Hair Nourishing Gel",
    "titleAccent": "Deep Conditioning for Frizzy Hair",
    "text": "Enriched with Seabuckthorn Oil, Hibiscus Extract, Argan Oil, Sweet Almond Oil and Rosemary Oil.",
    "cta": {
      "label": "Shop Haircare",
      "href": "/products/hair-nourishing-gel-mask-conditioner"
    },
    "image": {
      "src": "files/Hair_Nourishing_Gel.png",
      "alt": "Hair Nourishing Gel",
      "width": 1248,
      "height": 832
    }
  }
];

export const whyDpetals = {
  "title": "Why DPetals",
  "text": "Potent botanicals meet modern, thoughtfully formulated care. Honest formulas without parabens, sulphates or needless additives. Gentle enough for daily use and made for Indian skin and climate.",
  "cta": {
    "label": "Explore all products",
    "href": "/collections/all"
  },
  "points": [
    {
      "icon": "🌿",
      "title": "Rooted in nature",
      "text": "Neem, kumkumadi, amla and rosemary. Botanicals with centuries of use."
    },
    {
      "icon": "🔬",
      "title": "Thoughtfully formulated",
      "text": "Actives like 1% salicylic and hyaluronic acid at effective, gentle levels."
    },
    {
      "icon": "🚫",
      "title": "No harsh chemicals",
      "text": "No SLS, parabens or needless additives in any formula."
    },
    {
      "icon": "🤝",
      "title": "Premium Quality",
      "text": "Up notch Product Quality with USFDA approved manufacturing facilities"
    }
  ]
};

export const reels: {
  video: string;
  poster: string;
  productHandle: string;
  productTitle: string;
  price: number;
  mrp: number;
  currency: string;
}[] = [
  {
    "video": "https://cdn.shopify.com/videos/c/vp/24ef1b0331b647b58f7422cee8d59d83/24ef1b0331b647b58f7422cee8d59d83.SD-480p-1.2Mbps-89569090.mp4",
    "poster": "files/Artboard_2_copy_2.jpg",
    "productHandle": "cucumber-aloe-vera-gel",
    "productTitle": "Cucumber Aloe Vera Gel",
    "price": 250,
    "mrp": 399,
    "currency": "INR"
  },
  {
    "video": "https://cdn.shopify.com/videos/c/vp/325709db7a9e40f18f9756c829513ee9/325709db7a9e40f18f9756c829513ee9.SD-480p-1.2Mbps-89569088.mp4",
    "poster": "files/Hair_Pack.png",
    "productHandle": "ayurvedic-hair-mask",
    "productTitle": "Ayurvedic Hair Mask",
    "price": 275,
    "mrp": 499,
    "currency": "INR"
  },
  {
    "video": "https://cdn.shopify.com/videos/c/vp/599551fb1828498aac11c4ad5aba2fa7/599551fb1828498aac11c4ad5aba2fa7.SD-480p-1.2Mbps-89569093.mp4",
    "poster": "files/Nourishing_Gel_With_Props.jpg",
    "productHandle": "hair-nourishing-gel-mask-conditioner",
    "productTitle": "Hair Nourishing Gel — Mask cum Conditioner",
    "price": 250,
    "mrp": 499,
    "currency": "INR"
  },
  {
    "video": "https://cdn.shopify.com/videos/c/vp/7d590c53cae94b7ea48f21b630fed062/7d590c53cae94b7ea48f21b630fed062.SD-480p-1.0Mbps-89569165.mp4",
    "poster": "files/1_fcc2f581-1bf2-4269-892e-cbb518ac9cdc.jpg",
    "productHandle": "moroccan-mirage-body-butter",
    "productTitle": "Moroccan Mirage Body Butter",
    "price": 299,
    "mrp": 699,
    "currency": "INR"
  },
  {
    "video": "https://cdn.shopify.com/videos/c/vp/5eb0c83bb7cb4a5284a347495736681e/5eb0c83bb7cb4a5284a347495736681e.SD-480p-1.0Mbps-89569092.mp4",
    "poster": "files/New_Steam_Distilled_Rose_water_Multani_Mitti_Combo_1.jpg",
    "productHandle": "rose-water-multani-mitti-face-pack-combo",
    "productTitle": "Rose Water & Multani Mitti Face Pack Combo",
    "price": 275,
    "mrp": 398,
    "currency": "INR"
  },
  {
    "video": "https://cdn.shopify.com/videos/c/vp/0b98348672f3472790db378736ebdf25/0b98348672f3472790db378736ebdf25.SD-480p-1.0Mbps-89569094.mp4",
    "poster": "files/Artboard_2_copy_2.jpg",
    "productHandle": "cucumber-aloe-vera-gel",
    "productTitle": "Cucumber Aloe Vera Gel",
    "price": 250,
    "mrp": 399,
    "currency": "INR"
  },
  {
    "video": "https://cdn.shopify.com/videos/c/vp/58fbb2cbc5be4d40a617aaa673fa8c40/58fbb2cbc5be4d40a617aaa673fa8c40.SD-480p-1.2Mbps-89569089.mp4",
    "poster": "files/Nourishing_Gel_With_Props.jpg",
    "productHandle": "hair-nourishing-gel-mask-conditioner",
    "productTitle": "Hair Nourishing Gel — Mask cum Conditioner",
    "price": 250,
    "mrp": 499,
    "currency": "INR"
  },
  {
    "video": "https://cdn.shopify.com/videos/c/vp/40938ddb7e964a94b9fee635ea644bdc/40938ddb7e964a94b9fee635ea644bdc.SD-480p-1.0Mbps-89569091.mp4",
    "poster": "files/face_wash_with_props.png",
    "productHandle": "neem-tea-tree-face-wash",
    "productTitle": "Neem & Tea Tree Face Wash",
    "price": 250,
    "mrp": 499,
    "currency": "INR"
  }
];

export const reviews: {
  rating: number;
  text: string;
  author: string;
  product: string;
}[] = [
  {
    "rating": 5,
    "text": "The kumkumadi gel is now a non-negotiable in my routine. Visible glow in two weeks and it doesn't break me out.",
    "author": "Priya S.",
    "product": "Saffron Kumkumadi Gel, Ahmedabad"
  },
  {
    "rating": 5,
    "text": "Ordered the jojoba oil for makeup removal. It works better than my micellar water.",
    "author": "Meera K.",
    "product": "Cold Pressed Jojoba Oil, Mumbai"
  },
  {
    "rating": 4,
    "text": "Hair mask smells earthy and real, like homemade. My scalp already feels calmer.",
    "author": "Ananya R.",
    "product": "Ayurvedic Hair Mask, Pune"
  }
];

export const blogPosts: {
  handle: string;
  title: string;
  excerpt: string;
  category: string | null;
  image: SizedImage;
}[] = [
  {
    "handle": "unlock-the-secrets-of-frankincense-discover-its-remarkable-benefits-for-wellness",
    "title": "Unlock the Secrets of Frankincense: Discover Its Remarkable Health Benefits",
    "excerpt": "Frankincense, the ancient resin derived from the Boswellia tree, has long been revered for its captivating ...",
    "category": "Aroma Oil",
    "image": {
      "src": "articles/out-0_4b6f0b75-56b4-4e23-beb5-486b56c44190.png",
      "alt": "Unlock the Secrets of Frankincense: Discover Its Remarkable Health Benefits",
      "width": 720,
      "height": 411
    }
  },
  {
    "handle": "revive-your-hair-with-this-nourishing-diy-hair-pack",
    "title": "Revive Your Hair with This Nourishing DIY Hair Pack",
    "excerpt": "Healthy, vibrant hair is a true reflection of our overall well-being. In today's fast-paced world, where we...",
    "category": null,
    "image": {
      "src": "articles/out-0_9452b292-1b5f-4788-b816-abcde09df0fb.png",
      "alt": "Revive Your Hair with This Nourishing DIY Hair Pack",
      "width": 720,
      "height": 411
    }
  },
  {
    "handle": "soothe-your-headache-with-the-power-of-peppermint-essential-oil",
    "title": "Soothe Your Headache with the Power of Peppermint Essential Oil",
    "excerpt": "Dealing with a persistent headache can be a real pain, both literally and figuratively. Whether it's a tens...",
    "category": null,
    "image": {
      "src": "articles/out-0.png",
      "alt": "Soothe Your Headache with the Power of Peppermint Essential Oil",
      "width": 720,
      "height": 411
    }
  }
];
