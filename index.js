import axios from "axios";
import fs from "fs";

const BASE_URL = "https://argentina-backend.renuevatucloset.com/api/es_ar"
const PRODUCTS_URL = "/products"
const BRAND = "d1543fcc-7b48-11eb-958e-124b5beb42f3"
const SORT = "price_desc"
const PAGE_SIZE = 100


const buildUrl = () => {
  const url = new URL(BASE_URL + PRODUCTS_URL)
  url.searchParams.append("pageSize", PAGE_SIZE)
  url.searchParams.append("brand[]", BRAND)
  url.searchParams.append("sort", SORT)
  url.searchParams.append("page", 1)

  return url
}

const fetchItems = async () => {
  const items = [];
  const url = buildUrl()
  let page = 1;
  let totalItems;

  do {
    console.log(` --- Items ${items.length}/${totalItems ?? "?"}`)
    const { data: { items: itemsData, total } } = await axios.get(url.toString());
    items.push(...itemsData)
    totalItems = total
    page = page + 1;
    url.searchParams.set("page", page)
  } while (items.length < totalItems)

  return items;
}

const serializeItems = (items) => {
  return items.map(({ title, final_price, images, sub_sub_category, brand, last_activity }) => ({
    title,
    price: final_price,
    category: sub_sub_category.name,
    brand: brand.name,
    date: last_activity
  }))  
}

const getCsvHeaders = (items) => {
  return Object.keys(items[0]).join(",")
}

const getCsvRow = (item) => {
  return Object.values(item).join(",")
}

const writeToFile = (items) => {
  const outPath = `./out.csv`
  fs.writeFileSync(outPath, getCsvHeaders(items))
  const writer = fs.createWriteStream(outPath, { flags: "a" });
  items.forEach(item => {
    writer.write(`\n${getCsvRow(item)}`)
  })
  writer.end();
}

const main = async () => {
  try {
    console.log("🚀 1/3 Fetching items...")
    const items = await fetchItems()
    console.log("📦 2/3 Serializing items...")
    const serializedItems = serializeItems(items);
    console.log("📝 3/3 Writing file...")
    writeToFile(serializedItems);
  } catch (e) {
    console.error(e)
  }
}

await main()
