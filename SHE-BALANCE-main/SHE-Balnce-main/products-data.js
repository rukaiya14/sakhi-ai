// Complete products data with correct image paths
const productsData = [
    // EMBROIDERY PRODUCTS (6 images - img 2 through img 7)
    {
        id: 1,
        name: 'Embroidered Designer Frock - Pink & Gold',
        category: 'embroidery',
        artisan: 'Rukaiya',
        description: 'Exquisite designer frock featuring intricate hand-embroidered patterns in pink and gold. This stunning piece combines contemporary silhouette with timeless embroidery techniques, where each stitch is carefully placed to create mesmerizing floral and geometric motifs. Perfect for special occasions, weddings, or festive celebrations.',
        image: 'artisan-images/Embroidery/img 2.png',
        materialCost: 800,
        effortCost: 1200,
        invisibleLabor: { designHours: 12, heritageValue: 500, sourcingEffort: 200, qualityControl: 300 },
        price: 3000
    },
    {
        id: 2,
        name: 'Embroidered Designer Frock - Peach & Maroon',
        category: 'embroidery',
        artisan: 'Rukaiya',
        description: 'Beautiful designer frock with traditional embroidery motifs in peach and maroon colors. Features intricate needlework that showcases centuries-old craftsmanship techniques. Each piece is unique and tells its own story of heritage artistry.',
        image: 'artisan-images/Embroidery/img 3.png',
        materialCost: 800,
        effortCost: 1200,
        invisibleLabor: { designHours: 12, heritageValue: 500, sourcingEffort: 200, qualityControl: 300 },
        price: 3000
    },
    {
        id: 3,
        name: 'Traditional Embroidered Kurta Set',
        category: 'embroidery',
        artisan: 'Rukaiya',
        description: 'Elegant traditional kurta set adorned with exquisite hand embroidery that reflects the rich cultural heritage of Indian craftsmanship. Features intricate needlework along the neckline, sleeves, and hemline with delicate patterns inspired by centuries-old designs.',
        image: 'artisan-images/Embroidery/img 4.png',
        materialCost: 600,
        effortCost: 900,
        invisibleLabor: { designHours: 10, heritageValue: 400, sourcingEffort: 150, qualityControl: 250 },
        price: 2300
    },
    {
        id: 4,
        name: 'Embroidered Ethnic Dress',
        category: 'embroidery',
        artisan: 'Rukaiya',
        description: 'Stunning ethnic dress featuring elaborate hand-embroidered designs that celebrate the artistry of traditional needlework. This masterpiece showcases intricate patterns meticulously crafted with premium quality threads, creating a visual symphony of colors and textures.',
        image: 'artisan-images/Embroidery/img 5.png',
        materialCost: 700,
        effortCost: 1000,
        invisibleLabor: { designHours: 11, heritageValue: 450, sourcingEffort: 180, qualityControl: 270 },
        price: 2600
    },
    {
        id: 5,
        name: 'Premium Embroidered Anarkali',
        category: 'embroidery',
        artisan: 'Rukaiya',
        description: 'Luxurious Anarkali dress featuring breathtaking hand embroidery that exemplifies the pinnacle of traditional Indian craftsmanship. This regal piece showcases an intricate tapestry of embroidered patterns with elaborate floral designs and traditional paisleys.',
        image: 'artisan-images/Embroidery/img 6.png',
        materialCost: 900,
        effortCost: 1400,
        invisibleLabor: { designHours: 15, heritageValue: 600, sourcingEffort: 250, qualityControl: 350 },
        price: 3500
    },
    {
        id: 6,
        name: 'Handcrafted Embroidered Gown',
        category: 'embroidery',
        artisan: 'Rukaiya',
        description: 'Magnificent handcrafted gown adorned with spectacular hand embroidery that transforms fabric into wearable art. Features an extensive array of embroidered elements from delicate floral sprays to bold geometric patterns, all meticulously stitched by skilled artisan hands.',
        image: 'artisan-images/Embroidery/img 7.png',
        materialCost: 1000,
        effortCost: 1600,
        invisibleLabor: { designHours: 18, heritageValue: 700, sourcingEffort: 300, qualityControl: 400 },
        price: 4000
    },
    
    // HENNA ARTIST SERVICES (5 images)
    {
        id: 7,
        name: 'Bridal Henna Package - Full Hands & Feet',
        category: 'henna',
        artisan: 'Fatima Khan',
        description: 'Complete bridal henna service with intricate traditional designs for hands and feet. Using 100% natural, chemical-free henna paste, each design is customized to reflect your personal style while honoring centuries-old patterns and symbolism. Includes consultation and design planning.',
        image: 'artisan-images/Henna/Screenshot 2026-03-04 113717.png',
        materialCost: 300,
        effortCost: 1200,
        invisibleLabor: { designHours: 5, heritageValue: 600, sourcingEffort: 100, qualityControl: 200 },
        price: 2400
    },
    {
        id: 8,
        name: 'Traditional Henna Design - Hands',
        category: 'henna',
        artisan: 'Fatima Khan',
        description: 'Beautiful traditional henna designs for hands featuring classic motifs and patterns. Perfect for weddings, festivals, and special celebrations. Each design tells a story and carries blessings for prosperity and happiness.',
        image: 'artisan-images/Henna/Screenshot 2026-03-04 113756.png',
        materialCost: 150,
        effortCost: 600,
        invisibleLabor: { designHours: 3, heritageValue: 400, sourcingEffort: 50, qualityControl: 100 },
        price: 1300
    },
    {
        id: 9,
        name: 'Contemporary Fusion Henna Design',
        category: 'henna',
        artisan: 'Fatima Khan',
        description: 'Modern fusion henna designs blending traditional patterns with contemporary aesthetics. Perfect for those seeking a unique and stylish look. Features intricate detailing and creative motifs.',
        image: 'artisan-images/Henna/Screenshot 2026-03-04 113806.png',
        materialCost: 150,
        effortCost: 650,
        invisibleLabor: { designHours: 3, heritageValue: 350, sourcingEffort: 50, qualityControl: 100 },
        price: 1300
    },
    {
        id: 10,
        name: 'Arabic Style Henna Design',
        category: 'henna',
        artisan: 'Fatima Khan',
        description: 'Elegant Arabic-style henna featuring bold floral patterns and flowing designs. Known for its distinctive style with larger motifs and more open spaces. Perfect for modern brides and special occasions.',
        image: 'artisan-images/Henna/Screenshot 2026-03-04 113817.png',
        materialCost: 150,
        effortCost: 600,
        invisibleLabor: { designHours: 3, heritageValue: 400, sourcingEffort: 50, qualityControl: 100 },
        price: 1300
    },
    {
        id: 11,
        name: 'Minimalist Henna Design',
        category: 'henna',
        artisan: 'Fatima Khan',
        description: 'Simple yet elegant minimalist henna designs perfect for casual events or those preferring subtle beauty. Features clean lines and delicate patterns that enhance natural beauty without overwhelming.',
        image: 'artisan-images/Henna/Screenshot 2026-03-04 113832.png',
        materialCost: 100,
        effortCost: 400,
        invisibleLabor: { designHours: 2, heritageValue: 300, sourcingEffort: 50, qualityControl: 100 },
        price: 950
    },
    
    // CROCHET PRODUCTS (4 images)
    {
        id: 12,
        name: 'Handmade Crochet Baby Blanket',
        category: 'crochet',
        artisan: 'Priya Sharma',
        description: 'Soft, breathable baby blanket lovingly crocheted with premium cotton yarn in soothing pastel colors. Every loop and stitch is crafted with care to ensure maximum comfort and warmth for your little one. Perfect for sensitive baby skin.',
        image: 'artisan-images/Crochet/Screenshot 2026-03-04 122630.png',
        materialCost: 400,
        effortCost: 1000,
        invisibleLabor: { designHours: 8, heritageValue: 250, sourcingEffort: 100, qualityControl: 150 },
        price: 1900
    },
    {
        id: 13,
        name: 'Crochet Decorative Cushion Cover',
        category: 'crochet',
        artisan: 'Priya Sharma',
        description: 'Beautiful handcrafted crochet cushion cover with intricate patterns. Made with high-quality yarn in vibrant colors. Adds a touch of handmade charm to any living space while showcasing traditional crochet techniques.',
        image: 'artisan-images/Crochet/Screenshot 2026-03-04 122703.png',
        materialCost: 300,
        effortCost: 700,
        invisibleLabor: { designHours: 6, heritageValue: 200, sourcingEffort: 80, qualityControl: 120 },
        price: 1400
    },
    {
        id: 14,
        name: 'Crochet Table Runner Set',
        category: 'crochet',
        artisan: 'Priya Sharma',
        description: 'Elegant crochet table runner with matching coasters. Features delicate lacework patterns that add sophistication to your dining table. Made with durable cotton thread that maintains its beauty through years of use.',
        image: 'artisan-images/Crochet/Screenshot 2026-03-04 122733.png',
        materialCost: 350,
        effortCost: 800,
        invisibleLabor: { designHours: 7, heritageValue: 220, sourcingEffort: 90, qualityControl: 140 },
        price: 1600
    },
    {
        id: 15,
        name: 'Crochet Handbag',
        category: 'crochet',
        artisan: 'Priya Sharma',
        description: 'Stylish handmade crochet handbag perfect for casual outings. Features sturdy construction with comfortable handles and spacious interior. Combines functionality with artisanal beauty in a unique accessory.',
        image: 'artisan-images/Crochet/Screenshot 2026-03-04 122756.png',
        materialCost: 450,
        effortCost: 900,
        invisibleLabor: { designHours: 9, heritageValue: 280, sourcingEffort: 110, qualityControl: 160 },
        price: 1900
    },
    
    // WEAVING PRODUCTS (4 images)
    {
        id: 16,
        name: 'Handwoven Cotton Table Runner',
        category: 'weaving',
        artisan: 'Lakshmi Devi',
        description: 'Stunning handwoven table runner crafted on a traditional loom using 100% organic cotton threads. The geometric patterns are inspired by ancient tribal motifs. Adds warmth and character to any dining space while celebrating sustainable craftsmanship.',
        image: 'artisan-images/Weaving/Screenshot 2026-03-04 122922.png',
        materialCost: 300,
        effortCost: 700,
        invisibleLabor: { designHours: 4, heritageValue: 350, sourcingEffort: 120, qualityControl: 180 },
        price: 1650
    },
    {
        id: 17,
        name: 'Traditional Woven Shawl',
        category: 'weaving',
        artisan: 'Lakshmi Devi',
        description: 'Luxurious handwoven shawl made with fine wool and silk blend. Features traditional weaving patterns passed down through generations. Perfect for adding elegance to any outfit while keeping you warm and comfortable.',
        image: 'artisan-images/Weaving/Screenshot 2026-03-04 122933.png',
        materialCost: 600,
        effortCost: 1200,
        invisibleLabor: { designHours: 8, heritageValue: 500, sourcingEffort: 200, qualityControl: 300 },
        price: 2800
    },
    {
        id: 18,
        name: 'Handwoven Wall Hanging',
        category: 'weaving',
        artisan: 'Lakshmi Devi',
        description: 'Artistic handwoven wall hanging featuring abstract patterns and natural colors. Created using traditional loom techniques with eco-friendly materials. Transforms any wall into a statement piece celebrating textile artistry.',
        image: 'artisan-images/Weaving/Screenshot 2026-03-04 123046.png',
        materialCost: 400,
        effortCost: 900,
        invisibleLabor: { designHours: 6, heritageValue: 400, sourcingEffort: 150, qualityControl: 250 },
        price: 2100
    },
    {
        id: 19,
        name: 'Woven Cotton Throw Blanket',
        category: 'weaving',
        artisan: 'Lakshmi Devi',
        description: 'Cozy handwoven throw blanket perfect for your living room or bedroom. Made with soft cotton in beautiful color combinations. Features traditional weaving techniques that ensure durability and comfort.',
        image: 'artisan-images/Weaving/Screenshot 2026-03-04 123106.png',
        materialCost: 500,
        effortCost: 1000,
        invisibleLabor: { designHours: 7, heritageValue: 450, sourcingEffort: 180, qualityControl: 270 },
        price: 2400
    },
    
    // JEWELRY PRODUCTS (6 images)
    {
        id: 20,
        name: 'Beaded Necklace Set',
        category: 'jewelry',
        artisan: 'Anjali Patel',
        description: 'Elegant handcrafted necklace and earring set featuring carefully selected glass beads, semi-precious stones, and metallic accents. Each bead is individually strung and secured with precision. Transitions seamlessly from day to evening wear.',
        image: 'artisan-images/Jewelry/Screenshot 2026-03-04 123141.png',
        materialCost: 600,
        effortCost: 500,
        invisibleLabor: { designHours: 6, heritageValue: 200, sourcingEffort: 180, qualityControl: 220 },
        price: 1700
    },
    {
        id: 21,
        name: 'Traditional Oxidized Silver Jewelry Set',
        category: 'jewelry',
        artisan: 'Anjali Patel',
        description: 'Beautiful oxidized silver jewelry set featuring traditional designs with intricate detailing. Includes necklace, earrings, and bracelet. Perfect for ethnic wear and special occasions. Showcases ancient metalworking techniques.',
        image: 'artisan-images/Jewelry/Screenshot 2026-03-04 123152.png',
        materialCost: 800,
        effortCost: 700,
        invisibleLabor: { designHours: 8, heritageValue: 350, sourcingEffort: 250, qualityControl: 300 },
        price: 2400
    },
    {
        id: 22,
        name: 'Handmade Terracotta Jewelry',
        category: 'jewelry',
        artisan: 'Anjali Patel',
        description: 'Unique terracotta jewelry set hand-painted with traditional motifs. Eco-friendly and lightweight, perfect for daily wear. Each piece is individually crafted and painted, making every set one-of-a-kind.',
        image: 'artisan-images/Jewelry/Screenshot 2026-03-04 123218.png',
        materialCost: 300,
        effortCost: 400,
        invisibleLabor: { designHours: 5, heritageValue: 180, sourcingEffort: 100, qualityControl: 150 },
        price: 1130
    },
    {
        id: 23,
        name: 'Gemstone Pendant Necklace',
        category: 'jewelry',
        artisan: 'Anjali Patel',
        description: 'Elegant pendant necklace featuring natural gemstones set in sterling silver. Each stone is carefully selected for its quality and beauty. Comes with matching earrings. Perfect for adding a touch of sophistication to any outfit.',
        image: 'artisan-images/Jewelry/Screenshot 2026-03-04 123233.png',
        materialCost: 900,
        effortCost: 600,
        invisibleLabor: { designHours: 7, heritageValue: 250, sourcingEffort: 300, qualityControl: 350 },
        price: 2400
    },
    {
        id: 24,
        name: 'Handcrafted Brass Jewelry Set',
        category: 'jewelry',
        artisan: 'Anjali Patel',
        description: 'Traditional brass jewelry set with intricate filigree work. Features necklace, earrings, and bangles. The warm golden tone of brass adds vintage charm. Perfect for traditional and fusion wear.',
        image: 'artisan-images/Jewelry/Screenshot 2026-03-04 123249.png',
        materialCost: 500,
        effortCost: 550,
        invisibleLabor: { designHours: 6, heritageValue: 220, sourcingEffort: 150, qualityControl: 200 },
        price: 1620
    },
    {
        id: 25,
        name: 'Contemporary Wire Jewelry',
        category: 'jewelry',
        artisan: 'Anjali Patel',
        description: 'Modern wire-wrapped jewelry featuring artistic designs and colorful beads. Lightweight and comfortable for all-day wear. Each piece is handcrafted with attention to detail, creating wearable art.',
        image: 'artisan-images/Jewelry/Screenshot 2026-03-04 123308.png',
        materialCost: 400,
        effortCost: 450,
        invisibleLabor: { designHours: 5, heritageValue: 180, sourcingEffort: 120, qualityControl: 180 },
        price: 1330
    },
    
    // POTTERY PRODUCTS (4 images)
    {
        id: 26,
        name: 'Handmade Clay Pottery Set',
        category: 'pottery',
        artisan: 'Meera Reddy',
        description: 'Authentic terracotta pottery set of 4 pieces, hand-thrown on a potter\'s wheel and fired in a traditional kiln. Each pot features unique hand-carved patterns inspired by regional folk art. Perfect for serving traditional dishes or as decorative pieces.',
        image: 'artisan-images/Pottery/Screenshot 2026-03-04 123415.png',
        materialCost: 250,
        effortCost: 900,
        invisibleLabor: { designHours: 7, heritageValue: 300, sourcingEffort: 100, qualityControl: 250 },
        price: 1800
    },
    {
        id: 27,
        name: 'Decorative Ceramic Vase',
        category: 'pottery',
        artisan: 'Meera Reddy',
        description: 'Beautiful hand-painted ceramic vase with traditional motifs. Perfect for displaying fresh or dried flowers. Each vase is individually crafted and painted, making it a unique piece of functional art for your home.',
        image: 'artisan-images/Pottery/Screenshot 2026-03-04 123435.png',
        materialCost: 300,
        effortCost: 700,
        invisibleLabor: { designHours: 6, heritageValue: 280, sourcingEffort: 120, qualityControl: 220 },
        price: 1620
    },
    {
        id: 28,
        name: 'Handcrafted Pottery Dinnerware Set',
        category: 'pottery',
        artisan: 'Meera Reddy',
        description: 'Complete dinnerware set including plates, bowls, and cups. Hand-thrown and glazed with food-safe materials. Features rustic charm with modern functionality. Each piece celebrates the beauty of handmade pottery.',
        image: 'artisan-images/Pottery/Screenshot 2026-03-04 123520.png',
        materialCost: 600,
        effortCost: 1400,
        invisibleLabor: { designHours: 12, heritageValue: 500, sourcingEffort: 200, qualityControl: 400 },
        price: 3100
    },
    {
        id: 29,
        name: 'Terracotta Planter Set',
        category: 'pottery',
        artisan: 'Meera Reddy',
        description: 'Set of 3 handmade terracotta planters in different sizes. Perfect for indoor plants and succulents. Features natural clay finish with drainage holes. Brings earthy, organic beauty to your plant collection.',
        image: 'artisan-images/Pottery/Screenshot 2026-03-04 123637.png',
        materialCost: 200,
        effortCost: 600,
        invisibleLabor: { designHours: 5, heritageValue: 250, sourcingEffort: 80, qualityControl: 170 },
        price: 1300
    }
];
