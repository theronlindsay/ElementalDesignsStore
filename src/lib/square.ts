// Square SDK integration – keep in one place for auditing
// Docs: https://github.com/square/square-nodejs-sdk/blob/master/reference.md

import {
    SquareClient,
    SquareEnvironment,
    SquareError,
    type CatalogObject,
    type CatalogObjectType,
    type CatalogItem,
} from 'square';
import { env } from '$env/dynamic/private';

const client = new SquareClient({
    token: env.SQUARE_ACCESS_TOKEN,
    environment: SquareEnvironment.Sandbox,
});

export type ItemWithImages = CatalogObject.Item & { imageUrls: string[] };

export async function getCatalogItemsByFilter(
    filterType: 'category' | 'attribute',
    filterValue: string,
    attributeValue?: string,
): Promise<CatalogObject[]> {
    try {
        const objectTypes: CatalogObjectType[] = ['ITEM'];
        const searchRequest: Parameters<typeof client.catalog.search>[0] = {
            objectTypes,
            limit: 100,
            includeRelatedObjects: true,
        };

        if (filterType === 'category') {
            searchRequest.query = {
                exactQuery: {
                    attributeName: 'category_id',
                    attributeValue: filterValue,
                },
            };
        } else if (filterType === 'attribute') {
            searchRequest.query = {
                exactQuery: {
                    attributeName: filterValue,
                    attributeValue: attributeValue || '',
                },
            };
        }

        const response = await client.catalog.search(searchRequest);

        if (response.objects) {
            const first = response.objects[0] as CatalogObject.Item | undefined;
            console.log('Sample item structure:', first);
            console.log('Sample item categoryId:', first?.itemData?.categoryId);

            console.log(
                'got objects:',
                JSON.stringify(
                    response.objects,
                    (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
                    2,
                ),
            );
            return response.objects;
        }

        return [];
    } catch (error) {
        if (error instanceof SquareError) {
            console.error('Square API Error:', error.message);
            throw new Error(`Failed to retrieve catalog items: ${error.message}`);
        }
        throw error;
    }
}

export async function getItemsByCategory(categoryId: string) {
    const items = await getCatalogItemsByFilter('category', categoryId);

    return items.map((item) => {
        const itemObj = item as CatalogObject.Item;
        return {
            ...itemObj,
            itemData: {
                ...itemObj.itemData,
                categoryId,
            } as CatalogItem,
        };
    });
}

export async function getSubcategories(parentCategoryId: string) {
    try {
        const allCategories = await getAllCategories();

        const subcategories = allCategories.filter(
            (cat) => cat.categoryData?.parentCategory?.id === parentCategoryId,
        );

        console.log(
            `Found ${subcategories.length} subcategories for ${parentCategoryId}:`,
            subcategories.map((c) => ({ id: c.id, name: c.categoryData?.name })),
        );

        return subcategories;
    } catch (error) {
        console.error('Error getting subcategories:', error);
        return [];
    }
}

export async function getItemsByCategoryIncludingSubcategories(
    categoryId: string,
): Promise<ItemWithImages[]> {
    try {
        console.log(`Getting items for category ${categoryId} and its subcategories...`);

        const mainCategoryItems = await getItemsByCategory(categoryId);
        console.log(`Found ${mainCategoryItems.length} items in main category`);

        const subcategories = await getSubcategories(categoryId);

        const subcategoryItems: typeof mainCategoryItems = [];
        for (const subcat of subcategories) {
            const items = await getItemsByCategory(subcat.id!);
            console.log(`Found ${items.length} items in subcategory ${subcat.categoryData?.name}`);
            subcategoryItems.push(...items);
        }

        const allItems = [...mainCategoryItems, ...subcategoryItems];
        const uniqueItems = Array.from(new Map(allItems.map((item) => [item.id, item])).values());

        console.log(`Total unique items: ${uniqueItems.length}`);

        if (uniqueItems.length > 0) {
            const sample = uniqueItems[0];
            console.log('=== SAMPLE ITEM STRUCTURE ===');
            console.log('Item ID:', sample.id);
            console.log('Item Type:', sample.type);
            console.log('Item categoryId:', sample.itemData?.categoryId);

            const itemData = sample.itemData;
            if (itemData) {
                console.log('\nitemData fields:');
                console.log('  - name:', itemData.name);
                console.log('  - description:', itemData.description);
                console.log('  - categoryId:', itemData.categoryId);
                console.log('  - imageIds:', itemData.imageIds);

                if (itemData.variations && itemData.variations.length > 0) {
                    const variation = itemData.variations[0] as CatalogObject.ItemVariation;
                    console.log('\nFirst variation:');
                    console.log('  - id:', variation.id);
                    console.log('  - type:', variation.type);

                    const varData = variation.itemVariationData;
                    if (varData) {
                        console.log('  - itemId:', varData.itemId);
                        console.log('  - name:', varData.name);
                        if (varData.priceMoney) {
                            console.log('  - price amount (cents):', varData.priceMoney.amount?.toString());
                            console.log('  - price currency:', varData.priceMoney.currency);
                        }
                        console.log('  - imageIds:', varData.imageIds);
                    }
                }
            }

            console.log('\nImage-related fields:');
            console.log('  - imageIds:', sample.itemData?.imageIds);
            console.log('=== END SAMPLE ===');
        }

        console.log('\nFetching items with images...');
        return await enrichItemsWithImages(uniqueItems as CatalogObject.Item[]);
    } catch (error) {
        if (error instanceof SquareError) {
            console.error('Square API Error:', error.message);
            throw new Error(`Failed to retrieve items with subcategories: ${error.message}`);
        }
        throw error;
    }
}

export async function enrichItemsWithImages(items: CatalogObject[]): Promise<ItemWithImages[]> {
    try {
        const imageIdSet = new Set<string>();
        for (const item of items) {
            const obj = item as CatalogObject.Item;
            if (obj.itemData?.imageIds) {
                for (const id of obj.itemData.imageIds) {
                    imageIdSet.add(id);
                }
            }
        }

        if (imageIdSet.size === 0) {
            console.log('No images to fetch');
            return items.map((item) => ({ ...(item as CatalogObject.Item), imageUrls: [] }));
        }

        console.log(`Fetching ${imageIdSet.size} image objects...`);

        const response = await client.catalog.batchGet({
            objectIds: Array.from(imageIdSet),
        });

        const imageMap = new Map<string, string>();
        if (response.objects) {
            for (const obj of response.objects) {
                if (obj.type === 'IMAGE' && obj.imageData?.url) {
                    imageMap.set(obj.id, obj.imageData.url);
                    console.log(`Mapped image ${obj.id} -> ${obj.imageData.url}`);
                }
            }
        }

        const enrichedItems = items.map((item) => {
            const obj = item as CatalogObject.Item;
            const ids = obj.itemData?.imageIds || [];
            const imageUrls = ids.map((id) => imageMap.get(id)).filter((url): url is string => !!url);

            return { ...obj, imageUrls };
        });

        console.log(`Enriched ${enrichedItems.length} items with image URLs`);

        return enrichedItems;
    } catch (error) {
        console.error('Error enriching items with images:', error);
        return items.map((item) => ({ ...(item as CatalogObject.Item), imageUrls: [] }));
    }
}

export async function getItemsByAttribute(attributeName: string, attributeValue: string) {
    return getCatalogItemsByFilter('attribute', attributeName, attributeValue);
}

export async function getAllCategories(): Promise<CatalogObject.Category[]> {
    try {
        const categories: CatalogObject.Category[] = [];
        const response = await client.catalog.list({ types: 'CATEGORY' });

        for await (const category of response) {
            categories.push(category as CatalogObject.Category);
        }

        console.log(
            `Found ${categories.length} categories:`,
            categories.map((c) => ({ id: c.id, name: c.categoryData?.name })),
        );

        return categories;
    } catch (error) {
        if (error instanceof SquareError) {
            console.error('Square API Error:', error.message);
            throw new Error(`Failed to retrieve categories: ${error.message}`);
        }
        throw error;
    }
}

export async function getAllItems(): Promise<CatalogObject.Item[]> {
    try {
        const items: CatalogObject.Item[] = [];
        const response = await client.catalog.list({ types: 'ITEM' });

        for await (const item of response) {
            items.push(item as CatalogObject.Item);
        }

        console.log(`Found ${items.length} total items`);

        return items;
    } catch (error) {
        if (error instanceof SquareError) {
            console.error('Square API Error:', error.message);
            throw new Error(`Failed to retrieve items: ${error.message}`);
        }
        throw error;
    }
}

export async function searchItemsByText(searchText: string) {
    try {
        const response = await client.catalog.searchItems({
            textFilter: searchText,
            limit: 100,
        });

        return response.items ?? [];
    } catch (error) {
        if (error instanceof SquareError) {
            console.error('Square API Error:', error.message);
            throw new Error(`Failed to search catalog items: ${error.message}`);
        }
        throw error;
    }
}

export { client };
