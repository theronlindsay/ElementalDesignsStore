# Jewelry Page Implementation

## Overview
Created a full-featured jewelry catalog page that integrates with Square's API to display and filter products.

## Files Created

### 1. `/src/routes/jewelry/+page.server.ts`
Server-side data loader that:
- Fetches jewelry items from Square using `getItemsByCategory()`
- Handles errors gracefully
- Returns structured data to the page

**Important:** Replace `'JEWELRY_CATEGORY_ID'` with your actual Square jewelry category ID.

### 2. `/src/routes/jewelry/+page.svelte`
Main jewelry page component with:

#### Features:
- **Responsive Grid Layout**: Auto-adjusting product cards
- **Advanced Filtering**:
  - 15 jewelry type categories
  - Price range filter (min/max with slider)
  - Rating filter (0-5 stars)
  - Sort options (name, price, rating)
- **Mobile-Friendly**: Collapsible sidebar, responsive design
- **Real-time Updates**: Filters update instantly using Svelte 5 runes

#### Jewelry Types Supported:
1. Earrings & Ear Cuffs
2. Necklaces & Chokers
3. Bracelets
4. Rings
5. Anklets
6. Body Chains
7. Waist Chains
8. Headdresses
9. Face Chains
10. Gauntlets
11. Harnesses
12. Garters
13. Arm Bands
14. Statement Pieces

## Integration Notes

### Square Item Structure Expected:
```typescript
{
  id: string,
  itemData: {
    name: string,
    description?: string,
    imageIds?: string[],
    variations: [{
      itemVariationData: {
        priceMoney: {
          amount: number, // in cents
          currency: string
        }
      }
    }]
  },
  customAttributeValues?: {
    jewelry_type?: { stringValue: string },
    rating?: { numberValue: number }
  }
}
```

### Setup Steps:

1. **Get Your Jewelry Category ID**:
   ```typescript
   import { getAllCategories } from '$lib/square';
   const categories = await getAllCategories();
   // Find your jewelry category and use its ID
   ```

2. **Add Custom Attributes in Square** (optional but recommended):
   - `jewelry_type`: String field for jewelry subcategory
   - `rating`: Number field for product ratings

3. **Configure Images**:
   - Upload images to Square catalog
   - Images will be referenced by `imageIds` array

4. **Environment Variable**:
   Ensure `SQUARE_ACCESS_TOKEN` is set in your `.env` file.

## Styling
- Uses existing SCSS theme from `app.scss`
- Fully responsive with breakpoints:
  - Mobile: < 400px
  - Tablet: < 768px
  - Desktop: > 1200px
- Consistent with site design (glass morphism, purple accents)

## Future Enhancements
- Add to cart functionality integration
- Product detail modal/page
- Image gallery/zoom
- Wishlist feature
- Customer reviews display
- Stock availability indicator
- Quick view feature
- Color/size variation selector
