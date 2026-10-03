export interface ContentPage {
  handle: string;
  title: string;
  seoTitle: string;
  /** Meta description; omitted when the page has no copy worth summarising. */
  description?: string;
  /** Trusted, hand-authored markup (headings, paragraphs, lists). */
  html: string;
}

export const pages: Record<string, ContentPage> = {
  "about-us": {
    handle: "about-us",
    title: "About Us",
    seoTitle: "About Us | DPetals",
    html: `<h2><strong>Who we Are?</strong></h2>
<p>Welcome to DPetals, where nature's finest gifts are transformed into luxurious skincare and wellness essentials. Our journey began with a deep passion for harnessing the pure, potent power of nature to create products that not only nurture the skin but also soothe the soul.</p>
<p>At DPetals, we believe that beauty and wellness should be holistic, sustainable, and rooted in the earth's most treasured resources. Our essential oils and herbal cosmetics are crafted from the highest quality botanicals, ethically sourced from around the world. We source our raw materials and products from those who share our commitment to purity, integrity, and respect for the environment.</p>
<p>Each DPetals product is a labor of love, carefully formulated to enhance your natural beauty while promoting overall well-being. We combine time-honored herbal wisdom with modern science to ensure that our products are as effective as they are gentle, free from harmful chemicals, and full of nourishing, skin-loving ingredients.</p>
<p>Our mission is simple: to provide you with the purest, most effective natural skincare and wellness products that bring the healing power of nature into your daily routine. We invite you to discover the DPetals difference – where beauty blossoms from within, and every drop of nature’s essence is cherished.</p>
<h2><strong>Why Choose Us?</strong></h2>
<ul>
<li><strong>Natural and Pure Ingredients: </strong>Every DPetals product is made from the highest quality, all-natural ingredients, free from synthetic chemicals, parabens, and artificial fragrances.</li>
<li><strong>Holistic Approach to Beauty and Wellness: </strong>Our products are designed not just for skincare, but for overall well-being, integrating the therapeutic benefits of essential oils with the nourishing properties of herbal cosmetics.</li>
<li><strong>Eco-Friendly and Sustainable Packaging: </strong>We prioritize sustainability in every aspect of our business, using recyclable packaging and minimizing waste to reduce our environmental impact.</li>
<li><strong>Cruelty-Free and Vegan: </strong>DPetals products are never tested on animals, and our entire range is vegan, reflecting our commitment to cruelty-free beauty.</li>
<li><strong>Custom Formulations for Every Skin Type:</strong> We offer a wide range of products tailored to different skin types and needs, ensuring that everyone can experience the benefits of our natural skincare solutions.</li>
</ul>
<h2><strong>Our Brand Values</strong></h2>
<ul>
<li><strong>Integrity:</strong> We are committed to transparency in our sourcing, production, and marketing practices, ensuring that our customers can trust the quality and authenticity of our products.</li>
<li><strong>Holistic Wellness: </strong>We believe in the power of nature to heal and rejuvenate, and our products are crafted to promote not just physical beauty, but emotional and spiritual well-being.</li>
<li><strong>Empowerment:</strong> We empower our customers to make conscious choices for their skincare and wellness, providing products that are as effective as they are safe for the environment and their health.</li>
<li><strong>Community:</strong> We support the communities we source from and foster a sense of community among our customers, encouraging a lifestyle that values natural beauty and holistic wellness.</li>
<li><strong>Innovation with Tradition: </strong>While we are rooted in time-honored herbal practices, we continuously innovate to bring the best of nature and science together, ensuring our products are both traditional and cutting-edge.</li>
</ul>`,
  },
  contact: {
    handle: "contact",
    title: "Contact",
    seoTitle: "Contact | DPetals",
    html: `<p><br>ADDRESS:<br><br>RICH ELEMENTS PRIVATE LIMITED<br>A-204, Dev Parisar, opp. Vaishnodevi Temple, Khodiyar, Ahmedabad, 382421 GJ, India<br><br>PHONE NUMBER: <strong>7984416905</strong><br><br>EMAIL: <strong><em>customercare@richelements.in</em></strong>&nbsp;<br><br>GST NUMBER : 24AAOCR4548M1ZR</p>`,
  },
  "our-products": {
    handle: "our-products",
    title: "Our Products",
    seoTitle: "Our Products | DPetals",
    // The storefront publishes this page with an empty body.
    html: "",
  },
  "collection-bundle": {
    handle: "collection-bundle",
    title: "Mix and Match",
    seoTitle: "Mix and Match | DPetals",
    // The storefront renders a third-party bundle builder here that shows nothing without its app.
    html: "",
  },
  "data-sale-opt-out": {
    handle: "data-sale-opt-out",
    title: "Your Privacy Choices",
    seoTitle: "Your Privacy Choices | DPetals",
    description:
      "As described in our Privacy Policy, we collect personal information from your interactions with us and our website, including through cookies and similar technologies. We may also share this personal information with third parties, including advertising partners.",
    // The opt-out form is a Shopify-hosted widget that only appears for visitors in applicable US states;
    // everyone else sees the notice below.
    html: `<p>As described in our Privacy Policy, we collect personal information from your interactions with us and our website, including through cookies and similar technologies. We may also share this personal information with third parties, including advertising partners. We do this in order to show you ads on other websites that are more relevant to your interests and for other reasons outlined in our privacy policy.</p>
<p>Sharing of personal information for targeted advertising based on your interaction on different websites may be considered "sales", "sharing", or "targeted advertising" under certain U.S. state privacy laws. Depending on where you live, you may have the right to opt out of these activities. If you would like to exercise this opt-out right, please follow the instructions below.</p>
<p>If you visit our website with the Global Privacy Control opt-out preference signal enabled, depending on where you are, we will treat this as a request to opt-out of activity that may be considered a “sale” or “sharing” of personal information or other uses that may be considered targeted advertising for the device and browser you used to visit our website.</p>
<p><strong>To opt out of the "sale" or "sharing" of your personal information collected using cookies and other device-based identifiers as described above, you must be browsing from one of the applicable US states referred to above.</strong></p>`,
  },
};
