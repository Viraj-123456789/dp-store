// Static catalogue mirroring dpetals.com collections (products appear once and are referenced by handle).
// Swap for Medusa product/collection queries (src/lib/medusa) once the backend is wired up.
import type { ProductSummary } from "@/types/home";

export interface CollectionRecord {
  handle: string;
  title: string;
  /** Full <title> shown in the browser tab. */
  seoTitle: string;
  intro: string | null;
  /** Card image on the collections index (omitted for the catch-all "all" collection). */
  image?: { src: string; alt: string };
  productHandles: string[];
}

export const catalog: Record<string, ProductSummary> = {
  "neem-tea-tree-face-wash": {
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
  "rose-mint-aloe-vera-gel": {
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
  "cucumber-aloe-vera-gel": {
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
  "saffron-kumkumadi-aloe-vera-gel": {
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
  "rose-water-face-mist-toner": {
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
  "multani-mitti-face-pack": {
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
  "cold-pressed-jojoba-oil": {
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
  "citrus-sunrise-body-butter": {
    "handle": "citrus-sunrise-body-butter",
    "title": "Citrus Sunrise Body Butter",
    "image": {
      "src": "files/1_e164a1ea-fe1b-41a4-b66c-c47e3cb97635.jpg",
      "alt": "Citrus Sunrise Body Butter"
    },
    "subtitle": "Moisturizer · 180 g",
    "price": 299,
    "mrp": 699,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  "moroccan-mirage-body-butter": {
    "handle": "moroccan-mirage-body-butter",
    "title": "Moroccan Mirage Body Butter",
    "image": {
      "src": "files/1_fcc2f581-1bf2-4269-892e-cbb518ac9cdc.jpg",
      "alt": "Moroccan Mirage Body Butter"
    },
    "subtitle": "Moisturizer · 180 g",
    "price": 299,
    "mrp": 699,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  "ayurvedic-hair-mask": {
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
  "hair-care-combo-herbal-hair-mask-nourishing-gel": {
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
  "hair-nourishing-gel-mask-conditioner": {
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
  "rosemary-essential-oil": {
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
  "tea-tree-essential-oil": {
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
  },
  "saffron-patchouli-body-wash": {
    "handle": "saffron-patchouli-body-wash",
    "title": "Saffron & Patchouli Body Wash",
    "image": {
      "src": "files/1_1.jpg",
      "alt": "Saffron & Patchouli Body Wash"
    },
    "subtitle": "Body Wash · 200 ml",
    "price": 225,
    "mrp": 499,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  "lemongrass-basil-body-wash": {
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
  "sandalwood-cedarwood-body-wash": {
    "handle": "sandalwood-cedarwood-body-wash",
    "title": "Sandalwood & Cedarwood Body Wash",
    "image": {
      "src": "files/1_5ce021bb-dc2a-4607-b5f5-3e862909bb21.jpg",
      "alt": "Sandalwood & Cedarwood Body Wash"
    },
    "subtitle": "Body Wash · 200 ml",
    "price": 225,
    "mrp": 499,
    "currency": "INR",
    "isNew": false,
    "rating": null
  },
  "sandalwood-essential-oil": {
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
  "peppermint-essential-oil": {
    "handle": "peppermint-essential-oil",
    "title": "Peppermint Essential Oil",
    "image": {
      "src": "files/1_91926e46-b039-4b14-9f20-0f357d20c760.jpg",
      "alt": "Peppermint Essential Oil"
    },
    "subtitle": "Essential Oil · 15 ml",
    "price": 199,
    "mrp": 499,
    "currency": "INR",
    "isNew": true,
    "rating": null
  },
  "frankincense-essential-oil": {
    "handle": "frankincense-essential-oil",
    "title": "Frankincense Essential Oil",
    "image": {
      "src": "files/1_9d89f430-633d-4848-976b-83b9fdb0de4b.jpg",
      "alt": "Frankincense Essential Oil"
    },
    "subtitle": "Essential Oil · 15 ml",
    "price": 250,
    "mrp": 499,
    "currency": "INR",
    "isNew": true,
    "rating": null
  },
  "lemongrass-essential-oil": {
    "handle": "lemongrass-essential-oil",
    "title": "Lemongrass Essential Oil",
    "image": {
      "src": "files/1_5dd58b0d-973a-4106-af64-d8e40ecd6b58.jpg",
      "alt": "Lemongrass Essential Oil"
    },
    "subtitle": "Oil · 15 ml",
    "price": 199,
    "mrp": 499,
    "currency": "INR",
    "isNew": true,
    "rating": null
  },
  "eucalyptus-essential-oil": {
    "handle": "eucalyptus-essential-oil",
    "title": "Eucalyptus Essential Oil",
    "image": {
      "src": "files/1_2d98a2eb-eeb5-4550-886e-5df03152b7e0.jpg",
      "alt": "Eucalyptus Essential Oil"
    },
    "subtitle": "Oil · 15 ml",
    "price": 250,
    "mrp": 699,
    "currency": "INR",
    "isNew": false,
    "rating": {
      "average": 5,
      "count": 3
    }
  },
  "lavender-essential-oil": {
    "handle": "lavender-essential-oil",
    "title": "Lavender Essential Oil",
    "image": {
      "src": "files/Lavender_Listing_Image_0004_Lavender_Store_Listing_1.jpg",
      "alt": "Lavender Essential Oil"
    },
    "subtitle": "· 15 ml",
    "price": 199,
    "mrp": 499,
    "currency": "INR",
    "isNew": false,
    "rating": {
      "average": 5,
      "count": 2
    }
  },
  "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser": {
    "handle": "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser",
    "title": "Essential Oils Combo Set for Aromatherapy and Diffuser",
    "image": {
      "src": "files/01EssentialOilGiftsetMockup_a500cadb-1262-409c-9c6f-4a48a6bb1313.jpg",
      "alt": "Essential Oils Combo Set for Aromatherapy and Diffuser"
    },
    "subtitle": "Essential Oils Combo Set",
    "price": 599,
    "mrp": 1499,
    "currency": "INR",
    "isNew": true,
    "rating": {
      "average": 5,
      "count": 1
    }
  },
  "rose-water-multani-mitti-face-pack-combo": {
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
  "aloe-vera-gel-combo-set-of-3-cucumber-rose-mint-saffron-kumkumadi": {
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
  "body-butter-combo-set-of-2-moroccan-mirage-citrus-sunrise": {
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
  "luxury-body-wash-combo-set-of-3-lemongrass-basil-saffron-patchouli-sandalwood-cedarwood": {
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
};

export const collections: Record<string, CollectionRecord> = {
  "skincare": {
    "handle": "skincare",
    "title": "Skincare",
    "image": { "src": "collections/Rose-Water-Multani-Mitti-Store-Listing-Combo_1_1.png", "alt": "Skincare" },
    "seoTitle": "Natural Skincare — Face Wash, Toner & Gels | DPetals",
    "intro": "Glow naturally with DPetals Herbal & Natural Organic skincare. Hydrate, nourish, and refresh with rosewater mist, aloe gel, body washes, body butters, essential oils, and more. Pure & chemical-free beauty!",
    "productHandles": [
      "neem-tea-tree-face-wash",
      "rose-mint-aloe-vera-gel",
      "cucumber-aloe-vera-gel",
      "saffron-kumkumadi-aloe-vera-gel",
      "rose-water-face-mist-toner",
      "multani-mitti-face-pack",
      "cold-pressed-jojoba-oil",
      "citrus-sunrise-body-butter",
      "moroccan-mirage-body-butter"
    ]
  },
  "haircare": {
    "handle": "haircare",
    "title": "Haircare",
    "image": { "src": "collections/Hair_Pack.png", "alt": "Haircare" },
    "seoTitle": "Natural Haircare — Masks, Gels & Scalp Oils | DPetals",
    "intro": null,
    "productHandles": [
      "ayurvedic-hair-mask",
      "cold-pressed-jojoba-oil",
      "hair-care-combo-herbal-hair-mask-nourishing-gel",
      "hair-nourishing-gel-mask-conditioner",
      "rosemary-essential-oil",
      "tea-tree-essential-oil"
    ]
  },
  "body-wash": {
    "handle": "body-wash",
    "title": "Body Wash",
    "image": { "src": "files/1_1.jpg", "alt": "Body Wash" },
    "seoTitle": "Body Wash | DPetals",
    "intro": null,
    "productHandles": [
      "saffron-patchouli-body-wash",
      "lemongrass-basil-body-wash",
      "sandalwood-cedarwood-body-wash"
    ]
  },
  "essential-oils-for-aromatherapy": {
    "handle": "essential-oils-for-aromatherapy",
    "title": "Essential Oils for Aromatherapy",
    "image": { "src": "collections/essential_oil.png", "alt": "Essential Oils for Aromatherapy" },
    "seoTitle": "Essential Oils for Aromatherapy | DPetals",
    "intro": "Experience the power of DPetals Pure Essential Oils – from soothing lavender to revitalizing rosemary and tea tree. Pure, natural, aromatic, and therapeutic for skin, hair, and wellness.",
    "productHandles": [
      "sandalwood-essential-oil",
      "peppermint-essential-oil",
      "frankincense-essential-oil",
      "lemongrass-essential-oil",
      "eucalyptus-essential-oil",
      "tea-tree-essential-oil",
      "rosemary-essential-oil",
      "lavender-essential-oil",
      "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser"
    ]
  },
  "combo": {
    "handle": "combo",
    "title": "Combo",
    "image": { "src": "files/New_Steam_Distilled_Rose_water_Multani_Mitti_Combo_1.jpg", "alt": "Combo" },
    "seoTitle": "Combo | DPetals",
    "intro": null,
    "productHandles": [
      "rose-water-multani-mitti-face-pack-combo",
      "aloe-vera-gel-combo-set-of-3-cucumber-rose-mint-saffron-kumkumadi",
      "hair-care-combo-herbal-hair-mask-nourishing-gel",
      "body-butter-combo-set-of-2-moroccan-mirage-citrus-sunrise",
      "luxury-body-wash-combo-set-of-3-lemongrass-basil-saffron-patchouli-sandalwood-cedarwood"
    ]
  },
  "bestsellers": {
    "handle": "bestsellers",
    "title": "Best Sellers",
    "image": { "src": "files/face_wash_with_props.png", "alt": "Best Sellers" },
    "seoTitle": "Best Sellers | DPetals",
    "intro": "Discover DPetals Bestsellers – customer-favorite herbal & organic skincare and haircare essentials! From nourishing jojoba oil to hydrating aloe gel and luxurious body washes, experience nature’s best.",
    "productHandles": [
      "neem-tea-tree-face-wash",
      "hair-nourishing-gel-mask-conditioner",
      "ayurvedic-hair-mask",
      "lemongrass-basil-body-wash",
      "rose-mint-aloe-vera-gel",
      "sandalwood-essential-oil",
      "multani-mitti-face-pack",
      "rose-water-face-mist-toner",
      "lemongrass-essential-oil",
      "cucumber-aloe-vera-gel",
      "cold-pressed-jojoba-oil",
      "saffron-kumkumadi-aloe-vera-gel",
      "hair-care-combo-herbal-hair-mask-nourishing-gel",
      "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser",
      "frankincense-essential-oil",
      "moroccan-mirage-body-butter"
    ]
  },
  "features-at-dpetals": {
    "handle": "features-at-dpetals",
    "title": "Featured at DPetals",
    "image": { "src": "files/Artboard_2_copy_2.jpg", "alt": "Featured at DPetals" },
    "seoTitle": "Featured at DPetals — This Month's Picks | DPetals",
    "intro": null,
    "productHandles": [
      "cucumber-aloe-vera-gel",
      "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser",
      "hair-care-combo-herbal-hair-mask-nourishing-gel",
      "rose-water-multani-mitti-face-pack-combo"
    ]
  },
  "skin-care": {
    "handle": "skin-care",
    "title": "Skin Care",
    "image": { "src": "files/Artboard_2_copy_3.jpg", "alt": "Skin Care" },
    "seoTitle": "Skin Care | DPetals",
    "intro": null,
    "productHandles": [
      "saffron-kumkumadi-aloe-vera-gel",
      "neem-tea-tree-face-wash",
      "rose-water-face-mist-toner",
      "multani-mitti-face-pack"
    ]
  },
  "all": {
    "handle": "all",
    "title": "Products",
    "seoTitle": "Products | DPetals",
    "intro": null,
    "productHandles": [
      "aloe-vera-gel-combo-set-of-3-cucumber-rose-mint-saffron-kumkumadi",
      "ayurvedic-hair-mask",
      "body-butter-combo-set-of-2-moroccan-mirage-citrus-sunrise",
      "citrus-sunrise-body-butter",
      "cold-pressed-jojoba-oil",
      "cucumber-aloe-vera-gel",
      "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser",
      "eucalyptus-essential-oil",
      "frankincense-essential-oil",
      "hair-care-combo-herbal-hair-mask-nourishing-gel",
      "hair-nourishing-gel-mask-conditioner",
      "lavender-essential-oil",
      "lemongrass-basil-body-wash",
      "lemongrass-essential-oil",
      "luxury-body-wash-combo-set-of-3-lemongrass-basil-saffron-patchouli-sandalwood-cedarwood",
      "moroccan-mirage-body-butter",
      "multani-mitti-face-pack",
      "neem-tea-tree-face-wash",
      "peppermint-essential-oil",
      "rose-mint-aloe-vera-gel",
      "rose-water-multani-mitti-face-pack-combo",
      "rose-water-face-mist-toner",
      "rosemary-essential-oil",
      "saffron-patchouli-body-wash",
      "saffron-kumkumadi-aloe-vera-gel",
      "sandalwood-cedarwood-body-wash",
      "sandalwood-essential-oil",
      "tea-tree-essential-oil"
    ]
  },
  "acne-oil-control": {
    "handle": "acne-oil-control",
    "title": "Acne & Oil Control",
    "image": { "src": "files/face_wash_with_props.png", "alt": "Acne & Oil Control" },
    "seoTitle": "Acne & Oil Control — Neem, Tea Tree & Clay | DPetals",
    "intro": "Oily, congested, breakout-prone skin needs two things at once: a cleanser mild enough to use twice a day, and something targeted for the days it flares. Everything here is built around that. Neem and tea tree do the d...",
    "productHandles": [
      "neem-tea-tree-face-wash",
      "tea-tree-essential-oil",
      "multani-mitti-face-pack"
    ]
  },
  "glow-pigmentation": {
    "handle": "glow-pigmentation",
    "title": "Glow & Pigmentation",
    "image": { "src": "files/Artboard_2_copy_3.jpg", "alt": "Glow & Pigmentation" },
    "seoTitle": "Glow & Pigmentation — Saffron, Kumkumadi & Rose | DPetals",
    "intro": "For skin that looks tired, uneven or dull rather than oily or dry. Saffron and kumkumadi are the classical Ayurvedic answer to tone and radiance; multani mitti and rose water are the weekly ritual that keeps skin look...",
    "productHandles": [
      "saffron-kumkumadi-aloe-vera-gel",
      "rose-water-multani-mitti-face-pack-combo",
      "rose-water-face-mist-toner",
      "multani-mitti-face-pack"
    ]
  },
  "hair-skin": {
    "handle": "hair-skin",
    "title": "Hair & Skin",
    "image": { "src": "files/Nourishing_Gel_With_Props.jpg", "alt": "Hair & Skin" },
    "seoTitle": "Hair & Skin | DPetals",
    "intro": null,
    "productHandles": [
      "hair-nourishing-gel-mask-conditioner",
      "cucumber-aloe-vera-gel",
      "neem-tea-tree-face-wash",
      "moroccan-mirage-body-butter",
      "saffron-kumkumadi-aloe-vera-gel",
      "rosemary-essential-oil",
      "rose-water-face-mist-toner",
      "rose-water-multani-mitti-face-pack-combo",
      "rose-mint-aloe-vera-gel",
      "saffron-patchouli-body-wash",
      "ayurvedic-hair-mask",
      "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser",
      "lemongrass-basil-body-wash",
      "cold-pressed-jojoba-oil",
      "eucalyptus-essential-oil",
      "hair-care-combo-herbal-hair-mask-nourishing-gel",
      "peppermint-essential-oil",
      "frankincense-essential-oil",
      "tea-tree-essential-oil",
      "lemongrass-essential-oil",
      "sandalwood-essential-oil",
      "sandalwood-cedarwood-body-wash",
      "multani-mitti-face-pack",
      "citrus-sunrise-body-butter",
      "lavender-essential-oil"
    ]
  },
  "hair-fall-dandruff": {
    "handle": "hair-fall-dandruff",
    "title": "Hair Fall & Dandruff",
    "image": { "src": "files/Nourishing_Gel_With_Props.jpg", "alt": "Hair Fall & Dandruff" },
    "seoTitle": "Hair Fall & Dandruff — Rosemary, Masks & Oils | DPetals",
    "intro": "Scalp first, lengths second. Most hair routines skip that order and wonder why nothing changes. Rosemary and tea tree oils are for the pre-wash scalp massage — always diluted in a carrier like jojoba, five drops per 1...",
    "productHandles": [
      "hair-nourishing-gel-mask-conditioner",
      "rosemary-essential-oil",
      "ayurvedic-hair-mask",
      "cold-pressed-jojoba-oil",
      "tea-tree-essential-oil",
      "hair-care-combo-herbal-hair-mask-nourishing-gel"
    ]
  },
  "hydration-dryness": {
    "handle": "hydration-dryness",
    "title": "Hydration & Dryness",
    "image": { "src": "files/Artboard_2_copy_2.jpg", "alt": "Hydration & Dryness" },
    "seoTitle": "Hydration & Dryness — Aloe Gels & Body Butters | DPetals",
    "intro": "Lightweight hydration for hot months, richer nourishment for cold ones. Aloe vera gels are the everyday layer — they hydrate without weight, absorb in seconds and suit almost every skin type. Body butters and jojoba o...",
    "productHandles": [
      "cucumber-aloe-vera-gel",
      "moroccan-mirage-body-butter",
      "rose-mint-aloe-vera-gel",
      "cold-pressed-jojoba-oil",
      "aloe-vera-gel-combo-set-of-3-cucumber-rose-mint-saffron-kumkumadi",
      "body-butter-combo-set-of-2-moroccan-mirage-citrus-sunrise",
      "citrus-sunrise-body-butter"
    ]
  },
  "relax-aromatherapy": {
    "handle": "relax-aromatherapy",
    "title": "Relax & Aromatherapy",
    "image": { "src": "files/Rosemary_Listing_Image_0004_Rosemary_Store_Listing_1.jpg", "alt": "Relax & Aromatherapy" },
    "seoTitle": "Relax & Aromatherapy — Pure Essential Oils | DPetals",
    "intro": "Pure steam-distilled essential oils for the diffuser, the bath and the evening wind-down. Lavender for sleep, peppermint for a clear head, eucalyptus through the change of season, frankincense and sandalwood when you ...",
    "productHandles": [
      "rosemary-essential-oil",
      "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser",
      "tea-tree-essential-oil",
      "eucalyptus-essential-oil",
      "frankincense-essential-oil",
      "peppermint-essential-oil",
      "sandalwood-essential-oil",
      "lemongrass-essential-oil",
      "lavender-essential-oil"
    ]
  },
  "self-care": {
    "handle": "self-care",
    "title": "Self Care",
    "image": { "src": "files/face_wash_with_props.png", "alt": "Self Care" },
    "seoTitle": "Self Care | DPetals",
    "intro": null,
    "productHandles": [
      "neem-tea-tree-face-wash",
      "rosemary-essential-oil",
      "cold-pressed-jojoba-oil",
      "frankincense-essential-oil",
      "sandalwood-essential-oil"
    ]
  },
  "smooth-strong": {
    "handle": "smooth-strong",
    "title": "Smooth & Strong",
    "image": { "src": "files/Nourishing_Gel_With_Props.jpg", "alt": "Smooth & Strong" },
    "seoTitle": "Smooth & Strong | DPetals",
    "intro": null,
    "productHandles": [
      "hair-nourishing-gel-mask-conditioner",
      "cucumber-aloe-vera-gel",
      "ayurvedic-hair-mask",
      "hair-care-combo-herbal-hair-mask-nourishing-gel"
    ]
  },
  "you-may-also-like": {
    "handle": "you-may-also-like",
    "title": "You may also like",
    "image": { "src": "files/1_1.jpg", "alt": "You may also like" },
    "seoTitle": "You may also like | DPetals",
    "intro": "You may also like DPetals Herbal & Natural Organic essentials – nourishing oils, hydrating gels, refreshing body washes, and soothing skincare for a pure and natural glow!",
    "productHandles": [
      "saffron-patchouli-body-wash",
      "citrus-sunrise-body-butter",
      "eucalyptus-essential-oil",
      "sandalwood-cedarwood-body-wash",
      "moroccan-mirage-body-butter",
      "peppermint-essential-oil",
      "frankincense-essential-oil",
      "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser"
    ]
  }
};
