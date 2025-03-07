const keyword = (title,brand,category)=>{
    title_split = title.toLowerCase().split(" ");
    brand_split = brand.toLowerCase().split(" ");
    category_split = category.toLowerCase().split(" ");
    return [...new Set([...title_split, ...brand_split, ...category_split])];
}

module.exports = keyword;