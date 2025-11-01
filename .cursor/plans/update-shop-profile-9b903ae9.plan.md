<!-- 9b903ae9-3c30-44dc-94d3-2345ec271852 40029a2e-6c29-4927-bf4f-fde351ca66b8 -->
# Copy Complete Ad Form from Profile to Shop

## What Needs to Be Done

Completely rewrite `AdFormModal` component to match the exact implementation in `app/profile/page.tsx` including:

### Key Features to Copy

1. **State Management** - All location, map, geocoding states
2. **Mini Map Preview** - Leaflet map showing selected location
3. **Live Ad Card Preview** - Real-time preview of the ad
4. **Geocoding** - Auto-convert address to coordinates with debounce
5. **Map Modal** - Full interactive map for location selection
6. **Gradient Buttons** - Styled buttons for location selection
7. **Animations & Effects** - All visual feedback and transitions
8. **Helper Messages** - Guide messages and status indicators

### Files to Modify

- `app/components/AdFormModal/AdFormModal.tsx` - Complete rewrite with all features from profile

### Files to Reference

- `app/profile/page.tsx` - Lines 47-90 (state), 1513-1638 (handlers), 2326-2700 (UI)

## Implementation Steps

1. Read all necessary sections from profile page
2. Copy state management with all map/geocoding variables
3. Copy all handler functions (geocoding, map init, location selection)
4. Copy complete form UI with mini map, preview, buttons, animations
5. Add map modal for location selection
6. Test that everything works exactly like profile

### To-dos

- [ ] Create AdFormModal component from profile page form
- [ ] Replace simple form in shop profile with shared component