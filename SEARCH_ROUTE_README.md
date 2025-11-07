# Search Route Implementation

## Overview
Successfully restructured the jewelry route into a dynamic search system that supports multiple product categories (jewelry, armor, laser) with shared component code.

## Route Structure

### `/search` - Landing Page
- **File**: `src/routes/search/+page.svelte`
- **Purpose**: Display all product categories with navigation cards
- **Features**:
  - Grid layout of category cards
  - Animated hover effects
  - Direct links to each category

### `/search/[category]` - Dynamic Product Search
- **Files**:
  - `src/routes/search/[category]/+page.server.ts` - Server-side data fetching
  - `src/routes/search/[category]/+page.svelte` - Client-side UI component

- **Supported Categories**:
  - `/search/jewelry` - Jewelry products
  - `/search/armor` - Armor products (requires category ID)
  - `/search/laser` - Laser-cut items (requires category ID)

## Server Implementation (`+page.server.ts`)

### Category ID Mapping
```typescript
const CATEGORY_IDS: Record<string, string> = {
    jewelry: 'GBU37Q2KSWR7QHCCA2SRTZB3',
    armor: 'YOUR_ARMOR_CATEGORY_ID',      // TODO: Replace
    laser: 'YOUR_LASER_CATEGORY_ID'        // TODO: Replace
};

const CATEGORY_NAMES: Record<string, string> = {
    jewelry: 'Jewelry',
    armor: 'Armor',
    laser: 'Laser Cut Items'
};
```

### Features
- Dynamic category resolution from URL parameter
- Async data streaming with promises
- Error handling with 404 for invalid categories
- Fetches both categories and items in parallel

## Client Component (`+page.svelte`)

### Key Features
1. **Promise-Based Loading**
   - Instant page render with loading spinner
   - Streams data from server
   - Error handling with user-friendly messages

2. **Filter System**
   - Type/Category filter (dynamically populated from Square)
   - Price range filter (with slider and inputs)
   - Minimum rating filter
   - Sort options (name, price, rating)

3. **Responsive Design**
   - Desktop: Sidebar + grid layout
   - Tablet: Collapsible filters
   - Mobile: Full-width cards

4. **Product Display**
   - Grid of product cards
   - Image support with fallback
   - Category badges
   - Price and rating display
   - Add to cart buttons

### Generic Functions
- `getItemType()` - Extracts category from Square data
- `getItemPrice()` - Extracts price from variations
- `getItemRating()` - Extracts custom rating attribute
- `filterItems()` - Applies all active filters
- `resetFilters()` - Clears all filters

## TODO: Required Actions

### 1. Get Category IDs
You need to provide the Square catalog category IDs for armor and laser products. To find them:

```typescript
// In your Square dashboard or API:
// 1. Go to Catalog > Categories
// 2. Find "Armor" category - copy its ID
// 3. Find "Laser Cut Items" category - copy its ID

// Then update +page.server.ts:
const CATEGORY_IDS = {
    jewelry: 'GBU37Q2KSWR7QHCCA2SRTZB3',
    armor: 'ABC123XYZ...',  // Replace with actual ID
    laser: 'DEF456UVW...'   // Replace with actual ID
};
```

### 2. Update Navigation
Update your main navigation (in `Navbar.svelte` or layout) to link to the new routes:
- Change `/jewelry` → `/search/jewelry`
- Add `/search/armor` link
- Add `/search/laser` link
- Optionally add `/search` as a "Browse All" link

### 3. Remove Old Route
Once you've verified the new routes work:
```bash
# Delete the old jewelry route
rm -r src/routes/jewelry
```

### 4. Clean Up Debug Logging (Optional)
The `getItemType()` function has console.log statements for debugging. You can remove them once everything works correctly.

## Testing Checklist

- [ ] Navigate to `/search` - should show landing page with 3 categories
- [ ] Click "Jewelry" card - should navigate to `/search/jewelry`
- [ ] Verify jewelry items load correctly
- [ ] Test filters (type, price, rating)
- [ ] Test sorting options
- [ ] Test responsive design on mobile
- [ ] Add armor category ID and test `/search/armor`
- [ ] Add laser category ID and test `/search/laser`
- [ ] Verify invalid category shows 404 error
- [ ] Test loading states (throttle network in DevTools)
- [ ] Test error handling (disconnect from Square API temporarily)

## Architecture Benefits

1. **Code Reuse**: Single component handles all product categories
2. **Scalability**: Easy to add new categories (just add ID to mapping)
3. **Type Safety**: TypeScript ensures correct data types
4. **Performance**: SSR + streaming for fast initial render
5. **Maintainability**: Centralized product display logic
6. **SEO Friendly**: Server-side rendering for better indexing

## Square API Integration

The implementation relies on these Square API functions:
- `getSubcategories(categoryId)` - Fetches child categories
- `getItemsByCategoryIncludingSubcategories(categoryId)` - Fetches all items in category tree
- `enrichItemsWithImages(items)` - Adds image URLs to items

All items get their `categoryId` manually injected since Square's search API doesn't include it by default.
