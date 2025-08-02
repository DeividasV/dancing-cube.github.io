#!/bin/bash

# Update remaining exhibition files to use unified button structure
echo "Updating exhibition navigation buttons..."

# List of files to update
files=(
  "morphing-forms.html"
  "infinite-knot.html"
  "axis-connect.html"
  "infinite-knot-3d.html"
  "mirror-pyramid.html"
  "deformed-coord.html"
  "droplets-dance.html"
)

for file in "${files[@]}"; do
  filepath="exhibitions/$file"
  if [ -f "$filepath" ]; then
    echo "Updating $filepath..."
    
    # Replace the old button structure with the new unified one
    sed -i '/<button class="nav-button" id="prevButton"/,/^[[:space:]]*<\/button>/ {
      c\        <button class="nav-button prev-button" data-nav="prev">PREV</button>
    }' "$filepath"
    
    sed -i '/<button class="nav-button" id="nextButton"/,/^[[:space:]]*<\/button>/ {
      c\        <button class="nav-button next-button" data-nav="next">NEXT</button>
    }' "$filepath"
    
    # Replace home button links with buttons
    sed -i 's|<a[^>]*href="../index.html"[^>]*class="nav-button home-button"[^>]*>[^<]*</a>|<button class="nav-button home-button" data-nav="home">HOME</button>|g' "$filepath"
    
  else
    echo "File $filepath not found!"
  fi
done

echo "Update complete!"
