// Glengala Fresh - Complete Product Database with 100g increments and specials
let products = [
    // VEGETABLES
    { id: 1, name: "Beetroot", category: "vegetables", price: 2.49, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 2, name: "Carrot, 1kg bag", category: "vegetables", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 3, name: "Carrot, loose", category: "vegetables", price: 1.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 4, name: "Crushed potatoes, loose", category: "vegetables", price: 2.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 5, name: "Washed potatoes, loose", category: "vegetables", price: 3.49, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 6, name: "Red potatoes, loose", category: "vegetables", price: 3.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 7, name: "Brushed potatoes, 5kg", category: "vegetables", price: 8.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 8, name: "Washed potatoes, 5kg", category: "vegetables", price: 16.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 9, name: "Red potatoes, 5kg", category: "vegetables", price: 17.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 10, name: "Red onion, 2kg bag", category: "vegetables", price: 7.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 11, name: "Red onion, loose", category: "vegetables", price: 3.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 12, name: "Brown onion, loose", category: "vegetables", price: 1.49, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 13, name: "1kg onion bag", category: "vegetables", price: 1.49, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 14, name: "10kg onion bag", category: "vegetables", price: 13.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 15, name: "Cauliflower", category: "vegetables", price: 3.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 16, name: "Broccoli", category: "vegetables", price: 3.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 17, name: "Sweet potato", category: "vegetables", price: 3.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 18, name: "Butternut pumpkin", category: "vegetables", price: 2.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 19, name: "Japanese pumpkin", category: "vegetables", price: 2.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 20, name: "Artichoke, small", category: "vegetables", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: true, specialPrice: 3.00, specialQuantity: 2, specialUnit: "each" },
    { id: 21, name: "Artichoke, large", category: "vegetables", price: 3.49, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 22, name: "Leeks", category: "vegetables", price: 1.49, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: true, specialPrice: 4.00, specialQuantity: 3, specialUnit: "each" },
    { id: 23, name: "Celery", category: "vegetables", price: 2.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 24, name: "Green beans", category: "vegetables", price: 6.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 25, name: "Eggplant, round", category: "vegetables", price: 5.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 26, name: "Zucchini, green", category: "vegetables", price: 3.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 27, name: "Bourbon sweet chili, yellow", category: "vegetables", price: 6.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 28, name: "Capsicum, red", category: "vegetables", price: 3.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 29, name: "Capsicum, green", category: "vegetables", price: 3.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 30, name: "Garlic, loose, Australian", category: "vegetables", price: 19.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 31, name: "Garlic bag, imported", category: "vegetables", price: 3.99, unit: "halfkg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 32, name: "Gourmet Tomatoes", category: "vegetables", price: 4.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 33, name: "Truss Tomato", category: "vegetables", price: 5.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 34, name: "Lebanese Cucumber", category: "vegetables", price: 2.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 35, name: "Continental Cucumber", category: "vegetables", price: 1.49, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 36, name: "Cayenne Red Chili", category: "vegetables", price: 14.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 37, name: "Cayenne Green Chili", category: "vegetables", price: 14.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 38, name: "Bird's Eye Chili", category: "vegetables", price: 19.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 39, name: "Green Cabbage", category: "vegetables", price: 4.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 40, name: "Red Cabbage", category: "vegetables", price: 4.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 41, name: "Savoy Cabbage", category: "vegetables", price: 4.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 42, name: "Asparagus", category: "vegetables", price: 1.99, unit: "bunch", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: true, specialPrice: 3.00, specialQuantity: 2, specialUnit: "bunch" },
    { id: 43, name: "Corn", category: "vegetables", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },

    // FRUITS
    { id: 44, name: "Watermelon", category: "fruits", price: 2.49, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 45, name: "Honeydew melon", category: "fruits", price: 3.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 46, name: "Rockmelon", category: "fruits", price: 3.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 47, name: "Granny Smith apples", category: "fruits", price: 2.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 48, name: "Pink Lady apples", category: "fruits", price: 2.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 49, name: "Lemon", category: "fruits", price: 1.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 50, name: "Lemon, premium", category: "fruits", price: 3.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 51, name: "Alfora mandarin", category: "fruits", price: 2.49, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 52, name: "Bananas", category: "fruits", price: 3.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 53, name: "Blood orange", category: "fruits", price: 1.49, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 54, name: "Peckham pears", category: "fruits", price: 2.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 55, name: "Navel oranges", category: "fruits", price: 1.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 56, name: "Avocado", category: "fruits", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: true, specialPrice: 3.00, specialQuantity: 2, specialUnit: "each" },
    { id: 57, name: "Honey Gold Mango", category: "fruits", price: 6.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 58, name: "KP Mango", category: "fruits", price: 2.49, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 59, name: "Karela Pears", category: "fruits", price: 2.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 60, name: "Amigo Mandarin", category: "fruits", price: 1.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 61, name: "Pineapples", category: "fruits", price: 3.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 62, name: "Ruby Grapefruit", category: "fruits", price: 2.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 63, name: "Green Kiwi", category: "fruits", price: 7.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 64, name: "Gold Kiwi", category: "fruits", price: 10.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 65, name: "Roma tomatoes", category: "fruits", price: 4.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 66, name: "Cherry tomato", category: "fruits", price: 2.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 67, name: "Strawberries", category: "fruits", price: 4.49, unit: "punnet", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 68, name: "Blueberries", category: "fruits", price: 4.99, unit: "punnet", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },

    // SALADS & GREENS
    { id: 69, name: "Spinach, loose", category: "herbs", price: 12.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 70, name: "Spinach, bag", category: "herbs", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 71, name: "Salad mix, loose", category: "herbs", price: 12.99, unit: "kg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 72, name: "Salad mix, bag", category: "herbs", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 73, name: "Iceberg lettuce", category: "herbs", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 74, name: "Abycoz Twin Pack", category: "herbs", price: 3.49, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },

    // EGGS
    { id: 75, name: "Free Range Eggs, 800g", category: "vegetables", price: 7.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 76, name: "Cage Eggs, 700g", category: "vegetables", price: 5.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },

    // NUTS, DRIED FRUIT & LEGUMES (Updated to 100g increments)
    { id: 77, name: "Organic Prunes", category: "nuts", price: 4.49, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 78, name: "Organic Dates", category: "nuts", price: 28.00, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 79, name: "Red Lentils", category: "nuts", price: 3.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 80, name: "Green Lentils", category: "nuts", price: 5.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 81, name: "Whole Walnuts", category: "nuts", price: 11.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 82, name: "Californian Shelled Walnuts", category: "nuts", price: 18.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 83, name: "Sultanas (Victoria)", category: "nuts", price: 8.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 84, name: "Raw Cashews", category: "nuts", price: 23.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 85, name: "Natural Almonds", category: "nuts", price: 15.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 86, name: "Raw Peanuts", category: "nuts", price: 6.99, unit: "hundredg", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },

    // PASTA & GRAINS
    { id: 87, name: "Durham Wheat 100% Pasta (Spaghetti)", category: "vegetables", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 88, name: "Durham Wheat 100% Pasta (Fettuccine)", category: "vegetables", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 89, name: "Durham Wheat 100% Pasta (Penne)", category: "vegetables", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 90, name: "Durham Wheat 100% Pasta (Bowties)", category: "vegetables", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 91, name: "Durham Wheat 100% Pasta (Spirals)", category: "vegetables", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 92, name: "Durham Wheat 100% Pasta (Shells)", category: "vegetables", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 93, name: "Durham Wheat 100% Pasta (Macaroni)", category: "vegetables", price: 1.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },

    // CHEESE
    { id: 94, name: "Ricotta", category: "vegetables", price: 3.75, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 95, name: "Ialba", category: "vegetables", price: 4.99, unit: "each", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },

    // JUICES & BEVERAGES (Combined size options)
    { id: 96, name: "Lemon, Ginger, Honey", category: "juices", price: 3.99, unit: "ml300", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 97, name: "Lemon, Ginger, Honey", category: "juices", price: 5.99, unit: "ml500", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 98, name: "Turmeric, Lemon, Honey, Cayenne", category: "juices", price: 3.99, unit: "ml300", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 99, name: "Turmeric, Lemon, Honey, Cayenne", category: "juices", price: 5.99, unit: "ml500", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 100, name: "Beetroot, Lemon, Ginger, Honey", category: "juices", price: 3.99, unit: "ml300", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 101, name: "Beetroot, Lemon, Ginger, Honey", category: "juices", price: 5.99, unit: "ml500", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 102, name: "Lemon, Ginger, Honey, Cayenne, Chili", category: "juices", price: 3.99, unit: "ml300", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 103, name: "Lemon, Ginger, Honey, Cayenne, Chili", category: "juices", price: 5.99, unit: "ml500", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 104, name: "Pineapple, Cucumber, Celery, Lemon, Apple", category: "juices", price: 3.99, unit: "ml300", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 105, name: "Pineapple, Cucumber, Celery, Lemon, Apple", category: "juices", price: 5.99, unit: "ml500", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 106, name: "Watermelon", category: "juices", price: 3.99, unit: "ml300", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 107, name: "Watermelon", category: "juices", price: 5.99, unit: "ml500", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 108, name: "Orange", category: "juices", price: 3.99, unit: "ml300", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 109, name: "Orange", category: "juices", price: 5.99, unit: "ml500", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 110, name: "Celery", category: "juices", price: 3.99, unit: "ml300", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 111, name: "Celery", category: "juices", price: 5.99, unit: "ml500", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 112, name: "Orange & Pineapple", category: "juices", price: 3.99, unit: "ml300", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 113, name: "Orange & Pineapple", category: "juices", price: 5.99, unit: "ml500", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 114, name: "Lemonade", category: "juices", price: 1.99, unit: "ml300", active: true, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 115, name: "Lemonade", category: "juices", price: 2.99, unit: "ml500", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },

    // Empty slots for future expansion
    { id: 200, name: "", category: "vegetables", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 201, name: "", category: "vegetables", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 202, name: "", category: "vegetables", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 203, name: "", category: "vegetables", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 204, name: "", category: "vegetables", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 205, name: "", category: "fruits", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 206, name: "", category: "fruits", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 207, name: "", category: "fruits", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 208, name: "", category: "fruits", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 209, name: "", category: "fruits", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 210, name: "", category: "herbs", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 211, name: "", category: "herbs", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 212, name: "", category: "herbs", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 213, name: "", category: "herbs", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 214, name: "", category: "herbs", price: 0, unit: "kg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 215, name: "", category: "juices", price: 0, unit: "each", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 216, name: "", category: "juices", price: 0, unit: "each", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 217, name: "", category: "juices", price: 0, unit: "each", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 218, name: "", category: "juices", price: 0, unit: "each", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 219, name: "", category: "juices", price: 0, unit: "each", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 220, name: "", category: "nuts", price: 0, unit: "hundredg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 221, name: "", category: "nuts", price: 0, unit: "hundredg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 222, name: "", category: "nuts", price: 0, unit: "hundredg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 223, name: "", category: "nuts", price: 0, unit: "hundredg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" },
    { id: 224, name: "", category: "nuts", price: 0, unit: "hundredg", active: false, mostPopular: false, popularOrder: 0, photo: "", hasSpecial: false, specialPrice: 0, specialQuantity: 0, specialUnit: "" }
];

// Unit display mappings
const unitDisplay = {
    "kg": "kg",
    "halfkg": "500g", 
    "tenthkg": "100g",
    "hundredg": "100g",
    "each": "Each",
    "bunch": "Bunch",
    "punnet": "Punnet",
    "liter": "Liter",
    "pack": "Pack",
    "ml300": "300ml",
    "ml500": "500ml"
};

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('glengalaProducts', JSON.stringify(products));
}

// Load products from localStorage
function loadProducts() {
    const saved = localStorage.getItem('glengalaProducts');
    if (saved) {
        products = JSON.parse(saved);
    }
    // Always ensure window.products is set
    window.products = products;
}

// Set window.products immediately on script load as fallback
window.products = products;

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { products, saveProducts, loadProducts, unitDisplay };
}