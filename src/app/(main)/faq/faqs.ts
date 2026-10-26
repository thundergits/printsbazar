// FAQ content. Keep answers in line with the rest of the site: shipping rules
// live in src/lib/pricing.ts, upload limits in /api/upload, delivery zones in
// /api/delivery-estimate and mounting rules in src/lib/designs/.

export interface Faq {
  q: string;
  a: string;
  links?: { label: string; href: string }[];
}

export interface FaqSection {
  id: string;
  title: string;
  faqs: Faq[];
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "ordering",
    title: "Ordering & Personalisation",
    faqs: [
      {
        q: "How do I order a personalised product?",
        a: "For acrylic photos, wall clocks and name plates, pick a design from the gallery, add your photo or text, drag and zoom until it looks right, then choose a size and thickness and add it to your cart. For magnets, keychains, luggage tags, photo stands and albums, open the product, upload your photo, crop it, choose your options and add it to your cart. Then check out with your delivery address and payment method.",
        links: [
          { label: "Acrylic Photos", href: "/customise/acrylic-print" },
          { label: "Wall Clocks", href: "/customise/wall-clocks" },
          { label: "Name Plates", href: "/customise/acrylic-name-plate" },
        ],
      },
      {
        q: "What kind of photo works best?",
        a: "Use the original photo from your phone camera or gallery. Screenshots and photos saved from WhatsApp or social media are compressed and can print blurry. We accept JPG, PNG and WEBP files up to 10 MB, at least 800 × 800 pixels. While you design, a quality indicator tells you whether your photo is sharp enough for the size you've chosen.",
      },
      {
        q: "Is my photo uploaded while I'm previewing designs?",
        a: "No. Every preview is drawn right in your browser. Your photo is uploaded only when you add the design to your cart, and it's used only to make your order.",
      },
      {
        q: "Can I use more than one photo?",
        a: "Yes. Collage designs, like the 2-photo and 4-photo wall clocks, have a spot for each photo. Pick a different photo for every spot, or use the same one throughout.",
      },
      {
        q: "Can I change the name, address and font on a name plate?",
        a: "Yes. Type your family name and address in the editor and choose a font. The preview updates as you type, so you see exactly what will be printed.",
      },
      {
        q: "Do I need an account to order?",
        a: "No, you can check out as a guest. With a free account, your addresses are saved for faster checkout and all your orders are in one place.",
        links: [{ label: "Create an account", href: "/account/signup" }],
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "Contact us as soon as possible with your order number. Every piece is made just for you, so once your order reaches the Printing stage we may not be able to change or cancel it.",
        links: [{ label: "Contact us", href: "/contact" }],
      },
    ],
  },
  {
    id: "products",
    title: "Products & Quality",
    faqs: [
      {
        q: "What's the difference between 3mm, 5mm and 8mm acrylic?",
        a: "Thicker acrylic feels more solid, adds depth to your photo and casts a stronger shadow on the wall. 3mm is light and great for smaller sizes, 5mm is our everyday premium choice, and 8mm gives a bold, glass-like block. Available thicknesses depend on the size you pick, and the price for each combination is shown in the editor.",
      },
      {
        q: "How does an acrylic photo or name plate mount on the wall?",
        a: "Smaller prints and all 3mm pieces come with adhesive hooks and transparent double-sided tape, so no drilling is needed. 5mm and 8mm prints of 15 × 12 inches and above, and 8mm name plates, are mounted with steel studs about 1 inch from the edges. Screws and wall plugs are included.",
      },
      {
        q: "Does a wall clock come ready to use?",
        a: "Yes. The clock movement and hands are fitted before shipping. Insert one AA battery, set the time and hang it on a nail or hook. The hands are fitted on top of the print, not printed on your photo, so your picture stays clear.",
      },
      {
        q: "Can I put a name plate outside?",
        a: "Yes. Acrylic is weather-resistant, so it works well at an entrance or gate. If the spot gets harsh, direct sun all day, a shaded wall will keep the colours fresh for longer.",
      },
      {
        q: "How do I clean my acrylic print?",
        a: "Wipe it gently with a soft, dry microfibre cloth. For marks, use a cloth lightly dampened with water. Avoid paper towels, glass cleaners and alcohol-based sprays, which can scratch or cloud the surface.",
      },
      {
        q: "What if my order arrives with a printing mistake?",
        a: "Each piece is checked before it's packed. If anything is wrong with the print, we'll reprint it or refund you. See Returns & Refunds below for how to report it.",
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    faqs: [
      {
        q: "How long does delivery take?",
        a: "Every order is made to order in 1–3 working days and then shipped. Most orders arrive within 3–7 business days. Remote areas such as Jammu & Kashmir, Ladakh and the Northeast can take up to 10 business days. Enter your pincode on any design page or at checkout to see the expected delivery dates for your address.",
      },
      {
        q: "How much does shipping cost?",
        a: "Shipping is free on orders of ₹499 or more. Below that, a flat ₹59 shipping charge applies, which is shown before you pay.",
      },
      {
        q: "Do you deliver all over India?",
        a: "Yes, we deliver across India. Check your pincode at checkout to see the delivery estimate for your area.",
      },
      {
        q: "How do I track my order?",
        a: "Go to Track Order and enter your order number together with the email address you ordered with. You'll see your order's current stage: Order Received, Confirmed, Artwork Review, Printing, Packed, Shipped or Delivered. Your order number is on the order confirmation page and in your confirmation email. If you have an account, your orders are also listed there.",
        links: [{ label: "Track your order", href: "/track-order" }],
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & Offers",
    faqs: [
      {
        q: "Which payment methods do you accept?",
        a: "You can pay with UPI (Google Pay, PhonePe, Paytm and others), credit or debit cards, or Cash on Delivery.",
      },
      {
        q: "Is online payment safe?",
        a: "Yes. Online payments are processed by Razorpay, a secure, RBI-compliant payment gateway. Your card and UPI details are entered on Razorpay's encrypted checkout and are never seen or stored by us.",
      },
      {
        q: "Money was deducted but I didn't see an order confirmation. What now?",
        a: "Don't worry. As soon as Razorpay confirms your payment, your order is confirmed automatically, even if you closed the page. If you haven't received a confirmation within a few hours, contact us with your Razorpay payment ID and we'll sort it out right away. If the payment didn't go through, your bank reverses the amount automatically.",
        links: [{ label: "Contact us", href: "/contact" }],
      },
      {
        q: "How do I use a coupon code?",
        a: "Enter the code in the coupon box on the cart or checkout page and tap Apply. The discount appears in your order summary before you pay. Some coupons need a minimum order value, and one coupon can be used per order.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    faqs: [
      {
        q: "What is your return policy?",
        a: "Because every product is personalised and made just for you, we can't accept returns for a change of mind. But if your order arrives damaged, defective or with a printing error, tell us within 7 days of delivery and we'll reprint it or refund you, free of charge.",
        links: [{ label: "Read the full Return & Refund Policy", href: "/return-policy" }],
      },
      {
        q: "My order arrived damaged. What should I do?",
        a: "Please contact us within 7 days of delivery with your order number and clear photos of the product and its packaging. We'll arrange a free reprint or a refund. Keeping the box until it's resolved helps us process your claim faster.",
        links: [{ label: "Contact us", href: "/contact" }],
      },
      {
        q: "How will I get my refund?",
        a: "Refunds for online payments go back to your original payment method. For Cash on Delivery orders, we'll ask for your UPI ID or bank details to send the refund.",
      },
    ],
  },
];
