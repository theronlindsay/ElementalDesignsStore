## Quick Start Guide: Jewelry Page

### Step 1: Get Your Square Jewelry Category ID

Run this code in a server file or script to find your category ID:

```typescript
import { getAllCategories } from '$lib/square';

const categories = await getAllCategories();
console.log(categories);
// Look for your jewelry category and note its ID
```

### Step 2: Update the Server File

Edit `/src/routes/jewelry/+page.server.ts` and replace `'JEWELRY_CATEGORY_ID'` with your actual ID:

```typescript
const jewelryItems = await getItemsByCategory('YOUR_ACTUAL_ID_HERE');
```

### Step 3: Add Custom Attributes (Optional)

For better filtering, add these custom attributes to your Square items:

1. **jewelry_type** (String): 
   - Values: "Earrings & Ear Cuffs", "Necklaces & Chokers", "Bracelets", etc.

2. **rating** (Number):
   - Value: 0-5 (decimal allowed)

### Step 4: Test the Page

Navigate to `/jewelry` in your browser. You should see:
- All jewelry items from Square
- Filter sidebar on the left
- Product grid on the right
- Responsive design on mobile

### Troubleshooting

**"No items found"**: 
- Check that your category ID is correct
- Verify items exist in that category in Square
- Check browser console for API errors

**"Unable to load jewelry items"**:
- Verify Square API token is set in `.env`
- Check Square API credentials are valid
- Ensure you're not hitting API rate limits

**Images not loading**:
- Square images need a proxy endpoint at `/api/square/image/[id]`
- Or update the image src in the component

### Next Steps

1. **Add to Cart**: Wire up the "Add to Cart" button to your cart state
2. **Product Details**: Create a detail page at `/jewelry/[id]/+page.svelte`
3. **Reviews**: Implement a review system and store ratings
4. **Inventory**: Add stock tracking and "Out of Stock" badges
