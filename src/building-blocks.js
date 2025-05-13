function runFs() {
  window.FinsweetAttributes ||= [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      if (!listInstances?.length) return;

      const listInstance = listInstances[0];
      const currentPath = window.location.pathname.replace(/^\//, '');

      listInstance.effect(() => {
        const items = listInstance.items.value;
        if (!items?.length) return;

        const processNestedItems = () => {
          // Collect fields for items
          items.forEach((item) => {
            if (typeof item.collectFields === 'function') {
              item.collectFields();
            }
          });

          // Filter and hide non-matching items
          const filteredItems = items.filter((item) => {
            // Check if there are any building-block fields in this item
            const blockFields = item.element?.querySelectorAll('[fs-list-field="building-block"]');

            if (!blockFields || blockFields.length === 0) {
              item.element && (item.element.style.display = 'none');
              return false;
            }

            // Check all building-block fields for a match
            let isMatch = false;
            blockFields.forEach((field) => {
              const blockValue = field.textContent.trim();
              if (blockValue.includes(currentPath) || currentPath.includes(blockValue)) {
                isMatch = true;
              }
            });

            // Hide non-matching items
            if (!isMatch && item.element) {
              item.element.style.display = 'none';
            }

            return isMatch;
          });

          // Direct DOM filtering for any items that might have been missed
          listInstance.listElement.querySelectorAll('.w-dyn-item').forEach((element) => {
            const blockFields = element.querySelectorAll('[fs-list-field="building-block"]');
            if (!blockFields || blockFields.length === 0) {
              element.style.display = 'none';
              return;
            }

            let hasMatch = false;
            blockFields.forEach((field) => {
              const fieldValue = field.textContent.trim();
              if (fieldValue.includes(currentPath) || currentPath.includes(fieldValue)) {
                hasMatch = true;
              }
            });

            element.style.display = hasMatch ? '' : 'none';
          });

          // Update list items if changed
          if (filteredItems.length !== items.length) {
            listInstance.items.value = filteredItems;
          }
        };

        // Handle nesting
        const itemsWithNesting = items.filter((item) => item.nesting instanceof Promise);

        if (itemsWithNesting.length) {
          Promise.all(itemsWithNesting.map((item) => item.nesting))
            .then(processNestedItems)
            .catch((err) => console.error('Nesting error:', err));
        } else {
          processNestedItems();
        }
      });
    },
  ]);
}

// Initialize the function
$(document).ready(function () {
  runFs();
});

$(document).ready(runFs);
